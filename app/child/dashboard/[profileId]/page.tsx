'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ChildProfile } from '@/types'
import { getAvatarEmoji, xpForNextLevel } from '@/utils/gamification'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'memory',   name: 'Memória',    emoji: '🧠', color: 'from-purple-400 to-purple-600', href: 'memory' },
  { id: 'quiz',     name: 'Quiz',       emoji: '❓', color: 'from-blue-400 to-blue-600',    href: 'quiz' },
  { id: 'drag',     name: 'Associar',   emoji: '🎯', color: 'from-green-400 to-green-600',  href: 'drag-drop' },
  { id: 'sequence', name: 'Sequência',  emoji: '🔢', color: 'from-orange-400 to-orange-600',href: 'sequence' },
]

export default function ChildDashboard() {
  const { profileId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [hour, setHour] = useState(new Date().getHours())

  useEffect(() => {
    async function load() {
      const cached = sessionStorage.getItem('activeProfile')
      if (cached) { setProfile(JSON.parse(cached)); return }
      const { data } = await supabase.from('child_profiles').select('*').eq('id', profileId).single()
      if (data) setProfile(data)
    }
    load()
  }, [profileId])

  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  if (!profile) return <div className="page-child min-h-screen flex items-center justify-center text-5xl animate-bounce">⏳</div>

  const xpNeeded = xpForNextLevel(profile.level)
  const xpPct = Math.min(100, Math.round((profile.xp / xpNeeded) * 100))

  return (
    <div className="page-child min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 pb-16">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">
              {getAvatarEmoji(profile.avatar)}
            </motion.div>
            <div>
              <p className="text-blue-200 text-sm font-medium">{greeting}!</p>
              <h1 className="text-2xl font-black">{profile.name} 👋</h1>
              <div className="flex items-center gap-1 mt-1">
                <div className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">Nível {profile.level}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm font-bold">
              <span>⭐</span> {profile.stars}
            </div>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm font-bold">
              <span>🪙</span> {profile.coins}
            </div>
            <div className="flex items-center gap-1 bg-red-400/80 rounded-full px-3 py-1 text-sm font-bold">
              <span>🔥</span> {profile.streak_days}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="max-w-2xl mx-auto mt-4">
          <div className="flex justify-between text-xs text-blue-200 mb-1">
            <span>XP: {profile.xp}</span>
            <span>Próximo nível: {xpNeeded} XP</span>
          </div>
          <div className="bg-white/20 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-yellow-400 h-3 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-2xl mx-auto px-4 -mt-10">
        {/* Play Now */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">🎮 Escolha um jogo!</h2>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href={`/child/play/${c.href}/${profileId}`}
                  className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md block text-center`}>
                  <span className="text-4xl">{c.emoji}</span>
                  <span className="font-black text-sm">{c.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href={`/child/achievements/${profileId}`}
            className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center gap-2 hover:shadow-lg transition-shadow">
            <span className="text-3xl">🏅</span>
            <span className="text-xs font-bold text-gray-600">Conquistas</span>
          </Link>
          <Link href={`/child/rewards/${profileId}`}
            className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center gap-2 hover:shadow-lg transition-shadow">
            <span className="text-3xl">🎁</span>
            <span className="text-xs font-bold text-gray-600">Recompensas</span>
          </Link>
          <Link href="/child/select-profile"
            className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center gap-2 hover:shadow-lg transition-shadow">
            <span className="text-3xl">🔄</span>
            <span className="text-xs font-bold text-gray-600">Trocar perfil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
