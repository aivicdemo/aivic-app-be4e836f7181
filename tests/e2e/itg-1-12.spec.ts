import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("通知管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('成績更新通知スイッチを有効にできる', async ({ page }) => {
    // SCEN-288
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await expect(page.locator('[data-testid="grade-update-switch"]')).toHaveAttribute('aria-checked', 'false');
    await page.click('[data-testid="grade-update-switch"]');
    await expect(page.locator('[data-testid="grade-update-switch"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('模試結果通知スイッチを無効にできる', async ({ page }) => {
    // SCEN-289
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await expect(page.locator('[data-testid="mock-exam-switch"]')).toHaveAttribute('aria-checked', 'true');
    await page.click('[data-testid="mock-exam-switch"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="mock-exam-switch"]')).toHaveAttribute('aria-checked', 'false');
  });

  test('偏差値変動通知を切り替えできる', async ({ page }) => {
    // SCEN-290
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="deviation-change-switch"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="deviation-change-switch"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('合格可能性変動通知を設定できる', async ({ page }) => {
    // SCEN-291
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="admission-probability-switch"]');
    await page.selectOption('[data-testid="change-threshold"]', '5');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('模試日程リマインダーを有効化できる', async ({ page }) => {
    // SCEN-292
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="mock-exam-reminder-switch"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="mock-exam-reminder-switch"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('通知タイミングを即時に設定できる', async ({ page }) => {
    // SCEN-293
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.selectOption('[data-testid="notification-timing"]', 'immediate');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('通知タイミングを日次に変更できる', async ({ page }) => {
    // SCEN-294
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.selectOption('[data-testid="notification-timing"]', 'daily');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="notification-timing"]')).toHaveValue('daily');
  });

  test('通知タイミングを週次に設定できる', async ({ page }) => {
    // SCEN-295
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.selectOption('[data-testid="notification-timing"]', 'weekly');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="notification-timing"]')).toHaveValue('weekly');
  });

  test('アプリ内通知を選択できる', async ({ page }) => {
    // SCEN-296
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="in-app-notification-switch"]');
    await page.click('[data-testid="grade-update-checkbox"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="in-app-notification-switch"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('メール通知を有効にできる', async ({ page }) => {
    // SCEN-297
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="email-notification-switch"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="email-notification-switch"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('SMS通知を設定できる', async ({ page }) => {
    // SCEN-298
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="sms-notification-switch"]');
    await page.fill('[data-testid="phone-number"]', '09012345678');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('複数通知方法を同時選択できる', async ({ page }) => {
    // SCEN-299
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="push-notification-checkbox"]');
    await page.click('[data-testid="email-notification-checkbox"]');
    await page.click('[data-testid="sms-notification-checkbox"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('偏差値変動閾値に5を入力できる', async ({ page }) => {
    // SCEN-300
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="deviation-threshold"]', '5');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="deviation-threshold"]')).toHaveValue('5');
  });

  test('合格可能性変動閾値に10を設定', async ({ page }) => {
    // SCEN-301
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="admission-probability-threshold"]', '10');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="admission-probability-threshold"]')).toHaveValue('10');
  });

  test('通知時間を9:00に設定できる', async ({ page }) => {
    // SCEN-302
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="notification-time"]', '09:00');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="notification-time"]')).toHaveValue('09:00');
  });

  test('通知履歴一覧が表示される', async ({ page }) => {
    // SCEN-303
    await page.click('[data-testid="notification-management"]');
    await page.click('[data-testid="notification-history-tab"]');
    await expect(page.locator('[data-testid="notification-history-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-item"]').first()).toBeVisible();
  });

  test('通知詳細内容を確認できる', async ({ page }) => {
    // SCEN-304
    await page.click('[data-testid="notification-list"]');
    await page.click('[data-testid="notification-item"]');
    await expect(page.locator('[data-testid="notification-detail-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-detail-content"]')).toBeVisible();
  });

  test('全設定を保存できる', async ({ page }) => {
    // SCEN-305
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="grade-update-switch"]');
    await page.selectOption('[data-testid="notification-frequency"]', 'daily');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('設定を保存しました');
  });

  test('偏差値閾値に文字入力でエラー', async ({ page }) => {
    // SCEN-306
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="deviation-threshold"]', 'abc');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('数値を入力してください');
  });

  test('合格可能性閾値に負数でエラー', async ({ page }) => {
    // SCEN-307
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="admission-probability-threshold"]', '-10');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('0以上の数値を入力してください');
  });

  test('通知方法未選択で保存エラー', async ({ page }) => {
    // SCEN-308
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.click('[data-testid="grade-update-checkbox"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('通知方法を選択してください');
  });

  test('不正な時間形式でエラー表示', async ({ page }) => {
    // SCEN-309
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="notification-time"]', '25:70');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('偏差値閾値0で境界値確認', async ({ page }) => {
    // SCEN-310
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="deviation-threshold"]', '0');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="deviation-threshold"]')).toHaveValue('0');
  });

  test('偏差値閾値100で境界値確認', async ({ page }) => {
    // SCEN-311
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="deviation-threshold"]', '100');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="deviation-threshold"]')).toHaveValue('100');
  });

  test('合格可能性閾値0で境界値確認', async ({ page }) => {
    // SCEN-312
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="admission-probability-threshold"]', '0');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="admission-probability-threshold"]')).toHaveValue('0');
  });

  test('合格可能性閾値100で境界値確認', async ({ page }) => {
    // SCEN-313
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="admission-probability-threshold"]', '100');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="admission-probability-threshold"]')).toHaveValue('100');
  });

  test('通知時間00:00で境界値確認', async ({ page }) => {
    // SCEN-314
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="notification-time"]', '00:00');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="notification-time"]')).toHaveValue('00:00');
  });

  test('通知時間23:59で境界値確認', async ({ page }) => {
    // SCEN-315
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notification-settings"]');
    await page.fill('[data-testid="notification-time"]', '23:59');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="notification-time"]')).toHaveValue('23:59');
  });
});