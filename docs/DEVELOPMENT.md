# 💻 Development Guide

Complete guide for setting up, developing, and contributing to the Blockchain Certificate Verification System.

## 🚀 Quick Setup

### Prerequisites

#### System Requirements
- **Node.js**: v16.0.0 or higher
- **Python**: v3.8.0 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

#### Package Managers
- **npm**: v8.0.0 or higher (comes with Node.js)
- **pip**: v21.0.0 or higher (comes with Python)

### Development Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/blockchain-certificate-verification.git
   cd blockchain-certificate-verification
   ```

2. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Initialize database
   python create_db.py
   
   # Create test data (optional)
   python create_test_certificates.py
   
   # Start development server
   python app.py
   ```

3. **Frontend Setup**
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start development server
   npm run dev
   ```

4. **Verify Setup**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000
   - API Health: http://localhost:5000/api/health

## 📁 Project Structure Deep Dive

### Frontend Structure
```
frontend/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   └── favicon.ico        # App icon
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── admin/         # Admin-specific components
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── CertificateTable.tsx
│   │   └── auth/          # Authentication components
│   │       ├── LoginForm.tsx
│   │       └── ProtectedRoute.tsx
│   ├── pages/             # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminCertificates.tsx
│   │   ├── AdminBlockchain.tsx
│   │   ├── AdminSettings.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── services/          # API service layer
│   │   ├── api.ts         # Main API configuration
│   │   ├── auth.ts        # Authentication services
│   │   └── certificates.ts # Certificate services
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

### Backend Structure
```
backend/
├── instance/              # SQLite database files
├── static/                # Static files (if any)
├── models.py              # Database models
├── database.py            # Database configuration
├── auth.py                # Authentication routes
├── certificates.py        # Certificate management routes
├── blockchain.py          # Blockchain implementation
├── app.py                 # Main Flask application
├── utils.py               # Utility functions
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variables template
├── create_db.py           # Database initialization
├── create_test_certificates.py # Test data creation
└── test_backend.py        # Backend tests
```

## 🛠️ Development Workflow

### Branch Strategy
```
main                   # Production-ready code
├── develop           # Integration branch
├── feature/auth      # Feature branches
├── feature/blockchain
├── bugfix/cors-issue # Bug fix branches
└── hotfix/security   # Critical fixes
```

### Commit Convention
```bash
# Format: type(scope): description
feat(auth): add JWT token refresh functionality
fix(api): resolve CORS configuration issue
docs(readme): update installation instructions
style(ui): improve dashboard responsive design
refactor(blockchain): optimize hash computation
test(auth): add unit tests for login flow
```

### Code Quality Standards

#### TypeScript/JavaScript
```typescript
// Use explicit types
interface Certificate {
  id: string;
  studentName: string;
  degree: string;
  issueDate: string;
  status: 'active' | 'revoked';
}

// Use async/await instead of promises
const fetchCertificates = async (): Promise<Certificate[]> => {
  try {
    const response = await api.get('/certificates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
    throw error;
  }
};
```

#### Python
```python
# Follow PEP 8 style guidelines
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class Certificate:
    """Certificate data model."""
    id: str
    student_name: str
    degree: str
    issue_date: str
    status: str = 'active'

def create_certificate(data: Dict[str, str]) -> Optional[Certificate]:
    """Create a new certificate with validation."""
    try:
        # Validation logic here
        return Certificate(**data)
    except Exception as e:
        logger.error(f"Certificate creation failed: {e}")
        return None
```

## 🧪 Testing Strategy

### Frontend Testing

#### Unit Tests
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../components/auth/LoginForm';

describe('LoginForm', () => {
  test('renders login form with required fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

#### Integration Tests
```typescript
// API integration testing
describe('Certificate API', () => {
  test('fetches certificates successfully', async () => {
    const certificates = await certificateAPI.getAll();
    expect(certificates).toBeInstanceOf(Array);
    expect(certificates[0]).toHaveProperty('id');
  });
});
```

### Backend Testing

#### Unit Tests
```python
import pytest
from app import create_app
from models import Certificate

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_certificate_creation(client):
    """Test certificate creation endpoint."""
    response = client.post('/api/add_certificate', json={
        'student_name': 'John Doe',
        'degree': 'Computer Science',
        'issue_date': '2025-06-15'
    })
    
    assert response.status_code == 201
    assert response.json['error'] is False
    assert 'certificate_id' in response.json['data']

def test_certificate_verification(client):
    """Test certificate verification."""
    cert_id = 'CERT_TEST_001'
    response = client.get(f'/api/verify/{cert_id}')
    
    assert response.status_code == 200
    assert response.json['data']['is_valid'] is True
```

#### Blockchain Tests
```python
def test_blockchain_integrity():
    """Test blockchain validation."""
    from blockchain import Blockchain
    
    blockchain = Blockchain()
    
    # Add test blocks
    blockchain.add_block({'test': 'data1'})
    blockchain.add_block({'test': 'data2'})
    
    assert blockchain.is_chain_valid() is True
    
    # Tamper with blockchain
    blockchain.chain[1].certificate_data = {'test': 'tampered'}
    
    assert blockchain.is_chain_valid() is False
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage

# Backend tests
cd backend
pytest                     # Run all tests
pytest -v                  # Verbose output
pytest --cov=.            # With coverage
pytest tests/test_auth.py  # Specific test file
```

## 🔧 Development Tools

### VS Code Configuration

#### Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-python.flake8",
    "ms-python.black-formatter"
  ]
}
```

#### Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Code Formatting

#### Prettier (Frontend)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

#### Black (Backend)
```bash
# Format Python code
black backend/
black --check backend/  # Check without formatting
```

### Linting

#### ESLint (Frontend)
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

#### Flake8 (Backend)
```ini
[flake8]
max-line-length = 88
exclude = venv,__pycache__
ignore = E203,W503
```

## 🐛 Debugging

### Frontend Debugging

#### Browser DevTools
```typescript
// Add debug points in code
console.log('Certificate data:', certificate);
console.table(certificates);

// Use React DevTools for component inspection
// Network tab for API calls
// Console for errors and logs
```

#### VS Code Debugging
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Frontend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"]
}
```

### Backend Debugging

#### Flask Debugging
```python
# Enable debug mode
app.run(debug=True)

# Add breakpoints
import pdb; pdb.set_trace()

# Logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug('Debug message')
```

#### VS Code Debugging
```json
{
  "type": "python",
  "request": "launch",
  "name": "Debug Flask",
  "program": "${workspaceFolder}/backend/app.py",
  "console": "integratedTerminal",
  "env": {
    "FLASK_ENV": "development"
  }
}
```

## 📊 Performance Optimization

### Frontend Optimization

#### Bundle Analysis
```bash
npm run build
npm run analyze  # Analyze bundle size
```

#### Code Splitting
```typescript
// Route-based code splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCertificates = lazy(() => import('./pages/AdminCertificates'));

// Component lazy loading
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

#### Performance Monitoring
```typescript
// React performance profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component render time:', actualDuration);
}

<Profiler id="AdminDashboard" onRender={onRenderCallback}>
  <AdminDashboard />
</Profiler>
```

### Backend Optimization

#### Database Optimization
```python
# Add database indexes
class Certificate(db.Model):
    __tablename__ = 'certificates'
    
    id = db.Column(db.Integer, primary_key=True)
    certificate_id = db.Column(db.String(255), unique=True, index=True)
    student_name = db.Column(db.String(255), index=True)
    
    __table_args__ = (
        db.Index('idx_student_degree', 'student_name', 'degree'),
    )
```

#### Query Optimization
```python
# Use pagination for large datasets
def get_certificates(page=1, per_page=50):
    return Certificate.query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

# Eager loading to avoid N+1 queries
certificates = Certificate.query.options(
    joinedload(Certificate.blocks)
).all()
```

## 🔐 Security Development

### Environment Variables
```bash
# Backend .env
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///app.db
FLASK_ENV=development

# Frontend .env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Certificate Verification System
```

### Security Best Practices

#### Input Validation
```python
from marshmallow import Schema, fields, validate

class CertificateSchema(Schema):
    student_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    degree = fields.Str(required=True, validate=validate.Length(min=2, max=200))
    issue_date = fields.Date(required=True)
```

#### SQL Injection Prevention
```python
# Always use parameterized queries
certificates = Certificate.query.filter(
    Certificate.student_name.like(f'%{search_term}%')
).all()

# Never use string concatenation
# BAD: f"SELECT * FROM certificates WHERE name = '{name}'"
```

## 📦 Build and Deployment

### Frontend Build
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Build with environment
VITE_API_BASE_URL=https://api.example.com npm run build
```

### Backend Deployment
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# With environment variables
export FLASK_ENV=production
export SECRET_KEY=production-secret-key
python app.py
```

## 🤝 Contributing Guidelines

### Pull Request Process

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/blockchain-certificate-verification.git
   cd blockchain-certificate-verification
   git remote add upstream https://github.com/original-repo/blockchain-certificate-verification.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

3. **Make Changes**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation if needed

4. **Test Changes**
   ```bash
   # Run all tests
   npm test                 # Frontend
   pytest                   # Backend
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat(scope): add new feature description"
   git push origin feature/new-feature-name
   ```

6. **Create Pull Request**
   - Use the PR template
   - Include screenshots for UI changes
   - Link related issues

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Security considerations addressed
- [ ] Performance impact considered

---

**Happy coding! 🚀 If you have questions, check the [API Documentation](./API.md) or create an issue.**
