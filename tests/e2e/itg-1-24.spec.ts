import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("合格可能性評価処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'parent@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test('受験生選択して合格可能性評価実行', async ({ page }) => {
    // SCEN-594
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("合格可能性評価を実行")');
    await expect(page.locator('.evaluation-result')).toContainText('%');
  });

  test('評価期間指定して模試データ取得', async ({ page }) => {
    // SCEN-595
    await page.click('a[href="/evaluation"]');
    await page.fill('input[name="startDate"]', '2024-04-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.selectOption('select[name="student"]', '1');
    await page.click('button:text("模試データ取得")');
    await expect(page.locator('.mock-exam-list')).toBeVisible();
  });

  test('志望校選択して判定結果表示', async ({ page }) => {
    // SCEN-596
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="schoolType"]', '大学');
    await page.selectOption('select[name="region"]', '東京');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("判定実行")');
    await expect(page.locator('.judgment-result')).toContainText('判定');
  });

  test('科目別偏差値グラフ正常表示', async ({ page }) => {
    // SCEN-597
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.click('button:text("科目別偏差値グラフ")');
    await page.selectOption('select[name="period"]', '6months');
    await page.click('button:text("グラフ表示")');
    await expect(page.locator('.deviation-chart')).toBeVisible();
  });

  test('合格ライン比較チャート表示', async ({ page }) => {
    // SCEN-598
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.check('input[value="school1"]');
    await page.check('input[value="school2"]');
    await page.click('button:text("合格ライン比較チャート表示")');
    await expect(page.locator('.comparison-chart')).toBeVisible();
  });

  test('判定履歴推移グラフ描画', async ({ page }) => {
    // SCEN-599
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.click('button:text("判定履歴推移")');
    await expect(page.locator('.history-graph')).toBeVisible();
    await expect(page.locator('.axis-label')).toBeVisible();
  });

  test('科目別弱点分析表作成', async ({ page }) => {
    // SCEN-600
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.click('button:text("科目別弱点分析")');
    await page.selectOption('select[name="analysisPeriod"]', '3months');
    await page.click('button:text("弱点分析表作成")');
    await expect(page.locator('.weakness-analysis-table')).toBeVisible();
  });

  test('推奨学習アドバイス表示', async ({ page }) => {
    // SCEN-601
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("合格可能性を評価する")');
    await expect(page.locator('.study-advice')).toBeVisible();
  });

  test('詳細分析レポート出力', async ({ page }) => {
    // SCEN-602
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("詳細分析レポート出力")');
    await expect(page.locator('a[href*=".pdf"]')).toBeVisible();
  });

  test('受験生未選択で評価実行エラー', async ({ page }) => {
    // SCEN-603
    await page.click('a[href="/evaluation"]');
    await page.click('button:text("評価実行")');
    await expect(page.locator('.error-message')).toContainText('受験生を選択してください');
  });

  test('模試データなしでエラー表示', async ({ page }) => {
    // SCEN-604
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', 'no-data-student');
    await page.click('button:text("合格可能性を評価する")');
    await expect(page.locator('.error-message')).toContainText('模試データが登録されていないため');
  });

  test('志望校未選択で判定不可', async ({ page }) => {
    // SCEN-605
    await page.click('a[href="/evaluation"]');
    await page.click('button:text("評価開始")');
    await expect(page.locator('.error-message')).toContainText('志望校を選択してください');
  });

  test('ネットワークエラー時の処理', async ({ page }) => {
    // SCEN-606
    await page.route('**/api/evaluation', route => route.abort());
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("合格可能性を評価する")');
    await expect(page.locator('.error-message')).toContainText('ネットワークに接続できません');
  });

  test('データ取得失敗時のメッセージ', async ({ page }) => {
    // SCEN-607
    await page.route('**/api/evaluation-data', route => route.fulfill({ status: 500 }));
    await page.click('a[href="/evaluation"]');
    await page.click('button:text("評価実行")');
    await expect(page.locator('.error-message')).toContainText('成績データの取得に失敗しました');
  });

  test('レポート出力失敗エラー', async ({ page }) => {
    // SCEN-608
    await page.route('**/api/report', route => route.fulfill({ status: 500 }));
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', '1');
    await page.click('button:text("レポート出力")');
    await expect(page.locator('.error-message')).toContainText('レポートの生成に失敗しました');
  });

  test('評価期間最小値での算出', async ({ page }) => {
    // SCEN-609
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="period"]', '1day');
    await page.selectOption('select[name="student"]', '1');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("評価算出")');
    await expect(page.locator('.evaluation-result')).toContainText('%');
  });

  test('評価期間最大値での処理', async ({ page }) => {
    // SCEN-610
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="period"]', 'max');
    await page.selectOption('select[name="student"]', '1');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("評価実行")');
    await expect(page.locator('.evaluation-result')).toBeVisible();
  });

  test('未来日付選択時の制御', async ({ page }) => {
    // SCEN-611
    await page.click('a[href="/evaluation"]');
    await page.fill('input[name="evaluationDate"]', '2025-12-31');
    await page.click('button:text("評価実行")');
    await expect(page.locator('.error-message')).toContainText('現在日以前の日付を選択してください');
  });

  test('模試データ1件のみで評価', async ({ page }) => {
    // SCEN-612
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', 'single-data-student');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("合格可能性を評価する")');
    await expect(page.locator('.warning-message')).toContainText('データ不足');
    await expect(page.locator('.evaluation-result')).toBeVisible();
  });

  test('志望校上限数選択時の動作', async ({ page }) => {
    // SCEN-613
    await page.click('a[href="/evaluation"]');
    for(let i = 1; i <= 10; i++) {
      await page.check(`input[value="school${i}"]`);
    }
    await page.click('button:text("志望校選択完了")');
    await page.click('button:text("評価実行")');
    await expect(page.locator('.evaluation-results')).toBeVisible();
  });

  test('全科目0点時の判定処理', async ({ page }) => {
    // SCEN-614
    await page.click('a[href="/grade-input"]');
    await page.fill('input[name="japanese"]', '0');
    await page.fill('input[name="math"]', '0');
    await page.fill('input[name="english"]', '0');
    await page.click('button:text("合格可能性評価")');
    await expect(page.locator('.evaluation-result')).toContainText('E判定');
  });

  test('満点時の合格可能性表示', async ({ page }) => {
    // SCEN-615
    await page.click('a[href="/grade-input"]');
    await page.fill('input[name="japanese"]', '100');
    await page.fill('input[name="math"]', '100');
    await page.fill('input[name="english"]', '100');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("評価実行")');
    await expect(page.locator('.evaluation-result')).toContainText('A判定');
  });

  test('判定履歴なし時の初回処理', async ({ page }) => {
    // SCEN-616
    await page.click('a[href="/evaluation"]');
    await page.selectOption('select[name="student"]', 'new-student');
    await page.fill('input[name="japanese"]', '75');
    await page.fill('input[name="math"]', '80');
    await page.selectOption('select[name="school"]', '東京大学');
    await page.click('button:text("評価実行")');
    await expect(page.locator('.evaluation-result')).toBeVisible();
    await expect(page.locator('.comparison-history')).toContainText('N/A');
  });
});