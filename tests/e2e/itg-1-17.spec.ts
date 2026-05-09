import { test, expect } from '@playwright/test';

test.describe("優先度設定画面", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test("SCEN-421: 全科目の優先度を正常に設定できる", async ({ page }) => {
    // SCEN-421
    await page.click('[data-testid="menu-priority-settings"]');
    await page.selectOption('[data-testid="subject-japanese"]', '高');
    await page.selectOption('[data-testid="subject-math"]', '中');
    await page.selectOption('[data-testid="subject-english"]', '高');
    await page.selectOption('[data-testid="subject-science"]', '低');
    await page.selectOption('[data-testid="subject-social"]', '中');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-422: 科目の重要度スライダーを調整できる", async ({ page }) => {
    // SCEN-422
    await page.goto(`${baseURL}/priority-settings`);
    await page.locator('[data-testid="math-slider"]').click({ position: { x: 20, y: 10 } });
    await page.locator('[data-testid="english-slider"]').dragTo(page.locator('[data-testid="english-slider-max"]'));
    await page.locator('[data-testid="japanese-slider"]').click({ position: { x: 100, y: 10 } });
    await page.click('[data-testid="save-settings"]');
    await expect(page.locator('[data-testid="save-confirmation"]')).toBeVisible();
  });

  test("SCEN-423: 模試種別を選択して重要度設定できる", async ({ page }) => {
    // SCEN-423
    await page.click('[data-testid="menu-settings"]');
    await page.click('[data-testid="priority-settings"]');
    await page.selectOption('[data-testid="exam-type-select"]', '全国模試');
    await page.selectOption('[data-testid="importance-level"]', '高');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-424: 志望校順位を調整ボタンで変更できる", async ({ page }) => {
    // SCEN-424
    await page.goto(`${baseURL}/school-management`);
    await page.click('[data-testid="move-up-button"]');
    await page.click('[data-testid="move-down-button"]');
    await page.click('[data-testid="save-order"]');
    await expect(page.locator('[data-testid="order-updated"]')).toBeVisible();
  });

  test("SCEN-425: 分析対象期間をカレンダーで設定できる", async ({ page }) => {
    // SCEN-425
    await page.goto(`${baseURL}/priority-settings`);
    await page.click('[data-testid="start-date-calendar"]');
    await page.click('[data-testid="date-2024-04-01"]');
    await page.click('[data-testid="end-date-calendar"]');
    await page.click('[data-testid="date-2024-06-30"]');
    await page.click('[data-testid="save-period"]');
    await expect(page.locator('[data-testid="period-saved"]')).toBeVisible();
  });

  test("SCEN-426: 通知優先度を変更して保存できる", async ({ page }) => {
    // SCEN-426
    await page.click('[data-testid="menu-settings"]');
    await page.selectOption('[data-testid="notification-priority"]', '中');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-complete-message"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="notification-priority"]')).toHaveValue('中');
  });

  test("SCEN-427: 全設定項目を一括保存できる", async ({ page }) => {
    // SCEN-427
    await page.goto(`${baseURL}/priority-settings`);
    await page.selectOption('[data-testid="math-priority"]', '高');
    await page.selectOption('[data-testid="english-priority"]', '中');
    await page.fill('[data-testid="target-school"]', '東京大学');
    await page.check('[data-testid="score-notification"]');
    await page.click('[data-testid="bulk-save-button"]');
    await expect(page.locator('[data-testid="bulk-save-success"]')).toBeVisible();
  });

  test("SCEN-428: 科目未選択で保存時エラー表示", async ({ page }) => {
    // SCEN-428
    await page.goto(`${baseURL}/priority-settings`);
    await page.selectOption('[data-testid="priority-level"]', '高');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="subject-error"]')).toContainText('科目を選択してください');
  });

  test("SCEN-429: 模試種別未選択で保存時エラー", async ({ page }) => {
    // SCEN-429
    await page.goto(`${baseURL}/priority-settings`);
    await page.selectOption('[data-testid="priority-level"]', '高');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="exam-type-error"]')).toBeVisible();
  });

  test("SCEN-430: 過去日付選択で期間設定エラー", async ({ page }) => {
    // SCEN-430
    await page.goto(`${baseURL}/priority-settings`);
    await page.fill('[data-testid="start-date"]', '2023-01-01');
    await page.fill('[data-testid="end-date"]', '2023-12-31');
    await page.click('[data-testid="save-period"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('本日以降の日付を選択してください');
  });

  test("SCEN-431: 志望校未設定時の順位調整エラー", async ({ page }) => {
    // SCEN-431
    await page.goto(`${baseURL}/school-management`);
    await page.click('[data-testid="priority-adjustment"]');
    await expect(page.locator('[data-testid="school-error"]')).toContainText('志望校が登録されていないため');
  });

  test("SCEN-432: 無効な期間範囲指定でエラー表示", async ({ page }) => {
    // SCEN-432
    await page.goto(`${baseURL}/priority-settings`);
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="save-period"]');
    await expect(page.locator('[data-testid="period-error"]')).toContainText('終了日は開始日より後の日付');
  });

  test("SCEN-433: 重要度最大値設定で正常保存", async ({ page }) => {
    // SCEN-433
    await page.goto(`${baseURL}/priority-settings`);
    await page.fill('[data-testid="importance-value"]', '100');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="importance-value"]')).toHaveValue('100');
  });

  test("SCEN-434: 重要度最小値設定で正常保存", async ({ page }) => {
    // SCEN-434
    await page.click('[data-testid="menu-settings"]');
    await page.click('[data-testid="priority-settings"]');
    await page.fill('[data-testid="importance-value"]', '1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-complete"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="importance-value"]')).toHaveValue('1');
  });

  test("SCEN-435: 科目1つのみ選択で保存確認", async ({ page }) => {
    // SCEN-435
    await page.goto(`${baseURL}/priority-settings`);
    await page.check('[data-testid="subject-math"]');
    await page.selectOption('[data-testid="priority-level"]', '高');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="confirm-yes"]');
    await expect(page.locator('[data-testid="single-subject-success"]')).toBeVisible();
  });

  test("SCEN-436: 分析期間を当日のみ設定可能", async ({ page }) => {
    // SCEN-436
    await page.goto(`${baseURL}/priority-settings`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="analysis-start-date"]', today);
    await page.fill('[data-testid="analysis-end-date"]', today);
    await page.click('[data-testid="save-analysis-period"]');
    await expect(page.locator('[data-testid="analysis-period-saved"]')).toBeVisible();
  });

  test("SCEN-437: 志望校1校のみで順位調整無効", async ({ page }) => {
    // SCEN-437
    await page.goto(`${baseURL}/school-management`);
    await page.click('[data-testid="add-school"]');
    await page.fill('[data-testid="school-search"]', '東京大学');
    await page.click('[data-testid="select-school"]');
    await page.goto(`${baseURL}/priority-settings`);
    await expect(page.locator('[data-testid="move-up-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="move-down-button"]')).toBeDisabled();
  });

  test("SCEN-438: 通知優先度を無効に設定可能", async ({ page }) => {
    // SCEN-438
    await page.click('[data-testid="menu-notification-settings"]');
    await page.click('[data-testid="priority-settings"]');
    await page.selectOption('[data-testid="notification-priority"]', '無効');
    await page.click('[data-testid="save-settings"]');
    await page.goto(`${baseURL}/priority-settings`);
    await expect(page.locator('[data-testid="notification-priority"]')).toHaveValue('無効');
  });
});