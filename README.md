# Enmish ボード

**BtoB商談・要件定義・提案設計に特化した思考整理ボード。**

MTG中の発言・論点・業務構造を、マインドマップ・ロジックツリー・フロー図に変換し、
課題整理・要件定義・提案骨子・アクションまで一気通貫で落とし込めます。
対象は SIer / Salesforce インプリベンダー / 営業支援会社 / BtoBコンサル・PM・CS・プリセールス。

> 雑にメモする → 構造化する → 図解に変換する → 議事録・提案骨子に出力する

Enmish シリーズの中では「設計・整理・可視化・合意形成」を担うプロダクトです。

## 主な機能

### 入力（会議中のテンポを止めない）
- **無限キャンバス編集**: ドラッグ・ズーム・ノード接続（React Flow）
- **空白ダブルクリックで付箋**を即作成（作成直後に編集開始）
- **テキスト貼り付け（⌘V）→ 行ごとに付箋へ自動分解**
- **右クリックメニュー**（複製 / 前面・背面 / 削除 / 各カード追加）
- **5 種類のカード**: 付箋 / テキスト / プロセス / KPI / タスク＋**フレーム**

### 構造化（MTGの収束）
- **発言の分類**: 背景 / 現状 / 課題 / 要望 / 制約 / 決定事項 / 宿題 / 未決事項 / 提案論点（選ぶと色も自動適用）
- **発言者**・**内部メモ**フラグ
- **顧客共有モード**: 内部メモを隠して顧客にそのまま見せられる

### 図解への変換（オートレイアウト）
- 付箋をエッジでつないで **マインドマップ / ロジックツリー / フロー図** に自動整列
- 選択中ならその部分集合、未選択なら全体を整える

### テンプレート
- 営業支援（初回ヒアリング / 営業プロセス / 架電結果分岐 / ターゲット設計 / KPIツリー）
- Salesforce（要件整理: As-Is/To-Be・オブジェクト・項目・権限・レポート）
- SIer（業務整理: 業務フロー・システム・課題・スコープ・見積前提）
- 共通（顧客ヒアリング / 課題・施策 / PoC / 定例 / 振り返り / 議事録）

### 出力
- **議事録**（分類から確認事項・未決・宿題を構造化）
- **提案骨子**（現状認識・課題・解決方針…の章立て、内部メモは除外）
- ボード全体 Markdown / JSON / PNG

### その他
- Undo/Redo、約 1.2 秒の自動保存、ミニマップ
- ショートカット: `N`/`T`/`P`/`K`/`A`/`F` 追加 / `Delete` 削除 / `⌘C·V` / `⌘Z` / `⌘⇧Z` / `⌘S` / `Esc`

## ロードマップ（未実装）

- **AI構造化**（発言の自動分類・抜け漏れ検知・議事録/提案骨子/要件定義書生成）※要 LLM API キー
- **テキスト→フロー図のAI生成**
- スイムレーン図 / システム構成図 / ER図（Salesforceオブジェクト設計）
- マインドマップの Enter/Tab 直接編集・折りたたみ
- リアルタイム共同編集・コメント・権限管理
- Slack / Google Docs 連携

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
