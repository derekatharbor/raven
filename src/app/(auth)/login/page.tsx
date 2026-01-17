// Path: src/app/(auth)/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Eye, EyeOff, ChevronLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'initial' | 'credentials'>('initial')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')

  const supabase = createClient()

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/workspace')
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setStep('credentials')
      setMessage('')
    }
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
    } else {
      setMessage('Check your email for the sign-in link!')
      setMessageType('success')
    }
    setLoading(false)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
      setLoading(false)
    } else if (data.session) {
      // Successful login - redirect to workspace
      router.push('/workspace')
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  // Shared button style
  const buttonStyle = {
    width: '100%',
    padding: '14px 20px',
    borderRadius: 8,
    border: '1px solid rgba(163, 163, 120, 0.3)',
    background: 'rgba(163, 163, 120, 0.08)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'all 0.15s ease',
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 8,
    border: '1px solid rgba(163, 163, 120, 0.3)',
    background: 'transparent',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
  }

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 lg:px-16 lg:py-12">
      {/* Header */}
      <div>
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/raven-logo-white.png" alt="Raven" className="w-7 h-7" />
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: '0.5px' }}>RAVEN</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {step === 'initial' ? (
            <>
              {/* Welcome header */}
              <div className="mb-10">
                <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
                  Welcome to Raven
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }}>
                  The new way to write with confidence
                </p>
              </div>

              {/* OAuth buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleGoogleLogin}
                  style={buttonStyle}
                  className="auth-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Email form */}
              <form onSubmit={handleContinue}>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8, display: 'block' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  style={inputStyle}
                  className="auth-input"
                />
                
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    marginTop: 16,
                    background: 'rgba(163, 163, 120, 0.15)',
                  }}
                  className="auth-btn"
                >
                  Continue
                </button>
              </form>

              {/* Sign up link */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginTop: 24 }}>
                Don't have an account?{' '}
                <Link href="/signup" style={{ color: 'rgba(255,255,255,0.8)' }} className="hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Step 2: Credentials */}
              <div className="mb-10">
                <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
                  Welcome to Raven
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }}>
                  The new way to write with confidence
                </p>
              </div>

              {/* Magic link option */}
              <button
                onClick={handleMagicLink}
                disabled={loading}
                style={buttonStyle}
                className="auth-btn mb-6"
              >
                <Mail className="w-5 h-5" />
                Email sign-in code
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Password form */}
              <form onSubmit={handlePasswordLogin}>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8, display: 'block' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 16 }}
                  className="auth-input"
                />

                <div className="flex items-center justify-between mb-2">
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Forgot your password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    style={{ ...inputStyle, paddingRight: 48 }}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    marginTop: 20,
                    background: 'rgba(163, 163, 120, 0.15)',
                  }}
                  className="auth-btn"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              {/* Message */}
              {message && (
                <p style={{ 
                  color: messageType === 'success' ? '#4ade80' : '#f87171', 
                  fontSize: 14, 
                  textAlign: 'center', 
                  marginTop: 16 
                }}>
                  {message}
                </p>
              )}

              {/* Go back */}
              <button
                onClick={() => setStep('initial')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  margin: '24px auto 0',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Go back
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          <a href="#" className="hover:underline">Terms of Service</a>
          {' and '}
          <a href="#" className="hover:underline">Privacy Policy</a>
        </p>
      </div>

      <style>{`
        .auth-btn:hover {
          background: rgba(163, 163, 120, 0.2) !important;
          border-color: rgba(163, 163, 120, 0.5) !important;
        }
        .auth-input:focus {
          border-color: rgba(163, 163, 120, 0.6) !important;
        }
        .auth-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  )
}