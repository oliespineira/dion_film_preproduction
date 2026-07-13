import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

const BUCKET = "reference-photos";

function publicUrlFor(path) {
  if (!path) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function withUrls(plan) {
  return { ...plan, url: publicUrlFor(plan.storage_path), backgroundUrl: publicUrlFor(plan.background_path) };
}

export function useLightingPlans(sceneId, projectId) {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!sceneId) {
      setPlans([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("lighting_plans")
      .select("*")
      .eq("scene_id", sceneId)
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setPlans(data.map(withUrls));
    setLoading(false);
  }, [sceneId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("lighting_plans", "scene_id", sceneId, load);

  async function uploadToStorage(fileOrBlob, subfolder) {
    const ext = fileOrBlob.name ? fileOrBlob.name.split(".").pop() : "png";
    const path = `${user.id}/${projectId}/${subfolder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, fileOrBlob);
    if (error) throw error;
    return path;
  }

  async function createImagePlan(fileOrBlob, caption = "") {
    setSaving(true);
    try {
      const path = await uploadToStorage(fileOrBlob, "lighting");
      const { data, error } = await supabase
        .from("lighting_plans")
        .insert({ scene_id: sceneId, project_id: projectId, owner_id: user.id, kind: "image", storage_path: path, caption })
        .select()
        .single();
      if (error) throw error;
      const withUrl = withUrls(data);
      setPlans((prev) => [...prev, withUrl]);
      return withUrl;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function createDiagramPlan({ backgroundFile, diagramData, caption }) {
    setSaving(true);
    try {
      const backgroundPath = backgroundFile ? await uploadToStorage(backgroundFile, "lighting") : "";
      const { data, error } = await supabase
        .from("lighting_plans")
        .insert({
          scene_id: sceneId,
          project_id: projectId,
          owner_id: user.id,
          kind: "diagram",
          background_path: backgroundPath,
          diagram_data: diagramData || [],
          caption: caption || "",
        })
        .select()
        .single();
      if (error) throw error;
      const withUrl = withUrls(data);
      setPlans((prev) => [...prev, withUrl]);
      return withUrl;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function updateDiagramPlan(id, { backgroundFile, diagramData, caption }) {
    setSaving(true);
    try {
      const payload = { diagram_data: diagramData, caption };
      if (backgroundFile) payload.background_path = await uploadToStorage(backgroundFile, "lighting");
      const { data, error } = await supabase.from("lighting_plans").update(payload).eq("id", id).select().single();
      if (error) throw error;
      const withUrl = withUrls(data);
      setPlans((prev) => prev.map((p) => (p.id === id ? withUrl : p)));
      return withUrl;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(plan) {
    const { error } = await supabase.from("lighting_plans").delete().eq("id", plan.id);
    if (error) {
      setError(error.message);
      return false;
    }
    const toRemove = [plan.storage_path, plan.background_path].filter(Boolean);
    if (toRemove.length > 0) await supabase.storage.from(BUCKET).remove(toRemove);
    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    return true;
  }

  return { plans, loading, saving, error, createImagePlan, createDiagramPlan, updateDiagramPlan, deletePlan };
}
