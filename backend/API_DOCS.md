# 🔗 API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication.
Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📋 Example JSON Requests/Responses

### 1. Authentication Endpoints

#### Register User
**POST** `/auth/register`
```json
Request:
{
  "username": "john_doe",
  "password": "password123",
  "role": "Admin"
}

Response (201):
{
  "error": false,
  "message": "User registered successfully",
  "data": {
    "username": "john_doe",
    "role": "Admin"
  },
  "status_code": 201
}
```

#### Login
**POST** `/auth/login`
```json
Request:
{
  "username": "john_doe",
  "password": "password123"
}

Response (200):
{
  "error": false,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "username": "john_doe",
      "role": "Admin",
      "user_id": 1
    }
  },
  "status_code": 200
}
```

#### Logout
**POST** `/auth/logout`
```json
Response (200):
{
  "error": false,
  "message": "Logged out successfully",
  "data": null,
  "status_code": 200
}
```

#### Get Profile
**GET** `/auth/profile`
```json
Response (200):
{
  "error": false,
  "message": "Profile retrieved successfully",
  "data": {
    "username": "john_doe",
    "role": "Admin",
    "user_id": 1
  },
  "status_code": 200
}
```

### 2. Certificate Endpoints

#### Add Certificate (Admin Only)
**POST** `/add_certificate`
```json
Request:
{
  "student_name": "Alice Johnson",
  "degree": "Bachelor of Computer Science",
  "issue_date": "2025-09-01",
  "certificate_id": "CERT2025001"
}

Response (201):
{
  "error": false,
  "message": "Certificate added successfully",
  "data": {
    "block": {
      "index": 1,
      "timestamp": "2025-09-02T10:30:00.123456",
      "certificate_data": {
        "certificate_id": "CERT2025001",
        "student_name": "Alice Johnson",
        "degree": "Bachelor of Computer Science",
        "issue_date": "2025-09-01",
        "issued_by": "john_doe"
      },
      "previous_hash": "0abc123...",
      "hash": "1def456..."
    },
    "certificate": {
      "id": 1,
      "certificate_id": "CERT2025001",
      "student_name": "Alice Johnson",
      "degree": "Bachelor of Computer Science",
      "issue_date": "2025-09-01",
      "qr_code_path": "static/qrcodes/CERT2025001.png",
      "created_by": "john_doe"
    },
    "qr_code_url": "/static/qrcodes/CERT2025001.png"
  },
  "status_code": 201
}
```

#### Verify Certificate
**GET** `/verify/<certificate_id>`
```json
Response (200):
{
  "error": false,
  "message": "Certificate verified successfully",
  "data": {
    "valid": true,
    "certificate": {
      "certificate_id": "CERT2025001",
      "student_name": "Alice Johnson",
      "degree": "Bachelor of Computer Science",
      "issue_date": "2025-09-01",
      "created_by": "john_doe",
      "qr_code_url": "/static/qrcodes/CERT2025001.png"
    },
    "blockchain_data": {
      "index": 1,
      "timestamp": "2025-09-02T10:30:00.123456",
      "certificate_data": {...},
      "previous_hash": "0abc123...",
      "hash": "1def456..."
    },
    "verification_timestamp": "2025-09-02T10:30:00.123456"
  },
  "status_code": 200
}

Response (404) - Not Found:
{
  "error": true,
  "message": "Certificate not found",
  "status_code": 404
}
```

#### Get All Certificates (Admin Only)
**GET** `/certificates`
```json
Response (200):
{
  "error": false,
  "message": "Certificates retrieved successfully",
  "data": {
    "certificates": [
      {
        "id": 1,
        "certificate_id": "CERT2025001",
        "student_name": "Alice Johnson",
        "degree": "Bachelor of Computer Science",
        "issue_date": "2025-09-01",
        "qr_code_path": "static/qrcodes/CERT2025001.png",
        "created_by": "john_doe",
        "qr_code_url": "/static/qrcodes/CERT2025001.png"
      }
    ],
    "total_count": 1
  },
  "status_code": 200
}
```

#### Get Blockchain (Admin Only)
**GET** `/chain`
```json
Response (200):
{
  "error": false,
  "message": "Blockchain retrieved successfully",
  "data": {
    "chain": [
      {
        "index": 0,
        "timestamp": "2025-09-02T10:00:00.000000",
        "certificate_data": {
          "certificate_id": "GENESIS",
          "student_name": "Genesis Block",
          "degree": "System Genesis",
          "issue_date": "2025-09-02"
        },
        "previous_hash": "0",
        "hash": "genesis123..."
      },
      {
        "index": 1,
        "timestamp": "2025-09-02T10:30:00.123456",
        "certificate_data": {
          "certificate_id": "CERT2025001",
          "student_name": "Alice Johnson",
          "degree": "Bachelor of Computer Science",
          "issue_date": "2025-09-01",
          "issued_by": "john_doe"
        },
        "previous_hash": "genesis123...",
        "hash": "1def456..."
      }
    ],
    "summary": {
      "total_blocks": 2,
      "total_certificates": 1,
      "is_valid": true,
      "latest_block_hash": "1def456..."
    }
  },
  "status_code": 200
}
```

#### Validate Blockchain (Admin Only)
**GET** `/chain/validate`
```json
Response (200):
{
  "error": false,
  "message": "Blockchain is valid",
  "data": {
    "is_valid": true,
    "summary": {
      "total_blocks": 2,
      "total_certificates": 1,
      "is_valid": true,
      "latest_block_hash": "1def456..."
    }
  },
  "status_code": 200
}
```

#### Get Statistics (Admin Only)
**GET** `/stats`
```json
Response (200):
{
  "error": false,
  "message": "Statistics retrieved successfully",
  "data": {
    "total_certificates": 1,
    "total_blocks": 2,
    "blockchain_valid": true,
    "recent_certificates": [
      {
        "id": 1,
        "certificate_id": "CERT2025001",
        "student_name": "Alice Johnson",
        "degree": "Bachelor of Computer Science",
        "issue_date": "2025-09-01",
        "qr_code_path": "static/qrcodes/CERT2025001.png",
        "created_by": "john_doe"
      }
    ]
  },
  "status_code": 200
}
```

### 3. System Endpoints

#### Health Check
**GET** `/health`
```json
Response (200):
{
  "error": false,
  "message": "Server is running",
  "status": "healthy",
  "version": "1.0.0"
}
```

#### API Documentation
**GET** `/docs`
```json
Response (200):
{
  "title": "Blockchain Certificate Verification API",
  "version": "1.0.0",
  "description": "API for blockchain-based academic certificate verification system",
  "endpoints": {...},
  "authentication": "JWT Bearer token required for most endpoints",
  "roles": ["Admin", "User"]
}
```

### 4. Error Response Format
All error responses follow this format:
```json
{
  "error": true,
  "message": "Error description",
  "status_code": 400
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### 5. Role-Based Access Control

#### Admin Role Can Access:
- All certificate endpoints
- User management endpoints
- Blockchain view and validation
- System statistics

#### User Role Can Access:
- Certificate verification only
- Profile management

### 6. JWT Token Structure
```json
{
  "username": "john_doe",
  "role": "Admin",
  "user_id": 1,
  "exp": 1725369600
}
```

### 7. QR Code Access
QR codes can be accessed via:
```
GET /static/qrcodes/<certificate_id>.png
```

Example: `http://localhost:5000/static/qrcodes/CERT2025001.png`
