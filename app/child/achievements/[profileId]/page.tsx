'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Achievement } from '@/types'
import { ArrowLeft } from 'lucide-react'

const ICONS: Record<string, string> = { trophy:'🏆', brain:'🧠', star:'⭐', zap:'⚡', flame:'🔥', default:'🏅' }

export default function AchievementsPage() {
  const { profileId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const [{ data: all }, { data: mine }] = await Promise.all([
        supabase.from('achievements').select('*').eq('is_active', true),
        supabase.from('child_achievements').select('achievement_id').eq('child_profile_id', profileId),
      ])
      setAchievements(all ?? [])
      setUnlocked(new Set((mine ?? []).map(x => x.achievement_id)))
    }
    load()
  }, [profileId])

  return (
    <div className="page-child min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="bg-white rounded-xl p-2 shadow-md"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-2xl font-black text-gray-800">🏅 Conquistas</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className={`rounded-2xl p-4 shadow-md text-center ${unlocked.has(a.id) ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-white opacity-60'}`}>
              <div className="text-4xl mb-2">{ICONS[a.icon] ?? ICONS.default}</div>
              <div className="font-black text-gray-800 text-sm">{a.name}</div>
              <div className="text-xs text-gray-500 mt-1">{a.description}</div>
              {unlocked.has(a.id) && <div className="text-xs text-yellow-600 font-bold mt-2">✅ Desbloqueada!</div>}
              {!unlocked.has(a.id) && <div className="text-xs text-gray-400 mt-2">🔒 Bloqueada</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
