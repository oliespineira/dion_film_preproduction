import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useShootDays(projectId) {
  const { user } = useAuth();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!projectId) {
      setDays([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("shoot_days")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setDays(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("shoot_days", "project_id", projectId, load);

  async function saveDay(form) {
    if (form.id) {
      const { data, error } = await supabase.from("shoot_days").update(form).eq("id", form.id).select().single();
      if (error) {
        setError(error.message);
        return null;
      }
      setDays((prev) => prev.map((d) => (d.id === data.id ? data : d)));
      return data;
    }
    const nextOrder = days.length > 0 ? Math.max(...days.map((d) => d.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from("shoot_days")
      .insert({ ...form, project_id: projectId, owner_id: user.id, order_index: nextOrder })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setDays((prev) => [...prev, data]);
    return data;
  }

  async function deleteDay(id) {
    const { error } = await supabase.from("shoot_days").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setDays((prev) => prev.filter((d) => d.id !== id));
    return true;
  }

  async function reorder(id, direction) {
    const idx = days.findIndex((d) => d.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= days.length) return;
    const a = days[idx];
    const b = days[swapIdx];
    const [{ data: ua, error: ea }, { data: ub, error: eb }] = await Promise.all([
      supabase.from("shoot_days").update({ order_index: b.order_index }).eq("id", a.id).select().single(),
      supabase.from("shoot_days").update({ order_index: a.order_index }).eq("id", b.id).select().single(),
    ]);
    if (ea || eb) {
      setError((ea || eb).message);
      return;
    }
    setDays((prev) => {
      const next = prev.map((d) => (d.id === ua.id ? ua : d.id === ub.id ? ub : d));
      return [...next].sort((x, y) => x.order_index - y.order_index);
    });
  }

  return { days, loading, error, saveDay, deleteDay, reorder };
}
