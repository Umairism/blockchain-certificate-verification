# 🔧 Frontend Connection Troubleshooting Guide

## Common Causes of "ERR_BLOCKED_BY_CLIENT"

### 1. **Ad Blockers / Browser Extensions**
- **uBlock Origin**, **AdBlock Plus**, or similar extensions
- **Privacy Badger**, **Ghostery**
- **Antivirus software** with web protection

**Solutions:**
- Temporarily disable ad blockers
- Add `localhost:5000` to whitelist
- Use incognito/private browsing mode

### 2. **CORS Issues**
- Backend CORS not properly configured
- Missing preflight request handling

**Solution Applied:**
✅ Enhanced CORS configuration in `app.py`
✅ Added preflight OPTIONS handling
✅ Multiple origin support

### 3. **Network/Firewall Issues**
- Windows Firewall blocking requests
- Corporate network restrictions
- Antivirus blocking local connections

### 4. **URL/Port Issues**
- Using wrong API base URL
- Backend not running on expected port

## 🧪 Testing Steps

### Step 1: Test Backend Directly
Open browser and visit:
```
http://localhost:5000/test
```
This should show an API connection test page.

### Step 2: Test API Endpoints
```
http://localhost:5000/api/test
http://localhost:5000/api/health
http://localhost:5000/
```

### Step 3: Check Frontend Code
Make sure your React frontend is using the correct API base URL:

```javascript
// Correct API base URLs
const API_BASE = 'http://localhost:5000/api';
// OR
const API_BASE = 'http://127.0.0.1:5000/api';
```

### Step 4: Test with curl
```powershell
# Test basic connectivity
curl http://localhost:5000/api/test

# Test with headers
curl -H "Content-Type: application/json" http://localhost:5000/api/health
```

### Step 5: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try making a request
4. Check if request appears and what the error details are

## 🔧 Quick Fixes

### Frontend Axios Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### Fetch Configuration
```javascript
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
```

## 🚨 Emergency Solutions

### 1. Disable Ad Blocker Temporarily
- Right-click on ad blocker icon
- Choose "Disable on this site" or "Disable temporarily"

### 2. Try Different Browser
- Test in Chrome, Firefox, Edge
- Use incognito/private mode

### 3. Use Different Port
If port 5000 is blocked, change Flask port:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### 4. Check Windows Firewall
- Windows Settings → Privacy & Security → Windows Security
- Firewall & network protection → Allow an app through firewall
- Add Python.exe if needed

## ✅ Verification Checklist

- [ ] Backend Flask server running on port 5000
- [ ] Can access `http://localhost:5000/test` in browser
- [ ] Ad blockers disabled or configured
- [ ] Frontend using correct API base URL
- [ ] CORS headers present in network requests
- [ ] No antivirus software blocking requests

## 📞 Still Having Issues?

Try this test command in your React frontend:
```javascript
// Add this to your React component to test
useEffect(() => {
  fetch('http://localhost:5000/api/test')
    .then(response => response.json())
    .then(data => console.log('Backend connected:', data))
    .catch(error => console.error('Connection failed:', error));
}, []);
```

Your backend is configured with enhanced CORS support and should work with most frontend setups! 🚀
