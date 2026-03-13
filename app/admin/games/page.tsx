'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-500 mb-6 font-medium hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Admin</Link>
        <h1 className="text-2xl font-black text-gray-800 mb-4 capitalize">Gerenciar games</h1>
        <div className="bg-white rounded-2xl p-8 shadow-md text-center text-gray-400">
          <div className="text-5xl mb-3">🚧</div>
          <p className="font-medium">Esta seção está em construção. Use o Supabase diretamente para gerenciar.</p>
          <Link href="https://supabase.com" target="_blank" className="mt-4 inline-block text-blue-500 font-bold hover:underline">Abrir Supabase →</Link>
        </div>
      </div>
    </div>
  )
}
