import React, { useState } from "react";
import { useGetHabitLogs, useCreateHabitLog, useDeleteHabitLog } from "@workspace/api-client-react";
import { PremiumCard, GradientButton, Input, Label, PageHeader } from "@/components/shared";
import { ActivitySquare, Trash2, Calendar as CalendarIcon, Plus, Droplets, Brain } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const habitSchema = z.object({
  date: z.string().min(1, "Date is required"),
  exerciseMinutes: z.coerce.number().min(0),
  waterGlasses: z.coerce.number().min(0).max(30),
  fruitVeggieServings: z.coerce.number().min(0).max(20),
  screenTimeHours: z.coerce.number().min(0).max(24),
  stressLevel: z.coerce.number().min(1).max(10),
  smokingCigarettes: z.coerce.number().min(0),
  alcoholDrinks: z.coerce.number().min(0),
  meditationMinutes: z.coerce.number().min(0),
  notes: z.string().optional()
});

type HabitForm = z.infer<typeof habitSchema>;

export default function HabitLogs() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useGetHabitLogs();
  const createMutation = useCreateHabitLog();
  const deleteMutation = useDeleteHabitLog();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      exerciseMinutes: 30,
      waterGlasses: 8,
      fruitVeggieServings: 3,
      screenTimeHours: 4,
      stressLevel: 5,
      smokingCigarettes: 0,
      alcoholDrinks: 0,
      meditationMinutes: 0
    }
  });

  const onSubmit = (data: HabitForm) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        setIsFormOpen(false);
        reset();
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this log?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Daily Habits" 
          description="Track your daily routines to identify health patterns."
        />
        <GradientButton onClick={() => setIsFormOpen(!isFormOpen)} className="whitespace-nowrap">
          <Plus size={18} /> {isFormOpen ? "Close Form" : "Log Today's Habits"}
        </GradientButton>
      </div>

      {isFormOpen && (
        <PremiumCard className="bg-primary/5 border-primary/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ActivitySquare className="text-primary" /> Daily Habit Entry
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-4">
                <Label>Date</Label>
                <div className="relative max-w-xs">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input type="date" className="pl-10" {...register("date")} />
                </div>
              </div>

              <div>
                <Label>Exercise (Minutes)</Label>
                <Input type="number" min="0" {...register("exerciseMinutes")} />
              </div>

              <div>
                <Label>Water (Glasses)</Label>
                <Input type="number" min="0" {...register("waterGlasses")} />
              </div>

              <div>
                <Label>Fruits/Veggies (Servings)</Label>
                <Input type="number" min="0" {...register("fruitVeggieServings")} />
              </div>

              <div>
                <Label>Screen Time (Hours)</Label>
                <Input type="number" step="0.5" min="0" {...register("screenTimeHours")} />
              </div>

              <div className="lg:col-span-2">
                <Label>Stress Level (1-10)</Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" max="10" 
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary" 
                    {...register("stressLevel")} 
                  />
                  <span className="font-bold text-lg w-6 text-center">{/* Hook form controlled, can't show live value simply without watch, assuming user sees slider */}</span>
                </div>
              </div>

              <div>
                <Label>Meditation (Minutes)</Label>
                <Input type="number" min="0" {...register("meditationMinutes")} />
              </div>

              <div>
                <Label>Cigarettes Smoked</Label>
                <Input type="number" min="0" {...register("smokingCigarettes")} />
              </div>

              <div>
                <Label>Alcoholic Drinks</Label>
                <Input type="number" min="0" {...register("alcoholDrinks")} />
              </div>

              <div className="lg:col-span-3">
                <Label>Notes (Optional)</Label>
                <Input placeholder="Any context on today's habits?" {...register("notes")} />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <GradientButton type="submit" isLoading={createMutation.isPending}>
                Save Habits
              </GradientButton>
            </div>
          </form>
        </PremiumCard>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Past Records</h3>
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : !logs?.length ? (
          <PremiumCard className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed">
            <ActivitySquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No habits logged yet.</p>
            <p className="text-sm">Consistent logging unlocks powerful health predictions.</p>
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {logs.map((log) => (
              <PremiumCard key={log.id} className="p-5 flex flex-col group relative">
                <button 
                  onClick={() => handleDelete(log.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete log"
                >
                  <Trash2 size={16} />
                </button>
                
                <h4 className="font-bold text-lg border-b border-border/50 pb-2 mb-3">
                  {format(parseISO(log.date), 'EEEE, MMM do, yyyy')}
                </h4>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ActivitySquare className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">{log.exerciseMinutes} min exercise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    <span className="font-medium">{log.waterGlasses} glasses water</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Stress: {log.stressLevel}/10</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium">{log.screenTimeHours}h screen time</span>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
