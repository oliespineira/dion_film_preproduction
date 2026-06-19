import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const BUCKET = "reference-photos";

function publicUrlFor(path) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function useReferencePhotos(projectId) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) {
      setPhotos([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("reference_photos")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setPhotos(data.map((p) => ({ ...p, url: publicUrlFor(p.storage_path) })));
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadPhoto(file, { department, sceneId, caption }) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${projectId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return null;
    }

    const nextOrder = photos.length > 0 ? Math.max(...photos.map((p) => p.order_index)) + 1 : 0;
    const { data, error } = await supabase
      .from("reference_photos")
      .insert({
        project_id: projectId,
        owner_id: user.id,
        scene_id: sceneId || null,
        department,
        storage_path: path,
        caption: caption || "",
        order_index: nextOrder,
      })
      .select()
      .single();

    setUploading(false);
    if (error) {
      setError(error.message);
      await supabase.storage.from(BUCKET).remove([path]);
      return null;
    }
    const withUrl = { ...data, url: publicUrlFor(data.storage_path) };
    setPhotos((prev) => [...prev, withUrl]);
    return withUrl;
  }

  async function deletePhoto(photo) {
    const { error: dbError } = await supabase.from("reference_photos").delete().eq("id", photo.id);
    if (dbError) {
      setError(dbError.message);
      return false;
    }
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    return true;
  }

  return { photos, loading, uploading, error, uploadPhoto, deletePhoto };
}
