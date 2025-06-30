import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Mic, CheckCircle, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { insertReminderSchema, type Reminder } from "@shared/schema";
import { useSpeech } from "@/hooks/use-speech";
import { useToast } from "@/hooks/use-toast";

export default function ReminderForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startListening, isListening } = useSpeech();

  const form = useForm({
    resolver: zodResolver(insertReminderSchema.extend({
      date: insertReminderSchema.shape.date.optional(),
    })),
    defaultValues: {
      title: "",
      description: "",
      time: "",
      frequency: "",
      date: "",
    },
  });

  const { data: todayReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders/today"],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/reminders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/today"] });
      form.reset();
      toast({
        title: "Reminder Created",
        description: "Your reminder has been saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/reminders/${id}`, { isCompleted: true });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/today"] });
      toast({
        title: "Great job!",
        description: "Reminder marked as complete!",
      });
    },
  });

  const onSubmit = (data: any) => {
    const reminderData = {
      ...data,
      date: data.frequency === "once" ? new Date().toISOString().split('T')[0] : null,
    };
    createReminderMutation.mutate(reminderData);
  };

  const handleVoiceInput = (field: string) => {
    startListening((transcript) => {
      form.setValue(field, transcript);
    });
  };

  const getStatusColor = (reminder: Reminder) => {
    const now = new Date();
    const reminderTime = new Date(`${now.toDateString()} ${reminder.time}`);
    
    if (reminder.isCompleted) return "border-l-green-500 bg-green-50";
    if (reminderTime < now) return "border-l-yellow-500 bg-yellow-50";
    return "border-l-blue-500 bg-blue-50";
  };

  const getStatusLabel = (reminder: Reminder) => {
    const now = new Date();
    const reminderTime = new Date(`${now.toDateString()} ${reminder.time}`);
    
    if (reminder.isCompleted) return "Complete";
    if (reminderTime < now) return "Missed";
    return "Upcoming";
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Add New Reminder Section */}
      <Card className="p-8 gentle-shadow">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Plus className="text-primary mr-3" />
            Add New Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">What would you like to remember?</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Take blood pressure medicine"
                          className="text-lg px-4 py-4"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoiceInput("title")}
                        disabled={isListening}
                      >
                        <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Additional notes (optional)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="Any special instructions or details..."
                          className="text-lg px-4 py-4"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoiceInput("description")}
                        disabled={isListening}
                      >
                        <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          className="text-lg px-4 py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">How often?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-lg px-4 py-4">
                            <SelectValue placeholder="Choose frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="once">Just once</SelectItem>
                          <SelectItem value="daily">Every day</SelectItem>
                          <SelectItem value="weekly">Every week</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="large-touch w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createReminderMutation.isPending}
              >
                <Save className="mr-2 h-5 w-5" />
                {createReminderMutation.isPending ? "Saving..." : "Save Reminder"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Today's Reminders */}
      <Card className="p-8 gentle-shadow">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Calendar className="text-primary mr-3" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayReminders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reminders for today. Why not add one?
              </p>
            ) : (
              todayReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`border-l-4 p-4 rounded-r-xl ${getStatusColor(reminder)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{reminder.title}</h3>
                      {reminder.description && (
                        <p className="text-muted-foreground">{reminder.description}</p>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {reminder.time} - {reminder.frequency}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {reminder.isCompleted ? (
                        <CheckCircle className="text-green-600 h-6 w-6" />
                      ) : (
                        <Button
                          onClick={() => markCompleteMutation.mutate(reminder.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={markCompleteMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
