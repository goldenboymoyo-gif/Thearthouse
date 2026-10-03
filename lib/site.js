// All wording on the site is taken from the live Art House website.
import { img } from './assets';

export const SITE = {
  name: 'The Art House Victoria Falls',
  url: 'https://www.thearthousevictoriafalls.com',
  title: 'The Art House Victoria Falls, Zimbabwe - 4 Bedroomed Self Catering Accommodation',
  description:
    'Private 4-bedroom self-catering house in Victoria Falls, Zimbabwe. Sleeps 8, pool, hot tub, aircon, WiFi, solar backup. Walk to the Falls. Book direct.',
  keywords: 'vacation, self-catering, holiday home, victoria falls, zimbabwe',
  logo: img('400_6298f24fee429.png'),
  favicon: img('400_629a53eea75fc.png'),
  shareImage: img('800_629b6f3e1814e.jpg'),
  bookingUrl: 'https://book.nightsbridge.com/35154',
};

export const CONTACT = {
  address: '360 Gibson Road, Victoria Falls, Zimbabwe',
  phone: '+263- 77 260 6233',
  phoneHref: 'tel:+263-772606233',
  email: 'thearthousevf@gmail.com',
  hours: 'Enquiries answered 7 days a week',
  facebook: 'https://www.facebook.com/profile.php?id=100084946857420',
  instagram: 'https://www.instagram.com/thearthousevictoriafalls/',
  mapsUrl: 'https://maps.google.com/?q=360+Gibson+Road%2C+Victoria+Falls%2C+Zimbabwe',
  wazeUrl:
    'https://waze.com/ul?p=360+Gibson+Road%2C+Victoria+Falls%2C+Zimbabwe&ll=-17.922999,25.8270921&navigate=yes',
  moovitUrl:
    'https://moovit.com/?to=360+Gibson+Road%2C+Victoria+Falls%2C+Zimbabwe&tll=-17.922999_25.8270921&metroId=1',
  moovitAppUrl: 'moovit://directions?dest_lat=-17.922999&dest_lon=25.8270921',
  mapEmbed:
    'https://maps.google.com/maps?q=360%20Gibson%20Road%2C%20Victoria%20Falls%2C%20Zimbabwe&z=15&hl=en&output=embed',
};

export const GREETING =
  "Hello - Welcome to The Art House! Please don't hesitate to get in touch if you have any questions, and we'll get back to you as soon as possible :)";

// Every page on the site, kept for the footer navigation and anywhere that
// needs the complete flat list of destinations.
export const ALL_PAGES = [
  { href: '/', label: 'Home' },
  { href: '/the-art-house', label: 'The Art House' },
  { href: '/explore', label: 'Explore' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/guest-reviews', label: 'Guest Reviews' },
  { href: '/articles', label: 'Journal' },
  { href: '/contact', label: 'Contact Us' },
];

// Primary navigation bar: plain links, no dropdowns. "The Art House" and
// "Explore" are single pages made of sections; `match` lists the older
// sub-page paths that should still highlight them.
export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/the-art-house', label: 'The Art House', match: ['/outdoor-living'] },
  { href: '/explore', label: 'Explore', match: ['/things-to-do'] },
  { href: '/guest-reviews', label: 'Guest Reviews' },
  { href: '/articles', label: 'Journal' },
];

// Section jump links for the two combined pages.
export const PAGE_SECTIONS = {
  artHouse: [
    { id: 'welcome', label: 'Welcome' },
    { id: 'quick-look', label: 'Quick Look' },
    { id: 'outdoor-living', label: 'Outdoor Living' },
    { id: 'faq', label: 'FAQ' },
  ],
  explore: [
    { id: 'whats-around', label: "What's Around" },
    { id: 'things-to-do', label: 'What to Do in Victoria Falls' },
  ],
};

export const HERO_IMAGE = { src: img('2000_629b6f3e1814e.jpg'), ratio: 2000 / 1333 };

export const WELCOME = {
  title: 'WELCOME TO THE ART HOUSE  – 4-Bedroom Self-Catering Home, Victoria Falls',
  image: img('2000_631a060b744a7.png'),
  intro: 'The Art House – 4-Bedroom Self-Catering Home, Victoria Falls',
  paragraphs: [
    'Welcome to our beautiful family home, set in large, lush gardens in the heart of Victoria Falls, Zimbabwe. The Art House is available for private short-term hire and makes for a wonderfully quiet and comfortable self-catering experience when travelling with friends and family to Victoria Falls.',
    'It is a private 4 bedroom self catering house with a swimming pool, in Victoria Falls, Zimbabwe. Sleeps 8, but we do have stretcher beds to accommodate more and a baby cot. Walking distance to the waterfall, with wifi, aircon and you can book direct.',
    'The Art House is situated in the original quiet residential suburb of Victoria Falls, and is within easy walking distance of our town centre and magnificent waterfall. Feel free to stretch out on our rolling lawns surrounded by herbaceous beds and tropical gardens, whilst enjoying a dip in your own private swimming pool!',
    'With a passion for art, we’ve adorned the house with paintings by renowned African artists and craftsmen, inspired by our gorgeous surroundings. The Art House makes for a splendid entertainment and relaxation space, and our guests are encouraged to make themselves at home.',
    'The four bedroomed house features one en-suite bathroom, a shared bathroom with a toilet, basin and shower, a separate guest toilet and outdoor hot tub and shower. There is also a braai/barbeque facility available for outdoor cooking and access to a seasonal kitchen garden. There is reliable wifi and the house is serviced daily. We have back up solar and water supply.',
    "The Art House is only hired out as a whole unit, meaning you will have exclusive use of the property and all four bedrooms without sharing with any other guests. We would be glad to book your tours and activities for you at no additional cost, so please don't hesitate to let us know what you would like to see and do whilst in the area...",
  ],
};

export const QUICK_LOOK = {
  title: 'Quick Look',
  items: [
    { icon: 'bed-side5f22b49a15295', title: '4 Bedrooms', text: 'Sleeps 8 in 2 Kings, 1 Double & 1 Twin', image: img('2000_6298dda6dad20.jpg'), alt: 'King bedroom at The Art House, Victoria Falls', href: '/the-art-house#welcome' },
    { icon: 'bath-tub5f22b39493951', title: '3 Bathrooms', text: '1 en-suite bathroom, 1 guest bathroom and 1 outside bathroom', image: img('2000_6ab6807a07df9.jpg'), alt: 'Indoor bathroom with shower at The Art House', href: '/the-art-house#welcome' },
    { icon: 'swimming5f22b32463ba4', title: 'Swimming Pool', text: 'Plunge, cool down, relax!', image: img('2000_6ab680a390ba3.jpg'), alt: 'Private swimming pool and garden at The Art House, Victoria Falls', href: '/the-art-house#outdoor-living' },
    { icon: 'mouse-pointer', title: 'WiFi & Netflix', text: 'Enjoy staying connected!', image: img('2000_6298dde1354a3.jpg'), alt: 'Lounge with TV for Netflix at The Art House', href: '/the-art-house#welcome' },
    { icon: 'dog-leash5f22834a141ba', title: 'Pet Friendly', text: 'No worries to bring them along!', image: img('2000_629a589b6ecad.jpg'), alt: 'Guests and their dog relaxing by the pool at The Art House', href: '/the-art-house#faq' },
    { icon: 'snowflake-o', title: 'Air Conditioned', text: 'Our rooms are fitted with efficient eco-friendly air conditioning units', image: img('2000_6298ddadb945b.jpg'), alt: 'Air-conditioned double bedroom at The Art House', href: '/the-art-house#welcome' },
  ],
};

// Practical details supplied by the owner.
export const STAY_INFO = {
  rateFrom: 'US$300',
  rateNote: 'Rates start from US$300 per night.',
  checkIn: '2:00 pm',
  checkOut: '10:00 am',
  minimumStay: [
    '2 nights in low and mid season',
    '4 nights over major holidays',
  ],
  meals: 'A cook can be arranged with due notice, or ready-cooked meals can be provided.',
};

// Distances from The Art House (360 Gibson Road), measured with Google Maps
// directions in October 2026 (shortest route).
export const DISTANCES = [
  { icon: 'water', short: 'The Falls', place: 'The Victoria Falls (main entrance)', distance: '3 km', note: 'about a 35-minute walk or 7 minutes by car' },
  { icon: 'town', short: 'Town centre', place: 'Victoria Falls town centre', distance: '2 km', note: 'about a 25-minute walk' },
  { icon: 'store', short: 'Seven to Eleven', place: 'Seven to Eleven convenience store', distance: '1.1 km', note: 'about a 15-minute walk or 2 minutes by car' },
  { icon: 'cart', short: 'Pick n Pay', place: 'Pick n Pay supermarket', distance: '1.4 km', note: 'about a 20-minute walk or 4 minutes by car' },
  { icon: 'plane', short: 'Airport', place: 'Victoria Falls International Airport', distance: '21 km', note: 'about a 22-minute drive' },
];


export const PROMOS = {
  peaceful: {
    title: 'PEACEFUL QUIET EXCLUSIVITY',
    subtitle: 'At The Art House Victoria Falls',
    image: img('2000_629a589b6ecad.jpg'),
    opacity: 0.8,
    height: '82vh',
    shapeColor: 'var(--color-alt)',
  },
  discover: {
    title: 'COME DISCOVER OUR PARADISE!',
    subtitle: "We'll gladly book all of your Victoria Falls activities at no additional cost!",
    subtitleStyle: 'italic',
    button: { label: "Let's Get Started!", href: '/contact' },
    image: img('2000_629a4f9d39d42.jpg'),
    opacity: 0.7,
    height: '100vh',
    shapeColor: 'var(--color-white)',
  },
  waiting: {
    title: 'SO WHAT ARE YOU WAITING FOR?',
    button: { label: 'Join Us', href: '/contact' },
    image: img('2000_629a522976c98.jpg'),
    opacity: 0.8,
    height: '100vh',
    shapeColor: 'var(--color-alt)',
  },
};

// [file, width, height, alt text] — natural sizes, used to lay out the masonry grid
// before the photographs have loaded.
const GALLERY_FILES = [
  ['2000_6298dda6dad20.jpg', 2000, 1240, 'King bedroom opening onto the garden at The Art House, Victoria Falls'],
  ['2000_6298dda94b79a.jpg', 2000, 1333, 'Lounge with sofas, piano and African art at The Art House'],
  ['2000_6298ddadb945b.jpg', 2000, 1333, 'Double bedroom with original artwork at The Art House'],
  ['2000_6298ddadb801c.jpg', 2000, 1333, 'The Art House veranda and rolling lawn, Victoria Falls'],
  ['2000_6298ddae94b03.jpg', 2000, 1333, 'Fully equipped self-catering kitchen at The Art House'],
  ['2000_6298ddae9468e.jpg', 2000, 1333, 'Garden path and tropical plants outside The Art House'],
  ['2000_6298ddaf3d3e0.jpg', 2000, 1333, 'Shaded courtyard with garden furniture at The Art House'],
  ['2000_6298ddaf95b84.jpg', 2000, 1333, 'Dining room with pendant lights and paintings at The Art House'],
  ['2000_6298ddafb73b6.jpg', 2000, 1333, 'Open-plan dining room leading to the lounge at The Art House'],
  ['2000_6298ddb00ccd1.jpg', 2000, 1333, 'Guests gathering for dinner on the veranda at dusk'],
  ['2000_6298ddda14036.jpg', 2000, 1333, 'Lounge opening onto the veranda at The Art House'],
  ['2000_6298dddaa1ced.jpg', 2000, 1333, 'King bedroom with garden doors at The Art House'],
  ['2000_6298dddac9d51.jpg', 2000, 1333, 'Lounge with piano and garden views at The Art House'],
  ['2000_6298dddb433ff.jpg', 2000, 1333, 'Bedroom with doors onto the veranda at The Art House'],
  ['2000_6298ddde136da.jpg', 2000, 1238, 'Twin bedroom at The Art House, Victoria Falls'],
  ['2000_6298ddde13347.jpg', 2000, 1333, 'Evening dinner table set on the veranda at The Art House'],
  ['2000_6298dddf80ed6.jpg', 2000, 1333, 'Covered veranda lounge overlooking the garden'],
  ['2000_6298dde1354a3.jpg', 2000, 1333, 'Lounge with TV and sofas at The Art House'],
  ['2000_6298dde170bf8.jpg', 2000, 1333, 'Twin bedroom with garden window at The Art House'],
  ['2000_6298dde1bd043.jpg', 2000, 1333, 'Outdoor dining table on the veranda at sunset'],
  ['2000_6298dde89185b.jpg', 2000, 1333, 'Veranda seating overlooking the tropical garden'],
  ['2000_629a0d5cb916c.jpg', 2000, 1333, 'Outdoor shower and bath in the garden at The Art House'],
  ['2000_629a0d5db05a4.jpg', 2000, 1333, 'Guests enjoying the private pool and braai at The Art House'],
  ['2000_629a0d5e0f31e.jpg', 2000, 1333, 'Outdoor bath surrounded by tropical garden'],
  ['2000_6ab6803b778d9.jpg', 724, 1086, 'Sitting room with leather sofas and artwork'],
  ['2000_6ab6804ccc956.jpg', 768, 1024, 'Courtyard with wrought-iron table and chairs'],
  ['2000_6ab680558f660.jpg', 724, 1086, 'Dining table with benches and African art'],
  ['2000_6ab6806da74d5.jpg', 768, 1024, 'Bedroom with en-suite bathroom and mosquito net'],
  ['2000_6ab6807a07df9.jpg', 724, 1086, 'Indoor bathroom with walk-in shower'],
  ['2000_6ab6808160d4a.jpg', 724, 1086, 'Guest bathroom with toilet and basin'],
  ['2000_6ab68089ae4aa.jpg', 768, 1024, 'Double bedroom with mosquito net and dressing table'],
  ['2000_6ab680937e026.jpg', 724, 1086, 'Double bed with woven wall art and mosquito net'],
  ['2000_6ab6809cedc0a.jpg', 1086, 724, 'Veranda lounge chairs looking onto the garden'],
  ['2000_6ab680a390ba3.jpg', 724, 1086, 'Private swimming pool with loungers'],
  ['2000_6ab680aa875bc.jpg', 768, 1024, 'Outdoor bath lit up at night under the stars'],
  ['2000_6ab680bc87df9.jpg', 1086, 724, 'The Art House exterior and garden path'],
  ['2000_6ab680cae1263.jpg', 1086, 724, 'The Art House set in lush tropical gardens'],
  ['2000_6ab680d6c44ab.jpg', 1086, 724, 'Tropical garden plants at The Art House'],
  ['2000_6ab680ded055f.jpg', 768, 1024, 'Colourful sun-face artwork at The Art House'],
  ['2000_6ab680f5bf596.jpg', 724, 1086, 'Front of The Art House with potted plants'],
  ['2000_6ab6811204c0c.jpg', 724, 1086, 'African mask on the wall at The Art House'],
];

export const GALLERY = {
  title: 'Gallery',
  images: GALLERY_FILES.map(([f, w, h, alt]) => ({ src: img(f), full: img(f), width: w, height: h, alt })),
};

export const OUTDOOR = {
  title: 'Outdoor Living at its finest',
  items: [
    {
      slug: 'outdoor-living-at-it-s-best',
      title: 'Outdoor Living at its Best!',
      image: img('800_629b325a6f67b.png'),
      sections: [
        {
          heading: 'Enjoy an outdoor bath beneath the African stars!',
          text: 'An outdoor bath and shower under the stars, with the roar of the Victoria Falls waterfall in the background',
          images: [
            { src: img('2000_629b32b7d205c.png'), ratio: 1.0686131386861 },
            { src: img('2000_6ab7824e1863d.jpg'), ratio: 0.75 },
            { src: img('2000_6ab7827bc063b.jpg'), ratio: 0.66666666666667 },
          ],
        },
      ],
    },
    {
      slug: 'enjoy-an-outdoor-bath-beneath-the-african-stars',
      title: 'Enjoy an outdoor bath beneath the African stars!',
      image: img('800_629b32ebe9f88.png'),
      sections: [{ images: [{ src: img('2000_629b331bb212d.png'), ratio: 0.99030303030303 }] }],
    },
  ],
};

export const AROUND = {
  title: "What's Around",
  items: [
    {
      title: 'Victoria Falls',
      image: img('800_6298f74f99c75.jpg'),
      paragraphs: [
        "Victoria Falls is one of the Seven Wonders of the World, and it's right here on our doorstep! Hear the continuous roar of the Falls as you relax in the garden before stepping out to explore this exciting little paradise!",
        "We have a wealth of local knowledge that we are always keen to share, so please don't be shy to ask us for any advice or information you may need, we'll gladly point you in the right direction.",
      ],
    },
    {
      title: 'Tours & Activities',
      image: img('800_6298f8f03a19e.png'),
      paragraphs: [
        'Victoria Falls is known as the adventure capital of Africa and we have abundant knowledge on the awesome activities on offer to keep you entertained throughout your stay!',
        'We offer a comprehensive and highly personalised activity booking service that will ensure that all your bookings and transfers are taken care of on your behalf. We can also assist with holiday planning and bookings for surrounding destinations.',
        'See our activities gallery below and contact us for further information and pricing.',
      ],
    },
    {
      title: 'Food & Entertainment',
      image: img('800_629a53b525b5e.png'),
      paragraphs: [
        "Looking for recommendations on where to grab a bite or enjoy a few drinks here in Victoria Falls? Locals know best, and we'd be glad to make recommendations from a vast array of options according to your taste.",
        "Please feel free to chat to us to find out whats hot and what's not! We are always available to answer your questions and point you in the direction of having a good time!",
      ],
    },
  ],
};

export const THINGS_TO_DO = {
  title: 'WHAT TO DO IN VIC FALLS',
  images: [
    { src: img('800_629b79db9dedd.jpg'), full: img('2000_629b79db9dedd.jpg') },
    { src: img('800_629b79db68bb7.jpg'), full: img('800_629b79db68bb7.jpg') },
    { src: img('2000_629b7ce577031.jpg'), full: img('2000_629b7ce577031.jpg') },
    { src: img('2000_629b7a7781e23.png'), full: img('2000_629b7a7781e23.png') },
    { src: img('2000_629b7c09d86a5.jpg'), full: img('2000_629b7c09d86a5.jpg') },
    { src: img('2000_629b7c09c73ac.jpg'), full: img('2000_629b7c09c73ac.jpg') },
    { src: img('2000_629b79db9ef7a.jpg'), full: img('2000_629b79db9ef7a.jpg') },
    { src: img('2000_629b7a638cb12.png'), full: img('2000_629b7a638cb12.png') },
  ],
  // Each activity is a general description of a well-known Victoria Falls
  // experience. Nothing here states operators, prices, schedules or live
  // availability — those are confirmed on enquiry via the contact page.
  activities: [
    {
      slug: 'victoria-falls-guided-tours',
      title: 'Victoria Falls Guided Tours',
      tagline: 'See the magnificent Victoria Falls with a local guide',
      description:
        'The Victoria Falls and their surrounding rainforest are right on our doorstep — within easy walking distance of The Art House. Guided tours take you through the lush rainforest on the Zimbabwean side of the Falls, with thrilling viewpoints across the gorge and the famous spray.',
      highlights: [
        'Within easy walking distance of The Art House',
        'Guided walks through the Victoria Falls rainforest',
        'Viewpoints across the gorge and the Falls',
        'Local knowledge and advice from our team',
      ],
      image: img('2000_629a522976c98.jpg'),
      full: img('2000_629a522976c98.jpg'),
    },
    {
      slug: 'zambezi-river-cruises',
      title: 'Zambezi River Cruises',
      tagline: 'Cruise the mighty Zambezi above the Falls',
      description:
        'A river cruise along the calm stretches of the Zambezi River above the Falls is a relaxing way to take in the river, its banks and its wildlife — often timed for golden-hour light as the sun drops over the water.',
      highlights: [
        'Relaxed cruise on the Zambezi above the Falls',
        'River views and wildlife along the banks',
        'Sunset cruise timings available',
      ],
      image: img('2000_629b7a7781e23.png'),
      full: img('2000_629b7a7781e23.png'),
    },
    {
      slug: 'white-water-rafting',
      title: 'White-Water Rafting',
      tagline: 'Raft the world-famous rapids below the Falls',
      description:
        'White-water rafting on the Zambezi below Victoria Falls is one of the great adventures of the adventure capital of Africa — navigating the rapids of the Batoka Gorge with experienced guides.',
      highlights: [
        'World-famous rapids in the Batoka Gorge',
        'Experienced rafting operators',
        'A bucket-list adventure experience',
      ],
      image: img('2000_629b7ce577031.jpg'),
      full: img('2000_629b7ce577031.jpg'),
    },
    {
      slug: 'helicopter-flights',
      title: 'Helicopter Flights',
      tagline: 'See the Falls from the air',
      description:
        'Flights over the Falls and the Zambezi give you the classic aerial view of the Falls, its gorges and the river beyond — an unforgettable way to appreciate the sheer scale of this natural wonder.',
      highlights: [
        'Panoramic flight over Victoria Falls',
        'Views of the gorge and the Zambezi',
        'An unforgettable aerial perspective',
      ],
      image: img('800_629b79db68bb7.jpg'),
      full: img('800_629b79db68bb7.jpg'),
    },
    {
      slug: 'wildlife-safaris',
      title: 'Wildlife Safaris',
      tagline: 'Meet the wildlife of Zimbabwe',
      description:
        'Game drives and safari experiences in the national parks around Victoria Falls offer the chance to encounter African wildlife — from elephants and buffalo to a wealth of birdlife.',
      highlights: [
        'Safari experiences in nearby national parks',
        'Chance to see elephants and buffalo',
        'Birdlife-rich surroundings',
      ],
      image: img('2000_629b79db9ef7a.jpg'),
      full: img('2000_629b79db9ef7a.jpg'),
    },
    {
      slug: 'bungee-jumping',
      title: 'Bungee Jumping',
      tagline: 'Take the leap over the Zambezi gorge',
      description:
        'For the thrill-seekers: bungee jumping from the bridge spanning the Zambezi gorge below the Falls — an iconic adrenaline experience in Victoria Falls.',
      highlights: [
        'Iconic bridge leap over the gorge',
        'An adrenaline experience for thrill-seekers',
        'Arranged for you by The Art House team',
      ],
      image: img('800_629b79db9dedd.jpg'),
      full: img('2000_629b79db9dedd.jpg'),
    },
    {
      slug: 'cultural-experiences',
      title: 'Cultural Experiences',
      tagline: 'Discover the heritage of Victoria Falls',
      description:
        'Cultural experiences and village visits offer a window into the local life, crafts and history of the Victoria Falls area, guided by people who know it best.',
      highlights: [
        'Local village and culture tours',
        'Crafts and heritage of the region',
        'Personal recommendations from our team',
      ],
      image: img('2000_629b7a638cb12.png'),
      full: img('2000_629b7a638cb12.png'),
    },
    {
      slug: 'sunset-experiences',
      title: 'Sunset Experiences',
      tagline: 'Watch the sky turn gold over the Zambezi',
      description:
        'Sunset cruises and sundowner experiences are a classic Victoria Falls evening — watching the sky change colour over the river while you relax and take it all in.',
      highlights: [
        'Sundowner cruises and river views',
        'Golden light over the Zambezi',
        'A perfect way to end the day',
      ],
      image: img('800_6298f8f03a19e.png'),
      full: img('800_6298f8f03a19e.png'),
    },
  ],
};

export const REVIEWS = {
  title: 'What our Guests Say',
  items: [
    {
      text: 'Such a wonderful stay at the Art House. Very comfortable and so many extras available. Highly recommend this property when it comes to self catering accommodation in Victoria Falls! We always prefer to private hire in a homestay rather than Airbnb and the Art House is simply stunning!',
      name: 'Karen & Family',
      role: 'Cape Town',
      image: img('800_6319f9bfa9a6e.png'),
      rating: 5,
    },
    {
      text: 'The Art House is amazing! Out of all of the other self catering lodges in Victoria Falls that we stay at, The Art House is our preferred hangout. A clean, well kept space with a beautiful garden - what a joy staying here!😍',
      name: 'Faruk',
      role: 'Victoria Falls',
      image: img('800_6319fc2857d13.png'),
      rating: 5,
    },
    {
      text: 'Our stays at the Art House have always been unforgettable! We return on a yearly basis to enjoy the tranquil setting and the bird life in the garden. Barbecues on the veranda with the sound of the Falls in the background is always our highlight. We choose the Art House every time over any of the Victoria Falls Hotels.',
      name: 'Perrin',
      role: 'Wisconsin, USA',
      image: img('800_6319ffe8c2f32.png'),
      rating: 5,
    },
  ],
};

export const ARTICLES = {
  title: 'Published Articles',
  items: [
    {
      text: 'Welcome to The Art House, a hidden gem nestled in lush gardens in the heart of Victoria Falls town. If you’re looking for a private and comfortable self-catering experience for groups of friends and families, this charming family home is the perfect choice. Adorned with stunning paintings by renowned African artists, The Art House creates a splendid entertainment and relaxation space.\n\nFollow the link to read more',
      name: 'The Lost Executive',
      linkLabel: 'Art House Article',
      href: 'https://www.thelostexecutive.com/2023/08/01/experience-adventure-at-the-art-house-self-catering-accommodation-in-victoria-falls/',
      image: img('400_64e3371b43efa.png'),
      rating: 5,
    },
  ],
};
