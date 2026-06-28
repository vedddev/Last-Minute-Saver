from datetime import datetime

def calculate_priority(tasks):

    result = []
    now = datetime.now()

    for t in tasks:

        score = 0

        # Priority weight
        if t.priority == "High":
            score += 50
        elif t.priority == "Medium":
            score += 30
        else:
            score += 10

        # Estimated work (handle None safely)
        estimated = t.estimated_time or 0
        score += min(estimated // 30, 20)

        # Deadline urgency
        try:
            deadline = datetime.strptime(t.deadline, "%Y-%m-%d %H:%M")
            hours_left = (deadline - now).total_seconds() / 3600

            if hours_left <= 24:
                score += 30
            elif hours_left <= 72:
                score += 15

        except Exception:
            # Ignore deadlines that aren't in the expected format
            pass

        score = min(score, 100)

        result.append({
            "title": t.title,
            "score": score
        })

    result.sort(key=lambda x: x["score"], reverse=True)

    return result