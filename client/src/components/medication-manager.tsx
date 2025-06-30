import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pill, Plus, Clock, Edit, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { insertMedicationSchema, type Medication } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function MedicationManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertMedicationSchema.extend({
      timeSlots: insertMedicationSchema.shape.timeSlots.optional().default("[]"),
    })),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      timeSlots: "[]",
      instructions: "",
    },
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const createMedicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/medications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      form.reset();
      setIsAdding(false);
      toast({
        title: "Medication Added",
        description: "Your medication has been added to your list.",
      });
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/medications/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      setEditingId(null);
      toast({
        title: "Medication Updated",
        description: "Your medication information has been updated.",
      });
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/medications/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Medication Removed",
        description: "The medication has been removed from your list.",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (editingId) {
      updateMedicationMutation.mutate({ id: editingId, data });
    } else {
      createMedicationMutation.mutate(data);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingId(medication.id);
    setIsAdding(true);
    form.reset({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      timeSlots: medication.timeSlots,
      instructions: medication.instructions || "",
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    form.reset();
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'twice daily':
        return 'bg-green-100 text-green-800';
      case 'three times daily':
        return 'bg-orange-100 text-orange-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center">
            <Pill className="mr-3 h-8 w-8" />
            My Medications
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Keep track of your medications and dosing schedule
          </p>
        </div>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="large-touch bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Medication
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="p-8 gentle-shadow border-l-4 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl">
              {editingId ? "Edit Medication" : "Add New Medication"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">Medication Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Aspirin, Lisinopril"
                            className="text-lg px-4 py-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">Dosage</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., 10mg, 1 tablet"
                            className="text-lg px-4 py-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">How often?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-lg px-4 py-4">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="once daily">Once daily</SelectItem>
                          <SelectItem value="twice daily">Twice daily</SelectItem>
                          <SelectItem value="three times daily">Three times daily</SelectItem>
                          <SelectItem value="four times daily">Four times daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="as needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Time Schedule</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., 8:00,20:00 or 8:00,14:00,20:00"
                          className="text-lg px-4 py-4"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Enter times separated by commas (e.g., 8:00,20:00 for morning and evening)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="e.g., Take with food, Avoid dairy products..."
                          className="text-lg px-4 py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    className="large-touch flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createMedicationMutation.isPending || updateMedicationMutation.isPending}
                  >
                    <Pill className="mr-2 h-5 w-5" />
                    {createMedicationMutation.isPending || updateMedicationMutation.isPending 
                      ? "Saving..." 
                      : editingId ? "Update Medication" : "Add Medication"
                    }
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="large-touch px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Medications List */}
      <div className="grid gap-6">
        {medications.length === 0 ? (
          <Card className="p-8 gentle-shadow text-center">
            <CardContent className="pt-6">
              <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No medications added yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your medications to keep track of your dosing schedule
              </p>
              <Button 
                onClick={() => setIsAdding(true)}
                className="large-touch bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          medications.map((medication) => (
            <Card key={medication.id} className="p-6 gentle-shadow hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Pill className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{medication.name}</h3>
                        <p className="text-lg text-muted-foreground">{medication.dosage}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <Badge className={getFrequencyColor(medication.frequency)}>
                          {medication.frequency}
                        </Badge>
                      </div>
                      {medication.timeSlots && (
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Times: {medication.timeSlots.replace(/[\[\]"]/g, '').replace(/,/g, ', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {medication.instructions && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-300 p-4 rounded">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Instructions:</p>
                        <p className="text-sm text-yellow-700">{medication.instructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleEdit(medication)}
                      variant="outline"
                      size="sm"
                      className="large-touch"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteMedicationMutation.mutate(medication.id)}
                      variant="outline"
                      size="sm"
                      className="large-touch text-destructive hover:text-destructive"
                      disabled={deleteMedicationMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}