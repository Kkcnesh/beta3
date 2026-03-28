import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { connectToMongo } from '@/lib/db'
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth'
import { executeCode } from '@/lib/judge0-service'
import { PROBLEMS } from '@/lib/problems-data'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // ==================== AUTH ROUTES ====================
    
    // POST /api/auth/signup
    if (route === '/auth/signup' && method === 'POST') {
      const body = await request.json()
      const { name, email, password } = body

      if (!name || !email || !password) {
        return handleCORS(NextResponse.json(
          { error: 'Name, email, and password are required' },
          { status: 400 }
        ))
      }

      const existingUser = await db.collection('users').findOne({ email })
      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        ))
      }

      const userId = uuidv4()
      const hashedPassword = hashPassword(password)
      
      const user = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        stats: {
          problemsSolved: 0,
          totalSubmissions: 0,
          streak: 0,
          accuracy: 0
        },
        solvedProblems: [],
        createdAt: new Date()
      }

      await db.collection('users').insertOne(user)

      const token = generateToken(userId, email)

      return handleCORS(NextResponse.json({
        message: 'User created successfully',
        token,
        user: { id: userId, name, email, stats: user.stats }
      }))
    }

    // POST /api/auth/login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { email, password } = body

      if (!email || !password) {
        return handleCORS(NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        ))
      }

      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        ))
      }

      const isValidPassword = comparePassword(password, user.password)
      if (!isValidPassword) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        ))
      }

      const token = generateToken(user.id, user.email)

      return handleCORS(NextResponse.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, stats: user.stats }
      }))
    }

    // GET /api/auth/me
    if (route === '/auth/me' && method === 'GET') {
      const userToken = getUserFromRequest(request)
      
      if (!userToken) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const user = await db.collection('users').findOne({ id: userToken.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      return handleCORS(NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        solvedProblems: user.solvedProblems || []
      }))
    }

    // ==================== PROBLEM ROUTES ====================

    // GET /api/problems
    if (route === '/problems' && method === 'GET') {
      const userToken = getUserFromRequest(request)
      let userSolvedProblems = []

      if (userToken) {
        const user = await db.collection('users').findOne({ id: userToken.userId })
        userSolvedProblems = user?.solvedProblems || []
      }

      const problems = PROBLEMS.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags,
        solved: userSolvedProblems.includes(p.id)
      }))

      return handleCORS(NextResponse.json({ problems }))
    }

    // GET /api/problems/:id
    if (route.startsWith('/problems/') && !route.includes('/run') && !route.includes('/submit') && method === 'GET') {
      const problemId = route.split('/')[2]
      const problem = PROBLEMS.find(p => p.id === problemId)

      if (!problem) {
        return handleCORS(NextResponse.json({ error: 'Problem not found' }, { status: 404 }))
      }

      const problemData = {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags,
        description: problem.description,
        // Return starterCode as-is (object or string both work on the frontend)
        starterCode: problem.starterCode,
        hints: problem.hints,
        testCases: problem.testCases.map(tc => ({
          description: tc.description,
        }))
      }

      return handleCORS(NextResponse.json({ problem: problemData }))
    }

    // POST /api/problems/:id/run
    if (route.match(/^\/problems\/[^\/]+\/run$/) && method === 'POST') {
      const problemId = route.split('/')[2]
      const problem = PROBLEMS.find(p => p.id === problemId)

      if (!problem) {
        return handleCORS(NextResponse.json({ error: 'Problem not found' }, { status: 404 }))
      }

      const body = await request.json()
      const { code, language = 'javascript' } = body  // ← accept language, default to javascript

      if (!code) {
        return handleCORS(NextResponse.json({ error: 'Code is required' }, { status: 400 }))
      }

      const testCase = problem.testCases[0]
      const result = await executeCode(code, language, [testCase])  // ← pass language

      return handleCORS(NextResponse.json({
        success: result.success,
        output: result.results[0]?.output || '',
        consoleOutput: result.consoleOutput || '',
        logs: result.logs || '',
        error: result.results[0]?.error || null
      }))
    }

    // POST /api/problems/:id/submit
    if (route.match(/^\/problems\/[^\/]+\/submit$/) && method === 'POST') {
      const problemId = route.split('/')[2]
      const problem = PROBLEMS.find(p => p.id === problemId)

      if (!problem) {
        return handleCORS(NextResponse.json({ error: 'Problem not found' }, { status: 404 }))
      }

      const userToken = getUserFromRequest(request)
      if (!userToken) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized - Please login to submit' },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const { code, language = 'javascript' } = body  // ← accept language, default to javascript

      if (!code) {
        return handleCORS(NextResponse.json({ error: 'Code is required' }, { status: 400 }))
      }

      // Execute code against all test cases with the selected language
      const result = await executeCode(code, language, problem.testCases)  // ← pass language

      const allPassed = result.results.every(r => r.passed)
      const passedCount = result.results.filter(r => r.passed).length
      const totalCount = result.results.length

      const submissionId = uuidv4()
      const submission = {
        id: submissionId,
        userId: userToken.userId,
        problemId: problem.id,
        code,
        language,  // ← store language in submission
        result: allPassed ? 'accepted' : 'failed',
        passedTestCases: passedCount,
        totalTestCases: totalCount,
        timestamp: new Date()
      }

      await db.collection('submissions').insertOne(submission)

      if (allPassed) {
        const user = await db.collection('users').findOne({ id: userToken.userId })
        const solvedProblems = user.solvedProblems || []
        
        if (!solvedProblems.includes(problemId)) {
          await db.collection('users').updateOne(
            { id: userToken.userId },
            {
              $push: { solvedProblems: problemId },
              $inc: { 
                'stats.problemsSolved': 1,
                'stats.totalSubmissions': 1
              },
              $set: {
                'stats.accuracy': ((user.stats.problemsSolved + 1) / (user.stats.totalSubmissions + 1) * 100).toFixed(1)
              }
            }
          )
        } else {
          await db.collection('users').updateOne(
            { id: userToken.userId },
            { $inc: { 'stats.totalSubmissions': 1 } }
          )
        }
      } else {
        await db.collection('users').updateOne(
          { id: userToken.userId },
          { $inc: { 'stats.totalSubmissions': 1 } }
        )
      }

      return handleCORS(NextResponse.json({
        success: allPassed,
        submissionId,
        results: result.results,
        passedCount,
        totalCount,
        logs: result.logs || '',
        consoleOutput: result.consoleOutput || '',
        explanation: allPassed ? problem.explanation : null,
        correctSolution: allPassed ? problem.correctSolution : null
      }))
    }

    // ==================== USER/PROFILE ROUTES ====================

    if (route === '/user/profile' && method === 'GET') {
      const userToken = getUserFromRequest(request)
      
      if (!userToken) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const user = await db.collection('users').findOne({ id: userToken.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      const submissions = await db.collection('submissions')
        .find({ userId: userToken.userId })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray()

      return handleCORS(NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        solvedProblems: user.solvedProblems || [],
        recentSubmissions: submissions.map(s => ({
          id: s.id,
          problemId: s.problemId,
          result: s.result,
          timestamp: s.timestamp
        }))
      }))
    }

    if (route === '/user/profile' && method === 'PUT') {
      const userToken = getUserFromRequest(request)
      if (!userToken) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const { name, currentPassword, newPassword } = await request.json()
      const user = await db.collection('users').findOne({ id: userToken.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      const updates = {}
      if (name?.trim()) updates.name = name.trim()

      if (newPassword) {
        if (!currentPassword) {
          return handleCORS(NextResponse.json({ error: 'Current password is required' }, { status: 400 }))
        }
        const isValid = comparePassword(currentPassword, user.password)
        if (!isValid) {
          return handleCORS(NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 }))
        }
        updates.password = hashPassword(newPassword)
      }

      if (Object.keys(updates).length === 0) {
        return handleCORS(NextResponse.json({ error: 'No changes provided' }, { status: 400 }))
      }

      await db.collection('users').updateOne({ id: userToken.userId }, { $set: updates })
      return handleCORS(NextResponse.json({ success: true, message: 'Profile updated successfully' }))
    }

    if (route === '/user/submissions' && method === 'GET') {
      const userToken = getUserFromRequest(request)
      
      if (!userToken) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const submissions = await db.collection('submissions')
        .find({ userId: userToken.userId })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray()

      return handleCORS(NextResponse.json({
        submissions: submissions.map(s => ({
          id: s.id,
          problemId: s.problemId,
          result: s.result,
          passedTestCases: s.passedTestCases,
          totalTestCases: s.totalTestCases,
          timestamp: s.timestamp
        }))
      }))
    }

    // ==================== LEADERBOARD ====================

    if (route === '/leaderboard' && method === 'GET') {
      const users = await db.collection('users')
        .find({})
        .sort({ 'stats.problemsSolved': -1 })
        .limit(100)
        .toArray()

      return handleCORS(NextResponse.json({
        leaderboard: users.map((u, index) => ({
          rank: index + 1,
          name: u.name,
          problemsSolved: u.stats.problemsSolved,
          accuracy: u.stats.accuracy,
          streak: u.stats.streak
        }))
      }))
    }

    // ==================== HEALTH CHECK ====================

    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: 'BugCode API is running',
        version: '1.0.0'
      }))
    }

    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    ))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
