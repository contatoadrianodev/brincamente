'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [maxMinutes, setMaxMinutes] = useState(60)
  const [sound, setSound] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('parent_settings').select('*').eq('user_id', user.id).single()
      if (data) { setMaxMinutes(data.max_daily_minutes); setSound(data.sound_enabled); setNotifications(data.notifications_enabled) }
    }
    load()
  }, [])

  async function onSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('parent_settings').upsert({ user_id: user.id, max_daily_minutes: maxMinutes, sound_enabled: sound, notifications_enabled: notifications })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-parent min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <Link href="/parent/dashboard" className="flex items-center gap-2 text-gray-500 mb-6 font-medium hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-black text-gray-800 mb-6">⚙️ Configurações</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tempo máximo diário: {maxMinutes} min</label>
              <input type="range" min={10} max={180} step={10} value={maxMinutes} onChange={e => setMaxMinutes(+e.target.value)}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>10 min</span><span>3 horas</span></div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-bold text-gray-800">Som ativado</div>
                <div className="text-sm text-gray-500">Efeitos sonoros nos jogos</div>
              </div>
              <button onClick={() => setSound(!sound)}
                className={`w-12 h-6 rounded-full transition-colors ${sound ? 'bg-blue-500' : 'bg-gray-300'} relative`}>
                <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow ${sound ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-bold text-gray-800">Notificações</div>
                <div className="text-sm text-gray-500">Lembretes de uso diário</div>
              </div>
              <button onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-blue-500' : 'bg-gray-300'} relative`}>
                <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow ${notifications ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <button onClick={onSave}
              className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <Save className="w-5 h-5" /> {saved ? '✅ Salvo!' : 'Salvar configurações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
