from extensions import db

class Task(db.Model):

    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    title = db.Column(db.String(200), nullable=False)

    description = db.Column(db.Text)

    deadline = db.Column(db.String(100))

    estimated_time = db.Column(db.Integer)

    priority = db.Column(db.String(20))

    category = db.Column(db.String(50))

    status = db.Column(db.String(30), default="Pending")

    created_at = db.Column(db.DateTime, server_default=db.func.now())