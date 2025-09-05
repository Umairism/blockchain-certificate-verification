from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from models import User
from database import db
from utils import validate_certificate_data, create_error_response, create_success_response
import datetime

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__)

# Simple in-memory blacklist for JWT tokens (use Redis in production)
jwt_blacklist = set()

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Request body:
    {
        "username": "string",
        "password": "string", 
        "role": "Admin" | "User"
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return create_error_response("No data provided", 400)
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'User')
        
        # Validation
        if not username or len(username) < 3:
            return create_error_response("Username must be at least 3 characters", 400)
        
        if not password or len(password) < 6:
            return create_error_response("Password must be at least 6 characters", 400)
        
        if role not in ['Admin', 'User']:
            return create_error_response("Role must be 'Admin' or 'User'", 400)
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return create_error_response("Username already exists", 409)
        
        # Create new user
        user = User(username=username, role=role)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return create_success_response(
            {"username": username, "role": role},
            "User registered successfully",
            201
        )
    
    except Exception as e:
        db.session.rollback()
        return create_error_response(f"Registration failed: {str(e)}", 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return JWT token
    
    Request body:
    {
        "username": "string",
        "password": "string"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return create_error_response("No data provided", 400)
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return create_error_response("Username and password required", 400)
        
        # Find user
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return create_error_response("Invalid credentials", 401)
        
        # Create JWT token with user info
        access_token = create_access_token(
            identity=user.username,  # Use username as identity string
            additional_claims={
                "role": user.role,
                "user_id": user.id
            },
            expires_delta=datetime.timedelta(hours=24)
        )
        
        return create_success_response({
            "access_token": access_token,
            "user": {
                "username": user.username,
                "role": user.role,
                "user_id": user.id
            }
        }, "Login successful")
    
    except Exception as e:
        return create_error_response(f"Login failed: {str(e)}", 500)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user by blacklisting the JWT token
    """
    try:
        jti = get_jwt()["jti"]
        jwt_blacklist.add(jti)
        
        return create_success_response(None, "Logged out successfully")
    
    except Exception as e:
        return create_error_response(f"Logout failed: {str(e)}", 500)

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get current user profile
    """
    try:
        username = get_jwt_identity()
        claims = get_jwt()
        
        current_user = {
            "username": username,
            "role": claims.get("role"),
            "user_id": claims.get("user_id")
        }
        
        return create_success_response(current_user, "Profile retrieved successfully")
    
    except Exception as e:
        return create_error_response(f"Failed to get profile: {str(e)}", 500)

# Utility functions for role-based access control
def admin_required(f):
    """Decorator to require Admin role"""
    def decorator(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "Admin":
            return create_error_response("Admin access required", 403)
        return f(*args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator

def get_current_user():
    """Get current user identity from JWT"""
    username = get_jwt_identity()
    claims = get_jwt()
    
    return {
        "username": username,
        "role": claims.get("role"),
        "user_id": claims.get("user_id")
    }

# Function to check if token is blacklisted
def is_token_blacklisted(jti):
    """Check if JWT token is blacklisted"""
    return jti in jwt_blacklist
