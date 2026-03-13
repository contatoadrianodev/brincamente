'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AVATAR_OPTIONS } from '@/utils/gamification'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

export default function EditProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [age, setAge] = useState(6)
  const [avatar, setAvatar] = useState('bear')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('child_profiles').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setName(data.name); setAge(data.age); setAvatar(data.avatar) }
    })
  }, [id])

  async function onSave() {
    setLoading(true)
    await supabase.from('child_profiles').update({ name, age, avatar }).eq('id', id)
    router.push('/parent/dashboard')
  }

  async function onDelete() {
    if (!confirm('Excluir este perfil? Todos os dados serão perdidos.')) return
    await supabase.from('child_profiles').delete().eq('id', id)
    router.push('/parent/dashboard')
  }

  return (
    <div className="page-parent min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <Link href="/parent/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-black text-gray-800 mb-6">✏️ Editar perfil</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Idade</label>
              <input type="number" value={age} onChange={e => setAge(+e.target.value)} min={3} max={12} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Avatar</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map(a => (
                  <button key={a.id} type="button" onClick={() => setAvatar(a.id)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 ${avatar === a.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <span className="text-3xl">{a.emoji}</span>
                    <span className="text-xs font-medium text-gray-600">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onSave} disabled={loading}
                className="flex-1 bg-blue-500 text-white font-black py-3 rounded-2xl hover:bg-blue-600 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Salvar
              </button>
              <button onClick={onDelete}
                className="bg-red-50 text-red-500 border-2 border-red-200 font-bold py-3 px-4 rounded-2xl hover:bg-red-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
