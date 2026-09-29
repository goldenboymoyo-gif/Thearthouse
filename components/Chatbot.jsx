'use client';

import { useEffect, useRef, useState } from 'react';
import { ARTICLES, CONTACT, QUICK_LOOK, REVIEWS, SITE, THINGS_TO_DO } from '@/lib/site';
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

const CHIPS = [
  { label: 'Tell me about the house', question: 'Tell me about the house' },
  { label: 'Booking enquiries', question: 'Booking enquiries' },
  { label: 'Activities', question: 'What activities can I book?' },
  { label: 'Location', question: 'Where are you located?' },
];

// Floating AI assistant. It answers from verified site content through the
// rule-based getAssistantReply below. Swap that function for a call to a real
// assistant/AI backend later without changing the UI.
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hello! Welcome to The Art House, Victoria Falls. I'm your virtual assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [bookStep, setBookStep] = useState(0);
  const [bookInfo, setBookInfo] = useState({});

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 80);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: 'nearest' });
  }, [messages]);

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

  const pushBubbles = (userText, botText) => {
    setMessages((m) => [...m, { from: 'user', text: userText }, { from: 'bot', text: botText }]);
  };

  const nextBookingStep = (text) => {
    let info = { ...bookInfo };
    let reply = '';
    let next = bookStep;
    if (bookStep === 1) {
      info.dates = text;
      reply = 'Thank you! How many adults and children will be staying?';
      next = 2;
    } else if (bookStep === 2) {
      info.guests = text;
      reply = 'Great. May I have your name and the best email or phone number to reach you on?';
      next = 3;
    } else if (bookStep === 3) {
      info.contact = text;
      reply = `Thank you! Here's what to do next:\n\n• Check live availability and book instantly at ${SITE.bookingUrl}, or\n• Email ${CONTACT.email} or call ${CONTACT.phone} and we'll confirm your stay personally.\n\nPlease note I haven't made a reservation yet - availability and final confirmation are handled by our booking channel or our team. We look forward to welcoming you!`;
      next = 0;
      info = {};
    }
    setBookInfo(info);
    setBookStep(next);
    pushBubbles(text, reply);
    return true;
  };

  const startBookingFlow = () => {
    setBookStep(1);
    pushBubbles(
      'Booking enquiries',
      "I'd be happy to help you book your stay at The Art House! Could you tell me your preferred check-in and check-out dates?"
    );
  };

  const send = (raw) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setInput('');

    if (bookStep > 0) {
      const lower = text.toLowerCase();
      if (['cancel', 'stop', 'never mind', 'nevermind', 'restart'].some((w) => lower.includes(w))) {
        setBookStep(0);
        setBookInfo({});
        pushBubbles(text, "No problem - I've cancelled the booking enquiry. Just let me know if there's anything else I can help you with!");
        return;
      }
      nextBookingStep(text);
      return;
    }

    if (isBookingIntro(text)) {
      startBookingFlow();
      return;
    }

    const reply = getAssistantReply(text);
    pushBubbles(text, reply);
  };

  const quick = (q) => send(q);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="magic-btn chat"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
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
            {bookStep === 0 ? (
              <div className="chat-quick">
                <span className="chat-quick-label">Try asking:</span>
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
              placeholder={bookStep > 0 ? 'Type your answer…' : 'Type your message…'}
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

  const has = (words) => words.some((w) => q.includes(w));
  const all = (words) => words.every((w) => q.includes(w));

  if (has(['hello', 'hi', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening']))
    return "Hi there! Welcome to The Art House, Victoria Falls. I'm here to help with your stay - ask me about the house, booking, activities and more.";

  if (has(['tell me about the house', 'about the house', 'tell me about it', 'tell me more', 'the house itself', 'whole house', 'exclusive', 'private use', 'all to ourselves', 'other guests']))
    return 'The Art House is offered as an exclusive-use property: when you book, the whole house is yours alone. It is a 4 bedroom family home sleeping 8 guests (3 doubles and 1 twin), with 3 bathrooms, a private swimming pool, reliable WiFi and Netflix, air conditioning, and a large, lush tropical garden with plenty of bird life. It is serviced daily, and we keep a seasonal kitchen garden with herbs and vegetables for our guests.';

  if (has(['bedroom', 'bedrooms', 'room', 'rooms', 'sleeps', 'sleep', 'accommodat', 'how many people', 'how many guests']))
    return 'The Art House has 4 bedrooms sleeping 8 guests (3 doubles and 1 twin). We also have stretcher beds to accommodate more guests and a baby cot available - perfect for families and groups.';

  if (has(['family', 'families', 'kids', 'children', 'child', 'baby', 'cot' ]))
    return 'The Art House is a warm family home, ideal for families and groups: 4 bedrooms sleeping 8 (with stretcher beds and a baby cot available), a private pool, large gardens and daily servicing. The whole house is yours exclusively during your stay.';

  if (has(['servic', 'clean', 'maid', 'housekeeping', 'tidy']))
    return 'The Art House is serviced daily, so you can relax and make the most of your stay.';

  if (has(['bathroom', 'bathrooms', 'bath', 'shower', 'hot tub', 'jacuzzi']))
    return 'There are 3 bathrooms: 1 en-suite bathroom, 1 guest bathroom and 1 outside bathroom with a hot tub and shower - plus the famous outdoor bath beneath the African stars!';

  if (has(['pool', 'swim', 'swimming']))
    return 'Yes! The Art House has a private swimming pool set in our large, lush gardens - plunge, cool down, relax!';

  if (has(['wifi', 'wi-fi', 'netflix', 'internet', 'inter-net', 'stream']))
    return 'Yes - there is reliable WiFi throughout the house and Netflix for streaming. Enjoy staying connected!';

  if (has(['pet', 'dog', 'dogs', 'cat', 'animals', 'animal']))
    return 'Absolutely - The Art House is pet friendly, so no worries to bring them along!';

  if (has(['aircon', 'air-con', 'air condition', 'cooling', 'air conditioning']))
    return 'All rooms are fitted with efficient, eco-friendly air conditioning units - and we have backup solar and water supply as well, so you stay comfortable throughout.';

  if (has(['solar', 'power', 'electricity', 'load shedding', 'water backup', 'water supply', 'backup']))
    return 'The house is fitted with backup solar and water supply, so power cuts and water interruptions are not a concern during your stay.';

  if (has(['kitchen', 'cook', 'cooking', 'self-catering', 'self catering', 'vegetables', 'herbs', 'garden food', 'braai', 'barbecue', 'barbeque']))
    return 'The Art House is a self-catering home with a well-equipped kitchen, and we keep a seasonal kitchen garden with herbs and vegetables. There is also a braai/barbeque facility for outdoor cooking, and our team can arrange a chef to do the cooking for you if you wish.';

  if (has(['outdoor', 'outside', 'veranda', 'garden', 'gardens', 'star', 'stars', 'outdoor living']))
    return 'Outdoor living is one of our highlights: an outdoor bath and shower beneath the African stars with the roar of the Victoria Falls waterfall in the background, plus a braai/barbeque facility for outdoor cooking and exclusive use of our tropical gardens.';

  const activity = ACTIVITY_QUERIES.find(({ words }) => has(words));
  if (activity) {
    const a = THINGS_TO_DO.activities.find((x) => x.slug === activity.slug);
    if (a)
      return `${a.title} — ${a.tagline}. ${a.description} You can read more on our What to Do page at /things-to-do/${a.slug}, and we're glad to arrange it for you — visit /contact, email ${CONTACT.email} or call ${CONTACT.phone}. Right now the details above are general: operators, availability, schedules and pricing are confirmed on enquiry.`;
  }

  if (has(['waterfall', 'the falls', 'the waterfall', 'fall', 'seven wonders', 'walking distance', 'town centre', 'town center', 'falls']))
    return "Victoria Falls is one of the Seven Wonders of the World and it's right on our doorstep! The Art House is within easy walking distance of the town centre and the magnificent falls.";

  if (has(['how far', 'distance', 'km', 'kilometres', 'kilometers', 'minutes away', 'drive from', 'get there', 'getting to']))
    return "We're within easy walking distance of the Victoria Falls town centre and the magnificent waterfall. We don't list exact distances in kilometres on our website — get in touch at " + CONTACT.email + ' and our team will point you in the right direction.';

  if (has(['forest', 'rainforest', 'rain forest', 'hike', 'trail', 'wildlife', 'sunset', 'cruise', 'helicopter', 'bungee', 'rafting', 'zip', 'canoe', 'flight']))
    return 'Victoria Falls is the adventure capital of Africa, with everything from the Falls and rainforest trails to helicopter flights, white-water rafting, bungee jumping, sunset cruises and wildlife encounters. Tell us what you would like to do and we will help you book it.';

  if (has(['activity', 'activities', 'tour', 'tours', 'things to do', 'adventure', 'book a tour', 'book activities', 'excursion', 'excursions']))
    return "We're in the adventure capital of Africa! We provide a comprehensive, personalised service for tours, activities and holiday planning - and we can arrange transfers too - at no additional cost. Every activity on our What to Do page (/things-to-do) has its own page with more details, and each one can be arranged through us - just tell us what you'd like to do, or visit /contact to enquire.";

  if (has(['transfer', 'transfers', 'airport', 'pick-up', 'pickup', 'pick up', 'transport', 'taxi', 'drive', 'getting around', 'shuttle']))
    return 'We can assist with transfers to and from the airport, as well as transport and holiday planning for your whole trip - arranged for you at no additional cost. Just let our team know your details.';

  if (has(['food', 'eat', 'restaurant', 'restaurants', 'drink', 'bar', 'bite', 'local', 'where to eat']))
    return "Locals know best! We'd be glad to recommend great spots for a bite or a few drinks in Victoria Falls, matched to your taste - just ask us when you arrive.";

  if (has(['review', 'reviews', 'guest', 'guests', 'guests say', 'testimonial']))
    return `Our guests love the exclusive whole-house experience, the tranquil gardens and the bird life, and braais on the veranda with the sound of the Falls in the background. You can read reviews from ${REVIEWS.items.map((r) => r.name).join(', ')} and more on our Guest Reviews page.`;

  if (has(['article', 'articles', 'press', 'journal', 'lost executive', 'featured']))
    return `The Art House has been featured in a published article: "${ARTICLES.items[0].name} - ${ARTICLES.items[0].linkLabel}". You can read it on our Journal page.`;

  if (has(['contact', 'phone', 'call', 'email', 'mail', 'address', 'location', 'where are you', 'map', 'directions', 'reach']))
    return `You can reach us at ${CONTACT.email} or call ${CONTACT.phone}. We're at ${CONTACT.address} and are available ${CONTACT.hours} to help.`;

  if (has(['check-in', 'check in', 'check-out', 'check out', 'hours', 'reception', 'arrival']))
    return `Our team is available ${CONTACT.hours} to welcome you and answer any questions.`;

  if (has(['quick look', 'facilities', 'amenities', 'what does it have', 'features', 'what is included', 'whats included', 'what do you provide']))
    return `Here's a quick look at The Art House: ${QUICK_LOOK.items.map((i) => `${i.title} (${i.text})`).join('; ')}. The house is offered as an exclusive-use property and is serviced daily.`;

  if (has(['price', 'pricing', 'how much', 'cost', 'rates', 'rate', 'availability', 'available', 'reserve', 'reservation', 'reservations', 'book', 'booking', 'vacancy', 'vacancies', 'when can i']))
    return `You can check live availability and book instantly through our secure Book Now button: ${SITE.bookingUrl}. We also welcome direct bookings and we'd gladly arrange your tours, activities and transfers at no additional cost. For any questions just email ${CONTACT.email} or call ${CONTACT.phone}.`;

  return "I'd love to help with that! I can answer questions about the house, booking and pricing, activities, location, facilities, what's around, reviews and articles. Try asking \"Tell me about the house\", \"Booking enquiries\", \"Activities\" or \"Location\".";
}

// Detect a request to start the guided booking enquiry flow.
export function isBookingIntro(text) {
  const t = text.toLowerCase();
  const intents = [
    'booking enquiries',
    'book a stay',
    'book your stay',
    'book now',
    'help me book',
    'make a booking',
    'i want to book',
    "i'd like to book",
    'how do i book',
    'how can i book',
    'want to book',
    'start a booking',
    'check availability',
    'make a reservation',
    'i would like to make a booking',
    'place a booking',
  ];
  return intents.some((phrase) => t === phrase || t.startsWith(`${phrase} `) || t.startsWith(`${phrase}?`));
}