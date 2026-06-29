from flask import Blueprint
from flask import request
from flask import jsonify

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity

from services.ai_service import AIService

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/plan", methods=["POST"])
@jwt_required()
def planner():

    data = request.get_json()

    prompt = data.get("prompt")

    user_id = get_jwt_identity()

    response, status = AIService.create_plan(
        user_id,
        prompt
    )

    return jsonify(response), status

@ai_bp.route("/schedule", methods=["POST"])
@jwt_required()
def schedule():

    user_id = get_jwt_identity()

    data = request.get_json()

    print("="*50)
    print("Incoming JSON:", data)
    print("User:", user_id)

    slots = data.get("available_hours")

    print("Slots:", slots)

    response, status = AIService.create_schedule(
        user_id,
        slots
    )

    return jsonify(response), status

@ai_bp.route("/analyze", methods=["GET"])
@jwt_required()
def analyze():

    user_id = get_jwt_identity()

    response, status = AIService.analyze(user_id)

    return jsonify(response), status

@ai_bp.route("/coach", methods=["GET"])
@jwt_required()
def coach():

    user_id = get_jwt_identity()

    response, status = AIService.coach(user_id)

    return jsonify(response), status


@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():

    user_id = get_jwt_identity()

    data = request.get_json()

    message = data.get("message")

    response, status = AIService.chat(
        user_id,
        message
    )

    return jsonify(response), status



@ai_bp.route("/priorities", methods=["GET"])
@jwt_required()
def priorities():

    user_id = get_jwt_identity()

    response, status = AIService.priorities(user_id)

    return jsonify(response), status



@ai_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    user_id = get_jwt_identity()

    response, status = AIService.dashboard(user_id)

    return jsonify(response), status