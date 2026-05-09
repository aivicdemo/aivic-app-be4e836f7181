import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績比較・差分分析", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test("SCEN-189: 比較対象選択で成績差分が表示される", async ({ page }) => {
    // SCEN-189
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.selectOption('[data-testid="comparison-target-1"]', 'test-1');
    await page.selectOption('[data-testid="comparison-target-2"]', 'test-2');
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="grade-difference"]')).toBeVisible();
  });

  test("SCEN-190: 比較期間設定で推移チャートが更新される", async ({ page }) => {
    // SCEN-190
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.fill('[data-testid="start-date"]', '2024-01');
    await page.fill('[data-testid="end-date"]', '2024-06');
    await page.click('[data-testid="apply-period"]');
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
  });

  test("SCEN-191: 科目別成績グラフが正しく表示される", async ({ page }) => {
    // SCEN-191
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.selectOption('[data-testid="display-format"]', 'graph');
    await page.fill('[data-testid="target-period"]', '3months');
    await page.click('[data-testid="display-button"]');
    await expect(page.locator('[data-testid="subject-grade-graph"]')).toBeVisible();
  });

  test("SCEN-192: 偏差値推移チャートが描画される", async ({ page }) => {
    // SCEN-192
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.click('[data-testid="deviation-chart-tab"]');
    await page.fill('[data-testid="chart-period"]', '6months');
    await page.click('[data-testid="show-chart"]');
    await expect(page.locator('[data-testid="deviation-trend-chart"]')).toBeVisible();
  });

  test("SCEN-193: 志望校合格可能性表が表示される", async ({ page }) => {
    // SCEN-193
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.click('[data-testid="admission-possibility-tab"]');
    await expect(page.locator('[data-testid="admission-possibility-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-judgment"]')).toBeVisible();
  });

  test("SCEN-194: 前回比増減インジケーターが動作する", async ({ page }) => {
    // SCEN-194
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="increase-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="decrease-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-change-indicator"]')).toBeVisible();
  });

  test("SCEN-195: 科目別強化ポイントが表示される", async ({ page }) => {
    // SCEN-195
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.click('[data-testid="subject-analysis-tab"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="improvement-points"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-recommendations"]')).toBeVisible();
  });

  test("SCEN-196: 模試種別フィルターが機能する", async ({ page }) => {
    // SCEN-196
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.selectOption('[data-testid="exam-type-filter"]', 'national-exam');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
  });

  test("SCEN-197: 比較結果がエクスポートできる", async ({ page }) => {
    // SCEN-197
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.click('[data-testid="execute-comparison"]');
    await page.click('[data-testid="export-button"]');
    await page.selectOption('[data-testid="export-format"]', 'csv');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test("SCEN-198: 詳細分析レポートが表示される", async ({ page }) => {
    // SCEN-198
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.selectOption('[data-testid="comparison-target-1"]', 'previous-test');
    await page.selectOption('[data-testid="comparison-target-2"]', 'current-test');
    await page.click('[data-testid="detailed-analysis-report"]');
    await expect(page.locator('[data-testid="detailed-report"]')).toBeVisible();
  });

  test("SCEN-199: 改善提案アラートが通知される", async ({ page }) => {
    // SCEN-199
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.click('[data-testid="execute-analysis"]');
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="improvement-alert"]')).toBeVisible();
    await expect(page.locator('[data-testid="learning-advice"]')).toBeVisible();
  });

  test("SCEN-200: 同一対象選択でエラー表示される", async ({ page }) => {
    // SCEN-200
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.selectOption('[data-testid="comparison-target-1"]', '2023-exam-1');
    await page.selectOption('[data-testid="comparison-target-2"]', '2023-exam-1');
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('同一の成績データが選択されています');
  });

  test("SCEN-201: 未来日付設定でエラーメッセージ", async ({ page }) => {
    // SCEN-201
    await page.goto(`${BASE_URL}/grade-comparison`);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await page.fill('[data-testid="end-date"]', futureDate.toISOString().split('T')[0]);
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('未来の日付は設定できません');
  });

  test("SCEN-202: データなし期間選択でエラー表示", async ({ page }) => {
    // SCEN-202
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2020-01-31');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('成績データが存在しません');
  });

  test("SCEN-203: ネットワークエラー時の処理確認", async ({ page }) => {
    // SCEN-203
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.route('**/api/grade-comparison', route => route.abort());
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test("SCEN-204: エクスポート失敗時のエラー表示", async ({ page }) => {
    // SCEN-204
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.route('**/api/export', route => route.abort());
    await page.click('[data-testid="execute-comparison"]');
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="export-error"]')).toBeVisible();
  });

  test("SCEN-205: 最小期間1日での比較表示", async ({ page }) => {
    // SCEN-205
    await page.goto(`${BASE_URL}/grade-comparison`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', today);
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="comparison-result"]')).toBeVisible();
  });

  test("SCEN-206: 最大期間3年での比較表示", async ({ page }) => {
    // SCEN-206
    await page.click('[data-testid="menu-grade-comparison"]');
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    await page.fill('[data-testid="start-date"]', threeYearsAgo.toISOString().split('T')[0]);
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="three-year-trend"]')).toBeVisible();
  });

  test("SCEN-207: 模試結果1件のみでの比較", async ({ page }) => {
    // SCEN-207
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.click('[data-testid="single-result-student"]');
    await page.click('[data-testid="comparison-analysis"]');
    await expect(page.locator('[data-testid="insufficient-data-message"]')).toBeVisible();
  });

  test("SCEN-208: 全科目0点データでの差分表示", async ({ page }) => {
    // SCEN-208
    await page.goto(`${BASE_URL}/grade-comparison`);
    await page.selectOption('[data-testid="comparison-target-1"]', 'zero-score-test-1');
    await page.selectOption('[data-testid="comparison-target-2"]', 'zero-score-test-2');
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="zero-difference"]')).toContainText('変化なし');
  });

  test("SCEN-209: 満点データでの比較分析", async ({ page }) => {
    // SCEN-209
    await page.click('[data-testid="menu-grade-comparison"]');
    await page.selectOption('[data-testid="comparison-target-1"]', 'perfect-score-test');
    await page.selectOption('[data-testid="comparison-target-2"]', 'other-test');
    await page.click('[data-testid="execute-comparison"]');
    await expect(page.locator('[data-testid="comparison-result"]')).toBeVisible();
  });

  test("SCEN-210: 大量データ表示時の性能確認", async ({ page }) => {
    // SCEN-210
    await page.goto(`${BASE_URL}/grade-comparison`);
    const startTime = Date.now();
    await page.selectOption('[data-testid="data-range"]', 'large-dataset');
    await page.click('[data-testid="execute-analysis"]');
    await page.waitForSelector('[data-testid="large-data-result"]');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
  });
});