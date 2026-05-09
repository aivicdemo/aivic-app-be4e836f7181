import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("科目別成績分析", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-141: 科目選択で該当科目の成績が表示', async ({ page }) => {
    // SCEN-141
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-dropdown"]');
    await page.click('[data-testid="subject-math"]');
    await expect(page.locator('[data-testid="math-scores"]')).toBeVisible();
    await expect(page.locator('[data-testid="other-subjects"]')).not.toBeVisible();
  });

  test('SCEN-142: 分析期間設定で指定範囲の成績が表示', async ({ page }) => {
    // SCEN-142
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="score-data"]')).toBeVisible();
  });

  test('SCEN-143: 偏差値推移グラフが正常に描画', async ({ page }) => {
    // SCEN-143
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await page.click('[data-testid="deviation-graph-tab"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toBeVisible();
  });

  test('SCEN-144: 得点推移チャートが正常に描画', async ({ page }) => {
    // SCEN-144
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await expect(page.locator('[data-testid="score-trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-y-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('SCEN-145: 全国平均との比較が正確に表示', async ({ page }) => {
    // SCEN-145
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await page.check('[data-testid="national-average-compare"]');
    await expect(page.locator('[data-testid="national-average-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-score-value"]')).toBeVisible();
  });

  test('SCEN-146: 志望校合格ライン比較バーが表示', async ({ page }) => {
    // SCEN-146
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await page.selectOption('[data-testid="target-school-select"]', 'first-choice');
    await page.check('[data-testid="passing-line-display"]');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="passing-line-bar"]')).toBeVisible();
  });

  test('SCEN-147: 分野別正答率レーダーチャート描画', async ({ page }) => {
    // SCEN-147
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await page.click('[data-testid="radar-chart-tab"]');
    await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="radar-chart-legend"]')).toBeVisible();
  });

  test('SCEN-148: 弱点分野ランキング表が正常表示', async ({ page }) => {
    // SCEN-148
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await page.click('[data-testid="weakness-ranking-tab"]');
    await expect(page.locator('[data-testid="weakness-ranking-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="weakness-ranking-table"] tbody tr')).toHaveCount({ min: 1 });
  });

  test('SCEN-149: 成績トレンド表示が正常動作', async ({ page }) => {
    // SCEN-149
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await page.click('[data-testid="trend-display-tab"]');
    await page.selectOption('[data-testid="period-select"]', '6months');
    await expect(page.locator('[data-testid="trend-graph"]')).toBeVisible();
  });

  test('SCEN-150: 模試別成績比較テーブル表示', async ({ page }) => {
    // SCEN-150
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="mock-exam-comparison-tab"]');
    await page.check('[data-testid="mock-exam-1"]');
    await page.check('[data-testid="mock-exam-2"]');
    await page.click('[data-testid="compare-button"]');
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
  });

  test('SCEN-151: 予備校成績連携状況が正常表示', async ({ page }) => {
    // SCEN-151
    await page.click('[data-testid="subject-analysis-menu"]');
    await expect(page.locator('[data-testid="prep-school-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('連携済み');
  });

  test('SCEN-152: 科目別順位変動グラフが描画', async ({ page }) => {
    // SCEN-152
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await page.click('[data-testid="rank-change-graph-tab"]');
    await page.selectOption('[data-testid="period-type"]', 'monthly');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="rank-change-chart"]')).toBeVisible();
  });

  test('SCEN-153: 存在しない科目選択でエラー表示', async ({ page }) => {
    // SCEN-153
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.fill('[data-testid="subject-input"]', '架空科目');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('選択された科目が存在しません');
    await expect(page.locator('[data-testid="subject-selection"]')).toBeVisible();
  });

  test('SCEN-154: 未来日付設定でエラーメッセージ', async ({ page }) => {
    // SCEN-154
    await page.click('[data-testid="subject-analysis-menu"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('[data-testid="start-date"]', tomorrow.toISOString().split('T')[0]);
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('未来の日付は設定できません');
  });

  test('SCEN-155: データ取得失敗時のエラー処理', async ({ page }) => {
    // SCEN-155
    await page.route('**/api/scores/**', route => route.abort());
    await page.click('[data-testid="subject-analysis-menu"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('成績データの取得に失敗しました');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-156: グラフ描画失敗時のフォールバック', async ({ page }) => {
    // SCEN-156
    await page.route('**/api/chart/**', route => route.abort());
    await page.click('[data-testid="subject-analysis-menu"]');
    await expect(page.locator('[data-testid="fallback-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-error-message"]')).toContainText('データを読み込めませんでした');
  });

  test('SCEN-157: ネットワーク切断時のエラー表示', async ({ page }) => {
    // SCEN-157
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.route('**/*', route => route.abort());
    await page.reload();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('ネットワーク接続を確認してください');
  });

  test('SCEN-158: 予備校連携エラー時の代替表示', async ({ page }) => {
    // SCEN-158
    await page.route('**/api/prep-school/**', route => route.abort());
    await page.click('[data-testid="subject-analysis-menu"]');
    await expect(page.locator('[data-testid="prep-school-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="local-data-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="basic-analysis"]')).toBeVisible();
  });

  test('SCEN-159: 期間設定で開始日=終了日の境界値', async ({ page }) => {
    // SCEN-159
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="single-day-data"], [data-testid="no-data-message"]')).toBeVisible();
  });

  test('SCEN-160: 最大期間範囲設定での動作確認', async ({ page }) => {
    // SCEN-160
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.selectOption('[data-testid="period-range"]', 'all');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="max-range-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="zoom-controls"]')).toBeVisible();
  });

  test('SCEN-161: データ0件時の画面表示', async ({ page }) => {
    // SCEN-161
    await page.click('[data-testid="subject-analysis-menu"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('成績データがありません');
    await expect(page.locator('[data-testid="empty-chart-placeholder"]')).toBeVisible();
  });

  test('SCEN-162: 偏差値100の境界値表示', async ({ page }) => {
    // SCEN-162
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await expect(page.locator('[data-testid="deviation-100-value"]')).toContainText('100');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="rank-info"]')).toBeVisible();
  });

  test('SCEN-163: 得点0点の境界値処理', async ({ page }) => {
    // SCEN-163
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.click('[data-testid="subject-math"]');
    await expect(page.locator('[data-testid="zero-score-data"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="min-score"]')).toContainText('0');
  });

  test('SCEN-164: 大量データ表示時の性能確認', async ({ page }) => {
    // SCEN-164
    const start = Date.now();
    await page.click('[data-testid="subject-analysis-menu"]');
    await page.selectOption('[data-testid="subject-select"]', 'large-data-subject');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="large-data-chart"]')).toBeVisible({ timeout: 5000 });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });
});