from datetime import datetime


def analyze_tasks(tasks):
    """
    Analyze pending tasks and predict deadline risk.
    """

    total_score = 100
    high_risk = []

    now = datetime.now()

    for task in tasks:

        now = datetime.now()

        try:
            deadline = datetime.strptime(task.deadline, "%Y-%m-%d %H:%M")
            hours_left = (deadline - now).total_seconds() / 3600

            print("Current time:", now)
            print("Deadline:", deadline)
            print("Hours left:", hours_left)

        except Exception as e:
            print("Date parsing error:", e)
            hours_left = 24

        estimated = task.estimated_time / 60

        print("Estimated hours:", estimated)
        if hours_left <= estimated:

            probability = 95

            risk = "High"

            recommendation = "Start immediately."

        elif hours_left <= estimated * 2:

            probability = 70

            risk = "Medium"

            recommendation = "Work on this today."

        else:

            probability = 20

            risk = "Low"

            recommendation = "On schedule."
        print("Risk:", risk)
        if risk == "High":

            high_risk.append({

                "title": task.title,

                "risk": risk,

                "completion_probability": 100 - probability,

                "reason": "Not enough time before deadline.",

                "recommendation": recommendation

            })

            total_score -= 15

    total_score = max(total_score, 0)

    return {

        "overall_productivity_score": total_score,

        "high_risk_tasks": high_risk

    }