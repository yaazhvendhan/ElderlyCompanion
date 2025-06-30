import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Send, Mic, Leaf, Quote, MessageCircle, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { type ChatMessage } from "@shared/schema";
import { useSpeech } from "@/hooks/use-speech";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ChatCompanion() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startListening, isListening } = useSpeech();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        content,
        isFromUser: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    startListening((transcript) => {
      setMessage(transcript);
    });
  };

  const handleQuickAction = (action: string) => {
    const actions = {
      nature: "Could you play some nature sounds for me?",
      quote: "Could you share a motivational quote?",
      memory: "I'd like to share a memory with you.",
      feeling: "I want to talk about how I'm feeling today.",
    };
    
    sendMessageMutation.mutate(actions[action as keyof typeof actions] || action);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 gentle-shadow">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Heart className="text-primary mr-3" />
            Your Friendly Companion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chat Messages */}
          <div className="bg-muted/30 p-6 rounded-xl max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Hello! I'm here to chat and keep you company. How are you feeling today?
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${
                      msg.isFromUser ? "justify-end" : ""
                    }`}
                  >
                    {!msg.isFromUser && (
                      <div className="bg-primary text-primary-foreground p-3 rounded-full">
                        🤖
                      </div>
                    )}
                    <div
                      className={`max-w-sm p-4 rounded-xl ${
                        msg.isFromUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground gentle-shadow"
                      }`}
                    >
                      <p className="text-lg">{msg.content}</p>
                      <span className={`text-xs ${
                        msg.isFromUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : "now"}
                      </span>
                    </div>
                    {msg.isFromUser && (
                      <div className="bg-muted text-muted-foreground p-3 rounded-full">
                        👤
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleQuickAction("nature")}
              className="large-touch bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-medium"
            >
              <Leaf className="mb-2 text-xl block h-5 w-5" />
              Nature Sounds
            </Button>
            <Button
              onClick={() => handleQuickAction("quote")}
              className="large-touch bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-medium"
            >
              <Quote className="mb-2 text-xl block h-5 w-5" />
              Daily Quote
            </Button>
            <Button
              onClick={() => handleQuickAction("memory")}
              className="large-touch bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl font-medium"
            >
              <MessageCircle className="mb-2 text-xl block h-5 w-5" />
              Share Memory
            </Button>
            <Button
              onClick={() => handleQuickAction("feeling")}
              className="large-touch bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-xl font-medium"
            >
              <Smile className="mb-2 text-xl block h-5 w-5" />
              How I Feel
            </Button>
          </div>

          {/* Message Input */}
          <div className="flex space-x-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message or ask me anything..."
              className="flex-1 text-lg px-4 py-4"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="large-touch bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleVoiceInput}
              disabled={isListening}
              className="large-touch bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Mic className={`h-5 w-5 ${isListening ? 'text-red-200' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
