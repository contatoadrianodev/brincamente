'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Star, Trophy, Shield, Zap, BookOpen, Calculator, Palette } from 'lucide-react'

const features = [
  { icon: Brain,      label: 'Memória',       color: 'bg-purple-100 text-purple-600', desc: 'Exercite a concentração' },
  { icon: BookOpen,   label: 'Alfabetização',  color: 'bg-blue-100 text-blue-600',    desc: 'Aprenda letras e sílabas' },
  { icon: Calculator, label: 'Matemática',     color: 'bg-green-100 text-green-600',  desc: 'Números e operações' },
  { icon: Palette,    label: 'Criatividade',   color: 'bg-pink-100 text-pink-600',    desc: 'Cores, formas e arte' },
  { icon: Zap,        label: 'Raciocínio',     color: 'bg-yellow-100 text-yellow-600',desc: 'Lógica e sequências' },
  { icon: Star,       label: 'Recompensas',    color: 'bg-orange-100 text-orange-600',desc: 'Conquistas e estrelas' },
]

const games = [
  { emoji: '🧠', name: 'Jogo da Memória',    desc: 'Encontre os pares!',        color: 'from-purple-400 to-purple-600' },
  { emoji: '❓', name: 'Quiz Educativo',      desc: 'Responda e aprenda!',       color: 'from-blue-400 to-blue-600' },
  { emoji: '🎯', name: 'Arrastar e Soltar',   desc: 'Associe palavras!',         color: 'from-green-400 to-green-600' },
  { emoji: '🔢', name: 'Sequência Lógica',    desc: 'Complete o padrão!',        color: 'from-orange-400 to-orange-600' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧩</span>
            <span className="text-2xl font-black text-blue-600">BrincaMente</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="text-blue-600 font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
              Entrar
            </Link>
            <Link href="/auth/register" className="bg-blue-500 text-white font-bold px-5 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-md">
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-7xl mb-6">🌟🧩🎮</div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">
            Aprender brincando<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              é mais divertido!
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Jogos educativos interativos para crianças de 3 a 12 anos. Alfabetização, matemática, memória e muito mais com gamificação premium!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-lg px-10 py-4 text-center inline-block">
              🚀 Começar Grátis Agora
            </Link>
            <Link href="/auth/login" className="btn-secondary text-lg px-10 py-4 text-center inline-block">
              Já tenho conta
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[['🎮', '10+', 'Jogos'], ['⭐', '100%', 'Gratuito'], ['📱', 'PWA', 'Instalável']].map(([icon, val, lbl]) => (
            <div key={lbl} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-black text-blue-600">{val}</div>
              <div className="text-sm text-gray-500 font-medium">{lbl}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Games Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center text-gray-800 mb-10">
          🎮 Jogos disponíveis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {games.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${g.color} rounded-3xl p-6 text-white text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer`}
            >
              <div className="text-5xl mb-3">{g.emoji}</div>
              <div className="font-black text-lg">{g.name}</div>
              <div className="text-sm opacity-90 mt-1">{g.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center text-gray-800 mb-10">
          🌈 O que sua criança vai aprender?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-3`}>
                <f.icon className="w-6 h-6" />
              </div>
              <div className="font-bold text-gray-800 text-lg">{f.label}</div>
              <div className="text-sm text-gray-500 mt-1">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gamification */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-10 text-white text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-3xl font-black mb-4">Sistema de Gamificação Completo</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Estrelas, moedas, XP, conquistas, missões diárias e avatares personalizáveis mantêm a criança motivada todos os dias!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['⭐','Estrelas'],['🪙','Moedas'],['🏅','Conquistas'],['🔥','Sequências']].map(([e,l]) => (
              <div key={l} className="bg-white/20 rounded-2xl p-4">
                <div className="text-3xl mb-1">{e}</div>
                <div className="font-bold">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parent Area */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">Área dos Pais Completa</h2>
            <p className="text-gray-600 text-lg mb-6">
              Acompanhe o progresso, controle o tempo de tela, veja relatórios de desempenho e gerencie múltiplos perfis com facilidade.
            </p>
            <ul className="space-y-3">
              {['Relatórios de desempenho detalhados', 'Controle de tempo de tela', 'Múltiplos perfis infantis', 'Recomendações pedagógicas'].map(i => (
                <li key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                  <Shield className="w-5 h-5 text-green-500" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <div className="text-center font-black text-gray-800 text-xl">Segurança Infantil</div>
            <p className="text-center text-gray-600 mt-2">Sem publicidade. Sem links externos. Conteúdo 100% educativo e controlado.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-12">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-black text-white mb-4">Pronto para começar?</h2>
          <p className="text-yellow-100 text-lg mb-8">Crie sua conta grátis e deixe a diversão educativa começar!</p>
          <Link href="/auth/register" className="bg-white text-orange-600 font-black text-lg px-10 py-4 rounded-2xl hover:bg-yellow-50 transition-colors shadow-lg inline-block">
            Criar Conta Grátis 🎉
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-100 py-8 text-center text-gray-500">
        <div className="text-2xl mb-2">🧩</div>
        <p className="font-bold text-gray-700">BrincaMente</p>
        <p className="text-sm mt-1">© 2024 BrincaMente · Todos os direitos reservados</p>
      </footer>
    </div>
  )
}
