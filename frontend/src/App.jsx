import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import AppRoutes from '@/routes/index'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" richColors theme="dark" />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}