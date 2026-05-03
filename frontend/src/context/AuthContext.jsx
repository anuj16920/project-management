import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import api from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          // Ensure token is ready and valid
          const token = await firebaseUser.getIdToken(true)
          if (token) {
            const res = await api.get('/auth/me')
            setProfile(res.data.data)
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err)
          // If profile fetch fails, user might not be registered yet
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const res  = await api.post('/auth/login', { uid: cred.user.uid })
    setProfile(res.data.data)
    return res.data.data
  }

  const signup = async ({ email, password, fullName, companyName }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: fullName })
    const res  = await api.post('/auth/signup', {
      uid: cred.user.uid, email, fullName, companyName,
    })
    setProfile(res.data.data)
    return res.data.data
  }

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider)
    const res  = await api.post('/auth/google', {
      uid:      cred.user.uid,
      email:    cred.user.email,
      fullName: cred.user.displayName,
      photo:    cred.user.photoURL,
    })
    setProfile(res.data.data)
    return res.data.data
  }

  const forgotPassword = (email) => sendPasswordResetEmail(auth, email)

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}