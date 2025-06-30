import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Unlock, TrendingUp, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Reminder, type EmergencyContact } from "@shared/schema";

export default function CaregiverDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    enabled: isAuthenticated,
  });

  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts"],
    enabled: isAuthenticated,
  });

  const handleAuthenticate = () => {
    // Simple demo authentication - in production, this would be properly secured
    if (accessCode === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid access code. Try: 1234");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAuthenticate();
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-8 gentle-shadow text-center max-w-md mx-auto">
        <CardContent className="pt-6">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-2xl mb-4">Caregiver Access</CardTitle>
          <p className="text-muted-foreground mb-6">
            This section is protected. Please enter the caregiver access code.
          </p>
          
          <div className="space-y-4">
            <Input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter access code"
              className="text-lg text-center px-4 py-4"
            />
            <Button 
              onClick={handleAuthenticate}
              className="large-touch w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Unlock className="mr-2 h-5 w-5" />
              Access Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedToday = reminders.filter(r => r.isCompleted).length;
  const totalToday = reminders.length;
  const missedThisWeek = reminders.filter(r => !r.isCompleted && !r.isActive).length;

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Overview */}
        <Card className="p-6 gentle-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="text-primary mr-2 h-5 w-5" />
              Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Reminders Completed Today</span>
                <span className="font-semibold text-green-600">{completedToday}/{totalToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Missed This Week</span>
                <span className="font-semibold text-orange-600">{missedThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Chat Session</span>
                <span className="font-semibold text-muted-foreground">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reminders */}
        <Card className="p-6 gentle-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Clock className="text-primary mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {reminders.slice(0, 5).map((reminder) => (
                <div key={reminder.id} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    reminder.isCompleted ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <span className="flex-1">{reminder.title}</span>
                  <span className={`font-medium ${
                    reminder.isCompleted ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {reminder.isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
              {reminders.length === 0 && (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="p-6 gentle-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Phone className="text-primary mr-2 h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex justify-between">
                  <span>{contact.name} ({contact.relationship})</span>
                  <a 
                    href={`tel:${contact.phone}`} 
                    className={`font-medium ${
                      contact.relationship === 'Emergency' ? 'text-red-600' : 'text-primary'
                    } hover:underline`}
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reminders List */}
      <Card className="p-6 gentle-shadow">
        <CardHeader>
          <CardTitle className="text-xl">All Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reminders found.
              </p>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{reminder.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {reminder.time} - {reminder.frequency}
                    </p>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground">{reminder.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      reminder.isCompleted 
                        ? 'bg-green-100 text-green-800'
                        : reminder.isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {reminder.isCompleted ? 'Completed' : reminder.isActive ? 'Active' : 'Missed'}
                    </span>
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
