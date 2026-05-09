import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績管理画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', 'parent@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-543: 受験生選択で対応データ表示', async ({ page }) => {
    // SCEN-543
    await page.click('a[href*="grades"]');
    await page.click('#student-select');
    await page.click('[data-value="student-1"]');
    await expect(page.locator('#grade-data-area')).toBeVisible();
  });

  test('SCEN-544: 成績期間指定で絞込表示', async ({ page }) => {
    // SCEN-544
    await page.goto(`${BASE_URL}/grades`);
    await page.fill('#start-date', '2023-04-01');
    await page.fill('#end-date', '2023-09-30');
    await page.click('#filter-button');
    await expect(page.locator('#active-filter')).toContainText('2023-04-01');
  });

  test('SCEN-545: 偏差値推移グラフ正常描画', async ({ page }) => {
    // SCEN-545
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-1"]');
    await page.click('#deviation-chart-tab');
    await expect(page.locator('#deviation-chart canvas')).toBeVisible();
  });

  test('SCEN-546: 科目別レーダーチャート表示', async ({ page }) => {
    // SCEN-546
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-1"]');
    await page.click('#radar-chart-tab');
    await expect(page.locator('#radar-chart')).toBeVisible();
  });

  test('SCEN-547: 最新模試結果一覧表示', async ({ page }) => {
    // SCEN-547
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#latest-mock-exams-tab');
    await expect(page.locator('#mock-exam-list')).toBeVisible();
    await expect(page.locator('#mock-exam-list .exam-item').first()).toContainText('2024');
  });

  test('SCEN-548: 志望校合格可能性表示', async ({ page }) => {
    // SCEN-548
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-1"]');
    await page.click('#target-schools-tab');
    await expect(page.locator('#admission-probability')).toBeVisible();
  });

  test('SCEN-549: 科目別偏差値比較表示', async ({ page }) => {
    // SCEN-549
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#subject-deviation-compare-tab');
    await page.selectOption('#period-select', 'recent-3');
    await page.click('#compare-button');
    await expect(page.locator('#deviation-compare-table')).toBeVisible();
  });

  test('SCEN-550: 成績データ手動入力成功', async ({ page }) => {
    // SCEN-550
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-grade-button');
    await page.selectOption('#subject-select', 'math');
    await page.selectOption('#test-type-select', 'midterm');
    await page.fill('#score-input', '85');
    await page.fill('#test-date', '2024-01-15');
    await page.click('#save-button');
    await expect(page.locator('.success-message')).toContainText('成績データを保存しました');
  });

  test('SCEN-551: 予備校データ同期成功', async ({ page }) => {
    // SCEN-551
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#sync-data-button');
    await page.click('#prep-school-data');
    await page.click('#start-sync-button');
    await expect(page.locator('.success-message')).toContainText('同期が完了しました');
  });

  test('SCEN-552: 模試結果登録完了', async ({ page }) => {
    // SCEN-552
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-mock-exam-button');
    await page.fill('#exam-name', '第1回全国統一模試');
    await page.fill('#exam-date', '2024-01-15');
    await page.fill('#japanese-score', '80');
    await page.fill('#math-score', '75');
    await page.click('#register-button');
    await expect(page.locator('.success-message')).toContainText('登録が完了しました');
  });

  test('SCEN-553: 成績推移分析結果表示', async ({ page }) => {
    // SCEN-553
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-1"]');
    await page.click('#trend-analysis-tab');
    await page.selectOption('#analysis-period', '6-months');
    await page.click('#analyze-button');
    await expect(page.locator('#analysis-result')).toBeVisible();
  });

  test('SCEN-554: 改善提案アドバイス表示', async ({ page }) => {
    // SCEN-554
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-1"]');
    await page.click('#improvement-advice-tab');
    await expect(page.locator('#advice-content')).toBeVisible();
  });

  test('SCEN-555: 受験生未選択でエラー', async ({ page }) => {
    // SCEN-555
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#show-grades-button');
    await expect(page.locator('.error-message')).toContainText('受験生を選択してください');
  });

  test('SCEN-556: 無効期間指定でエラー表示', async ({ page }) => {
    // SCEN-556
    await page.goto(`${BASE_URL}/grades`);
    await page.fill('#start-date', '2024-12-31');
    await page.fill('#end-date', '2024-01-01');
    await page.click('#search-button');
    await expect(page.locator('.error-message')).toContainText('期間の指定が正しくありません');
  });

  test('SCEN-557: 成績データなしでエラー', async ({ page }) => {
    // SCEN-557
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-no-data"]');
    await page.click('#show-grades-button');
    await expect(page.locator('.error-message')).toContainText('成績データが登録されていません');
  });

  test('SCEN-558: 不正偏差値入力でエラー', async ({ page }) => {
    // SCEN-558
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-grade-button');
    await page.fill('#deviation-input', '-10');
    await page.click('#save-button');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-559: 必須項目未入力でエラー', async ({ page }) => {
    // SCEN-559
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-grade-button');
    await page.fill('#optional-field', 'optional value');
    await page.click('#save-button');
    await expect(page.locator('.error-message')).toContainText('必須項目');
  });

  test('SCEN-560: 同期失敗時エラー表示', async ({ page }) => {
    // SCEN-560
    await page.route('**/api/sync', route => route.abort());
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#sync-data-button');
    await expect(page.locator('.error-message')).toContainText('同期');
  });

  test('SCEN-561: ネットワークエラー処理', async ({ page }) => {
    // SCEN-561
    await page.goto(`${BASE_URL}/grades`);
    await page.route('**/*', route => route.abort());
    await page.click('#refresh-data-button');
    await expect(page.locator('.error-message')).toContainText('ネットワークに接続できません');
    await page.unroute('**/*');
  });

  test('SCEN-562: 重複模試結果登録エラー', async ({ page }) => {
    // SCEN-562
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-mock-exam-button');
    await page.fill('#exam-name', '第1回全国模試');
    await page.fill('#exam-date', '2024-01-15');
    await page.click('#register-button');
    await page.click('#add-mock-exam-button');
    await page.fill('#exam-name', '第1回全国模試');
    await page.fill('#exam-date', '2024-01-15');
    await page.click('#register-button');
    await expect(page.locator('.error-message')).toContainText('既に登録されています');
  });

  test('SCEN-563: 偏差値0入力時の動作', async ({ page }) => {
    // SCEN-563
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-grade-button');
    await page.selectOption('#subject-select', 'math');
    await page.fill('#deviation-input', '0');
    await page.click('#save-button');
    await expect(page.locator('#grade-list')).toContainText('0');
  });

  test('SCEN-564: 偏差値100入力時の動作', async ({ page }) => {
    // SCEN-564
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-grade-button');
    await page.fill('#deviation-input', '100');
    await page.press('#deviation-input', 'Enter');
    await expect(page.locator('#deviation-input')).toHaveValue('100');
  });

  test('SCEN-565: 未来日付指定時の動作', async ({ page }) => {
    // SCEN-565
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-grade-button');
    await page.fill('#test-date', '2025-12-31');
    await page.press('#test-date', 'Enter');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-566: 過去1年超期間指定動作', async ({ page }) => {
    // SCEN-566
    await page.goto(`${BASE_URL}/grades`);
    await page.fill('#start-date', '2022-01-01');
    await page.fill('#end-date', '2024-01-01');
    await page.click('#apply-filter-button');
    await expect(page.locator('.warning-message')).toBeVisible();
  });

  test('SCEN-567: 全科目0点時の表示', async ({ page }) => {
    // SCEN-567
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-zero-scores"]');
    await expect(page.locator('#total-score')).toContainText('0');
    await expect(page.locator('#average-score')).toContainText('0');
  });

  test('SCEN-568: 満点時のグラフ表示', async ({ page }) => {
    // SCEN-568
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-perfect-score"]');
    await page.click('#show-graph-button');
    await expect(page.locator('#grade-chart canvas')).toBeVisible();
  });

  test('SCEN-569: データ0件時の画面表示', async ({ page }) => {
    // SCEN-569
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#student-select');
    await page.click('[data-value="student-empty"]');
    await expect(page.locator('#empty-message')).toContainText('成績データがありません');
  });

  test('SCEN-570: 最大文字数入力時動作', async ({ page }) => {
    // SCEN-570
    await page.goto(`${BASE_URL}/grades`);
    await page.click('#add-grade-button');
    await page.fill('#subject-name', 'A'.repeat(50));
    await page.fill('#score-input', '1234567890');
    await page.fill('#comment', 'A'.repeat(500));
    await page.click('#save-button');
    await expect(page.locator('.success-message')).toBeVisible();
  });
});