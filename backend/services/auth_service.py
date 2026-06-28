from flask_jwt_extended import create_access_token

from models.user import User
from extensions import db


class AuthService:

    @staticmethod
    def register(data):

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        # Validation
        if not name or not email or not password:
            return {
                "success": False,
                "message": "All fields are required."
            }, 400

        # Check existing user
        user = User.query.filter_by(email=email).first()

        if user:
            return {
                "success": False,
                "message": "Email already exists."
            }, 409

        new_user = User(
            name=name,
            email=email
        )

        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return {
            "success": True,
            "message": "Registration successful."
        }, 201
        
    @staticmethod
    def login(data):

            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return {
                    "success": False,
                    "message": "Email and password are required."
                }, 400

            user = User.query.filter_by(email=email).first()
            
            print("Email entered:", email)
            print("User found:", user)

            if not user:
                return {
                    "success": False,
                    "message": "Invalid email or password."
                }, 401

            if not user.check_password(password):
                return {
                    "success": False,
                    "message": "Invalid email or password."
                }, 401

            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    "email": user.email,
                    "name": user.name
                }
            )

            return {
                "success": True,
                "message": "Login successful.",
                "access_token": access_token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email
                }
            }, 200