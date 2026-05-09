import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("模試日程情報", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'parent@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('模試日程一覧が正常に表示される', async ({ page }) => {
    // SCEN-239
    await page.click('a[href="/exam-schedule"]');
    await expect(page.locator('h1')).toContainText('模試日程');
    await expect(page.locator('.exam-list .exam-item')).toHaveCount(1, { timeout: 10000 });
    await expect(page.locator('.exam-item')).toContainText(['日程', '科目', '会場']);
  });

  test('日付フィルターで期間絞込みができる', async ({ page }) => {
    // SCEN-240
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("フィルター適用")');
    await expect(page.locator('.exam-item')).toHaveCount(1, { timeout: 5000 });
  });

  test('予備校別フィルターで絞込みができる', async ({ page }) => {
    // SCEN-241
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.click('select[name="school"]');
    await page.selectOption('select[name="school"]', '河合塾');
    await page.click('button:has-text("フィルター適用")');
    await expect(page.locator('.filter-condition')).toContainText('河合塾');
  });

  test('科目別フィルターで絞込みができる', async ({ page }) => {
    // SCEN-242
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.selectOption('select[name="subject"]', '数学');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('.exam-item')).toContainText('数学');
    await page.selectOption('select[name="subject"]', '英語');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('.exam-item')).toContainText('英語');
  });

  test('申込状況フィルターで絞込みができる', async ({ page }) => {
    // SCEN-243
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.selectOption('select[name="applicationStatus"]', '申込済み');
    await page.click('button:has-text("フィルター適用")');
    await expect(page.locator('.exam-item .status')).toContainText('申込済み');
    await page.selectOption('select[name="applicationStatus"]', '未申込');
    await page.click('button:has-text("フィルター適用")');
    await expect(page.locator('.exam-item .status')).toContainText('未申込');
  });

  test('模試名検索で該当データが表示される', async ({ page }) => {
    // SCEN-244
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.fill('input[name="examName"]', '全国模試');
    await page.click('button:has-text("検索")');
    await expect(page.locator('.exam-item')).toContainText('全国模試');
    await expect(page.locator('.exam-item')).toContainText(['実施日', '会場', '申込期限']);
  });

  test('カレンダー表示に正常に切替わる', async ({ page }) => {
    // SCEN-245
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.click('button:has-text("カレンダー表示")');
    await expect(page.locator('.calendar-view')).toBeVisible();
    await expect(page.locator('.calendar-date .exam-event')).toHaveCount(1, { timeout: 5000 });
  });

  test('申込済みマークが正しく表示される', async ({ page }) => {
    // SCEN-246
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.click('.exam-item button:has-text("申込み")');
    await page.fill('input[name="studentName"]', '山田太郎');
    await page.click('button:has-text("申込み完了")');
    await page.goto(`${BASE_URL}/exam-schedule`);
    await expect(page.locator('.exam-item .status-badge')).toContainText('申込済み');
  });

  test('結果発表日が正しく表示される', async ({ page }) => {
    // SCEN-247
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.click('.exam-item a:has-text("詳細")');
    await expect(page.locator('.result-date')).toContainText(/\d{4}年\d{1,2}月\d{1,2}日/);
  });

  test('模試詳細リンクから詳細画面に遷移', async ({ page }) => {
    // SCEN-248
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.click('.exam-item a:has-text("詳細")');
    await page.waitForURL(`${BASE_URL}/exam-schedule/**/detail`);
    await expect(page.locator('.exam-detail')).toContainText(['模試名', '実施日時', '会場情報', '申込期限', '受験料']);
  });

  test('申込サイトリンクで外部サイトに遷移', async ({ page }) => {
    // SCEN-249
    await page.goto(`${BASE_URL}/exam-schedule/1/detail`);
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('a:has-text("申込サイト")')
    ]);
    await expect(newPage).toHaveURL(/https?:\/\/.+/);
    await expect(page).toHaveURL(`${BASE_URL}/exam-schedule/1/detail`);
  });

  test('通知設定が正常に保存される', async ({ page }) => {
    // SCEN-250
    await page.goto(`${BASE_URL}/exam-schedule/1/detail`);
    await page.click('button:has-text("通知設定")');
    await page.check('input[name="notify3DaysBefore"]');
    await page.check('input[name="notify1DayBefore"]');
    await page.selectOption('select[name="notifyTime"]', '09:00');
    await page.click('button:has-text("保存")');
    await expect(page.locator('.success-message')).toContainText('設定完了');
    await expect(page.locator('.notification-icon.active')).toBeVisible();
  });

  test('存在しない模試名で検索結果なし', async ({ page }) => {
    // SCEN-251
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.fill('input[name="examName"]', '存在しない模試ABC123');
    await page.click('button:has-text("検索")');
    await expect(page.locator('.no-results')).toContainText('該当する模試が見つかりませんでした');
    await expect(page.locator('.exam-item')).toHaveCount(0);
  });

  test('不正な日付範囲でエラー表示', async ({ page }) => {
    // SCEN-252
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.fill('input[name="startDate"]', '2024-12-31');
    await page.fill('input[name="endDate"]', '2024-01-01');
    await page.click('button:has-text("適用")');
    await expect(page.locator('.error-message')).toContainText('終了日は開始日より後の日付を入力してください');
  });

  test('ネットワークエラー時の表示', async ({ page }) => {
    // SCEN-253
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.route('**/api/exam-schedule', route => route.abort());
    await page.reload();
    await expect(page.locator('.error-message')).toContainText(['ネットワークエラー', '取得できません']);
    await expect(page.locator('button:has-text("再試行")')).toBeVisible();
  });

  test('申込リンクが無効な場合のエラー', async ({ page }) => {
    // SCEN-254
    await page.goto(`${BASE_URL}/exam-schedule/invalid/detail`);
    await page.click('a:has-text("申込リンク")');
    await expect(page.locator('.error-message')).toContainText(['無効なリンク', '正常に機能しません']);
  });

  test('通知設定保存時のエラーハンドリング', async ({ page }) => {
    // SCEN-255
    await page.goto(`${BASE_URL}/exam-schedule/1/detail`);
    await page.click('button:has-text("通知設定")');
    await page.fill('input[name="notifyDays"]', '-1');
    await page.click('button:has-text("保存")');
    await expect(page.locator('.validation-error')).toContainText('正しい値を入力してください');
    await page.route('**/api/notifications', route => route.abort());
    await page.fill('input[name="notifyDays"]', '3');
    await page.click('button:has-text("保存")');
    await expect(page.locator('.error-message')).toContainText('保存に失敗しました');
  });

  test('検索文字数上限での動作確認', async ({ page }) => {
    // SCEN-256
    await page.goto(`${BASE_URL}/exam-schedule`);
    const maxLengthText = 'a'.repeat(255);
    await page.fill('input[name="examName"]', maxLengthText);
    await page.click('button:has-text("検索")');
    await expect(page.locator('.search-results')).toBeVisible();
    const overLimitText = 'a'.repeat(256);
    await page.fill('input[name="examName"]', overLimitText);
    await expect(page.locator('input[name="examName"]')).toHaveValue(maxLengthText);
  });

  test('日付フィルター境界値での動作', async ({ page }) => {
    // SCEN-257
    await page.goto(`${BASE_URL}/exam-schedule`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    await page.fill('input[name="endDate"]', today);
    await page.click('button:has-text("フィルター適用")');
    await expect(page.locator('.exam-list')).toBeVisible();
    await page.fill('input[name="startDate"]', '2025-01-01');
    await page.fill('input[name="endDate"]', '2020-01-01');
    await page.click('button:has-text("フィルター適用")');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('模試データ0件時の表示', async ({ page }) => {
    // SCEN-258
    await page.route('**/api/exam-schedule', route => route.fulfill({ json: [] }));
    await page.goto(`${BASE_URL}/exam-schedule`);
    await expect(page.locator('.empty-state')).toContainText('登録されている模試はありません');
    await expect(page.locator('.exam-item')).toHaveCount(0);
  });

  test('大量データ表示時のパフォーマンス', async ({ page }) => {
    // SCEN-259
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    await page.locator('.exam-list').scrollIntoView();
    await page.fill('input[name="examName"]', '模試');
    const searchStart = Date.now();
    await page.click('button:has-text("検索")');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - searchStart).toBeLessThan(2000);
  });

  test('複数フィルター同時適用の動作', async ({ page }) => {
    // SCEN-260
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.selectOption('select[name="subject"]', '数学');
    await page.selectOption('select[name="difficulty"]', '標準');
    await page.selectOption('select[name="period"]', '2024-04');
    await page.selectOption('select[name="format"]', '記述式');
    await page.click('button:has-text("フィルター適用")');
    await expect(page.locator('.exam-item')).toContainText(['数学', '標準', '2024年4月', '記述式']);
  });

  test('ページリロード時のフィルター状態', async ({ page }) => {
    // SCEN-261
    await page.goto(`${BASE_URL}/exam-schedule`);
    await page.fill('input[name="startDate"]', '2024-04-01');
    await page.fill('input[name="endDate"]', '2024-06-30');
    await page.selectOption('select[name="subject"]', '数学');
    await page.selectOption('select[name="examType"]', '全国模試');
    await page.click('button:has-text("フィルター適用")');
    await page.reload();
    await expect(page.locator('input[name="startDate"]')).toHaveValue('2024-04-01');
    await expect(page.locator('input[name="endDate"]')).toHaveValue('2024-06-30');
    await expect(page.locator('select[name="subject"]')).toHaveValue('数学');
    await expect(page.locator('select[name="examType"]')).toHaveValue('全国模試');
  });
});