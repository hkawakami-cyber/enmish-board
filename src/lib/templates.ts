// テンプレートデータ。ユーザーがゼロから考えずに業務整理を始められるようにする。
// 各テンプレートは「フレーム + カード」の集合を生成する。

import type { BoardFrame, BoardNode, NodeType } from "@/types/board";

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  /** ボード新規作成時のデフォルトタイトル */
  defaultTitle: string;
}

export const TEMPLATES: TemplateDef[] = [
  { id: "sales-process", name: "営業プロセス整理", description: "リード獲得から受注・追客までの工程を整理する", defaultTitle: "営業プロセス整理" },
  { id: "call-branch", name: "架電結果分岐", description: "架電結果の分岐と追客優先度を整理する", defaultTitle: "架電結果分岐整理" },
  { id: "hearing", name: "顧客ヒアリング", description: "事業概要・課題・理想状態・宿題を整理する", defaultTitle: "顧客ヒアリング整理" },
  { id: "kpi-tree", name: "KPIツリー", description: "KGIから活動指標・改善レバーまで分解する", defaultTitle: "KPIツリー設計" },
  { id: "poc", name: "PoC設計", description: "目的・仮説・対象・成功条件を設計する", defaultTitle: "PoC設計" },
  { id: "issue-action", name: "課題・施策整理", description: "現状・課題・施策・To-Beを結びつける", defaultTitle: "課題・施策整理" },
  { id: "minutes", name: "議事録整理", description: "決定事項・論点・宿題を構造化する", defaultTitle: "議事録整理" },
];

// --- 内部ビルダー ----------------------------------------------------------

type NodeSeed = {
  type: NodeType;
  data: Record<string, unknown>;
  color?: string;
};

type FrameSeed = {
  title: string;
  color?: string;
  /** フレーム内に並べるカード */
  cards: NodeSeed[];
  /** 1行に並べるカード数 */
  cols?: number;
};

const NODE_W = 220;
const NODE_H = 120;
const GAP_X = 24;
const GAP_Y = 20;
const FRAME_PAD = 28;
const FRAME_HEADER = 44;
const FRAME_GAP = 60;

function now() {
  return new Date().toISOString();
}

function uid() {
  return crypto.randomUUID();
}

/** フレーム群を縦に積み、各フレーム内でカードをグリッド配置する */
function build(frames: FrameSeed[], origin = { x: 80, y: 80 }) {
  const ts = now();
  const outNodes: BoardNode[] = [];
  const outFrames: BoardFrame[] = [];

  let cursorY = origin.y;

  for (const f of frames) {
    const cols = f.cols ?? Math.min(f.cards.length || 1, 4);
    const rows = Math.max(1, Math.ceil(f.cards.length / cols));
    const innerW = cols * NODE_W + (cols - 1) * GAP_X;
    const frameW = innerW + FRAME_PAD * 2;
    const frameH = FRAME_HEADER + rows * NODE_H + (rows - 1) * GAP_Y + FRAME_PAD;

    outFrames.push({
      id: uid(),
      type: "frame",
      title: f.title,
      position: { x: origin.x, y: cursorY },
      size: { width: frameW, height: frameH },
      color: f.color ?? "slate",
      createdAt: ts,
      updatedAt: ts,
    });

    f.cards.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      outNodes.push({
        id: uid(),
        type: card.type,
        position: {
          x: origin.x + FRAME_PAD + col * (NODE_W + GAP_X),
          y: cursorY + FRAME_HEADER + row * (NODE_H + GAP_Y),
        },
        size: { width: NODE_W, height: NODE_H },
        data: card.data,
        style: { color: card.color },
        createdAt: ts,
        updatedAt: ts,
      });
    });

    cursorY += frameH + FRAME_GAP;
  }

  return { nodes: outNodes, frames: outFrames };
}

function process(title: string, fields?: Partial<Record<string, string>>): NodeSeed {
  return {
    type: "process",
    color: "blue",
    data: {
      title,
      owner: fields?.owner ?? "",
      input: fields?.input ?? "",
      output: fields?.output ?? "",
      issue: fields?.issue ?? "",
      status: fields?.status ?? "",
      description: fields?.description ?? "",
    },
  };
}

function sticky(title: string, body = "", color = "yellow"): NodeSeed {
  return { type: "sticky", color, data: { title, body } };
}

function kpi(name: string, opts?: Partial<Record<string, string>>): NodeSeed {
  return {
    type: "kpi",
    color: "green",
    data: {
      name,
      value: opts?.value ?? "",
      unit: opts?.unit ?? "",
      formula: opts?.formula ?? "",
      description: opts?.description ?? "",
    },
  };
}

// --- 各テンプレート --------------------------------------------------------

function tplSalesProcess() {
  return build([
    {
      title: "営業プロセス",
      color: "blue",
      cols: 5,
      cards: [
        process("リード獲得"),
        process("リード精査"),
        process("初回接触"),
        process("ヒアリング"),
        process("商談化"),
        process("提案"),
        process("受注"),
        process("失注"),
        process("追客"),
      ],
    },
    {
      title: "各工程の整理観点",
      color: "slate",
      cols: 4,
      cards: [
        sticky("目的", "各工程のゴール"),
        sticky("担当者", "誰が動くか"),
        sticky("使用ツール", "利用システム"),
        sticky("入力情報", "前工程からの引き継ぎ"),
        sticky("出力情報", "次工程への受け渡し"),
        sticky("ボトルネック", "詰まりやすい点", "red"),
        sticky("改善施策", "打ち手", "green"),
      ],
    },
  ]);
}

function tplCallBranch() {
  return build([
    {
      title: "架電結果分岐",
      color: "blue",
      cols: 5,
      cards: [
        sticky("非通電", "", "gray"),
        sticky("通電", "", "blue"),
        sticky("接触", "", "blue"),
        sticky("担当者接触", "", "blue"),
        sticky("案内完了", "", "green"),
        sticky("メール送付", "", "green"),
        sticky("申し込み済み", "", "green"),
        sticky("未申し込み", "", "yellow"),
        sticky("再架電対象", "", "yellow"),
        sticky("再架電対象外", "", "gray"),
      ],
    },
    {
      title: "追客優先度（高い順）",
      color: "amber",
      cols: 3,
      cards: [
        sticky("1. 案内済みだが未申し込み", "", "red"),
        sticky("2. 担当者接触済み", "", "yellow"),
        sticky("3. メール確認済み", "", "yellow"),
        sticky("4. 通電のみ", "", "blue"),
        sticky("5. 不在", "", "gray"),
        sticky("6. 対象外", "", "gray"),
      ],
    },
  ]);
}

function tplHearing() {
  return build([
    {
      title: "顧客ヒアリング",
      color: "purple",
      cols: 3,
      cards: [
        sticky("事業概要"),
        sticky("現在の営業体制"),
        sticky("現在の業務フロー"),
        sticky("利用ツール"),
        sticky("課題", "", "red"),
        sticky("理想状態", "", "green"),
        sticky("制約条件", "", "gray"),
        sticky("次回までの宿題", "", "blue"),
        sticky("提案余地", "", "green"),
      ],
    },
  ]);
}

function tplKpiTree() {
  return build([
    {
      title: "KPIツリー",
      color: "green",
      cols: 3,
      cards: [
        kpi("KGI", { description: "最終ゴール指標" }),
        kpi("主要KPI", { description: "KGIを支える指標" }),
        kpi("先行指標", { description: "結果に先行する指標" }),
        kpi("活動指標", { description: "日々の活動量" }),
        kpi("改善レバー", { description: "動かせる変数" }),
        kpi("現状数値", { description: "いまの値" }),
        kpi("目標数値", { description: "目指す値" }),
        kpi("ギャップ", { description: "目標 − 現状" }),
      ],
    },
    {
      title: "アクション",
      color: "blue",
      cols: 3,
      cards: [
        sticky("アクション1", "", "blue"),
        sticky("アクション2", "", "blue"),
        sticky("アクション3", "", "blue"),
      ],
    },
  ]);
}

function tplPoc() {
  return build([
    {
      title: "PoC設計",
      color: "blue",
      cols: 4,
      cards: [
        sticky("PoC目的"),
        sticky("検証仮説", "", "purple"),
        sticky("対象業界"),
        sticky("対象部署"),
        sticky("対象企業条件"),
        sticky("実施内容"),
        sticky("成功条件", "", "green"),
        sticky("失敗条件", "", "red"),
        sticky("必要データ"),
        sticky("実施期間"),
        sticky("次回判断基準", "", "yellow"),
      ],
    },
  ]);
}

function tplIssueAction() {
  return build([
    { title: "現状", color: "slate", cols: 3, cards: [sticky("現状1"), sticky("現状2"), sticky("現状3")] },
    { title: "課題", color: "amber", cols: 3, cards: [sticky("課題1", "", "red"), sticky("課題2", "", "red"), sticky("課題3", "", "red")] },
    { title: "施策", color: "green", cols: 3, cards: [sticky("施策1", "", "green"), sticky("施策2", "", "green"), sticky("施策3", "", "green")] },
    { title: "To-Be", color: "blue", cols: 2, cards: [sticky("ありたい姿1", "", "blue"), sticky("ありたい姿2", "", "blue")] },
    {
      title: "次回宿題",
      color: "purple",
      cols: 2,
      cards: [
        { type: "task", color: "purple", data: { title: "宿題1", assignee: "", status: "未着手", priority: "中", dueDate: "" } },
        { type: "task", color: "purple", data: { title: "宿題2", assignee: "", status: "未着手", priority: "中", dueDate: "" } },
      ],
    },
  ]);
}

function tplMinutes() {
  return build([
    {
      title: "議事録",
      color: "slate",
      cols: 1,
      cards: [{ type: "text", color: "white", data: { body: "日時 / 参加者 / 議題をここに記載" } }],
    },
    { title: "決定事項", color: "green", cols: 3, cards: [sticky("決定1", "", "green"), sticky("決定2", "", "green"), sticky("決定3", "", "green")] },
    { title: "論点", color: "amber", cols: 3, cards: [sticky("論点1", "", "yellow"), sticky("論点2", "", "yellow"), sticky("論点3", "", "yellow")] },
    {
      title: "宿題（タスク）",
      color: "blue",
      cols: 3,
      cards: [
        { type: "task", color: "blue", data: { title: "タスク1", assignee: "", status: "未着手", priority: "中", dueDate: "" } },
        { type: "task", color: "blue", data: { title: "タスク2", assignee: "", status: "未着手", priority: "中", dueDate: "" } },
        { type: "task", color: "blue", data: { title: "タスク3", assignee: "", status: "未着手", priority: "中", dueDate: "" } },
      ],
    },
  ]);
}

const BUILDERS: Record<string, () => { nodes: BoardNode[]; frames: BoardFrame[] }> = {
  "sales-process": tplSalesProcess,
  "call-branch": tplCallBranch,
  hearing: tplHearing,
  "kpi-tree": tplKpiTree,
  poc: tplPoc,
  "issue-action": tplIssueAction,
  minutes: tplMinutes,
};

/** テンプレートの中身（フレーム + カード）を生成する */
export function buildTemplate(templateId: string): { nodes: BoardNode[]; frames: BoardFrame[] } {
  const builder = BUILDERS[templateId];
  if (!builder) return { nodes: [], frames: [] };
  return builder();
}

export function getTemplateDef(templateId: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === templateId);
}
