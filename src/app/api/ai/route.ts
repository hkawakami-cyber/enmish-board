// AI構造化のサーバールート。Anthropic Messages API を呼ぶ。
// ANTHROPIC_API_KEY が未設定なら 400 を返し、UI 側で「未接続」を案内する。
//
// 対応タスク:
//   - classify : メモ配列を分類カテゴリへ振り分ける
//   - minutes  : ボード要約から議事録を生成
//   - proposal : ボード要約から提案骨子を生成

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

// モデルは環境変数で上書き可能。既定は最新の Opus。
const MODEL = process.env.AI_MODEL || "claude-opus-4-8";

const CATEGORIES = [
  "背景",
  "現状",
  "課題",
  "要望",
  "制約",
  "決定事項",
  "宿題",
  "未決事項",
  "提案論点",
];

interface Item {
  id: string;
  text: string;
}

function textOf(msg: Anthropic.Message): string {
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: "no_key",
        message:
          "AIは未接続です。サーバーの環境変数 ANTHROPIC_API_KEY を設定すると有効になります。",
      },
      { status: 400 },
    );
  }

  let body: { task?: string; items?: Item[]; text?: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const task = body.task;

  try {
    if (task === "classify") {
      const items = (body.items ?? []).filter((i) => i.text?.trim());
      if (items.length === 0) return Response.json({ results: [] });

      const system = `あなたはBtoB営業・要件定義MTGのメモを分類するアシスタントです。各メモを次のいずれか一つに分類します：${CATEGORIES.join(
        "、",
      )}。判断が難しいものは「未決事項」にしてください。`;
      const list = items.map((i) => `[${i.id}] ${i.text}`).join("\n");
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        system,
        messages: [
          {
            role: "user",
            content: `次の各メモを分類し、JSON配列のみで返してください。形式: [{"id":"<id>","category":"<カテゴリ>"}]\n\n${list}`,
          },
        ],
      });
      const raw = textOf(msg);
      const match = raw.match(/\[[\s\S]*\]/);
      let results: { id: string; category: string }[] = [];
      if (match) {
        try {
          results = JSON.parse(match[0]);
        } catch {
          results = [];
        }
      }
      // 不正なカテゴリは弾く
      results = results.filter((r) => r && CATEGORIES.includes(r.category));
      return Response.json({ results });
    }

    if (task === "minutes" || task === "proposal") {
      const text = body.text ?? "";
      const title = body.title ?? "ボード";
      const system =
        task === "minutes"
          ? "あなたは優秀なBtoB営業・コンサルのアシスタントです。会議ボードの内容から、日本語の議事録をMarkdownで作成します。構成は『概要 / 確認できたこと（現状・課題・要望・制約・決定事項）/ 提案に反映すべき論点 / 未決事項 / 次回までの宿題』。事実に忠実に、簡潔にまとめてください。"
          : "あなたは優秀なBtoB営業・コンサルのアシスタントです。会議ボードの内容から、顧客に提示できる提案骨子をMarkdownで作成します。構成は『現状認識 / 課題 / 課題の発生要因 / 解決方針 / 提案スコープ / 実行ステップ / 期待効果 / 未決事項』。自然なビジネス文書にしてください。";
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 4000,
        system,
        messages: [
          {
            role: "user",
            content: `ボード名：${title}\n\n以下はボード上のカード内容です。これを元に作成してください。\n\n${text}`,
          },
        ],
      });
      return Response.json({ markdown: textOf(msg) });
    }

    return Response.json({ error: "unknown_task" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI呼び出しに失敗しました";
    return Response.json({ error: "ai_error", message }, { status: 500 });
  }
}
