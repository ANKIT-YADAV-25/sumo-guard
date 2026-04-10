import React, { useState } from "react";
import { useGetSleepLogs, useCreateSleepLog, useDeleteSleepLog } from "@/lib/api";
import { PremiumCard, GradientButton, Input, Label, PageHeader } from "@/components/shared";
import { DeleteConfirmPopup } from "@/components/DeleteConfirmPopup";
import { Moon, Trash2, Calendar as CalendarIcon, Clock, Plus, Sparkles, Pencil } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<SleepForm>({
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
        setIsEditing(false);
        reset();
      }
    });
  };

  const handleDelete = (id: string | number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
          setDeleteId(null);
        }
      });
    }
  };

  const handleEdit = (log: any) => {
    setValue("date", log.date);
    // Parse ISO back to HH:mm
    const bedDate = parseISO(log.bedtime);
    const wakeDate = parseISO(log.wakeTime);
    setValue("bedTime", format(bedDate, "HH:mm"));
    setValue("wakeTime", format(wakeDate, "HH:mm"));
    setValue("quality", log.quality as any);
    setValue("notes", log.notes || "");
    setIsEditing(true);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -z-10" />

      <div className="flex justify-between items-center">
        <PageHeader title="Sleep Log" description="Track rest patterns" />
        <button 
          onClick={() => {
            if (isFormOpen && isEditing) {
              setIsEditing(false);
              reset();
            }
            setIsFormOpen(!isFormOpen);
          }} 
          className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-slate-900 mb-6 shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] hover:scale-105 transition-all duration-300"
        >
          <Plus size={28} className={isFormOpen ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {isFormOpen && (
        <PremiumCard className="border-teal-500/40 shadow-[0_0_30px_rgba(45,212,191,0.15)] mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 w-5 h-5" />
                <Input type="date" disabled={isEditing} className="pl-11 border-teal-500/20 focus:border-teal-400 focus:ring-teal-400/20 disabled:opacity-50" {...register("date")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label>Bedtime</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 w-5 h-5" />
                  <Input type="time" className="pl-11 border-teal-500/20 focus:border-teal-400 focus:ring-teal-400/20" {...register("bedTime")} />
                </div>
              </div>
              <div>
                <Label>Wake Up</Label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                  <Input type="time" className="pl-11 border-teal-500/20 focus:border-teal-400 focus:ring-teal-400/20" {...register("wakeTime")} />
                </div>
              </div>
            </div>
            <div>
              <Label>Quality</Label>
              <div className="relative">
                <select className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-teal-500/20 text-white font-medium focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all appearance-none glass" {...register("quality")}>
                  <option value="excellent" className="bg-slate-900">Excellent</option>
                  <option value="good" className="bg-slate-900">Good</option>
                  <option value="fair" className="bg-slate-900">Fair</option>
                  <option value="poor" className="bg-slate-900">Poor</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 border-r-2 border-b-2 border-white/50 transform rotate-45" />
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full mt-4 py-4 rounded-xl font-bold text-slate-900 text-lg tracking-wide bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              {createMutation.isPending ? "Saving..." : isEditing ? "Update Log" : "Save Log"}
            </button>
          </form>
        </PremiumCard>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="animate-spin w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" /></div>
        ) : !logs?.length ? (
          <PremiumCard className="flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 glass">
            <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(45,212,191,0.1)]">
              <Moon className="w-10 h-10 text-teal-500/50" />
            </div>
            <p className="text-white/50 font-medium">No sleep logs yet.</p>
            <p className="text-sm text-white/30 mt-1">Add a log to track your rest.</p>
          </PremiumCard>
        ) : (
          logs.map((log) => {
            const qualityStyles = {
              excellent: 'border-l-green-400 bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]',
              good: 'border-l-teal-400 bg-teal-500/10 text-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.3)]',
              fair: 'border-l-yellow-400 bg-yellow-500/10 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]',
              poor: 'border-l-red-400 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]'
            };
            const currentStyle = qualityStyles[log.quality as keyof typeof qualityStyles];

            return (
              <PremiumCard key={log.id} className={`p-4 flex justify-between items-center group border-l-4 ${currentStyle.split(' ')[0]} bg-slate-900/50`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${currentStyle.split(' ').slice(1).join(' ')}`}>
                    <span className="text-xl leading-none">{log.durationHours.toFixed(1)}</span>
                    <span className="text-[10px] uppercase font-bold opacity-80 mt-1">hrs</span>
                  </div>
                  <div>
                    <p className="font-black text-white text-lg tracking-tight">
                      {format(parseISO(log.date), 'EEE, MMM d')}
                    </p>
                    <p className="text-xs font-bold text-white/40 flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} />
                      {format(parseISO(log.bedtime), 'h:mm a')} - {format(parseISO(log.wakeTime), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest ${currentStyle.split(' ').slice(1).join(' ')}`}>
                      {log.quality}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(log)} className="text-white/20 hover:text-teal-400 transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(log.id)} className="text-white/20 hover:text-red-400 transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </PremiumCard>
            )
          })
        )}
      </div>
      <DeleteConfirmPopup 
        isOpen={deleteId !== null} 
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
