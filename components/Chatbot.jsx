'use client';

import { useEffect, useRef, useState } from 'react';
import { AROUND, CONTACT, DISTANCES, QUICK_LOOK, REVIEWS, SITE, STAY_INFO, THINGS_TO_DO } from '@/lib/site';
import { advance, createFlow, extractDates, formatDate, wantsBooking } from '@/lib/chat-booking';
import Icon from './Icon';

const ACTIVITY_QUERIES = [
  { words: ['sunset', 'sundowner', 'golden hour'], slug: 'sunset-experiences' },
  { words: ['guided tour', 'guided walk', 'rainforest', 'falls tour', 'waterfall tour', 'walking tour'], slug: 'victoria-falls-guided-tours' },
  { words: ['cruise', 'river cruise', 'boat cruise', 'zambezi cruise'], slug: 'zambezi-river-cruises' },
  { words: ['raft', 'rafting', 'white water', 'white-water'], slug: 'white-water-rafting' },
  { words: ['helicopter', 'flight of the angels', 'scenic flight', 'aerial', 'fly over'], slug: 'helicopter-flights' },
  { words: ['safari', 'game drive', 'game viewing', 'wildlife', 'elephants', 'national park'], slug: 'wildlife-safaris' },
  { words: ['bungee', 'bridge jump', 'gorge swing'], slug: 'bungee-jumping' },
  { words: ['cultural', 'village', 'heritage', 'local culture', 'tradition'], slug: 'cultural-experiences' },
];

// Suggested actions shown beneath the welcome message (H + M). The greeting
// ruby's "Make a Booking Enquiry" button launches the conversational flow.
const CHIPS = [
  { label: 'About The Art House', question: 'Tell me about the house' },
  { label: 'Facilities', question: 'What facilities does the house have?' },
  { label: 'Activities', question: 'What can we do in Victoria Falls?' },
  { label: "What's Around", question: 'What is nearby?' },
  { label: 'Guest Reviews', question: 'What do previous guests say?' },
  { label: 'Make a Booking Enquiry', question: 'I would like to make a booking enquiry' },
];

const FLOW_STAGES = ['checkin', 'checkout', 'guests', 'name', 'email', 'phone', 'notes', 'review', 'editpick'];

// Floating AI assistant. Information answers come from the rule-based
// getAssistantReply below; booking enquiries go through the shared /api/contact
// infrastructure (the same channel as the website contact form). Swap
// getAssistantReply for a real assistant/AI backend later without changing the UI.
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hello! Welcome to The Art House, Victoria Falls. I'm your virtual assistant, ask me anything about the house, Victoria Falls, activities or booking.",
    },
  ]);
  const [input, setInput] = useState('');
  const [flow, setFlow] = useState(() => createFlow());
  const [actions, setActions] = useState([]);

  const flowRef = useRef(flow);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  const inFlow = FLOW_STAGES.includes(flow.stage);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 80);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: 'nearest' });
  }, [messages, actions]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        if (launcherRef.current) launcherRef.current.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const postEnquiry = async (payload) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return { delivered: Boolean(res.ok && data.delivered) };
  };

  const config = () => ({
    bookingUrl: SITE.bookingUrl,
    email: CONTACT.email,
    phone: CONTACT.phone,
    submit: postEnquiry,
  });

  const pushBot = (text) => setMessages((m) => [...m, { from: 'bot', text }]);

  const applyFlowResult = ({ flow: f, replies, actions: acts }) => {
    flowRef.current = f;
    setFlow(f);
    if (replies && replies.length) setMessages((m) => [...m, ...replies.map((r) => ({ from: 'bot', text: r }))]);
    setActions(acts || []);
  };

  // Feed one line of user text into the booking flow. advance() can return a
  // Promise (submission) so we normalise it.
  const stepFlow = (inputText, userLabel) => {
    const res = advance(flowRef.current, inputText, config());
    Promise.resolve(res).then(applyFlowResult);
    if (userLabel) setMessages((m) => [...m, { from: 'user', text: userLabel }]);
  };

  const startBookingFlow = (triggerText) => {
    const f = createFlow();
    f.stage = 'checkin';
    const d = extractDates(triggerText);
    if (d.checkIn) f.checkIn = d.checkIn;
    if (d.checkOut) f.checkOut = d.checkOut;
    flowRef.current = f;
    setFlow(f);
    setMessages((m) => [
      ...m,
      { from: 'user', text: triggerText },
      { from: 'bot', text: "Absolutely, I can help you with a booking enquiry. Let's gather your details." },
    ]);
    if (f.checkIn && !f.checkOut) {
      f.stage = 'checkout';
      pushBot(`Great, I've noted your check-in on ${formatDate(f.checkIn)}. What date would you like to check out?`);
      return;
    }
    const res = advance(f, triggerText, config());
    Promise.resolve(res).then(applyFlowResult);
  };

  const send = (raw) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setInput('');

    if (FLOW_STAGES.includes(flowRef.current.stage)) {
      stepFlow(text, text);
      return;
    }

    if (wantsBooking(text)) {
      startBookingFlow(text);
      return;
    }

    setMessages((m) => [...m, { from: 'user', text }, { from: 'bot', text: getAssistantReply(text) }]);
  };

  const quick = (q) => send(q);

  const tapAction = (a) => {
    if (a.href) {
      window.open(a.href, '_blank', 'noopener');
      return;
    }
    if (a.send) {
      if (FLOW_STAGES.includes(flowRef.current.stage)) stepFlow(a.send, a.label);
      else send(a.send);
    }
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="magic-btn chat"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open The Art House AI assistant'}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {open ? <Icon name="times" className="close-icon" /> : <Icon name="chat" />}
      </button>

      {open ? (
        <div className="chat-window" role="dialog" aria-modal="true" aria-labelledby="chat-title">
          <div className="chat-header">
            <div className="chat-title">
              <span className="chat-logo" aria-hidden="true">
                <Icon name="chat" />
              </span>
              <div>
                <span id="chat-title">The Art House Assistant</span>
                <span className="chat-subtitle">
                  Ask me anything about The Art House, your stay, Victoria Falls, activities or booking.
                </span>
                <span className="chat-status">Online · replies instantly</span>
              </div>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <Icon name="times" />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.from}`}>
                <span className="msg-bubble">{msg.text}</span>
              </div>
            ))}
            {(inFlow || flow.stage === 'done') && actions.length ? (
              <div className="chat-actions" role="group" aria-label="Booking actions">
                {actions.map((a) => (a.href ? (
                    <a key={a.label} className="chat-action chat-action-link" href={a.href} target="_blank" rel="noopener">
                      {a.label}
                    </a>
                  ) : (
                    <button key={a.label} type="button" className="chat-action" onClick={() => tapAction(a)}>
                      {a.label}
                    </button>
                  )))}
              </div>
            ) : null}
            {!inFlow && flow.stage !== 'done' ? (
              <div className="chat-quick">
                <span className="chat-quick-label">How can I help?</span>
                <div className="chat-quick-buttons">
                  {CHIPS.map((c) => (
                    <button key={c.label} type="button" onClick={() => quick(c.question)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form className="chat-input-bar" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inFlow ? 'Type your answer…' : 'Type your message…'}
              aria-label="Type your message"
              autoComplete="off"
            />
            <button type="submit" className="chat-send" aria-label="Send message" disabled={!input.trim()}>
              <Icon name="angle-up" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

// Rule-based assistant. Keep this independent of the browser (no window/DOM)
// so it can be swapped later for a real assistant or AI backend call.
export function getAssistantReply(input) {
  const q = input.toLowerCase();

  // Match whole words (or word starts, e.g. 'servic' → 'serviced') so that
  // 'hi' does not fire on 'this' or 'which'.
  const hit = (w) =>
    new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${w.length <= 3 ? '(?![a-z])' : ''}`).test(q);
  const has = (words) => words.some(hit);
  const all = (words) => words.every(hit);

  if (has(['hello', 'hi', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening']))
    return "Hi there! Welcome to The Art House, Victoria Falls. I'm here to help with your stay, ask me about the house, booking, activities and more.";

  if (has(['tell me about the house', 'about the house', 'tell me about it', 'tell me more', 'the house itself', 'whole house', 'exclusive', 'private use', 'all to ourselves', 'other guests']))
    return 'The Art House is offered as an exclusive-use property: when you book, the whole house is yours alone. It is a 4 bedroom family home sleeping 8 guests (2 kings, 1 double and 1 twin), with 3 bathrooms, a private swimming pool, reliable WiFi and Netflix, air conditioning, and a large, lush tropical garden with plenty of bird life. It is serviced daily, and we keep a seasonal kitchen garden with herbs and vegetables for our guests.';

  if (has(['minimum stay', 'minimum night', 'min stay', 'how many nights', 'shortest stay', 'minimum']))
    return `The minimum stay is ${STAY_INFO.minimumStay[0]} and ${STAY_INFO.minimumStay[1]}.`;

  if (has(['check-in', 'check in', 'checkin', 'check-out', 'check out', 'checkout', 'arrival time', 'departure time']))
    return `Check-in is from ${STAY_INFO.checkIn} and check-out is by ${STAY_INFO.checkOut}.`;

  if (has(['price', 'pricing', 'how much', 'cost', 'rates', 'rate', 'per night', 'expensive', 'cheap']))
    return `${STAY_INFO.rateNote} The minimum stay is ${STAY_INFO.minimumStay[0]} and ${STAY_INFO.minimumStay[1]}. You can check availability and book direct here: ${SITE.bookingUrl}, or email ${CONTACT.email} for a quote.`;

  if (has(['chef', 'cook', 'meals', 'meal', 'dinner cooked', 'catering', 'food provided']) && !has(['self-catering', 'self catering']))
    return `${STAY_INFO.meals} The Art House also has a kitchen, a braai/barbeque facility and a seasonal kitchen garden if you prefer to cook yourselves.`;

  if (has(['how far', 'distance', 'km', 'kilometres', 'kilometers', 'minutes away', 'airport', 'supermarket', 'pick n pay', 'shop', 'shops', 'store', 'groceries', 'convenience', '7/11', '7-eleven', 'seven to eleven', 'seven eleven', 'how close', 'nearby shop']))
    return `Approximate distances from The Art House: ${DISTANCES.map((d) => `${d.place} ${d.distance} (${d.note})`).join('; ')}. We can also arrange airport transfers for you.`;

  if (has(['bedroom', 'bedrooms', 'room', 'rooms', 'sleeps', 'sleep', 'accommodat', 'how many people', 'how many guests']))
    return 'The Art House has 4 bedrooms sleeping 8 guests (2 kings, 1 double and 1 twin). We also have stretcher beds to accommodate more guests and a baby cot available, perfect for families and groups.';

  if (/\b(max(imum)?|capacity)\b/.test(q) || /can\s+(\w+|\d{1,2})\s*(people|guests|persons?|adults?|kids?|children)\s+stay/.test(q))
    return 'The Art House sleeps 8 guests (4 bedrooms: 2 kings, 1 double and 1 twin). We also have stretcher beds to accommodate more guests on request, plus a baby cot, so larger groups and families are welcome. Need specific numbers? Just ask and we\u2019ll confirm.';

  if (has(['family', 'families', 'kids', 'children', 'child', 'baby', 'cot']))
    return 'The Art House is a warm family home, ideal for families and groups: 4 bedrooms sleeping 8 (with stretcher beds and a baby cot available), a private pool, large gardens and daily servicing. During your stay the whole house is yours exclusively.';

  if (has(['servic', 'clean', 'maid', 'housekeeping', 'tidy']))
    return 'The Art House is serviced daily, so you can relax and make the most of your stay.';

  if (has(['bathroom', 'bathrooms', 'bath', 'shower', 'hot tub', 'jacuzzi']))
    return 'There are 3 bathrooms: 1 en-suite bathroom, 1 guest bathroom and 1 outside bathroom with a hot tub and shower, plus the famous outdoor bath beneath the African stars!';

  if (has(['pool', 'swim', 'swimming']))
    return 'Yes! The Art House has a private swimming pool set in our large, lush gardens, plunge, cool down, relax!';

  if (has(['wifi', 'wi-fi', 'netflix', 'internet', 'inter-net', 'stream']))
    return 'Yes, there is reliable WiFi throughout the house and Netflix for streaming. Enjoy staying connected!';

  if (has(['pet', 'dog', 'dogs', 'cat', 'animals', 'animal']))
    return 'Absolutely, The Art House is pet friendly, so no worries about bringing them along!';

  if (has(['aircon', 'air-con', 'air condition', 'cooling', 'air conditioning']))
    return 'All rooms are fitted with efficient, eco-friendly air conditioning units, and we have backup solar and water supply as well, so you stay comfortable throughout.';

  if (has(['solar', 'power', 'electricity', 'load shedding', 'water backup', 'water supply', 'backup']))
    return 'The house is fitted with backup solar and water supply, so power cuts and water interruptions are not a concern during your stay.';

  if (has(['kitchen', 'cook', 'cooking', 'self-catering', 'self catering', 'vegetables', 'herbs', 'garden food', 'braai', 'barbecue', 'barbeque']))
    return 'The Art House is a self-catering home with a well-equipped kitchen, and we keep a seasonal kitchen garden with herbs and vegetables. There is also a braai/barbeque facility for outdoor cooking, and a cook can be arranged with due notice, or ready-cooked meals can be provided.';

  if (has(['outdoor', 'outside', 'veranda', 'garden', 'gardens', 'star', 'stars', 'outdoor living']))
    return 'Outdoor living is one of our highlights: an outdoor bath and shower beneath the African stars with the roar of the Victoria Falls waterfall in the background, plus a braai/barbeque facility for outdoor cooking and exclusive use of our tropical gardens.';

  const activity = ACTIVITY_QUERIES.find(({ words }) => has(words));
  if (activity) {
    const a = THINGS_TO_DO.activities.find((x) => x.slug === activity.slug);
    if (a)
      return `${a.title}, ${a.tagline}. ${a.description} You can read more on our What to Do page at /things-to-do/${a.slug}, and we're glad to arrange it for you, visit /contact, email ${CONTACT.email} or call ${CONTACT.phone}. Right now the details above are general: operators, availability, schedules and pricing are confirmed on enquiry.`;
  }

  if (has(['waterfall', 'the falls', 'the waterfall', 'fall', 'seven wonders', 'walking distance', 'town centre', 'town center', 'falls']))
    return "Victoria Falls is one of the Seven Wonders of the World and it's right on our doorstep! The Art House is within easy walking distance of the town centre and the magnificent falls.";

  if (has(['how far', 'distance', 'km', 'kilometres', 'kilometers', 'minutes away', 'drive from', 'get there', 'getting to']))
    return "We're within easy walking distance of the Victoria Falls town centre and the magnificent waterfall. We don't list exact distances in kilometres on our website, get in touch at " + CONTACT.email + ' and our team will point you in the right direction.';

  if (has(['nearby', 'around', 'what is near', 'whats near', 'in the area', 'what is there to do', 'things to see', 'restaurants', 'food']))
    return `${AROUND.items[0].paragraphs[0]} For activities, food and entertainment in Victoria Falls, just ask, we'll point you in the right direction.`;

  if (has(['forest', 'rainforest', 'rain forest', 'hike', 'trail', 'wildlife', 'sunset', 'cruise', 'helicopter', 'bungee', 'rafting', 'zip', 'canoe', 'flight']))
    return 'Victoria Falls is the adventure capital of Africa, with everything from the Falls and rainforest trails to helicopter flights, white-water rafting, bungee jumping, sunset cruises and wildlife encounters. Tell us what you would like to do and we will help you book it.';

  if (has(['activity', 'activities', 'tour', 'tours', 'things to do', 'adventure', 'book a tour', 'book activities', 'excursion', 'excursions']))
    return "We're in the adventure capital of Africa! We provide a comprehensive, personalised service for tours, activities and holiday planning, and we can arrange transfers too, at no additional cost. Every activity on our What to Do section (/explore#things-to-do) has its own page with more details, and each one can be arranged through us, just tell us what you'd like to do, or visit /contact to enquire.";

  if (has(['transfer', 'transfers', 'airport', 'pick-up', 'pickup', 'pick up', 'transport', 'taxi', 'drive', 'getting around', 'shuttle']))
    return 'We can assist with transfers to and from the airport, as well as transport and holiday planning for your whole trip, arranged for you at no additional cost. Just let our team know your details.';

  if (has(['food', 'eat', 'restaurant', 'restaurants', 'drink', 'bar', 'bite', 'local', 'where to eat']))
    return "Locals know best! We'd be glad to recommend great spots for a bite or a few drinks in Victoria Falls, matched to your taste, just ask us when you arrive.";

  if (has(['review', 'reviews', 'guest', 'guests', 'guests say', 'testimonial']))
    return `Our guests love the exclusive whole-house experience, the tranquil gardens and the bird life, and braais on the veranda with the sound of the Falls in the background. You can read reviews from ${REVIEWS.items.map((r) => r.name).join(', ')} and more on our Guest Reviews page.`;


  if (has(['contact', 'phone', 'call', 'email', 'mail', 'address', 'location', 'where are you', 'map', 'directions', 'reach']))
    return `You can reach us at ${CONTACT.email} or call ${CONTACT.phone}. We're at ${CONTACT.address}. ${CONTACT.hours}.`;

  if (has(['check-in', 'check in', 'check-out', 'check out', 'hours', 'reception', 'arrival']))
    return `Check-in is from ${STAY_INFO.checkIn} and check-out is by ${STAY_INFO.checkOut}. ${CONTACT.hours}.`;

  if (has(['quick look', 'facilities', 'amenities', 'what does it have', 'features', 'what is included', 'whats included', 'what do you provide']))
    return `Here's a quick look at The Art House: ${QUICK_LOOK.items.map((i) => `${i.title} (${i.text})`).join('; ')}. The house is offered as an exclusive-use property and is serviced daily.`;

  if (has(['price', 'pricing', 'how much', 'cost', 'rates', 'rate', 'availability', 'available', 'reserve', 'reservation', 'reservations', 'book', 'booking', 'vacancy', 'vacancies', 'when can i']))
    return `You can check live availability and book instantly through our secure Book Now button: ${SITE.bookingUrl}. We also welcome direct bookings and we'd gladly arrange your tours, activities and transfers at no additional cost. For any questions just email ${CONTACT.email} or call ${CONTACT.phone}.`;

  return "I'd love to help with that! I can answer questions about the house, booking and pricing, activities, location, facilities, what's around and reviews, or help you make a booking enquiry. Try asking \"Tell me about the house\", \"Facilities\", \"Activities\", \"What's Around\", \"Guest Reviews\" or \"Make a Booking Enquiry\".";
}

// Detect a request to start the guided booking enquiry flow.
export function isBookingIntro(input) {
  return wantsBooking(input);
}