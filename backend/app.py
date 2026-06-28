from flask import Flask
from routes.ai import ai_bp

from config import Config
from extensions import db, jwt, cors

from routes.task import task_bp
from routes.auth import auth_bp

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)
jwt.init_app(app)
cors.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(task_bp, url_prefix="/tasks")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(
    ai_bp,
    url_prefix="/ai"
)

@app.route("/")
def home():
    return {"message": "Athena Backend Running"}

# print("\nRegistered Routes:")
# for rule in app.url_map.iter_rules():
#         print(rule)

import os

print("Current working directory:", os.getcwd())
print("Database URI:", app.config["SQLALCHEMY_DATABASE_URI"])
print("Instance path:", app.instance_path)
        
if __name__ == "__main__":
    
    app.run(debug=True)