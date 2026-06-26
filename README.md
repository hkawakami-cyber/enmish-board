# Enmish ボード

**営業・業務・会議を一枚で構造化する** オンラインボード型の業務整理 Web アプリ。

顧客ヒアリング、営業プロセス設計、業務フロー整理、KPI 設計、会議内容の整理を一枚のボード上で可視化し、
そのまま議事録・提案資料・タスクに落とし込めます。

Enmish シリーズの中では「設計・整理・可視化・合意形成」を担うプロダクトです。

## 主な機能（MVP）

- **ボード管理**: ホーム / 一覧から新規作成・複製・名前変更・削除（`localStorage` に保存）
- **無限キャンバス編集**: ドラッグ移動・ズーム・ノード接続（React Flow）
- **5 種類のカード**: 付箋 (sticky) / テキスト (text) / プロセス (process) / KPI (kpi) / タスク (task)
- **フレーム**: 複数カードをまとめる枠
- **テンプレート**: 営業プロセス整理 / 架電結果分岐 / 顧客ヒアリング / KPI ツリー / PoC 設計 / 課題・施策整理 / 議事録整理
- **右サイドパネル**: 選択カードのタイトル・本文・色・担当者・期限・ステータス・優先度などを編集
- **エクスポート**: JSON / Markdown / PNG
- **ショートカット**: `N` 付箋 / `T` テキスト / `P` プロセス / `K` KPI / `A` タスク / `F` フレーム / `Delete` 削除 / `Cmd+C/V` コピー&貼付 / `Cmd+Z` / `Cmd+Shift+Z` / `Cmd+S` 保存 / `Esc` 選択解除
- 変更後は約 1.2 秒で自動保存（保存状態をツールバーに表示）

## 技術スタック

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS v4
- [React Flow (@xyflow/react)](https://reactflow.dev/) — キャンバス
- [Zustand](https://github.com/pmndrs/zustand) — 編集状態管理
- [html-to-image](https://github.com/bubkoo/html-to-image) — PNG 出力
- [lucide-react](https://lucide.dev/) — アイコン

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド
npm run lint     # ESLint
```

## ディレクトリ構成

```
src/
  app/
    page.tsx                  # ホーム画面
    boards/page.tsx           # ボード一覧
    boards/[boardId]/page.tsx # ボード編集画面
  components/
    layout/AppHeader.tsx
    board/
      BoardCanvas.tsx         # React Flow ラッパー
      Sidebar.tsx             # 左：カード追加ツール
      Toolbar.tsx             # 上：保存 / Undo / ズーム / エクスポート
      RightPanel.tsx          # 右：選択カードの詳細設定
      TemplateModal.tsx       # テンプレート選択
      ExportModal.tsx         # エクスポート
      nodes/                  # 各カードの描画 (Sticky/Text/Process/Kpi/Task/Frame)
  stores/boardStore.ts        # Zustand ストア（編集の単一の真実）
  types/board.ts              # Board / BoardNode / BoardEdge / BoardFrame 型
  lib/
    storage.ts                # localStorage 読み書き
    boardActions.ts           # ボード新規作成（空 / テンプレート）
    templates.ts              # テンプレート定義
    exportJson.ts             # JSON 出力
    exportMarkdown.ts         # Markdown 出力
    exportImage.ts            # PNG 出力
    colors.ts                 # カラーパレット
    shortcuts.ts              # キーボードショートカット
```

## データ設計

ボードは `Board { nodes, edges, frames, ... }` として保存されます。
保存層 (`lib/storage.ts`) を差し替えることで、将来的に Supabase / Firebase / PostgreSQL へ移行できます。

## 対象外（将来拡張）

リアルタイム共同編集 / 権限管理 / 課金 / AI 自動作図 / 外部連携（Slack・Google Drive・PowerPoint 等）/ コメント / 履歴管理は本 MVP の対象外です。
