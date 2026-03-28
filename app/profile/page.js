'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Bug, Trophy, Target, Zap, Calendar, ArrowLeft, LogOut, Pencil } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCurrentPassword, setEditCurrentPassword] = useState('')
  const [editNewPassword, setEditNewPassword] = useState('')
  const [editConfirmPassword, setEditConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('bugcode_token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('bugcode_token')
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setProfile(data)
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      toast.error('Failed to load profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('bugcode_token')
    localStorage.removeItem('bugcode_user')
    router.push('/')
    toast.success('Logged out successfully')
  }

  const openEditModal = () => {
    setEditName(profile.name)
    setEditCurrentPassword('')
    setEditNewPassword('')
    setEditConfirmPassword('')
    setIsEditOpen(true)
  }

  const handleSaveProfile = async () => {
    if (editNewPassword && editNewPassword !== editConfirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (editNewPassword && editNewPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('bugcode_token')
      const body = { name: editName }
      if (editNewPassword) {
        body.currentPassword = editCurrentPassword
        body.newPassword = editNewPassword
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (response.ok) {
        setProfile(prev => ({ ...prev, name: editName.trim() || prev.name }))
        setIsEditOpen(false)
        toast.success('Profile updated successfully')
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  if (!profile) return null

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
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <Button variant="outline" size="sm" onClick={openEditModal}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                </div>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                <div className="text-3xl font-bold">{profile.stats?.problemsSolved || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-500" />
                <div className="text-3xl font-bold">{profile.stats?.totalSubmissions || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div className="text-3xl font-bold">{profile.stats?.accuracy || 0}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Bug className="h-8 w-8 text-green-500" />
                <div className="text-3xl font-bold">{profile.stats?.streak || 0} days</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.recentSubmissions && profile.recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {profile.recentSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => router.push('/problems/' + submission.problemId)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">Problem #{submission.problemId}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(submission.timestamp).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <Badge variant={submission.result === 'accepted' ? 'default' : 'destructive'}>
                        {submission.result === 'accepted' ? 'Accepted' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No submissions yet. Start solving problems!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Solved Problems */}
          <Card>
            <CardHeader>
              <CardTitle>Solved Problems</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.solvedProblems && profile.solvedProblems.length > 0 ? (
                <div className="space-y-2">
                  {profile.solvedProblems.map((problemId) => (
                    <div
                      key={problemId}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 cursor-pointer transition-colors border border-green-500/30"
                      onClick={() => router.push('/problems/' + problemId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="font-medium">Problem #{problemId}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        ✓ Solved
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No problems solved yet. Keep practicing!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={'p-4 rounded-lg text-center ' + (profile.stats?.problemsSolved >= 1 ? 'bg-primary/10' : 'bg-muted/50 opacity-50')}>
                <Trophy className={'h-8 w-8 mx-auto mb-2 ' + (profile.stats?.problemsSolved >= 1 ? 'text-primary' : 'text-muted-foreground')} />
                <div className="font-semibold text-sm">First Bug</div>
                <div className="text-xs text-muted-foreground">Solve 1 problem</div>
              </div>
              <div className={'p-4 rounded-lg text-center ' + (profile.stats?.problemsSolved >= 5 ? 'bg-primary/10' : 'bg-muted/50 opacity-50')}>
                <Bug className={'h-8 w-8 mx-auto mb-2 ' + (profile.stats?.problemsSolved >= 5 ? 'text-primary' : 'text-muted-foreground')} />
                <div className="font-semibold text-sm">Bug Hunter</div>
                <div className="text-xs text-muted-foreground">Solve 5 problems</div>
              </div>
              <div className={'p-4 rounded-lg text-center ' + (profile.stats?.streak >= 7 ? 'bg-primary/10' : 'bg-muted/50 opacity-50')}>
                <Zap className={'h-8 w-8 mx-auto mb-2 ' + (profile.stats?.streak >= 7 ? 'text-primary' : 'text-muted-foreground')} />
                <div className="font-semibold text-sm">Week Warrior</div>
                <div className="text-xs text-muted-foreground">7 day streak</div>
              </div>
              <div className={'p-4 rounded-lg text-center ' + (profile.stats?.accuracy >= 80 ? 'bg-primary/10' : 'bg-muted/50 opacity-50')}>
                <Target className={'h-8 w-8 mx-auto mb-2 ' + (profile.stats?.accuracy >= 80 ? 'text-primary' : 'text-muted-foreground')} />
                <div className="font-semibold text-sm">Sharpshooter</div>
                <div className="text-xs text-muted-foreground">80% accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-3">Change password (optional)</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={editCurrentPassword}
                    onChange={(e) => setEditCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
