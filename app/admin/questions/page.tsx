'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { QuizQuestion } from '@/types'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function AdminQuestions() {
  const supabase = createClient()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'a', difficulty: 1 })

  async function load() {
    const { data } = await supabase.from('quiz_questions').select('*')
    setQuestions(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function save() {
    const { data: game } = await supabase.from('games').select('id').eq('type', 'quiz').single()
    if (!game) return
    await supabase.from('quiz_questions').insert({ ...form, game_id: game.id, is_active: true })
    setShow(false); setForm({ question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'a', difficulty: 1 })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Excluir pergunta?')) return
    await supabase.from('quiz_questions').delete().eq('id', id)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-500 mb-6 font-medium hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Admin</Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-800">❓ Perguntas do Quiz</h1>
          <button onClick={() => setShow(true)} className="bg-blue-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-600 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova pergunta
          </button>
        </div>

        {show && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="font-black text-gray-800 mb-4">Nova pergunta</h2>
            <div className="space-y-3">
              <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="Pergunta" rows={2}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-400" />
              <div className="grid grid-cols-2 gap-3">
                {(['a','b','c','d'] as const).map(opt => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${form.correct_option === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{opt.toUpperCase()}</span>
                    <input value={form[`option_${opt}` as keyof typeof form] as string}
                      onChange={e => setForm({ ...form, [`option_${opt}`]: e.target.value })}
                      placeholder={`Opção ${opt.toUpperCase()}`}
                      className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 items-center">
                <label className="text-sm font-bold text-gray-700">Resposta correta:</label>
                <select value={form.correct_option} onChange={e => setForm({ ...form, correct_option: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {['a','b','c','d'].map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                </select>
                <label className="text-sm font-bold text-gray-700 ml-4">Dificuldade:</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: +e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {[1,2,3,4,5].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={save} className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-xl hover:bg-blue-600">Salvar</button>
                <button onClick={() => setShow(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-xl hover:bg-gray-200">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-bold text-gray-800 mb-2">{q.question}</div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {(['a','b','c','d'] as const).map(opt => (
                      <span key={opt} className={`flex items-center gap-1 ${q.correct_option === opt ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                        <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${q.correct_option === opt ? 'bg-green-100' : 'bg-gray-100'}`}>{opt.toUpperCase()}</span>
                        {q[`option_${opt}` as keyof QuizQuestion] as string}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => remove(q.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && <div className="text-center py-10 text-gray-400">Nenhuma pergunta cadastrada ainda.</div>}
        </div>
      </div>
    </div>
  )
}
