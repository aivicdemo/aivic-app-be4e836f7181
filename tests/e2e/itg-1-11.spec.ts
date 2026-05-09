import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("データ統合管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('#username', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test('データソース選択して統合実行', async ({ page }) => {
    // SCEN-262
    await page.goto(`${baseURL}/data-integration`);
    await page.check('#datasource-school');
    await page.check('#datasource-mock-test');
    await page.click('#integration-execute');
    await expect(page.locator('#progress-bar')).toBeVisible();
  });

  test('期間指定して統合データ取得', async ({ page }) => {
    // SCEN-263
    await page.goto(`${baseURL}/data-integration`);
    await page.fill('#start-date', '2024-01-01');
    await page.fill('#end-date', '2024-03-31');
    await page.click('#get-integration-data');
    await expect(page.locator('#integration-result')).toBeVisible();
  });

  test('予備校データ取得状況確認', async ({ page }) => {
    // SCEN-264
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#prep-school-status');
    await expect(page.locator('#status-table')).toBeVisible();
    await expect(page.locator('.status-column')).toContainText('成功');
  });

  test('模試結果データ取得状況表示', async ({ page }) => {
    // SCEN-265
    await page.goto(`${baseURL}/data-management`);
    await page.click('#mock-test-status');
    await expect(page.locator('#mock-status-list')).toBeVisible();
    await expect(page.locator('.status-indicator')).toBeVisible();
  });

  test('統合進捗がリアルタイム更新', async ({ page }) => {
    // SCEN-266
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#start-integration');
    await expect(page.locator('#progress-bar')).toBeVisible();
    await page.waitForTimeout(2000);
    await expect(page.locator('#progress-percentage')).not.toContainText('0%');
  });

  test('データ重複チェック結果表示', async ({ page }) => {
    // SCEN-267
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#duplicate-check');
    await page.click('#execute-check');
    await expect(page.locator('#duplicate-results')).toBeVisible();
    await expect(page.locator('#duplicate-count')).toBeVisible();
  });

  test('手動データ補正で統合完了', async ({ page }) => {
    // SCEN-268
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#manual-correction');
    await page.fill('#correction-field', '補正データ');
    await page.click('#complete-integration');
    await expect(page.locator('#integration-complete')).toBeVisible();
  });

  test('統合完了通知メッセージ表示', async ({ page }) => {
    // SCEN-269
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#start-integration');
    await page.waitForSelector('#completion-message', { timeout: 30000 });
    await expect(page.locator('#completion-message')).toContainText('統合が正常に完了');
  });

  test('統合履歴がテーブル表示', async ({ page }) => {
    // SCEN-270
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#integration-history');
    await expect(page.locator('#history-table')).toBeVisible();
    await expect(page.locator('th')).toContainText('実行日時');
  });

  test('データ品質チェック結果確認', async ({ page }) => {
    // SCEN-271
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#quality-check');
    await expect(page.locator('#quality-results')).toBeVisible();
    await page.click('#report-download');
    await expect(page.locator('#download-link')).toBeVisible();
  });

  test('データソース未選択でエラー', async ({ page }) => {
    // SCEN-272
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#integration-execute');
    await expect(page.locator('#error-message')).toContainText('データソースを選択');
  });

  test('期間未指定で統合実行失敗', async ({ page }) => {
    // SCEN-273
    await page.goto(`${baseURL}/data-integration`);
    await page.check('#datasource-school');
    await page.click('#integration-execute');
    await expect(page.locator('#error-message')).toContainText('期間を指定');
  });

  test('データ取得失敗時エラー表示', async ({ page }) => {
    // SCEN-274
    await page.route('**/api/data', route => route.abort());
    await page.goto(`${baseURL}/grades`);
    await page.click('#refresh-button');
    await expect(page.locator('#error-message')).toContainText('データ取得に失敗');
  });

  test('統合処理中断でエラー詳細', async ({ page }) => {
    // SCEN-275
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#start-integration');
    await page.route('**/api/integration', route => route.abort());
    await page.reload();
    await expect(page.locator('#error-details')).toContainText('処理が中断');
  });

  test('ネットワークエラー時の処理', async ({ page }) => {
    // SCEN-276
    await page.goto(`${baseURL}/data-integration`);
    await page.route('**/api/**', route => route.abort());
    await page.click('#start-integration');
    await expect(page.locator('#network-error')).toContainText('ネットワークエラー');
  });

  test('無効な手動補正データ入力', async ({ page }) => {
    // SCEN-277
    await page.goto(`${baseURL}/data-integration`);
    await page.fill('#subject-name', '12345');
    await page.fill('#score', '150');
    await page.click('#save-correction');
    await expect(page.locator('#validation-error')).toContainText('有効な科目名');
  });

  test('統合権限なしでアクセス拒否', async ({ page }) => {
    // SCEN-278
    await page.goto(`${baseURL}/logout`);
    await page.goto(`${baseURL}/login`);
    await page.fill('#username', 'user@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    await page.goto(`${baseURL}/data-integration`);
    await expect(page.locator('#access-denied')).toContainText('権限がありません');
  });

  test('重複データ統合時エラー', async ({ page }) => {
    // SCEN-279
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#duplicate-integration');
    await page.route('**/api/integration', route => route.abort());
    await page.click('#execute-integration');
    await expect(page.locator('#integration-error')).toContainText('統合エラー');
  });

  test('最大期間範囲での統合実行', async ({ page }) => {
    // SCEN-280
    await page.goto(`${baseURL}/data-integration`);
    await page.fill('#start-date', '2020-01-01');
    await page.fill('#end-date', '2024-12-31');
    await page.click('#integration-execute');
    await expect(page.locator('#integration-complete')).toBeVisible({ timeout: 60000 });
  });

  test('最小期間1日での統合処理', async ({ page }) => {
    // SCEN-281
    await page.goto(`${baseURL}/data-integration`);
    await page.fill('#start-date', '2024-01-01');
    await page.fill('#end-date', '2024-01-01');
    await page.click('#integration-execute');
    await expect(page.locator('#integration-result')).toBeVisible();
  });

  test('全データソース同時選択', async ({ page }) => {
    // SCEN-282
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#select-all-sources');
    await page.click('#integration-execute');
    await expect(page.locator('#integration-progress')).toBeVisible();
  });

  test('統合履歴表示件数上限', async ({ page }) => {
    // SCEN-283
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#integration-history');
    await expect(page.locator('#history-table tr')).toHaveCount(1000);
    await expect(page.locator('#next-page')).toBeVisible();
  });

  test('大容量データ統合の性能', async ({ page }) => {
    // SCEN-284
    await page.goto(`${baseURL}/data-integration`);
    const startTime = Date.now();
    await page.click('#large-data-integration');
    await expect(page.locator('#integration-complete')).toBeVisible({ timeout: 1800000 });
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1800000);
  });

  test('同時統合実行の排他制御', async ({ page, context }) => {
    // SCEN-285
    await page.goto(`${baseURL}/data-integration`);
    const page2 = await context.newPage();
    await page2.goto(`${baseURL}/data-integration`);
    await page.click('#start-integration');
    await expect(page2.locator('#integration-execute')).toBeDisabled();
  });

  test('統合中ブラウザ更新での状態', async ({ page }) => {
    // SCEN-286
    await page.goto(`${baseURL}/data-integration`);
    await page.click('#start-integration');
    await page.reload();
    await expect(page.locator('#integration-status')).toBeVisible();
  });

  test('データ補正最大文字数入力', async ({ page }) => {
    // SCEN-287
    await page.goto(`${baseURL}/data-integration`);
    const maxText = 'a'.repeat(1000);
    await page.fill('#correction-field', maxText);
    await page.click('#save-correction');
    await expect(page.locator('#save-success')).toBeVisible();
  });
});