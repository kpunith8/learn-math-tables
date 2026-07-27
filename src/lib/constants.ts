export const SVG_CONFIG = {
  WIDTH: 280,
  PADDING: 20,
  MAX_PER_ROW: 5,
  CIRCLE_SIZE: 44,
  ROW_HEIGHT: 56,
  TOP_PAD: 30,
  BOTTOM_PAD: 24,
  FONT_SIZE: 0.75,
  MIN_FONT: 10,
  GROUP_FONT: 11,
  CIRCLE_MAX: 20,
  STROKE: '#ddd',
  STROKE_WIDTH: 1,
};

export const CONFETTI_CONFIG = {
  SPARKLE_COUNT: 36,
  DURATION: 4500,
  DELAY_RANGE: 1.5,
  MIN_SIZE: 16,
  MAX_SIZE: 40,
};

export interface Character {
  name: string;
  item: string;
  emoji: string;
  color: string;
}

export const CHARACTERS: Record<number, Character> = {
  1: { name: "Una the Unicorn", item: "horn", emoji: "\u{1F984}", color: "#9B59B6" },
  2: { name: "Bella the Butterfly", item: "wings", emoji: "\u{1F98B}", color: "#FF6B6B" },
  3: { name: "Timmy the Turtle", item: "spots", emoji: "\u{1F422}", color: "#1D9E75" },
  4: { name: "Felix the Frog", item: "legs", emoji: "\u{1F438}", color: "#2E7D32" },
  5: { name: "Stella the Starfish", item: "arms", emoji: "\u2B50", color: "#BA7517" },
  6: { name: "Bella the Bee", item: "legs", emoji: "\u{1F41D}", color: "#F57F17" },
  7: { name: "Ricky the Rainbow", item: "colors", emoji: "\u{1F308}", color: "#7B1FA2" },
  8: { name: "Otto the Octopus", item: "arms", emoji: "\u{1F419}", color: "#1565C0" },
  9: { name: "Nora the Ninja Cat", item: "lives", emoji: "\u{1F431}", color: "#880E4F" },
  10: { name: "Abby the Apple", item: "seeds", emoji: "\u{1F34E}", color: "#A32D2D" },
  11: { name: "Daisy the Dolphin", item: "leaps", emoji: "\u{1F42C}", color: "#0277BD" },
  12: { name: "Percy the Penguin", item: "waddles", emoji: "\u{1F427}", color: "#37474F" },
  13: { name: "Wally the Walrus", item: "tusks", emoji: "\u{1F9DC}", color: "#8D6E63" },
  14: { name: "Hazel the Hedgehog", item: "spikes", emoji: "\u{1F994}", color: "#A1887F" },
  15: { name: "Finn the Fox", item: "tricks", emoji: "\u{1F98A}", color: "#E65100" },
  16: { name: "Pippa the Panda", item: "bamboo stalks", emoji: "\u{1F43C}", color: "#424242" },
  17: { name: "Rusty the Rooster", item: "crows", emoji: "\u{1F413}", color: "#BF360C" },
  18: { name: "Shelly the Sheep", item: "woolly puffs", emoji: "\u{1F411}", color: "#78909C" },
  19: { name: "Monty the Moose", item: "antlers", emoji: "\u{1F98C}", color: "#4E342E" },
  20: { name: "Zara the Zebra", item: "stripes", emoji: "\u{1F993}", color: "#212121" },
};

export const SPARKLE_EMOJIS = ['\u2728', '\u{1F31F}', '\u2B50', '\u{1F389}', '\u{1F38A}', '\u{1F4AB}', '\u{1F308}', '\u{1F4A5}'];

export const FUN_FACTS = [
  '\u{1F98B} A group of butterflies is called a "kaleidoscope"!',
  '\u{1F422} Sea turtles have been around since the time of dinosaurs \u2014 over 100 million years!',
  '\u{1F41D} Bees waggle-dance to tell each other where flowers are!',
  '\u{1F984} Unicorns are the national animal of Scotland!',
  '\u{1F438} Frogs can jump up to 20 times their own body length!',
  '\u2B50 Starfish can regrow lost arms!',
  '\u{1F308} Rainbows are actually full circles \u2014 we only see half from the ground!',
  '\u{1F419} Octopuses have three hearts and blue blood!',
  '\u{1F431} Cats spend about 70% of their lives sleeping!',
  '\u{1F34E} Apples float in water because they are 25% air!',
  '\u{1F33F} Plants use sunlight to make their own food \u2014 it\'s called photosynthesis!',
  '\u{1F30A} The ocean covers more than 70% of Earth\'s surface!',
  '\u{1F30D} There are more stars in space than grains of sand on all the beaches on Earth!',
  '\u2601\uFE0F Clouds can weigh over a million pounds!',
  '\u{1F31E} The Sun is about 93 million miles away from Earth!',
];

export type Difficulty = 'easy' | 'normal' | 'hard';

export const STORAGE_KEY = 'mathAdventure';
export const NAME_STORAGE_KEY = 'mathAdvName';
export const LEADERBOARD_STORAGE_KEY = 'mathAdvLeaderboard';
