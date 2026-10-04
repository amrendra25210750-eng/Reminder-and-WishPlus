import { GoogleGenAI } from '@google/genai';
import { Celebrant } from '../types';
import { getOrdinalSuffix } from './dateUtils';

export async function generateAIEnhancedWish(
  celebrant: Celebrant,
  tone: string,
  extraPrompt: string = '',
  senderName: string = ''
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  // Fallback if no API key is present
  if (!apiKey) {
    const yearsText = celebrant.years ? `${getOrdinalSuffix(celebrant.years)} ` : '';
    const occText = celebrant.occasion === 'birthday' ? 'Birthday' : 'Wedding Anniversary';
    return `*Happy ${yearsText}${occText}, ${celebrant.name}!* 🎉🥂\n\nWishing you boundless moments of joy, good health, and memorable celebrations today and in the entire year ahead. You bring so much energy and warmth to everyone around you!\n\n${celebrant.notes ? `PS: Celebrating ${celebrant.notes}! ✨\n\n` : ''}${senderName ? `Warmest wishes,\n${senderName}` : 'Have a phenomenal day! 🎂'}`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const yearsDisplay = celebrant.years ? `${getOrdinalSuffix(celebrant.years)} ` : '';
    const prompt = `Write a personalized WhatsApp message for a ${celebrant.occasion === 'birthday' ? 'Birthday' : 'Wedding Anniversary'}.
Details:
- Recipient Name: ${celebrant.name}
- Occasion: ${celebrant.occasion} (${yearsDisplay}${celebrant.occasion})
- Relationship: ${celebrant.relationship}
- Personal notes or memories: ${celebrant.notes || 'None'}
- Desired Tone: ${tone} (e.g. heartfelt, humorous, poetic, respectful)
- Sender Name: ${senderName || 'A close friend'}
${extraPrompt ? `- Additional user instruction: ${extraPrompt}` : ''}

Format rules for WhatsApp:
1. Use WhatsApp styling (*bold* for key phrases, _italics_ for emotional touches).
2. Keep it engaging, authentic, and naturally human with celebratory emojis (🎉, 🎂, 🥂, 💍, ✨).
3. Do not include markdown codeblocks or quotes. Output ONLY the raw WhatsApp text ready to be sent.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) {
      return text;
    }
  } catch (err) {
    console.warn('AI generation fell back to template:', err);
  }

  // Graceful fallback
  const yearsText = celebrant.years ? `${getOrdinalSuffix(celebrant.years)} ` : '';
  const occText = celebrant.occasion === 'birthday' ? 'Birthday' : 'Wedding Anniversary';
  return `*Happy ${yearsText}${occText}, ${celebrant.name}!* 🎉🥂\n\nWishing you a magnificent celebration surrounded by family, love, and laughter! May all your hopes and dreams soar this year!\n\n${senderName ? `Warmly,\n${senderName}` : 'Cheers! 🍾'}`;
}
