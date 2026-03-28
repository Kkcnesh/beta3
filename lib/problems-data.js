// 45 Debugging Problems - Multi-language, sorted Easy → Medium → Hard

export const PROBLEMS = [

  // ═══════════════════════════════════════════════
  // EASY (1-5, 16-25)
  // ═══════════════════════════════════════════════

  {
    id: '1',
    title: 'Array Sum Bug',
    difficulty: 'Easy',
    tags: ['Arrays', 'Loops', 'Off-by-one'],
    description: `You're implementing a function to sum all elements in an array. The code runs but returns the wrong answer — it includes an extra undefined value in the calculation.

**Your Task:**
Fix the off-by-one error in the loop so it sums all elements correctly.

**Expected Behavior:**
- sumArray([1, 2, 3, 4, 5]) → 15
- sumArray([10, 20, 30]) → 60`,

    files: [
      { name: 'arrayUtils.js', content: '// Array helper utilities\nfunction createRange(start, count) {\n  return Array.from({ length: count }, (_, i) => start + i);\n}\n\nfunction formatResult(label, value) {\n  return label + \': \' + value;\n}' },
      { name: 'solution.js', content: 'function sumArray(numbers) {\n  let sum = 0;\n  // BUG: loop goes one step too far\n  for (let i = 0; i <= numbers.length; i++) {\n    sum += numbers[i];\n  }\n  return sum;\n}\n\nconsole.log(sumArray([1, 2, 3, 4, 5]));\nconsole.log(sumArray([10, 20, 30]));' }
    ],

    starterCode: {
      javascript: `function sumArray(numbers) {
  let sum = 0;
  // BUG: loop goes one step too far
  for (let i = 0; i <= numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}

console.log(sumArray([1, 2, 3, 4, 5]));
console.log(sumArray([10, 20, 30]));`,

      python: `def sum_array(numbers):
    total = 0
    # BUG: loop goes one step too far
    for i in range(len(numbers) + 1):
        total += numbers[i]
    return total

print(sum_array([1, 2, 3, 4, 5]))
print(sum_array([10, 20, 30]))`,

      java: `public class Solution {
    static int sumArray(int[] numbers) {
        int sum = 0;
        // BUG: loop goes one step too far
        for (int i = 0; i <= numbers.length; i++) {
            sum += numbers[i];
        }
        return sum;
    }
    public static void main(String[] args) {
        System.out.println(sumArray(new int[]{1, 2, 3, 4, 5}));
        System.out.println(sumArray(new int[]{10, 20, 30}));
    }
}`,

      cpp: `#include <iostream>
#include <vector>
using namespace std;

int sumArray(vector<int> numbers) {
    int sum = 0;
    // BUG: loop goes one step too far
    for (int i = 0; i <= (int)numbers.size(); i++) {
        sum += numbers[i];
    }
    return sum;
}

int main() {
    cout << sumArray({1, 2, 3, 4, 5}) << endl;
    cout << sumArray({10, 20, 30}) << endl;
    return 0;
}`,

      c: `#include <stdio.h>

int sumArray(int numbers[], int len) {
    int sum = 0;
    // BUG: loop goes one step too far
    for (int i = 0; i <= len; i++) {
        sum += numbers[i];
    }
    return sum;
}

int main() {
    int a[] = {1, 2, 3, 4, 5};
    int b[] = {10, 20, 30};
    printf("%d\n", sumArray(a, 5));
    printf("%d\n", sumArray(b, 3));
    return 0;
}`,
    },

    correctSolution: `function sumArray(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}
console.log(sumArray([1, 2, 3, 4, 5]));
console.log(sumArray([10, 20, 30]));`,

    testCases: [
      {
        input: '',
        expected: '15\n60',
        description: 'sumArray([1,2,3,4,5]) → 15, sumArray([10,20,30]) → 60'
      }
    ],

    explanation: `**The Bug:**
The loop condition i <= numbers.length lets i reach an index that doesn't exist. Accessing it returns undefined, corrupting the sum.

**The Fix:**
Change <= to < so the loop stops at the last valid index (length - 1).

**Key Learning:**
Arrays are zero-indexed. Valid indices run from 0 to length - 1. Always use < not <= when iterating with an index.`,

    hints: [
      'What are the valid indices for an array of length n?',
      'Try logging the value of i on each iteration',
      'The last valid index is length - 1, not length'
    ]
  },

  {
    id: '2',
    title: 'String Reversal Bug',
    difficulty: 'Easy',
    tags: ['Strings', 'Loops', 'Logic'],
    description: `You're writing a function to reverse a string. It almost works, but the output is missing the first character every time.

**Your Task:**
Fix the loop so the reversed string includes every character.

**Expected Behavior:**
- reverseString("hello") → "olleh"
- reverseString("world") → "dlrow"`,

    files: [
      { name: 'stringUtils.js', content: '// String helper utilities\nfunction getLength(str) {\n  return str.length;\n}\n\nfunction isEmpty(str) {\n  return str.length === 0;\n}' },
      { name: 'solution.js', content: 'function reverseString(str) {\n  let reversed = \'\';\n  // BUG: loop misses the first character\n  for (let i = str.length - 1; i > 0; i--) {\n    reversed += str[i];\n  }\n  return reversed;\n}\n\nconsole.log(reverseString("hello"));\nconsole.log(reverseString("world"));' }
    ],

    starterCode: {
      javascript: `function reverseString(str) {
  let reversed = '';
  // BUG: loop misses the first character
  for (let i = str.length - 1; i > 0; i--) {
    reversed += str[i];
  }
  return reversed;
}

console.log(reverseString("hello"));
console.log(reverseString("world"));`,

      python: `def reverse_string(s):
    reversed_str = ''
    # BUG: loop misses the first character
    for i in range(len(s) - 1, 0, -1):
        reversed_str += s[i]
    return reversed_str

print(reverse_string("hello"))
print(reverse_string("world"))`,

      java: `public class Solution {
    static String reverseString(String str) {
        StringBuilder reversed = new StringBuilder();
        // BUG: loop misses the first character
        for (int i = str.length() - 1; i > 0; i--) {
            reversed.append(str.charAt(i));
        }
        return reversed.toString();
    }
    public static void main(String[] args) {
        System.out.println(reverseString("hello"));
        System.out.println(reverseString("world"));
    }
}`,

      cpp: `#include <iostream>
#include <string>
using namespace std;

string reverseString(string str) {
    string reversed = "";
    // BUG: loop misses the first character
    for (int i = str.length() - 1; i > 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

int main() {
    cout << reverseString("hello") << endl;
    cout << reverseString("world") << endl;
    return 0;
}`,

      c: `#include <stdio.h>
#include <string.h>

void reverseString(const char* str, char* out) {
    int len = strlen(str);
    int j = 0;
    // BUG: loop misses the first character
    for (int i = len - 1; i > 0; i--) {
        out[j++] = str[i];
    }
    out[j] = '\0';
}

int main() {
    char result[100];
    reverseString("hello", result);
    printf("%s\n", result);
    reverseString("world", result);
    printf("%s\n", result);
    return 0;
}`,
    },

    correctSolution: `function reverseString(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}
console.log(reverseString("hello"));
console.log(reverseString("world"));`,

    testCases: [
      {
        input: '',
        expected: 'olleh\ndlrow',
        description: 'reverseString("hello") → "olleh", reverseString("world") → "dlrow"'
      }
    ],

    explanation: `**The Bug:**
The loop condition i > 0 stops before reaching index 0, so the first character is never appended.

**The Fix:**
Change i > 0 to i >= 0 so index 0 is included.

**Key Learning:**
When iterating backwards, use >= 0 as your stop condition unless you explicitly want to skip the first element.`,

    hints: [
      'What index does the loop stop at?',
      'Trace through "hello" — which characters get added?',
      'The first character is at index 0 — is it ever reached?'
    ]
  },

  {
    id: '3',
    title: 'FizzBuzz Wrong Output',
    difficulty: 'Easy',
    tags: ['Conditionals', 'Modulo', 'Logic'],
    description: `The classic FizzBuzz — but someone swapped the condition order. Numbers divisible by both 3 and 15 are printing "Fizz" instead of "FizzBuzz".

**Your Task:**
Fix the condition order so FizzBuzz prints correctly.

**Rules:**
- Divisible by 15 → "FizzBuzz"
- Divisible by 3 → "Fizz"
- Divisible by 5 → "Buzz"
- Otherwise → the number itself

**Expected output for 1–15:**
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz`,

    files: [
      { name: 'mathUtils.js', content: '// Math helper utilities\nfunction isDivisibleBy(n, divisor) {\n  return n % divisor === 0;\n}\n\nfunction range(start, end) {\n  return Array.from({ length: end - start + 1 }, (_, i) => start + i);\n}' },
      { name: 'solution.js', content: 'function fizzBuzz(n) {\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    // BUG: wrong condition order — FizzBuzz check must come first\n    if (i % 3 === 0) {\n      result.push(\'Fizz\');\n    } else if (i % 5 === 0) {\n      result.push(\'Buzz\');\n    } else if (i % 15 === 0) {\n      result.push(\'FizzBuzz\');\n    } else {\n      result.push(String(i));\n    }\n  }\n  return result.join(\', \');\n}\n\nconsole.log(fizzBuzz(15));' }
    ],

    starterCode: {
      javascript: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    // BUG: wrong condition order
    if (i % 3 === 0) {
      result.push('Fizz');
    } else if (i % 5 === 0) {
      result.push('Buzz');
    } else if (i % 15 === 0) {
      result.push('FizzBuzz');
    } else {
      result.push(String(i));
    }
  }
  return result.join(', ');
}

console.log(fizzBuzz(15));`,

      python: `def fizz_buzz(n):
    result = []
    for i in range(1, n + 1):
        # BUG: wrong condition order
        if i % 3 == 0:
            result.append('Fizz')
        elif i % 5 == 0:
            result.append('Buzz')
        elif i % 15 == 0:
            result.append('FizzBuzz')
        else:
            result.append(str(i))
    return ', '.join(result)

print(fizz_buzz(15))`,

      java: `public class Solution {
    static String fizzBuzz(int n) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= n; i++) {
            // BUG: wrong condition order
            if (i % 3 == 0) {
                sb.append("Fizz");
            } else if (i % 5 == 0) {
                sb.append("Buzz");
            } else if (i % 15 == 0) {
                sb.append("FizzBuzz");
            } else {
                sb.append(i);
            }
            if (i < n) sb.append(", ");
        }
        return sb.toString();
    }
    public static void main(String[] args) {
        System.out.println(fizzBuzz(15));
    }
}`,

      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    for (int i = 1; i <= 15; i++) {
        // BUG: wrong condition order
        if (i % 3 == 0) {
            cout << "Fizz";
        } else if (i % 5 == 0) {
            cout << "Buzz";
        } else if (i % 15 == 0) {
            cout << "FizzBuzz";
        } else {
            cout << i;
        }
        if (i < 15) cout << ", ";
    }
    cout << endl;
    return 0;
}`,

      c: `#include <stdio.h>

int main() {
    for (int i = 1; i <= 15; i++) {
        // BUG: wrong condition order
        if (i % 3 == 0) {
            printf("Fizz");
        } else if (i % 5 == 0) {
            printf("Buzz");
        } else if (i % 15 == 0) {
            printf("FizzBuzz");
        } else {
            printf("%d", i);
        }
        if (i < 15) printf(", ");
    }
    printf("\n");
    return 0;
}`,
    },

    correctSolution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push('FizzBuzz');
    else if (i % 3 === 0) result.push('Fizz');
    else if (i % 5 === 0) result.push('Buzz');
    else result.push(String(i));
  }
  return result.join(', ');
}
console.log(fizzBuzz(15));`,

    testCases: [
      {
        input: '',
        expected: '1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz',
        description: 'FizzBuzz from 1 to 15'
      }
    ],

    explanation: `**The Bug:**
The i % 15 check comes last, but 15 is also divisible by 3, so the i % 3 branch always fires first for multiples of 15 — "FizzBuzz" is unreachable.

**The Fix:**
Check i % 15 first, before i % 3 and i % 5.

**Key Learning:**
In if-else chains, order matters. More specific conditions must come before broader ones that would match first.`,

    hints: [
      'Is 15 divisible by 3? What happens when i = 15?',
      'Which branch fires first in an if-else chain?',
      'The most specific condition should be checked first'
    ]
  },

  {
    id: '4',
    title: 'Factorial Returns Zero',
    difficulty: 'Easy',
    tags: ['Recursion', 'Base Cases', 'Math'],
    description: `A recursive factorial function always returns 0. The logic looks right at first glance, but the base case is wrong.

**Your Task:**
Fix the base case so the function returns correct factorial values.

**Expected Behavior:**
- factorial(5) → 120
- factorial(0) → 1
- factorial(7) → 5040`,

    files: [
      { name: 'mathHelpers.js', content: '// Math helper functions\nfunction multiply(a, b) {\n  return a * b;\n}\n\nfunction isNonNegative(n) {\n  return n >= 0;\n}' },
      { name: 'solution.js', content: 'function factorial(n) {\n  // BUG: wrong base case — should return 1, not 0\n  if (n === 0) return 0;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));\nconsole.log(factorial(0));\nconsole.log(factorial(7));' }
    ],

    starterCode: {
      javascript: `function factorial(n) {
  // BUG: wrong base case
  if (n === 0) return 0;
  return n * factorial(n - 1);
}

console.log(factorial(5));
console.log(factorial(0));
console.log(factorial(7));`,

      python: `def factorial(n):
    # BUG: wrong base case
    if n == 0:
        return 0
    return n * factorial(n - 1)

print(factorial(5))
print(factorial(0))
print(factorial(7))`,

      java: `public class Solution {
    static long factorial(int n) {
        // BUG: wrong base case
        if (n == 0) return 0;
        return n * factorial(n - 1);
    }
    public static void main(String[] args) {
        System.out.println(factorial(5));
        System.out.println(factorial(0));
        System.out.println(factorial(7));
    }
}`,

      cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // BUG: wrong base case
    if (n == 0) return 0;
    return n * factorial(n - 1);
}

int main() {
    cout << factorial(5) << endl;
    cout << factorial(0) << endl;
    cout << factorial(7) << endl;
    return 0;
}`,

      c: `#include <stdio.h>

long long factorial(int n) {
    // BUG: wrong base case
    if (n == 0) return 0;
    return n * factorial(n - 1);
}

int main() {
    printf("%lld\n", factorial(5));
    printf("%lld\n", factorial(0));
    printf("%lld\n", factorial(7));
    return 0;
}`,
    },

    correctSolution: `function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}
console.log(factorial(5));
console.log(factorial(0));
console.log(factorial(7));`,

    testCases: [
      {
        input: '',
        expected: '120\n1\n5040',
        description: 'factorial(5) → 120, factorial(0) → 1, factorial(7) → 5040'
      }
    ],

    explanation: `**The Bug:**
The base case returns 0 instead of 1. Since every recursive call eventually multiplies by the base case, returning 0 causes the entire chain to evaluate to 0.

**The Fix:**
Return 1 when n === 0. By definition, 0! = 1.

**Key Learning:**
In recursion, the base case determines what the entire chain resolves to through multiplication. Getting it wrong poisons every result.`,

    hints: [
      'What is 0! mathematically?',
      'Trace factorial(3) step by step — what does each call return?',
      'When recursion bottoms out, what value propagates back up?'
    ]
  },

  {
    id: '5',
    title: 'Temperature Converter Bug',
    difficulty: 'Easy',
    tags: ['Math', 'Operators', 'Precedence'],
    description: `A Celsius to Fahrenheit converter is giving wrong results. The formula looks correct but operator precedence is causing the bug.

**Formula:** F = (C × 9/5) + 32

**Your Task:**
Fix the formula so it produces correct conversions.

**Expected Behavior:**
- celsiusToFahrenheit(0) → 32
- celsiusToFahrenheit(100) → 212
- celsiusToFahrenheit(-40) → -40`,

    files: [
      { name: 'converterUtils.js', content: '// Unit conversion helpers\nfunction fahrenheitToCelsius(f) {\n  return (f - 32) * 5 / 9;\n}\n\nfunction roundToOne(num) {\n  return Math.round(num * 10) / 10;\n}' },
      { name: 'solution.js', content: 'function convert(celsius) {\n  // BUG: addition happens before multiplication due to missing parentheses\n  return celsius * (9 / 5 + 32);\n}\n\nconsole.log(convert(0));\nconsole.log(convert(100));\nconsole.log(convert(-40));' }
    ],

    starterCode: {
      javascript: `function celsiusToFahrenheit(celsius) {
  // BUG: operator precedence issue
  return celsius * 9 / 5 + 32;
}

// Wait — look more carefully at this version:
function celsiusToFahrenheitBroken(celsius) {
  // BUG: missing parentheses changes the math
  return celsius * 9 / 5 + 32 - 0;
}

// Actually the real bug is here — the addition happens before multiplication:
function convert(celsius) {
  // BUG: addition happens before multiplication due to missing parentheses
  return celsius * (9 / 5 + 32);
}

console.log(convert(0));
console.log(convert(100));
console.log(convert(-40));`,

      python: `def celsius_to_fahrenheit(celsius):
    # BUG: addition happens before multiplication due to missing parentheses
    return celsius * (9 / 5 + 32)

print(celsius_to_fahrenheit(0))
print(celsius_to_fahrenheit(100))
print(celsius_to_fahrenheit(-40))`,

      java: `public class Solution {
    static double celsiusToFahrenheit(double celsius) {
        // BUG: addition happens before multiplication due to missing parentheses
        return celsius * (9.0 / 5.0 + 32);
    }
    public static void main(String[] args) {
        System.out.println((int)celsiusToFahrenheit(0));
        System.out.println((int)celsiusToFahrenheit(100));
        System.out.println((int)celsiusToFahrenheit(-40));
    }
}`,

      cpp: `#include <iostream>
using namespace std;

double celsiusToFahrenheit(double celsius) {
    // BUG: addition happens before multiplication due to missing parentheses
    return celsius * (9.0 / 5.0 + 32);
}

int main() {
    cout << (int)celsiusToFahrenheit(0) << endl;
    cout << (int)celsiusToFahrenheit(100) << endl;
    cout << (int)celsiusToFahrenheit(-40) << endl;
    return 0;
}`,

      c: `#include <stdio.h>

double celsiusToFahrenheit(double celsius) {
    // BUG: addition happens before multiplication due to missing parentheses
    return celsius * (9.0 / 5.0 + 32);
}

int main() {
    printf("%d\n", (int)celsiusToFahrenheit(0));
    printf("%d\n", (int)celsiusToFahrenheit(100));
    printf("%d\n", (int)celsiusToFahrenheit(-40));
    return 0;
}`,
    },

    correctSolution: `function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}
console.log(celsiusToFahrenheit(0));
console.log(celsiusToFahrenheit(100));
console.log(celsiusToFahrenheit(-40));`,

    testCases: [
      {
        input: '',
        expected: '0\n212\n-40',
        description: '0°C→32°F, 100°C→212°F, -40°C→-40°F'
      }
    ],

    explanation: `**The Bug:**
The formula celsius * (9/5 + 32) computes 9/5 + 32 = 33.8 first, then multiplies by celsius. The correct formula is (celsius * 9/5) + 32 — multiply first, then add 32.

**The Fix:**
Move the + 32 outside the parentheses so multiplication happens before addition.

**Key Learning:**
Parentheses control evaluation order. Always double-check formulas by tracing a known value (e.g., 0°C should give 32°F).`,

    hints: [
      'Plug in 0°C manually — what should the answer be?',
      'Trace through the broken formula with celsius = 0',
      'The +32 should be added after the multiplication, not inside it'
    ]
  }
];
