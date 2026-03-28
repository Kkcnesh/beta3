'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bug, Search, Filter, Code2, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [problems, setProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bugcode_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const userData = localStorage.getItem('bugcode_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchProblems()
  }, [])

  useEffect(() => {
    filterProblems()
  }, [searchQuery, difficultyFilter, problems])

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem('bugcode_token')
      const response = await fetch('/api/problems', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        setProblems(data.problems)
        setFilteredProblems(data.problems)
      }
    } catch (error) {
      toast.error('Failed to load problems')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProblems = () => {
    let filtered = problems

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(p => p.difficulty === difficultyFilter)
    }

    setFilteredProblems(filtered)
  }

  const handleLogout = () => {
    localStorage.removeItem('bugcode_token')
    localStorage.removeItem('bugcode_user')
    router.push('/')
    toast.success('Logged out successfully')
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'Hard': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
              <Bug className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">BugCode</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="ghost" onClick={() => router.push('/profile')}>
                Profile
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Debug Challenges</h1>
          <p className="text-muted-foreground">
            Practice debugging real-world bugs. Click on any problem to start.
          </p>
        </div>

        {/* Stats */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{user.stats?.problemsSolved || 0}</div>
                <div className="text-sm text-muted-foreground">Problems Solved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{problems.length}</div>
                <div className="text-sm text-muted-foreground">Total Problems</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{user.stats?.streak || 0}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{user.stats?.accuracy || 0}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems by title or tags..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Easy', 'Medium', 'Hard'].map(level => (
              <Button
                key={level}
                variant={difficultyFilter === level ? 'default' : 'outline'}
                onClick={() => setDifficultyFilter(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Problems List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading problems...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProblems.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No problems found matching your filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredProblems.map((problem) => (
                <Card 
                  key={problem.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => router.push(`/problems/${problem.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{problem.title}</CardTitle>
                          {problem.solved && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                              ✓ Solved
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge className={getDifficultyColor(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                          {problem.tags.map(tag => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </CardDescription>
                      </div>
                      <Code2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}