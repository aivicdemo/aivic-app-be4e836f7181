import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("通知画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'parent@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('通知一覧が正常に表示される', async ({ page }) => {
    // SCEN-391
    await page.click('a[href="/notifications"]');
    await page.waitForSelector('.notification-list');
    await expect(page.locator('.notification-item')).toBeVisible();
    await expect(page.locator('.notification-date')).toBeVisible();
  });

  test('未読通知件数バッジが正確に表示', async ({ page }) => {
    // SCEN-392
    await page.goto(`${BASE_URL}/notifications`);
    const initialCount = await page.locator('.unread-badge').textContent();
    await page.click('.notification-item.unread >> first');
    await expect(page.locator('.unread-badge')).toContainText(String(Number(initialCount) - 1));
  });

  test('成績カテゴリフィルターが機能', async ({ page }) => {
    // SCEN-393
    await page.goto(`${BASE_URL}/notifications`);
    await page.selectOption('select[name="gradeCategory"]', '定期テスト');
    await page.click('button:has-text("適用")');
    await expect(page.locator('.notification-item[data-category="定期テスト"]')).toBeVisible();
  });

  test('模試カテゴリフィルターが機能', async ({ page }) => {
    // SCEN-394
    await page.goto(`${BASE_URL}/notifications`);
    await page.selectOption('select[name="examCategory"]', '全国模試');
    await page.click('button:has-text("適用")');
    await expect(page.locator('.notification-item[data-category="全国模試"]')).toBeVisible();
  });

  test('合格可能性フィルターが機能', async ({ page }) => {
    // SCEN-395
    await page.goto(`${BASE_URL}/notifications`);
    await page.selectOption('select[name="passabilityFilter"]', 'A判定');
    await page.click('button:has-text("適用")');
    await expect(page.locator('.notification-item[data-passability="A判定"]')).toBeVisible();
  });

  test('システムカテゴリフィルターが機能', async ({ page }) => {
    // SCEN-396
    await page.goto(`${BASE_URL}/notifications`);
    await page.selectOption('select[name="systemCategory"]', '成績更新');
    await page.click('button:has-text("適用")');
    await expect(page.locator('.notification-item[data-system="成績更新"]')).toBeVisible();
  });

  test('日付範囲絞り込みが正常動作', async ({ page }) => {
    // SCEN-397
    await page.goto(`${BASE_URL}/notifications`);
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('.notification-item')).toHaveCount({ min: 0 });
  });

  test('未読ステータス切り替えが機能', async ({ page }) => {
    // SCEN-398
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('.notification-item.unread >> first');
    await page.goBack();
    await expect(page.locator('.notification-item >> first')).toHaveClass(/read/);
  });

  test('既読ステータス切り替えが機能', async ({ page }) => {
    // SCEN-399
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('.notification-item.read >> first');
    await expect(page.locator('.notification-item >> first')).toHaveClass(/unread/);
  });

  test('通知詳細が正常に展開される', async ({ page }) => {
    // SCEN-400
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('.notification-item >> first');
    await expect(page.locator('.notification-detail')).toBeVisible();
    await expect(page.locator('.notification-content')).toBeVisible();
  });

  test('成績詳細リンクが正常に遷移', async ({ page }) => {
    // SCEN-401
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('a:has-text("成績詳細")');
    await page.waitForURL('**/grades/**');
    await expect(page.locator('.grade-detail')).toBeVisible();
  });

  test('模試結果リンクが正常に遷移', async ({ page }) => {
    // SCEN-402
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('a:has-text("模試結果")');
    await page.waitForURL('**/exam-results/**');
    await expect(page.locator('.exam-result')).toBeVisible();
  });

  test('一括既読ボタンが正常に機能', async ({ page }) => {
    // SCEN-403
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('button:has-text("一括既読")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('.unread-badge')).toContainText('0');
  });

  test('個別通知削除が正常に実行', async ({ page }) => {
    // SCEN-404
    await page.goto(`${BASE_URL}/notifications`);
    const initialCount = await page.locator('.notification-item').count();
    await page.click('.notification-item >> first >> .delete-btn');
    await page.click('button:has-text("削除")');
    await expect(page.locator('.notification-item')).toHaveCount(initialCount - 1);
  });

  test('通知設定変更画面へ遷移', async ({ page }) => {
    // SCEN-405
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('a:has-text("通知設定")');
    await page.waitForURL('**/notification-settings');
    await expect(page.locator('.notification-settings')).toBeVisible();
  });

  test('プッシュ通知ONに切り替え', async ({ page }) => {
    // SCEN-406
    await page.goto(`${BASE_URL}/notification-settings`);
    await page.click('input[name="pushNotification"]');
    await expect(page.locator('input[name="pushNotification"]')).toBeChecked();
  });

  test('プッシュ通知OFFに切り替え', async ({ page }) => {
    // SCEN-407
    await page.goto(`${BASE_URL}/notification-settings`);
    await page.click('input[name="pushNotification"]');
    await expect(page.locator('input[name="pushNotification"]')).not.toBeChecked();
  });

  test('通知データ取得失敗時エラー', async ({ page }) => {
    // SCEN-408
    await page.route('**/api/notifications', route => route.abort());
    await page.goto(`${BASE_URL}/notifications`);
    await expect(page.locator('.error-message')).toContainText('通知データの取得に失敗');
  });

  test('無効なカテゴリでエラー表示', async ({ page }) => {
    // SCEN-409
    await page.route('**/api/notifications?category=invalid', route => route.fulfill({ status: 400 }));
    await page.goto(`${BASE_URL}/notifications?category=invalid`);
    await expect(page.locator('.error-message')).toContainText('無効なカテゴリ');
  });

  test('不正な日付範囲でエラー', async ({ page }) => {
    // SCEN-410
    await page.goto(`${BASE_URL}/notifications`);
    await page.fill('input[name="startDate"]', '2024-12-31');
    await page.fill('input[name="endDate"]', '2024-01-01');
    await page.click('button:has-text("適用")');
    await expect(page.locator('.error-message')).toContainText('終了日は開始日以降');
  });

  test('既読更新失敗時エラー表示', async ({ page }) => {
    // SCEN-411
    await page.route('**/api/notifications/*/read', route => route.abort());
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('.notification-item.unread >> first');
    await expect(page.locator('.error-message')).toContainText('既読更新に失敗');
  });

  test('削除権限なしでエラー表示', async ({ page }) => {
    // SCEN-412
    await page.route('**/api/notifications/*/delete', route => route.fulfill({ status: 403 }));
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('.notification-item >> first >> .delete-btn');
    await expect(page.locator('.error-message')).toContainText('権限がありません');
  });

  test('リンク先データなしエラー', async ({ page }) => {
    // SCEN-413
    await page.route('**/api/grades/**', route => route.fulfill({ status: 404 }));
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('a:has-text("成績詳細")');
    await expect(page.locator('.error-message')).toContainText('データが見つかりません');
  });

  test('プッシュ通知設定失敗エラー', async ({ page }) => {
    // SCEN-414
    await page.route('**/api/notification-settings', route => route.abort());
    await page.goto(`${BASE_URL}/notification-settings`);
    await page.click('input[name="pushNotification"]');
    await expect(page.locator('.error-message')).toContainText('設定の保存に失敗');
  });

  test('通知0件時の表示確認', async ({ page }) => {
    // SCEN-415
    await page.route('**/api/notifications', route => route.fulfill({ json: [] }));
    await page.goto(`${BASE_URL}/notifications`);
    await expect(page.locator('.empty-message')).toContainText('現在、通知はありません');
  });

  test('大量通知時の表示確認', async ({ page }) => {
    // SCEN-416
    await page.goto(`${BASE_URL}/notifications`);
    await expect(page.locator('.notification-item')).toHaveCount({ min: 100 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('.notification-list')).toBeVisible();
  });

  test('未読0件時バッジ非表示', async ({ page }) => {
    // SCEN-417
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('button:has-text("一括既読")');
    await expect(page.locator('.unread-badge')).not.toBeVisible();
  });

  test('全通知既読時の表示確認', async ({ page }) => {
    // SCEN-418
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('button:has-text("一括既読")');
    await expect(page.locator('.all-read-message')).toContainText('未読通知はありません');
  });

  test('同日開始終了日付での絞込', async ({ page }) => {
    // SCEN-419
    await page.goto(`${BASE_URL}/notifications`);
    await page.fill('input[name="startDate"]', '2024-01-15');
    await page.fill('input[name="endDate"]', '2024-01-15');
    await page.click('button:has-text("適用")');
    await expect(page.locator('.notification-list')).toBeVisible();
  });

  test('最大文字数通知の表示確認', async ({ page }) => {
    // SCEN-420
    await page.goto(`${BASE_URL}/notifications`);
    await page.click('.notification-item.max-length >> first');
    await expect(page.locator('.notification-content')).toBeVisible();
    await expect(page.locator('.notification-full-text')).toBeVisible();
  });
});