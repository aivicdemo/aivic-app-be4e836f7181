import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("優先度判定処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[data-testid="username"]', 'parent@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseUrl}/dashboard`);
  });

  test('SCEN-439: 受験生選択から優先度判定まで正常実行', async ({ page }) => {
    // SCEN-439
    await page.click('[data-testid="priority-menu"]');
    await page.selectOption('[data-testid="student-select"]', 'student-001');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="priority-result"]')).toBeVisible();
  });

  test('SCEN-440: 判定基準日付変更で結果が更新される', async ({ page }) => {
    // SCEN-440
    await page.click('[data-testid="priority-settings"]');
    await page.fill('[data-testid="base-date"]', '2024-06-01');
    await page.click('[data-testid="save-settings"]');
    await expect(page.locator('[data-testid="updated-priority-result"]')).toBeVisible();
  });

  test('SCEN-441: 複数志望校での優先度判定が正常動作', async ({ page }) => {
    // SCEN-441
    await page.click('[data-testid="school-management"]');
    await page.fill('[data-testid="school-name"]', 'A高校');
    await page.selectOption('[data-testid="priority-select"]', '1');
    await page.click('[data-testid="add-school"]');
    await expect(page.locator('[data-testid="school-priority-list"]')).toContainText('A高校');
  });

  test('SCEN-442: 科目別優先度ランキングが正しく表示', async ({ page }) => {
    // SCEN-442
    await page.click('[data-testid="subject-analysis"]');
    await page.click('[data-testid="priority-ranking"]');
    await expect(page.locator('[data-testid="subject-ranking-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="priority-score"]')).toBeVisible();
  });

  test('SCEN-443: 合格可能性パーセンテージが表示される', async ({ page }) => {
    // SCEN-443
    await page.click('[data-testid="school-assessment"]');
    await page.selectOption('[data-testid="target-school"]', 'school-001');
    await page.click('[data-testid="show-probability"]');
    await expect(page.locator('[data-testid="probability-percentage"]')).toContainText('%');
  });

  test('SCEN-444: 推奨学習時間配分グラフが描画される', async ({ page }) => {
    // SCEN-444
    await page.click('[data-testid="study-plan"]');
    await page.waitForSelector('[data-testid="time-allocation-chart"]');
    await expect(page.locator('[data-testid="time-allocation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('SCEN-445: 緊急度レベルが適切に表示される', async ({ page }) => {
    // SCEN-445
    await page.click('[data-testid="grade-list"]');
    await expect(page.locator('[data-testid="urgency-level"]')).toBeVisible();
    await expect(page.locator('[data-testid="urgency-high"]')).toHaveClass(/high-priority/);
  });

  test('SCEN-446: 次回模試までの日数が正しく表示', async ({ page }) => {
    // SCEN-446
    await page.goto(`${baseUrl}/dashboard`);
    await expect(page.locator('[data-testid="next-test-days"]')).toContainText('日');
    await expect(page.locator('[data-testid="next-test-info"]')).toBeVisible();
  });

  test('SCEN-447: 受験生未選択で判定実行時エラー表示', async ({ page }) => {
    // SCEN-447
    await page.click('[data-testid="priority-menu"]');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('受験生を選択してください');
  });

  test('SCEN-448: 志望校未登録の受験生でエラー表示', async ({ page }) => {
    // SCEN-448
    await page.selectOption('[data-testid="student-select"]', 'student-no-school');
    await page.click('[data-testid="priority-menu"]');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('志望校が登録されていません');
  });

  test('SCEN-449: 成績データなしで判定実行時エラー', async ({ page }) => {
    // SCEN-449
    await page.selectOption('[data-testid="student-select"]', 'student-no-grade');
    await page.click('[data-testid="priority-menu"]');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('成績データが不足');
  });

  test('SCEN-450: ネットワークエラー時の適切な表示', async ({ page }) => {
    // SCEN-450
    await page.setOffline(true);
    await page.click('[data-testid="priority-menu"]');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="network-error"]')).toContainText('接続エラー');
  });

  test('SCEN-451: 判定処理タイムアウト時のエラー処理', async ({ page }) => {
    // SCEN-451
    await page.route('**/api/priority-judgment', route => route.abort());
    await page.click('[data-testid="priority-menu"]');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="timeout-error"]')).toContainText('処理時間が制限を超過');
  });

  test('SCEN-452: 不正な日付選択時のエラーハンドリング', async ({ page }) => {
    // SCEN-452
    await page.click('[data-testid="priority-settings"]');
    await page.fill('[data-testid="base-date"]', '2024/02/30');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('日付の形式が正しくありません');
  });

  test('SCEN-453: 判定基準日付を当日に設定', async ({ page }) => {
    // SCEN-453
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="base-date"]', today);
    await page.click('[data-testid="save-settings"]');
    await expect(page.locator('[data-testid="current-base-date"]')).toContainText(today);
  });

  test('SCEN-454: 判定基準日付を過去1年前に設定', async ({ page }) => {
    // SCEN-454
    await page.fill('[data-testid="base-date"]', '2023-01-01');
    await page.click('[data-testid="save-settings"]');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="priority-result"]')).toBeVisible();
  });

  test('SCEN-455: 偏差値0の科目での優先度判定', async ({ page }) => {
    // SCEN-455
    await page.fill('[data-testid="math-deviation"]', '0');
    await page.fill('[data-testid="english-deviation"]', '60');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="high-priority-subject"]')).toContainText('数学');
  });

  test('SCEN-456: 目標偏差値と現在値が同値の場合', async ({ page }) => {
    // SCEN-456
    await page.fill('[data-testid="current-deviation"]', '60');
    await page.fill('[data-testid="target-deviation"]', '60');
    await page.click('[data-testid="priority-judgment"]');
    await expect(page.locator('[data-testid="priority-level"]')).toContainText('維持');
  });

  test('SCEN-457: 志望校が1校のみの場合の判定', async ({ page }) => {
    // SCEN-457
    await page.click('[data-testid="school-management"]');
    await page.fill('[data-testid="school-name"]', '第一志望高校');
    await page.click('[data-testid="add-school"]');
    await expect(page.locator('[data-testid="first-choice"]')).toContainText('第一志望高校');
  });

  test('SCEN-458: 全科目偏差値が目標を上回る場合', async ({ page }) => {
    // SCEN-458
    await page.fill('[data-testid="all-subjects-deviation"]', '70,75,68,72,69');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="priority-result"]')).toContainText('現状維持');
  });

  test('SCEN-459: 模試まで0日の場合の表示確認', async ({ page }) => {
    // SCEN-459
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="test-date"]', today);
    await page.click('[data-testid="save-test-date"]');
    await expect(page.locator('[data-testid="test-countdown"]')).toContainText('0日');
  });

  test('SCEN-460: 大量の志望校データでの性能確認', async ({ page }) => {
    // SCEN-460
    await page.click('[data-testid="bulk-school-upload"]');
    await page.setInputFiles('[data-testid="csv-upload"]', 'test-data/1000-schools.csv');
    await page.click('[data-testid="execute-priority-button"]');
    await expect(page.locator('[data-testid="priority-complete"]')).toBeVisible({ timeout: 10000 });
  });
});