from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from blockchain import Blockchain
from models import Certificate, User
from database import db
from utils import generate_qr_code, validate_certificate_data, create_error_response, create_success_response
from auth import admin_required, get_current_user
import os
import datetime
from sqlalchemy import func

# Create certificates blueprint
cert_bp = Blueprint('cert', __name__)

# Initialize blockchain instance
blockchain = Blockchain()

def rebuild_blockchain_from_database():
    """Rebuild blockchain from existing certificates in database"""
    from models import Certificate
    
    # Get all certificates from database
    certificates = Certificate.query.all()
    
    print(f"Rebuilding blockchain from {len(certificates)} certificates...")
    
    for cert in certificates:
        # Check if certificate already exists in blockchain
        existing_block = blockchain.find_certificate(cert.certificate_id)
        if not existing_block:
            # Add certificate to blockchain
            certificate_data = {
                "certificate_id": cert.certificate_id,
                "student_name": cert.student_name,
                "degree": cert.degree,
                "issue_date": cert.issue_date,
                "issued_by": cert.created_by
            }
            blockchain.add_block(certificate_data)
            print(f"Added {cert.certificate_id} to blockchain")
    
    print(f"Blockchain rebuilt with {len(blockchain.chain)} blocks")

# Rebuild blockchain from database on startup
def init_blockchain():
    """Initialize blockchain and rebuild from database"""
    global blockchain
    blockchain = Blockchain()
    
    # Import here to avoid circular imports
    from flask import current_app
    from database import db
    
    # Only rebuild if we're in an application context
    try:
        with current_app.app_context():
            rebuild_blockchain_from_database()
    except:
        # If no app context, blockchain will be rebuilt later
        pass

@cert_bp.route('/add_certificate', methods=['POST'])
@jwt_required()
@admin_required
def add_certificate():
    """
    Add a new certificate to the blockchain (Admin only)
    
    Request body:
    {
        "student_name": "string",
        "degree": "string",
        "issue_date": "YYYY-MM-DD",
        "certificate_id": "string"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return create_error_response("No data provided", 400)
        
        # Validate certificate data
        is_valid, error_message = validate_certificate_data(data)
        if not is_valid:
            return create_error_response(error_message, 400)
        
        # Check if certificate ID already exists
        if Certificate.query.filter_by(certificate_id=data["certificate_id"]).first():
            return create_error_response("Certificate ID already exists", 409)
        
        # Check if certificate exists in blockchain
        if blockchain.find_certificate(data["certificate_id"]):
            return create_error_response("Certificate already exists in blockchain", 409)
        
        # Get current user
        current_user = get_current_user()
        
        # Add certificate to blockchain
        certificate_data = {
            "certificate_id": data["certificate_id"],
            "student_name": data["student_name"].strip(),
            "degree": data["degree"].strip(),
            "issue_date": data["issue_date"],
            "issued_by": current_user["username"]
        }
        
        block = blockchain.add_block(certificate_data)
        
        # Generate QR code
        qr_path = generate_qr_code(data["certificate_id"])
        
        # Save certificate to database
        cert = Certificate(
            certificate_id=data["certificate_id"],
            student_name=data["student_name"].strip(),
            degree=data["degree"].strip(),
            issue_date=data["issue_date"],
            qr_code_path=qr_path,
            created_by=current_user["username"]
        )
        
        db.session.add(cert)
        db.session.commit()
        
        response_data = {
            "block": block.to_dict(),
            "certificate": cert.to_dict(),
            "qr_code_url": f"/static/qrcodes/{data['certificate_id']}.png"
        }
        
        return create_success_response(response_data, "Certificate added successfully", 201)
    
    except Exception as e:
        db.session.rollback()
        return create_error_response(f"Failed to get analytics: {str(e)}", 500)

@cert_bp.route('/debug/certificate/<certificate_id>', methods=['GET'])
@jwt_required()
def debug_certificate(certificate_id):
    """
    Debug endpoint to check certificate status
    """
    try:
        # Check database
        cert_in_db = Certificate.query.filter_by(certificate_id=certificate_id).first()
        
        # Check blockchain
        block_in_chain = blockchain.find_certificate(certificate_id)
        
        # Get all certificates for comparison
        all_certs = Certificate.query.all()
        all_cert_ids = [c.certificate_id for c in all_certs]
        
        debug_info = {
            "searched_certificate_id": certificate_id,
            "found_in_database": bool(cert_in_db),
            "found_in_blockchain": bool(block_in_chain),
            "database_details": cert_in_db.to_dict() if cert_in_db else None,
            "blockchain_details": block_in_chain.to_dict() if block_in_chain else None,
            "total_certificates_in_db": len(all_cert_ids),
            "all_certificate_ids": all_cert_ids,
            "certificate_id_matches": [cid for cid in all_cert_ids if certificate_id.lower() in cid.lower()],
            "blockchain_chain_length": len(blockchain.chain),
            "blockchain_valid": blockchain.is_chain_valid()
        }
        
        return create_success_response(debug_info, "Debug information retrieved")
    
    except Exception as e:
        return create_error_response(f"Debug failed: {str(e)}", 500)

@cert_bp.route('/verify/<certificate_id>', methods=['GET'])
@jwt_required()
def verify_certificate(certificate_id):
    """
    Verify a certificate by ID (User and Admin)
    
    URL parameter: certificate_id
    """
    try:
        # Find certificate in blockchain
        block = blockchain.find_certificate(certificate_id)
        
        # Find certificate in database
        cert = Certificate.query.filter_by(certificate_id=certificate_id).first()
        
        if not block or not cert:
            return create_error_response("Certificate not found", 404)
        
        # Verify blockchain integrity
        if not blockchain.is_chain_valid():
            return create_error_response("Blockchain integrity compromised", 500)
        
        response_data = {
            "valid": True,
            "certificate": {
                "certificate_id": cert.certificate_id,
                "student_name": cert.student_name,
                "degree": cert.degree,
                "issue_date": cert.issue_date,
                "created_by": cert.created_by,
                "qr_code_url": f"/static/qrcodes/{cert.certificate_id}.png"
            },
            "blockchain_data": block.to_dict(),
            "verification_timestamp": block.timestamp
        }
        
        return create_success_response(response_data, "Certificate verified successfully")
    
    except Exception as e:
        return create_error_response(f"Verification failed: {str(e)}", 500)

@cert_bp.route('/verify/simple/<certificate_id>', methods=['GET'])
def verify_certificate_public(certificate_id):
    """
    Public certificate verification (no auth required)
    """
    try:
        # Find certificate in blockchain
        block = blockchain.find_certificate(certificate_id)
        
        # Find certificate in database
        cert = Certificate.query.filter_by(certificate_id=certificate_id).first()
        
        if not block or not cert:
            return jsonify({
                "valid": False,
                "message": "Certificate not found",
                "certificate_id": certificate_id
            }), 404
        
        response_data = {
            "valid": True,
            "certificate_id": cert.certificate_id,
            "student_name": cert.student_name,
            "degree": cert.degree,
            "issue_date": cert.issue_date,
            "verification_timestamp": datetime.datetime.utcnow().isoformat(),
            "blockchain_verified": True
        }
        
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({
            "valid": False,
            "error": str(e),
            "certificate_id": certificate_id
        }), 500

@cert_bp.route('/certificates', methods=['GET'])
@jwt_required()
@admin_required
def get_certificates():
    """
    Get all certificates (Admin only)
    """
    try:
        certificates = Certificate.query.all()
        
        cert_list = []
        for cert in certificates:
            cert_data = cert.to_dict()
            cert_data["qr_code_url"] = f"/static/qrcodes/{cert.certificate_id}.png"
            cert_list.append(cert_data)
        
        response_data = {
            "certificates": cert_list,
            "total_count": len(cert_list)
        }
        
        return create_success_response(response_data, "Certificates retrieved successfully")
    
    except Exception as e:
        return create_error_response(f"Failed to retrieve certificates: {str(e)}", 500)

@cert_bp.route('/delete_certificate/<certificate_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_certificate(certificate_id):
    """
    Delete a certificate by ID (Admin only)
    
    Note: This marks the certificate as revoked in the database and blockchain
    rather than physically deleting it to maintain blockchain integrity.
    """
    try:
        # Find certificate in database
        cert = Certificate.query.filter_by(certificate_id=certificate_id).first()
        
        if not cert:
            return create_error_response("Certificate not found", 404)
        
        # Get current user
        current_user = get_current_user()
        
        # Check if certificate is already revoked
        if cert.status == 'revoked':
            return create_error_response("Certificate is already revoked", 400)
        
        # Mark certificate as revoked in database
        cert.status = 'revoked'
        cert.revoked_by = current_user["username"]
        cert.revoked_at = datetime.datetime.utcnow().isoformat()
        
        # Add revocation record to blockchain
        revocation_data = {
            "action": "REVOKE_CERTIFICATE",
            "certificate_id": certificate_id,
            "original_student": cert.student_name,
            "original_degree": cert.degree,
            "revoked_by": current_user["username"],
            "revoked_at": cert.revoked_at,
            "reason": "Certificate revoked by administrator"
        }
        
        revocation_block = blockchain.add_block(revocation_data)
        
        # Remove QR code file if it exists
        import os
        qr_path = f"static/qrcodes/{certificate_id}.png"
        if os.path.exists(qr_path):
            try:
                os.remove(qr_path)
            except:
                pass  # If file removal fails, continue
        
        db.session.commit()
        
        response_data = {
            "revoked_certificate": cert.to_dict(),
            "revocation_block": revocation_block.to_dict(),
            "message": f"Certificate {certificate_id} has been revoked"
        }
        
        return create_success_response(response_data, "Certificate revoked successfully", 200)
    
    except Exception as e:
        db.session.rollback()
        return create_error_response(f"Failed to revoke certificate: {str(e)}", 500)

@cert_bp.route('/chain', methods=['GET'])
@jwt_required()
@admin_required
def get_blockchain():
    """
    Get entire blockchain (Admin only)
    """
    try:
        chain_data = [block.to_dict() for block in blockchain.chain]
        summary = blockchain.get_chain_summary()
        
        response_data = {
            "chain": chain_data,
            "summary": summary
        }
        
        return create_success_response(response_data, "Blockchain retrieved successfully")
    
    except Exception as e:
        return create_error_response(f"Failed to retrieve blockchain: {str(e)}", 500)

@cert_bp.route('/chain/validate', methods=['GET'])
@jwt_required()
@admin_required
def validate_blockchain():
    """
    Validate blockchain integrity (Admin only)
    """
    try:
        is_valid = blockchain.is_chain_valid()
        summary = blockchain.get_chain_summary()
        
        response_data = {
            "is_valid": is_valid,
            "summary": summary
        }
        
        message = "Blockchain is valid" if is_valid else "Blockchain integrity compromised"
        return create_success_response(response_data, message)
    
    except Exception as e:
        return create_error_response(f"Validation failed: {str(e)}", 500)

@cert_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_data():
    """
    Get live dashboard data (Admin only)
    """
    try:
        current_user = get_current_user()
        
        # Quick metrics
        total_certificates = Certificate.query.count()
        total_users = User.query.count()
        blockchain_health = blockchain.is_chain_valid()
        
        # Recent activity (last 10 certificates)
        recent_certs = Certificate.query.order_by(Certificate.id.desc()).limit(10).all()
        
        # Today's activity
        today = datetime.date.today()
        today_certs = Certificate.query.filter(
            func.date(Certificate.issue_date) == today
        ).count()
        
        # Top degree types
        top_degrees = db.session.query(
            Certificate.degree, 
            func.count(Certificate.id).label('count')
        ).group_by(Certificate.degree).order_by(func.count(Certificate.id).desc()).limit(3).all()
        
        # System alerts
        alerts = []
        if not blockchain_health:
            alerts.append({
                "type": "error",
                "message": "Blockchain integrity compromised",
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
        
        if total_certificates == 0:
            alerts.append({
                "type": "info",
                "message": "No certificates issued yet",
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
        
        response_data = {
            "user_info": {
                "username": current_user["username"],
                "role": current_user["role"],
                "login_time": datetime.datetime.utcnow().isoformat()
            },
            "quick_stats": {
                "total_certificates": total_certificates,
                "total_users": total_users,
                "certificates_today": today_certs,
                "blockchain_health": blockchain_health
            },
            "recent_activity": [
                {
                    "id": cert.id,
                    "certificate_id": cert.certificate_id,
                    "student_name": cert.student_name,
                    "degree": cert.degree,
                    "issue_date": cert.issue_date,
                    "created_by": cert.created_by,
                    "time_ago": _calculate_time_ago(cert.issue_date)
                } for cert in recent_certs
            ],
            "top_degrees": [
                {"name": degree, "count": count} 
                for degree, count in top_degrees
            ],
            "system_alerts": alerts,
            "last_updated": datetime.datetime.utcnow().isoformat()
        }
        
        return create_success_response(response_data, "Dashboard data retrieved successfully")
    
    except Exception as e:
        return create_error_response(f"Failed to retrieve dashboard data: {str(e)}", 500)

@cert_bp.route('/search', methods=['GET'])
@jwt_required()
def search_certificates():
    """
    Search certificates with filters (User and Admin)
    """
    try:
        # Get search parameters
        query = request.args.get('q', '').strip()
        degree_filter = request.args.get('degree', '').strip()
        date_from = request.args.get('date_from', '').strip()
        date_to = request.args.get('date_to', '').strip()
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 results
        offset = int(request.args.get('offset', 0))
        
        # Build query
        certificates_query = Certificate.query
        
        # Text search (student name or certificate ID)
        if query:
            certificates_query = certificates_query.filter(
                (Certificate.student_name.ilike(f'%{query}%')) |
                (Certificate.certificate_id.ilike(f'%{query}%')) |
                (Certificate.degree.ilike(f'%{query}%'))
            )
        
        # Degree filter
        if degree_filter:
            certificates_query = certificates_query.filter(
                Certificate.degree.ilike(f'%{degree_filter}%')
            )
        
        # Date range filter
        if date_from:
            certificates_query = certificates_query.filter(
                Certificate.issue_date >= date_from
            )
        
        if date_to:
            certificates_query = certificates_query.filter(
                Certificate.issue_date <= date_to
            )
        
        # Get total count
        total_count = certificates_query.count()
        
        # Apply pagination
        certificates = certificates_query.order_by(Certificate.id.desc()).offset(offset).limit(limit).all()
        
        # Format results
        results = []
        for cert in certificates:
            cert_data = cert.to_dict()
            cert_data["qr_code_url"] = f"/static/qrcodes/{cert.certificate_id}.png"
            
            # Verify in blockchain
            block = blockchain.find_certificate(cert.certificate_id)
            cert_data["blockchain_verified"] = bool(block)
            if block:
                cert_data["block_hash"] = block.hash[:16] + "..."
                cert_data["block_index"] = block.index
            
            results.append(cert_data)
        
        response_data = {
            "results": results,
            "pagination": {
                "total_count": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total_count
            },
            "search_params": {
                "query": query,
                "degree_filter": degree_filter,
                "date_from": date_from,
                "date_to": date_to
            },
            "search_time": datetime.datetime.utcnow().isoformat()
        }
        
        return create_success_response(response_data, f"Found {total_count} certificates")
    
    except Exception as e:
        return create_error_response(f"Search failed: {str(e)}", 500)

def _calculate_time_ago(issue_date_str):
    """Calculate human-readable time ago"""
    try:
        issue_date = datetime.datetime.strptime(issue_date_str, "%Y-%m-%d").date()
        today = datetime.date.today()
        diff = today - issue_date
        
        if diff.days == 0:
            return "Today"
        elif diff.days == 1:
            return "Yesterday"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 30:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        elif diff.days < 365:
            months = diff.days // 30
            return f"{months} month{'s' if months > 1 else ''} ago"
        else:
            years = diff.days // 365
            return f"{years} year{'s' if years > 1 else ''} ago"
    except:
        return "Unknown"

@cert_bp.route('/static/qrcodes/<filename>')
def serve_qr_code(filename):
    """
    Serve QR code images
    """
    try:
        return send_from_directory('static/qrcodes', filename)
    except FileNotFoundError:
        return create_error_response("QR code not found", 404)

@cert_bp.route('/verify/live/<certificate_id>', methods=['GET'])
@jwt_required()
def live_verify_certificate(certificate_id):
    """
    Live certificate verification with detailed blockchain info
    """
    try:
        # Find certificate in blockchain
        block = blockchain.find_certificate(certificate_id)
        
        # Find certificate in database
        cert = Certificate.query.filter_by(certificate_id=certificate_id).first()
        
        verification_result = {
            "certificate_id": certificate_id,
            "verification_timestamp": datetime.datetime.utcnow().isoformat(),
            "blockchain_valid": blockchain.is_chain_valid()
        }
        
        if not block or not cert:
            verification_result.update({
                "status": "INVALID",
                "valid": False,
                "error": "Certificate not found in blockchain or database",
                "details": {
                    "in_blockchain": bool(block),
                    "in_database": bool(cert)
                }
            })
            return create_success_response(verification_result, "Certificate verification completed")
        
        # Certificate found - verify integrity
        computed_hash = block.compute_hash()
        hash_valid = computed_hash == block.hash
        
        verification_result.update({
            "status": "VALID" if hash_valid else "TAMPERED",
            "valid": hash_valid,
            "certificate_data": {
                "certificate_id": cert.certificate_id,
                "student_name": cert.student_name,
                "degree": cert.degree,
                "issue_date": cert.issue_date,
                "issued_by": cert.created_by,
                "qr_code_url": f"/static/qrcodes/{cert.certificate_id}.png"
            },
            "blockchain_info": {
                "block_index": block.index,
                "block_hash": block.hash,
                "previous_hash": block.previous_hash,
                "timestamp": block.timestamp,
                "hash_valid": hash_valid
            },
            "verification_details": {
                "database_match": True,
                "blockchain_match": True,
                "hash_integrity": hash_valid,
                "chain_integrity": blockchain.is_chain_valid()
            }
        })
        
        message = "Certificate verified successfully" if hash_valid else "Certificate has been tampered with"
        return create_success_response(verification_result, message)
    
    except Exception as e:
        return create_error_response(f"Verification failed: {str(e)}", 500)

@cert_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_live_notifications():
    """
    Get live notifications and updates
    """
    try:
        current_user = get_current_user()
        notifications = []
        
        # Recent certificates (last 5)
        recent_certs = Certificate.query.order_by(Certificate.id.desc()).limit(5).all()
        for cert in recent_certs:
            notifications.append({
                "id": f"cert_{cert.id}",
                "type": "certificate_added",
                "title": "New Certificate Issued",
                "message": f"Certificate {cert.certificate_id} issued to {cert.student_name}",
                "timestamp": cert.issue_date,
                "data": {
                    "certificate_id": cert.certificate_id,
                    "student_name": cert.student_name,
                    "degree": cert.degree
                }
            })
        
        # System notifications
        if not blockchain.is_chain_valid():
            notifications.append({
                "id": "blockchain_invalid",
                "type": "system_alert",
                "title": "Blockchain Integrity Issue",
                "message": "Blockchain validation failed - immediate attention required",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "priority": "high"
            })
        
        response_data = {
            "notifications": notifications[:10],  # Limit to 10 most recent
            "unread_count": len(notifications),
            "last_updated": datetime.datetime.utcnow().isoformat(),
            "user_role": current_user["role"]
        }
        
        return create_success_response(response_data, "Live notifications retrieved")
    
    except Exception as e:
        return create_error_response(f"Failed to get notifications: {str(e)}", 500)

@cert_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_stats():
    """
    Get live system statistics (Admin only)
    """
    try:
        # Certificate statistics
        total_certificates = Certificate.query.count()
        today = datetime.date.today()
        certificates_today = Certificate.query.filter(
            func.date(Certificate.issue_date) == today
        ).count()
        
        # User statistics
        total_users = User.query.count()
        admin_users = User.query.filter_by(role='Admin').count()
        regular_users = User.query.filter_by(role='User').count()
        
        # Blockchain statistics
        total_blocks = len(blockchain.chain)
        is_chain_valid = blockchain.is_chain_valid()
        latest_block = blockchain.get_latest_block()
        
        # Recent certificates (last 5)
        recent_certificates = Certificate.query.order_by(Certificate.id.desc()).limit(5).all()
        
        # Certificate distribution by degree (top 5)
        degree_stats = db.session.query(
            Certificate.degree, 
            func.count(Certificate.id).label('count')
        ).group_by(Certificate.degree).order_by(func.count(Certificate.id).desc()).limit(5).all()
        
        # Monthly certificate trends (last 6 months)
        monthly_stats = []
        for i in range(6):
            month_start = datetime.date.today().replace(day=1) - datetime.timedelta(days=i*30)
            month_count = Certificate.query.filter(
                func.date(Certificate.issue_date) >= month_start,
                func.date(Certificate.issue_date) < month_start + datetime.timedelta(days=30)
            ).count()
            monthly_stats.append({
                "month": month_start.strftime("%Y-%m"),
                "count": month_count
            })
        
        response_data = {
            "overview": {
                "total_certificates": total_certificates,
                "certificates_today": certificates_today,
                "total_users": total_users,
                "admin_users": admin_users,
                "regular_users": regular_users,
                "blockchain_valid": is_chain_valid,
                "total_blocks": total_blocks
            },
            "blockchain_info": {
                "total_blocks": total_blocks,
                "is_valid": is_chain_valid,
                "latest_block_hash": latest_block.hash[:16] + "..." if latest_block else None,
                "latest_block_timestamp": latest_block.timestamp if latest_block else None
            },
            "recent_activity": {
                "recent_certificates": [
                    {
                        "id": cert.id,
                        "certificate_id": cert.certificate_id,
                        "student_name": cert.student_name,
                        "degree": cert.degree,
                        "issue_date": cert.issue_date,
                        "created_by": cert.created_by,
                        "qr_code_available": bool(cert.qr_code_path)
                    } for cert in recent_certificates
                ]
            },
            "analytics": {
                "degree_distribution": [
                    {"degree": degree, "count": count} 
                    for degree, count in degree_stats
                ],
                "monthly_trends": monthly_stats[::-1]  # Reverse to show oldest first
            },
            "system_health": {
                "database_connected": True,
                "blockchain_integrity": is_chain_valid,
                "api_version": "1.0.0",
                "last_updated": datetime.datetime.utcnow().isoformat()
            }
        }
        
        return create_success_response(response_data, "Live statistics retrieved successfully")
    
    except Exception as e:
        return create_error_response(f"Failed to retrieve statistics: {str(e)}", 500)
