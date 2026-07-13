import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useBoard(projectId) {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!projectId) {
      setCharacters([]);
      setLocations([]);
      return;
    }
    setLoading(true);
    const [{ data: chars, error: e1 }, { data: locs, error: e2 }] = await Promise.all([
      supabase.from("characters").select("*").eq("project_id", projectId).order("created_at"),
      supabase.from("locations").select("*").eq("project_id", projectId).order("created_at"),
    ]);
    if (e1 || e2) setError((e1 || e2).message);
    else {
      setCharacters(chars);
      setLocations(locs);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("characters", "project_id", projectId, load);
  useRealtimeRefresh("locations", "project_id", projectId, load);

  async function saveCharacter(form) {
    const payload = { ...form, project_id: projectId, owner_id: user.id };
    if (form.id) {
      const { data, error } = await supabase.from("characters").update(payload).eq("id", form.id).select().single();
      if (error) {
        setError(error.message);
        return null;
      }
      setCharacters((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      return data;
    }
    const { data, error } = await supabase.from("characters").insert(payload).select().single();
    if (error) {
      setError(error.message);
      return null;
    }
    setCharacters((prev) => [...prev, data]);
    return data;
  }

  async function deleteCharacter(id) {
    const { error } = await supabase.from("characters").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    return true;
  }

  async function saveLocation(form) {
    const payload = { ...form, project_id: projectId, owner_id: user.id };
    if (form.id) {
      const { data, error } = await supabase.from("locations").update(payload).eq("id", form.id).select().single();
      if (error) {
        setError(error.message);
        return null;
      }
      setLocations((prev) => prev.map((l) => (l.id === data.id ? data : l)));
      return data;
    }
    const { data, error } = await supabase.from("locations").insert(payload).select().single();
    if (error) {
      setError(error.message);
      return null;
    }
    setLocations((prev) => [...prev, data]);
    return data;
  }

  async function deleteLocation(id) {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setLocations((prev) => prev.filter((l) => l.id !== id));
    return true;
  }

  return {
    characters,
    locations,
    loading,
    error,
    saveCharacter,
    deleteCharacter,
    saveLocation,
    deleteLocation,
  };
}
