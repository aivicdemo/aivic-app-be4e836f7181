import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("傾向分析結果画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'parent@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test("初期表示時に全グラフが正常描画", async ({ page }) => {
    // SCEN-514
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="score-trend-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-distribution-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="deviation-trend-graph"]')).toBeVisible();
  });

  test("総合偏差値推移グラフが正常表示", async ({ page }) => {
    // SCEN-515
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="total-deviation-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="x-axis-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="y-axis-deviation"]')).toBeVisible();
    await page.hover('[data-testid="data-point-1"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
  });

  test("科目別偏差値レーダーチャート表示", async ({ page }) => {
    // SCEN-516
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="subject-deviation-tab"]');
    await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-labels"]')).toBeVisible();
  });

  test("志望校合格可能性判定が正常表示", async ({ page }) => {
    // SCEN-517
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="admission-probability"]')).toBeVisible();
    await expect(page.locator('[data-testid="probability-percentage"]')).toBeVisible();
    await expect(page.locator('[data-testid="judgment-level"]')).toBeVisible();
    await expect(page.locator('[data-testid="judgment-criteria"]')).toBeVisible();
  });

  test("科目別成績推移グラフが描画", async ({ page }) => {
    // SCEN-518
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="subject-trend-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="x-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="y-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="graph-legend"]')).toBeVisible();
  });

  test("弱点科目ランキング表が表示", async ({ page }) => {
    // SCEN-519
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="weakness-ranking-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-name-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-rate-column"]')).toBeVisible();
  });

  test("模試結果比較チャートが描画", async ({ page }) => {
    // SCEN-520
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="mock-exam-comparison-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="mock-exam-comparison-chart"]')).toBeVisible();
  });

  test("学習時間対効果分析が表示", async ({ page }) => {
    // SCEN-521
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="study-time-effect-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-effect-analysis"]')).toBeVisible();
  });

  test("同偏差値帯受験生比較表が表示", async ({ page }) => {
    // SCEN-522
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="same-deviation-comparison"]')).toBeVisible();
    await expect(page.locator('[data-testid="comparison-table-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-comparison-data"]')).toBeVisible();
  });

  test("月別成績変動グラフが描画", async ({ page }) => {
    // SCEN-523
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="monthly-score-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="month-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-points"]')).toBeVisible();
  });

  test("科目別詳細分析ボタンをクリック", async ({ page }) => {
    // SCEN-524
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="subject-detail-analysis-button"]');
    await page.waitForURL(`${BASE_URL}/subject-detail-analysis`);
    await expect(page.locator('[data-testid="subject-detail-data"]')).toBeVisible();
  });

  test("分析期間を3ヶ月に変更", async ({ page }) => {
    // SCEN-525
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="analysis-period-dropdown"]');
    await page.click('[data-testid="period-3months"]');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="period-display"]')).toContainText('3ヶ月');
  });

  test("分析期間を6ヶ月に変更", async ({ page }) => {
    // SCEN-526
    await page.goto(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="analysis-period-dropdown"]');
    await page.click('[data-testid="period-6months"]');
    await page.click('[data-testid="apply-period-button"]');
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();
  });

  test("分析期間を1年に変更", async ({ page }) => {
    // SCEN-527
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="analysis-period-dropdown"]');
    await page.click('[data-testid="period-1year"]');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="period-display"]')).toContainText('1年');
  });

  test("表示科目で数学のみ選択", async ({ page }) => {
    // SCEN-528
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.uncheck('[data-testid="subject-japanese"]');
    await page.uncheck('[data-testid="subject-english"]');
    await page.check('[data-testid="subject-math"]');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="math-only-results"]')).toBeVisible();
  });

  test("表示科目で複数科目を選択", async ({ page }) => {
    // SCEN-529
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.check('[data-testid="subject-math"]');
    await page.check('[data-testid="subject-english"]');
    await page.check('[data-testid="subject-japanese"]');
    await page.click('[data-testid="update-button"]');
    await expect(page.locator('[data-testid="multi-subject-results"]')).toBeVisible();
  });

  test("全科目のチェックを外す", async ({ page }) => {
    // SCEN-530
    await page.goto(`${BASE_URL}/trend-analysis`);
    await page.uncheck('[data-testid="subject-japanese"]');
    await page.uncheck('[data-testid="subject-math"]');
    await page.uncheck('[data-testid="subject-english"]');
    await expect(page.locator('[data-testid="no-subject-message"]')).toBeVisible();
  });

  test("データなし期間を選択", async ({ page }) => {
    // SCEN-531
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="period-dropdown"]');
    await page.click('[data-testid="no-data-period"]');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="no-data-error"]')).toContainText('選択した期間にはデータが存在しません');
  });

  test("無効な期間指定でエラー", async ({ page }) => {
    // SCEN-532
    await page.goto(`${BASE_URL}/trend-analysis`);
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-05-01');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="invalid-period-error"]')).toContainText('期間の指定が無効です');
  });

  test("グラフ描画失敗時のエラー表示", async ({ page }) => {
    // SCEN-533
    await page.route('**/api/graph-data', route => route.abort());
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="graph-error"]')).toContainText('グラフの表示に失敗しました');
  });

  test("志望校未設定時のエラー表示", async ({ page }) => {
    // SCEN-534
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="no-target-school-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="set-target-school-link"]')).toBeVisible();
  });

  test("成績データ取得失敗エラー", async ({ page }) => {
    // SCEN-535
    await page.route('**/api/scores', route => route.fulfill({ status: 500 }));
    await page.goto(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="data-fetch-error"]')).toBeVisible();
  });

  test("ネットワークエラー時の処理", async ({ page }) => {
    // SCEN-536
    await page.route('**/api/**', route => route.abort());
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test("最小データ件数での表示", async ({ page }) => {
    // SCEN-537
    await page.goto(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="min-data-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="single-data-point"]')).toBeVisible();
    await expect(page.locator('[data-testid="need-more-data-message"]')).toBeVisible();
  });

  test("最大データ件数での表示", async ({ page }) => {
    // SCEN-538
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.selectOption('[data-testid="period-select"]', 'all');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test("偏差値0の場合の表示", async ({ page }) => {
    // SCEN-539
    await page.goto(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="deviation-zero"]')).toContainText('0');
    await expect(page.locator('[data-testid="zero-deviation-alert"]')).toBeVisible();
  });

  test("偏差値100の場合の表示", async ({ page }) => {
    // SCEN-540
    await page.goto(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="deviation-hundred"]')).toContainText('100');
    await expect(page.locator('[data-testid="max-level-comment"]')).toBeVisible();
  });

  test("同一偏差値データでの比較", async ({ page }) => {
    // SCEN-541
    await page.click('[data-testid="trend-analysis-menu"]');
    await page.waitForURL(`${BASE_URL}/trend-analysis`);
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="same-deviation-comparison"]')).toBeVisible();
    await expect(page.locator('[data-testid="detailed-comparison"]')).toBeVisible();
  });

  test("データが1件のみの場合", async ({ page }) => {
    // SCEN-542
    await page.goto(`${BASE_URL}/trend-analysis`);
    await expect(page.locator('[data-testid="single-data-point"]')).toBeVisible();
    await expect(page.locator('[data-testid="insufficient-data-message"]')).toContainText('データ不足のため傾向分析できません');
  });
});