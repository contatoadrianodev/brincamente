'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [done, setDone] = useState(false)
  const { register, handleSubmit } = useForm<{ email: string }>()

  async function onSubmit({ email }: { email: string }) {
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` })
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><span className="text-5xl">🧩</span><div className="text-3xl font-black text-blue-600 mt-2">BrincaMente</div></Link>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {done ? (
            <div className="text-center">
              <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-black text-gray-800 mb-2">Email enviado!</h1>
              <p className="text-gray-600 mb-6">Verifique sua caixa de entrada e siga as instruções para redefinir a senha.</p>
              <Link href="/auth/login" className="btn-primary inline-block">Voltar ao login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-800 mb-2">Recuperar senha</h1>
              <p className="text-gray-600 mb-6 text-sm">Informe seu email e enviaremos um link para redefinir a senha.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input {...register('email')} type="email" placeholder="seu@email.com" required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400" />
                <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" /> Enviar link
                </button>
              </form>
              <div className="text-center mt-4">
                <Link href="/auth/login" className="text-blue-500 text-sm font-medium hover:underline">Voltar ao login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
