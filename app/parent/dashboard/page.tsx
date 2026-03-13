'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChildProfile } from '@/types'
import { getAvatarEmoji } from '@/utils/gamification'
import { Users, Plus, BarChart2, Settings, LogOut, Star, Zap } from 'lucide-react'

export default function ParentDashboard() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUserName(user.user_metadata?.full_name ?? user.email ?? '')
      const { data } = await supabase.from('child_profiles').select('*').eq('user_id', user.id)
      setProfiles(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="page-parent">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🧩</span>
            <span className="text-xl font-black text-blue-600">BrincaMente</span>
          </div>
          <nav className="space-y-2 flex-1">
            {[
              { href: '/parent/dashboard', icon: Users,    label: 'Perfis' },
              { href: '/parent/reports',   icon: BarChart2, label: 'Relatórios' },
              { href: '/parent/settings',  icon: Settings,  label: 'Configurações' },
            ].map(n => (
              <Link key={n.href} href={n.href} className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                <n.icon className="w-5 h-5" /> {n.label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-medium transition-colors mt-auto">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-800">Olá, {userName.split(' ')[0]}! 👋</h1>
                <p className="text-gray-500 mt-1">Gerencie os perfis das crianças</p>
              </div>
              <Link href="/child/select-profile" className="bg-purple-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors text-sm">
                🎮 Jogar
              </Link>
            </div>

            {/* Profiles grid */}
            {loading ? (
              <div className="text-center py-20"><span className="text-4xl animate-bounce">⏳</span></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {profiles.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-4xl">
                          {getAvatarEmoji(p.avatar)}
                        </div>
                        <div>
                          <div className="font-black text-gray-800 text-lg">{p.name}</div>
                          <div className="text-gray-500 text-sm">{p.age} anos · Nível {p.level}</div>
                        </div>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="star-badge"><span>⭐</span>{p.stars}</span>
                        <span className="coin-badge"><span>🪙</span>{p.coins}</span>
                        <span className="level-badge"><Zap className="w-3 h-3" />{p.xp} XP</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/parent/profiles/${p.id}/edit`}
                          className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                          Editar
                        </Link>
                        <Link href={`/parent/reports?profile=${p.id}`}
                          className="flex-1 text-center py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                          Relatório
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* Add profile card */}
                  <Link href="/parent/profiles/create"
                    className="bg-white rounded-2xl shadow-md p-6 border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-blue-500 min-h-[200px]">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-bold">Adicionar criança</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
