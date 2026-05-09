import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("評価結果表示画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'parent@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-617: 受験生選択で評価結果正常表示', async ({ page }) => {
    // SCEN-617
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await page.click('button[data-testid="show-results"]');
    await expect(page.locator('[data-testid="evaluation-results"]')).toBeVisible();
  });

  test('SCEN-618: 期間選択で成績データ絞込み', async ({ page }) => {
    // SCEN-618
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button[data-testid="search"]');
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
  });

  test('SCEN-619: 模試種別選択で対象データ更新', async ({ page }) => {
    // SCEN-619
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="examType"]', '全国模試');
    await expect(page.locator('[data-testid="exam-results"]')).toContainText('全国模試');
    await page.selectOption('select[name="examType"]', '校内テスト');
    await expect(page.locator('[data-testid="exam-results"]')).toContainText('校内テスト');
  });

  test('SCEN-620: 総合偏差値が正確に表示される', async ({ page }) => {
    // SCEN-620
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await page.click('button[data-testid="show-results"]');
    const deviation = await page.locator('[data-testid="overall-deviation"]').textContent();
    expect(parseFloat(deviation)).toBeGreaterThan(0);
  });

  test('SCEN-621: 科目別偏差値一覧が表示される', async ({ page }) => {
    // SCEN-621
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="subject-deviation-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-deviation-list"] tbody tr')).toHaveCount(5);
  });

  test('SCEN-622: 偏差値推移グラフが描画される', async ({ page }) => {
    // SCEN-622
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toContainText('時期');
    await expect(page.locator('[data-testid="chart-y-axis"]')).toContainText('偏差値');
  });

  test('SCEN-623: 志望校別合格可能性が表示', async ({ page }) => {
    // SCEN-623
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="admission-possibility"]')).toBeVisible();
    const percentage = await page.locator('[data-testid="possibility-percentage"]').first().textContent();
    expect(percentage).toMatch(/\d+%/);
  });

  test('SCEN-624: 合格ライン比較チャート表示', async ({ page }) => {
    // SCEN-624
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await page.click('button[data-testid="chart-tab"]');
    await expect(page.locator('[data-testid="admission-line-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('SCEN-625: 成績ランキングが正常表示', async ({ page }) => {
    // SCEN-625
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="ranking-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="rank-position"]').first()).toContainText('1');
  });

  test('SCEN-626: 科目別分析結果が表示される', async ({ page }) => {
    // SCEN-626
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="subject-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="analysis-comment"]')).toBeVisible();
  });

  test('SCEN-627: 弱点科目がハイライト表示', async ({ page }) => {
    // SCEN-627
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-002');
    await expect(page.locator('[data-testid="weak-subject"]')).toHaveClass(/highlighted/);
  });

  test('SCEN-628: 改善提案メッセージが表示', async ({ page }) => {
    // SCEN-628
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="improvement-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="improvement-message"]')).not.toBeEmpty();
  });

  test('SCEN-629: 受験生未選択でエラー表示', async ({ page }) => {
    // SCEN-629
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.click('button[data-testid="show-results"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('受験生を選択してください');
  });

  test('SCEN-630: データなし期間選択でエラー', async ({ page }) => {
    // SCEN-630
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.fill('input[name="startDate"]', '2025-01-01');
    await page.fill('input[name="endDate"]', '2025-12-31');
    await page.click('button[data-testid="search"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データが存在しません');
  });

  test('SCEN-631: 模試種別未選択でエラー表示', async ({ page }) => {
    // SCEN-631
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await page.click('button[data-testid="show-results"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('模試種別を選択してください');
  });

  test('SCEN-632: 成績データ取得失敗時エラー', async ({ page }) => {
    // SCEN-632
    await page.route('**/api/grades/**', route => route.abort());
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データを取得できませんでした');
  });

  test('SCEN-633: グラフ描画失敗時エラー表示', async ({ page }) => {
    // SCEN-633
    await page.route('**/api/chart-data/**', route => route.fulfill({ status: 500 }));
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="chart-error"]')).toContainText('グラフを描画できませんでした');
  });

  test('SCEN-634: 志望校データなしでエラー', async ({ page }) => {
    // SCEN-634
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-no-school');
    await page.click('button[data-testid="show-results"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('志望校データが未登録');
  });

  test('SCEN-635: ランキングデータ欠損エラー', async ({ page }) => {
    // SCEN-635
    await page.route('**/api/ranking/**', route => route.abort());
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="ranking-error"]')).toContainText('ランキングデータを取得できませんでした');
  });

  test('SCEN-636: 分析結果取得失敗エラー', async ({ page }) => {
    // SCEN-636
    await page.route('**/api/analysis/**', route => route.fulfill({ status: 500 }));
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="analysis-error"]')).toContainText('分析結果の取得に失敗');
  });

  test('SCEN-637: 期間開始終了日同一で表示', async ({ page }) => {
    // SCEN-637
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.fill('input[name="startDate"]', '2024-01-15');
    await page.fill('input[name="endDate"]', '2024-01-15');
    await page.click('button[data-testid="search"]');
    await expect(page.locator('[data-testid="results"]')).toBeVisible();
  });

  test('SCEN-638: 最大期間選択時の動作確認', async ({ page }) => {
    // SCEN-638
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="period"]', 'max');
    await page.click('button[data-testid="show-results"]');
    await expect(page.locator('[data-testid="results"]')).toBeVisible({ timeout: 10000 });
  });

  test('SCEN-639: 全模試種別選択時の表示', async ({ page }) => {
    // SCEN-639
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="examType"]', 'all');
    await page.selectOption('select[name="student"]', 'student-001');
    await expect(page.locator('[data-testid="all-exam-results"]')).toBeVisible();
  });

  test('SCEN-640: 偏差値0の場合の表示確認', async ({ page }) => {
    // SCEN-640
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-zero-deviation');
    await expect(page.locator('[data-testid="deviation-value"]')).toContainText('0');
    await expect(page.locator('[data-testid="deviation-message"]')).toBeVisible();
  });

  test('SCEN-641: 偏差値100の場合の表示確認', async ({ page }) => {
    // SCEN-641
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-max-deviation');
    await expect(page.locator('[data-testid="deviation-value"]')).toContainText('100');
    await expect(page.locator('[data-testid="rank-display"]')).toContainText('S+');
  });

  test('SCEN-642: 合格可能性0%時の表示', async ({ page }) => {
    // SCEN-642
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-zero-possibility');
    await expect(page.locator('[data-testid="possibility-percentage"]')).toContainText('0%');
    await expect(page.locator('[data-testid="encouragement-message"]')).toBeVisible();
  });

  test('SCEN-643: 合格可能性100%時の表示', async ({ page }) => {
    // SCEN-643
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-max-possibility');
    await expect(page.locator('[data-testid="possibility-percentage"]')).toContainText('100%');
    await expect(page.locator('[data-testid="success-icon"]')).toHaveClass(/green/);
  });

  test('SCEN-644: 最下位ランキング時の表示', async ({ page }) => {
    // SCEN-644
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-last-rank');
    await expect(page.locator('[data-testid="rank-position"]')).toBeVisible();
    await expect(page.locator('[data-testid="comparison-display"]')).toBeVisible();
  });

  test('SCEN-645: 全科目満点時の分析結果', async ({ page }) => {
    // SCEN-645
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-perfect-score');
    await expect(page.locator('[data-testid="total-score"]')).toContainText('満点');
    await expect(page.locator('[data-testid="perfect-advice"]')).toBeVisible();
  });

  test('SCEN-646: 全科目0点時の弱点表示', async ({ page }) => {
    // SCEN-646
    await page.goto(`${BASE_URL}/evaluation-results`);
    await page.selectOption('select[name="student"]', 'student-zero-score');
    await expect(page.locator('[data-testid="weakness-message"]')).toContainText('全科目において基礎学習が必要');
    await expect(page.locator('[data-testid="results"]')).toBeVisible();
  });
});