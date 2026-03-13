'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ChildProfile } from '@/types'
import { getAvatarEmoji } from '@/utils/gamification'
import Link from 'next/link'
import { Plus, Settings } from 'lucide-react'

export default function SelectProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('child_profiles').select('*').eq('user_id', user.id)
      setProfiles(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function select(profile: ChildProfile) {
    sessionStorage.setItem('activeProfile', JSON.stringify(profile))
    router.push(`/child/dashboard/${profile.id}`)
  }

  return (
    <div className="page-child min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🧩</div>
          <h1 className="text-3xl font-black text-gray-800">Quem vai jogar?</h1>
          <p className="text-gray-500 mt-2">Toque no seu personagem para começar! 🎮</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-5xl animate-bounce">⏳</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {profiles.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => select(p)}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center gap-3 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
              >
                <div className="text-6xl">{getAvatarEmoji(p.avatar)}</div>
                <div className="font-black text-gray-800 text-lg">{p.name}</div>
                <div className="text-sm text-gray-500">{p.age} anos</div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-yellow-100 text-yellow-700 font-bold rounded-full px-2 py-0.5">Nv.{p.level}</span>
                  <span className="bg-blue-100 text-blue-700 font-bold rounded-full px-2 py-0.5">⭐{p.stars}</span>
                </div>
              </motion.button>
            ))}

            <Link href="/parent/profiles/create">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/60 rounded-3xl p-6 flex flex-col items-center gap-3 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all cursor-pointer h-full justify-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <div className="font-bold text-gray-500 text-center text-sm">Adicionar criança</div>
              </motion.div>
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link href="/parent/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm">
            <Settings className="w-4 h-4" /> Área dos pais
          </Link>
        </div>
      </div>
    </div>
  )
}
