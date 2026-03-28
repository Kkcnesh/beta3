'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Bug,
  Play,
  Send,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Terminal,
  Lightbulb,
  Code2,
  FileCode2
} from 'lucide-react'
import { toast } from 'sonner'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

// Supported languages config
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'python',     label: 'Python',     monaco: 'python'     },
  { id: 'java',       label: 'Java',        monaco: 'java'       },
  { id: 'cpp',        label: 'C++',         monaco: 'cpp'        },
  { id: 'c',          label: 'C',           monaco: 'c'          },
]

// Default starter code per language if problem doesn't provide one
const DEFAULT_STARTER = {
  javascript: '// Write your solution here\n',
  python:     '# Write your solution here\n',
  java:       '// Write your solution here\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n',
  cpp:        '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  c:          '// Write your solution here\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n',
}

// Get starter code for the selected language from the problem
function getStarterCode(problem, langId) {
  if (!problem) return DEFAULT_STARTER[langId] || ''
  const sc = problem.starterCode
  // If starterCode is an object keyed by language, use that
  if (sc && typeof sc === 'object' && !Array.isArray(sc)) {
    return sc[langId] || DEFAULT_STARTER[langId] || ''
  }
  // Otherwise it's a plain string (JavaScript only) — use it for JS, fallback for others
  if (langId === 'javascript') return sc || DEFAULT_STARTER.javascript
  return DEFAULT_STARTER[langId] || ''
}

export default function ProblemPage() {
  const router = useRouter()
  const params = useParams()
  const problemId = params.id

  const [problem, setProblem] = useState(null)
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [output, setOutput] = useState(null)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [activeTab, setActiveTab] = useState('description')

  // Multi-file state
  const [fileContents, setFileContents] = useState({})
  const [activeFile, setActiveFile] = useState(null)
  const codeRef = useRef(code)
  codeRef.current = code

  useEffect(() => {
    const token = localStorage.getItem('bugcode_token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchProblem()
  }, [problemId])

  // When language changes, swap starter code
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    if (problem?.files && newLang === 'javascript') {
      // Reset file tabs to original content
      const freshContents = {}
      problem.files.forEach(f => { freshContents[f.name] = f.content })
      setFileContents(freshContents)
      setActiveFile(problem.files[0].name)
      setCode(problem.files[0].content)
    } else {
      setCode(getStarterCode(problem, newLang))
    }
    setOutput(null)
    setSubmissionResult(null)
  }

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${problemId}`)
      const data = await response.json()

      if (response.ok) {
        setProblem(data.problem)
        // Initialize multi-file state if problem has files
        if (data.problem.files && data.problem.files.length > 0) {
          const contents = {}
          data.problem.files.forEach(f => { contents[f.name] = f.content })
          setFileContents(contents)
          setActiveFile(data.problem.files[0].name)
          setCode(data.problem.files[0].content)
        } else {
          setCode(getStarterCode(data.problem, 'javascript'))
        }
      } else {
        toast.error('Problem not found')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Failed to load problem')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Switch between file tabs — saves current editor content first
  const switchFile = (fileName) => {
    if (fileName === activeFile) return
    setFileContents(prev => ({ ...prev, [activeFile]: codeRef.current }))
    setActiveFile(fileName)
    setCode(fileContents[fileName])
  }

  // Build the code to submit: concatenate all files for multi-file problems
  const buildSubmitCode = () => {
    if (problem?.files && language === 'javascript') {
      // Save latest editor value for the active file, then concatenate all
      const latestContents = { ...fileContents, [activeFile]: codeRef.current }
      return problem.files.map(f => latestContents[f.name] ?? f.content).join('\n\n')
    }
    return codeRef.current
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput(null)
    setSubmissionResult(null)
    setActiveTab('output')

    try {
      const token = localStorage.getItem('bugcode_token')
      const codeToSubmit = buildSubmitCode()
      const response = await fetch(`/api/problems/${problemId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: codeToSubmit, language })
      })

      const data = await response.json()
      setOutput(data)

      if (data.error) {
        toast.error('Runtime error occurred')
      } else {
        toast.success('Code executed successfully')
      }
    } catch (error) {
      toast.error('Failed to run code')
      console.error(error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmissionResult(null)
    setActiveTab('output')

    try {
      const token = localStorage.getItem('bugcode_token')
      const codeToSubmit = buildSubmitCode()
      const response = await fetch(`/api/problems/${problemId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: codeToSubmit, language })
      })

      const data = await response.json()
      setSubmissionResult(data)

      if (data.success) {
        toast.success(`All test cases passed! ${data.passedCount}/${data.totalCount}`)
      } else {
        toast.error(`Some test cases failed: ${data.passedCount}/${data.totalCount}`)
      }
    } catch (error) {
      toast.error('Failed to submit solution')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy':   return 'bg-green-500/10 text-green-500'
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500'
      case 'Hard':   return 'bg-red-500/10 text-red-500'
      default:       return 'bg-gray-500/10 text-gray-500'
    }
  }

  const currentMonacoLang = LANGUAGES.find(l => l.id === language)?.monaco || 'javascript'
  const isMultiFile = problem?.files && problem.files.length > 0 && language === 'javascript'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading problem...</div>
      </div>
    )
  }

  if (!problem) return null

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Bug className="h-5 w-5 text-primary" />
              <span className="font-bold">BugCode</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
            >
              <Play className="mr-2 h-4 w-4" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getDifficultyColor(problem.difficulty)}>
                {problem.difficulty}
              </Badge>
              {problem.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="hints">Hints</TabsTrigger>
                  <TabsTrigger value="output">
                    {output || submissionResult ? (
                      <span className="flex items-center">
                        <Terminal className="mr-2 h-4 w-4" />
                        Output
                      </span>
                    ) : 'Output'}
                  </TabsTrigger>
                  {submissionResult?.success && (
                    <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Problem</h3>
                    <div className="text-muted-foreground whitespace-pre-wrap">
                      {problem.description}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Test Cases</h3>
                    <div className="space-y-3">
                      {problem.testCases.map((tc, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <div className="text-sm text-muted-foreground">
                              {tc.description}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hints" className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Hints</h3>
                  </div>
                  {problem.hints.map((hint, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                          <div className="text-muted-foreground flex-1">{hint}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="output" className="space-y-4">
                  {!output && !submissionResult && (
                    <Card>
                      <CardContent className="pt-6 text-center py-12">
                        <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Run your code to see output here</p>
                      </CardContent>
                    </Card>
                  )}

                  {output && !submissionResult && (
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-4">
                          <h3 className="font-semibold mb-2">Console Output</h3>
                          <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                            {output.consoleOutput || output.output || 'No output'}
                          </pre>
                        </CardContent>
                      </Card>
                      {output.error && (
                        <Card className="border-red-500/50">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="h-5 w-5 text-red-500" />
                              <h3 className="font-semibold text-red-500">Error</h3>
                            </div>
                            <pre className="bg-red-500/10 p-3 rounded text-sm overflow-x-auto text-red-500">
                              {output.error}
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                      {output.logs && (
                        <Card>
                          <CardContent className="pt-4">
                            <h3 className="font-semibold mb-2">Logs</h3>
                            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                              {output.logs}
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {submissionResult && (
                    <div className="space-y-4">
                      <Card className={submissionResult.success ? 'border-green-500/50' : 'border-red-500/50'}>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-4">
                            {submissionResult.success ? (
                              <>
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                <h3 className="font-semibold text-green-500 text-lg">Accepted</h3>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-6 w-6 text-red-500" />
                                <h3 className="font-semibold text-red-500 text-lg">Wrong Answer</h3>
                              </>
                            )}
                          </div>
                          <div className="text-lg font-semibold">
                            {submissionResult.passedCount} / {submissionResult.totalCount} test cases passed
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-3">
                        <h3 className="font-semibold">Test Cases</h3>
                        {submissionResult.results.map((result, idx) => (
                          <Card key={idx} className={result.passed ? 'border-green-500/30' : 'border-red-500/30'}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {result.passed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="font-semibold">Test Case {idx + 1}</span>
                                </div>
                                <Badge variant={result.passed ? 'default' : 'destructive'}>
                                  {result.passed ? 'Passed' : 'Failed'}
                                </Badge>
                              </div>
                              {!result.passed && (
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <div className="text-muted-foreground">Expected:</div>
                                    <div className="bg-muted p-2 rounded font-mono">{result.expected}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Your Output:</div>
                                    <div className="bg-red-500/10 p-2 rounded font-mono text-red-500">
                                      {result.output || '(no output)'}
                                    </div>
                                  </div>
                                  {result.error && (
                                    <div>
                                      <div className="text-muted-foreground">Error:</div>
                                      <div className="bg-red-500/10 p-2 rounded font-mono text-red-500 text-xs">
                                        {result.error}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {submissionResult.consoleOutput && (
                        <Card>
                          <CardContent className="pt-4">
                            <h3 className="font-semibold mb-2">Console Output</h3>
                            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                              {submissionResult.consoleOutput}
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>

                {submissionResult?.success && (
                  <TabsContent value="explanation" className="space-y-4">
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          Explanation
                        </h3>
                        <div className="text-muted-foreground whitespace-pre-wrap">
                          {submissionResult.explanation}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Code2 className="h-5 w-5 text-primary" />
                          Correct Solution
                        </h3>
                        <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                          {submissionResult.correctSolution}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor toolbar */}
          <div className="border-b border-border bg-muted/50">
            {/* File tabs for multi-file problems */}
            {isMultiFile && (
              <div className="flex items-center gap-0 px-2 pt-2 overflow-x-auto border-b border-border">
                {problem.files.map(f => (
                  <button
                    key={f.name}
                    onClick={() => switchFile(f.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t border-t border-l border-r transition-colors whitespace-nowrap ${
                      activeFile === f.name
                        ? 'bg-background border-border text-foreground -mb-px'
                        : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <FileCode2 className="h-3 w-3" />
                    {f.name}
                  </button>
                ))}
              </div>
            )}
            {/* Language selector row */}
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">
                {isMultiFile ? `Editing: ${activeFile}` : 'Code Editor'}
              </span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={isRunning || isSubmitting}
                className="text-sm bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={currentMonacoLang}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
