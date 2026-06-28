from flask import Blueprint, request, jsonify

from extensions import db
from models.task import Task

task_bp = Blueprint("task", __name__)


@task_bp.route("/", methods=["GET"])
def get_tasks():

    tasks = Task.query.all()

    data = []

    for task in tasks:
        data.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "deadline": task.deadline,
            "priority": task.priority,
            "status": task.status
        })

    return jsonify(data)


from flask_jwt_extended import jwt_required, get_jwt_identity

@task_bp.route("/add", methods=["POST"])
@jwt_required()
def add_task():

    user_id = int(get_jwt_identity())
    data = request.json

    task = Task(
        user_id=user_id,
        title=data["title"],
        description=data.get("description"),
        deadline=data.get("deadline"),
        estimated_time=data.get("estimated_time"),
        priority=data.get("priority"),
        category=data.get("category")
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Task Added"
    })