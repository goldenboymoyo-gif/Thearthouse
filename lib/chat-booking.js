// Conversational booking-enquiry flow for the chatbot.
//
// Pure, dependency-free logic (no DOM, no fetch default) so it can be unit
// tested under Node. The React component owns persistence of the returned
// state between messages; this module only turns (state, user text) into the
// next state + bot reply.
//
// Honesty rules:
//  - This flow collects a booking ENQUIRY. It never claims availability or
//    confirmation. The house's live book/availability channel is the external
//    Book Now system (NightsBridge). The chat enquiry is delivered through the
//    same contact/email infrastructure as the website's contact form.
//  - Capacity is the verified "sleeping 8 guests" figure. Stretcher beds can
//    accommodate more on request; the flow explains that instead of silently
//    accepting an enquiry that exceeds the verified capacity.

export const CAPACITY = 8;

export const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export const NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[+]?[0-9 ().\-\s]{6,}$/;

export function todayISO() {
  const d = new Date();
  return iso(d);
}

function iso(d) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmt(isoStr) {
  const d = new Date(`${isoStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export const formatDate = fmt;

export function addDaysISO(isoStr, days) {
  const d = new Date(`${isoStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return iso(d);
}

// Understand an English date from a chat line. Returns an ISO date (YYYY-MM-DD)
// or null.
export function parseDate(text) {
  if (!text) return null;
  const t = text.trim().toLowerCase();
  const lower = t.replace(/^the\s+/, '').replace(/(\d+)(st|nd|rd|th)/g, '$1');

  if (/\b(today)\b/.test(lower)) return todayISO();
  if (/\b(tomorrow)\b/.test(lower)) return addDaysISO(todayISO(), 1);

  let m = lower.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return validISO(m[1], m[2], m[3]);

  const MONTH_ABBR = '(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)';
  m = lower.match(new RegExp(`(\\d{1,2})\\s+${MONTH_ABBR}[a-z]*\\s+(\\d{4})`));
  if (m && MONTHS[m[2].slice(0, 3)]) return validISO(m[3], MONTHS[m[2].slice(0, 3)], m[1]);
  m = lower.match(new RegExp(`${MONTH_ABBR}[a-z]*\\s+(\\d{1,2})(?:\\s*,?\\s*(\\d{4}))?`));
  if (m && MONTHS[m[1].slice(0, 3)]) {
    const y = m[3] || new Date().getFullYear();
    return validISO(y, MONTHS[m[1].slice(0, 3)], m[2]);
  }

  m = lower.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    let y = +m[3];
    if (y < 100) y += y < 70 ? 2000 : 1900;
    const a = +m[1];
    const b = +m[2];
    // Ambiguous numeric dates: prefer day-first (DD/MM/YYYY) which is common,
    // fall back to MM/DD/YYYY if that would be the only valid ordering.
    let cand;
    if (a <= 31 && b <= 12) cand = validISO(y, b, a);
    if (!cand && a <= 12 && b <= 31) cand = validISO(y, a, b);
    return cand;
  }

  return null;
}

function validISO(y, mo, day) {
  const year = +y;
  const month = +mo;
  const d = +day;
  if (month < 1 || month > 12 || d < 1 || d > 31) return null;
  const iso = validISOStr(year, month, d);
  if (!iso) return null;
  return iso;
}

function validISOStr(y, mo, d) {
  const dd = new Date(y, mo - 1, d);
  if (dd.getFullYear() !== y || dd.getMonth() !== mo - 1 || dd.getDate() !== d) return null;
  return `${y}-${`${mo}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`;
}

// Pull a number out of a chat line, including spelled-out numbers.
export function extractNumber(text) {
  if (!text) return null;
  const m = text.toLowerCase().match(/(\d{1,2})/);
  if (m) return +m[1];
  for (const [word, n] of Object.entries(NUMBERS)) {
    if (text.toLowerCase().includes(word)) return n;
  }
  return null;
}

export function isPast(isoStr) {
  const today = todayISO();
  return isoStr < today;
}

export function validateDates(checkIn, checkOut) {
  if (!checkIn) return { ok: false, error: 'checkin' };
  if (!checkOut) return { ok: false, error: 'checkout' };
  if (isPast(checkIn)) return { ok: false, error: 'past-checkin' };
  if (isPast(checkOut) || checkOut <= checkIn) return { ok: false, error: 'checkout' };
  return { ok: true };
}

export function createFlow() {
  return {
    stage: 'idle',
    checkIn: '',
    checkOut: '',
    pendingNights: null,
    adults: '',
    children: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
    overflowConfirmed: false,
    edit: null,
  };
}

export function flowText(text) {
  return String(text || '').trim();
}

export function isCancel(text) {
  const lower = flowText(text).toLowerCase();
  return (
    ['cancel', 'stop', 'never mind', 'nevermind', 'quit', 'exit'].some((w) => lower.includes(w)) ||
    lower === 'no thanks' ||
    lower === "i don't want to book" ||
    lower === 'not now'
  );
}

// Two date tokens separated by to/until/dash, e.g. "Dec 10 to Dec 14".
export function extractDates(text) {
  const t = flowText(text);
  const m = t.match(/(.+)\b(to|until|till|through)\b(.+)/i);
  if (!m) return { checkIn: '', checkOut: '' };
  const a = parseDate(m[1]);
  const b = parseDate(m[3]);
  return { checkIn: a || '', checkOut: b || '' };
}

function guestCounts(text) {
  const nums = (text.match(/\b\d{1,2}\b/g) || []).map(Number);
  const t = text.toLowerCase();
  let adults = null;
  let children = null;
  if (/\bchild|kids?\b/.test(t) && nums.length >= 2) {
    adults = nums[0];
    children = nums[1];
  } else if (nums.length) {
    adults = nums[0];
    children = 0;
  } else {
    const words = [];
    for (const [word, n] of Object.entries(NUMBERS)) {
      const re = new RegExp(`\\b${word}\\b`);
      if (re.test(t)) words.push([n, t.search(re)]);
    }
    words.sort((a, b) => a[1] - b[1]);
    if (words.length) {
      adults = words[0][0];
      children = words[1] ? words[1][0] : 0;
    }
  }
  return { adults, children };
}

// The main transition. Returns { flow, replies: string[], actions: msgAction[] }.
export function advance(flow, input, cfg) {
  const text = flowText(input);
  const config = cfg || {};
  const bookingUrl = config.bookingUrl || '';
  const email = config.email || '';
  const phone = config.phone || '';
  const submit = config.submit;

  const f = { ...flow, edit: flow.edit || flow.stage };

  if (f.stage === 'idle') return { flow: f, replies: [], actions: [] };

  const sayDatesHelp = () =>
    "Could you tell me your check-in and check-out dates? For example '10 December 2026' or '2026-12-10'. You can write it as 'from V to V' in one line.";

  if (isCancel(text)) {
    f.stage = 'cancelled';
    return {
      flow: f,
      replies: ["No problem — I've cancelled the booking enquiry. Just let me know if there's anything else I can help you with!"],
      actions: [],
    };
  }

  let overrides = null;

  // Guests/dates/contact can be corrected mid-flow (J).
  if (f.stage !== 'guests' && /(actually|wait|instead|change|update|correction)/.test(text)) {
    if (/guest|people|adult|child/.test(text)) {
      const g = guestCounts(text);
      if (g.adults != null) overrides = { apply: () => { f.adults = g.adults; f.children = g.children || 0; f.overflowConfirmed = false; }, to: 'guests' };
    } else {
      const d = extractDates(text);
      const any = parseDate(text);
      if (d.checkIn || any) {
        overrides = { apply: () => { if (d.checkIn) f.checkIn = d.checkIn; if (d.checkOut) f.checkOut = d.checkOut; }, to: 'checkout' };
      }
    }
    if (overrides) {
      overrides.apply();
      f.stage = overrides.to;
      if (overrides.to === 'checkout') {
        return {
          flow: f,
          replies: [`Thanks for the update — I've noted your dates. Now, on what date would you like to check out?`],
          actions: [],
        };
      }
      return {
        flow: f,
        replies: [`Thanks for the update — now how many adults and children will be staying?`],
        actions: [],
      };
    }
  }

  switch (f.stage) {
    case 'checkin': {
      const d = extractDates(text);
      const single = parseDate(text);
      if (d.checkIn && d.checkOut) {
        if (validateDates(d.checkIn, d.checkOut).ok) {
          f.checkIn = d.checkIn;
          f.checkOut = d.checkOut;
          f.stage = 'guests';
          return {
            flow: f,
            replies: [`Perfect — from ${fmt(f.checkIn)} to ${fmt(f.checkOut)}.`, 'How many adults and children will be staying?'],
            actions: [],
          };
        }
        return { flow: f, replies: ['Those dates look off — the check-out date must be after the check-in date, and both must be in the future. Could you give me valid dates?'], actions: [] };
      }
      const nightsMatch = text.match(/(\w+|\d{1,2})\s+night/) || text.match(/for\s+(\w+|\d{1,2})\s+day/);
      if (single || nightsMatch) {
        if (single) {
          if (isPast(single)) return { flow: f, replies: ["Please give me a check-in date in the future — I can't take a past date."], actions: [] };
          f.checkIn = single;
        }
        let nights = nightsMatch ? extractNumber(nightsMatch[1]) : null;
        if (nights && nights >= 1 && nights <= 60) f.pendingNights = nights;
        if (!f.checkIn) {
          return {
            flow: f,
            replies: [`Noted — ${f.pendingNights ? `about ${f.pendingNights} night${f.pendingNights > 1 ? 's' : ''}` : "a night or two"}. What date would you like to check in? For example '10 December 2026'.`],
            actions: [],
          };
        }
        f.stage = 'checkout';
        return {
          flow: f,
          replies: [`Great — check-in on ${fmt(f.checkIn)}${f.pendingNights ? `, staying ${f.pendingNights} night${f.pendingNights > 1 ? 's' : ''}` : ''}. And what date would you like to check out?`],
          actions: [],
        };
      }
      return { flow: f, replies: [sayDatesHelp()], actions: [] };
    }

    case 'checkout': {
      const single = parseDate(text);
      if (single) {
        if (isPast(single) || single <= f.checkIn) {
          return { flow: f, replies: [`That check-out date isn't valid — it must be after ${fmt(f.checkIn)} and in the future. Could you give me a check-out date?`], actions: [] };
        }
        f.checkOut = single;
        f.stage = 'guests';
        return { flow: f, replies: [`Perfect — you're booked in from ${fmt(f.checkIn)} to ${fmt(f.checkOut)}.`, 'How many adults and children will be staying?'], actions: [] };
      }
      const nightsMatch = text.match(/(\w+|\d{1,2})\s+night/);
      if (nightsMatch) {
        const nights = extractNumber(nightsMatch[1]);
        if (nights && nights >= 1) {
          f.checkOut = addDaysISO(f.checkIn, nights);
          f.stage = 'guests';
          return { flow: f, replies: [`Got it — so ${nights} night${nights > 1 ? 's' : ''} from ${fmt(f.checkIn)} to ${fmt(f.checkOut)}.`, 'How many adults and children will be staying?'], actions: [] };
        }
      }
      if (f.pendingNights) {
        f.checkOut = addDaysISO(f.checkIn, f.pendingNights);
        f.stage = 'guests';
        return {
          flow: f,
          replies: [`I'll take that as ${f.pendingNights} night${f.pendingNights > 1 ? 's' : ''} — check-out on ${fmt(f.checkOut)}.`, 'How many adults and children will be staying?'],
          actions: [],
        };
      }
      return { flow: f, replies: [`Could you tell me your check-out date? It must be after ${fmt(f.checkIn)}.`], actions: [] };
    }

    case 'guests': {
      const g = guestCounts(text);
      if (g.adults == null) {
        return { flow: f, replies: ['Could you tell me how many adults and children are staying? For example "2 adults and 1 child".'], actions: [] };
      }
      f.adults = g.adults;
      f.children = g.children || 0;
      const total = f.adults + f.children;
      if (total > CAPACITY && !f.overflowConfirmed) {
        f.overflowConfirmed = true;
        return {
          flow: f,
          replies: [
            `The Art House sleeps ${CAPACITY} guests (4 bedrooms: 3 doubles and 1 twin). You've asked for ${total} — that exceeds the standard capacity. Stretcher beds can sometimes accommodate a few extra guests on request, but we'd need The Art House to confirm that before accepting.\n\nWould you like to continue with ${total} guests, or adjust?`,
          ],
          actions: [],
        };
      }
      f.stage = 'name';
      return {
        flow: f,
        replies: [`That's ${total} guest${total > 1 ? 's' : ''} (${f.adults} adult${f.adults > 1 ? 's' : ''}${f.children ? ` and ${f.children} child${f.children > 1 ? 'ren' : ''}` : ''}). May I have your full name, please?`],
        actions: [],
      };
    }

    case 'name': {
      if (text.length < 2) return { flow: f, replies: ['Could you tell me your full name?'], actions: [] };
      f.name = text.slice(0, 200);
      f.stage = 'email';
      return { flow: f, replies: [`Thank you, ${f.name.split(' ')[0]}. What email address should we use for the confirmation?`], actions: [] };
    }

    case 'email': {
      const e = flowText(text).toLowerCase();
      if (!EMAIL_RE.test(e)) return { flow: f, replies: ['That doesn\u2019t look like a valid email address. Could you check it and try again?'], actions: [] };
      f.email = e;
      f.stage = 'phone';
      return { flow: f, replies: ['May I also have a phone or WhatsApp number so we can reach you? You can reply "skip" if you\u2019d rather not share it.'], actions: [] };
    }

    case 'phone': {
      const lower = text.toLowerCase();
      if (lower === 'skip' || lower === 'no' || lower === 'none' || lower === 'n/a') {
        f.phone = '';
      } else {
        const p = text.replace(/[^0-9+().\-\s]/g, '').trim();
        if (!p) return { flow: f, replies: ['Sorry, I couldn\u2019t read that number. Could you type it as digits? For example +263 77 000 0000.'], actions: [] };
        f.phone = p.length > 60 ? p.slice(0, 60) : p;
      }
      f.stage = 'notes';
      return { flow: f, replies: ['Is there anything else you\u2019d like us to know about your stay — activities, transfers, dietary needs? Reply "skip" if nothing.'], actions: [] };
    }

    case 'notes': {
      const lower = text.toLowerCase();
      f.notes = lower === 'skip' || lower === 'no' || lower === 'nothing' ? '' : text.slice(0, 1000);
      f.stage = 'review';
      return {
        flow: f,
        replies: [summaryText(f, 'Would you like me to submit this booking enquiry?')],
        actions: [
          { label: 'Submit Enquiry', send: 'submit' },
          { label: 'Change Details', send: 'change' },
          { label: 'Cancel', send: 'cancel' },
        ],
      };
    }

    case 'review': {
      const lower = text.toLowerCase();
      if (lower === 'submit' || lower === 'submit enquiry' || lower === 'yes' || lower === 'yes submit' || lower === 'send') {
        return submitEnquiry(f, { bookingUrl, email, phone, submit });
      }
      if (lower === 'change' || lower === 'change details' || lower.includes('edit')) {
        f.stage = 'editpick';
        return {
          flow: f,
          replies: ['What would you like to change?'],
          actions: [
            { label: 'Dates', send: 'dates' },
            { label: 'Guests', send: 'guests' },
            { label: 'Contact details', send: 'contact' },
            { label: 'Requirements', send: 'requirements' },
          ],
        };
      }
      const d = extractDates(text);
      if (d.checkIn || parseDate(text)) {
        return advance({ ...f, stage: 'checkin' }, text, config);
      }
      const g = guestCounts(text);
      if (g.adults != null) return advance({ ...f, stage: 'guests' }, text, config);
      return { flow: f, replies: ['You can reply "submit" to send the enquiry, or "change" to update your details.'], actions: [] };
    }

    case 'editpick': {
      const lower = text.toLowerCase();
      let stage = null;
      if (/date/i.test(lower)) stage = 'checkin';
      else if (/guest|people|adult|child|person/i.test(lower)) stage = 'guests';
      else if (/contact|name|email|phone/i.test(lower)) stage = 'name';
      else if (/requir|note|question|extra/i.test(lower)) stage = 'notes';
      if (!stage) return { flow: f, replies: ['You can change the dates, the guests, the contact details, or the requirements. What would you like to change?'], actions: [] };
      f.stage = stage;
      const first = stage === 'checkin' ? ['To update your dates: what is your new check-in date?'] : stage === 'guests' ? ['To update your guests: how many adults and children will be staying?'] : stage === 'name' ? ['Sure — what\u2019s your name and the best email address?'] : ['Sure — what would you like us to know?'];
      return { flow: f, replies: first, actions: [] };
    }

    default:
      return { flow: f, replies: [], actions: [] };
  }
}

export function buildMailto(f, email) {
  const subject = `Booking enquiry from ${f.name}`;
  const body = summaryText(f, '');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function submitEnquiry(f, { bookingUrl, email, phone, submit }) {
  const mailto = email ? buildMailto(f, email) : '';
  if (!submit) {
    return {
      flow: { ...f, stage: 'done' },
      replies: [
        'I\u2019ve prepared your booking enquiry. I\u2019ll send the details to The Art House for confirmation — availability is not confirmed until The Art House responds.',
      ],
      actions: [],
    };
  }
  const payload = {
    name: f.name,
    email: f.email,
    phone: f.phone,
    type: 'booking',
    checkIn: f.checkIn,
    checkOut: f.checkOut,
    adults: f.adults,
    children: f.children,
    message: summaryText(f, 'Booking enquiry submitted via The Art House Assistant.'),
  };
  return Promise.resolve()
    .then(() => submit(payload))
    .then((res) => {
      if (res && res.delivered) {
        return {
          flow: { ...f, stage: 'done' },
          replies: [
            'Your booking enquiry has been submitted successfully. The Art House will confirm availability and the next steps with you.\n\nAvailability is not confirmed until The Art House responds.',
          ],
          actions: bookingUrl ? [{ label: 'Book Now / check live availability', href: bookingUrl }] : [],
        };
      }
      return {
        flow: { ...f, stage: 'done' },
        replies: [
          `I couldn't confirm that your enquiry reached The Art House just now. Please use the Book Now button on the website, email ${email || 'us'}, or call ${phone || 'us'} directly — we'll take care of you. I'm sorry for the extra step.`,
        ],
        actions: [
          mailto ? { label: 'Email your enquiry', href: mailto } : null,
          bookingUrl ? { label: 'Book Now / check live availability', href: bookingUrl } : null,
        ].filter(Boolean),
      };
    })
    .catch(() => ({
      flow: { ...f, stage: 'done' },
      replies: [
        `I couldn't submit the enquiry right now. Please use the Book Now option on the website, email ${email || 'us'}, or call ${phone || 'us'} directly. We'd love to help — and no booking has been made.`,
      ],
      actions: [
        mailto ? { label: 'Email your enquiry', href: mailto } : null,
        bookingUrl ? { label: 'Book Now / check live availability', href: bookingUrl } : null,
      ].filter(Boolean),
    }));
}

export function summaryText(f, closing) {
  const lines = [
    'Booking Enquiry',
    '──────────────',
    `Check-in: ${fmt(f.checkIn)}`,
    `Check-out: ${fmt(f.checkOut)}`,
    `Guests: ${+f.adults + +f.children} (${f.adults} adult${f.adults > 1 ? 's' : ''}${f.children ? `, ${f.children} child${f.children > 1 ? 'ren' : ''}` : ''})`,
    `Name: ${f.name}`,
    `Email: ${f.email}`,
    f.phone ? `Phone/WhatsApp: ${f.phone}` : 'Phone/WhatsApp: not provided',
    `Additional request: ${f.notes || 'none'}`,
    '──────────────',
    closing || '',
  ];
  return lines.filter((l) => l !== null && l !== '').join('\n');
}

// Whether the visitor is clearly starting a booking enquiry.
export function wantsBooking(input) {
  const t = input.toLowerCase().trim();
  const intents = [
    'booking enquiries',
    'book a stay',
    'book your stay',
    'book now',
    'help me book',
    'make a booking',
    'make a booking enquiry',
    'i want to book',
    "i'd like to book",
    'i would like to book',
    'how do i book',
    'how can i book',
    'want to book',
    'start a booking',
    'make a reservation',
    'place a booking',
    'book the art house',
    'book the house',
  ];
  if (intents.some((phrase) => t === phrase || t.startsWith(`${phrase} `) || t.startsWith(`${phrase}?`) || t.startsWith(`${phrase},`))) return true;
  if (/need (to )?(make a |place a )?(booking|reservation)/.test(t)) return true;
  if (/\b(book|booking|stay)\b.*\b(stay|night|nights|dates?|check[- ]?in)\b/.test(t)) return true;
  if (/\bstay(ing)? (from|between|for)\b/.test(t)) return true;
  if (/\b(availability|available)\b.*\b(from|between|on)\b/.test(t)) return true;
  return false;
}