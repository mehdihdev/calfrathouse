'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CardRoot, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card' // Correctly import Card components
import * as Tabs from '@radix-ui/react-tabs' // Import Tabs from Radix UI
import * as Dialog from '@radix-ui/react-dialog' // Import Dialog from Radix UI
import * as Toast from '@radix-ui/react-toast' // Import Toast from Radix UI

export default function DashboardPage() {
  const [user, setUser] = useState<any | null | undefined>(undefined)
  const [housemates, setHousemates] = useState<any[]>([]) // Specify type for housemates
  const [roommates, setRoommates] = useState<any[]>([]) // Specify type for roommates
  const [importantDates, setImportantDates] = useState<any[]>([]) // State for important dates
  const [newDate, setNewDate] = useState({ title: '', date: '' }) // State for adding a new date
  const [darkMode, setDarkMode] = useState(false) // State for light/dark mode
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Separate state for profile picture modal
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false); // Separate state for document modal
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Selected file for upload
  const [dismissedDates, setDismissedDates] = useState<string[]>([]) // Track dismissed dates
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [chores, setChores] = useState<any[]>([]) // State for chores
  const [newChore, setNewChore] = useState<{
    name: string
    dueDate: string
    assignedTo: string[] // Change from never[] to string[]
    repeat: string
  }>({
    name: '',
    dueDate: '',
    assignedTo: [], // Initialize as an empty array of strings
    repeat: 'none',
  }) // State for adding a new chore
  const router = useRouter()
  const [isDateModalOpen, setIsDateModalOpen] = useState(false) // Modal state for important dates
  const [toastMessage, setToastMessage] = useState<string | null>(null) // Toast state
  const [toastType, setToastType] = useState<'success' | 'error' | null>(null); // Toast type state
  const [costs, setCosts] = useState<any[]>([]) // State for costs
  const [documents, setDocuments] = useState<any[]>([]) // State for documents
  const [newDocument, setNewDocument] = useState({ name: '', type: '', file: null }); // Updated to include file

  useEffect(() => {
    // Apply or remove the 'dark' class on the <html> element
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  async function fetchUser() {
    try {
      const res = await fetch('/api/me')
      if (!res.ok) {
        console.error(`Error fetching user: ${res.status} ${res.statusText}`)
        if (res.status === 401) {
          router.push('/login') // Redirect if unauthorized
        }
        return
      }

      const data = await res.json()
      if (!data.user) {
        router.push('/login') // Redirect if user not found
      } else {
        setUser(data.user) // Set the user data

        // Fetch all housemates
        const housematesRes = await fetch('/api/housemates')
        if (!housematesRes.ok) {
          console.error(`Error fetching housemates: ${housematesRes.status} ${housematesRes.statusText}`)
          return
        }
        const housematesData = await housematesRes.json()
        const allHousemates = housematesData.housemates

        // Filter roommates based on room number
        const userRoomNumber = data.user.roomNumber
        const roommates = allHousemates.filter(
          (mate: any) => mate.roomNumber === userRoomNumber && mate.userId !== data.user.userId
        )

        // Set housemates and roommates
        setHousemates(allHousemates.filter((mate: any) => mate.userId !== data.user.userId))
        setRoommates(roommates)
      }
    } catch (err) {
      console.error('Error fetching user:', err)
      router.push('/login') // Redirect on error
    }
  }

  async function fetchImportantDates() {
    try {
      const res = await fetch('/api/important-dates')
      if (!res.ok) {
        console.error(`Error fetching important dates: ${res.status} ${res.statusText}`)
        return
      }
      const data = await res.json()
      setImportantDates(data.dates || [])
    } catch (err) {
      console.error('Error fetching important dates:', err)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchImportantDates()
  }, [router])

  useEffect(() => {
    async function fetchChores() {
      if (!user) return
      try {
        const res = await fetch(`/api/chores?userId=${user.userId}`) // Use query parameter for userId
        if (!res.ok) {
          console.error(`Error fetching chores: ${res.status} ${res.statusText}`)
          return
        }
        const data = await res.json()
        setChores(data.chores || [])
      } catch (err) {
        console.error('Error fetching chores:', err)
      }
    }
    fetchChores()
  }, [user])

  useEffect(() => {
    async function fetchCosts() {
      try {
        const res = await fetch('/api/costs')
        if (!res.ok) {
          console.error(`Error fetching costs: ${res.status} ${res.statusText}`)
          setToastMessage('Failed to fetch costs.')
          return
        }
        const data = await res.json()
        setCosts(data.costs || [])
      } catch (err) {
        console.error('Error fetching costs:', err)
        setToastMessage('Error fetching costs.')
      }
    }
    fetchCosts()
  }, [])

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch('/api/documents')
        if (res.ok) {
          const data = await res.json()
          setDocuments(data.documents || [])
        } else {
          setToastMessage('Failed to fetch documents.')
        }
      } catch (err) {
        console.error('Error fetching documents:', err)
        setToastMessage('Error fetching documents.')
      }
    }
    fetchDocuments()
  }, [])

  const userCosts = useMemo(() => {
    if (!user || !user.costs) return [] // Ensure user and costs are defined
    const now = new Date()
    return user.costs.filter((cost: any) => {
      if (cost.timeframe === -1) return true // One-time cost
      const startDate = new Date(user.createdAt) // Assuming user has a createdAt field
      const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays % cost.timeframe === 0 || diffDays === 0 // Include costs on the first day
    })
  }, [user])

  const totalCost = useMemo(() => {
    return costs.reduce((sum: number, cost: any) => sum + cost.amount, 0)
  }, [costs])

  const [newCost, setNewCost] = useState<{
    name: string
    amount: string
    appliedTo: string[]
    timeframe: string
  }>({
    name: '',
    amount: '',
    appliedTo: [],
    timeframe: ''
  })

  const handleNewCostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'appliedTo' && e.target instanceof HTMLSelectElement) {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
      setNewCost((prev) => ({ ...prev, [name]: selectedOptions }))
    } else {
      setNewCost((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleDeleteCost = async (costId: string) => {
    try {
      const res = await fetch(`/api/costs/${costId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setToastMessage('Cost deleted successfully.')
        setCosts((prev) => prev.filter((cost) => cost._id !== costId))
      } else {
        setToastMessage('Failed to delete cost.')
      }
    } catch (err) {
      console.error('Error deleting cost:', err)
      setToastMessage('Error deleting cost.')
    }
  }

  const handleAddCost = async () => {
    if (!newCost.name || !newCost.amount) {
      setToastMessage('Please provide both a name and an amount for the cost.')
      return
    }

    try {
      const res = await fetch('/api/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCost,
          appliedTo: newCost.appliedTo.length > 0 ? newCost.appliedTo : ['-1'], // Default to all users if none selected
          createdBy: user.userId,
        }),
      })
      if (res.ok) {
        const addedCost = await res.json()
        setToastMessage('Cost added successfully.')
        setCosts((prev) => [...prev, addedCost.cost])
        setNewCost({ name: '', amount: '', appliedTo: [], timeframe: '' })
      } else {
        setToastMessage('Failed to add cost.')
      }
    } catch (err) {
      console.error('Error adding cost:', err)
      setToastMessage('Error adding cost.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      alert('Please select a file and ensure you are logged in.')
      return
    }

    const formData = new FormData()
    formData.append('avatar', selectedFile)

    try {
      const res = await fetch(`/api/avatars/${user.userId}`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        alert('Profile picture updated successfully')
        setIsProfileModalOpen(false)
        setSelectedFile(null) // Clear the selected file
        fetchUser() // Refresh user data
      } else {
        const errorData = await res.json()
        alert(`Failed to upload profile picture: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err)
      alert('Error uploading profile picture')
    }
  }

  const handleAddDate = async () => {
    try {
      const res = await fetch('/api/important-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDate),
      })
      if (res.ok) {
        alert('Important date added successfully')
        setNewDate({ title: '', date: '' })
        setIsDateModalOpen(false) // Close the modal after adding the date
        fetchImportantDates() // Refresh dates
      } else {
        alert('Failed to add important date')
      }
    } catch (err) {
      alert('Error adding important date')
    }
  }

  const handleRemoveDate = async (id: string) => {
    try {
      const res = await fetch(`/api/important-dates/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchImportantDates() // Refresh dates
      } else {
        alert('Failed to remove important date')
      }
    } catch (err) {
      alert('Error removing important date')
    }
  }

  const handleDismissDate = (id: string) => {
    setDismissedDates((prev) => [...prev, id]) // Add the date ID to dismissed dates
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordChange((prev) => ({ ...prev, [name]: value }))
  }

  async function handleChangePassword() {
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setToastMessage('New password and confirm password do not match.');
      setToastType('error');
      return;
    }
  
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId,
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setToastMessage('Password changed successfully.');
        setToastType('success');
        setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setToastMessage(data.error || 'Failed to change password.');
        setToastType('error');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setToastMessage('Error changing password.');
      setToastType('error');
    }
  }

  const handleToggleChore = async (userId: string, choreId: string) => {
    try {
      const res = await fetch(`/api/chores/${userId}:${choreId}`, {
        method: 'PATCH',
      })
      if (res.ok) {
        const updatedChore = await res.json()
        setChores((prev) =>
          prev.map((chore) => (chore._id === choreId ? updatedChore : chore))
        )
      } else {
        alert('Failed to update chore status.')
      }
    } catch (err) {
      console.error('Error updating chore:', err)
    }
  }

  const handleDeleteChore = async (userId: string, choreId: string) => {
    try {
      const res = await fetch(`/api/chores/${userId}:${choreId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setChores((prev) => prev.filter((chore) => chore._id !== choreId))
        setToastMessage('Chore deleted successfully.')
      } else {
        setToastMessage('Failed to delete chore.')
      }
    } catch (err) {
      console.error('Error deleting chore:', err)
      setToastMessage('Error deleting chore.')
    }
  }

  const handleNewChoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'assignedTo' && e.target instanceof HTMLSelectElement) {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
      setNewChore((prev) => ({ ...prev, [name]: selectedOptions }))
    } else {
      setNewChore((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddChore = async () => {
    if (!newChore.name || !newChore.dueDate) {
      setToastMessage('Please provide both a name and a due date for the chore.')
      return
    }

    try {
      const res = await fetch(`/api/chores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newChore, userId: user.userId }), // Include userId in the request body
      })

      if (res.ok) {
        const addedChore = await res.json()
        setChores((prev) => [...prev, addedChore]) // Add the new chore to the list
        setNewChore({ name: '', dueDate: '', assignedTo: [], repeat: 'none' }) // Reset the form
        setToastMessage('Chore added successfully.')
      } else {
        setToastMessage('Failed to add chore.')
      }
    } catch (err) {
      console.error('Error adding chore:', err)
      setToastMessage('Error adding chore.')
    }
  }

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.name || !newDocument.type || !newDocument.file) {
      setToastMessage('All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newDocument.name);
    formData.append('type', newDocument.type);
    formData.append('file', newDocument.file);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const addedDocument = await res.json();
        setDocuments((prev) => [...prev, addedDocument.document]);
        setNewDocument({ name: '', type: '', file: null });
        setIsDocumentModalOpen(false);
        setToastMessage('Document added successfully.');
      } else {
        setToastMessage('Failed to add document.');
      }
    } catch (err) {
      console.error('Error adding document:', err);
      setToastMessage('Error adding document.');
    }
  };

  async function handleDeleteDocument(documentId: string) {
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
        setToastMessage('Document deleted successfully.');
      } else {
        const errorData = await res.json();
        setToastMessage(errorData.error || 'Failed to delete document.');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setToastMessage('Error deleting document.');
    }
  }

  const upcomingDates = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)
    return importantDates.filter((date: any) => {
      const dateObj = new Date(date.date)
      return dateObj >= now && dateObj <= nextWeek && !dismissedDates.includes(date.id)
    })
  }, [importantDates, dismissedDates])

  const allOtherDates = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)
    return importantDates.filter((date: any) => {
      const dateObj = new Date(date.date)
      return dateObj > nextWeek
    })
  }, [importantDates])

  const choresThisMonth = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return chores.flatMap((chore) => {
      const dueDate = new Date(chore.dueDate)

      // If the chore is not repeated and falls within the current month
      if (chore.repeat === 'none' && dueDate >= startOfMonth && dueDate <= endOfMonth) {
        return [chore]
      }

      // Handle repeated chores
      const repeatedChores = []
      let currentDate = new Date(dueDate)

      while (currentDate <= endOfMonth) {
        if (currentDate >= startOfMonth) {
          repeatedChores.push({
            ...chore,
            dueDate: currentDate.toISOString(), // Update the due date for this instance
          })
        }

        // Increment the date based on the repeat frequency
        if (chore.repeat === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7)
        } else if (chore.repeat === 'biweekly') {
          currentDate.setDate(currentDate.getDate() + 14)
        } else if (chore.repeat === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1)
        } else {
          break
        }
      }

      return repeatedChores
    })
  }, [chores])

  const accruedCosts = useMemo(() => {
    if (!user) return []
    return costs.filter((cost) => cost.appliedTo.includes(user.userId) || cost.appliedTo.includes('-1'))
  }, [costs, user])

  const getUserNameById = (userId: string) => {
    if (userId === '-1') return 'Everyone'
    const housemate = housemates.find((mate) => mate.userId === userId)
    return housemate ? `${housemate.firstName} ${housemate.lastName}` : userId
  }

  if (user === undefined) return <div className="text-center mt-10">Loading...</div>

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="bg-gray-800 text-white">
        <div className="w-full mx-auto flex items-center justify-between p-4">
          {/* Logo aligned to the left */}
          <div className="text-xl font-bold flex-shrink-0">calfrathouse</div>

          {/* Buttons aligned to the right */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)} // Toggle dark mode
              className="px-4 py-2 bg-gray-700 text-white rounded"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' })
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
                localStorage.clear()
                sessionStorage.clear()
                router.push('/login')
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        {upcomingDates.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
            <h3 className="font-bold text-yellow-800">Upcoming Important Dates</h3>
            <ul className="mt-2">
              {upcomingDates.map((date: any) => (
                <li key={date.id} className="flex justify-between items-center">
                  <span>{date.title} - {new Date(date.date).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDismissDate(date.id)} // Dismiss the date
                    className="text-red-500 hover:underline"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Tabs.Root defaultValue="profile">
          <Tabs.List>
            <div className="flex space-x-4 border-b pb-2">
              <Tabs.Trigger value="profile" className="px-4 py-2 text-sm font-medium hover:text-gray-500">
                Profile
              </Tabs.Trigger>
              <Tabs.Trigger value="chores" className="px-4 py-2 text-sm font-medium hover:text-gray-500">
                Chores
              </Tabs.Trigger>
              <Tabs.Trigger value="costs" className="px-4 py-2 text-sm font-medium hover:text-gray-500">
                Costs
              </Tabs.Trigger>
              <Tabs.Trigger value="housemates" className="px-4 py-2 text-sm font-medium hover:text-gray-500">
                Housemates
              </Tabs.Trigger>
              <Tabs.Trigger value="documents" className="px-4 py-2 text-sm font-medium hover:text-gray-500">
                Documents
              </Tabs.Trigger>
            </div>
          </Tabs.List>

          <Tabs.Content value="profile" className="mt-4">
            <div className="flex flex-col lg:flex-row lg:space-x-4">
              {/* Profile Card */}
              <CardRoot className="flex-1">
                <CardHeader className="flex flex-col items-center">
                  {/* Profile Picture */}
                  <div className="relative">
                    <img
                      src={`/avatars/${user?.userId}`}
                      alt="Profile Picture"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="mt-2 text-sm text-blue-500 hover:underline"
                    >
                      Edit Profile Picture
                    </button>
                  </div>
                  <CardTitle className="mt-4">{user?.firstName} {user?.lastName}</CardTitle>
                </CardHeader>
                <CardContent className={`${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                  <p>UID: {user?.userId}</p>
                  <p>Room: {user?.roomNumber}</p>
                  <p>Rent: ${user?.rentAmount}</p>
                </CardContent>
                <CardFooter>
                  <button
                    onClick={async () => {
                      await fetch('/api/logout', { method: 'POST' })
                      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
                      localStorage.clear()
                      sessionStorage.clear()
                      router.push('/login')
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Logout
                  </button>
                </CardFooter>
              </CardRoot>

              {/* Important Dates Section */}
              <CardRoot className="flex-1 mt-4 lg:mt-0">
                <CardHeader>
                  <CardTitle>All Important Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  {importantDates.length === 0 ? (
                    <p>No important dates found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {importantDates.map((date: any) => (
                        <li key={date.id} className="flex justify-between items-center">
                          <span>{date.title} - {new Date(date.date).toLocaleDateString()}</span>
                          {user?.admin && (
                            <button
                              onClick={() => handleRemoveDate(date.id)}
                              className="text-red-500 hover:underline"
                            >
                              X
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </CardRoot>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-4 mt-4">
              {/* Change Password Section */}
              <CardRoot className="flex-1">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={passwordChange.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={passwordChange.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={passwordChange.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <button onClick={handleChangePassword} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Change Password
                  </button>
                </CardFooter>
              </CardRoot>
            </div>
          </Tabs.Content>

          <Tabs.Content value="chores" className="mt-4">
            <div className={`flex flex-col ${user?.admin ? 'lg:flex-row lg:space-x-4' : ''}`}>
              {/* Chores This Month */}
              <CardRoot className="flex-1">
                <CardHeader>
                  <CardTitle>Chores This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  {choresThisMonth.length === 0 ? (
                    <p>No chores assigned for this month.</p>
                  ) : (
                    <ul className="space-y-2">
                      {choresThisMonth.map((chore, index) => (
                        <li key={`${chore._id}-${index}`} className="flex justify-between items-center">
                          <span>
                            {chore.name} - Due: {new Date(chore.dueDate).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleToggleChore(user.userId, chore._id)}
                            className={`px-4 py-2 rounded ${
                              chore.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
                            }`}
                          >
                            {chore.completed ? 'Completed' : 'Mark as Done'}
                          </button>
                          <button
                            onClick={() => handleDeleteChore(user.userId, chore._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </CardRoot>

              {/* Add New Chore */}
              {user?.admin && (
                <CardRoot className="flex-1 mt-4 lg:mt-0">
                  <CardHeader>
                    <CardTitle>Add New Chore</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="name"
                        placeholder="Chore Name"
                        value={newChore.name}
                        onChange={handleNewChoreChange}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="date"
                        name="dueDate"
                        value={newChore.dueDate}
                        onChange={handleNewChoreChange}
                        className="w-full p-2 border rounded"
                      />
                      <select
                        name="assignedTo"
                        multiple
                        value={newChore.assignedTo}
                        onChange={handleNewChoreChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="-1">All Roommates</option>
                        <option value={user?.userId}>Myself</option>
                        {housemates.map((mate) => (
                          <option key={mate.userId} value={mate.userId}>
                            {mate.firstName} {mate.lastName}
                          </option>
                        ))}
                        {roommates.map((mate) => (
                          <option key={mate.roomNumber} value={`Room ${mate.roomNumber}`}>
                            Room {mate.roomNumber}
                          </option>
                        ))}
                      </select>
                      <select
                        name="repeat"
                        value={newChore.repeat}
                        onChange={handleNewChoreChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="none">No Repeat</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <button onClick={handleAddChore} className="px-4 py-2 bg-blue-500 text-white rounded">
                      Add Chore
                    </button>
                  </CardFooter>
                </CardRoot>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="costs" className="mt-4">
            <div className={`flex flex-col ${user?.admin ? 'lg:flex-row lg:space-x-4' : ''}`}>
              {/* My Accrued Costs */}
              <CardRoot className="flex-1">
                <CardHeader>
                  <CardTitle>My Accrued Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  {accruedCosts.length === 0 ? (
                    <p>No costs accrued.</p>
                  ) : (
                    <ul className="space-y-2">
                      {accruedCosts.map((cost) => (
                        <li key={cost._id} className="flex justify-between items-center">
                          <span>
                            {cost.name}: ${cost.amount}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </CardRoot>

              {/* Add Costs Section */}
              {user?.admin && (
                <CardRoot className="flex-1 mt-4 lg:mt-0">
                  <CardHeader>
                    <CardTitle>Add New Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="name"
                        placeholder="Cost Name"
                        value={newCost.name}
                        onChange={handleNewCostChange}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={newCost.amount}
                        onChange={handleNewCostChange}
                        className="w-full p-2 border rounded"
                      />
                      <select
                        name="appliedTo"
                        multiple
                        value={newCost.appliedTo}
                        onChange={handleNewCostChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="-1">Everyone</option>
                        <option value={user?.userId}>Myself</option>
                        {housemates.map((mate) => (
                          <option key={mate.userId} value={mate.userId}>
                            {mate.firstName} {mate.lastName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        name="timeframe"
                        placeholder="Timeframe (days, -1 for one-time)"
                        value={newCost.timeframe}
                        onChange={handleNewCostChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <button onClick={handleAddCost} className="px-4 py-2 bg-blue-500 text-white rounded">
                      Add Cost
                    </button>
                  </CardFooter>
                </CardRoot>
              )}

              {/* All Costs with Details */}
              {user?.admin && (
                <CardRoot className="flex-1 mt-4 lg:mt-0">
                  <CardHeader>
                    <CardTitle>All Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {costs.length === 0 ? (
                      <p>No costs found.</p>
                    ) : (
                      <ul className="space-y-2">
                        {costs.map((cost) => (
                          <li key={cost._id} className="flex flex-col space-y-1">
                            <div className="flex justify-between items-center">
                              <span>
                                {cost.name}: ${cost.amount}
                              </span>
                              <button
                                onClick={() => handleDeleteCost(cost._id)}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="text-sm text-gray-500">
                              Applied To: {cost.appliedTo.map(getUserNameById).join(', ')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </CardRoot>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="housemates" className="mt-4">
            <div className="flex flex-col lg:flex-row lg:space-x-4">
              {/* Roommates */}
              <CardRoot className="flex-1">
                <CardHeader>
                  <CardTitle>Roommates</CardTitle>
                </CardHeader>
                <CardContent className={darkMode ? 'text-gray-100' : 'text-gray-700'}>
                  <ul className="list-disc pl-5">
                    {roommates.length > 0 ? (
                      roommates.map((mate) => (
                        <li key={mate.userId} className="flex items-center space-x-4">
                          <img
                            src={`/avatars/${mate.userId}`}
                            alt={`${mate.firstName} ${mate.lastName}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                          />
                          <span>{mate.firstName} {mate.lastName} (Room #{mate.roomNumber})</span>
                        </li>
                      ))
                    ) : (
                      <p>No roommates found.</p>
                    )}
                  </ul>
                </CardContent>
              </CardRoot>

              {/* Housemates */}
              <CardRoot className="flex-1 mt-4 lg:mt-0">
                <CardHeader>
                  <CardTitle>Housemates</CardTitle>
                </CardHeader>
                <CardContent className={darkMode ? 'text-gray-100' : 'text-gray-700'}>
                  <ul className="list-disc pl-5">
                    {housemates.length > 0 ? (
                      housemates.map((mate) => (
                        <li key={mate.userId} className="flex items-center space-x-4">
                          <img
                            src={`/avatars/${mate.userId}`}
                            alt={`${mate.firstName} ${mate.lastName}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                          />
                          <span>{mate.firstName} {mate.lastName} (Room #{mate.roomNumber})</span>
                        </li>
                      ))
                    ) : (
                      <p>No housemates found.</p>
                    )}
                  </ul>
                </CardContent>
              </CardRoot>
            </div>
          </Tabs.Content>

          <Tabs.Content value="documents" className="mt-4">
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Documents</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc._id} className="p-4 border rounded shadow">
                    <h2 className="font-bold">{doc.name}</h2>
                    <p className="text-sm text-gray-600">{doc.type}</p>
                    <div className="mt-2 flex space-x-2">
                      <a
                        href={`/documents/${doc.filename}`} // Correct URL for accessing the document
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                      <a
                        href={`/documents/${doc.filename}`} // Correct URL for downloading the document
                        download
                        className="text-blue-500 hover:underline"
                      >
                        Download
                      </a>
                      {user?.admin && (
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {user?.admin && (
                <>
                  <button
                    onClick={() => setIsDocumentModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Add Document
                  </button>
                  <Dialog.Root open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
                    <Dialog.Portal>
                      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
                      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg">
                        <Dialog.Title className="text-lg font-bold">Add Document</Dialog.Title>
                        <div className="mt-4 space-y-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={newDocument.name}
                            onChange={(e) => setNewDocument((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border rounded"
                          />
                          <input
                            type="text"
                            placeholder="Type"
                            value={newDocument.type}
                            onChange={(e) => setNewDocument((prev) => ({ ...prev, type: e.target.value }))}
                            className="w-full p-2 border rounded"
                          />
                          <input
                            type="file"
                            accept="*"
                            onChange={handleFileUploadChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            onClick={() => setIsDocumentModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-black rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddDocument}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                          >
                            Add
                          </button>
                        </div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </>
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Modal for Uploading Profile Picture */}
      <Dialog.Root open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded shadow-lg">
            <Dialog.Title className="text-lg font-bold">Change Profile Picture</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 dark:text-gray-300">
              Upload a new profile picture.
            </Dialog.Description>
            <label
              htmlFor="file-upload"
              className="mt-4 block w-full px-4 py-2 text-center bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
            >
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {/* Preview Section */}
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Preview:</p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected File Preview"
                  className="mt-2 w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
              </div>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Upload
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal for Adding Important Dates */}
      <Dialog.Root open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded shadow-lg">
            <Dialog.Title className="text-lg font-bold">Add Important Date</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 dark:text-gray-300">
              Fill in the details below to add a new important date.
            </Dialog.Description>
            <div className="mt-4 space-y-2">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={newDate.title}
                onChange={(e) => setNewDate((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                name="date"
                value={newDate.date}
                onChange={(e) => setNewDate((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDate}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add Date
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>


      {/* Toast Notifications */}
      <Toast.Provider>
        {toastMessage && (
          <Toast.Root
            className={`p-4 rounded shadow-lg ${
              toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
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
