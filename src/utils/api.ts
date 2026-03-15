import type { ThemeKey } from '../types';
import { shuffle } from './gameLogic';
import { themes } from './themes';

export interface PokemonCard {
  name: string;
  image: string;
}

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

export async function fetchPokemonData(count: number): Promise<PokemonCard[]> {
  const res = await fetchWithTimeout('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data = await res.json();

  const shuffled = shuffle(data.results as { name: string; url: string }[]);
  const selected = shuffled.slice(0, count);

  return selected.map((pokemon) => {
    const id = pokemon.url.split('/').filter(Boolean).pop();
    return {
      name: pokemon.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    };
  });
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
    // Extract breed from URL: .../breeds/hound-afghan/...
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

export async function fetchDigimonData(count: number): Promise<{ name: string; image: string }[]> {
  const res = await fetchWithTimeout('https://digimon-api.vercel.app/api/digimon');
  const data = await res.json();
  const shuffled = shuffle(data as { name: string; img: string }[]);
  return shuffled.slice(0, count).map((d) => ({ name: d.name, image: d.img }));
}

export async function fetchDragonBallData(count: number): Promise<{ name: string; image: string }[]> {
  const res = await fetchWithTimeout(`https://dragonball-api.com/api/characters?limit=50`);
  const data = await res.json();
  const chars = shuffle(data.items as { name: string; image: string }[]);
  return chars.slice(0, count).map((c) => ({ name: c.name, image: c.image }));
}

function generateAvatarTheme(count: number): { emojis: string[]; images: string[] } {
  const styles = ['adventurer', 'bottts', 'fun-emoji', 'lorelei', 'notionists', 'thumbs'];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seeds = shuffle(Array.from({ length: 100 }, (_, i) => `seed${i}`)).slice(0, count);
  return {
    emojis: seeds.map((s) => `${style}-${s}`),
    images: seeds.map((s) => `https://api.dicebear.com/9.x/${style}/svg?seed=${s}&size=200`),
  };
}

export async function fetchFoxImages(count: number): Promise<{ name: string; image: string }[]> {
  const promises = Array.from({ length: count }, async (_, i) => {
    const res = await fetchWithTimeout('https://randomfox.ca/floof/');
    const data = await res.json();
    return { name: `fox-${i}`, image: data.image as string };
  });
  return Promise.all(promises);
}

export async function fetchHarryPotterData(count: number): Promise<{ name: string; image: string }[]> {
  const res = await fetchWithTimeout('https://hp-api.onrender.com/api/characters');
  const data = await res.json();
  const withImage = (data as { name: string; image: string }[]).filter((c) => c.image);
  const selected = shuffle(withImage).slice(0, count);
  return selected.map((c) => ({ name: c.name, image: c.image }));
}

export async function fetchNarutoData(count: number): Promise<{ name: string; image: string }[]> {
  const res = await fetchWithTimeout('https://narutodb.xyz/api/character?page=1&limit=50');
  const data = await res.json();
  const chars = (data.characters as { name: string; images: string[] }[]).filter((c) => c.images.length > 0);
  const selected = shuffle(chars).slice(0, count);
  return selected.map((c) => ({ name: c.name, image: c.images[0] }));
}

function generatePhotoTheme(count: number): { emojis: string[]; images: string[] } {
  const ids = shuffle(Array.from({ length: 200 }, (_, i) => i + 10)).slice(0, count);
  return {
    emojis: ids.map((id) => `photo-${id}`),
    images: ids.map((id) => `https://picsum.photos/id/${id}/300/300`),
  };
}

// Fallback emojis in case API fails
export const fallbackEmojis: Record<string, string[]> = {
  smileys: ['😀', '😂', '🥰', '😎', '🤩', '😜', '🤗', '😇', '🥳', '😤', '🤯', '😱', '🫠', '🤪', '😴', '🤓'],
  flags: ['🇰🇷', '🇺🇸', '🇯🇵', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇧🇷', '🇨🇦', '🇦🇺', '🇮🇳', '🇲🇽', '🇹🇷', '🇹🇭', '🇻🇳'],
  food: ['🍕', '🍔', '🌮', '🍣', '🍜', '🍩', '🧁', '🍦', '🥐', '🥨', '🌭', '🥪', '🍿', '🧇', '🥞', '🍰'],
  nature: ['🌸', '🌹', '🌻', '🌺', '🌷', '🌼', '🍀', '🌿', '🌵', '🎋', '🍁', '🌾', '🪻', '🪷', '🌴', '🎍'],
  pokemon: ['🐭', '🔥', '🐢', '🦋', '⚡', '🐱', '🦆', '🐍', '👻', '🐉', '🌊', '🪨', '🌿', '🎃', '🐦', '🐻'],
  dogs: ['🐕', '🐩', '🦮', '🐕‍🦺', '🐶', '🐾', '🦴', '🏠', '🎾', '🌳', '🦊', '🐺', '🐻', '🐹', '🐰', '🐿️'],
  cats: ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐾', '🧶', '🐟', '🥛'],
  digimon: ['🐲', '🦎', '🐉', '🔥', '💧', '🌿', '⚡', '💀', '👾', '🦅', '🐺', '🦁', '🐻', '🦊', '🐸', '🦋'],
  dragonball: ['🐉', '⭐', '🔥', '💪', '👊', '🌍', '☁️', '⚡', '🏔️', '🧙', '🐵', '🤖', '👹', '💫', '🌀', '🔮'],
  avatars: ['😀', '😎', '🤠', '🥳', '🧑‍🎤', '🧑‍🚀', '🧙', '🤴', '👸', '🧛', '🧟', '🧜', '🧝', '🦸', '🥷', '🤖'],
  foxes: ['🦊', '🐺', '🐕', '🌲', '🍂', '🍁', '🌾', '🏔️', '🌙', '⭐', '🐾', '🐿️', '🦔', '🐇', '🦉', '🌿'],
  harrypotter: ['🧙', '⚡', '🦉', '🏰', '🧹', '🪄', '📚', '🐍', '🦁', '🦡', '🦅', '🔮', '⚗️', '🕯️', '🧣', '👻'],
  naruto: ['🍥', '🥷', '👁️', '🔥', '💨', '⚡', '🐸', '🐍', '🌀', '💀', '🎭', '📜', '🗡️', '🌙', '☁️', '🦊'],
  photos: ['📷', '🖼️', '🏞️', '🌅', '🌄', '🏔️', '🌊', '🌺', '🌳', '🏙️', '🌉', '⛰️', '🛤️', '🌻', '🏖️', '🗻'],
};

// ── Shared API theme loader ─────────────────────────────────

const emojiApiCategories: Record<string, string> = {
  smileys: 'smileys-and-people',
  food: 'food-and-drink',
  nature: 'animals-and-nature',
};

// Flag data: country code -> name
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

export async function loadApiTheme(
  themeKey: ThemeKey,
  pairs: number,
): Promise<{ emojis: string[]; images?: string[] }> {
  if (themeKey === 'pokemon') {
    const data = await fetchPokemonData(pairs);
    return {
      emojis: data.map((p) => p.name),
      images: data.map((p) => p.image),
    };
  }

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

  if (themeKey === 'digimon') {
    const data = await fetchDigimonData(pairs);
    return { emojis: data.map((d) => d.name), images: data.map((d) => d.image) };
  }

  if (themeKey === 'dragonball') {
    const data = await fetchDragonBallData(pairs);
    return { emojis: data.map((d) => d.name), images: data.map((d) => d.image) };
  }

  if (themeKey === 'avatars') {
    return generateAvatarTheme(pairs);
  }

  if (themeKey === 'foxes') {
    const data = await fetchFoxImages(pairs);
    return { emojis: data.map((d) => d.name), images: data.map((d) => d.image) };
  }

  if (themeKey === 'harrypotter') {
    const data = await fetchHarryPotterData(pairs);
    return { emojis: data.map((d) => d.name), images: data.map((d) => d.image) };
  }

  if (themeKey === 'naruto') {
    const data = await fetchNarutoData(pairs);
    return { emojis: data.map((d) => d.name), images: data.map((d) => d.image) };
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
