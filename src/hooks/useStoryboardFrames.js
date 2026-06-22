import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const BUCKET = "reference-photos";

function publicUrlFor(path) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function useStoryboardFrames(shotId, projectId) {
  const { user } = useAuth();
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!shotId) {
      setFrames([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("storyboard_frames")
      .select("*")
      .eq("shot_id", shotId)
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setFrames(data.map((f) => ({ ...f, url: publicUrlFor(f.storage_path) })));
    setLoading(false);
  }, [shotId]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadFrame(fileOrBlob, caption = "") {
    setUploading(true);
    const ext = fileOrBlob.name ? fileOrBlob.name.split(".").pop() : "png";
    const path = `${user.id}/${projectId}/storyboard/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, fileOrBlob);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return null;
    }

    const nextOrder = frames.length > 0 ? Math.max(...frames.map((f) => f.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from("storyboard_frames")
      .insert({ shot_id: shotId, project_id: projectId, owner_id: user.id, storage_path: path, caption, order_index: nextOrder })
      .select()
      .single();

    setUploading(false);
    if (error) {
      setError(error.message);
      await supabase.storage.from(BUCKET).remove([path]);
      return null;
    }
    const withUrl = { ...data, url: publicUrlFor(data.storage_path) };
    setFrames((prev) => [...prev, withUrl]);
    return withUrl;
  }

  async function deleteFrame(frame) {
    const { error: dbError } = await supabase.from("storyboard_frames").delete().eq("id", frame.id);
    if (dbError) {
      setError(dbError.message);
      return false;
    }
    await supabase.storage.from(BUCKET).remove([frame.storage_path]);
    setFrames((prev) => prev.filter((f) => f.id !== frame.id));
    return true;
  }

  async function reorder(id, direction) {
    const idx = frames.findIndex((f) => f.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= frames.length) return;
    const a = frames[idx];
    const b = frames[swapIdx];
    const [{ data: ua, error: ea }, { data: ub, error: eb }] = await Promise.all([
      supabase.from("storyboard_frames").update({ order_index: b.order_index }).eq("id", a.id).select().single(),
      supabase.from("storyboard_frames").update({ order_index: a.order_index }).eq("id", b.id).select().single(),
    ]);
    if (ea || eb) {
      setError((ea || eb).message);
      return;
    }
    setFrames((prev) => {
      const next = prev.map((f) =>
        f.id === ua.id ? { ...ua, url: publicUrlFor(ua.storage_path) } : f.id === ub.id ? { ...ub, url: publicUrlFor(ub.storage_path) } : f
      );
      return [...next].sort((x, y) => x.order_index - y.order_index);
    });
  }

  return { frames, loading, uploading, error, uploadFrame, deleteFrame, reorder };
}
