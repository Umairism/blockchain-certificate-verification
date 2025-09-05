import qrcode
import os
from PIL import Image

def generate_qr_code(certificate_id, base_url="http://localhost:3000"):
    """
    Generate QR code for certificate verification
    
    Args:
        certificate_id (str): The certificate ID
        base_url (str): Base URL for the frontend verification page
    
    Returns:
        str: Path to the generated QR code image
    """
    try:
        # Create verification URL
        verification_url = f"{base_url}/verify/{certificate_id}"
        
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # Add data and make QR code
        qr.add_data(verification_url)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Ensure directory exists
        qr_dir = os.path.join("static", "qrcodes")
        os.makedirs(qr_dir, exist_ok=True)
        
        # Save image
        qr_path = os.path.join(qr_dir, f"{certificate_id}.png")
        img.save(qr_path)
        
        return qr_path
    
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        return None

def validate_certificate_data(data):
    """
    Validate certificate data fields
    
    Args:
        data (dict): Certificate data to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = ["student_name", "degree", "issue_date", "certificate_id"]
    
    # Check if all required fields are present
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Missing or empty field: {field}"
    
    # Validate certificate_id format (alphanumeric + underscores, 3-50 characters)
    cert_id = data["certificate_id"]
    import re
    if not re.match(r'^[A-Za-z0-9_]+$', cert_id) or len(cert_id) < 3 or len(cert_id) > 50:
        return False, "Certificate ID must contain only letters, numbers, and underscores (3-50 characters)"
    
    # Validate student_name (2-100 characters)
    student_name = data["student_name"].strip()
    if len(student_name) < 2 or len(student_name) > 100:
        return False, "Student name must be 2-100 characters long"
    
    # Validate degree (2-100 characters)
    degree = data["degree"].strip()
    if len(degree) < 2 or len(degree) > 100:
        return False, "Degree must be 2-100 characters long"
    
    # Validate issue_date format (basic check)
    issue_date = data["issue_date"]
    if len(issue_date) != 10 or issue_date.count("-") != 2:
        return False, "Issue date must be in YYYY-MM-DD format"
    
    return True, None

def create_error_response(message, status_code=400):
    """
    Create standardized error response
    
    Args:
        message (str): Error message
        status_code (int): HTTP status code
    
    Returns:
        tuple: (response_dict, status_code)
    """
    return {
        "error": True,
        "message": message,
        "status_code": status_code
    }, status_code

def create_success_response(data, message="Success", status_code=200):
    """
    Create standardized success response
    
    Args:
        data: Response data
        message (str): Success message
        status_code (int): HTTP status code
    
    Returns:
        tuple: (response_dict, status_code)
    """
    return {
        "error": False,
        "message": message,
        "data": data,
        "status_code": status_code
    }, status_code
