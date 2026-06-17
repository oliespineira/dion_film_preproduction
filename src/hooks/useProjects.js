import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setProjects(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function createProject(name) {
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, owner_id: user.id })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setProjects((prev) => [...prev, data]);
    return data;
  }

  async function deleteProject(id) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    return true;
  }

  return { projects, loading, error, createProject, deleteProject, reload: load };
}
