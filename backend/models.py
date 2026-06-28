from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Task(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(200), nullable=False)

    description = db.Column(db.Text)

    deadline = db.Column(db.String(100))

    estimated_time = db.Column(db.String(50))

    priority = db.Column(db.String(20))

    category = db.Column(db.String(50))

    status = db.Column(db.String(20), default="Pending")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)