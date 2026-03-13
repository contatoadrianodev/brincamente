'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft } from 'lucide-react'

export default function AdminMetrics() {
  const supabase = createClient()
  const [stats, setStats] = useState({ users:0, profiles:0, sessions:0, completed:0, avgScore: 0 })
  const [gameData, setGameData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [{ count: users }, { count: profiles }, { count: sessions }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('child_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
      ])
      const { data: sess } = await supabase.from('game_sessions').select('score, completed')
      const completed = sess?.filter(s => s.completed).length ?? 0
      const avgScore = sess?.length ? Math.round(sess.reduce((a, s) => a + s.score, 0) / sess.length) : 0
      setStats({ users: users ?? 0, profiles: profiles ?? 0, sessions: sessions ?? 0, completed, avgScore })

      const { data: games } = await supabase.from('games').select('name, type')
      const { data: gsess } = await supabase.from('game_sessions').select('game_id')
      const counts: Record<string, number> = {}
      gsess?.forEach(s => { counts[s.game_id] = (counts[s.game_id] ?? 0) + 1 })
      setGameData((games ?? []).map(g => ({ name: g.name.substring(0, 15), partidas: counts[g.id as any] ?? 0 })))
    }
    load()
  }, [])

  const COLORS = ['#3B82F6','#A855F7','#22C55E','#F97316']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-500 mb-6 font-medium hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Admin</Link>
        <h1 className="text-2xl font-black text-gray-800 mb-6">📊 Métricas</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Usuários',       value: stats.users,     color: 'bg-blue-500' },
            { label: 'Perfis infantis', value: stats.profiles,  color: 'bg-purple-500' },
            { label: 'Partidas',        value: stats.sessions,  color: 'bg-green-500' },
            { label: 'Concluídas',      value: stats.completed, color: 'bg-teal-500' },
            { label: 'Score médio',     value: `${stats.avgScore}%`, color: 'bg-orange-500' },
          ].map(s => (
            <div key={s.label} className={`${s.color} text-white rounded-2xl p-4 shadow-md`}>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
        {gameData.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="font-black text-gray-800 mb-4">Jogos mais populares</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gameData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="partidas" radius={[6,6,0,0]}>
                  {gameData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
