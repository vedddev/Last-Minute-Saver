from ai.planner import generate_plan
from extensions import db
from models.task import Task
from ai.scheduler import schedule_tasks
from models.task import Task
from ai.analyzer import analyze_tasks


class AIService:

    @staticmethod
    def create_plan(user_id, prompt):

            result = generate_plan(prompt)

            saved_tasks = []

            for item in result.get("tasks", []):

                task = Task(

                    user_id=user_id,

                    title=item.get("title"),

                    description=item.get("description"),

                    deadline=item.get("deadline"),

                    estimated_time=item.get("estimated_time"),

                    priority=item.get("priority"),

                    category=item.get("category")

                )

                # print("Saving task:", item)
                db.session.add(task)
                saved_tasks.append(item)
                # print("Saved!")
            db.session.commit()
            print("Total tasks:", Task.query.count())
            return {

                "success": True,

                "tasks": saved_tasks

            }, 200
            
    @staticmethod
    def create_schedule(user_id, slots):

        tasks = Task.query.filter_by(
            user_id=user_id,
            status="Pending"
        ).all()

        task_data = []

        for t in tasks:

            task_data.append({

                "title": t.title,

                "deadline": t.deadline,

                "estimated_time": t.estimated_time,

                "priority": t.priority

            })

        result = schedule_tasks(
            task_data,
            slots
        )

        return {

            "success": True,

            "schedule": result

        }, 200
    
    @staticmethod
    def analyze(user_id):

        tasks = Task.query.filter_by(
            user_id=int(user_id),
            status="Pending"
        ).all()

        print("=" * 50)
        print("Logged in user:", user_id)
        print("Tasks found:", len(tasks))

        for t in tasks:
            print(
                f"ID={t.id}, Title={t.title}, User={t.user_id}, "
                f"Deadline={t.deadline}, Status={t.status}"
            )

        print("=" * 50)

        result = analyze_tasks(tasks)

        return {
            "success": True,
            "analysis": result
        }, 200
    @staticmethod
    def coach(user_id):

        from ai.coach import generate_coach

        tasks = Task.query.filter_by(
            user_id=int(user_id),
            status="Pending"
        ).all()

        result = generate_coach(tasks)

        return {
            "success": True,
            "coach": result
        }, 200
        
    @staticmethod
    def chat(user_id, message):

        from ai.chat import ask_chat

        tasks = Task.query.filter_by(
            user_id=int(user_id)
        ).all()

        result = ask_chat(
            tasks,
            message
        )

        return {
            "success": True,
            "response": result
        }, 200
        
    @staticmethod
    def priorities(user_id):

        from ai.priority import calculate_priority

        tasks = Task.query.filter_by(
            user_id=int(user_id),
            status="Pending"
        ).all()

        result = calculate_priority(tasks)

        return {
            "success": True,
            "priorities": result
        }, 200
        
    @staticmethod
    def dashboard(user_id):

        from ai.dashboard import generate_dashboard

        tasks = Task.query.filter_by(
            user_id=int(user_id)
        ).all()

        result = generate_dashboard(tasks)

        return {
            "success": True,
            "dashboard": result
        }, 200