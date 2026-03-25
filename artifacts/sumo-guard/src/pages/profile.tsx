import React, { useEffect } from "react";
import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { PremiumCard, GradientButton, Input, Label, PageHeader } from "@/components/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name required"),
  age: z.coerce.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  weight: z.coerce.number().min(20).max(300),
  height: z.coerce.number().min(50).max(250)
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();

  const { register, handleSubmit, formState: { isDirty }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate({
      data: { ...data, existingConditions: profile?.existingConditions || [], familyHistory: profile?.familyHistory || [] }
    }, {
      onSuccess: () => {
        toast({ title: "Profile updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      }
    });
  };

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Personal health details" />

      <PremiumCard className="flex flex-col items-center text-center p-6 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-3">
          <img src={`${import.meta.env.BASE_URL}images/avatar-placeholder.png`} alt="Avatar" className="w-full h-full object-cover"/>
        </div>
        <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
      </PremiumCard>

      <PremiumCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Age</Label>
              <Input type="number" {...register("age")} />
            </div>
            <div>
              <Label>Gender</Label>
              <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/60 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none" {...register("gender")}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input type="number" {...register("weight")} />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input type="number" {...register("height")} />
            </div>
          </div>
          <GradientButton type="submit" isLoading={updateMutation.isPending} disabled={!isDirty} className="w-full mt-4">
            Save Changes
          </GradientButton>
        </form>
      </PremiumCard>
    </div>
  );
}
