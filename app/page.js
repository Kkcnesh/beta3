'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Bug, Target, Zap, Users, Trophy, ArrowRight, Terminal } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('bugcode_token')
    setIsLoggedIn(!!token)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signup')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bug className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">BugCode</span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                  <Button variant="ghost" onClick={() => router.push('/profile')}>Profile</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/auth/login')}>Login</Button>
                  <Button onClick={() => router.push('/auth/signup')}>Sign Up</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4" variant="outline">
            <Terminal className="mr-2 h-3 w-3" />
            Real-World Debugging Practice
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Master Debugging.
            <br />Get Job Ready.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Practice debugging real production bugs. Simulate actual developer workflows.
            Level up your debugging skills with realistic scenarios.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={handleGetStarted} className="group">
              Start Solving Bugs
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/dashboard')}>
              Browse Problems
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Real Bugs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why BugCode?</h2>
            <p className="text-muted-foreground">Not just another coding platform</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Bug className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-World Bugs</h3>
                <p className="text-muted-foreground">
                  Practice fixing actual bugs from production codebases. No artificial problems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Code2 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Debug Mode</h3>
                <p className="text-muted-foreground">
                  Use console.log, analyze stack traces, and debug like you would in real development.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Terminal className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Realistic Logs</h3>
                <p className="text-muted-foreground">
                  See error messages, stack traces, and console output just like in production.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
                <p className="text-muted-foreground">
                  Run your code instantly and see results. Get detailed explanations after solving.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Target className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Timed Challenges</h3>
                <p className="text-muted-foreground">
                  Practice under pressure. Track your progress and improve your debugging speed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-muted-foreground">
                  Learn from others. Compete on leaderboards. Grow together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple, effective, and real</p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Choose a Bug</h3>
                <p className="text-muted-foreground">
                  Browse our collection of real-world bugs. Filter by difficulty, language, or bug type.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Debug the Code</h3>
                <p className="text-muted-foreground">
                  Analyze the broken code, read error messages, add console.logs, and identify the issue.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Fix & Submit</h3>
                <p className="text-muted-foreground">
                  Apply your fix, run test cases, and submit. Get instant feedback and detailed explanations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Learn & Improve</h3>
                <p className="text-muted-foreground">
                  Review the correct solution, understand why the bug happened, and level up your skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Developers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary mr-3"></div>
                  <div>
                    <div className="font-bold">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">Frontend Developer</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "BugCode helped me nail my debugging interview questions. The scenarios are so realistic!"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary mr-3"></div>
                  <div>
                    <div className="font-bold">Marcus Johnson</div>
                    <div className="text-sm text-muted-foreground">Full Stack Engineer</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Finally, a platform that teaches real debugging skills, not just algorithms."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary mr-3"></div>
                  <div>
                    <div className="font-bold">Priya Sharma</div>
                    <div className="text-sm text-muted-foreground">Backend Developer</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The stack traces and error messages feel exactly like production bugs. Great practice!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers improving their debugging skills
          </p>
          <Button size="lg" onClick={handleGetStarted} className="group">
            Start Debugging Now
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bug className="h-6 w-6 text-primary" />
              <span className="font-bold">BugCode</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 BugCode. Master Debugging. Get Job Ready.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}