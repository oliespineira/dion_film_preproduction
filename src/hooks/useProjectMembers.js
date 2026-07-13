import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useProjectMembers(projectId) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!projectId) {
      setMembers([]);
      setInvites([]);
      return;
    }
    setLoading(true);
    const [{ data: m, error: e1 }, { data: inv, error: e2 }] = await Promise.all([
      supabase.from("project_members").select("*").eq("project_id", projectId).order("created_at"),
      supabase.from("project_invites").select("*").eq("project_id", projectId).eq("status", "pending").order("created_at"),
    ]);
    if (e1 || e2) setError((e1 || e2).message);
    else {
      setMembers(m);
      setInvites(inv);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("project_members", "project_id", projectId, load);
  useRealtimeRefresh("project_invites", "project_id", projectId, load);

  const currentMember = members.find((m) => m.user_id === user?.id);
  const role = currentMember?.role || null;
  const canEdit = role === "owner" || role === "editor";
  const isOwner = role === "owner";

  async function inviteMember(email, inviteRole) {
    const { data, error } = await supabase.rpc("invite_to_project", { p_project_id: projectId, p_email: email, p_role: inviteRole });
    if (error) {
      setError(error.message);
      return null;
    }
    await load();
    return data;
  }

  async function updateRole(userId, newRole) {
    const { error } = await supabase.rpc("update_member_role", { p_project_id: projectId, p_user_id: userId, p_role: newRole });
    if (error) {
      setError(error.message);
      return false;
    }
    await load();
    return true;
  }

  async function removeMember(memberId) {
    const { error } = await supabase.from("project_members").delete().eq("id", memberId);
    if (error) {
      setError(error.message);
      return false;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    return true;
  }

  async function revokeInvite(inviteId) {
    const { error } = await supabase.from("project_invites").delete().eq("id", inviteId);
    if (error) {
      setError(error.message);
      return false;
    }
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    return true;
  }

  return {
    members,
    invites,
    role,
    canEdit,
    isOwner,
    loading,
    error,
    inviteMember,
    updateRole,
    removeMember,
    revokeInvite,
    reload: load,
  };
}
