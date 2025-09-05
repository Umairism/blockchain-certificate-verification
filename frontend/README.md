# Frontend Setup Guide

## Recommended Setup

1. **Create React app with TypeScript:**
   ```powershell
   cd frontend
   npx create-react-app . --template typescript
   ```

2. **Install additional dependencies for the project:**
   ```powershell
   npm install axios react-router-dom @types/react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Connect to the backend:**
   - Base URL: `http://localhost:5000/api`
   - Include JWT token in Authorization header
   - Handle role-based routing (Admin vs User)

## Suggested Components Structure
```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Admin/
│   │   ├── AddCertificate.tsx
│   │   ├── CertificateList.tsx
│   │   └── BlockchainViewer.tsx
│   ├── User/
│   │   └── VerifyCertificate.tsx
│   └── Common/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── certificates.ts
├── types/
│   ├── auth.ts
│   ├── certificate.ts
│   └── blockchain.ts
├── utils/
│   ├── constants.ts
│   └── helpers.ts
└── App.tsx
```

## API Integration Examples

### Authentication Service
```typescript
// services/auth.ts
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const authAPI = {
  login: (username: string, password: string) =>
    axios.post(`${API_BASE}/auth/login`, { username, password }),
  
  register: (username: string, password: string, role: string) =>
    axios.post(`${API_BASE}/auth/register`, { username, password, role }),
  
  logout: (token: string) =>
    axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
};
```

### Certificate Service
```typescript
// services/certificates.ts
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const certificateAPI = {
  addCertificate: (data: any, token: string) =>
    axios.post(`${API_BASE}/add_certificate`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  verifyCertificate: (id: string, token: string) =>
    axios.get(`${API_BASE}/verify/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getAllCertificates: (token: string) =>
    axios.get(`${API_BASE}/certificates`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getBlockchain: (token: string) =>
    axios.get(`${API_BASE}/chain`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};
```
