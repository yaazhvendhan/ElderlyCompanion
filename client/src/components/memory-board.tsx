import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pen, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { insertMemorySchema, type Memory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function MemoryBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertMemorySchema),
    defaultValues: {
      content: "",
    },
  });

  const { data: memories = [] } = useQuery<Memory[]>({
    queryKey: ["/api/memories"],
  });

  const createMemoryMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await apiRequest("POST", "/api/memories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      form.reset();
      toast({
        title: "Memory Saved",
        description: "Your memory has been added to the board!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/memories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      toast({
        title: "Memory Deleted",
        description: "Memory has been removed from the board.",
      });
    },
  });

  const onSubmit = (data: { content: string }) => {
    createMemoryMutation.mutate(data);
  };

  const getMemoryCardColor = (index: number) => {
    const colors = [
      "bg-purple-50 border-purple-200",
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-yellow-50 border-yellow-200",
      "bg-pink-50 border-pink-200",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Add Memory Section */}
      <Card className="p-8 gentle-shadow">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Pen className="text-primary mr-3" />
            Add a Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">What would you like to remember?</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder="Share a memory, thought, or important note..."
                        className="text-lg px-4 py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="large-touch w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createMemoryMutation.isPending}
              >
                <Heart className="mr-2 h-5 w-5" />
                {createMemoryMutation.isPending ? "Saving..." : "Save Memory"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Memory Cards */}
      <Card className="p-8 gentle-shadow">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Heart className="text-primary mr-3" />
            Your Memories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {memories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No memories saved yet. Start by adding your first memory above!
              </p>
            ) : (
              memories.map((memory, index) => (
                <div
                  key={memory.id}
                  className={`border p-6 rounded-xl ${getMemoryCardColor(index)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-foreground flex-1 mr-4">{memory.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMemoryMutation.mutate(memory.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Added {memory.createdAt ? format(new Date(memory.createdAt), "MMM d, yyyy") : "recently"}
                    </span>
                    <span className="text-primary font-medium">💭 Precious memory</span>
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
