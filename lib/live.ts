"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
// นับคนออนไลน์จริงด้วย Supabase Presence (track=true = นับตัวเองด้วย)
export function usePresence(track: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const ch = supabase.channel("online", { config: { presence: { key: crypto.randomUUID() } } });
    ch.on("presence", { event: "sync" }, () => setN(Object.keys(ch.presenceState()).length))
      .subscribe(async (s) => { if (s === "SUBSCRIBED" && track) await ch.track({ t: Date.now() }); });
    return () => { supabase.removeChannel(ch); };
  }, [track]);
  return n;
}
