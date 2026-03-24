import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Osaka - Training - Design Course",
  description: "Khóa học viết tài liệu Yokenteigi & Basic Design",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Yokenteigi', link: '/yokenteigi/' },
      { text: 'Basic Design', link: '/basicdesign/' }
    ],

    sidebar: [
      {
        text: '📋 要件定義書コース',
        items: [
          { text: 'Tổng quan', link: '/yokenteigi/' },
          { text: 'Buổi 1 — Nền tảng Yokenteigi', link: '/yokenteigi/buoi-01' },
          { text: 'Buổi 2 — Cấu trúc tài liệu', link: '/yokenteigi/buoi-02' },
          { text: 'Buổi 3 — 業務フロー & 機能詳細', link: '/yokenteigi/buoi-03' },
          { text: 'Buổi 4 — 非機能要件 & 画面', link: '/yokenteigi/buoi-04' },
          { text: 'Buổi 5 — Kỹ năng ヒアリング', link: '/yokenteigi/buoi-05' },
          { text: 'Buổi 6 — Case Study (Phần 1)', link: '/yokenteigi/buoi-06' },
          { text: 'Buổi 7 — Case Study (Phần 2)', link: '/yokenteigi/buoi-07' },
          { text: 'Buổi 8 — Tốt nghiệp', link: '/yokenteigi/buoi-08' },
          { text: '📅 Lịch học', link: '/schedule-yokenteigi' }
        ]
      },
      {
        text: '🏗️ 基本設計書コース',
        items: [
          { text: 'Tổng quan', link: '/basicdesign/' },
          { text: 'Buổi 1 — Nền tảng & ER図', link: '/basicdesign/buoi-01' },
          { text: 'Buổi 2 — ER図 設計', link: '/basicdesign/buoi-02' },
          { text: 'Buổi 3 — テーブル定義書', link: '/basicdesign/buoi-03' },
          { text: 'Buổi 4 — 画面設計 & Wireframe', link: '/basicdesign/buoi-04' },
          { text: 'Buổi 5 — API設計', link: '/basicdesign/buoi-05' },
          { text: 'Buổi 6 — Batch & Security & Infra', link: '/basicdesign/buoi-06' },
          { text: 'Buổi 7 — Traceability Matrix', link: '/basicdesign/buoi-07' },
          { text: 'Buổi 8 — Tốt nghiệp', link: '/basicdesign/buoi-08' },
          { text: '📅 Lịch học', link: '/schedule-basicdesign' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
