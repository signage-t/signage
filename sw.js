// オフライン時でもページとPDF表示ライブラリを読み込めるようにするための Service Worker
const CACHE = "signage-v1";
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
const ASSETS = ["./", "./index.html", PDFJS + "pdf.min.js", PDFJS + "pdf.worker.min.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // PDFの一覧・本体（Google側）はキャッシュしない（端末内のデータベースに保存する）
  if (e.request.method !== "GET" || /google(usercontent)?\.com$/.test(url.hostname)) return;

  // ネット優先、つながらなければキャッシュ
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
