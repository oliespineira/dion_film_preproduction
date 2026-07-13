import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useCallSheet(shootDayId, projectId) {
  const { user } = useAuth();
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [callTimes, setCallTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!shootDayId) {
      setScheduleSlots([]);
      setCallTimes([]);
      return;
    }
    setLoading(true);
    const [{ data: slots, error: e1 }, { data: calls, error: e2 }] = await Promise.all([
      supabase.from("shoot_day_scenes").select("*").eq("shoot_day_id", shootDayId).order("order_index"),
      supabase.from("call_times").select("*").eq("shoot_day_id", shootDayId).order("order_index"),
    ]);
    if (e1 || e2) setError((e1 || e2).message);
    else {
      setScheduleSlots(slots);
      setCallTimes(calls);
    }
    setLoading(false);
  }, [shootDayId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("shoot_day_scenes", "shoot_day_id", shootDayId, load);
  useRealtimeRefresh("call_times", "shoot_day_id", shootDayId, load);

  // ---- schedule slots (scenes scheduled for this day) ----

  async function saveSlot(form) {
    if (form.id) {
      const { data, error } = await supabase.from("shoot_day_scenes").update(form).eq("id", form.id).select().single();
      if (error) {
        setError(error.message);
        return null;
      }
      setScheduleSlots((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      return data;
    }
    const nextOrder = scheduleSlots.length > 0 ? Math.max(...scheduleSlots.map((s) => s.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from("shoot_day_scenes")
      .insert({ ...form, shoot_day_id: shootDayId, project_id: projectId, owner_id: user.id, order_index: nextOrder })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setScheduleSlots((prev) => [...prev, data]);
    return data;
  }

  async function deleteSlot(id) {
    const { error } = await supabase.from("shoot_day_scenes").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setScheduleSlots((prev) => prev.filter((s) => s.id !== id));
    return true;
  }

  async function reorderSlot(id, direction) {
    const idx = scheduleSlots.findIndex((s) => s.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= scheduleSlots.length) return;
    const a = scheduleSlots[idx];
    const b = scheduleSlots[swapIdx];
    const [{ data: ua, error: ea }, { data: ub, error: eb }] = await Promise.all([
      supabase.from("shoot_day_scenes").update({ order_index: b.order_index }).eq("id", a.id).select().single(),
      supabase.from("shoot_day_scenes").update({ order_index: a.order_index }).eq("id", b.id).select().single(),
    ]);
    if (ea || eb) {
      setError((ea || eb).message);
      return;
    }
    setScheduleSlots((prev) => {
      const next = prev.map((s) => (s.id === ua.id ? ua : s.id === ub.id ? ub : s));
      return [...next].sort((x, y) => x.order_index - y.order_index);
    });
  }

  // ---- call times (cast/crew citations) ----

  async function saveCallTime(form) {
    if (form.id) {
      const { data, error } = await supabase.from("call_times").update(form).eq("id", form.id).select().single();
      if (error) {
        setError(error.message);
        return null;
      }
      setCallTimes((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      return data;
    }
    const nextOrder = callTimes.length > 0 ? Math.max(...callTimes.map((c) => c.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from("call_times")
      .insert({ ...form, shoot_day_id: shootDayId, project_id: projectId, owner_id: user.id, order_index: nextOrder })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setCallTimes((prev) => [...prev, data]);
    return data;
  }

  async function deleteCallTime(id) {
    const { error } = await supabase.from("call_times").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setCallTimes((prev) => prev.filter((c) => c.id !== id));
    return true;
  }

  async function reorderCallTime(id, direction) {
    const idx = callTimes.findIndex((c) => c.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= callTimes.length) return;
    const a = callTimes[idx];
    const b = callTimes[swapIdx];
    const [{ data: ua, error: ea }, { data: ub, error: eb }] = await Promise.all([
      supabase.from("call_times").update({ order_index: b.order_index }).eq("id", a.id).select().single(),
      supabase.from("call_times").update({ order_index: a.order_index }).eq("id", b.id).select().single(),
    ]);
    if (ea || eb) {
      setError((ea || eb).message);
      return;
    }
    setCallTimes((prev) => {
      const next = prev.map((c) => (c.id === ua.id ? ua : c.id === ub.id ? ub : c));
      return [...next].sort((x, y) => x.order_index - y.order_index);
    });
  }

  return {
    scheduleSlots,
    callTimes,
    loading,
    error,
    saveSlot,
    deleteSlot,
    reorderSlot,
    saveCallTime,
    deleteCallTime,
    reorderCallTime,
  };
}
