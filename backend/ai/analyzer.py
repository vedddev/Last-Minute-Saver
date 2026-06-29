from datetime import datetime, timedelta
from collections import defaultdict


def analyze_tasks(tasks):

    now = datetime.now()

    total_tasks = len(tasks)
    completed_tasks = 0

    total_score = 100
    high_risk = []

    weekly = defaultdict(int)
    monthly = defaultdict(int)

    total_estimated_minutes = 0

    for task in tasks:

        total_estimated_minutes += task.estimated_time

        if task.status and task.status.lower() == "completed":
                completed_tasks += 1

        try:
            deadline = datetime.strptime(
                task.deadline,
                "%Y-%m-%d %H:%M"
            )

            hours_left = (
                deadline - now
            ).total_seconds() / 3600

        except:
            hours_left = 24

        estimated_hours = task.estimated_time / 60

        if hours_left <= estimated_hours:

            probability = 95
            risk = "High"
            recommendation = "Start immediately."

        elif hours_left <= estimated_hours * 2:

            probability = 70
            risk = "Medium"
            recommendation = "Work on this today."

        else:

            probability = 20
            risk = "Low"
            recommendation = "On schedule."

        if risk == "High":

            high_risk.append({
                "title": task.title,
                "risk": risk,
                "completion_probability": 100 - probability,
                "reason": "Not enough time before deadline.",
                "recommendation": recommendation
            })

            total_score -= 15

        # Weekly Chart
        day = deadline.strftime("%a")
        weekly[day] += 1

        # Monthly Chart
        week = deadline.strftime("Week %U")
        monthly[week] += 1

    total_score = max(total_score, 0)

    completion_rate = 0

    if total_tasks:
        completion_rate = round(
            completed_tasks / total_tasks * 100
        )

    focus_hours = round(total_estimated_minutes / 60, 1)

    insights = []

    if completion_rate < 60:
        insights.append(
            "Your task completion rate is low. Finish pending work before creating new tasks."
        )

    if high_risk:
        insights.append(
            f"{len(high_risk)} tasks are at high risk."
        )

    if completion_rate > 80:
        insights.append(
            "Excellent productivity this week!"
        )

    return {

        "productivity_score": total_score,

        "completion_rate": completion_rate,

        "completed_tasks": completed_tasks,

        "total_tasks": total_tasks,

        "focus_time": focus_hours,

        "streak": 7,

        "weekly": [
            {
                "label": k,
                "value": v
            }
            for k, v in weekly.items()
        ],

        "monthly": [
            {
                "label": k,
                "value": v
            }
            for k, v in monthly.items()
        ],

        "most_productive_day":
            max(
                weekly,
                key=weekly.get
            ) if weekly else None,

        "insights": insights,

        "high_risk_tasks": high_risk
    }