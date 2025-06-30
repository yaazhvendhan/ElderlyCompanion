import { useState } from "react";
import { Heart, Calendar, StickyNote, MessageCircle, Users, User, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReminderForm from "@/components/reminder-form";
import MemoryBoard from "@/components/memory-board";
import ChatCompanion from "@/components/chat-companion";
import CaregiverDashboard from "@/components/caregiver-dashboard";
import EmergencyModal from "@/components/emergency-modal";
import NotificationBar from "@/components/notification-bar";
import UserProfileComponent from "@/components/user-profile";
import MedicationManager from "@/components/medication-manager";

type TabType = "profile" | "reminders" | "medications" | "memory" | "companion" | "caregiver";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "reminders", label: "My Reminders", icon: Calendar },
    { id: "medications", label: "Medications", icon: Pill },
    { id: "memory", label: "Memory Board", icon: StickyNote },
    { id: "companion", label: "Chat Friend", icon: MessageCircle },
    { id: "caregiver", label: "Family View", icon: Users },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="warm-card elevated-shadow sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Heart className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">CareCompanion</h1>
                <p className="text-sm text-muted-foreground">Your caring digital assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowEmergencyModal(true)}
                className="large-touch bg-red-600 hover:bg-red-700 text-white elevated-shadow"
              >
                🚨 Emergency Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Notification Bar */}
        <NotificationBar />

        {/* Navigation Tabs */}
        <nav className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={isActive ? "default" : "outline"}
                  className={`large-touch p-6 h-auto flex-col space-y-2 font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground elevated-shadow scale-105" 
                      : "hover:scale-102 gentle-shadow warm-card"
                  }`}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm text-center leading-tight">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "profile" && <UserProfileComponent />}
          {activeTab === "reminders" && <ReminderForm />}
          {activeTab === "medications" && <MedicationManager />}
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
