// Path: src/app/(auth)/signup/page.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Eye, EyeOff, ChevronLeft } from 'lucide-react'

export default function SignupPage() {
  const [step, setStep] = useState<'initial' | 'credentials'>('initial')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setStep('credentials')
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
    } else {
      setMessage('Check your email to complete signup!')
    }
    setLoading(false)
  }

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
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
          <img src="/images/raven-logo.png" alt="Raven" className="w-8 h-8" />
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>RAVEN</span>
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
                  Create your account
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }}>
                  Start writing with confidence
                </p>
              </div>

              {/* OAuth buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleGoogleSignup}
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

                <button
                  style={buttonStyle}
                  className="auth-btn"
                  disabled
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="#fff">
                    <path d="M14.94 5.19A4.38 4.38 0 0 0 11.5 4c-1.8 0-3.26 1.12-3.87 2.71-.13.35-.21.73-.21 1.13 0 .4.08.78.21 1.13.61 1.59 2.07 2.71 3.87 2.71a3.87 3.87 0 0 0 2.54-.93c.79-.64 1.32-1.57 1.49-2.68h-4.03V6.1h6.02c.07.38.11.78.11 1.18 0 1.85-.66 3.42-1.81 4.48-1.01.95-2.38 1.51-4.13 1.51-2.48 0-4.62-1.42-5.66-3.49A6.26 6.26 0 0 1 5.36 7c0-.99.23-1.93.67-2.78C7.07 2.15 9.21.73 11.69.73c1.63 0 3.08.54 4.22 1.57l-1.97 1.89z"/>
                  </svg>
                  Continue with Apple
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

              {/* Login link */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginTop: 24 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'rgba(255,255,255,0.8)' }} className="hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Step 2: Credentials */}
              <div className="mb-10">
                <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
                  Create your account
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }}>
                  Start writing with confidence
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
                Email sign-up link
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>or create password</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Password form */}
              <form onSubmit={handlePasswordSignup}>
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

                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8, display: 'block' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
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
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 }}>
                  Must be at least 8 characters
                </p>

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
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              {/* Message */}
              {message && (
                <p style={{ 
                  color: message.includes('Check') ? '#4ade80' : '#f87171', 
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
          By signing up, you agree to our{' '}
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