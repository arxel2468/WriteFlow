"use client";

import { useState } from "react";
import { useApiKey } from "@/hooks/use-api-key";

export function ApiKeySetup() {
  const { apiKey, setApiKey, hasKey } = useApiKey();
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);

  function handleSave() {
    setApiKey(input.trim());
    setEditing(false);
  }

  if (hasKey && !editing) {
    return (
      <div className="rounded-lg bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Groq API Key</p>
            <p className="text-xs text-muted-foreground">
              ••••••••{apiKey.slice(-4)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setInput(apiKey);
                setEditing(true);
              }}
              className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Change
            </button>
            <button
              onClick={() => setApiKey("")}
              className="rounded-md px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-4 shadow-sm">
      <p className="text-sm font-medium">Set up AI Thinking Partner</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Get a free API key from{" "}
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          console.groq.com
        </a>
        . Your key stays in your browser — never sent to our servers.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="password"
          placeholder="gsk_..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          onClick={handleSave}
          disabled={!input.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
        >
          Save
        </button>
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
