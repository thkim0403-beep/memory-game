import type { ThemeKey } from '../types';
import { shuffle } from './gameLogic';
import { themes } from './themes';

/** Fetch with a 5-second timeout and res.ok check */
async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchEmojisByCategory(category: string, count: number = 16): Promise<string[]> {
  const res = await fetchWithTimeout(`https://emojihub.yurace.pro/api/all/category/${category}`);
  const data = await res.json();

  const emojis: string[] = data.map((item: { unicode: string[] }) => {
    return item.unicode
      .map((u: string) => String.fromCodePoint(parseInt(u.replace('U+', ''), 16)))
      .join('');
  });

  // Deduplicate and shuffle
  const unique = [...new Set(emojis)];
  return shuffle(unique).slice(0, count);
}

export async function fetchDogImages(count: number): Promise<{ name: string; image: string }[]> {
  const res = await fetchWithTimeout(`https://dog.ceo/api/breeds/image/random/${count}`);
  const data = await res.json();
  const images: string[] = data.message;
  return images.map((url, i) => {
    const parts = url.split('/');
    const breedIdx = parts.indexOf('breeds');
    const breed = breedIdx >= 0 ? parts[breedIdx + 1].replace('-', ' ') : `dog${i}`;
    return { name: breed, image: url };
  });
}

export async function fetchCatImages(count: number): Promise<{ name: string; image: string }[]> {
  const res = await fetchWithTimeout(`https://api.thecatapi.com/v1/images/search?limit=${count}`);
  const data = await res.json();
  return data.map((item: { id: string; url: string }) => ({
    name: `cat-${item.id}`,
    image: item.url,
  }));
}

// DiceBear CC0 avatar generators
function generateDiceBearTheme(style: string, count: number): { emojis: string[]; images: string[] } {
  const seeds = shuffle(Array.from({ length: 100 }, (_, i) => `card${i}`)).slice(0, count);
  return {
    emojis: seeds.map((s) => `${style}-${s}`),
    images: seeds.map((s) => `https://api.dicebear.com/9.x/${style}/svg?seed=${s}&size=200`),
  };
}

function generatePhotoTheme(count: number): { emojis: string[]; images: string[] } {
  const ids = shuffle(Array.from({ length: 200 }, (_, i) => i + 10)).slice(0, count);
  return {
    emojis: ids.map((id) => `photo-${id}`),
    images: ids.map((id) => `https://picsum.photos/id/${id}/300/300`),
  };
}

// Flag data
const FLAG_COUNTRIES = [
  { code: 'kr', name: '한국' }, { code: 'us', name: '미국' }, { code: 'jp', name: '일본' },
  { code: 'gb', name: '영국' }, { code: 'fr', name: '프랑스' }, { code: 'de', name: '독일' },
  { code: 'it', name: '이탈리아' }, { code: 'es', name: '스페인' }, { code: 'br', name: '브라질' },
  { code: 'ca', name: '캐나다' }, { code: 'au', name: '호주' }, { code: 'in', name: '인도' },
  { code: 'mx', name: '멕시코' }, { code: 'tr', name: '튀르키예' }, { code: 'th', name: '태국' },
  { code: 'vn', name: '베트남' },
];

function loadFlagTheme(pairs: number): { emojis: string[]; images: string[] } {
  const selected = shuffle([...FLAG_COUNTRIES]).slice(0, pairs);
  return {
    emojis: selected.map((c) => c.name),
    images: selected.map((c) => `https://flagcdn.com/w320/${c.code}.png`),
  };
}

// Fallback emojis in case API fails
export const fallbackEmojis: Record<string, string[]> = {
  smileys: ['😀', '😂', '🥰', '😎', '🤩', '😜', '🤗', '😇', '🥳', '😤', '🤯', '😱', '🫠', '🤪', '😴', '🤓'],
  flags: ['🇰🇷', '🇺🇸', '🇯🇵', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇧🇷', '🇨🇦', '🇦🇺', '🇮🇳', '🇲🇽', '🇹🇷', '🇹🇭', '🇻🇳'],
  food: ['🍕', '🍔', '🌮', '🍣', '🍜', '🍩', '🧁', '🍦', '🥐', '🥨', '🌭', '🥪', '🍿', '🧇', '🥞', '🍰'],
  nature: ['🌸', '🌹', '🌻', '🌺', '🌷', '🌼', '🍀', '🌿', '🌵', '🎋', '🍁', '🌾', '🪻', '🪷', '🌴', '🎍'],
  dogs: ['🐕', '🐩', '🦮', '🐕‍🦺', '🐶', '🐾', '🦴', '🏠', '🎾', '🌳', '🦊', '🐺', '🐻', '🐹', '🐰', '🐿️'],
  cats: ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐾', '🧶', '🐟', '🥛'],
  avatars: ['😀', '😎', '🤠', '🥳', '🧑‍🎤', '🧑‍🚀', '🧙', '🤴', '👸', '🧛', '🧟', '🧜', '🧝', '🦸', '🥷', '🤖'],
  photos: ['📷', '🖼️', '🏞️', '🌅', '🌄', '🏔️', '🌊', '🌺', '🌳', '🏙️', '🌉', '⛰️', '🛤️', '🌻', '🏖️', '🗻'],
  pixel: ['👾', '🎮', '🕹️', '🖥️', '💾', '🤖', '🎯', '⭐', '💫', '🌟', '🔮', '🎪', '🎨', '🧩', '🏆', '🎲'],
  monsters: ['🤖', '👾', '🛸', '⚡', '🔩', '⚙️', '🔧', '💡', '📡', '🛰️', '🔌', '💎', '🔋', '🖲️', '💻', '🧲'],
  lorelei: ['✏️', '🎨', '🖌️', '📝', '🖊️', '📒', '🎭', '👤', '💫', '✨', '🌸', '🌙', '💜', '🩷', '🤍', '💙'],
};

// ── Shared API theme loader ─────────────────────────────────

const emojiApiCategories: Record<string, string> = {
  smileys: 'smileys-and-people',
  food: 'food-and-drink',
  nature: 'animals-and-nature',
};

export async function loadApiTheme(
  themeKey: ThemeKey,
  pairs: number,
): Promise<{ emojis: string[]; images?: string[] }> {
  if (themeKey === 'flags') {
    return loadFlagTheme(pairs);
  }

  if (themeKey === 'dogs') {
    const data = await fetchDogImages(pairs);
    return { emojis: data.map((d) => d.name), images: data.map((d) => d.image) };
  }

  if (themeKey === 'cats') {
    const data = await fetchCatImages(pairs);
    return { emojis: data.map((d) => d.name), images: data.map((d) => d.image) };
  }

  if (themeKey === 'avatars') {
    return generateDiceBearTheme('adventurer', pairs);
  }

  if (themeKey === 'pixel') {
    return generateDiceBearTheme('pixel-art', pairs);
  }

  if (themeKey === 'monsters') {
    return generateDiceBearTheme('bottts', pairs);
  }

  if (themeKey === 'lorelei') {
    return generateDiceBearTheme('lorelei', pairs);
  }

  if (themeKey === 'photos') {
    return generatePhotoTheme(pairs);
  }

  const category = emojiApiCategories[themeKey];
  if (category) {
    try {
      const emojis = await fetchEmojisByCategory(category, pairs);
      if (emojis.length >= pairs) return { emojis };
    } catch {
      // fall through to fallback
    }
  }

  // Fallback
  const fb = fallbackEmojis[themeKey];
  if (fb) return { emojis: fb };
  return { emojis: themes[themeKey].emojis };
}
