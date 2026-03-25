const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// ─── Config ────────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(__dirname, 'docs-html');

const PAGES = [
  { src: 'index.md',                    out: 'index.html',                        title: 'Home — Osaka Training' },
  { src: 'schedule-yokenteigi.md',      out: 'schedule-yokenteigi.html',          title: 'Lịch Yokenteigi' },
  { src: 'schedule-basicdesign.md',     out: 'schedule-basicdesign.html',         title: 'Lịch Basic Design' },
  { src: 'yokenteigi/index.md',         out: 'yokenteigi/index.html',             title: 'Yokenteigi — Tổng quan' },
  { src: 'yokenteigi/buoi-01.md',       out: 'yokenteigi/buoi-01.html',           title: 'Yokenteigi Buổi 1' },
  { src: 'yokenteigi/buoi-02.md',       out: 'yokenteigi/buoi-02.html',           title: 'Yokenteigi Buổi 2' },
  { src: 'yokenteigi/buoi-03.md',       out: 'yokenteigi/buoi-03.html',           title: 'Yokenteigi Buổi 3' },
  { src: 'yokenteigi/buoi-04.md',       out: 'yokenteigi/buoi-04.html',           title: 'Yokenteigi Buổi 4' },
  { src: 'yokenteigi/buoi-05.md',       out: 'yokenteigi/buoi-05.html',           title: 'Yokenteigi Buổi 5' },
  { src: 'yokenteigi/buoi-06.md',       out: 'yokenteigi/buoi-06.html',           title: 'Yokenteigi Buổi 6 — Case Study 1' },
  { src: 'yokenteigi/buoi-07.md',       out: 'yokenteigi/buoi-07.html',           title: 'Yokenteigi Buổi 7 — Case Study 2' },
  { src: 'yokenteigi/buoi-08.md',       out: 'yokenteigi/buoi-08.html',           title: 'Yokenteigi Buổi 8 — Tốt nghiệp' },
  { src: 'basicdesign/index.md',        out: 'basicdesign/index.html',            title: 'Basic Design — Tổng quan' },
  { src: 'basicdesign/buoi-01.md',      out: 'basicdesign/buoi-01.html',          title: 'Basic Design Buổi 1' },
  { src: 'basicdesign/buoi-02.md',      out: 'basicdesign/buoi-02.html',          title: 'Basic Design Buổi 2' },
  { src: 'basicdesign/buoi-03.md',      out: 'basicdesign/buoi-03.html',          title: 'Basic Design Buổi 3' },
  { src: 'basicdesign/buoi-04.md',      out: 'basicdesign/buoi-04.html',          title: 'Basic Design Buổi 4' },
  { src: 'basicdesign/buoi-05.md',      out: 'basicdesign/buoi-05.html',          title: 'Basic Design Buổi 5' },
  { src: 'basicdesign/buoi-06.md',      out: 'basicdesign/buoi-06.html',          title: 'Basic Design Buổi 6' },
  { src: 'basicdesign/buoi-07.md',      out: 'basicdesign/buoi-07.html',          title: 'Basic Design Buổi 7' },
  { src: 'basicdesign/buoi-08.md',      out: 'basicdesign/buoi-08.html',          title: 'Basic Design Buổi 8 — Tốt nghiệp' },
];

// ─── Navbar HTML ───────────────────────────────────────────────────────────

function navbar(rootPrefix) {
  const r = rootPrefix; // e.g. '' for root, '../' for subdirs
  return `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold" href="${r}index.html">
        <span class="text-warning">⛩</span> Osaka Training
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
              📋 要件定義書コース
            </a>
            <ul class="dropdown-menu dropdown-menu-dark">
              <li><a class="dropdown-item" href="${r}yokenteigi/index.html">🏠 Tổng quan</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-01.html">Buổi 1 — Nền tảng Yokenteigi</a></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-02.html">Buổi 2 — Cấu trúc tài liệu</a></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-03.html">Buổi 3 — 業務フロー & 機能詳細</a></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-04.html">Buổi 4 — 非機能要件 & 画面</a></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-05.html">Buổi 5 — Kỹ năng ヒアリング</a></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-06.html">Buổi 6 — Case Study (Phần 1)</a></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-07.html">Buổi 7 — Case Study (Phần 2)</a></li>
              <li><a class="dropdown-item" href="${r}yokenteigi/buoi-08.html">Buổi 8 — Tốt nghiệp</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-warning" href="${r}schedule-yokenteigi.html">📅 Lịch học</a></li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
              🏗️ 基本設計書コース
            </a>
            <ul class="dropdown-menu dropdown-menu-dark">
              <li><a class="dropdown-item" href="${r}basicdesign/index.html">🏠 Tổng quan</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-01.html">Buổi 1 — Nền tảng & Kiến trúc</a></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-02.html">Buổi 2 — ER図 設計</a></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-03.html">Buổi 3 — テーブル定義書</a></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-04.html">Buổi 4 — 画面設計 & Wireframe</a></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-05.html">Buổi 5 — API設計</a></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-06.html">Buổi 6 — Batch & Security & Infra</a></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-07.html">Buổi 7 — Traceability Matrix</a></li>
              <li><a class="dropdown-item" href="${r}basicdesign/buoi-08.html">Buổi 8 — Tốt nghiệp</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-warning" href="${r}schedule-basicdesign.html">📅 Lịch học</a></li>
            </ul>
          </li>

        </ul>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="${r}schedule-yokenteigi.html">📅 Lịch YK</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="${r}schedule-basicdesign.html">📅 Lịch BD</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;
}

// ─── Page nav (prev/next) for lesson files ─────────────────────────────────

const YOKENTEIGI_LESSONS = [1,2,3,4,5,6,7,8];
const BASICDESIGN_LESSONS = [1,2,3,4,5,6,7,8];

function lessonNav(outFile) {
  const isYK = outFile.startsWith('yokenteigi/buoi-');
  const isBD = outFile.startsWith('basicdesign/buoi-');
  if (!isYK && !isBD) return '';

  const match = outFile.match(/buoi-0?(\d+)\.html/);
  if (!match) return '';
  const num = parseInt(match[1]);
  const prev = num > 1 ? `<a href="buoi-0${num-1}.html" class="btn btn-outline-secondary btn-sm">← Buổi ${num-1}</a>` : '<span></span>';
  const next = num < 8 ? `<a href="buoi-0${num+1}.html" class="btn btn-primary btn-sm">Buổi ${num+1} →</a>` : '<span></span>';
  const indexHref = isYK ? 'index.html' : 'index.html';
  return `
  <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
    ${prev}
    <a href="${indexHref}" class="btn btn-outline-dark btn-sm">📋 Tổng quan</a>
    ${next}
  </div>`;
}

// ─── HTML Template ─────────────────────────────────────────────────────────

function htmlTemplate({ title, bodyHtml, rootPrefix, outFile }) {
  const r = rootPrefix;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <style>
    :root {
      --bs-body-font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', 'Yu Gothic', sans-serif;
      --accent: #0d6efd;
    }
    body { background: #f8f9fa; color: #212529; }
    .content-wrapper { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

    /* Typography */
    h1 { font-size: 1.9rem; font-weight: 700; color: #0d1117; border-bottom: 3px solid var(--accent); padding-bottom: .5rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1.45rem; font-weight: 600; color: #0d6efd; margin-top: 2.5rem; margin-bottom: 1rem; padding-left: .75rem; border-left: 4px solid #0d6efd; }
    h3 { font-size: 1.15rem; font-weight: 600; color: #198754; margin-top: 1.75rem; margin-bottom: .75rem; }
    h4 { font-size: 1rem; font-weight: 600; color: #6f42c1; margin-top: 1.25rem; }

    /* Horizontal rule as slide separator */
    hr { border: none; border-top: 2px dashed #dee2e6; margin: 2.5rem 0; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 1rem 0 1.5rem; font-size: .9rem; }
    thead tr { background: #0d6efd; color: #fff; }
    thead th { padding: .6rem .75rem; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f1f3f5; }
    tbody tr:hover { background: #dbe9ff; }
    td, th { padding: .5rem .75rem; border: 1px solid #dee2e6; vertical-align: top; }

    /* Code */
    code { background: #e9ecef; color: #d63384; padding: .15em .4em; border-radius: .25rem; font-size: .875em; font-family: 'Consolas', 'Courier New', monospace; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 1.25rem 1.5rem; border-radius: .5rem; overflow-x: auto; font-size: .85rem; line-height: 1.6; margin: 1rem 0 1.5rem; }
    pre code { background: none; color: inherit; padding: 0; font-size: inherit; }

    /* Blockquote */
    blockquote { background: #fff3cd; border-left: 4px solid #ffc107; padding: .75rem 1.25rem; margin: 1rem 0; border-radius: 0 .375rem .375rem 0; color: #664d03; }
    blockquote p { margin: 0; }

    /* Lists */
    ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
    li { margin-bottom: .3rem; line-height: 1.7; }

    /* Inline elements */
    strong { color: #0d1117; }
    p { line-height: 1.8; margin-bottom: 1rem; }

    /* Slide title badge */
    h2::before { content: ""; }

    /* Breadcrumb area */
    .page-header { background: #fff; border-bottom: 1px solid #dee2e6; padding: .6rem 0; margin-bottom: 0; }
    .page-header .container-fluid { max-width: 960px; margin: 0 auto; }

    /* Navbar active state override */
    .navbar .nav-link:hover { color: #ffc107 !important; }

    /* Responsive table wrapper */
    .table-responsive-wrapper { overflow-x: auto; }
    @media (max-width: 767px) {
      .content-wrapper { padding: 1rem .75rem 3rem; }
      h1 { font-size: 1.4rem; }
      h2 { font-size: 1.2rem; }
      pre { font-size: .78rem; padding: 1rem; }
    }
  </style>
</head>
<body>
  ${navbar(rootPrefix)}

  <div class="content-wrapper">
    ${bodyHtml}
    ${lessonNav(outFile)}
  </div>

  <footer class="bg-dark text-secondary text-center py-3 mt-5" style="font-size:.85rem;">
    Osaka Training — Design Course &nbsp;|&nbsp; 要件定義書 &amp; 基本設計書
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

// ─── Markdown preprocessing ────────────────────────────────────────────────

function preprocessMarkdown(src, srcFile) {
  // Strip VitePress frontmatter
  let content = src.replace(/^---[\s\S]*?---\n/, '');

  // Wrap tables in responsive div
  // (handled post-conversion)

  return content;
}

function postprocessHtml(html) {
  // Wrap every <table> in a responsive div
  html = html.replace(/<table>/g, '<div class="table-responsive-wrapper"><table class="table table-bordered table-hover table-sm">');
  html = html.replace(/<\/table>/g, '</table></div>');
  return html;
}

// ─── Build ─────────────────────────────────────────────────────────────────

marked.setOptions({ gfm: true, breaks: false });

// Ensure output dirs exist
[
  OUTPUT_DIR,
  path.join(OUTPUT_DIR, 'yokenteigi'),
  path.join(OUTPUT_DIR, 'basicdesign'),
].forEach(d => fs.mkdirSync(d, { recursive: true }));

let built = 0;
let errors = 0;

PAGES.forEach(({ src, out, title }) => {
  const srcPath = path.join(__dirname, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠ SKIP (not found): ${src}`);
    return;
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const mdContent = preprocessMarkdown(raw, src);
  let bodyHtml = marked.parse(mdContent);
  bodyHtml = postprocessHtml(bodyHtml);

  // Root prefix: files in subdirs need '../', root files use ''
  const depth = out.split('/').length - 1;
  const rootPrefix = depth > 0 ? '../' : '';

  const html = htmlTemplate({ title, bodyHtml, rootPrefix, outFile: out });
  const outPath = path.join(OUTPUT_DIR, out);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`  ✓ ${out}`);
  built++;
});

console.log(`\n✅ Done — ${built} pages built → docs-html/`);
if (errors > 0) console.warn(`   ${errors} errors`);
