from app import app

if __name__ == "__main__":
    print("🚀 Starting Blockchain Certificate Verification System...")
    print("📍 Server running at: http://localhost:5000")
    print("📚 API Documentation available at: http://localhost:5000/docs")
    app.run(debug=True, host='0.0.0.0', port=5000)
