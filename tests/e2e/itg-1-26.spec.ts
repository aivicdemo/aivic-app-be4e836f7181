import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("優先度決定支援機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('全項目選択で優先度分析が正常実行', async ({ page }) => {
    // SCEN-647
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="select-all-analysis-items"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="priority-report"]')).toBeVisible();
  });

  test('期間選択変更で分析結果が更新', async ({ page }) => {
    // SCEN-648
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="period-selector"]', '3months');
    const result1 = await page.textContent('[data-testid="analysis-result"]');
    await page.selectOption('[data-testid="period-selector"]', '6months');
    await expect(page.locator('[data-testid="analysis-result"]')).not.toHaveText(result1);
  });

  test('志望校複数選択で優先度算出', async ({ page }) => {
    // SCEN-649
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="school-selector"]', ['school1', 'school2', 'school3']);
    await page.click('[data-testid="calculate-priority"]');
    await expect(page.locator('[data-testid="priority-ranking"]')).toBeVisible();
  });

  test('科目別ランキングが正しく表示', async ({ page }) => {
    // SCEN-650
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="subject-ranking-option"]');
    await page.click('[data-testid="show-ranking"]');
    await expect(page.locator('[data-testid="subject-ranking-list"]')).toBeVisible();
  });

  test('優先度スコアが適切に計算表示', async ({ page }) => {
    // SCEN-651
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="calculate-priority-score"]');
    await expect(page.locator('[data-testid="priority-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-breakdown"]')).toBeVisible();
  });

  test('改善必要度インジケーター動作', async ({ page }) => {
    // SCEN-652
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="improvement-indicator"]');
    await page.hover('[data-testid="improvement-indicator"]');
    await expect(page.locator('[data-testid="indicator-tooltip"]')).toBeVisible();
  });

  test('偏差値差分が正確に表示', async ({ page }) => {
    // SCEN-653
    await page.click('[data-testid="priority-support-menu"]');
    await expect(page.locator('[data-testid="deviation-difference"]')).toBeVisible();
    await expect(page.locator('[data-testid="deviation-difference"]')).toContainText(/[+\-]\d+/);
  });

  test('合格ライン到達度バー表示', async ({ page }) => {
    // SCEN-654
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="school-selector"]', 'school1');
    await expect(page.locator('[data-testid="achievement-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="achievement-percentage"]')).toBeVisible();
  });

  test('学習時間配分円グラフ描画', async ({ page }) => {
    // SCEN-655
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="chart-type"]', 'pie');
    await page.click('[data-testid="show-chart"]');
    await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible();
  });

  test('緊急度アラートアイコン表示', async ({ page }) => {
    // SCEN-656
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="urgency-alert-icon"]');
    await expect(page.locator('[data-testid="urgency-details"]')).toBeVisible();
  });

  test('詳細分析結果が展開表示', async ({ page }) => {
    // SCEN-657
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="detailed-analysis"]');
    await expect(page.locator('[data-testid="expanded-analysis"]')).toBeVisible();
  });

  test('分野別弱点一覧が表示', async ({ page }) => {
    // SCEN-658
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="weakness-list"]')).toBeVisible();
  });

  test('期間未選択で分析実行エラー', async ({ page }) => {
    // SCEN-659
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="period-error"]')).toBeVisible();
  });

  test('志望校未選択で実行失敗', async ({ page }) => {
    // SCEN-660
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="execute-priority"]');
    await expect(page.locator('[data-testid="school-error"]')).toContainText('志望校が選択されていません');
  });

  test('成績データ不足でエラー表示', async ({ page }) => {
    // SCEN-661
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="data-shortage-error"]')).toBeVisible();
  });

  test('分析処理タイムアウトエラー', async ({ page }) => {
    // SCEN-662
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="detailed-analysis-mode"]');
    await page.click('[data-testid="start-analysis"]');
    await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible({ timeout: 35000 });
  });

  test('サーバーエラー時の表示', async ({ page }) => {
    // SCEN-663
    await page.route('**/api/priority/**', route => route.fulfill({ status: 500 }));
    await page.click('[data-testid="priority-support-menu"]');
    await expect(page.locator('[data-testid="server-error"]')).toBeVisible();
  });

  test('不正な期間選択でエラー', async ({ page }) => {
    // SCEN-664
    await page.click('[data-testid="priority-support-menu"]');
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-05-01');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('終了日は開始日より後の日付');
  });

  test('存在しない志望校選択エラー', async ({ page }) => {
    // SCEN-665
    await page.click('[data-testid="priority-support-menu"]');
    await page.fill('[data-testid="school-search"]', '存在しない学校名');
    await page.click('[data-testid="add-school"]');
    await expect(page.locator('[data-testid="invalid-school-error"]')).toBeVisible();
  });

  test('詳細展開時のデータ取得失敗', async ({ page }) => {
    // SCEN-666
    await page.route('**/api/details/**', route => route.abort());
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="expand-details"]');
    await expect(page.locator('[data-testid="data-fetch-error"]')).toBeVisible();
  });

  test('最短期間での分析実行', async ({ page }) => {
    // SCEN-667
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="period-selector"]', '1day');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="limited-data-warning"]')).toBeVisible();
  });

  test('最長期間での分析処理', async ({ page }) => {
    // SCEN-668
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="period-selector"]', 'all');
    await page.click('[data-testid="start-analysis"]');
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 60000 });
  });

  test('志望校1校のみ選択時', async ({ page }) => {
    // SCEN-669
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="school-selector"]', 'school1');
    await page.click('[data-testid="decide-priority"]');
    await expect(page.locator('[data-testid="single-school-message"]')).toContainText('最優先志望校に設定');
  });

  test('志望校上限数選択での処理', async ({ page }) => {
    // SCEN-670
    await page.click('[data-testid="priority-support-menu"]');
    await page.selectOption('[data-testid="school-selector"]', ['school1', 'school2', 'school3', 'school4', 'school5']);
    await page.click('[data-testid="add-more-school"]');
    await expect(page.locator('[data-testid="school-limit-error"]')).toBeVisible();
  });

  test('成績データ最小件数での分析', async ({ page }) => {
    // SCEN-671
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="minimum-data-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="tentative-recommendation"]')).toBeVisible();
  });

  test('全科目満点時の優先度算出', async ({ page }) => {
    // SCEN-672
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="calculate-priority"]');
    await expect(page.locator('[data-testid="perfect-score-message"]')).toBeVisible();
  });

  test('全科目最低点時の表示', async ({ page }) => {
    // SCEN-673
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="execute-priority"]');
    await expect(page.locator('[data-testid="minimum-score-message"]')).toBeVisible();
  });

  test('同一優先度スコア時の表示', async ({ page }) => {
    // SCEN-674
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="execute-priority"]');
    await expect(page.locator('[data-testid="same-score-items"]')).toBeVisible();
  });

  test('弱点分野0件時の一覧表示', async ({ page }) => {
    // SCEN-675
    await page.click('[data-testid="priority-support-menu"]');
    await page.click('[data-testid="weakness-list"]');
    await expect(page.locator('[data-testid="no-weakness-message"]')).toContainText('弱点分野はありません');
  });
});