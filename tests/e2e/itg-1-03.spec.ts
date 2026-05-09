import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("模試結果管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'parent@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseUrl}/dashboard`);
  });

  test('SCEN-062: 模試結果一覧が正常に表示される', async ({ page }) => {
    // SCEN-062
    await page.click('a[href="/mock-exams"]');
    await expect(page.locator('.mock-exam-list')).toBeVisible();
    await expect(page.locator('.mock-exam-item').first()).toContainText('受験日');
    await expect(page.locator('.mock-exam-item').first()).toContainText('総合点数');
  });

  test('SCEN-063: 模試日程フィルターで絞り込める', async ({ page }) => {
    // SCEN-063
    await page.goto(`${baseUrl}/mock-exams`);
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button[type="submit"]');
    await expect(page.locator('.filter-applied')).toBeVisible();
  });

  test('SCEN-064: 実施予備校フィルターで絞り込める', async ({ page }) => {
    // SCEN-064
    await page.goto(`${baseUrl}/mock-exams`);
    await page.click('select[name="school"]');
    await page.selectOption('select[name="school"]', '河合塾');
    await page.click('button.apply-filter');
    await expect(page.locator('.filtered-results')).toContainText('河合塾');
  });

  test('SCEN-065: 科目別成績タブが切り替わる', async ({ page }) => {
    // SCEN-065
    await page.goto(`${baseUrl}/mock-exams/1`);
    await page.click('button[data-tab="math"]');
    await expect(page.locator('.tab-content')).toContainText('数学');
    await page.click('button[data-tab="english"]');
    await expect(page.locator('.tab-content')).toContainText('英語');
  });

  test('SCEN-066: 偏差値推移グラフが表示される', async ({ page }) => {
    // SCEN-066
    await page.goto(`${baseUrl}/mock-exams`);
    await page.click('button.deviation-chart');
    await expect(page.locator('.chart-container')).toBeVisible();
    await expect(page.locator('.chart-axis-x')).toContainText('実施日');
    await expect(page.locator('.chart-axis-y')).toContainText('偏差値');
  });

  test('SCEN-067: 志望校合格可能性が表示される', async ({ page }) => {
    // SCEN-067
    await page.goto(`${baseUrl}/mock-exams/1`);
    await expect(page.locator('.admission-possibility')).toBeVisible();
    await expect(page.locator('.possibility-grade')).toContainText('判定');
  });

  test('SCEN-068: 模試結果新規登録ができる', async ({ page }) => {
    // SCEN-068
    await page.goto(`${baseUrl}/mock-exams`);
    await page.click('button.add-new');
    await page.fill('input[name="examName"]', '第1回全国模試');
    await page.fill('input[name="examDate"]', '2024-03-15');
    await page.fill('input[name="mathScore"]', '85');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-069: 模試結果編集ができる', async ({ page }) => {
    // SCEN-069
    await page.goto(`${baseUrl}/mock-exams`);
    await page.click('button.edit-button');
    await page.fill('input[name="mathScore"]', '90');
    await page.click('button.save');
    await page.click('button.confirm-ok');
    await expect(page.locator('.updated-score')).toContainText('90');
  });

  test('SCEN-070: 模試結果削除ができる', async ({ page }) => {
    // SCEN-070
    await page.goto(`${baseUrl}/mock-exams`);
    await page.click('button.delete-button');
    await expect(page.locator('.delete-confirmation')).toBeVisible();
    await page.click('button.confirm-delete');
    await expect(page.locator('.delete-success')).toBeVisible();
  });

  test('SCEN-071: 科目別詳細分析が表示される', async ({ page }) => {
    // SCEN-071
    await page.goto(`${baseUrl}/mock-exams/1`);
    await page.click('button.detailed-analysis');
    await expect(page.locator('.subject-analysis')).toBeVisible();
    await expect(page.locator('.weak-points')).toBeVisible();
    await expect(page.locator('.learning-advice')).toBeVisible();
  });

  test('SCEN-072: 成績データ自動取得設定ができる', async ({ page }) => {
    // SCEN-072
    await page.goto(`${baseUrl}/mock-exams/settings`);
    await page.check('input[name="autoFetch"]');
    await page.selectOption('select[name="frequency"]', 'weekly');
    await page.fill('input[name="userId"]', 'test123');
    await page.fill('input[name="password"]', 'pass123');
    await page.click('button.save-settings');
    await expect(page.locator('.settings-success')).toBeVisible();
  });

  test('SCEN-073: PDF出力が正常に実行される', async ({ page }) => {
    // SCEN-073
    await page.goto(`${baseUrl}/mock-exams/1`);
    const downloadPromise = page.waitForDownload();
    await page.click('button.export-pdf');
    await page.click('button.execute-export');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('SCEN-074: Excel出力が正常に実行される', async ({ page }) => {
    // SCEN-074
    await page.goto(`${baseUrl}/mock-exams`);
    const downloadPromise = page.waitForDownload();
    await page.click('button.export-excel');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('SCEN-075: 成績推移比較期間を選択できる', async ({ page }) => {
    // SCEN-075
    await page.goto(`${baseUrl}/mock-exams/trends`);
    await page.click('select[name="period"]');
    await page.selectOption('select[name="period"]', '3months');
    await page.click('button.apply-period');
    await expect(page.locator('.chart-updated')).toBeVisible();
  });

  test('SCEN-076: 志望校別判定結果が表示される', async ({ page }) => {
    // SCEN-076
    await page.goto(`${baseUrl}/mock-exams/1`);
    await expect(page.locator('.school-judgments')).toBeVisible();
    await expect(page.locator('.judgment-result')).toContainText('判定');
    await expect(page.locator('.possibility-rate')).toBeVisible();
  });

  test('SCEN-077: 存在しない模試結果でエラー表示', async ({ page }) => {
    // SCEN-077
    await page.goto(`${baseUrl}/mock-exams/999999`);
    await expect(page.locator('.error-message')).toContainText('見つかりません');
  });

  test('SCEN-078: 無効な科目タブでエラー表示', async ({ page }) => {
    // SCEN-078
    await page.goto(`${baseUrl}/mock-exams/1?tab=invalid`);
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-079: グラフ描画失敗時エラー表示', async ({ page }) => {
    // SCEN-079
    await page.route('**/api/chart-data', route => route.fulfill({ status: 500 }));
    await page.goto(`${baseUrl}/mock-exams/chart`);
    await page.click('button.show-chart');
    await expect(page.locator('.chart-error')).toContainText('グラフの表示に失敗');
  });

  test('SCEN-080: 削除権限なしでエラー表示', async ({ page }) => {
    // SCEN-080
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'readonly@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto(`${baseUrl}/mock-exams`);
    await page.click('button.delete-button');
    await expect(page.locator('.permission-error')).toContainText('削除権限がありません');
  });

  test('SCEN-081: ネットワークエラー時の表示', async ({ page }) => {
    // SCEN-081
    await page.goto(`${baseUrl}/mock-exams`);
    await page.context().setOffline(true);
    await page.reload();
    await expect(page.locator('.network-error')).toContainText('ネットワークに接続できません');
  });

  test('SCEN-082: PDF出力失敗時のエラー表示', async ({ page }) => {
    // SCEN-082
    await page.route('**/api/export/pdf', route => route.fulfill({ status: 500 }));
    await page.goto(`${baseUrl}/mock-exams/1`);
    await page.click('button.export-pdf');
    await expect(page.locator('.export-error')).toContainText('PDF出力に失敗');
  });

  test('SCEN-083: Excel出力失敗時のエラー表示', async ({ page }) => {
    // SCEN-083
    await page.route('**/api/export/excel', route => route.fulfill({ status: 500 }));
    await page.goto(`${baseUrl}/mock-exams`);
    await page.click('button.export-excel');
    await expect(page.locator('.export-error')).toContainText('出力に失敗');
  });

  test('SCEN-084: 自動取得設定失敗時のエラー', async ({ page }) => {
    // SCEN-084
    await page.goto(`${baseUrl}/mock-exams/settings`);
    await page.fill('input[name="examId"]', 'invalid123');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button.save-auto-fetch');
    await expect(page.locator('.auth-error')).toContainText('認証情報が正しくない');
  });

  test('SCEN-085: 模試結果0件時の表示確認', async ({ page }) => {
    // SCEN-085
    await page.goto(`${baseUrl}/mock-exams`);
    await expect(page.locator('.empty-state')).toContainText('模試結果がありません');
  });

  test('SCEN-086: 大量データ表示時の動作確認', async ({ page }) => {
    // SCEN-086
    await page.goto(`${baseUrl}/mock-exams?view=all`);
    await expect(page.locator('.mock-exam-item')).toHaveCount(1000, { timeout: 10000 });
    await page.mouse.wheel(0, 1000);
    await expect(page.locator('.performance-indicator')).toBeVisible();
  });

  test('SCEN-087: 最大文字数入力時の動作確認', async ({ page }) => {
    // SCEN-087
    await page.goto(`${baseUrl}/mock-exams/new`);
    await page.fill('input[name="examName"]', 'A'.repeat(200));
    await page.fill('textarea[name="notes"]', 'B'.repeat(500));
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-088: 最小期間選択時の動作確認', async ({ page }) => {
    // SCEN-088
    await page.goto(`${baseUrl}/mock-exams`);
    await page.fill('input[name="startDate"]', '2024-03-15');
    await page.fill('input[name="endDate"]', '2024-03-15');
    await page.click('button.apply-filter');
    await expect(page.locator('.period-results')).toBeVisible();
  });

  test('SCEN-089: 最大期間選択時の動作確認', async ({ page }) => {
    // SCEN-089
    await page.goto(`${baseUrl}/mock-exams`);
    await page.selectOption('select[name="period"]', '5years');
    await page.click('button.apply-period');
    await expect(page.locator('.period-results')).toBeVisible();
  });

  test('SCEN-090: 同時複数操作時の動作確認', async ({ browser }) => {
    // SCEN-090
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    await page1.goto(`${baseUrl}/mock-exams/1`);
    await page2.goto(`${baseUrl}/mock-exams/1`);
    await page2.fill('textarea[name="comment"]', 'テストコメント');
    await page2.click('button.save-comment');
    await page1.reload();
    await expect(page1.locator('.comment')).toContainText('テストコメント');
  });

  test('SCEN-091: ページ切り替え時の状態保持', async ({ page }) => {
    // SCEN-091
    await page.goto(`${baseUrl}/mock-exams/1`);
    await page.click('button[data-tab="math"]');
    await page.goto(`${baseUrl}/dashboard`);
    await page.goBack();
    await expect(page.locator('button[data-tab="math"]')).toHaveClass(/active/);
  });
});