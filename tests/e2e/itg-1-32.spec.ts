import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("連携状況確認画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
  });

  test('SCEN-815: 連携サービス一覧が正常表示される', async ({ page }) => {
    // SCEN-815
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="service-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="service-item"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="service-name"]').first()).toBeVisible();
  });

  test('SCEN-816: 連携状況ステータスが正しく表示', async ({ page }) => {
    // SCEN-816
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="status-connected"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-disconnected"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-error"]')).toBeVisible();
  });

  test('SCEN-817: 最終データ取得日時が表示される', async ({ page }) => {
    // SCEN-817
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="last-fetch-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-fetch-time"]')).toContainText(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
  });

  test('SCEN-818: データ取得件数が正常表示', async ({ page }) => {
    // SCEN-818
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="data-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-count"]')).toContainText(/\d+件/);
  });

  test('SCEN-819: 手動データ取得が成功する', async ({ page }) => {
    // SCEN-819
    await page.goto(`${BASE_URL}/integration-status`);
    await page.click('[data-testid="manual-fetch-button"]');
    await page.click('[data-testid="confirm-execute"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-820: 連携設定変更画面へ遷移', async ({ page }) => {
    // SCEN-820
    await page.goto(`${BASE_URL}/integration-status`);
    await page.click('[data-testid="change-settings-button"]');
    await page.waitForURL('**/integration-settings');
    await expect(page.locator('[data-testid="integration-settings"]')).toBeVisible();
  });

  test('SCEN-821: データ取得ログが表示される', async ({ page }) => {
    // SCEN-821
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="log-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-entry"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="log-datetime"]').first()).toBeVisible();
  });

  test('SCEN-822: エラーログ詳細が確認できる', async ({ page }) => {
    // SCEN-822
    await page.goto(`${BASE_URL}/integration-status`);
    await page.click('[data-testid="error-detail-button"]');
    await expect(page.locator('[data-testid="error-detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-code"]')).toBeVisible();
  });

  test('SCEN-823: 正常ステータスでフィルター', async ({ page }) => {
    // SCEN-823
    await page.goto(`${BASE_URL}/integration-status`);
    await page.selectOption('[data-testid="status-filter"]', 'normal');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="status-normal"]')).toBeVisible();
  });

  test('SCEN-824: 更新頻度設定が表示される', async ({ page }) => {
    // SCEN-824
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="update-frequency"]')).toBeVisible();
    await expect(page.locator('[data-testid="frequency-value"]')).toContainText(/毎日|週1回|月1回/);
  });

  test('SCEN-825: 次回取得予定時刻が表示', async ({ page }) => {
    // SCEN-825
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="next-fetch-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-fetch-time"]')).toContainText(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
  });

  test('SCEN-826: 連携エラー状況が表示される', async ({ page }) => {
    // SCEN-826
    await page.route('**/api/integration-status', route => route.fulfill({ status: 500 }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-827: 手動データ取得でエラー発生', async ({ page }) => {
    // SCEN-827
    await page.route('**/api/manual-fetch', route => route.fulfill({ status: 500 }));
    await page.goto(`${BASE_URL}/integration-status`);
    await page.click('[data-testid="manual-fetch-button"]');
    await expect(page.locator('[data-testid="fetch-error-message"]')).toBeVisible();
  });

  test('SCEN-828: データ取得タイムアウト', async ({ page }) => {
    // SCEN-828
    page.setDefaultTimeout(1);
    await page.route('**/api/fetch-data', route => new Promise(resolve => setTimeout(() => resolve(route.fulfill()), 5000)));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible();
  });

  test('SCEN-829: 認証エラーで連携失敗', async ({ page }) => {
    // SCEN-829
    await page.route('**/api/integration-auth', route => route.fulfill({ status: 401 }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="auth-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-failed"]')).toBeVisible();
  });

  test('SCEN-830: サーバーエラーでログ取得失敗', async ({ page }) => {
    // SCEN-830
    await page.route('**/api/logs', route => route.fulfill({ status: 500 }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="log-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-log-button"]')).toBeVisible();
  });

  test('SCEN-831: エラーステータスでフィルター', async ({ page }) => {
    // SCEN-831
    await page.goto(`${BASE_URL}/integration-status`);
    await page.selectOption('[data-testid="status-filter"]', 'error');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="error-items"]')).toBeVisible();
  });

  test('SCEN-832: 連携設定不備でエラー表示', async ({ page }) => {
    // SCEN-832
    await page.route('**/api/integration-config', route => route.fulfill({ status: 400, json: { error: 'config_missing' } }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="config-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-config-error"]')).toBeVisible();
  });

  test('SCEN-833: ネットワークエラー時の表示', async ({ page }) => {
    // SCEN-833
    await page.context().setOffline(true);
    await page.goto(`${BASE_URL}/integration-status`);
    await page.click('[data-testid="refresh-button"]');
    await expect(page.locator('[data-testid="network-error-message"]')).toBeVisible();
  });

  test('SCEN-834: 連携サービス0件時の表示', async ({ page }) => {
    // SCEN-834
    await page.route('**/api/services', route => route.fulfill({ json: [] }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="no-services-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-services-message"]')).toContainText('連携中のサービスはありません');
  });

  test('SCEN-835: データ取得件数0件の表示', async ({ page }) => {
    // SCEN-835
    await page.route('**/api/data-count', route => route.fulfill({ json: { count: 0 } }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="data-count"]')).toContainText('0件');
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
  });

  test('SCEN-836: 最大連携サービス数での表示', async ({ page }) => {
    // SCEN-836
    await page.route('**/api/services', route => route.fulfill({ json: Array(10).fill({}).map((_, i) => ({ id: i, name: `Service${i}` })) }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="service-item"]')).toHaveCount(10);
    await page.locator('[data-testid="service-list"]').scroll({ behavior: 'smooth' });
  });

  test('SCEN-837: ログ0件時のメッセージ表示', async ({ page }) => {
    // SCEN-837
    await page.route('**/api/logs', route => route.fulfill({ json: [] }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="no-logs-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-logs-message"]')).toContainText('連携ログはありません');
  });

  test('SCEN-838: 全フィルター解除時の表示', async ({ page }) => {
    // SCEN-838
    await page.goto(`${BASE_URL}/integration-status`);
    await page.selectOption('[data-testid="filter-school"]', 'high-school');
    await page.click('[data-testid="clear-all-filters"]');
    await expect(page.locator('[data-testid="all-items"]')).toBeVisible();
  });

  test('SCEN-839: 初回連携時の画面表示', async ({ page }) => {
    // SCEN-839
    await page.route('**/api/integration-history', route => route.fulfill({ json: [] }));
    await page.goto(`${BASE_URL}/integration-status`);
    await expect(page.locator('[data-testid="first-time-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-integration-button"]')).toBeVisible();
  });

  test('SCEN-840: 連続手動取得実行の制御', async ({ page }) => {
    // SCEN-840
    await page.goto(`${BASE_URL}/integration-status`);
    await page.click('[data-testid="manual-fetch-button"]');
    await expect(page.locator('[data-testid="manual-fetch-button"]')).toBeDisabled();
    await page.click('[data-testid="manual-fetch-button"]');
    await expect(page.locator('[data-testid="rate-limit-message"]')).toBeVisible();
  });
});