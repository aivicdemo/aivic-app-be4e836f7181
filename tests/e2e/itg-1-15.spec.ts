import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("登録状況確認画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-369: 受験生選択で登録状況が正常表示', async ({ page }) => {
    // SCEN-369
    await page.click('[data-testid="menu-registration-status"]');
    await page.click('[data-testid="student-select"]');
    await page.click('[data-testid="student-option-1"]');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="registration-status"]')).toBeVisible();
  });

  test('SCEN-370: サマリーカードが正確に表示', async ({ page }) => {
    // SCEN-370
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="summary-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-count-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-count-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-input-card"]')).toBeVisible();
  });

  test('SCEN-371: 基本情報ステータスが正常表示', async ({ page }) => {
    // SCEN-371
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="basic-info-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="basic-info-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="basic-info-status"]')).toContainText(/登録済み|未登録|編集中/);
  });

  test('SCEN-372: 志望校一覧が正しく表示', async ({ page }) => {
    // SCEN-372
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="school-list-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-rank"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-priority"]')).toBeVisible();
  });

  test('SCEN-373: 模試結果テーブルが正常表示', async ({ page }) => {
    // SCEN-373
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="exam-results-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-name"]')).toBeVisible();
  });

  test('SCEN-374: 予備校データ連携状況表示', async ({ page }) => {
    // SCEN-374
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="prep-school-integration"]')).toBeVisible();
    await expect(page.locator('[data-testid="integration-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
  });

  test('SCEN-375: 最終更新日時が正常表示', async ({ page }) => {
    // SCEN-375
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="last-update-time"]')).toBeVisible();
    const dateText = await page.locator('[data-testid="last-update-time"]').textContent();
    expect(dateText).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
  });

  test('SCEN-376: 登録完了率バーが正常動作', async ({ page }) => {
    // SCEN-376
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="completion-rate-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-percentage"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });

  test('SCEN-377: 編集リンクから遷移成功', async ({ page }) => {
    // SCEN-377
    await page.click('[data-testid="menu-registration-status"]');
    await page.click('[data-testid="edit-link"]');
    await expect(page).toHaveURL(/.*\/edit/);
    await expect(page.locator('[data-testid="edit-form"]')).toBeVisible();
  });

  test('SCEN-378: データ更新ボタンが正常動作', async ({ page }) => {
    // SCEN-378
    await page.click('[data-testid="menu-registration-status"]');
    await page.click('[data-testid="data-refresh-button"]');
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden();
    await expect(page.locator('[data-testid="registration-status"]')).toBeVisible();
  });

  test('SCEN-379: 受験生未選択時の初期状態', async ({ page }) => {
    // SCEN-379
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="student-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="no-student-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="registration-details"]')).toBeHidden();
  });

  test('SCEN-380: データ未登録時の表示', async ({ page }) => {
    // SCEN-380
    await page.route('**/api/registration-data', route => route.fulfill({ json: [] }));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('登録されたデータがありません');
  });

  test('SCEN-381: 登録完了率0%時の表示', async ({ page }) => {
    // SCEN-381
    await page.route('**/api/completion-rate', route => route.fulfill({ json: { rate: 0 } }));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="completion-percentage"]')).toContainText('0%');
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveCSS('width', '0px');
    await expect(page.locator('[data-testid="incomplete-items"]')).toBeVisible();
  });

  test('SCEN-382: 登録完了率100%時の表示', async ({ page }) => {
    // SCEN-382
    await page.route('**/api/completion-rate', route => route.fulfill({ json: { rate: 100 } }));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="completion-percentage"]')).toContainText('100%');
    await expect(page.locator('[data-testid="completion-icon"]')).toBeVisible();
    await expect(page.locator('[data-testid="complete-message"]')).toBeVisible();
  });

  test('SCEN-383: 最大件数の志望校登録状況', async ({ page }) => {
    // SCEN-383
    await page.route('**/api/schools', route => route.fulfill({ json: Array(10).fill({}).map((_, i) => ({ id: i, name: `School ${i}` })) }));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="school-count"]')).toContainText('10件/最大10件');
    await expect(page.locator('[data-testid="add-school-button"]')).toBeDisabled();
  });

  test('SCEN-384: 最大件数の模試結果表示', async ({ page }) => {
    // SCEN-384
    await page.route('**/api/exam-results', route => route.fulfill({ json: Array(100).fill({}).map((_, i) => ({ id: i, name: `Exam ${i}` })) }));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="exam-results-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-row"]')).toHaveCount(20);
  });

  test('SCEN-385: データ取得エラー時の通知', async ({ page }) => {
    // SCEN-385
    await page.route('**/api/registration-data', route => route.abort('failed'));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データを取得できませんでした');
  });

  test('SCEN-386: 受験生データ読み込み失敗', async ({ page }) => {
    // SCEN-386
    await page.route('**/api/students', route => route.abort('failed'));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="student-load-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-387: サーバー接続エラー時の表示', async ({ page }) => {
    // SCEN-387
    await page.route('**/api/**', route => route.abort('failed'));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="connection-error"]')).toContainText('サーバーに接続できません');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-388: 更新処理失敗時のエラー', async ({ page }) => {
    // SCEN-388
    await page.click('[data-testid="menu-registration-status"]');
    await page.route('**/api/update', route => route.abort('failed'));
    await page.click('[data-testid="update-button"]');
    await expect(page.locator('[data-testid="update-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="update-error"]')).toContainText('更新に失敗しました');
  });

  test('SCEN-389: 予備校連携エラー時の表示', async ({ page }) => {
    // SCEN-389
    await page.route('**/api/prep-school-integration', route => route.abort('failed'));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="integration-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="integration-error"]')).toContainText('予備校連携エラー');
    await expect(page.locator('[data-testid="contact-support"]')).toBeVisible();
  });

  test('SCEN-390: タイムアウト時のエラー処理', async ({ page }) => {
    // SCEN-390
    await page.route('**/api/registration-data', route => new Promise(resolve => setTimeout(() => resolve(route.abort('timedout')), 31000)));
    await page.click('[data-testid="menu-registration-status"]');
    await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeout-error"]')).toContainText('タイムアウトが発生しました');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});