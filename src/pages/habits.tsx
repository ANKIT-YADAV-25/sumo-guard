import React, { useState } from "react";
import { useGetHabitLogs, useCreateHabitLog, useDeleteHabitLog } from "@/lib/api";
import { PremiumCard, GradientButton, Input, Label, PageHeader } from "@/components/shared";
import { DeleteConfirmPopup } from "@/components/DeleteConfirmPopup";
import { ActivitySquare, Trash2, Calendar as CalendarIcon, Plus, Droplets, BrainCircuit, Pencil } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      exerciseMinutes: 30,
      waterGlasses: 8,
      stressLevel: 5,
    }
  });

  const stressValue = watch("stressLevel");

  const onSubmit = (data: HabitForm) => {
    createMutation.mutate({ data: { ...data, fruitVeggieServings: 0, screenTimeHours: 0, smokingCigarettes: 0, alcoholDrinks: 0, meditationMinutes: 0 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
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
          queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
          setDeleteId(null);
        }
      });
    }
  };

  const handleEdit = (log: any) => {
    setValue("date", log.date);
    setValue("exerciseMinutes", log.exerciseMinutes);
    setValue("waterGlasses", log.waterGlasses);
    setValue("stressLevel", log.stressLevel);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10" />

      <div className="flex justify-between items-center">
        <PageHeader title="Habits" description="Daily routines & balance" />
        <button 
          onClick={() => {
            if (isFormOpen && isEditing) {
              setIsEditing(false);
              reset();
            }
            setIsFormOpen(!isFormOpen);
          }} 
          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mb-6 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300"
        >
          <Plus size={28} className={isFormOpen ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {isFormOpen && (
        <PremiumCard className="border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <div>
              <Label>Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
                <Input type="date" disabled={isEditing} className="pl-11 border-purple-500/20 focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50" {...register("date")} />
              </div>
            </div>
            
            <div className="space-y-5 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div>
                <Label className="flex justify-between">
                  <span className="flex items-center gap-2"><ActivitySquare size={14} className="text-green-400"/> Exercise</span>
                  <span className="text-green-400">{watch("exerciseMinutes")} min</span>
                </Label>
                <input 
                  type="range" 
                  min="0" max="120" step="5"
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-400 mt-2" 
                  {...register("exerciseMinutes")} 
                />
              </div>

              <div>
                <Label className="flex justify-between">
                  <span className="flex items-center gap-2"><Droplets size={14} className="text-blue-400"/> Water</span>
                  <span className="text-blue-400">{watch("waterGlasses")} glasses</span>
                </Label>
                <input 
                  type="range" 
                  min="0" max="15" step="1"
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400 mt-2" 
                  {...register("waterGlasses")} 
                />
              </div>

              <div>
                <Label className="flex justify-between">
                  <span className="flex items-center gap-2"><BrainCircuit size={14} className="text-red-400"/> Stress Level</span>
                  <span className="text-red-400">{stressValue}/10</span>
                </Label>
                <input 
                  type="range" 
                  min="1" max="10" 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400 mt-2" 
                  {...register("stressLevel")} 
                />
                <div className="flex justify-between text-[10px] text-white/30 font-bold uppercase mt-1 px-1">
                  <span>Relaxed</span>
                  <span>Stressed</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full py-4 rounded-xl font-bold text-white text-lg tracking-wide bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              {createMutation.isPending ? "Saving..." : isEditing ? "Update Habits" : "Log Habits"}
            </button>
          </form>
        </PremiumCard>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="animate-spin w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" /></div>
        ) : !logs?.length ? (
          <PremiumCard className="flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 glass">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <ActivitySquare className="w-10 h-10 text-purple-500/50" />
            </div>
            <p className="text-white/50 font-medium">No habits logged yet.</p>
          </PremiumCard>
        ) : (
          logs.map((log) => (
            <PremiumCard key={log.id} className="p-5 relative overflow-hidden bg-slate-900/40">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-[30px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <h4 className="font-black text-lg text-white tracking-tight">{format(parseISO(log.date), 'EEEE, MMM d')}</h4>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(log)} className="text-white/20 hover:text-purple-400 transition-colors p-1.5 bg-white/5 rounded-full hover:bg-white/10">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(log.id)} className="text-white/20 hover:text-red-400 transition-colors p-1.5 bg-white/5 rounded-full hover:bg-white/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-3 text-center shadow-[0_4px_15px_rgba(74,222,128,0.05)] relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 text-green-500/10 group-hover:scale-110 transition-transform"><ActivitySquare size={48} /></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-1">Exercise</p>
                  <p className="font-black text-2xl text-white relative z-10">{log.exerciseMinutes}<span className="text-sm font-bold text-green-400 ml-0.5">m</span></p>
                </div>
                
                <div className="bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-3 text-center shadow-[0_4px_15px_rgba(59,130,246,0.05)] relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 text-blue-500/10 group-hover:scale-110 transition-transform"><Droplets size={48} /></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Water</p>
                  <p className="font-black text-2xl text-white relative z-10">{log.waterGlasses}<span className="text-sm font-bold text-blue-400 ml-0.5">g</span></p>
                </div>
                
                <div className="bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-3 text-center shadow-[0_4px_15px_rgba(239,68,68,0.05)] relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 text-red-500/10 group-hover:scale-110 transition-transform"><BrainCircuit size={48} /></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Stress</p>
                  <p className="font-black text-2xl text-white relative z-10">{log.stressLevel}<span className="text-sm font-bold text-red-400 ml-0.5">/10</span></p>
                </div>
              </div>
            </PremiumCard>
          ))
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
