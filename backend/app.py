from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db
from auth import auth_bp, is_token_blacklisted
from certificates import cert_bp
import os
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    
    # Use absolute path for database to ensure consistency
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access']
    
    # Initialize extensions
    db.init_app(app)
    
    # Enhanced CORS configuration
    CORS(app, 
         origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
         supports_credentials=True,
         expose_headers=["Content-Range", "X-Content-Range"]
    )
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # JWT token blacklist checker
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return is_token_blacklisted(jti)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        print("✅ Database tables created")
        
        # Rebuild blockchain from database
        from certificates import rebuild_blockchain_from_database
        rebuild_blockchain_from_database()
    
    # Handle preflight OPTIONS requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify({"message": "OK"})
            return response
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cert_bp, url_prefix='/api')
    
    # Test endpoint for frontend connectivity
    @app.route('/api/test', methods=['GET', 'OPTIONS'])
    def test_connection():
        return jsonify({
            "status": "success",
            "message": "Backend API is reachable",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cors_enabled": True,
            "server": "Flask",
            "version": "1.0.0"
        }), 200
    
    # Serve test page
    @app.route('/test')
    def serve_test_page():
        return app.send_static_file('test.html')
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": True,
            "message": "Endpoint not found",
            "status_code": 404
        }), 404
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "error": True,
            "message": "Unauthorized access",
            "status_code": 401
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "error": True,
            "message": "Forbidden - insufficient permissions",
            "status_code": 403
        }), 403
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": True,
            "message": "Internal server error",
            "status_code": 500
        }), 500
    
    @app.errorhandler(422)
    def validation_error(error):
        return jsonify({
            "error": True,
            "message": "Validation error",
            "status_code": 422
        }), 422
    
    # Health check endpoint with live system info
    @app.route('/api/health', methods=['GET'])
    def health_check():
        try:
            from models import Certificate, User
            
            # Test database connection
            db_status = True
            try:
                Certificate.query.count()
            except:
                db_status = False
            
            # Test blockchain
            from certificates import blockchain
            blockchain_status = blockchain.is_chain_valid()
            
            health_data = {
                "status": "healthy" if db_status and blockchain_status else "degraded",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "services": {
                    "database": "online" if db_status else "offline",
                    "blockchain": "valid" if blockchain_status else "invalid",
                    "api": "online"
                },
                "metrics": {
                    "total_certificates": Certificate.query.count() if db_status else 0,
                    "total_users": User.query.count() if db_status else 0,
                    "blockchain_blocks": len(blockchain.chain) if blockchain_status else 0
                }
            }
            
            return jsonify({
                "error": False,
                "message": "System health check completed",
                "data": health_data
            }), 200
            
        except Exception as e:
            return jsonify({
                "error": True,
                "message": f"Health check failed: {str(e)}",
                "status": "unhealthy",
                "timestamp": datetime.datetime.utcnow().isoformat()
            }), 500
    
    # API documentation endpoint
    @app.route('/api/docs', methods=['GET'])
    def api_docs():
        docs = {
            "title": "Blockchain Certificate Verification API - Live Data Enhanced",
            "version": "1.0.0",
            "description": "API for blockchain-based academic certificate verification system with real-time data",
            "base_url": "http://localhost:5000/api",
            "endpoints": {
                "Authentication": {
                    "POST /auth/register": "Register new user",
                    "POST /auth/login": "Login user and get JWT",
                    "POST /auth/logout": "Logout user",
                    "GET /auth/profile": "Get user profile"
                },
                "Certificates": {
                    "POST /add_certificate": "Add new certificate [Admin only]",
                    "GET /verify/<certificate_id>": "Basic certificate verification",
                    "GET /verify/live/<certificate_id>": "Live verification with blockchain details",
                    "GET /certificates": "Get all certificates [Admin only]",
                    "GET /search": "Search certificates with filters"
                },
                "Blockchain": {
                    "GET /chain": "Get complete blockchain [Admin only]",
                    "GET /chain/validate": "Validate blockchain integrity [Admin only]"
                },
                "Live Data & Analytics": {
                    "GET /dashboard": "Live dashboard data [Admin only]",
                    "GET /stats": "Live system statistics [Admin only]",
                    "GET /analytics/live": "Real-time analytics [Admin only]",
                    "GET /notifications": "Live notifications and updates"
                },
                "System": {
                    "GET /health": "Live health check with metrics",
                    "GET /docs": "API documentation",
                    "GET /": "System status with live metrics"
                }
            },
            "authentication": "JWT Bearer token required for most endpoints",
            "roles": ["Admin", "User"],
            "live_features": [
                "Real-time certificate verification",
                "Live system statistics",
                "Dynamic search and filtering",
                "Live notifications",
                "Real-time analytics and trends",
                "System health monitoring"
            ],
            "example_responses": {
                "live_verification": "/verify/live/CERT001 returns detailed blockchain verification",
                "dashboard": "/dashboard returns real-time admin dashboard data",
                "search": "/search?q=John&degree=Computer returns filtered results",
                "notifications": "/notifications returns live system updates"
            }
        }
        return jsonify(docs), 200
    
    # Root endpoint with live system status
    @app.route('/', methods=['GET'])
    def root():
        try:
            from models import Certificate, User
            from certificates import blockchain
            
            # Get live metrics
            total_certs = Certificate.query.count()
            total_users = User.query.count()
            blockchain_health = blockchain.is_chain_valid()
            
            return jsonify({
                "message": "🎓 Blockchain Certificate Verification System API",
                "version": "1.0.0",
                "status": "online",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "live_metrics": {
                    "certificates": total_certs,
                    "users": total_users,
                    "blockchain_blocks": len(blockchain.chain),
                    "blockchain_healthy": blockchain_health
                },
                "endpoints": {
                    "documentation": "/api/docs",
                    "health": "/api/health",
                    "dashboard": "/api/dashboard",
                    "search": "/api/search"
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                "message": "🎓 Blockchain Certificate Verification System API",
                "version": "1.0.0",
                "status": "degraded",
                "error": str(e),
                "timestamp": datetime.datetime.utcnow().isoformat()
            }), 200
    
    return app

# Create the app instance
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
