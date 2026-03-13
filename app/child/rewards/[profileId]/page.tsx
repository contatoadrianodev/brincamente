'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ChildProfile, ChildMission } from '@/types'
import { getAvatarEmoji } from '@/utils/gamification'
import { ArrowLeft } from 'lucide-react'

export default function RewardsPage() {
  const { profileId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [missions, setMissions] = useState<ChildMission[]>([])

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('child_profiles').select('*').eq('id', profileId).single()
      setProfile(p)
      const { data: m } = await supabase.from('child_missions').select('*, mission:daily_missions(*)').eq('child_profile_id', profileId)
      setMissions(m ?? [])
    }
    load()
  }, [profileId])

  return (
    <div className="page-child min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="bg-white rounded-xl p-2 shadow-md"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-2xl font-black text-gray-800">🎁 Recompensas</h1>
        </div>

        {profile && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-6 mb-6 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getAvatarEmoji(profile.avatar)}</div>
              <div>
                <div className="font-black text-xl">{profile.name}</div>
                <div className="flex gap-3 mt-1">
                  <span className="bg-white/30 rounded-full px-2 py-0.5 text-sm font-bold">⭐ {profile.stars}</span>
                  <span className="bg-white/30 rounded-full px-2 py-0.5 text-sm font-bold">🪙 {profile.coins}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="font-black text-gray-800 text-lg mb-4">🎯 Missões do dia</h2>
        {missions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="font-medium">Nenhuma missão ativa. Jogue para desbloquear!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={`bg-white rounded-2xl p-4 shadow-md border-l-4 ${m.completed ? 'border-green-500' : 'border-blue-400'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-gray-800">{m.mission?.title}</div>
                    <div className="text-sm text-gray-500">{m.mission?.description}</div>
                  </div>
                  {m.completed ? (
                    <span className="text-2xl">✅</span>
                  ) : (
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-500">{m.progress}/{m.mission?.target_value}</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((m.progress ?? 0) / (m.mission?.target_value ?? 1)) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                {m.completed && (
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-yellow-100 text-yellow-700 font-bold rounded-full px-2 py-0.5">+{m.mission?.reward_coins} 🪙</span>
                    <span className="bg-purple-100 text-purple-700 font-bold rounded-full px-2 py-0.5">+{m.mission?.reward_xp} XP</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
