import { useState } from "react";
import { Heart, Calendar, StickyNote, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReminderForm from "@/components/reminder-form";
import MemoryBoard from "@/components/memory-board";
import ChatCompanion from "@/components/chat-companion";
import CaregiverDashboard from "@/components/caregiver-dashboard";
import EmergencyModal from "@/components/emergency-modal";
import NotificationBar from "@/components/notification-bar";

type TabType = "reminders" | "memory" | "companion" | "caregiver";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("reminders");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const tabs = [
    { id: "reminders", label: "My Reminders", icon: Calendar },
    { id: "memory", label: "Memory Board", icon: StickyNote },
    { id: "companion", label: "Chat Companion", icon: MessageCircle },
    { id: "caregiver", label: "Caregiver View", icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card gentle-shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Heart className="text-primary text-2xl" />
              <h1 className="text-2xl font-semibold text-foreground">Digital Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowEmergencyModal(true)}
                className="large-touch bg-primary text-primary-foreground hover:bg-primary/90"
              >
                📞 Emergency
              </Button>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  👤
                </div>
                <span className="font-medium">Margaret</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Notification Bar */}
        <NotificationBar />

        {/* Navigation Tabs */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className="large-touch px-8 py-4 font-medium"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "reminders" && <ReminderForm />}
          {activeTab === "memory" && <MemoryBoard />}
          {activeTab === "companion" && <ChatCompanion />}
          {activeTab === "caregiver" && <CaregiverDashboard />}
        </div>
      </main>

      {/* Emergency Modal */}
      <EmergencyModal 
        isOpen={showEmergencyModal} 
        onClose={() => setShowEmergencyModal(false)} 
      />
    </div>
  );
}
