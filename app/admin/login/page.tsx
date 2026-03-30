'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      toast.error('Access denied. Admins only.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    toast.success('Welcome, Admin!')
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
      <div className="bg-[#16213e] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#c9a84c]/20">
        <h1 className="text-3xl font-serif text-[#e8d5b7] mb-6 text-center">Space2Standard</h1>
        <h2 className="text-xl text-[#c9a84c] mb-8 text-center uppercase tracking-widest font-mono">Admin Portal</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[#e8d5b7] mb-2 text-sm uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f3460] border border-[#c9a84c]/30 text-white p-3 rounded focus:outline-none focus:border-[#c9a84c]"
              required
            />
          </div>
          <div>
            <label className="block text-[#e8d5b7] mb-2 text-sm uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f3460] border border-[#c9a84c]/30 text-white p-3 rounded focus:outline-none focus:border-[#c9a84c]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a84c] text-[#1a1a2e] font-bold py-3 rounded hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
