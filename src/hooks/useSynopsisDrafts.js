import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useSynopsisDrafts(projectId) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!projectId) {
      setDrafts([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("synopsis_drafts")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setDrafts(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("synopsis_drafts", "project_id", projectId, load);

  async function createDraft(content, label) {
    const { data, error } = await supabase
      .from("synopsis_drafts")
      .insert({ project_id: projectId, owner_id: user.id, content, label: label || "" })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setDrafts((prev) => [data, ...prev]);
    return data;
  }

  async function deleteDraft(id) {
    const { error } = await supabase.from("synopsis_drafts").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    return true;
  }

  return { drafts, loading, error, createDraft, deleteDraft };
}
