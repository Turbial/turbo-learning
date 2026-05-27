// ─── TanStack Query hooks for Supabase data ───

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Program, Unit, Lesson, UserProfile, LessonProgress } from "../engine/types";

// ═══ Content queries (public, no auth needed) ═══

export function useProgram(slug: string) {
  return useQuery({
    queryKey: ["program", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Program;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useUnits(programId: string | undefined) {
  return useQuery({
    queryKey: ["units", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("program_id", programId)
        .order("order_num", { ascending: true });
      if (error) throw error;
      return data as Unit[];
    },
    enabled: !!programId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();
      if (error) throw error;
      return data as Lesson;
    },
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLessonByUnit(unitId: string | undefined) {
  return useQuery({
    queryKey: ["lessonByUnit", unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("unit_id", unitId)
        .order("order_num", { ascending: true })
        .limit(1)
        .single();
      if (error) throw error;
      return data as Lesson;
    },
    enabled: !!unitId,
    staleTime: 5 * 60 * 1000,
  });
}

// ═══ User profile (requires auth) ═══

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist yet — create it
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id })
          .select("*")
          .single();
        if (insertError) throw insertError;
        return newProfile as UserProfile;
      }

      if (error) throw error;
      return data as UserProfile;
    },
    staleTime: 60 * 1000,
  });
}

export function useProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ["progress", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*, lessons(title)")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ["badges", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id, badges(*)")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useStreakLog(userId: string | undefined) {
  return useQuery({
    queryKey: ["streak", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streak_log")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// ═══ Mutations ═══

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      lessonId,
      xpEarned,
      score,
    }: {
      userId: string;
      lessonId: string;
      xpEarned: number;
      score: number;
    }) => {
      const { data, error } = await supabase.rpc("complete_lesson", {
        p_user_id: userId,
        p_lesson_id: lessonId,
        p_xp_earned: xpEarned,
        p_score: score,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}

export function useSaveStepResponse() {
  return useMutation({
    mutationFn: async ({
      userId,
      lessonId,
      stepId,
      response,
      correct,
    }: {
      userId: string;
      lessonId: string;
      stepId: string;
      response: unknown;
      correct?: boolean;
    }) => {
      const { error } = await supabase.from("step_responses").insert({
        user_id: userId,
        lesson_id: lessonId,
        step_id: stepId,
        response,
        correct: correct ?? null,
      });
      if (error) throw error;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programSlug }: { programSlug: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get program id from slug
      const { data: program } = await supabase
        .from("programs")
        .select("id")
        .eq("slug", programSlug)
        .single();
      if (!program) throw new Error("Program not found");

      // Upsert enrollment (idempotent)
      const { error } = await supabase
        .from("enrollments")
        .upsert({ user_id: user.id, program_id: program.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
}

export function useEnrollment(programSlug: string | undefined) {
  return useQuery({
    queryKey: ["enrollment", programSlug],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: program } = await supabase
        .from("programs")
        .select("id")
        .eq("slug", programSlug)
        .single();
      if (!program) return null;

      const { data } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("program_id", program.id)
        .single();
      return data;
    },
    enabled: !!programSlug,
  });
}

export function useLessonProgressMap(userId: string | undefined) {
  return useQuery({
    queryKey: ["lessonProgressMap", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, lessons(unit_id)")
        .eq("user_id", userId);
      if (error) throw error;
      // Map unit_id → completed
      const map = new Set<string>();
      data?.forEach((row: any) => {
        if (row.lessons?.unit_id) map.add(row.lessons.unit_id);
      });
      return map;
    },
    enabled: !!userId,
  });
}
