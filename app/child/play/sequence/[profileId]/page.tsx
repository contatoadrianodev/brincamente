'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { calculateXP, calculateCoins, calculateStars } from '@/utils/gamification'
import { ArrowLeft } from 'lucide-react'

type Level = { sequence: (string | number)[]; missing: number; options: (string | number)[] }

function genNumLevel(difficulty: number): Level {
  const start = Math.floor(Math.random() * 10)
  const step = difficulty <= 2 ? 1 : difficulty === 3 ? 2 : Math.floor(Math.random() * 3) + 2
  const seq = Array.from({ length: 5 }, (_, i) => start + i * step)
  const missing = Math.floor(Math.random() * 3) + 1 // index 1-3
  const correct = seq[missing]
  const wrong1 = correct + step + 1
  const wrong2 = correct - 1
  const wrong3 = correct + 2
  const opts = [correct, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5)
  return { sequence: seq, missing, options: opts }
}

function genEmojiLevel(): Level {
  const sets = [
    ['🔴','🔵','🟡','🟢','🟠'],
    ['⭐','🌙','☀️','⚡','🌈'],
    ['🐱','🐶','🐸','🐵','🐧'],
    ['🍎','🍌','🍓','🍇','🍊'],
  ]
  const set = sets[Math.floor(Math.random() * sets.length)]
  const seq = Array.from({ length: 5 }, (_, i) => set[i % set.length])
  const missing = Math.floor(Math.random() * 3) + 1
  const correct = seq[missing]
  const opts = [...new Set([correct, ...set.filter(x => x !== correct)].slice(0, 4))].sort(() => Math.random() - 0.5)
  return { sequence: seq, missing, options: opts }
}

export default function SequenceGame() {
  const { profileId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [difficulty, setDifficulty] = useState(1)
  const [level, setLevel] = useState<Level>(() => genNumLevel(1))
  const [selected, setSelected] = useState<string | number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [done, setDone] = useState(false)
  const [mode, setMode] = useState<'numbers' | 'emojis'>('numbers')

  function newLevel() {
    setLevel(mode === 'numbers' ? genNumLevel(difficulty) : genEmojiLevel())
    setSelected(null); setAnswered(false)
  }

  async function saveResult(finalScore: number) {
    const xp    = calculateXP(finalScore, 8 - finalScore, difficulty)
    const coins = calculateCoins(Math.round((finalScore / 8) * 100), difficulty)
    const stars = calculateStars(finalScore, 8)

    await supabase.rpc('save_game_result', {
      p_profile_id: profileId,
      p_game_type:  'sequence',
      p_score:      Math.round((finalScore / 8) * 100),
      p_correct:    finalScore,
      p_wrong:      8 - finalScore,
      p_duration:   0,
      p_xp:         xp,
      p_coins:      coins,
      p_stars:      stars,
    })
  }

  function answer(opt: string | number) {
    if (answered) return
    setSelected(opt); setAnswered(true)
    const isCorrect = opt === level.sequence[level.missing]
    const newScore = isCorrect ? score + 1 : score
    if (isCorrect) setScore(newScore)
    const newTotal = total + 1
    setTotal(newTotal)
    if (newTotal >= 8) { setDone(true); saveResult(newScore) }
  }

  useEffect(() => { newLevel() }, [mode, difficulty])

  const stars = calculateStars(score, 8)

  return (
    <div className="page-child min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="bg-white rounded-xl p-2 shadow-md"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-xl font-black text-gray-800">🔢 Sequência</h1>
          <div className="bg-white rounded-xl px-3 py-2 shadow-md text-sm font-bold">{total}/8</div>
        </div>

        {/* Mode & difficulty */}
        <div className="flex gap-3 mb-4">
          {['numbers','emojis'].map(m => (
            <button key={m} onClick={() => { setMode(m as 'numbers'|'emojis'); setTotal(0); setScore(0); setDone(false) }}
              className={`flex-1 py-2 rounded-xl font-bold text-sm ${mode === m ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
              {m === 'numbers' ? '🔢 Números' : '🎨 Emojis'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {['Fácil','Médio','Difícil'].map((d, i) => (
            <button key={d} onClick={() => setDifficulty(i + 1)}
              className={`flex-1 py-2 rounded-xl font-bold text-xs ${difficulty === i + 1 ? 'bg-purple-500 text-white' : 'bg-white text-gray-500'}`}>
              {d}
            </button>
          ))}
        </div>

        {!done ? (
          <AnimatePresence mode="wait">
            <motion.div key={total} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                <p className="text-center text-gray-500 font-medium mb-4">Qual número/emoji completa a sequência?</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {level.sequence.map((item, i) => (
                    <div key={i} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md
                      ${i === level.missing
                        ? answered
                          ? selected === level.sequence[level.missing] ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-400'
                          : 'bg-blue-100 border-2 border-dashed border-blue-400'
                        : 'bg-gradient-to-br from-purple-100 to-blue-100 text-gray-800'}`}>
                      {i === level.missing ? (answered ? item : '?') : item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {level.options.map((opt, i) => {
                  const isCorrect = opt === level.sequence[level.missing]
                  const isSelected = opt === selected
                  let cls = 'bg-white border-2 border-gray-200 hover:border-blue-400'
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-100 border-2 border-green-500'
                    else if (isSelected) cls = 'bg-red-100 border-2 border-red-400'
                    else cls = 'bg-gray-50 border-2 border-gray-200 opacity-50'
                  }
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => answer(opt)}
                      className={`${cls} rounded-2xl p-4 text-2xl font-black text-gray-800 shadow-md transition-all`}>
                      {opt} {answered && isCorrect && '✅'} {answered && isSelected && !isCorrect && '❌'}
                    </motion.button>
                  )
                })}
              </div>

              {answered && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={newLevel} className="w-full btn-primary py-4 mt-4 text-lg">
                  {total + 1 >= 8 ? 'Ver resultado 🏆' : 'Próximo ➡️'}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Jogo concluído!</h2>
            <div className="flex justify-center gap-1 text-3xl mb-4">
              {Array.from({ length: 3 }).map((_, i) => <span key={i}>{i < stars ? '⭐' : '☆'}</span>)}
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm space-y-1">
              <div className="flex justify-between"><span>Acertos:</span><strong className="text-green-600">{score}/8</strong></div>
              <div className="flex justify-between"><span>Precisão:</span><strong>{Math.round((score/8)*100)}%</strong></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setScore(0); setTotal(0); setDone(false); newLevel() }} className="flex-1 btn-secondary py-3">Jogar de novo</button>
              <button onClick={() => router.back()} className="flex-1 btn-primary py-3">Voltar</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
