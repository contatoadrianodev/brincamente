export type UserRole = 'parent' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface ChildProfile {
  id: string
  user_id: string
  name: string
  age: number
  avatar: string
  level: number
  xp: number
  stars: number
  coins: number
  streak_days: number
  created_at: string
}

export type GameType = 'memory' | 'quiz' | 'drag_drop' | 'sequence'

export interface GameCategory {
  id: string
  name: string
  slug: string
  description: string
  min_age: number
  max_age: number
  icon: string
  color: string
  is_active: boolean
}

export interface Game {
  id: string
  category_id: string
  name: string
  slug: string
  type: GameType
  difficulty: number
  min_age: number
  max_age: number
  is_active: boolean
  created_at: string
}

export interface GameSession {
  id: string
  child_profile_id: string
  game_id: string
  score: number
  correct_answers: number
  wrong_answers: number
  duration_seconds: number
  completed: boolean
  created_at: string
}

export interface QuizQuestion {
  id: string
  game_id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'a' | 'b' | 'c' | 'd'
  explanation?: string
  difficulty: number
  is_active: boolean
}

export interface Achievement {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  reward_coins: number
  reward_xp: number
  is_active: boolean
}

export interface ChildAchievement {
  id: string
  child_profile_id: string
  achievement_id: string
  unlocked_at: string
  achievement?: Achievement
}

export interface DailyMission {
  id: string
  title: string
  description: string
  target_type: string
  target_value: number
  reward_coins: number
  reward_xp: number
  is_active: boolean
}

export interface ChildMission {
  id: string
  child_profile_id: string
  mission_id: string
  progress: number
  completed: boolean
  completed_at?: string
  mission?: DailyMission
}

export interface ParentSettings {
  id: string
  user_id: string
  max_daily_minutes: number
  sound_enabled: boolean
  notifications_enabled: boolean
}

export interface GameResult {
  score: number
  correct: number
  wrong: number
  duration: number
  stars: number
  xpEarned: number
  coinsEarned: number
}
