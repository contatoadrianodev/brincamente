'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { AVATAR_OPTIONS } from '@/utils/gamification'
import { ArrowLeft, Save } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2),
  age:  z.coerce.number().min(3).max(12),
})
type FormData = z.infer<typeof schema>

export default function CreateProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [avatar, setAvatar] = useState('bear')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('child_profiles').insert({ ...data, avatar, user_id: user.id })
    router.push('/parent/dashboard')
  }

  return (
    <div className="page-parent min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <Link href="/parent/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-black text-gray-800 mb-6">➕ Novo perfil infantil</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome da criança</label>
              <input {...register('name')} placeholder="Ex: Maria" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400" />
              {errors.name && <p className="text-red-500 text-xs mt-1">Informe o nome</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Idade</label>
              <input {...register('age')} type="number" min={3} max={12} placeholder="Ex: 6" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400" />
              {errors.age && <p className="text-red-500 text-xs mt-1">Idade entre 3 e 12 anos</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Escolher avatar</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map(a => (
                  <button key={a.id} type="button" onClick={() => setAvatar(a.id)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${avatar === a.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-3xl">{a.emoji}</span>
                    <span className="text-xs font-medium text-gray-600">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? '⏳ Criando...' : <><Save className="w-5 h-5" /> Criar perfil</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
