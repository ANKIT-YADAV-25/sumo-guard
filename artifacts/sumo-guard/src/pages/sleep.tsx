import React, { useState } from "react";
import { useGetSleepLogs, useCreateSleepLog, useDeleteSleepLog } from "@workspace/api-client-react";
import { PremiumCard, GradientButton, Input, Label, PageHeader } from "@/components/shared";
import { Moon, Trash2, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const sleepSchema = z.object({
  date: z.string().min(1, "Date is required"),
  bedTime: z.string().min(1, "Bed time is required"),
  wakeTime: z.string().min(1, "Wake time is required"),
  quality: z.enum(["poor", "fair", "good", "excellent"]),
  notes: z.string().optional()
});

type SleepForm = z.infer<typeof sleepSchema>;

export default function SleepLogs() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useGetSleepLogs();
  const createMutation = useCreateSleepLog();
  const deleteMutation = useDeleteSleepLog();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SleepForm>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      bedTime: "22:00",
      wakeTime: "06:30",
      quality: "good"
    }
  });

  const onSubmit = (data: SleepForm) => {
    // Construct ISO strings
    const bedDateTime = new Date(`${data.date}T${data.bedTime}:00`);
    let wakeDateTime = new Date(`${data.date}T${data.wakeTime}:00`);
    
    // If wake time is earlier in the day than bed time, assume it's the next day
    if (wakeDateTime <= bedDateTime) {
      wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }

    createMutation.mutate({
      data: {
        date: data.date,
        bedtime: bedDateTime.toISOString(),
        wakeTime: wakeDateTime.toISOString(),
        quality: data.quality,
        notes: data.notes || null
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
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
          queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Sleep Tracker" 
          description="Log your sleep hours to build a profile for disease prediction."
        />
        <GradientButton onClick={() => setIsFormOpen(!isFormOpen)} className="whitespace-nowrap">
          <Plus size={18} /> {isFormOpen ? "Close Form" : "New Sleep Log"}
        </GradientButton>
      </div>

      {isFormOpen && (
        <PremiumCard className="bg-primary/5 border-primary/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Moon className="text-primary" /> Log Last Night's Sleep
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Date (Night of)</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input type="date" className="pl-10" {...register("date")} />
                </div>
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <Label>Went to Bed</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input type="time" className="pl-10" {...register("bedTime")} />
                </div>
                {errors.bedTime && <p className="text-red-500 text-sm mt-1">{errors.bedTime.message}</p>}
              </div>

              <div>
                <Label>Woke Up</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input type="time" className="pl-10" {...register("wakeTime")} />
                </div>
                {errors.wakeTime && <p className="text-red-500 text-sm mt-1">{errors.wakeTime.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Sleep Quality</Label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border-2 border-border/60 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                  {...register("quality")}
                >
                  <option value="excellent">Excellent - Deep & Restful</option>
                  <option value="good">Good - Normal</option>
                  <option value="fair">Fair - Woke up a few times</option>
                  <option value="poor">Poor - Tossed and turned</option>
                </select>
                {errors.quality && <p className="text-red-500 text-sm mt-1">{errors.quality.message}</p>}
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input placeholder="Ate late, stressed, etc." {...register("notes")} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <GradientButton type="submit" isLoading={createMutation.isPending}>
                Save Sleep Log
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
            <Moon className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No sleep logs yet.</p>
            <p className="text-sm">Start tracking your sleep to improve disease predictions.</p>
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logs.map((log) => (
              <PremiumCard key={log.id} className="p-5 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {log.durationHours.toFixed(1)}h
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {format(parseISO(log.date), 'EEEE, MMM do')}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      {format(parseISO(log.bedtime), 'h:mm a')} - {format(parseISO(log.wakeTime), 'h:mm a')}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                        ${log.quality === 'excellent' ? 'bg-green-100 text-green-700' :
                          log.quality === 'good' ? 'bg-blue-100 text-blue-700' :
                          log.quality === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'}
                      `}>
                        {log.quality}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(log.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete log"
                >
                  <Trash2 size={18} />
                </button>
              </PremiumCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
