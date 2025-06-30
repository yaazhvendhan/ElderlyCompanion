import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { type Reminder } from "@shared/schema";
import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationBar() {
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);
  const queryClient = useQueryClient();
  
  const { data: todayReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders/today"],
    refetchInterval: 60000, // Check every minute
  });

  const { requestPermission, showNotification } = useNotifications();

  const markCompleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/reminders/${id}`, { isCompleted: true });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/today"] });
      setActiveNotification(null);
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: async (id: number) => {
      // In a real app, this would update the reminder time
      return { id };
    },
    onSuccess: () => {
      setActiveNotification(null);
      // Show notification again in 10 minutes
      setTimeout(() => {
        if (activeNotification) {
          showNotification(
            "Reminder Snoozed",
            `Time to: ${activeNotification.title}`,
            () => setActiveNotification(activeNotification)
          );
        }
      }, 10 * 60 * 1000);
    },
  });

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    // Check for due reminders
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const dueReminder = todayReminders.find(reminder => 
      reminder.time === currentTime && 
      !reminder.isCompleted && 
      reminder.isActive
    );

    if (dueReminder && !activeNotification) {
      setActiveNotification(dueReminder);
      showNotification(
        "Reminder",
        `Time to: ${dueReminder.title}`,
        () => setActiveNotification(dueReminder)
      );
    }
  }, [todayReminders, activeNotification, showNotification]);

  if (!activeNotification) {
    return null;
  }

  return (
    <Card className="bg-orange-600 text-white p-6 rounded-xl gentle-shadow mb-6 notification-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Bell className="text-2xl h-8 w-8" />
          <div>
            <h3 className="font-semibold text-xl">{activeNotification.title}</h3>
            {activeNotification.description && (
              <p className="text-lg opacity-90">{activeNotification.description}</p>
            )}
            <p className="text-sm opacity-75">
              {activeNotification.time} - {activeNotification.frequency}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => snoozeMutation.mutate(activeNotification.id)}
            className="large-touch bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            disabled={snoozeMutation.isPending}
          >
            <Clock className="mr-2 h-4 w-4" />
            Snooze 10 min
          </Button>
          <Button
            onClick={() => markCompleteMutation.mutate(activeNotification.id)}
            className="large-touch bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            disabled={markCompleteMutation.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            Done
          </Button>
          <Button
            onClick={() => setActiveNotification(null)}
            variant="ghost"
            className="large-touch text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
