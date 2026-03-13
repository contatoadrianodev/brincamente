'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { UserPlus } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Informe seu nome'),
  email:     z.string().email('Email inválido'),
  password:  z.string().min(6, 'Mínimo 6 caracteres'),
  confirm:   z.string(),
}).refine(d => d.password === d.confirm, { message: 'As senhas não coincidem', path: ['confirm'] })
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { full_name: data.full_name } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/parent/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><span className="text-5xl">🧩</span><div className="text-3xl font-black text-blue-600 mt-2">BrincaMente</div></Link>
          <p className="text-gray-600 mt-2 font-medium">Crie sua conta gratuita! 🎉</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-black text-gray-800 mb-6">Criar conta</h1>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'full_name', label: 'Seu nome', placeholder: 'João Silva', type: 'text' },
              { name: 'email',     label: 'Email',    placeholder: 'seu@email.com', type: 'email' },
              { name: 'password',  label: 'Senha',    placeholder: '••••••••', type: 'password' },
              { name: 'confirm',   label: 'Confirmar senha', placeholder: '••••••••', type: 'password' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
                <input
                  {...register(f.name as keyof FormData)}
                  type={f.type} placeholder={f.placeholder}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
                />
                {errors[f.name as keyof FormData] && (
                  <p className="text-red-500 text-xs mt-1">{errors[f.name as keyof FormData]?.message}</p>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <span className="animate-spin">⏳</span> : <UserPlus className="w-5 h-5" />}
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-blue-500 font-bold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
