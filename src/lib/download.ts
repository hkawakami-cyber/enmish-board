// ブラウザでのファイルダウンロード共通処理

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  triggerDownload(filename, URL.createObjectURL(blob));
}

export function triggerDownload(filename: string, url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** ファイル名に使える形へ整える */
export function safeFileName(name: string) {
  return (name || "enmish-board").replace(/[\\/:*?"<>|]/g, "_").trim() || "enmish-board";
}
