import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import {
  getSleepLogs, addSleepLog, deleteSleepLog,
  getHabitLogs, addHabitLog, deleteHabitLog,
  getProfile, updateProfile, getUserDoc
} from "./firestore";
import { analyzePredictions } from "./predictions";
import { format, subDays } from "date-fns";

// --- Sleep Logs ---
export function useGetSleepLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["/api/sleep", user?.id],
    queryFn: () => getSleepLogs(user!.id),
    enabled: !!user?.id,
  });
}

export function useCreateSleepLog() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (vars: { data: any }) => {
      const { date, bedtime, wakeTime, quality, notes } = vars.data;
      const b = new Date(bedtime);
      const w = new Date(wakeTime);
      let durationHours = (w.getTime() - b.getTime()) / (1000 * 60 * 60);
      if (durationHours < 0) durationHours += 24;
      return addSleepLog(user!.id, {
        date, bedtime, wakeTime, quality, notes: notes || null, durationHours,
      });
    }
  });
}

export function useDeleteSleepLog() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (vars: { id: string | number }) => deleteSleepLog(user!.id, String(vars.id))
  });
}

// --- Habit Logs ---
export function useGetHabitLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["/api/habits", user?.id],
    queryFn: () => getHabitLogs(user!.id),
    enabled: !!user?.id,
  });
}

export function useCreateHabitLog() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (vars: { data: any }) => addHabitLog(user!.id, vars.data)
  });
}

export function useDeleteHabitLog() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (vars: { id: string | number }) => deleteHabitLog(user!.id, String(vars.id))
  });
}

// --- Profile ---
export function useGetProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["/api/profile", user?.id],
    queryFn: async () => {
      const p = await getProfile(user!.id);
      const defaults = { 
        name: user!.name, age: 0, gender: "", weight: 0, height: 0, 
        existingConditions: [], familyHistory: [], 
        createdAt: new Date().toISOString() 
      };
      if (!p) return defaults;
      return { ...defaults, ...p };
    },
    enabled: !!user?.id,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (vars: { data: any }) => updateProfile(user!.id, vars.data)
  });
}

// --- Dashboard ---
export function useGetDashboard(params: { date: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["/api/dashboard", user?.id, params.date],
    queryFn: async () => {
      const sleeps = await getSleepLogs(user!.id);
      const habits = await getHabitLogs(user!.id);
      const selectedDateSleep = sleeps.find(s => s.date === params.date) || null;
      const selectedDateHabit = habits.find(h => h.date === params.date) || null;
      
      const avgSleepHours = sleeps.length ? (sleeps.reduce((a, b) => a + b.durationHours, 0) / sleeps.length).toFixed(1) : 0;
      const avgExerciseMinutes = habits.length ? Math.round(habits.reduce((a, b) => a + b.exerciseMinutes, 0) / habits.length) : 0;
      
      return {
        selectedDateSleep, selectedDateHabit,
        sleepTrend: sleeps.slice(0, 7).reverse(),
        healthScore: 85, // Computed in predictions anyway
        avgSleepHours, avgExerciseMinutes,
        sleepLogsCount: sleeps.length,
        habitLogsCount: habits.length
      };
    },
    enabled: !!user?.id,
  });
}

// --- Predictions ---
export function useGetPredictions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["/api/predictions", user?.id],
    queryFn: async () => {
      const sleeps = await getSleepLogs(user!.id);
      const habits = await getHabitLogs(user!.id);
      const p = await getProfile(user!.id);
      const defaults = { 
        name: user!.name, age: 0, gender: "", weight: 0, height: 0, 
        existingConditions: [], familyHistory: [], 
        createdAt: "" 
      };
      const profile = p ? { ...defaults, ...p } : defaults;
      
      return analyzePredictions(sleeps, habits, profile);
    },
    enabled: !!user?.id,
  });
}

// --- Statistics ---
export function useGetStatistics(params: { period: string, date: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["/api/statistics", user?.id, params.period, params.date],
    queryFn: async () => {
      const habits = await getHabitLogs(user!.id);
      
      const filteredHabits = habits.filter(h => {
        if (params.period === "day") {
          return h.date === params.date;
        } else {
          // Month selection
          const logDate = new Date(h.date);
          const targetDate = new Date(params.date);
          return logDate.getMonth() === targetDate.getMonth() && 
                 logDate.getFullYear() === targetDate.getFullYear();
        }
      });

      // Construct habit data mapping
      const habitData = filteredHabits.reverse().map(h => ({
        label: format(new Date(h.date), "MMM d"),
        exerciseMinutes: h.exerciseMinutes,
        stressLevel: h.stressLevel
      }));
      
      const avgExerciseMinutes = filteredHabits.length ? Math.round(filteredHabits.reduce((a, b) => a + b.exerciseMinutes, 0) / filteredHabits.length) : 0;
      const avgWaterGlasses = filteredHabits.length ? Math.round(filteredHabits.reduce((a, b) => a + b.waterGlasses, 0) / filteredHabits.length) : 0;
      const avgStressLevel = filteredHabits.length ? Math.round(filteredHabits.reduce((a, b) => a + b.stressLevel, 0) / filteredHabits.length) : 0;
      
      return {
        habitData,
        averages: { avgExerciseMinutes, avgWaterGlasses, avgStressLevel },
        habitLogsCount: filteredHabits.length
      };
    },
    enabled: !!user?.id,
  });
}
