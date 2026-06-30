from flask import Blueprint, request, jsonify

from services.auth_service import AuthService
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from extensions import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    response, status = AuthService.register(data)

    return jsonify(response), status

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    response, status = AuthService.login(data)

    return jsonify(response), status

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "success": False,
            "message": "User not found."
        }, 404

    return {
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }, 200

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()

    user = User.query.get(current_user)

    data = request.get_json()

    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Profile updated successfully"
    }), 200