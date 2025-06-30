export class ReminderScheduler {
  private intervals: Map<number, NodeJS.Timeout> = new Map();

  scheduleReminder(
    reminderId: number,
    time: string,
    callback: () => void,
    frequency: "once" | "daily" | "weekly" = "once"
  ) {
    // Clear existing interval if any
    this.clearReminder(reminderId);

    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    
    let targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow (for daily reminders)
    if (targetTime <= now && frequency !== "once") {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilReminder = targetTime.getTime() - now.getTime();

    if (frequency === "once") {
      // Schedule once
      if (timeUntilReminder > 0) {
        const timeout = setTimeout(callback, timeUntilReminder);
        this.intervals.set(reminderId, timeout);
      }
    } else if (frequency === "daily") {
      // Schedule daily
      const scheduleDaily = () => {
        callback();
        // Schedule next occurrence
        const interval = setInterval(callback, 24 * 60 * 60 * 1000); // 24 hours
        this.intervals.set(reminderId, interval);
      };

      if (timeUntilReminder > 0) {
        const timeout = setTimeout(scheduleDaily, timeUntilReminder);
        this.intervals.set(reminderId, timeout);
      } else {
        scheduleDaily();
      }
    } else if (frequency === "weekly") {
      // Schedule weekly
      const scheduleWeekly = () => {
        callback();
        // Schedule next occurrence
        const interval = setInterval(callback, 7 * 24 * 60 * 60 * 1000); // 7 days
        this.intervals.set(reminderId, interval);
      };

      if (timeUntilReminder > 0) {
        const timeout = setTimeout(scheduleWeekly, timeUntilReminder);
        this.intervals.set(reminderId, timeout);
      } else {
        scheduleWeekly();
      }
    }
  }

  clearReminder(reminderId: number) {
    const interval = this.intervals.get(reminderId);
    if (interval) {
      clearTimeout(interval);
      clearInterval(interval);
      this.intervals.delete(reminderId);
    }
  }

  clearAllReminders() {
    this.intervals.forEach((interval) => {
      clearTimeout(interval);
      clearInterval(interval);
    });
    this.intervals.clear();
  }
}

export const scheduler = new ReminderScheduler();
