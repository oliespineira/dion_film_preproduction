import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useScenes(projectId) {
  const { user } = useAuth();
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!projectId) {
      setScenes([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("scenes")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setScenes(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveScene(form) {
    if (form.id) {
      const { data, error } = await supabase.from("scenes").update(form).eq("id", form.id).select().single();
      if (error) {
        setError(error.message);
        return null;
      }
      setScenes((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      return data;
    }
    const nextOrder = scenes.length > 0 ? Math.max(...scenes.map((s) => s.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from("scenes")
      .insert({ ...form, project_id: projectId, owner_id: user.id, order_index: nextOrder })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setScenes((prev) => [...prev, data]);
    return data;
  }

  async function deleteScene(id) {
    const { error } = await supabase.from("scenes").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setScenes((prev) => prev.filter((s) => s.id !== id));
    return true;
  }

  async function reorder(id, direction) {
    const idx = scenes.findIndex((s) => s.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= scenes.length) return;
    const a = scenes[idx];
    const b = scenes[swapIdx];
    const [{ data: ua, error: ea }, { data: ub, error: eb }] = await Promise.all([
      supabase.from("scenes").update({ order_index: b.order_index }).eq("id", a.id).select().single(),
      supabase.from("scenes").update({ order_index: a.order_index }).eq("id", b.id).select().single(),
    ]);
    if (ea || eb) {
      setError((ea || eb).message);
      return;
    }
    setScenes((prev) => {
      const next = prev.map((s) => (s.id === ua.id ? ua : s.id === ub.id ? ub : s));
      return [...next].sort((x, y) => x.order_index - y.order_index);
    });
  }

  return { scenes, loading, error, saveScene, deleteScene, reorder };
}
