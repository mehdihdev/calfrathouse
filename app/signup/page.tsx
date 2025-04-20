'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phoneNumber: '', roomNumber: '', rentAmount: ''
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) router.push('/login')
    else alert("Signup failed")
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      {Object.entries(form).map(([key, value]) => (
        <Input
          key={key}
          name={key}
          type={key === 'password' ? 'password' : 'text'}
          placeholder={key}
          value={value}
          onChange={handleChange}
        />
      ))}
      <Button onClick={handleSubmit}>Sign Up</Button>
    </div>
  )
}
