'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { calculateXP, calculateStars } from '@/utils/gamification'
import { ArrowLeft } from 'lucide-react'

// Built-in questions (fallback when DB is empty)
const FALLBACK_QUESTIONS = [
  { question: 'Qual letra vem depois do A?', options: ['B','C','D','E'], correct: 0, emoji: '🔤' },
  { question: 'Quantos lados tem um triângulo?', options: ['2','3','4','5'], correct: 1, emoji: '📐' },
  { question: 'Qual animal faz "miau"?', options: ['Cachorro','Gato','Pássaro','Peixe'], correct: 1, emoji: '🐱' },
  { question: 'Quanto é 2 + 2?', options: ['3','4','5','6'], correct: 1, emoji: '➕' },
  { question: 'Qual é a cor do céu em dia ensolarado?', options: ['Verde','Vermelho','Azul','Amarelo'], correct: 2, emoji: '☀️' },
  { question: 'Qual fruta é amarela e comprida?', options: ['Maçã','Banana','Uva','Morango'], correct: 1, emoji: '🍌' },
  { question: 'Quantos dias tem uma semana?', options: ['5','6','7','8'], correct: 2, emoji: '📅' },
  { question: 'Qual é o maior animal terrestre?', options: ['Leão','Girafa','Elefante','Hipopótamo'], correct: 2, emoji: '🐘' },
  { question: 'Qual letra é uma vogal?', options: ['B','C','D','A'], correct: 3, emoji: '🔤' },
  { question: 'Quanto é 5 - 2?', options: ['2','3','4','5'], correct: 1, emoji: '➖' },
]

export default function QuizGame() {
  const { profileId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [done, setDone] = useState(false)
  const [streak, setStreak] = useState(0)

  const q = questions[current]
  const total = questions.length
  const progress = Math.round((current / total) * 100)

  function answer(idx: number) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const isCorrect = idx === q.correct
    if (isCorrect) { setCorrect(c => c + 1); setStreak(s => s + 1) }
    else { setWrong(w => w + 1); setStreak(0) }
  }

  function next() {
    if (current + 1 >= total) { setDone(true); saveResult(); return }
    setCurrent(c => c + 1); setSelected(null); setAnswered(false)
  }

  async function saveResult() {
    const xp = calculateXP(correct, wrong, 1)
    const { data: game } = await supabase.from('games').select('id').eq('type', 'quiz').single()
    if (game) {
      await supabase.from('game_sessions').insert({
        child_profile_id: profileId, game_id: game.id,
        score: Math.round((correct / total) * 100),
        correct_answers: correct, wrong_answers: wrong,
        duration_seconds: 0, completed: true,
      })
    }
  }

  const stars = calculateStars(correct, total)

  return (
    <div className="page-child min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="bg-white rounded-xl p-2 shadow-md">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-800">❓ Quiz Educativo</h1>
          <div className="bg-white rounded-xl px-3 py-2 shadow-md text-sm font-bold text-gray-600">
            {current + 1}/{total}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-full h-3 mb-6 overflow-hidden shadow-inner">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
          />
        </div>

        {!done ? (
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              {/* Question card */}
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                <div className="text-5xl text-center mb-4">{q.emoji}</div>
                <h2 className="text-xl font-black text-gray-800 text-center">{q.question}</h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, i) => {
                  let style = 'bg-white hover:bg-blue-50 border-2 border-gray-200'
                  if (answered) {
                    if (i === q.correct) style = 'bg-green-100 border-2 border-green-500 text-green-700'
                    else if (i === selected && i !== q.correct) style = 'bg-red-100 border-2 border-red-400 text-red-700'
                    else style = 'bg-gray-50 border-2 border-gray-200 opacity-60'
                  }
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => answer(i)}
                      className={`w-full text-left p-4 rounded-2xl font-bold text-gray-800 transition-all flex items-center gap-3 ${style}`}
                    >
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">
                        {['A','B','C','D'][i]}
                      </span>
                      {opt}
                      {answered && i === q.correct && <span className="ml-auto text-green-500 text-xl">✅</span>}
                      {answered && i === selected && i !== q.correct && <span className="ml-auto text-red-500 text-xl">❌</span>}
                    </motion.button>
                  )
                })}
              </div>

              {answered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <div className={`rounded-2xl p-3 text-center mb-3 ${selected === q.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className="font-black">{selected === q.correct ? `🎉 Correto! ${streak > 1 ? `Combo x${streak}! 🔥` : ''}` : `😅 A resposta certa é: ${q.options[q.correct]}`}</span>
                  </div>
                  <button onClick={next} className="w-full btn-primary py-4 text-lg">
                    {current + 1 >= total ? 'Ver resultado 🏆' : 'Próxima ➡️'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">{stars === 3 ? '🏆' : stars === 2 ? '🥈' : stars === 1 ? '🥉' : '😅'}</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Quiz concluído!</h2>
            <div className="flex justify-center gap-1 text-3xl mb-6">
              {Array.from({ length: 3 }).map((_, i) => <span key={i}>{i < stars ? '⭐' : '☆'}</span>)}
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span>Acertos:</span><strong className="text-green-600">{correct}/{total}</strong></div>
              <div className="flex justify-between"><span>Erros:</span><strong className="text-red-500">{wrong}</strong></div>
              <div className="flex justify-between"><span>Precisão:</span><strong>{Math.round((correct/total)*100)}%</strong></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCurrent(0); setCorrect(0); setWrong(0); setDone(false); setAnswered(false); setSelected(null) }}
                className="flex-1 btn-secondary py-3">Jogar de novo</button>
              <button onClick={() => router.back()} className="flex-1 btn-primary py-3">Voltar</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
