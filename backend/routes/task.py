from flask import Blueprint, request, jsonify

from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.task import Task

task_bp = Blueprint("task", __name__)


# =====================================================
# Get All Tasks
# =====================================================

@task_bp.route("/", methods=["GET"])
@jwt_required()
def get_tasks():

    user_id = int(get_jwt_identity())

    tasks = Task.query.filter_by(user_id=user_id).all()

    data = []

    for task in tasks:
        data.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "deadline": task.deadline,
            "estimated_time": task.estimated_time,
            "priority": task.priority,
            "status": task.status,
            "category": task.category
        })

    return jsonify(data)


# =====================================================
# Add Task
# =====================================================

@task_bp.route("/add", methods=["POST"])
@jwt_required()
def add_task():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    task = Task(
        user_id=user_id,
        title=data["title"],
        description=data.get("description"),
        deadline=data.get("deadline"),
        estimated_time=data.get("estimated_time"),
        priority=data.get("priority", "medium"),
        status=data.get("status", "pending"),
        category=data.get("category")
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Task Added",
        "id": task.id
    }), 201


# =====================================================
# Update Task
# =====================================================

@task_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_task(id):

    user_id = int(get_jwt_identity())

    task = Task.query.filter_by(
        id=id,
        user_id=user_id
    ).first()

    if task is None:
        return jsonify({
            "success": False,
            "message": "Task not found"
        }), 404

    data = request.get_json()

    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.deadline = data.get("deadline", task.deadline)
    task.estimated_time = data.get(
        "estimated_time",
        task.estimated_time
    )
    task.priority = data.get("priority", task.priority)
    task.status = data.get("status", task.status)
    task.category = data.get("category", task.category)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Task Updated"
    })


# =====================================================
# Delete Task
# =====================================================

@task_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_task(id):

    user_id = int(get_jwt_identity())

    task = Task.query.filter_by(
        id=id,
        user_id=user_id
    ).first()

    if task is None:
        return jsonify({
            "success": False,
            "message": "Task not found"
        }), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Task Deleted"
    })