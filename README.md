# 🐛 BugCode - Master Debugging, Get Job Ready

BugCode is a production-ready debugging practice platform where developers improve their real-world debugging skills. Unlike traditional DSA platforms, BugCode focuses on fixing actual production bugs with realistic error messages, stack traces, and debugging workflows.

![BugCode](https://img.shields.io/badge/Status-MVP-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🎯 What Makes BugCode Different?

- **Real-World Bugs**: Practice debugging actual production issues, not artificial algorithm problems
- **Debugging Experience**: Use console.log, analyze stack traces, read error messages - just like real development
- **Realistic Scenarios**: Async errors, null references, race conditions, scope bugs, and more
- **Instant Feedback**: Run code quickly, see detailed test results, and learn from explanations

---

## 🚀 Features

### Core Features
- ✅ **JWT Authentication** - Secure user signup/login system
- ✅ **5 Realistic Problems** - Carefully crafted debugging scenarios
- ✅ **Monaco Code Editor** - Professional-grade code editing experience
- ✅ **Run & Submit System** - Quick testing and full submission with test cases
- ✅ **Debug Mode** - Add console.logs and debug like in real development
- ✅ **Logs Panel** - See errors, stack traces, and console output
- ✅ **Test Case Validation** - Detailed pass/fail results for each test case
- ✅ **Explanations** - Learn why bugs happened after solving
- ✅ **User Profile** - Track stats, submissions, and solved problems
- ✅ **Leaderboard** - Compete with other developers (basic)

### Bonus Features
- 🎨 **Dark Theme** - Developer-friendly dark UI
- 📊 **Progress Tracking** - Stats, accuracy, and streaks
- 🏆 **Achievements** - Unlock badges as you improve

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Beautiful, accessible components
- **Monaco Editor** - VS Code's editor for the web

### Backend
- **Next.js API Routes** - Serverless backend
- **Node.js** - JavaScript runtime

### Database
- **MongoDB** - NoSQL database for users, problems, submissions

### Code Execution
- **Mock Judge0 Service** - Realistic code execution simulation (ready for real Judge0 API)

### Authentication
- **JWT** - Secure token-based auth
- **bcryptjs** - Password hashing

---

## 📦 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js    # All backend API routes
│   ├── auth/
│   │   ├── login/page.js           # Login page
│   │   └── signup/page.js          # Signup page
│   ├── dashboard/page.js           # Problem list dashboard
│   ├── problems/[id]/page.js       # Problem solving page (Monaco editor)
│   ├── profile/page.js             # User profile with stats
│   ├── page.js                     # Landing page
│   ├── layout.js                   # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   ├── db.js                       # MongoDB connection
│   ├── auth.js                     # JWT & bcrypt utilities
│   ├── judge0-service.js           # Code execution service
│   └── problems-data.js            # 5 debugging problems
├── components/ui/                  # ShadCN UI components
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Terminal/Command line

### Step 1: Install Dependencies

```bash
yarn install
```

### Step 2: Configure Environment Variables

The `.env` file is already configured for local development:

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=bugcode_db

# Application
NEXT_PUBLIC_BASE_URL=https://debug-practice.preview.emergentagent.com
CORS_ORIGINS=*

# JWT Secret
JWT_SECRET=bugcode_super_secret_key_change_in_production_123456789

# Judge0 Configuration (Optional - for real code execution)
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_ENABLED=false
```

**Note**: The app works with mock code execution by default. To enable real Judge0:
1. Get API key from https://rapidapi.com/judge0-official/api/judge0-ce
2. Update `JUDGE0_API_KEY` in `.env`
3. Set `JUDGE0_ENABLED=true`

### Step 3: Start MongoDB

Make sure MongoDB is running:

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or start it
sudo systemctl start mongod
```

### Step 4: Run the Development Server

```bash
yarn dev
```

The app will be available at:
- **Local**: http://localhost:3000
- **Network**: http://0.0.0.0:3000

---

## 📖 How to Use BugCode

### 1. **Sign Up / Login**
- Create an account at `/auth/signup`
- Or login at `/auth/login`
- JWT token is stored in localStorage

### 2. **Browse Problems**
- Visit `/dashboard` to see all problems
- Filter by difficulty: Easy, Medium, Hard
- Search by title or tags
- See which problems you've solved

### 3. **Solve a Problem**
- Click on any problem to open the editor
- Read the problem description and broken code
- Use the **Monaco Editor** to fix the bug
- Add `console.log()` statements to debug
- Click **Run Code** to test with first test case
- Click **Submit** to run all test cases

### 4. **View Results**
- See which test cases passed/failed
- View console output and error messages
- After solving, read the explanation
- See the correct solution

### 5. **Track Progress**
- Visit `/profile` to see your stats
- View solved problems and recent submissions
- Check achievements and accuracy
- Track your streak

---

## 🐛 The 5 Debugging Problems

### 1. **Async API Call Bug** (Easy)
- **Bug Type**: Missing `await` keywords
- **Concept**: Promises, async/await
- **Learn**: How to properly handle asynchronous operations

### 2. **Array Index Out of Bounds** (Easy)
- **Bug Type**: Off-by-one error in loop
- **Concept**: Array indexing, loop conditions
- **Learn**: Common mistakes with array access

### 3. **Callback Hell & Scope Bug** (Medium)
- **Bug Type**: `var` vs `let` closure issue
- **Concept**: Variable scope, closures
- **Learn**: How JavaScript closures work with async code

### 4. **Null Reference Error** (Medium)
- **Bug Type**: Missing null/undefined checks
- **Concept**: Defensive programming, optional chaining
- **Learn**: How to handle missing or incomplete data

### 5. **Race Condition in State Update** (Hard)
- **Bug Type**: Concurrent state updates
- **Concept**: Race conditions, synchronization
- **Learn**: How to handle shared state in async operations

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup      # Create new user
POST /api/auth/login       # Login user
GET  /api/auth/me          # Get current user
```

### Problems
```
GET  /api/problems              # Get all problems
GET  /api/problems/:id          # Get single problem
POST /api/problems/:id/run      # Run code (first test case)
POST /api/problems/:id/submit   # Submit solution (all test cases)
```

### User
```
GET /api/user/profile      # Get user profile & stats
GET /api/user/submissions  # Get user submissions
```

### Leaderboard
```
GET /api/leaderboard       # Get top 100 users
```

---

## 🎨 Design System

BugCode uses a custom dark theme built with Tailwind CSS and ShadCN UI:

- **Primary Color**: Blue accent
- **Background**: Dark theme optimized for coding
- **Typography**: Inter font family
- **Components**: Fully accessible ShadCN components

---

## 🧪 Testing the App

### Test Flow:
1. **Signup**: Create account at `/auth/signup`
2. **Login**: Login at `/auth/login`
3. **Dashboard**: Browse problems at `/dashboard`
4. **Solve**: Try Problem #1 (Async API Call Bug)
5. **Run**: Test your fix with "Run Code"
6. **Submit**: Submit and see all test results
7. **Profile**: Check your stats at `/profile`

### Quick Test Problem:
**Problem #1** is the easiest - just add `await` keywords!

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# The app is ready for Vercel deployment
vercel deploy
```

### Backend (Integrated)
- Backend is part of Next.js API routes
- Deployed automatically with frontend

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Get connection string
3. Update `MONGO_URL` in environment variables

### Environment Variables for Production
Make sure to set:
- `JWT_SECRET` - Strong random string
- `MONGO_URL` - Production MongoDB connection
- `NEXT_PUBLIC_BASE_URL` - Your domain
- `JUDGE0_API_KEY` - If using real Judge0

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days
- CORS configured for security
- Environment variables for sensitive data
- Input validation on all endpoints

**Production Checklist**:
- [ ] Change `JWT_SECRET` to random string
- [ ] Use secure MongoDB connection
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Add rate limiting (recommended)

---

## 📊 Database Schema

### Users Collection
```javascript
{
  id: String (UUID),
  name: String,
  email: String (unique),
  password: String (hashed),
  stats: {
    problemsSolved: Number,
    totalSubmissions: Number,
    streak: Number,
    accuracy: Number
  },
  solvedProblems: Array<String>,
  createdAt: Date
}
```

### Submissions Collection
```javascript
{
  id: String (UUID),
  userId: String,
  problemId: String,
  code: String,
  result: String ('accepted' | 'failed'),
  passedTestCases: Number,
  totalTestCases: Number,
  timestamp: Date
}
```

### Problems
Stored in `/lib/problems-data.js` as JavaScript objects (easily movable to DB)

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Real Judge0 API integration
- [ ] More languages (Python, Java, C++)
- [ ] More debugging problems (20+)
- [ ] Code review & discussions
- [ ] Video explanations
- [ ] Hints system (progressive)
- [ ] Timed challenges mode
- [ ] Company-specific bugs (Google, Meta, etc.)
- [ ] Collaborative debugging
- [ ] Advanced leaderboard

---

## 🤝 Contributing

This is an MVP. To add more problems:

1. Edit `/lib/problems-data.js`
2. Follow the existing problem structure:
   - `id`, `title`, `difficulty`, `tags`
   - `description`, `starterCode`, `correctSolution`
   - `testCases` array with input/expected
   - `explanation` and `hints`

---

## 📝 License

MIT License - Feel free to use this for learning or your own projects!

---

## 👨‍💻 Built With

- Next.js, React, Tailwind CSS
- MongoDB, JWT, bcryptjs
- Monaco Editor, ShadCN UI
- Lots of ☕ and debugging practice!

---

## 🎓 Learning Resources

Want to improve your debugging skills?

1. Start with Easy problems
2. Read error messages carefully
3. Use console.log liberally
4. Understand the explanation after solving
5. Try to solve again without hints

**Remember**: The best debuggers aren't the ones who never write bugs - they're the ones who can fix them quickly!

---

## 📧 Support

Having issues? Check:
1. MongoDB is running
2. Dependencies are installed (`yarn install`)
3. Environment variables are set correctly
4. Port 3000 is available

---

**Happy Debugging! 🐛🔍**

*Master Debugging. Get Job Ready.*
