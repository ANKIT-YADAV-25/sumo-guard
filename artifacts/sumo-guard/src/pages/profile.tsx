import React, { useEffect } from "react";
import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { PremiumCard, GradientButton, Input, Label, PageHeader } from "@/components/shared";
import { UserCircle, Activity } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  weight: z.coerce.number().min(20).max(300), // kg
  height: z.coerce.number().min(50).max(250), // cm
  existingConditions: z.string(), // comma separated for simplicity
  familyHistory: z.string() // comma separated
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        existingConditions: profile.existingConditions.join(", "),
        familyHistory: profile.familyHistory.join(", ")
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate({
      data: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        existingConditions: data.existingConditions.split(",").map(s => s.trim()).filter(Boolean),
        familyHistory: data.familyHistory.split(",").map(s => s.trim()).filter(Boolean),
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your health profile has been saved successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
        queryClient.invalidateQueries({ queryKey: ["/api/predictions"] }); // Updates predictions based on new profile
      },
      onError: () => {
        toast({
          title: "Update failed",
          description: "There was an error updating your profile.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Personal Health Profile" 
        description="Your baseline stats help our AI make more accurate disease predictions."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <PremiumCard className="flex flex-col items-center text-center p-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 mb-4 bg-muted">
              <img 
                src={`${import.meta.env.BASE_URL}images/avatar-placeholder.png`} 
                alt="Avatar Placeholder" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-foreground">{profile?.name || "New User"}</h2>
            <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Activity size={16} /> Base Stats Configured
            </p>
          </PremiumCard>
        </div>

        <div className="md:col-span-2">
          <PremiumCard>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                <UserCircle className="text-primary" /> Basic Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label>Full Name</Label>
                  <Input {...register("name")} placeholder="John Doe" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label>Age</Label>
                  <Input type="number" {...register("age")} />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
                </div>

                <div>
                  <Label>Gender</Label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border-2 border-border/60 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                    {...register("gender")}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" {...register("weight")} />
                </div>

                <div>
                  <Label>Height (cm)</Label>
                  <Input type="number" {...register("height")} />
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-border/50">
                <h3 className="text-lg font-bold">Medical History</h3>
                
                <div>
                  <Label>Existing Conditions (Comma separated)</Label>
                  <Input 
                    placeholder="Asthma, Hypertension..." 
                    {...register("existingConditions")} 
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Leave blank if none.</p>
                </div>

                <div>
                  <Label>Family History (Comma separated)</Label>
                  <Input 
                    placeholder="Diabetes, Heart Disease..." 
                    {...register("familyHistory")} 
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Conditions present in your immediate family.</p>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <GradientButton 
                  type="submit" 
                  isLoading={updateMutation.isPending}
                  disabled={!isDirty}
                  className={!isDirty ? "opacity-50 grayscale" : ""}
                >
                  Save Profile
                </GradientButton>
              </div>
            </form>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
