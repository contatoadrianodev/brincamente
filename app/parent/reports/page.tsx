'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChildProfile, GameSession } from '@/types'
import { getAvatarEmoji } from '@/utils/gamification'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ReportsPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selected, setSelected] = useState<string>('')
  const [sessions, setSessions] = useState<GameSession[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('child_profiles').select('*').eq('user_id', user.id)
      setProfiles(data ?? [])
      if (data && data.length > 0) setSelected(data[0].id)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selected) return
    supabase.from('game_sessions')
      .select('*')
      .eq('child_profile_id', selected)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setSessions(data ?? []))
  }, [selected])

  const profile = profiles.find(p => p.id === selected)
  const totalGames = sessions.length
  const totalCorrect = sessions.reduce((s, g) => s + g.correct_answers, 0)
  const totalWrong = sessions.reduce((s, g) => s + g.wrong_answers, 0)
  const accuracy = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0

  const chartData = sessions.slice(0, 7).reverse().map((s, i) => ({
    game: `Jogo ${i + 1}`,
    acertos: s.correct_answers,
    erros: s.wrong_answers,
  }))

  return (
    <div className="page-parent min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/parent/dashboard" className="flex items-center gap-2 text-gray-500 mb-6 font-medium hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-black text-gray-800 mb-6">📊 Relatórios de Desempenho</h1>

        {/* Profile selector */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {profiles.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${selected === p.id ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
              {getAvatarEmoji(p.avatar)} {p.name}
            </button>
          ))}
        </div>

        {profile && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Jogos',    value: totalGames, emoji: '🎮', color: 'bg-blue-50 text-blue-700' },
                { label: 'Acertos', value: totalCorrect, emoji: '✅', color: 'bg-green-50 text-green-700' },
                { label: 'Erros',   value: totalWrong,  emoji: '❌', color: 'bg-red-50 text-red-700' },
                { label: 'Precisão', value: `${accuracy}%`, emoji: '🎯', color: 'bg-purple-50 text-purple-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-sm font-medium opacity-80">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Profile info */}
            <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{getAvatarEmoji(profile.avatar)}</div>
                <div>
                  <div className="text-xl font-black text-gray-800">{profile.name}</div>
                  <div className="text-gray-500">{profile.age} anos · Nível {profile.level} · {profile.xp} XP</div>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="star-badge">⭐ {profile.stars} estrelas</span>
                <span className="coin-badge">🪙 {profile.coins} moedas</span>
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 font-bold rounded-full px-3 py-1 text-sm">🔥 {profile.streak_days} dias</span>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h2 className="text-lg font-black text-gray-800 mb-4">Desempenho recente</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="game" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="acertos" fill="#22C55E" radius={[4,4,0,0]} />
                    <Bar dataKey="erros"   fill="#EF4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
