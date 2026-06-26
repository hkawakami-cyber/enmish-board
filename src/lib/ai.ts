"use client";

// AIサーバールート (/api/ai) を呼ぶクライアントヘルパー。

export interface AIError {
  error: string;
  message?: string;
}

async function callAI<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.message || "AIエラー"), { code: data.error });
  }
  return data as T;
}

export function aiClassify(items: { id: string; text: string }[]) {
  return callAI<{ results: { id: string; category: string }[] }>({ task: "classify", items });
}

export function aiMinutes(title: string, text: string) {
  return callAI<{ markdown: string }>({ task: "minutes", title, text });
}

export function aiProposal(title: string, text: string) {
  return callAI<{ markdown: string }>({ task: "proposal", title, text });
}
