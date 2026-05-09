import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("システム利用状況", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'parent@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('SCEN-316: システム利用状況画面の初期表示', async ({ page }) => {
    // SCEN-316
    await page.click('[data-testid="menu-usage"]');
    await expect(page.locator('[data-testid="usage-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="function-usage"]')).toBeVisible();
  });

  test('SCEN-317: 利用者数サマリーの正常表示', async ({ page }) => {
    // SCEN-317
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="menu-usage"]');
    await page.click('[data-testid="tab-user-summary"]');
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-users"]')).toBeVisible();
  });

  test('SCEN-318: ログイン状況グラフの描画', async ({ page }) => {
    // SCEN-318
    await page.click('[data-testid="menu-usage"]');
    await page.waitForSelector('[data-testid="login-chart"]');
    await expect(page.locator('[data-testid="chart-axis-label"]')).toBeVisible();
    await page.hover('[data-testid="chart-data-point"]');
    await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
  });

  test('SCEN-319: 機能別利用回数チャート表示', async ({ page }) => {
    // SCEN-319
    await page.click('[data-testid="menu-usage"]');
    await page.click('[data-testid="tab-function-usage"]');
    await page.selectOption('[data-testid="chart-type"]', 'bar');
    await page.fill('[data-testid="period-start"]', '2024-01-01');
    await page.click('[data-testid="show-chart-button"]');
    await expect(page.locator('[data-testid="function-chart"]')).toBeVisible();
  });

  test('SCEN-320: パフォーマンス指標の数値表示', async ({ page }) => {
    // SCEN-320
    await page.click('[data-testid="menu-performance"]');
    await expect(page.locator('[data-testid="response-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-speed"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-rate"]')).toBeVisible();
  });

  test('SCEN-321: エラー発生状況一覧の表示', async ({ page }) => {
    // SCEN-321
    await page.click('[data-testid="menu-usage"]');
    await page.click('[data-testid="tab-error-status"]');
    await expect(page.locator('[data-testid="error-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-datetime"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-type"]')).toBeVisible();
  });

  test('SCEN-322: データ取得処理状況の確認', async ({ page }) => {
    // SCEN-322
    await page.click('[data-testid="menu-usage"]');
    await page.click('[data-testid="tab-data-processing"]');
    await expect(page.locator('[data-testid="process-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="process-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-rate"]')).toBeVisible();
  });

  test('SCEN-323: バッチ処理履歴テーブル表示', async ({ page }) => {
    // SCEN-323
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="menu-system-management"]');
    await page.click('[data-testid="submenu-batch-management"]');
    await page.click('[data-testid="tab-batch-history"]');
    await expect(page.locator('[data-testid="batch-history-table"]')).toBeVisible();
  });

  test('SCEN-324: 期間指定フィルターの適用', async ({ page }) => {
    // SCEN-324
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="apply-filter-button"]');
    await expect(page.locator('[data-testid="filtered-data"]')).toBeVisible();
  });

  test('SCEN-325: 利用者種別絞り込み機能', async ({ page }) => {
    // SCEN-325
    await page.click('[data-testid="menu-usage"]');
    await page.selectOption('[data-testid="user-type-filter"]', 'student');
    await expect(page.locator('[data-testid="student-data"]')).toBeVisible();
    await page.selectOption('[data-testid="user-type-filter"]', 'parent');
    await expect(page.locator('[data-testid="parent-data"]')).toBeVisible();
  });

  test('SCEN-326: エラーレベル選択での絞り込み', async ({ page }) => {
    // SCEN-326
    await page.click('[data-testid="menu-usage"]');
    await page.selectOption('[data-testid="error-level-dropdown"]', 'warning');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="warning-errors"]')).toBeVisible();
  });

  test('SCEN-327: データエクスポート実行', async ({ page }) => {
    // SCEN-327
    await page.click('[data-testid="menu-export"]');
    await page.selectOption('[data-testid="export-format"]', 'csv');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('SCEN-328: リアルタイム更新の有効化', async ({ page }) => {
    // SCEN-328
    await page.click('[data-testid="menu-settings"]');
    await page.check('[data-testid="realtime-update-toggle"]');
    await page.click('[data-testid="save-settings"]');
    await expect(page.locator('[data-testid="realtime-enabled"]')).toBeVisible();
  });

  test('SCEN-329: リアルタイム更新の無効化', async ({ page }) => {
    // SCEN-329
    await page.click('[data-testid="menu-settings"]');
    await page.uncheck('[data-testid="realtime-update-toggle"]');
    await page.click('[data-testid="save-settings"]');
    await expect(page.locator('[data-testid="realtime-disabled"]')).toBeVisible();
  });

  test('SCEN-330: 複数フィルター条件の組み合わせ', async ({ page }) => {
    // SCEN-330
    await page.click('[data-testid="menu-usage"]');
    await page.selectOption('[data-testid="date-filter"]', 'last30days');
    await page.selectOption('[data-testid="function-filter"]', 'grade-check');
    await page.selectOption('[data-testid="device-filter"]', 'smartphone');
    await page.click('[data-testid="apply-filter-button"]');
    await expect(page.locator('[data-testid="combined-filter-result"]')).toBeVisible();
  });

  test('SCEN-331: データ取得エラー時の表示', async ({ page }) => {
    // SCEN-331
    await page.route('**/api/usage-data', route => route.abort('failed'));
    await page.click('[data-testid="menu-usage"]');
    await expect(page.locator('[data-testid="data-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-332: グラフ描画失敗時のエラー', async ({ page }) => {
    // SCEN-332
    await page.route('**/api/chart-data', route => route.abort('failed'));
    await page.click('[data-testid="menu-usage"]');
    await expect(page.locator('[data-testid="chart-error-message"]')).toBeVisible();
  });

  test('SCEN-333: エクスポート失敗時の処理', async ({ page }) => {
    // SCEN-333
    await page.route('**/api/export', route => route.abort('failed'));
    await page.click('[data-testid="menu-export"]');
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="export-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-334: ネットワーク断絶時の挙動', async ({ page }) => {
    // SCEN-334
    await page.click('[data-testid="menu-grades"]');
    await page.context().setOffline(true);
    await page.click('[data-testid="refresh-data-button"]');
    await expect(page.locator('[data-testid="offline-error-message"]')).toBeVisible();
    await page.context().setOffline(false);
  });

  test('SCEN-335: 権限不足時のアクセス制御', async ({ page }) => {
    // SCEN-335
    await page.goto(`${BASE_URL}/admin/system-settings`);
    await expect(page.locator('[data-testid="access-denied-message"]')).toBeVisible();
  });

  test('SCEN-336: サーバーエラー時の表示', async ({ page }) => {
    // SCEN-336
    await page.route('**/api/grades', route => route.fulfill({ status: 500 }));
    await page.click('[data-testid="menu-grades"]');
    await expect(page.locator('[data-testid="server-error-message"]')).toBeVisible();
  });

  test('SCEN-337: データ更新失敗時の処理', async ({ page }) => {
    // SCEN-337
    await page.click('[data-testid="menu-grades"]');
    await page.click('[data-testid="edit-grade-button"]');
    await page.fill('[data-testid="grade-input"]', '95');
    await page.route('**/api/update-grade', route => route.abort('failed'));
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="update-error-message"]')).toBeVisible();
  });

  test('SCEN-338: 無効な期間指定での検索', async ({ page }) => {
    // SCEN-338
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="date-error-message"]')).toBeVisible();
  });

  test('SCEN-339: 存在しない条件での絞り込み', async ({ page }) => {
    // SCEN-339
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="student-name-filter"]', 'テスト太郎999');
    await page.click('[data-testid="filter-execute-button"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
  });

  test('SCEN-340: 期間指定の最小値境界', async ({ page }) => {
    // SCEN-340
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2020-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="usage-data"]')).toBeVisible();
  });

  test('SCEN-341: 期間指定の最大値境界', async ({ page }) => {
    // SCEN-341
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2030-12-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="usage-data"]')).toBeVisible();
  });

  test('SCEN-342: 未来日付での期間指定', async ({ page }) => {
    // SCEN-342
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="start-date"]', '2025-06-01');
    await page.fill('[data-testid="end-date"]', '2025-06-08');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="future-date-error"]')).toBeVisible();
  });

  test('SCEN-343: 開始日終了日の逆転指定', async ({ page }) => {
    // SCEN-343
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="date-order-error"]')).toBeVisible();
  });

  test('SCEN-344: 大量データ表示時の性能', async ({ page }) => {
    // SCEN-344
    const startTime = Date.now();
    await page.click('[data-testid="menu-grades"]');
    await page.waitForSelector('[data-testid="grade-list"]');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('SCEN-345: データ0件時の表示', async ({ page }) => {
    // SCEN-345
    await page.click('[data-testid="menu-grades"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
  });

  test('SCEN-346: エラー件数上限時の表示', async ({ page }) => {
    // SCEN-346
    await page.click('[data-testid="menu-usage"]');
    await expect(page.locator('[data-testid="error-count-limit-warning"]')).toBeVisible();
  });

  test('SCEN-347: 同一日付での期間指定', async ({ page }) => {
    // SCEN-347
    const today = new Date().toISOString().split('T')[0];
    await page.click('[data-testid="menu-usage"]');
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', today);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="usage-data"]')).toBeVisible();
  });

  test('SCEN-348: 全フィルター未選択状態', async ({ page }) => {
    // SCEN-348
    await page.click('[data-testid="menu-usage"]');
    await expect(page.locator('[data-testid="filter-guidance-message"]')).toBeVisible();
  });
});