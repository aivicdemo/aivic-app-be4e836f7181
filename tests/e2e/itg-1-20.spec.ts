import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績推移グラフ画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-488: 期間選択でグラフが正常表示される', async ({ page }) => {
    // SCEN-488
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="period-dropdown"]');
    await page.click('[data-testid="period-3months"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await page.click('[data-testid="period-6months"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await page.click('[data-testid="period-1year"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
  });

  test('SCEN-489: 全科目選択でグラフが表示される', async ({ page }) => {
    // SCEN-489
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.check('[data-testid="all-subjects-checkbox"]');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="legend"]')).toBeVisible();
  });

  test('SCEN-490: 模試種別選択でデータが切替わる', async ({ page }) => {
    // SCEN-490
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="exam-type-dropdown"]');
    await page.click('[data-testid="zentou-exam"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await page.click('[data-testid="shinken-exam"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await page.click('[data-testid="sundai-exam"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
  });

  test('SCEN-491: 偏差値推移グラフが正常描画される', async ({ page }) => {
    // SCEN-491
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="x-axis-label"]')).toContainText('日付');
    await expect(page.locator('[data-testid="y-axis-label"]')).toContainText('偏差値');
    await expect(page.locator('[data-testid="data-points"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('SCEN-492: 合格可能性推移グラフが表示される', async ({ page }) => {
    // SCEN-492
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="pass-probability-option"]');
    await page.fill('[data-testid="period-start"]', '2024-01-01');
    await page.fill('[data-testid="period-end"]', '2024-12-31');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="pass-probability-chart"]')).toBeVisible();
  });

  test('SCEN-493: 志望校合格ラインが正しく表示', async ({ page }) => {
    // SCEN-493
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.selectOption('[data-testid="target-school-select"]', 'tokyo-university');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="pass-line"]')).toBeVisible();
    await expect(page.locator('[data-testid="pass-line-value"]')).toContainText('65');
  });

  test('SCEN-494: グラフ表示切替タブが機能する', async ({ page }) => {
    // SCEN-494
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="subject-tab"]');
    await expect(page.locator('[data-testid="subject-chart"]')).toBeVisible();
    await page.click('[data-testid="deviation-tab"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await page.click('[data-testid="total-tab"]');
    await expect(page.locator('[data-testid="total-chart"]')).toBeVisible();
  });

  test('SCEN-495: データポイントツールチップ表示', async ({ page }) => {
    // SCEN-495
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.hover('[data-testid="data-point-1"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
    await page.hover('[data-testid="data-point-2"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
    await page.hover('[data-testid="chart-title"]');
    await expect(page.locator('[data-testid="tooltip"]')).not.toBeVisible();
  });

  test('SCEN-496: グラフ拡大縮小が正常動作する', async ({ page }) => {
    // SCEN-496
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="zoom-in-button"]');
    await expect(page.locator('[data-testid="chart-area"]')).toHaveAttribute('data-zoom', '1.5');
    await page.click('[data-testid="zoom-out-button"]');
    await expect(page.locator('[data-testid="chart-area"]')).toHaveAttribute('data-zoom', '1.0');
    await page.mouse.wheel(0, -100);
    await expect(page.locator('[data-testid="chart-area"]')).toHaveAttribute('data-zoom', '1.2');
  });

  test('SCEN-497: データ更新日時が正しく表示', async ({ page }) => {
    // SCEN-497
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-updated"]')).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
  });

  test('SCEN-498: PDF出力が正常実行される', async ({ page }) => {
    // SCEN-498
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.selectOption('[data-testid="student-select"]', 'student-1');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    const downloadPromise = page.waitForDownload();
    await page.click('[data-testid="pdf-export-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('SCEN-499: 分析コメントが適切に表示される', async ({ page }) => {
    // SCEN-499
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.selectOption('[data-testid="student-select"]', 'student-1');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="analysis-comment"]')).toBeVisible();
    await expect(page.locator('[data-testid="analysis-comment"]')).toContainText('成績の傾向');
  });

  test('SCEN-500: 科目未選択時にエラーメッセージ', async ({ page }) => {
    // SCEN-500
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('科目を選択してください');
  });

  test('SCEN-501: データ未存在時のエラー表示', async ({ page }) => {
    // SCEN-501
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.selectOption('[data-testid="student-select"]', 'no-data-student');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('表示するデータがありません');
  });

  test('SCEN-502: PDF出力失敗時のエラー処理', async ({ page }) => {
    // SCEN-502
    await page.route('**/api/pdf-export', route => route.abort('failed'));
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="pdf-export-button"]');
    await expect(page.locator('[data-testid="error-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('PDFの出力に失敗しました');
    await page.click('[data-testid="error-ok-button"]');
    await expect(page.locator('[data-testid="error-dialog"]')).not.toBeVisible();
  });

  test('SCEN-503: ネットワークエラー時の表示', async ({ page }) => {
    // SCEN-503
    await page.route('**/api/grade-data', route => route.abort('failed'));
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('データを取得できませんでした');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-504: 無効な期間選択時のエラー', async ({ page }) => {
    // SCEN-504
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-error"]')).toContainText('開始日は終了日より前の日付を選択してください');
  });

  test('SCEN-505: グラフ描画失敗時の代替表示', async ({ page }) => {
    // SCEN-505
    await page.route('**/api/chart-data', route => route.fulfill({ status: 500 }));
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.reload();
    await expect(page.locator('[data-testid="chart-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-error"]')).toContainText('グラフを表示できませんでした');
    await expect(page.locator('[data-testid="alternative-table"]')).toBeVisible();
  });

  test('SCEN-506: 最小期間選択時の表示', async ({ page }) => {
    // SCEN-506
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="period-dropdown"]');
    await page.click('[data-testid="period-minimum"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="axis-labels"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('SCEN-507: 最大期間選択時の表示', async ({ page }) => {
    // SCEN-507
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.click('[data-testid="period-dropdown"]');
    await page.click('[data-testid="period-all"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-points"]')).toBeVisible();
    await expect(page.locator('[data-testid="axis-labels"]')).toBeVisible();
  });

  test('SCEN-508: 単科目のみ選択時の表示', async ({ page }) => {
    // SCEN-508
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.uncheck('[data-testid="all-subjects-checkbox"]');
    await page.check('[data-testid="math-checkbox"]');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-title"]')).toContainText('数学');
  });

  test('SCEN-509: データポイント1件時の表示', async ({ page }) => {
    // SCEN-509
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.selectOption('[data-testid="student-select"]', 'single-data-student');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-point"]')).toHaveCount(1);
    await page.hover('[data-testid="data-point"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
  });

  test('SCEN-510: グラフ最大拡大時の表示', async ({ page }) => {
    // SCEN-510
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="zoom-in-button"]');
    }
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-points"]')).toBeVisible();
    await page.click('[data-testid="zoom-in-button"]');
  });

  test('SCEN-511: グラフ最小縮小時の表示', async ({ page }) => {
    // SCEN-511
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="zoom-out-button"]');
    }
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="axis-labels"]')).toBeVisible();
    await page.click('[data-testid="zoom-out-button"]');
  });

  test('SCEN-512: 画面サイズ変更時のレスポンシブ', async ({ page }) => {
    // SCEN-512
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
  });

  test('SCEN-513: 同一偏差値データ複数時の表示', async ({ page }) => {
    // SCEN-513
    await page.goto(`${BASE_URL}/grade-progress-graph`);
    await page.selectOption('[data-testid="student-select"]', 'same-deviation-student');
    await page.selectOption('[data-testid="period-select"]', 'all');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await page.hover('[data-testid="overlapped-point"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
    await expect(page.locator('[data-testid="tooltip"]')).toContainText('テスト名');
  });
});