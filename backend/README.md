# 🚀 How to Run the Backend

## Prerequisites
- Python 3.8+
- pip (Python package installer)

## Installation

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```powershell
   copy .env.example .env
   ```
   Edit `.env` file with your actual values.

5. **Run the application:**
   ```powershell
   python app.py
   ```
   Or:
   ```powershell
   python run.py
   ```

## Default Credentials
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `Admin`

⚠️ **Change these credentials in production!**

## API Endpoints
The server will start at `http://localhost:5000`

- Health check: `GET /api/health`
- API docs: `GET /api/docs`
- Authentication: `POST /api/auth/login`
- Add certificate: `POST /api/add_certificate` (Admin only)
- Verify certificate: `GET /api/verify/<certificate_id>`

## Testing the API
You can test the API using:
1. **Postman** - Import the endpoints
2. **curl** - Command line testing
3. **Your React frontend** - Once connected

### Example curl commands:

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Add Certificate:**
```bash
curl -X POST http://localhost:5000/api/add_certificate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "student_name": "John Doe",
    "degree": "Bachelor of Science",
    "issue_date": "2025-09-01",
    "certificate_id": "CERT001"
  }'
```

**Verify Certificate:**
```bash
curl -X GET http://localhost:5000/api/verify/CERT001 \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Project Structure
```
backend/
├── app.py              # Flask application entry point
├── run.py              # Alternative runner with debug info
├── auth.py             # Authentication routes and JWT handling
├── certificates.py     # Certificate management routes
├── blockchain.py       # Blockchain and Block classes
├── models.py           # Database models (User, Certificate)
├── database.py         # Database setup
├── utils.py            # Utility functions (QR codes, validation)
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── API_DOCS.md         # Detailed API documentation
├── static/
│   └── qrcodes/        # Generated QR code images
```

## Next Steps
1. Start your React TypeScript frontend
2. Configure CORS if needed
3. Test the complete flow:
   - Register/Login users
   - Add certificates (Admin)
   - Verify certificates (User/Admin)
   - View blockchain (Admin)

