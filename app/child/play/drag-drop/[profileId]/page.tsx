'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { calculateXP, calculateCoins, calculateStars } from '@/utils/gamification'
import { ArrowLeft, RefreshCw } from 'lucide-react'

const PAIRS = [
  { word: 'GATO',      emoji: '🐱' },
  { word: 'CACHORRO',  emoji: '🐶' },
  { word: 'SOL',       emoji: '☀️' },
  { word: 'CHUVA',     emoji: '🌧️' },
  { word: 'ÁRVORE',    emoji: '🌳' },
  { word: 'CASA',      emoji: '🏠' },
  { word: 'LIVRO',     emoji: '📚' },
  { word: 'BOLA',      emoji: '⚽' },
]

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5) }

export default function DragDropGame() {
  const { profileId } = useParams()
  const router = useRouter()

  const [round, setRound] = useState(0)
  const [pairs, setPairs] = useState(shuffle(PAIRS).slice(0, 6))
  const [emojis, setEmojis] = useState<string[]>([])
  const [dragging, setDragging] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, boolean>>({})
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [feedback, setFeedback] = useState<{ word: string; ok: boolean } | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const p = shuffle(PAIRS).slice(0, 6)
    setPairs(p)
    setEmojis(shuffle(p.map(x => x.emoji)))
    setMatched({}); setScore(0); setWrong(0); setDone(false)
  }, [round])

  async function saveResult(finalScore: number, finalWrong: number) {
    const xp    = calculateXP(finalScore, finalWrong, 1)
    const coins = calculateCoins(Math.round((finalScore / pairs.length) * 100), 1)
    const stars = calculateStars(finalScore, pairs.length)

    await supabase.rpc('save_game_result', {
      p_profile_id: profileId,
      p_game_type:  'drag_drop',
      p_score:      Math.round((finalScore / pairs.length) * 100),
      p_correct:    finalScore,
      p_wrong:      finalWrong,
      p_duration:   0,
      p_xp:         xp,
      p_coins:      coins,
      p_stars:      stars,
    })
  }

  function onDrop(word: string) {
    if (!dragging) return
    const pair = pairs.find(p => p.word === word)
    if (!pair) return
    const ok = pair.emoji === dragging
    setFeedback({ word, ok })
    setTimeout(() => setFeedback(null), 800)
    if (ok) {
      const newScore = score + 1
      setScore(newScore)
      setMatched(m => ({ ...m, [word]: true }))
      setEmojis(e => e.filter(x => x !== dragging))
      const newMatched = Object.keys(matched).length + 1
      if (newMatched >= pairs.length) {
        setDone(true)
        saveResult(newScore, wrong)
      }
    } else {
      setWrong(w => w + 1)
    }
    setDragging(null)
  }

  const stars = calculateStars(score, pairs.length)

  return (
    <div className="page-child min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="bg-white rounded-xl p-2 shadow-md"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-xl font-black text-gray-800">🎯 Associar Palavras</h1>
          <div className="bg-white rounded-xl px-3 py-2 shadow-md text-sm font-bold text-green-600">{score}/{pairs.length}</div>
        </div>

        <p className="text-center text-gray-600 font-medium mb-6 bg-white/60 rounded-2xl px-4 py-2">
          Arraste o emoji até a palavra correta! 👆
        </p>

        {/* Word targets */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {pairs.map(p => (
            <div
              key={p.word}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(p.word)}
              className={`rounded-2xl p-4 min-h-16 flex items-center justify-center font-black text-lg border-2 transition-all
                ${matched[p.word] ? 'bg-green-100 border-green-400 text-green-700' :
                  feedback?.word === p.word ? (feedback.ok ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400') :
                  'bg-white border-dashed border-gray-300 text-gray-700 hover:border-blue-400'}`}
            >
              {matched[p.word] ? <span>{p.emoji} {p.word}</span> : <span>{p.word}</span>}
              {feedback?.word === p.word && !feedback.ok && <span className="ml-2">❌</span>}
            </div>
          ))}
        </div>

        {/* Draggable emojis */}
        {!done && (
          <div className="bg-white rounded-3xl p-4 shadow-xl">
            <p className="text-xs text-gray-400 text-center mb-3 font-medium">Segure e arraste</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {emojis.map((emoji, i) => (
                <motion.div
                  key={emoji + i}
                  draggable
                  onDragStart={() => setDragging(emoji)}
                  onDragEnd={() => setDragging(null)}
                  whileTap={{ scale: 1.2 }}
                  className={`w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl cursor-grab shadow-md hover:shadow-lg transition-shadow border-2 ${dragging === emoji ? 'border-blue-400' : 'border-transparent'}`}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile tap-to-match */}
        {!done && emojis.length > 0 && (
          <div className="mt-4 text-center text-xs text-gray-400 font-medium">
            📱 No celular: toque em um emoji, depois na palavra
          </div>
        )}

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="text-6xl mb-3">🎉</div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Incrível!</h2>
                <p className="text-gray-500 mb-3">Você associou todas as palavras!</p>
                <div className="flex justify-center gap-1 text-3xl mb-4">
                  {Array.from({ length: 3 }).map((_, i) => <span key={i}>{i < stars ? '⭐' : '☆'}</span>)}
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 mb-6 text-sm space-y-1">
                  <div className="flex justify-between"><span>Acertos:</span><strong className="text-green-600">{score}</strong></div>
                  <div className="flex justify-between"><span>Erros:</span><strong className="text-red-500">{wrong}</strong></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setRound(r => r + 1)} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Novo jogo
                  </button>
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
