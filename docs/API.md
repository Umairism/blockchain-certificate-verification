# 🔧 API Documentation

Complete API reference for the Blockchain Certificate Verification System.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this structure:
```json
{
  "error": false,
  "message": "Success message",
  "data": {...},
  "timestamp": "2025-09-02T10:30:00Z"
}
```

## Error Responses
```json
{
  "error": true,
  "message": "Error description",
  "status_code": 400,
  "timestamp": "2025-09-02T10:30:00Z"
}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "error": false,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "error": false,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

### Logout User
```http
POST /auth/logout
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "error": false,
  "message": "Successfully logged out"
}
```

### Get User Profile
```http
GET /auth/profile
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "error": false,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

---

## 🎓 Certificate Management Endpoints

### Add Certificate (Admin Only)
```http
POST /add_certificate
```
**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "student_name": "John Doe",
  "degree": "Bachelor of Computer Science",
  "issue_date": "2025-06-15",
  "institution": "ABC University",
  "grade": "A+",
  "certificate_id": "CERT_2025_001"
}
```

**Response:**
```json
{
  "error": false,
  "message": "Certificate added successfully",
  "data": {
    "certificate_id": "CERT_2025_001",
    "blockchain_hash": "a1b2c3d4e5f6...",
    "block_index": 5
  }
}
```

### Get All Certificates (Admin Only)
```http
GET /certificates
```
**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "error": false,
  "message": "Certificates retrieved successfully",
  "data": {
    "certificates": [...],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### Search Certificates
```http
GET /search
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q`: Search query (student name, certificate ID)
- `degree`: Filter by degree
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `limit`: Results per page
- `offset`: Pagination offset

**Response:**
```json
{
  "error": false,
  "message": "Search completed successfully",
  "data": {
    "results": [...],
    "total": 25,
    "query": "John Doe",
    "filters": {...}
  }
}
```

### Verify Certificate
```http
GET /verify/<certificate_id>
```

**Response:**
```json
{
  "error": false,
  "message": "Certificate verification completed",
  "data": {
    "is_valid": true,
    "certificate": {
      "certificate_id": "CERT_2025_001",
      "student_name": "John Doe",
      "degree": "Bachelor of Computer Science",
      "issue_date": "2025-06-15",
      "institution": "ABC University",
      "status": "active"
    },
    "blockchain_verification": {
      "block_index": 5,
      "block_hash": "a1b2c3d4e5f6...",
      "timestamp": "2025-06-15T10:30:00Z"
    }
  }
}
```

### Live Certificate Verification
```http
GET /verify/live/<certificate_id>
```

**Response:**
```json
{
  "error": false,
  "message": "Live verification completed",
  "data": {
    "is_valid": true,
    "certificate": {...},
    "blockchain_verification": {...},
    "validation_checks": {
      "hash_integrity": true,
      "blockchain_consistency": true,
      "certificate_exists": true,
      "not_revoked": true
    }
  }
}
```

### Delete Certificate (Admin Only)
```http
DELETE /certificates/<certificate_id>
```
**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "error": false,
  "message": "Certificate deleted successfully",
  "data": {
    "certificate_id": "CERT_2025_001",
    "status": "deleted"
  }
}
```

---

## ⛓️ Blockchain Endpoints

### Get Blockchain (Admin Only)
```http
GET /chain
```
**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "error": false,
  "message": "Blockchain retrieved successfully",
  "data": {
    "chain": [
      {
        "index": 0,
        "timestamp": "2025-01-01T00:00:00Z",
        "certificate_data": {
          "certificate_id": "GENESIS",
          "student_name": "Genesis Block",
          "degree": "System Genesis",
          "issue_date": "2025-01-01"
        },
        "previous_hash": "0",
        "hash": "000abc123..."
      },
      ...
    ],
    "summary": {
      "total_blocks": 10,
      "total_certificates": 9,
      "chain_valid": true
    }
  }
}
```

### Validate Blockchain (Admin Only)
```http
GET /chain/validate
```
**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "error": false,
  "message": "Blockchain validation completed",
  "data": {
    "is_valid": true,
    "summary": {
      "total_blocks": 10,
      "validation_time": "0.123s",
      "last_validated": "2025-09-02T10:30:00Z"
    }
  }
}
```

---

## 📊 Dashboard & Analytics Endpoints

### Get Dashboard Data (Admin Only)
```http
GET /dashboard
```
**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "error": false,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "statistics": {
      "total_certificates": 150,
      "active_certificates": 145,
      "revoked_certificates": 5,
      "total_verifications": 1250
    },
    "recent_activity": [...],
    "blockchain_status": {
      "blocks": 151,
      "is_valid": true,
      "last_block_time": "2025-09-02T09:15:00Z"
    }
  }
}
```

### Get Live Analytics (Admin Only)
```http
GET /analytics/live
```
**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "error": false,
  "message": "Live analytics retrieved successfully",
  "data": {
    "real_time_metrics": {
      "verifications_today": 45,
      "certificates_issued_today": 3,
      "active_users": 12
    },
    "trends": {...},
    "performance": {...}
  }
}
```

---

## 🔧 System Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "error": false,
  "message": "System health check completed",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "services": {
      "database": "online",
      "blockchain": "valid",
      "api": "online"
    },
    "metrics": {
      "total_certificates": 150,
      "total_users": 25,
      "blockchain_blocks": 151
    }
  }
}
```

### API Documentation
```http
GET /docs
```

**Response:**
```json
{
  "title": "Blockchain Certificate Verification API",
  "version": "1.0.0",
  "description": "API for blockchain-based certificate verification",
  "endpoints": {...}
}
```

---

## 📝 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 🔒 Rate Limiting

API endpoints are rate limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Search endpoints: 30 requests per minute
- Other endpoints: 100 requests per minute

## 📋 Examples

### Complete Certificate Verification Flow

1. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@system.com", "password": "admin123"}'
```

2. **Verify Certificate:**
```bash
curl -X GET http://localhost:5000/api/verify/CERT_2025_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Search Certificates:**
```bash
curl -X GET "http://localhost:5000/api/search?q=John&degree=Computer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Error Handling

The API provides detailed error messages for debugging:

```json
{
  "error": true,
  "message": "Certificate not found",
  "status_code": 404,
  "details": {
    "certificate_id": "CERT_INVALID",
    "searched_in": "blockchain and database"
  }
}
```

---

**For more examples and detailed usage, check the [Development Guide](./DEVELOPMENT.md)**
