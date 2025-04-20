'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [user, setUser] = useState<any | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me')
        const data = await res.json()
        if (!data.user) {
          router.push('/login')
        } else {
          setUser(data.user)
        }
      } catch (err) {
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  if (user === undefined) return <div className="text-center mt-10">Loading...</div>

  return (
    <div className="p-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>{user.firstName} {user.lastName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Room: {user.roomNumber}</p>
          <p>Rent: ${user.rentAmount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rent Paid</CardTitle></CardHeader>
        <CardContent>
          {user.rentPaid.length === 0 ? 'None yet' : user.rentPaid.join(', ')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Chores</CardTitle></CardHeader>
        <CardContent>
          {user.chores.length === 0 ? 'No chores' : user.chores.map((c: any, i: number) => (
            <p key={i}>{c.name} - {c.completed ? '✅' : '❌'}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
