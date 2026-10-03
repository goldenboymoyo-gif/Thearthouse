// Frequently asked questions. Every answer comes from the live website or
// from details supplied by the owner (see STAY_INFO and DISTANCES).
import { CONTACT, DISTANCES, SITE, STAY_INFO } from './site';

const dist = (match) => DISTANCES.find((d) => d.place.includes(match));

export const FAQ = {
  title: 'Frequently Asked Questions',
  items: [
    {
      q: 'Where is The Art House?',
      a: `The Art House is at ${CONTACT.address}, in the original quiet residential suburb of Victoria Falls. It is within easy walking distance of the town centre and the magnificent waterfall.`,
    },
    {
      q: 'How far is The Art House from the Victoria Falls?',
      a: `The main entrance to the Victoria Falls is ${dist('main entrance').distance} from the house — ${dist('main entrance').note}. You can hear the roar of the Falls from the garden.`,
    },
    {
      q: 'How far is The Art House from Victoria Falls Airport?',
      a: `Victoria Falls International Airport is ${dist('Airport').distance} away, ${dist('Airport').note}. We are glad to arrange your airport transfers for you.`,
    },
    {
      q: 'How far is the town centre?',
      a: `The Victoria Falls town centre is ${dist('town centre').distance} away — ${dist('town centre').note}.`,
    },
    {
      q: 'Where are the nearest shops?',
      a: `The Seven to Eleven convenience store is ${dist('Seven to Eleven').distance} away (${dist('Seven to Eleven').note}) and the Pick n Pay supermarket is ${dist('Pick n Pay').distance} away (${dist('Pick n Pay').note}).`,
    },
    {
      q: 'How many people does The Art House sleep?',
      a: 'The Art House has 4 bedrooms — 2 kings, 1 double and 1 twin — and sleeps 8. We also have stretcher beds to accommodate more guests, and a baby cot.',
    },
    {
      q: 'How many bathrooms are there?',
      a: 'There are 3 bathrooms: 1 en-suite bathroom, 1 guest bathroom and 1 outside bathroom, plus an outdoor hot tub and shower beneath the African stars.',
    },
    {
      q: 'How much does it cost to stay at The Art House?',
      a: `${STAY_INFO.rateNote} You can book direct through our website or contact us for a quote.`,
    },
    {
      q: 'What are the check-in and check-out times?',
      a: `Check-in is from ${STAY_INFO.checkIn} and check-out is by ${STAY_INFO.checkOut}.`,
    },
    {
      q: 'Is there a minimum stay?',
      a: `Yes. The minimum stay is ${STAY_INFO.minimumStay[0]} and ${STAY_INFO.minimumStay[1]}.`,
    },
    {
      q: 'Do we have the whole house to ourselves?',
      a: 'Yes. The Art House is only hired out as a whole unit, so you have exclusive use of the property and all four bedrooms without sharing with any other guests.',
    },
    {
      q: 'Is The Art House self-catering? Can meals be provided?',
      a: `Yes, it is self-catering with a kitchen, a braai/barbeque facility for outdoor cooking and a seasonal kitchen garden. ${STAY_INFO.meals}`,
    },
    {
      q: 'Is The Art House pet friendly?',
      a: 'Yes — The Art House is pet friendly, so no worries about bringing them along!',
    },
    {
      q: 'Do you have backup power and water?',
      a: 'Yes. The house has backup solar power and a backup water supply.',
    },
    {
      q: 'Is there WiFi, air conditioning and a pool?',
      a: 'Yes. There is reliable WiFi and Netflix, the rooms are fitted with efficient eco-friendly air conditioning units, and you have your own private swimming pool in the garden.',
    },
    {
      q: 'Is the house serviced during our stay?',
      a: 'Yes, the house is serviced daily.',
    },
    {
      q: 'Can you book activities for us?',
      a: 'Yes. We would be glad to book your tours, activities and transfers for you at no additional cost — just let us know what you would like to see and do.',
    },
    {
      q: 'How do I book?',
      a: `You can book direct online at ${SITE.bookingUrl}, or contact us on ${CONTACT.phone} or ${CONTACT.email}. Enquiries are answered 7 days a week.`,
    },
  ],
};
