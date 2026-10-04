import { Celebrant, WishTemplate, WishTone } from '../types';
import { getOrdinalSuffix } from './dateUtils';

export const DEFAULT_TEMPLATES: WishTemplate[] = [
  // Birthday templates
  {
    id: 'bday-heartfelt',
    occasion: 'birthday',
    tone: 'heartfelt',
    title: 'Heartfelt & Warm',
    template: `*Happy Birthday, {name}!* 🎂✨

Wishing you a day filled with laughter, love, and all your favorite things! May this coming year bring you boundless happiness, great health, and remarkable accomplishments.

Thank you for always being such a wonderful person. Enjoy every moment of your special day! 🎉🥂

{sender}`,
  },
  {
    id: 'bday-playful',
    occasion: 'birthday',
    tone: 'playful',
    title: 'Fun & Playful',
    template: `Happy Birthday {name}! 🥳🎈

Another year wiser, bolder, and still absolutely fabulous! May your day be packed with cake, good vibes, zero stress, and endless reasons to smile. 🍰🍾

Let's celebrate soon! Cheers to you! 🥂✨

{sender}`,
  },
  {
    id: 'bday-festive',
    occasion: 'birthday',
    tone: 'festive',
    title: 'Warm & Festive Blessings',
    template: `🎉 *Janamdin ki Hardik Shubhkamnayein {name}!* 🎂✨

May God shower you with abundant happiness, good health, peace, and prosperity on your birthday and every day forward! 

Have an unforgettable celebration with family & friends! 🎈💐

{sender}`,
  },
  {
    id: 'bday-short',
    occasion: 'birthday',
    tone: 'short',
    title: 'Short & Vibrant',
    template: `*Happy Birthday {name}!* 🎂🎉 Hope you have an incredible day filled with fun and celebration. Wishing you a fantastic year ahead! 🥳✨ {sender}`,
  },

  // Anniversary templates
  {
    id: 'anniv-romantic',
    occasion: 'anniversary',
    tone: 'heartfelt',
    title: 'Couple Love & Joy',
    template: `*Happy Wedding Anniversary, {name}!* 💍🥂

Wishing you both another wonderful year of shared laughter, quiet comfort, and exciting adventures together. May your love and bond grow deeper with each passing year!

Happy Anniversary to an extraordinary couple! ❤️✨

{sender}`,
  },
  {
    id: 'anniv-milestone',
    occasion: 'anniversary',
    tone: 'milestone',
    title: 'Milestone Celebration',
    template: `🥂 *Celebrating a Glorious Wedding Anniversary!* 🥂

*Happy Anniversary, {name}!* 💍✨

Years of walking hand in hand, building a beautiful life, and inspiring everyone around you with your patience, warmth, and enduring companionship.

May your celebration today be filled with joy and fond memories, and may the years ahead be even brighter! 🌹🎉

With warmest wishes,
{sender}`,
  },
  {
    id: 'anniv-playful',
    occasion: 'anniversary',
    tone: 'playful',
    title: 'Playful & Cheers',
    template: `Happy Anniversary {name}! 🍾🎉

Cheers to surviving another 365 days of tolerating each other's quirks and still looking like a dream team! 😂❤️

Hope you celebrate with great food, wonderful memories, and zero chores today! Happy Anniversary! 🥂🍰

{sender}`,
  },
  {
    id: 'anniv-festive',
    occasion: 'anniversary',
    tone: 'festive',
    title: 'Warm & Festive Wishes',
    template: `🌹 *Shaadi ki Salgirah ki Bahut Bahut Badhaiyan {name}!* 🌹

Wishing you both a joyous celebration of your wonderful bond! Praying for your continuous health, harmony, and togetherness for many more decades to come! 💐✨

Warmly,
{sender}`,
  },

  // Other Occasions (Festivals, Milestones, Custom Reminders)
  {
    id: 'other-festive',
    occasion: 'other',
    tone: 'festive',
    title: 'Festive Blessings & Warm Greetings',
    template: `✨ *Warm Greetings & Heartfelt Wishes, {name}!* 🪔💐

Wishing you and your loved ones an auspicious celebration filled with peace, boundless joy, prosperity, and harmony. 

May every day ahead illuminate your path with health and happiness! 🌟🎉

Warmest regards,
{sender}`,
  },
  {
    id: 'other-milestone',
    occasion: 'other',
    tone: 'milestone',
    title: 'Achievement & Milestone Celebration',
    template: `🏆 *Huge Congratulations, {name}!* 🌟✨

Celebrating your remarkable milestone and accomplishments! Your dedication, resilience, and vision continue to be truly inspiring. 

Wishing you even greater heights of success, fulfillment, and recognition in the journey ahead! 🥂👏

Best wishes,
{sender}`,
  },
  {
    id: 'other-heartfelt',
    occasion: 'other',
    tone: 'heartfelt',
    title: 'Heartfelt Appreciation & Well-Wishes',
    template: `Warmest thoughts and best wishes to you, *{name}*! 💐✨

Sending you lots of positive energy, good health, and success in everything you undertake. Thank you for being such an inspiration! 

Have a wonderful and blessed time ahead! 🌟

{sender}`,
  },

  // Combo Double Celebration
  {
    id: 'combo-special',
    occasion: 'combo',
    tone: 'heartfelt',
    title: 'Double Celebration (Bday + Anniv)',
    template: `🌟 *Double the Joy, Double the Celebration!* 🌟

*Happy Birthday & Happy Wedding Anniversary, {name}!* 🎂💍✨

Today is doubly blessed! Wishing you boundless personal happiness and good health on your Birthday, and eternal love, laughter, and togetherness on your Wedding Anniversary! 

May this extraordinary day bring you double the smiles and unforgettable memories! 🎉🥂

{sender}`,
  },
];

export function resolveMessage(
  celebrant: Celebrant,
  templateString: string,
  senderName: string = ''
): string {
  if (!celebrant) return templateString;

  const yearsDisplay = celebrant.years
    ? getOrdinalSuffix(celebrant.years)
    : celebrant.occasion === 'anniversary'
    ? 'Wedding'
    : '';

  const senderSignOff = senderName.trim() ? `— ${senderName.trim()}` : '';

  let occasionLabel = 'Birthday';
  if (celebrant.occasion === 'anniversary') occasionLabel = 'Anniversary';
  if (celebrant.occasion === 'other') occasionLabel = celebrant.eventTitle || 'Special Celebration';
  if (celebrant.occasion === 'combo') occasionLabel = 'Birthday & Anniversary';

  return templateString
    .replace(/\{name\}/g, celebrant.name || 'Friend')
    .replace(/\{occasion\}/g, occasionLabel)
    .replace(/\{years\}/g, yearsDisplay || '')
    .replace(/\{relationship\}/g, celebrant.relationship.toLowerCase() || 'family')
    .replace(/\{date\}/g, celebrant.displayDate || celebrant.date || '')
    .replace(/\{note\}/g, celebrant.notes ? `\n_${celebrant.notes}_` : '')
    .replace(/\{sender\}/g, senderSignOff)
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}
