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

  const { register, handleSubmit, reset } = useForm<SleepForm>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      bedTime: "22:00",
      wakeTime: "06:30",
      quality: "good"
    }
  });

  const onSubmit = (data: SleepForm) => {
    const bedDateTime = new Date(`${data.date}T${data.bedTime}:00`);
    let wakeDateTime = new Date(`${data.date}T${data.wakeTime}:00`);
    if (wakeDateTime <= bedDateTime) wakeDateTime.setDate(wakeDateTime.getDate() + 1);

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
    if (confirm("Delete log?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/sleep"] })
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Sleep Log" description="Track rest patterns" />
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
                <Label>Bedtime</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input type="time" className="pl-10" {...register("bedTime")} />
                </div>
              </div>
              <div>
                <Label>Wake Up</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input type="time" className="pl-10" {...register("wakeTime")} />
                </div>
              </div>
            </div>
            <div>
              <Label>Quality</Label>
              <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/60 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none" {...register("quality")}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <GradientButton type="submit" isLoading={createMutation.isPending} className="w-full mt-4">
              Save Log
            </GradientButton>
          </form>
        </PremiumCard>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : !logs?.length ? (
          <PremiumCard className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <Moon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No sleep logs yet.</p>
          </PremiumCard>
        ) : (
          logs.map((log) => (
            <PremiumCard key={log.id} className="p-4 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center font-bold">
                  {log.durationHours.toFixed(1)}h
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {format(parseISO(log.date), 'EEE, MMM d')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(log.bedtime), 'h:mm a')} - {format(parseISO(log.wakeTime), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide
                  ${log.quality === 'excellent' ? 'bg-secondary/20 text-secondary' :
                    log.quality === 'good' ? 'bg-primary/20 text-primary' :
                    log.quality === 'fair' ? 'bg-accent/20 text-accent' :
                    'bg-destructive/20 text-destructive'}
                `}>
                  {log.quality}
                </span>
                <button onClick={() => handleDelete(log.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            </PremiumCard>
          ))
        )}
      </div>
    </div>
  );
}
