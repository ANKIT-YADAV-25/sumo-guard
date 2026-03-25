import React, { useState } from "react";
import { useGetHabitLogs, useCreateHabitLog, useDeleteHabitLog } from "@workspace/api-client-react";
import { PremiumCard, GradientButton, Input, Label, PageHeader } from "@/components/shared";
import { ActivitySquare, Trash2, Calendar as CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const habitSchema = z.object({
  date: z.string().min(1, "Date is required"),
  exerciseMinutes: z.coerce.number().min(0),
  waterGlasses: z.coerce.number().min(0).max(30),
  stressLevel: z.coerce.number().min(1).max(10),
});

type HabitForm = z.infer<typeof habitSchema>;

export default function HabitLogs() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useGetHabitLogs();
  const createMutation = useCreateHabitLog();
  const deleteMutation = useDeleteHabitLog();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      exerciseMinutes: 30,
      waterGlasses: 8,
      stressLevel: 5,
    }
  });

  const onSubmit = (data: HabitForm) => {
    createMutation.mutate({ data: { ...data, fruitVeggieServings: 0, screenTimeHours: 0, smokingCigarettes: 0, alcoholDrinks: 0, meditationMinutes: 0 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
        setIsFormOpen(false);
        reset();
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete log?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/habits"] })
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Habits" description="Daily routines" />
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-6 shadow-lg shadow-primary/20"
        >
          <Plus size={24} className={isFormOpen ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {isFormOpen && (
        <PremiumCard className="border-primary/30">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input type="date" className="pl-10" {...register("date")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Exercise (min)</Label>
                <Input type="number" {...register("exerciseMinutes")} />
              </div>
              <div>
                <Label>Water (glasses)</Label>
                <Input type="number" {...register("waterGlasses")} />
              </div>
            </div>
            <div>
              <Label>Stress Level (1-10)</Label>
              <input type="range" min="1" max="10" className="w-full accent-primary" {...register("stressLevel")} />
            </div>
            <GradientButton type="submit" isLoading={createMutation.isPending} className="w-full mt-4">
              Save Habits
            </GradientButton>
          </form>
        </PremiumCard>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : !logs?.length ? (
          <PremiumCard className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <ActivitySquare className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No habits logged yet.</p>
          </PremiumCard>
        ) : (
          logs.map((log) => (
            <PremiumCard key={log.id} className="p-4">
              <div className="flex justify-between items-center mb-3 border-b border-border/50 pb-2">
                <h4 className="font-bold text-sm">{format(parseISO(log.date), 'EEEE, MMM d')}</h4>
                <button onClick={() => handleDelete(log.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-card border border-border rounded-lg p-2 text-center">
                  <p className="text-muted-foreground">Exercise</p>
                  <p className="font-bold text-accent">{log.exerciseMinutes}m</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-2 text-center">
                  <p className="text-muted-foreground">Water</p>
                  <p className="font-bold text-secondary">{log.waterGlasses}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-2 text-center">
                  <p className="text-muted-foreground">Stress</p>
                  <p className="font-bold text-primary">{log.stressLevel}/10</p>
                </div>
              </div>
            </PremiumCard>
          ))
        )}
      </div>
    </div>
  );
}
