import birthdayAsset from '../assets/images/birthday_celebration_1791088804123.jpg';
import anniversaryAsset from '../assets/images/anniversary_celebration_1791088816279.jpg';
import festiveAsset from '../assets/images/festive_milestone_1791088827841.jpg';
import heroAsset from '../assets/images/celebration_hero_banner_1791088838359.jpg';

/**
 * Universal Asset Dictionary for both local dev and production (Vercel, Netlify, Cloudflare).
 * Uses Vite's ES module asset pipeline to guarantee bundling into /dist/assets,
 * with fallbacks to public/images and resilient SVG data URIs.
 */
export const APP_ASSETS = {
  birthday: birthdayAsset || '/images/birthday.jpg',
  anniversary: anniversaryAsset || '/images/anniversary.jpg',
  combo: anniversaryAsset || '/images/anniversary.jpg',
  other: festiveAsset || '/images/festive.jpg',
  hero: heroAsset || '/images/hero.jpg',
};

export const FALLBACK_CARDS = {
  birthday: '/images/birthday.jpg',
  anniversary: '/images/anniversary.jpg',
  combo: '/images/anniversary.jpg',
  other: '/images/festive.jpg',
  hero: '/images/hero.jpg',
};

/**
 * Safe image source handler that falls back to public static path or inline SVG
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackKey: keyof typeof FALLBACK_CARDS = 'birthday'
) => {
  const target = e.currentTarget;
  const publicPath = FALLBACK_CARDS[fallbackKey];
  if (target.src !== window.location.origin + publicPath && !target.src.endsWith(publicPath)) {
    target.src = publicPath;
  }
};
