'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <span className="text-slate-400">Loading...</span>

  if (!user) {
    return (
      <a
        href="/login"
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
      >
        Login
      </a>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-slate-300 text-sm">{user.email}</span>
      <button
        onClick={handleSignOut}
        className="text-slate-400 hover:text-white text-sm"
      >
        Sign Out
      </button>
    </div>
  )
}
