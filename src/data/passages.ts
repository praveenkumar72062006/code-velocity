export interface Passage {
  id: string;
  category: 'quote' | 'code' | 'speed' | 'custom';
  title: string;
  language?: string;
  text: string;
  author?: string;
}

export const DEFAULT_PASSAGES: Passage[] = [
  {
    id: 'quote-1',
    category: 'quote',
    title: 'The Road Ahead',
    author: 'Robert Frost',
    text: 'Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.',
  },
  {
    id: 'quote-2',
    category: 'quote',
    title: 'Speed & Gravity',
    author: 'Albert Einstein',
    text: 'Life is like riding a bicycle. To keep your balance, you must keep moving forward with precision and speed.',
  },
  {
    id: 'quote-3',
    category: 'quote',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    text: 'So we beat on, boats against the current, borne back ceaselessly into the past.',
  },
  {
    id: 'quote-4',
    category: 'quote',
    title: 'Steve Jobs 2005',
    author: 'Steve Jobs',
    text: 'Stay hungry, stay foolish. Never settle for good enough when exceptional is within your reach.',
  },
  {
    id: 'code-1',
    category: 'code',
    title: 'Async Race Function (TypeScript)',
    language: 'typescript',
    text: 'async function raceLap(speed: number): Promise<boolean> { const velocity = speed * 1.5; return velocity > 100; }',
  },
  {
    id: 'code-2',
    category: 'code',
    title: 'Array Filter & Map (JavaScript)',
    language: 'javascript',
    text: 'const fastDrivers = racers.filter(r => r.wpm >= 90).map(r => ({ name: r.name, rank: r.placement }));',
  },
  {
    id: 'code-3',
    category: 'code',
    title: 'Python Binary Search',
    language: 'python',
    text: 'def binary_search(arr, target): low, high = 0, len(arr) - 1 while low <= high: mid = (low + high) // 2',
  },
  {
    id: 'speed-1',
    category: 'speed',
    title: 'Punctuation & Numbers Sprint',
    text: 'Server 10.0.4.12 pinged at 42ms! Did user #89 achieve 120 WPM? Yes, with 99.8% precision.',
  },
  {
    id: 'speed-2',
    category: 'speed',
    title: 'Home Row Anchor Test',
    text: 'Fast fingers flash across the keyboard with total focus and relentless momentum.',
  },
];

// Helper to generate custom drills based on user's worst keys
export function generateWeakKeyDrill(problemKeys: string[]): string {
  if (!problemKeys.length) {
    return 'The quick brown fox jumps over the lazy dog repeatedly until perfection is attained.';
  }

  const dictionary = [
    'quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'blazing', 'phantom', 'cyber',
    'velocity', 'quartz', 'sphinx', 'glyph', 'vexed', 'jackpot', 'wizard', 'frequent',
    'keyboard', 'racer', 'turbo', 'nitro', 'acceleration', 'championship', 'victory'
  ];

  // Pick words that contain any of the problem keys
  const matchingWords = dictionary.filter(word => 
    problemKeys.some(key => word.toLowerCase().includes(key.toLowerCase()))
  );

  const pool = matchingWords.length >= 4 ? matchingWords : dictionary;
  const drillWords: string[] = [];
  for (let i = 0; i < 16; i++) {
    drillWords.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return drillWords.join(' ');
}
