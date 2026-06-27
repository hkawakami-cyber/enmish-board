// 分類(category)を活用した構造化ドキュメント出力。
// AI を使わないルールベース版。将来 AI 生成に差し替え可能な形にしておく。

import type { Board, BoardNode, ObjectField } from "@/types/board";
import { downloadText, safeFileName } from "./download";

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

/** ノードを1行テキストにする（発言者があれば添える） */
function nodeText(n: BoardNode): string {
  const d = n.data;
  let body = "";
  switch (n.type) {
    case "sticky":
      body = [str(d.title), str(d.body)].filter(Boolean).join("：");
      break;
    case "text":
      body = str(d.body);
      break;
    case "process":
      body = str(d.title);
      break;
    case "kpi":
      body = [str(d.name), [str(d.value), str(d.unit)].filter(Boolean).join("")].filter(Boolean).join("：");
      break;
    case "task":
    case "decision":
    case "terminal":
    case "system":
    case "mind":
      body = str(d.title);
      break;
    case "object":
      body = str(d.name);
      break;
  }
  const sp = str(d.speaker);
  return sp ? `${body}（${sp}）` : body;
}

/** カテゴリ別にノードをまとめる */
function groupByCategory(nodes: BoardNode[]) {
  const map = new Map<string, BoardNode[]>();
  for (const n of nodes) {
    const c = str(n.data.category) || "未分類";
    if (!map.has(c)) map.set(c, []);
    map.get(c)!.push(n);
  }
  return map;
}

function tasksTable(nodes: BoardNode[]): string {
  const tasks = nodes.filter((n) => n.type === "task" || str(n.data.category) === "宿題");
  if (tasks.length === 0) return "_（宿題なし）_";
  const header = "| 内容 | 担当 | 期限 | ステータス |\n|---|---|---|---|";
  const rows = tasks.map((t) => {
    const d = t.data;
    const title = t.type === "task" ? str(d.title) : nodeText(t);
    return `| ${title || "(無題)"} | ${str(d.assignee) || str(d.speaker) || "-"} | ${str(d.dueDate) || "-"} | ${str(d.status) || "-"} |`;
  });
  return [header, ...rows].join("\n");
}

function bulletsFor(map: Map<string, BoardNode[]>, category: string): string {
  const list = map.get(category) ?? [];
  if (list.length === 0) return "";
  return list.map((n) => `- ${nodeText(n) || "(空)"}`).filter(Boolean).join("\n");
}

/** 議事録（MTG概要 / 確認できたこと / 提案論点 / 未決事項 / 宿題） */
export function boardToMinutes(board: Board): string {
  const map = groupByCategory(board.nodes);
  const L: string[] = [];
  L.push(`# 議事録：${board.title}`);
  L.push("");
  L.push("- 日時：");
  L.push("- 参加者：");
  L.push("- 目的：");
  L.push("");
  L.push("## 確認できたこと");
  for (const cat of ["背景", "現状", "課題", "要望", "制約", "決定事項"]) {
    const b = bulletsFor(map, cat);
    if (b) {
      L.push("");
      L.push(`### ${cat}`);
      L.push(b);
    }
  }
  const proposal = bulletsFor(map, "提案論点");
  if (proposal) {
    L.push("");
    L.push("## 提案に反映すべき論点");
    L.push(proposal);
  }
  const undecided = bulletsFor(map, "未決事項");
  L.push("");
  L.push("## 未決事項");
  L.push(undecided || "_（なし）_");

  L.push("");
  L.push("## 次回までの宿題");
  L.push(tasksTable(board.nodes));

  // 未分類メモ
  const other = bulletsFor(map, "未分類");
  if (other) {
    L.push("");
    L.push("## その他メモ");
    L.push(other);
  }
  L.push("");
  return L.join("\n");
}

/** 提案骨子（顧客共有想定：内部メモは除外） */
export function boardToProposal(board: Board): string {
  const nodes = board.nodes.filter((n) => !n.data.isInternal);
  const map = groupByCategory(nodes);
  const L: string[] = [];
  L.push(`# 提案骨子：${board.title}`);
  L.push("");

  const section = (heading: string, cat?: string) => {
    L.push(`## ${heading}`);
    const body = cat ? bulletsFor(map, cat) : "";
    L.push(body || "- ");
    L.push("");
  };

  section("現状認識", "現状");
  section("顧客課題", "課題");
  section("課題の発生要因");
  section("解決方針", "提案論点");
  section("ご要望・前提", "要望");
  section("提案スコープ");
  section("実行ステップ");
  section("体制・スケジュール");
  section("期待効果");
  section("未決事項・確認事項", "未決事項");
  return L.join("\n");
}

/** 項目定義書（オブジェクトノードの項目一覧を表に） */
export function boardToFieldSpec(board: Board): string {
  const objects = board.nodes.filter((n) => n.type === "object");
  const L: string[] = [];
  L.push(`# 項目定義書：${board.title}`);
  if (objects.length === 0) {
    L.push("");
    L.push("_オブジェクトがありません。サイドバーの「オブジェクト」で追加してください。_");
    return L.join("\n");
  }
  for (const o of objects) {
    const fields = (o.data.fields as ObjectField[] | undefined) ?? [];
    L.push("");
    L.push(`## ${str(o.data.name) || "オブジェクト"}`);
    L.push("");
    L.push("| 項目名 | 型 | 必須 |");
    L.push("|---|---|---|");
    if (fields.length === 0) {
      L.push("| _（項目なし）_ | | |");
    } else {
      for (const f of fields) {
        L.push(`| ${f.name || "(未設定)"} | ${f.type || "-"} | ${f.required ? "○" : ""} |`);
      }
    }
  }
  L.push("");
  return L.join("\n");
}

export function exportBoardFieldSpec(board: Board) {
  downloadText(`${safeFileName(board.title)}_項目定義書.md`, boardToFieldSpec(board), "text/markdown");
}

export function exportBoardMinutes(board: Board) {
  downloadText(`${safeFileName(board.title)}_議事録.md`, boardToMinutes(board), "text/markdown");
}

export function exportBoardProposal(board: Board) {
  downloadText(`${safeFileName(board.title)}_提案骨子.md`, boardToProposal(board), "text/markdown");
}
