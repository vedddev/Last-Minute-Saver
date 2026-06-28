from datetime import datetime, timedelta

PRIORITY_ORDER = {
    "High": 0,
    "Medium": 1,
    "Low": 2
}


def schedule_tasks(tasks, available_hours):

    tasks = sorted(
        tasks,
        key=lambda t: (
            PRIORITY_ORDER.get(t["priority"], 3),
            t["deadline"]
        )
    )

    timeline = []
    unscheduled = []

    current_day = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)

    for hours in available_hours:

        remaining = hours * 60

        while tasks:

            task = tasks[0]

            if task["estimated_time"] <= remaining:

                start = current_day

                end = start + timedelta(minutes=task["estimated_time"])

                timeline.append({
                    "title": task["title"],
                    "date": start.strftime("%Y-%m-%d"),
                    "start": start.strftime("%H:%M"),
                    "end": end.strftime("%H:%M"),
                    "priority": task["priority"]
                })

                current_day = end
                remaining -= task["estimated_time"]
                tasks.pop(0)

            else:
                break

        current_day = current_day.replace(hour=9, minute=0) + timedelta(days=1)

    unscheduled.extend(tasks)

    return {
        "timeline": timeline,
        "unscheduled": unscheduled
    }