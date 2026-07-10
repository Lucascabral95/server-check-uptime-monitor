"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useMonitorEvents() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/backend/events", {
      headers: { Accept: "text/event-stream" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n\n");
          buffer = messages.pop() ?? "";
          if (messages.some((message) => message.startsWith("data:"))) {
            queryClient.invalidateQueries({ queryKey: ["uptimes"] });
            queryClient.invalidateQueries({ queryKey: ["myStats"] });
          }
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [queryClient]);
}
