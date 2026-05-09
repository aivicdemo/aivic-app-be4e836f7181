import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績分析機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test("期間選択で成績データが正しく表示", async ({ page }) => {
    // SCEN-793
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="grade-chart"]')).toBeVisible();
  });

  test("全科目選択で分析結果が表示", async ({ page }) => {
    // SCEN-794
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="select-all-subjects"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();
  });

  test("模試種別選択で該当データ表示", async ({ page }) => {
    // SCEN-795
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="exam-type-dropdown"]');
    await page.click('[data-testid="national-unified-exam"]');
    await expect(page.locator('[data-testid="exam-data"]')).toBeVisible();
  });

  test("偏差値推移グラフが正常描画", async ({ page }) => {
    // SCEN-796
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="deviation-graph-option"]');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
  });

  test("科目別レーダーチャート表示", async ({ page }) => {
    // SCEN-797
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="radar-chart-tab"]');
    await page.click('[data-testid="show-radar-chart"]');
    await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
  });

  test("志望校合格可能性一覧表示", async ({ page }) => {
    // SCEN-798
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="admission-probability-tab"]');
    await expect(page.locator('[data-testid="admission-probability-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="probability-percentage"]')).toBeVisible();
  });

  test("成績サマリーカード表示確認", async ({ page }) => {
    // SCEN-799
    await page.click('[data-testid="grade-analysis-menu"]');
    await expect(page.locator('[data-testid="grade-summary-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-grades"]')).toBeVisible();
  });

  test("前回比較データが正しく表示", async ({ page }) => {
    // SCEN-800
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="previous-comparison-tab"]');
    await expect(page.locator('[data-testid="comparison-data"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-difference"]')).toBeVisible();
  });

  test("弱点科目アラートが適切表示", async ({ page }) => {
    // SCEN-801
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="weak-subject-analysis-tab"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="weak-subject-alert"]')).toBeVisible();
  });

  test("学習アドバイスパネル表示", async ({ page }) => {
    // SCEN-802
    await page.click('[data-testid="grade-analysis-menu"]');
    await expect(page.locator('[data-testid="learning-advice-panel"]')).toBeVisible();
    await page.click('[data-testid="view-details-button"]');
    await expect(page.locator('[data-testid="advice-details"]')).toBeVisible();
  });

  test("データ更新日時が正確表示", async ({ page }) => {
    // SCEN-803
    await page.click('[data-testid="grade-analysis-menu"]');
    await expect(page.locator('[data-testid="data-update-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-update-time"]')).toContainText(/\d{4}年\d{2}月\d{2}日/);
  });

  test("グラフ表示切替タブ動作確認", async ({ page }) => {
    // SCEN-804
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="line-chart-tab"]');
    await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();
    await page.click('[data-testid="bar-chart-tab"]');
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();
  });

  test("科目未選択時のエラー表示", async ({ page }) => {
    // SCEN-805
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('科目を選択してください');
  });

  test("データ未取得時のエラー処理", async ({ page }) => {
    // SCEN-806
    await page.route('**/api/grades**', route => route.abort());
    await page.click('[data-testid="grade-analysis-menu"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('成績データの取得に失敗しました');
  });

  test("無効期間選択時のエラー表示", async ({ page }) => {
    // SCEN-807
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-05-01');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('終了日は開始日以降の日付を選択してください');
  });

  test("グラフ描画失敗時のエラー処理", async ({ page }) => {
    // SCEN-808
    await page.route('**/api/chart**', route => route.abort());
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('グラフの表示に失敗しました');
  });

  test("ネットワークエラー時の表示", async ({ page }) => {
    // SCEN-809
    await page.context().setOffline(true);
    await page.click('[data-testid="grade-analysis-menu"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワーク接続を確認してください');
  });

  test("期間選択境界値での表示確認", async ({ page }) => {
    // SCEN-810
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();
  });

  test("科目選択上限数での動作確認", async ({ page }) => {
    // SCEN-811
    await page.click('[data-testid="grade-analysis-menu"]');
    for (let i = 0; i < 10; i++) {
      await page.click(`[data-testid="subject-${i}"]`);
    }
    await expect(page.locator('[data-testid="max-selection-message"]')).toBeVisible();
  });

  test("データ0件時の画面表示", async ({ page }) => {
    // SCEN-812
    await page.route('**/api/grades**', route => route.fulfill({ json: [] }));
    await page.click('[data-testid="grade-analysis-menu"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('成績データがありません');
  });

  test("最大データ数時の表示確認", async ({ page }) => {
    // SCEN-813
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.click('[data-testid="all-period-select"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible({ timeout: 10000 });
  });

  test("画面リサイズ時のレスポンス", async ({ page }) => {
    // SCEN-814
    await page.click('[data-testid="grade-analysis-menu"]');
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="grade-analysis-container"]')).toBeVisible();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="grade-analysis-container"]')).toBeVisible();
  });
});