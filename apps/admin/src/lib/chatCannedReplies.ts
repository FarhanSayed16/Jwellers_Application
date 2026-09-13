/** Default staff chat canned replies — Launch package. Edit per client voice. */
export const CHAT_CANNED_REPLIES: Array<{ id: string; label: string; body: string }> = [
  {
    id: 'greet',
    label: 'Greeting',
    body: 'Namaste! Thank you for contacting us. How may we help you today?',
  },
  {
    id: 'rate',
    label: 'Rates',
    body: 'Today’s gold and silver rates are updated in the app Home screen. Please pull to refresh if you opened the app earlier.',
  },
  {
    id: 'visit',
    label: 'Visit shop',
    body: 'You are welcome to visit our showroom. Please share a convenient time and we will confirm.',
  },
  {
    id: 'custom',
    label: 'Custom order',
    body: 'We can discuss custom making. Please share design reference, metal, and approximate weight.',
  },
  {
    id: 'photo',
    label: 'More photos',
    body: 'We will share additional photos shortly.',
  },
  {
    id: 'close',
    label: 'Closing',
    body: 'Thank you. Please reply here if you need anything else. Have a wonderful day!',
  },
];
