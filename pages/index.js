import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { ensureUserProfile } from '../lib/supabaseHelper'

export default function Home(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const router = useRouter()

const handleLogin = async () => {
  if (!username.trim() || !password.trim()) {
    setLoginError('Please enter both username and password')
    return
  }

  setLoading(true)
  setLoginError('')

  try {
    // 1️⃣ Login ke Supabase pakai email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    })

    if (error) {
      setLoginError(error.message)
      return
    }

    const user = data?.user
    if (!user) {
      setLoginError('Login failed: user not found')
      return
    }

    // 2️⃣ Pastikan profil user sudah ada di tabel `profiles`
    try {
      const profile = await ensureUserProfile(user)
      console.log('✅ User profile ensured:', profile)
    } catch (profileErr) {
      console.error('Error ensuring profile:', profileErr)
    }

    // 3️⃣ Kalau semua sukses, arahkan ke halaman game
    router.push('/game')

  } catch (e) {
    console.error('Unexpected error:', e)
    setLoginError('Connection error. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password')
      return
    }
    setLoading(true)
    setLoginError('')
    try {
      const { data, error } = await supabase.auth.signUp({ email: username, password })
      if (error) {
        setLoginError(error.message)
      } else {
        alert('Registered. Please confirm via email if your Supabase settings require it.')
      }
    } catch (e) {
      setLoginError('Connection error. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{
           backgroundImage: 'url("images/retro-clouds.png")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <div className="w-full max-w-md"
           style={{
             background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)',
             border: '2px solid #FFFFFF',
             borderRadius: '8px',
             boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.2)'
           }}>
        <div className="flex items-center justify-between px-2 py-1"
             style={{
               background: 'linear-gradient(180deg, #0054A6 0%, #0078D4 100%)',
               borderBottom: '1px solid #00305A'
             }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white" style={{ border: '1px solid #000' }}></div>
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
              Rock Paper Scissors - Login
            </span>
          </div>
          <div className="flex gap-1">
            <button className="w-5 h-5 flex items-center justify-center text-xs font-bold"
                    style={{ background: '#C0C0C0', border: '1px outset #E0E0E0' }}>_</button>
            <button className="w-5 h-5 flex items-center justify-center text-xs font-bold"
                    style={{ background: '#C0C0C0', border: '1px outset #E0E0E0' }}>□</button>
            <button className="w-5 h-5 flex items-center justify-center text-xs font-bold"
                    style={{ background: '#C0C0C0', border: '1px outset #E0E0E0' }}>✕</button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6 p-4" style={{ background: '#FFFFFF', border: '2px inset #808080' }}>
            <h1 className="text-3xl font-bold mb-2" 
                style={{ fontFamily: 'Arial, sans-serif', color: '#000080', textShadow: '2px 2px 0 #C0C0C0' }}>
              Rock Paper Scissors
            </h1>
            <div className="flex justify-center gap-2 text-3xl mb-2">
              <span>✊</span>
              <span>✋</span>
              <span>✌️</span>
            </div>
            <p className="text-sm" style={{ fontFamily: 'Tahoma, Arial, sans-serif', color: '#000080' }}>
              Welcome to Windows Game!
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 text-center"
                 style={{
                   background: '#FFE0E0',
                   border: '2px solid #FF0000',
                   fontFamily: 'Tahoma, Arial, sans-serif',
                   fontSize: '12px',
                   color: '#800000'
                 }}>
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ fontFamily: 'Tahoma, Arial, sans-serif', color: '#000' }}>
                User name:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
                className="w-full p-2 text-sm"
                style={{
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  background: '#FFFFFF',
                  border: '2px inset #808080',
                  outline: 'none'
                }}
                placeholder="Enter your username (email)"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ fontFamily: 'Tahoma, Arial, sans-serif', color: '#000' }}>
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
                className="w-full p-2 text-sm"
                style={{
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  background: '#FFFFFF',
                  border: '2px inset #808080',
                  outline: 'none'
                }}
                placeholder="Enter password"
              />
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="px-8 py-2 text-sm font-bold"
                style={{
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  background: loading ? '#D0D0D0' : 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)',
                  border: '2px outset #FFFFFF',
                  boxShadow: '1px 1px 0 rgba(0,0,0,0.5)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseDown={(e) => !loading && (e.currentTarget.style.border = '2px inset #FFFFFF')}
                onMouseUp={(e) => !loading && (e.currentTarget.style.border = '2px outset #FFFFFF')}
              >
                {loading ? 'Loading...' : 'OK'}
              </button>
              <button
                onClick={handleRegister}
                className="px-8 py-2 text-sm font-bold"
                disabled={loading}
                style={{
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)',
                  border: '2px outset #FFFFFF',
                  boxShadow: '1px 1px 0 rgba(0,0,0,0.5)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Register
              </button>
            </div>
          </div>


          <div className="mt-4 text-center text-xs" style={{ fontFamily: 'Tahoma, Arial, sans-serif', color: '#000080' }}>
            © 1995-2025 Windows Games
          </div>
        </div>
      </div>
    </div>
  )
}
