'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LayoutDashboard, Users, Calendar, Activity, Clock, Settings, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/calendrier', label: 'Calendrier', icon: Calendar },
]

const autoItems = [
  { href: '/dashboard/activite', label: 'Activité n8n', icon: Activity },
  { href: '/dashboard/relances', label: 'Relances', icon: Clock },
]

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.substring(0, 2).toUpperCase() ?? 'DR'

  return (
    <aside className="w-[220px] min-w-[220px] bg-[#161b27] border-r border-white/[0.07] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          E
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">EDR SAV</div>
          <div className="text-[10px] text-[#6b7280] font-mono">v2.0 · Supabase</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5">
        <p className="text-[10px] font-mono text-[#6b7280] uppercase tracking-widest px-2.5 py-2">Principal</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all ${
                active
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-[#6b7280] hover:bg-[#1e2535] hover:text-[#e8eaf0]'
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        <p className="text-[10px] font-mono text-[#6b7280] uppercase tracking-widest px-2.5 py-2 mt-3">Automatisation</p>
        {autoItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#6b7280] hover:bg-[#1e2535] hover:text-[#e8eaf0] transition-all"
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </Link>
        ))}

        <p className="text-[10px] font-mono text-[#6b7280] uppercase tracking-widest px-2.5 py-2 mt-3">Config</p>
        <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#6b7280] hover:bg-[#1e2535] hover:text-[#e8eaf0] transition-all">
          <Settings size={15} />
          Paramètres
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.07] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{user.email?.split('@')[0]}</div>
          <div className="text-[10px] text-[#6b7280] font-mono">admin</div>
        </div>
        <button onClick={handleLogout} className="text-[#6b7280] hover:text-red-400 transition-colors p-1">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
