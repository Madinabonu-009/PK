# Contributing to Play Kids

Thank you for your interest in contributing to Play Kids! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Docker (optional)

### Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/play-kids.git
   cd play-kids
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/play-kids.git
   ```

4. **Install dependencies**
   ```bash
   make install
   # or
   cd backend && npm install
   cd ../frontend && npm install
   cd ../bot && npm install
   ```

5. **Setup environment**
   ```bash
   make setup
   # Edit .env files with your credentials
   ```

6. **Start development**
   ```bash
   make dev
   ```

## 💻 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes
2. Write/update tests
3. Run tests: `make test`
4. Run linter: `make lint-fix`
5. Commit your changes (see commit guidelines)

### Keeping Your Branch Updated

```bash
git fetch upstream
git rebase upstream/develop
```

## 📝 Coding Standards

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Follow Airbnb style guide
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### File Naming

- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- Constants: `UPPER_SNAKE_CASE.js`
- Tests: `*.test.js` or `*.spec.js`

### Code Organization

```
src/
├── components/     # React components
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── services/       # API services
├── constants/      # Constants
├── context/        # React context
└── pages/          # Page components
```

### Best Practices

#### React

```javascript
// ✅ Good
const MyComponent = ({ name, age }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    // Cleanup function
    return () => {
      // cleanup
    }
  }, [])
  
  return <div>{name}</div>
}

MyComponent.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number
}

// ❌ Bad
const MyComponent = (props) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    // No cleanup
  })
  
  return <div>{props.name}</div>
}
```

#### Backend

```javascript
// ✅ Good
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// ❌ Bad
export const getUser = (req, res) => {
  User.findById(req.params.id).then(user => {
    res.json(user)
  })
}
```

## 🧪 Testing

### Writing Tests

- Write tests for all new features
- Maintain test coverage above 50%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Running Tests

```bash
# All tests
make test

# With coverage
make test-coverage

# Watch mode
cd frontend && npm run test:watch
```

### Test Example

```javascript
describe('sanitizeEmail', () => {
  it('should validate and sanitize valid emails', () => {
    expect(sanitizeEmail('test@example.com')).toBe('test@example.com')
  })

  it('should reject invalid emails', () => {
    expect(sanitizeEmail('invalid')).toBe('')
  })
})
```

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when token expires.
Includes blacklist for revoked tokens.

Closes #123

---

fix(ui): resolve mobile menu not closing

The mobile menu was not closing when clicking outside.
Added click outside handler.

Fixes #456

---

docs(readme): update installation instructions

Added Docker setup instructions and troubleshooting section.
```

### Commit Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

## 🔄 Pull Request Process

### Before Submitting

1. ✅ Update documentation
2. ✅ Add/update tests
3. ✅ Run `make lint-fix`
4. ✅ Run `make test`
5. ✅ Update CHANGELOG.md
6. ✅ Rebase on latest develop

### Submitting PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the template

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Updated existing tests

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### Review Process

- At least one approval required
- All CI checks must pass
- No merge conflicts
- Code review feedback addressed

### After Merge

1. Delete your branch
2. Pull latest develop
3. Celebrate! 🎉

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Try latest version
- Collect error messages and logs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 96]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, etc.
```

## 📞 Getting Help

- 📧 Email: boymurodovamadinabonuf9@gmail.com
- 💬 Telegram: @BMM_dina09
- 📱 Phone: +998 94 514 09 49

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Play Kids! 🌱
