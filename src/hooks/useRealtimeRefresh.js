import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Subscribes to realtime Postgres changes on `table` where
 * `filterColumn = filterValue`, and calls `onChange` whenever a row is
 * inserted, updated, or deleted by ANY collaborator (including other
 * browser tabs/users). Typically `onChange` is the hook's own `load`
 * function, so the simplest correct thing happens: a full refetch.
 */
export function useRealtimeRefresh(table, filterColumn, filterValue, onChange) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!filterValue) return;
    const channel = supabase
      .channel(`rt-${table}-${filterColumn}-${filterValue}`)
      .on("postgres_changes", { event: "*", schema: "public", table, filter: `${filterColumn}=eq.${filterValue}` }, () => {
        onChangeRef.current();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filterColumn, filterValue]);
}
