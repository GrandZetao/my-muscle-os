"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getExercise } from "@/features/exercises/data";
import { createId, getDeviceId } from "@/lib/ids";
import type { SetLog, TrainingDay, TrainingPlan, WorkoutSession } from "@/types/domain";

interface WorkoutState {
  activeSession: WorkoutSession | null;
  restEndsAt: number | null;
  isPaused: boolean;
  pausedAt: number | null;
  accumulatedPausedSeconds: number;
  startWorkout: (plan: TrainingPlan, day: TrainingDay) => void;
  updateSet: (setId: string, patch: Partial<Pick<SetLog, "weightKg" | "reps" | "rir">>) => void;
  toggleSet: (setId: string, restSeconds: number) => void;
  addWarmupSet: (exerciseId: string) => void;
  pause: () => void;
  resume: () => void;
  clear: () => void;
}

const now = () => new Date().toISOString();

/**
 * 当前训练会话是可恢复的浏览器状态；正式完成后才写入 IndexedDB 历史库。
 * 这样刷新页面不会丢组，同时避免未完成草稿污染历史统计。
 */
export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      activeSession: null,
      restEndsAt: null,
      isPaused: false,
      pausedAt: null,
      accumulatedPausedSeconds: 0,
      startWorkout: (plan, day) =>
        set({
          activeSession: {
            id: createId("session"),
            planId: plan.id,
            trainingDayId: day.id,
            name: day.name,
            startedAt: now(),
            durationSeconds: 0,
            updatedAt: now(),
            deviceId: getDeviceId(),
            exercises: day.exercises.map((prescription) => ({
              prescriptionId: prescription.id,
              exerciseId: prescription.exerciseId,
              notes: "",
              sets: Array.from({ length: prescription.sets }, (_, index) => ({
                id: createId("set"),
                exerciseId: prescription.exerciseId,
                order: index + 1,
                setType: "working" as const,
                weightKg: prescription.suggestedWeightKg ?? 0,
                reps: prescription.repMin,
                rir: prescription.targetRir,
                completed: false,
                updatedAt: now(),
                deviceId: getDeviceId(),
              })),
            })),
          },
          restEndsAt: null,
          isPaused: false,
          pausedAt: null,
          accumulatedPausedSeconds: 0,
        }),
      updateSet: (setId, patch) =>
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                updatedAt: now(),
                exercises: state.activeSession.exercises.map((exercise) => ({
                  ...exercise,
                  sets: exercise.sets.map((item) => (item.id === setId ? { ...item, ...patch, updatedAt: now() } : item)),
                })),
              }
            : null,
        })),
      toggleSet: (setId, restSeconds) =>
        set((state) => {
          if (!state.activeSession) return state;
          let completed = false;
          const exercises = state.activeSession.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((item) => {
              if (item.id !== setId) return item;
              completed = !item.completed;
              return { ...item, completed, updatedAt: now() };
            }),
          }));
          if (completed && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
          return {
            activeSession: { ...state.activeSession, exercises, updatedAt: now() },
            restEndsAt: completed ? Date.now() + restSeconds * 1000 : state.restEndsAt,
          };
        }),
      addWarmupSet: (exerciseId) =>
        set((state) => {
          if (!state.activeSession) return state;
          const exerciseName = getExercise(exerciseId)?.name ?? "动作";
          return {
            activeSession: {
              ...state.activeSession,
              updatedAt: now(),
              exercises: state.activeSession.exercises.map((exercise) =>
                exercise.exerciseId !== exerciseId
                  ? exercise
                  : {
                      ...exercise,
                      sets: [
                        {
                          id: createId("set"),
                          exerciseId,
                          order: 0,
                          setType: "warmup",
                          weightKg: 0,
                          reps: 10,
                          rir: 4,
                          completed: false,
                          updatedAt: now(),
                          deviceId: getDeviceId(),
                        },
                        ...exercise.sets,
                      ],
                      notes: exercise.notes || `${exerciseName} 热身`,
                    },
              ),
            },
          };
        }),
      pause: () => set({ isPaused: true, pausedAt: Date.now(), restEndsAt: null }),
      resume: () =>
        set((state) => ({
          isPaused: false,
          accumulatedPausedSeconds:
            state.accumulatedPausedSeconds + (state.pausedAt ? Math.round((Date.now() - state.pausedAt) / 1000) : 0),
          pausedAt: null,
        })),
      clear: () => set({ activeSession: null, restEndsAt: null, isPaused: false, pausedAt: null, accumulatedPausedSeconds: 0 }),
    }),
    { name: "muscle-os-active-workout" },
  ),
);
