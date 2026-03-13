'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Users, GamepadIcon, Trophy, BarChart2, Settings, BookOpen, ListChecks, Gift } from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({ users: 0, profiles: 0, sessions: 0, games: 0 })

  useEffect(() => {
    async function load() {
      const [{ count: users }, { count: profiles }, { count: sessions }, { count: games }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('child_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
      ])
      setStats({ users: users ?? 0, profiles: profiles ?? 0, sessions: sessions ?? 0, games: games ?? 0 })
    }
    load()
  }, [])

  const nav = [
    { href: '/admin/users',     icon: Users,       label: 'Usuários',       color: 'bg-blue-50 text-blue-600' },
    { href: '/admin/categories',icon: BookOpen,    label: 'Categorias',     color: 'bg-green-50 text-green-600' },
    { href: '/admin/games',     icon: GamepadIcon, label: 'Jogos',          color: 'bg-purple-50 text-purple-600' },
    { href: '/admin/questions', icon: ListChecks,  label: 'Perguntas',      color: 'bg-yellow-50 text-yellow-600' },
    { href: '/admin/missions',  icon: Trophy,      label: 'Missões',        color: 'bg-orange-50 text-orange-600' },
    { href: '/admin/rewards',   icon: Gift,        label: 'Recompensas',    color: 'bg-pink-50 text-pink-600' },
    { href: '/admin/metrics',   icon: BarChart2,   label: 'Métricas',       color: 'bg-indigo-50 text-indigo-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🧩</span>
          <div>
            <h1 className="text-2xl font-black text-gray-800">Admin · BrincaMente</h1>
            <p className="text-gray-500 text-sm">Painel administrativo</p>
          </div>
          <Link href="/" className="ml-auto text-sm text-gray-500 hover:text-gray-700 font-medium">← Site</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Usuários',    value: stats.users,    emoji: '👥', color: 'bg-blue-500' },
            { label: 'Perfis',      value: stats.profiles, emoji: '🧒', color: 'bg-purple-500' },
            { label: 'Partidas',    value: stats.sessions, emoji: '🎮', color: 'bg-green-500' },
            { label: 'Jogos',       value: stats.games,    emoji: '🎯', color: 'bg-orange-500' },
          ].map(s => (
            <div key={s.label} className={`${s.color} text-white rounded-2xl p-5 shadow-md`}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-3xl font-black">{s.value}</div>
              <div className="text-sm opacity-80 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nav.map(n => (
            <Link key={n.href} href={n.href}
              className={`${n.color} rounded-2xl p-5 flex flex-col items-center gap-2 shadow-md hover:shadow-lg transition-shadow font-bold text-sm`}>
              <n.icon className="w-8 h-8" />
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
