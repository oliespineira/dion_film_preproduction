import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useShots(sceneId, projectId) {
  const { user } = useAuth();
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!sceneId) {
      setShots([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("shots")
      .select("*")
      .eq("scene_id", sceneId)
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setShots(data);
    setLoading(false);
  }, [sceneId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("shots", "scene_id", sceneId, load);

  async function saveShot(form) {
    if (form.id) {
      const { data, error } = await supabase.from("shots").update(form).eq("id", form.id).select().single();
      if (error) {
        setError(error.message);
        return null;
      }
      setShots((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      return data;
    }
    const nextOrder = shots.length > 0 ? Math.max(...shots.map((s) => s.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from("shots")
      .insert({ ...form, scene_id: sceneId, project_id: projectId, owner_id: user.id, order_index: nextOrder })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setShots((prev) => [...prev, data]);
    return data;
  }

  async function deleteShot(id) {
    const { error } = await supabase.from("shots").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setShots((prev) => prev.filter((s) => s.id !== id));
    return true;
  }

  async function reorder(id, direction) {
    const idx = shots.findIndex((s) => s.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= shots.length) return;
    const a = shots[idx];
    const b = shots[swapIdx];
    const [{ data: ua, error: ea }, { data: ub, error: eb }] = await Promise.all([
      supabase.from("shots").update({ order_index: b.order_index }).eq("id", a.id).select().single(),
      supabase.from("shots").update({ order_index: a.order_index }).eq("id", b.id).select().single(),
    ]);
    if (ea || eb) {
      setError((ea || eb).message);
      return;
    }
    setShots((prev) => {
      const next = prev.map((s) => (s.id === ua.id ? ua : s.id === ub.id ? ub : s));
      return [...next].sort((x, y) => x.order_index - y.order_index);
    });
  }

  return { shots, loading, error, saveShot, deleteShot, reorder };
}
