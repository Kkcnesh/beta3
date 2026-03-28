// Code Execution Service using Piston API
// Free, no API key required, supports 30+ languages

const PISTON_API = 'https://emkc.org/api/v2/piston'

// Piston language identifiers
const PISTON_LANGUAGES = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python:     { language: 'python',     version: '3.10.0'  },
  java:       { language: 'java',       version: '15.0.2'  },
  cpp:        { language: 'c++',        version: '10.2.0'  },
  c:          { language: 'c',          version: '10.2.0'  },
}

export async function executeCode(code, language = 'javascript', testCases) {
  const lang = PISTON_LANGUAGES[language] || PISTON_LANGUAGES.javascript
  const results = []
  const logs = []

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]

    try {
      const response = await fetch(`${PISTON_API}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang.language,
          version: lang.version,
          files: [{ content: code }],
          stdin: testCase.input || '',
        }),
      })

      if (!response.ok) {
        throw new Error(`Piston API error: ${response.status}`)
      }

      const data = await response.json()
      const stdout = data.run?.stdout?.trim() || ''
      const stderr = data.run?.stderr?.trim() || ''
      const output = stdout || stderr

      const expected = testCase.expected?.trim() || ''
      const passed = stdout === expected

      results.push({
        passed,
        output,
        expected,
        input: testCase.input,
        error: stderr || null,
      })

      logs.push(`Test Case ${i + 1}: ${passed ? 'PASSED' : 'FAILED'}`)
      if (!passed) {
        logs.push(`  Expected: ${expected}`)
        logs.push(`  Got:      ${stdout || '(no output)'}`)
        if (stderr) logs.push(`  Error:    ${stderr}`)
      }
    } catch (error) {
      results.push({
        passed: false,
        output: '',
        expected: testCase.expected,
        input: testCase.input,
        error: error.message,
      })
      logs.push(`Test Case ${i + 1}: ERROR - ${error.message}`)
    }
  }

  const allPassed = results.every(r => r.passed)

  return {
    success: allPassed,
    results,
    logs: logs.join('\n'),
    consoleOutput: results.map(r => r.output).filter(Boolean).join('\n'),
  }
}

export function generateStackTrace(error, filename = 'solution.js') {
  return `Error: ${error}
    at ${filename}:12:15
    at Module._compile (internal/modules/cjs/loader.js:1063:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1092:10)
    at Module.load (internal/modules/cjs/loader.js:928:32)`
}
