import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("申し込み管理画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('[data-testid="username"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test("SCEN-461: 申し込み状況一覧が正常表示される", async ({ page }) => {
    // SCEN-461
    await page.click('[data-testid="application-management"]');
    await expect(page.locator('[data-testid="application-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-name"]')).toBeVisible();
  });

  test("SCEN-462: 模試名フィルターで正常絞り込み", async ({ page }) => {
    // SCEN-462
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="exam-filter"]');
    await page.click('[data-testid="exam-option-first"]');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
  });

  test("SCEN-463: 実施日期間検索で正常抽出", async ({ page }) => {
    // SCEN-463
    await page.goto(`${BASE_URL}/applications`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test("SCEN-464: 申し込み状態で正常絞り込み", async ({ page }) => {
    // SCEN-464
    await page.goto(`${BASE_URL}/applications`);
    await page.selectOption('[data-testid="status-filter"]', 'applied');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="status-applied"]')).toBeVisible();
  });

  test("SCEN-465: 新規申し込みボタンで画面遷移", async ({ page }) => {
    // SCEN-465
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="new-application"]');
    await page.waitForURL('**/applications/new');
    await expect(page.locator('[data-testid="application-form"]')).toBeVisible();
  });

  test("SCEN-466: 申し込み詳細が正常表示される", async ({ page }) => {
    // SCEN-466
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="application-item"]:first-child');
    await expect(page.locator('[data-testid="application-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-info"]')).toBeVisible();
  });

  test("SCEN-467: 申し込みキャンセルが正常実行", async ({ page }) => {
    // SCEN-467
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="cancel-button"]:first-child');
    await page.click('[data-testid="confirm-cancel"]');
    await expect(page.locator('[data-testid="cancel-success"]')).toBeVisible();
  });

  test("SCEN-468: 支払い状況が正確に表示される", async ({ page }) => {
    // SCEN-468
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="payment-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-deadline"]')).toBeVisible();
  });

  test("SCEN-469: 受験票ダウンロードが正常実行", async ({ page }) => {
    // SCEN-469
    await page.goto(`${BASE_URL}/applications`);
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-ticket"]');
    await downloadPromise;
  });

  test("SCEN-470: 申し込み履歴が正常表示される", async ({ page }) => {
    // SCEN-470
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="application-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toBeVisible();
  });

  test("SCEN-471: 通知設定画面へ正常遷移", async ({ page }) => {
    // SCEN-471
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="notification-settings"]');
    await page.waitForURL('**/notifications');
    await expect(page.locator('[data-testid="notification-options"]')).toBeVisible();
  });

  test("SCEN-472: 一括操作チェックで複数選択", async ({ page }) => {
    // SCEN-472
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="select-all"]');
    await expect(page.locator('[data-testid="selected-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeEnabled();
  });

  test("SCEN-473: 存在しない模試名で検索エラー", async ({ page }) => {
    // SCEN-473
    await page.goto(`${BASE_URL}/applications`);
    await page.fill('[data-testid="exam-search"]', '存在しない模試2024');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
  });

  test("SCEN-474: 無効な日付形式でエラー表示", async ({ page }) => {
    // SCEN-474
    await page.goto(`${BASE_URL}/applications/new`);
    await page.fill('[data-testid="application-date"]', '2024/13/45');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="date-error"]')).toBeVisible();
  });

  test("SCEN-475: 権限なし申し込みでエラー", async ({ page }) => {
    // SCEN-475
    await page.goto(`${BASE_URL}/logout`);
    await page.fill('[data-testid="username"]', 'unauthorized@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="permission-error"]')).toBeVisible();
  });

  test("SCEN-476: キャンセル不可状態でエラー", async ({ page }) => {
    // SCEN-476
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="cancel-expired"]');
    await page.click('[data-testid="confirm-cancel"]');
    await expect(page.locator('[data-testid="cancel-error"]')).toBeVisible();
  });

  test("SCEN-477: 存在しない受験票でエラー", async ({ page }) => {
    // SCEN-477
    await page.goto(`${BASE_URL}/applications`);
    await page.fill('[data-testid="ticket-number"]', '99999999');
    await page.click('[data-testid="search-ticket"]');
    await expect(page.locator('[data-testid="ticket-not-found"]')).toBeVisible();
  });

  test("SCEN-478: ネットワークエラー時の表示", async ({ page }) => {
    // SCEN-478
    await page.route('**/*', route => route.abort());
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  });

  test("SCEN-479: 通知設定権限なしエラー", async ({ page }) => {
    // SCEN-479
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="notification-settings"]');
    await expect(page.locator('[data-testid="permission-denied"]')).toBeVisible();
  });

  test("SCEN-480: 空の検索条件で全件表示", async ({ page }) => {
    // SCEN-480
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="all-applications"]')).toBeVisible();
  });

  test("SCEN-481: 日付範囲逆転時の挙動確認", async ({ page }) => {
    // SCEN-481
    await page.goto(`${BASE_URL}/applications`);
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="date-range-error"]')).toBeVisible();
  });

  test("SCEN-482: 申し込み0件時の表示確認", async ({ page }) => {
    // SCEN-482
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="no-applications"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-application"]')).toBeVisible();
  });

  test("SCEN-483: 最大件数表示時の動作確認", async ({ page }) => {
    // SCEN-483
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="application-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test("SCEN-484: 全選択チェックボックス動作", async ({ page }) => {
    // SCEN-484
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="select-all"]');
    await expect(page.locator('[data-testid="item-checkbox"]:checked')).toHaveCount(3);
    await page.click('[data-testid="select-all"]');
    await expect(page.locator('[data-testid="item-checkbox"]:checked')).toHaveCount(0);
  });

  test("SCEN-485: キャンセル期限当日の処理", async ({ page }) => {
    // SCEN-485
    await page.goto(`${BASE_URL}/applications`);
    await page.click('[data-testid="cancel-deadline-today"]');
    await page.click('[data-testid="confirm-cancel"]');
    await expect(page.locator('[data-testid="cancel-success"]')).toBeVisible();
  });

  test("SCEN-486: 支払い期限当日の状態表示", async ({ page }) => {
    // SCEN-486
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="payment-deadline-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="urgent-payment"]')).toHaveClass(/urgent/);
  });

  test("SCEN-487: 長い模試名の表示確認", async ({ page }) => {
    // SCEN-487
    await page.goto(`${BASE_URL}/applications`);
    await expect(page.locator('[data-testid="long-exam-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-name-tooltip"]')).toBeVisible();
  });
});