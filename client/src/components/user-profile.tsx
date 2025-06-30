import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Edit3, Camera, Save, MapPin, Phone, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { insertUserProfileSchema, type UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function UserProfileComponent() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const form = useForm({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      age: profile?.age || undefined,
      photo: profile?.photo || "",
      address: profile?.address || "",
      emergencyContact: profile?.emergencyContact || "",
      emergencyPhone: profile?.emergencyPhone || "",
      medicalInfo: profile?.medicalInfo || "",
      caregiverCode: profile?.caregiverCode || "1234",
      preferences: profile?.preferences || "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile Created",
        description: "Welcome! Your profile has been set up successfully.",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/profile/${profile?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (profile) {
      updateProfileMutation.mutate(data);
    } else {
      createProfileMutation.mutate(data);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        form.setValue("photo", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show setup form if no profile exists
  if (!profile && !isEditing) {
    return (
      <Card className="p-8 gentle-shadow max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl text-primary">Welcome!</CardTitle>
          <p className="text-lg text-muted-foreground">
            Let's set up your profile so I can better assist you.
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsEditing(true)}
            className="large-touch w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Edit3 className="mr-2 h-5 w-5" />
            Set Up My Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isEditing || !profile) {
    return (
      <Card className="p-8 gentle-shadow max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Edit3 className="text-primary mr-3" />
            {profile ? "Edit Profile" : "Create Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={form.watch("photo")} alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {form.watch("name")?.charAt(0) || "👤"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button type="button" variant="outline" className="large-touch" asChild>
                      <span>
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Photo
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your full name"
                          className="text-lg px-4 py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Your age"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={2}
                        placeholder="Your home address"
                        className="text-lg px-4 py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Sarah (Daughter)"
                          className="text-lg px-4 py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Emergency Phone</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          {...field} 
                          placeholder="Emergency contact number"
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
                name="medicalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Medical Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3}
                        placeholder="Any important medical conditions, allergies, or medications..."
                        className="text-lg px-4 py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caregiverCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Caregiver Access Code</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        {...field} 
                        placeholder="Set a code for caregiver access"
                        className="text-lg px-4 py-4"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      This code allows family or caregivers to access your information
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  className="large-touch flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {createProfileMutation.isPending || updateProfileMutation.isPending 
                    ? "Saving..." 
                    : profile ? "Update Profile" : "Create Profile"
                  }
                </Button>
                {profile && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="large-touch px-8"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card className="p-8 gentle-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.photo || ""} alt={profile.name} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-100 to-purple-100">
                {profile.name?.charAt(0) || "👤"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-primary mb-2">
                Hello, {profile.name}! 👋
              </h1>
              {profile.age && (
                <p className="text-xl text-muted-foreground mb-4">
                  Age: {profile.age}
                </p>
              )}
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {profile.address && (
                  <div className="flex items-center space-x-2 text-lg">
                    <MapPin className="text-primary h-5 w-5" />
                    <span className="text-muted-foreground">{profile.address}</span>
                  </div>
                )}
                {profile.emergencyContact && (
                  <div className="flex items-center space-x-2 text-lg">
                    <Phone className="text-primary h-5 w-5" />
                    <span className="text-muted-foreground">
                      {profile.emergencyContact} - {profile.emergencyPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => setIsEditing(true)}
              className="large-touch bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medical Info Card */}
      {profile.medicalInfo && (
        <Card className="p-6 gentle-shadow border-l-4 border-red-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-red-700">
              <Heart className="mr-2 h-5 w-5" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground whitespace-pre-wrap">
              {profile.medicalInfo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Card className="p-6 gentle-shadow border-l-4 border-green-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-green-700">
            <Shield className="mr-2 h-5 w-5" />
            Security & Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            Caregiver access code is set and secure. Family members can use this code 
            to access your information when needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}