from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """User model for authentication with role-based access"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'Admin' or 'User'

    def set_password(self, password):
        """Hash and set the user's password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify the user's password"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }

class Certificate(db.Model):
    """Certificate model for storing certificate metadata"""
    id = db.Column(db.Integer, primary_key=True)
    certificate_id = db.Column(db.String(64), unique=True, nullable=False)
    student_name = db.Column(db.String(120), nullable=False)
    degree = db.Column(db.String(120), nullable=False)
    issue_date = db.Column(db.String(20), nullable=False)
    qr_code_path = db.Column(db.String(256), nullable=True)
    created_by = db.Column(db.String(80), nullable=False)  # Admin who created it
    status = db.Column(db.String(20), nullable=False, default='active')  # 'active' or 'revoked'
    revoked_by = db.Column(db.String(80), nullable=True)  # Admin who revoked it
    revoked_at = db.Column(db.String(30), nullable=True)  # Timestamp when revoked

    def to_dict(self):
        """Convert certificate object to dictionary"""
        return {
            'id': self.id,
            'certificate_id': self.certificate_id,
            'student_name': self.student_name,
            'degree': self.degree,
            'issue_date': self.issue_date,
            'qr_code_path': self.qr_code_path,
            'created_by': self.created_by,
            'status': self.status,
            'revoked_by': self.revoked_by,
            'revoked_at': self.revoked_at
        }
