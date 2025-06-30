import { useQuery } from "@tanstack/react-query";
import { Phone, X, AlertTriangle, User, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type EmergencyContact } from "@shared/schema";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { data: contacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts"],
  });

  const getContactIcon = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'emergency':
        return AlertTriangle;
      case 'doctor':
        return UserCheck;
      default:
        return User;
    }
  };

  const getContactColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'emergency':
        return "bg-red-600 hover:bg-red-700";
      case 'doctor':
        return "bg-green-600 hover:bg-green-700";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <Phone className="text-orange-600 mr-3" />
            Emergency Contacts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {contacts.map((contact) => {
            const Icon = getContactIcon(contact.relationship);
            const colorClass = getContactColor(contact.relationship);
            
            return (
              <a
                key={contact.id}
                href={`tel:${contact.phone}`}
                className={`large-touch block w-full ${colorClass} text-white p-4 rounded-xl font-medium text-center transition-colors duration-200 hover:scale-105 transform`}
              >
                <Icon className="mr-2 h-5 w-5 inline" />
                {contact.name} ({contact.relationship}) - {contact.phone}
              </a>
            );
          })}
          
          {contacts.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No emergency contacts configured.
            </p>
          )}
        </div>
        
        <Button
          onClick={onClose}
          variant="outline"
          className="large-touch w-full mt-6"
        >
          <X className="mr-2 h-5 w-5" />
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
