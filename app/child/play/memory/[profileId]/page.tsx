'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { calculateXP, calculateCoins, calculateStars } from '@/utils/gamification'
import { ArrowLeft, Timer } from 'lucide-react'

const CARD_SETS = [
  ['🐱','🐶','🐸','🐵','🐧','🦊','🐻','🐨'],
  ['🍎','🍌','🍓','🍇','🍊','🍋','🍒','🍑'],
  ['⭐','🌙','☀️','🌈','⚡','🌸','🎵','💎'],
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

type Card = { id: number; emoji: string; matched: boolean; flipped: boolean }

export default function MemoryGame() {
  const { profileId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState(0)
  const [moves, setMoves] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [time, setTime] = useState(0)
  const [done, setDone] = useState(false)
  const [difficulty, setDifficulty] = useState(0) // index into CARD_SETS
  const [started, setStarted] = useState(false)

  const initGame = useCallback((diff: number) => {
    const set = CARD_SETS[diff].slice(0, 6)
    const pairs = shuffle([...set, ...set].map((emoji, i) => ({ id: i, emoji, matched: false, flipped: false })))
    setCards(pairs); setFlipped([]); setMatched(0); setMoves(0); setWrong(0); setTime(0); setDone(false)
  }, [])

  useEffect(() => { initGame(difficulty) }, [difficulty])

  useEffect(() => {
    if (!started || done) return
    const t = setInterval(() => setTime(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [started, done])

  function flip(id: number) {
    if (!started) setStarted(true)
    const card = cards[id]
    if (card.matched || card.flipped || flipped.length >= 2) return

    const newFlipped = [...flipped, id]
    setCards(prev => prev.map((c, i) => i === id ? { ...c, flipped: true } : c))
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = newFlipped
      if (cards[a].emoji === card.emoji && a !== id) {
        // match
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => newFlipped.includes(i) ? { ...c, matched: true } : c))
          setFlipped([])
          const newMatched = matched + 1
          setMatched(newMatched)
          if (newMatched === cards.length / 2) { setDone(true) }
        }, 600)
      } else {
        setWrong(w => w + 1)
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => newFlipped.includes(i) ? { ...c, flipped: false } : c))
          setFlipped([])
        }, 900)
      }
    }
  }

  async function saveResult() {
    const total = cards.length / 2
    const xp    = calculateXP(matched, wrong, difficulty + 1)
    const coins = calculateCoins(Math.round((matched / total) * 100), difficulty + 1)
    const stars = calculateStars(matched, total)

    await supabase.rpc('save_game_result', {
      p_profile_id: profileId,
      p_game_type:  'memory',
      p_score:      Math.round((matched / total) * 100),
      p_correct:    matched,
      p_wrong:      wrong,
      p_duration:   time,
      p_xp:         xp,
      p_coins:      coins,
      p_stars:      stars,
    })
  }

  useEffect(() => { if (done) saveResult() }, [done])

  const total = cards.length / 2

  return (
    <div className="page-child min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="bg-white rounded-xl p-2 shadow-md hover:shadow-lg transition-shadow">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-800">🧠 Jogo da Memória</h1>
          <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-2 shadow-md text-sm font-bold text-gray-600">
            <Timer className="w-4 h-4" /> {time}s
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
            <div className="text-2xl font-black text-green-500">{matched}</div>
            <div className="text-xs text-gray-500 font-medium">Pares</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
            <div className="text-2xl font-black text-blue-500">{moves}</div>
            <div className="text-xs text-gray-500 font-medium">Tentativas</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
            <div className="text-2xl font-black text-purple-500">{total}</div>
            <div className="text-xs text-gray-500 font-medium">Total pares</div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex gap-2 mb-6">
          {['Fácil','Médio','Difícil'].map((d, i) => (
            <button key={d} onClick={() => setDifficulty(i)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${difficulty === i ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-blue-50'}`}>
              {d}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card, i) => (
            <motion.button
              key={card.id}
              onClick={() => flip(i)}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center shadow-md transition-all
                ${card.matched ? 'bg-green-100 border-2 border-green-400' : card.flipped ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gradient-to-br from-blue-400 to-purple-500 text-transparent'}`}
            >
              {(card.flipped || card.matched) ? card.emoji : '❓'}
            </motion.button>
          ))}
        </div>

        {/* Win overlay */}
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Parabéns!</h2>
                <p className="text-gray-500 mb-2">Você encontrou todos os {total} pares!</p>
                <div className="flex justify-center gap-1 text-3xl mb-4">
                  {Array.from({ length: calculateStars(matched, total) }).map((_, i) => <span key={i}>⭐</span>)}
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Tentativas:</span><strong>{moves}</strong></div>
                  <div className="flex justify-between"><span>Tempo:</span><strong>{time}s</strong></div>
                  <div className="flex justify-between text-green-600"><span>XP ganho:</span><strong>+{calculateXP(matched, wrong, difficulty + 1)}</strong></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => initGame(difficulty)} className="flex-1 btn-secondary py-3">Jogar de novo</button>
                  <button onClick={() => router.back()} className="flex-1 btn-primary py-3">Voltar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
