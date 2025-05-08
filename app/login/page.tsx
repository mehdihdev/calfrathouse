'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Toast from '@radix-ui/react-toast'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          router.push('/dashboard')
        } else {
          setToastMessage(data.message || 'An error occurred. Please try again.')
        }
      } else {
        const errorData = await res.json()
        setToastMessage(errorData.message || 'An error occurred. Please try again.')
      }
    } catch (err) {
      console.error('Error during login:', err)
      setToastMessage('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Logo */}
      <div className="text-4xl font-bold text-gray-800 mb-2">calfrathouse</div>
      <div className="text-sm text-gray-600 mb-8">woo hoo our own house yay</div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-6 rounded shadow-md">
        <div className="space-y-4">
          <Input
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Log In</Button>
        </div>
      </form>

      {/* Toast Notifications */}
      <Toast.Provider>
        {toastMessage && (
          <Toast.Root
            className="bg-red-500 text-white p-4 rounded shadow-lg"
            onOpenChange={() => setToastMessage(null)}
          >
            <Toast.Title>{toastMessage}</Toast.Title>
          </Toast.Root>
        )}
        <Toast.Viewport className="fixed bottom-4 right-4" />
      </Toast.Provider>
    </div>
  )
}