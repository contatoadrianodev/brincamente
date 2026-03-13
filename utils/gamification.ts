export function calculateXP(correct: number, wrong: number, difficulty: number): number {
  const base = correct * 10 * difficulty
  const penalty = wrong * 2
  return Math.max(0, base - penalty)
}

export function calculateCoins(score: number, difficulty: number): number {
  return Math.floor((score / 100) * 5 * difficulty)
}

export function calculateStars(correct: number, total: number): number {
  const pct = total > 0 ? (correct / total) * 100 : 0
  if (pct >= 90) return 3
  if (pct >= 60) return 2
  if (pct >= 30) return 1
  return 0
}

export function xpForNextLevel(level: number): number {
  return level * 100 + (level - 1) * 50
}

export function levelFromXP(xp: number): number {
  let level = 1
  let required = 100
  let total = 0
  while (total + required <= xp) {
    total += required
    level++
    required = level * 100 + (level - 1) * 50
  }
  return level
}

export function getAgeGroup(age: number): '3-5' | '6-8' | '9-12' {
  if (age <= 5) return '3-5'
  if (age <= 8) return '6-8'
  return '9-12'
}

export function adaptDifficulty(correctRate: number, currentDifficulty: number): number {
  if (correctRate >= 0.9 && currentDifficulty < 5) return currentDifficulty + 1
  if (correctRate < 0.4 && currentDifficulty > 1) return currentDifficulty - 1
  return currentDifficulty
}

export const AVATAR_OPTIONS = [
  { id: 'bear',     emoji: '🐻', name: 'Urso'     },
  { id: 'cat',      emoji: '🐱', name: 'Gato'     },
  { id: 'dog',      emoji: '🐶', name: 'Cachorro' },
  { id: 'rabbit',   emoji: '🐰', name: 'Coelho'   },
  { id: 'fox',      emoji: '🦊', name: 'Raposa'   },
  { id: 'penguin',  emoji: '🐧', name: 'Pinguim'  },
  { id: 'unicorn',  emoji: '🦄', name: 'Unicórnio'},
  { id: 'dragon',   emoji: '🐲', name: 'Dragão'   },
  { id: 'owl',      emoji: '🦉', name: 'Coruja'   },
  { id: 'lion',     emoji: '🦁', name: 'Leão'     },
  { id: 'tiger',    emoji: '🐯', name: 'Tigre'    },
  { id: 'elephant', emoji: '🐘', name: 'Elefante' },
]

export function getAvatarEmoji(avatarId: string): string {
  return AVATAR_OPTIONS.find(a => a.id === avatarId)?.emoji ?? '🐻'
}
