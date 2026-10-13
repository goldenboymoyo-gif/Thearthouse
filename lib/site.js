// All wording on the site is taken from the live Art House website.
import { img } from './assets';
// Everything the owner can change from the admin dashboard (/admin) lives in
// this JSON file; the rest of this file adds the fixed parts around it.
import C from '@/content/site-content.json';

export const SITE = {
  name: 'The Art House Victoria Falls',
  url: 'https://www.thearthousevictoriafalls.com',
  title: 'The Art House Victoria Falls, Zimbabwe - 4 Bedroomed Self Catering Accommodation',
  description:
    'Private 4 bedroom self-catering house with swimming pool, yoga and Ayurveda in Victoria Falls, Zimbabwe. Sleeps 8, a 35-minute walk to the Falls. Book direct.',
  logo: img('400_6298f24fee429.png'),
  favicon: img('400_629a53eea75fc.png'),
  shareImage: img('800_629b6f3e1814e.jpg'),
  bookingUrl: C.site.bookingUrl,
};

const telHref = (phone) => `tel:${String(phone).replace(/[^\d+]/g, '')}`;

export const CONTACT = {
  address: C.contact.address,
  phone: C.contact.phone,
  phoneHref: telHref(C.contact.phone),
  email: C.contact.email,
  hours: C.contact.hours,
  facebook: C.contact.facebook,
  instagram: C.contact.instagram,
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
  { href: '/about-sara', label: 'About Sara' },
  { href: '/contact', label: 'Contact Us' },
];

// Primary navigation bar: plain links, no dropdowns. "The Art House" and
// "Explore" are single pages made of sections; `match` lists the older
// sub-page paths that should still highlight them.
export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/the-art-house', label: 'The Art House', match: ['/outdoor-living'] },
  { href: '/explore', label: 'Explore', match: ['/things-to-do'] },
  { href: '/gallery', label: 'Gallery' },
  { href: '/guest-reviews', label: 'Guest Reviews' },
  { href: '/contact', label: 'Contact' },
];

export const HERO_IMAGE = { src: img('2000_629b6f3e1814e.jpg'), ratio: 2000 / 1333 };

export const WELCOME = {
  title: C.welcome.title,
  image: C.welcome.image,
  intro: C.welcome.intro,
  paragraphs: C.welcome.paragraphs,
};

export const QUICK_LOOK = {
  title: 'Quick Look',
  items: C.quickLook,
};

// Practical details supplied by the owner.
export const STAY_INFO = C.stay;

// Distances from The Art House (360 Gibson Road), measured with Google Maps
// directions (shortest route). Editable in the admin dashboard.
export const DISTANCES = C.distances;

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
    button: { label: 'Book Now', href: SITE.bookingUrl },
    image: img('2000_629a522976c98.jpg'),
    opacity: 0.8,
    height: '100vh',
    shapeColor: 'var(--color-alt)',
  },
};

export const GALLERY = {
  title: 'Gallery',
  images: C.gallery.map((g) => ({ ...g, full: g.src })),
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
  items: C.explore,
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
  // experience (editable in the admin dashboard). Operators, prices and
  // availability are confirmed on enquiry via the contact page.
  activities: C.activities.map((a) => ({ ...a, full: a.full || a.image })),
};

export const REVIEWS = {
  title: 'What our Guests Say',
  items: C.reviews,
};

// Where guests have also reviewed The Art House (shown on the Guest Reviews page).
export const REVIEW_PLATFORMS = [
  { name: 'Booking.com', note: 'Rated 9.4/10 from 66 reviews', href: 'https://www.booking.com/hotel/zw/the-art-house-victoria-falls.html' },
  { name: 'Airbnb', note: 'Rated 5.0/5 from 13 reviews', href: 'https://www.airbnb.com/rooms/932971131581962173' },
  { name: 'Google', note: 'Reviews on Google Maps', href: 'https://www.google.com/maps/search/?api=1&query=The+Art+House+Victoria+Falls+360+Gibson+Road' },
];

// Guest ratings shown on the home page and the Guest Reviews page.
// Checked on the live listings in October 2026. Review regularly and update
// the numbers and date here when they change.
export const RATINGS = {
  asOf: 'October 2026',
  booking: { score: '9.4/10', count: 66, staff: '9.9/10', url: 'https://www.booking.com/hotel/zw/the-art-house-victoria-falls.html' },
  airbnb: { score: '5.0/5', count: 13, url: 'https://www.airbnb.com/rooms/932971131581962173' },
  // Airbnb statuses reported by the owner (not numeric ratings). Set to false if they lapse.
  airbnbGuestFavourite: true,
  airbnbSuperhost: true,
};

// Descriptive alt text for photographs that appear in more than one place.
export const IMAGE_ALTS = {
  '/images/ayurveda-yoga-at-the-falls.jpg': 'Sara practising yoga on the rocks below the Victoria Falls',
  '/images/ayurveda-yoga-in-the-garden.jpg': 'Private yoga session in the garden at The Art House',
  '/images/ayurveda-treatment.jpg': 'Ayurveda treatment in the privacy of The Art House',
};

export const FEATURED_ARTICLE = {
  name: 'The Lost Executive',
  href: 'https://www.thelostexecutive.com/2023/08/01/experience-adventure-at-the-art-house-self-catering-accommodation-in-victoria-falls/',
};
