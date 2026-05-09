import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績詳細表示画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test("SCEN-763: 成績詳細画面が正常に表示される", async ({ page }) => {
    // SCEN-763
    await page.click('[data-testid="grade-list-link"]');
    await page.click('[data-testid="grade-item"]:first-child');
    await expect(page.locator('[data-testid="grade-detail"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-name"]')).toBeVisible();
  });

  test("SCEN-764: 受験生名が正しく表示される", async ({ page }) => {
    // SCEN-764
    await page.click('[data-testid="grade-detail-link"]');
    await expect(page.locator('[data-testid="student-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-name"]')).toContainText('山田太郎');
  });

  test("SCEN-765: 模試名・実施日が正しく表示される", async ({ page }) => {
    // SCEN-765
    await page.click('[data-testid="grade-list-link"]');
    await page.click('[data-testid="grade-item"]:first-child');
    await expect(page.locator('[data-testid="exam-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-date"]')).toHaveText(/\d{4}\/\d{2}\/\d{2}/);
  });

  test("SCEN-766: 総合偏差値が正しく表示される", async ({ page }) => {
    // SCEN-766
    await page.click('[data-testid="grade-detail-button"]');
    const deviation = page.locator('[data-testid="total-deviation"]');
    await expect(deviation).toBeVisible();
    await expect(deviation).toHaveText(/\d{2}\.\d/);
  });

  test("SCEN-767: 総合得点が正しく表示される", async ({ page }) => {
    // SCEN-767
    await page.click('[data-testid="grade-list-link"]');
    await page.click('[data-testid="detail-button"]:first-child');
    await expect(page.locator('[data-testid="total-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-score"]')).toHaveText(/\d+/);
  });

  test("SCEN-768: 科目別成績テーブルが正常表示", async ({ page }) => {
    // SCEN-768
    await page.click('[data-testid="grade-detail-button"]');
    await expect(page.locator('[data-testid="subject-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-row"]').first()).toBeVisible();
  });

  test("SCEN-769: 科目別偏差値グラフが正常描画", async ({ page }) => {
    // SCEN-769
    await page.click('[data-testid="grade-detail-link"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-y-axis"]')).toBeVisible();
  });

  test("SCEN-770: 偏差値推移チャートが正常描画", async ({ page }) => {
    // SCEN-770
    await page.click('[data-testid="grade-detail-link"]');
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
    await page.hover('[data-testid="chart-point"]:first-child');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
  });

  test("SCEN-771: 志望校合格可能性が正常表示", async ({ page }) => {
    // SCEN-771
    await page.click('[data-testid="grade-detail-link"]');
    await expect(page.locator('[data-testid="school-probability"]')).toBeVisible();
    await expect(page.locator('[data-testid="probability-percentage"]')).toHaveText(/%/);
  });

  test("SCEN-772: 前回比較データが正常表示", async ({ page }) => {
    // SCEN-772
    await page.click('[data-testid="grade-detail-button"]');
    await expect(page.locator('[data-testid="comparison-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-difference"]')).toBeVisible();
  });

  test("SCEN-773: 全国順位・校内順位が正常表示", async ({ page }) => {
    // SCEN-773
    await page.click('[data-testid="grade-detail-link"]');
    await expect(page.locator('[data-testid="national-rank"]')).toHaveText(/\d+位\/\d+人中/);
    await expect(page.locator('[data-testid="school-rank"]')).toHaveText(/\d+位\/\d+人中/);
  });

  test("SCEN-774: 弱点科目が正しくハイライト", async ({ page }) => {
    // SCEN-774
    await page.click('[data-testid="grade-detail-button"]');
    await expect(page.locator('[data-testid="weak-subject"]')).toHaveClass(/highlight/);
    await expect(page.locator('[data-testid="weak-subject-icon"]')).toBeVisible();
  });

  test("SCEN-775: 成績分析コメントが正常表示", async ({ page }) => {
    // SCEN-775
    await page.click('[data-testid="grade-detail-link"]');
    await expect(page.locator('[data-testid="analysis-comment"]')).toBeVisible();
    await expect(page.locator('[data-testid="analysis-comment"]')).not.toBeEmpty();
  });

  test("SCEN-776: 存在しない受験生IDでエラー", async ({ page }) => {
    // SCEN-776
    await page.goto(`${baseURL}/grade-detail?studentId=999999`);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('受験生が見つかりません');
  });

  test("SCEN-777: 無効な模試IDでエラー表示", async ({ page }) => {
    // SCEN-777
    await page.goto(`${baseURL}/grade-detail?examId=invalid`);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('模試が見つかりません');
  });

  test("SCEN-778: データ取得失敗時のエラー表示", async ({ page }) => {
    // SCEN-778
    await page.route('**/api/grades/**', route => route.abort());
    await page.click('[data-testid="grade-detail-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データ取得に失敗');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test("SCEN-779: 権限なしアクセスでエラー", async ({ page }) => {
    // SCEN-779
    await page.goto(`${baseURL}/logout`);
    await page.goto(`${baseURL}/grade-detail`);
    await expect(page.locator('[data-testid="access-denied"]')).toContainText('権限がありません');
  });

  test("SCEN-780: グラフ描画失敗時のエラー", async ({ page }) => {
    // SCEN-780
    await page.route('**/api/chart-data', route => route.fulfill({ status: 500 }));
    await page.click('[data-testid="grade-detail-link"]');
    await expect(page.locator('[data-testid="chart-error"]')).toContainText('グラフの読み込みに失敗');
    await expect(page.locator('[data-testid="chart-retry"]')).toBeVisible();
  });

  test("SCEN-781: 偏差値0の場合の表示", async ({ page }) => {
    // SCEN-781
    await page.click('[data-testid="zero-deviation-grade"]');
    await expect(page.locator('[data-testid="deviation-value"]')).toHaveText('0');
  });

  test("SCEN-782: 偏差値100の場合の表示", async ({ page }) => {
    // SCEN-782
    await page.click('[data-testid="max-deviation-grade"]');
    await expect(page.locator('[data-testid="deviation-value"]')).toHaveText('100');
  });

  test("SCEN-783: 得点0点の場合の表示", async ({ page }) => {
    // SCEN-783
    await page.click('[data-testid="zero-score-grade"]');
    await expect(page.locator('[data-testid="score-value"]')).toHaveText('0');
    await expect(page.locator('[data-testid="chart-point"]')).toBeVisible();
  });

  test("SCEN-784: 満点の場合の表示", async ({ page }) => {
    // SCEN-784
    await page.click('[data-testid="perfect-score-grade"]');
    await expect(page.locator('[data-testid="score-value"]')).toHaveText('100');
    await expect(page.locator('[data-testid="perfect-badge"]')).toBeVisible();
  });

  test("SCEN-785: 初回受験で前回比較なし", async ({ page }) => {
    // SCEN-785
    await page.click('[data-testid="first-exam-grade"]');
    await expect(page.locator('[data-testid="comparison-section"]')).toContainText('前回受験データがありません');
  });

  test("SCEN-786: 科目数最大時のテーブル表示", async ({ page }) => {
    // SCEN-786
    await page.click('[data-testid="max-subjects-grade"]');
    await expect(page.locator('[data-testid="subject-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-row"]')).toHaveCount(10);
  });

  test("SCEN-787: 科目数1の場合の表示", async ({ page }) => {
    // SCEN-787
    await page.click('[data-testid="single-subject-grade"]');
    await expect(page.locator('[data-testid="subject-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-row"]')).toHaveCount(1);
  });

  test("SCEN-788: 全国1位の場合の順位表示", async ({ page }) => {
    // SCEN-788
    await page.click('[data-testid="first-place-grade"]');
    await expect(page.locator('[data-testid="national-rank"]')).toContainText('1位');
    await expect(page.locator('[data-testid="rank-badge"]')).toHaveClass(/gold/);
  });

  test("SCEN-789: 全国最下位の場合の順位表示", async ({ page }) => {
    // SCEN-789
    await page.click('[data-testid="last-place-grade"]');
    await expect(page.locator('[data-testid="national-rank"]')).toHaveText(/\d+位\/\d+人中/);
  });

  test("SCEN-790: 全科目満点時の弱点表示", async ({ page }) => {
    // SCEN-790
    await page.click('[data-testid="all-perfect-grade"]');
    await expect(page.locator('[data-testid="weakness-section"]')).toContainText('弱点なし');
  });

  test("SCEN-791: 長い受験生名の表示", async ({ page }) => {
    // SCEN-791
    await page.click('[data-testid="long-name-student"]');
    const nameElement = page.locator('[data-testid="student-name"]');
    await expect(nameElement).toBeVisible();
    await expect(nameElement).toHaveCSS('text-overflow', 'ellipsis');
  });

  test("SCEN-792: 長いコメントの表示", async ({ page }) => {
    // SCEN-792
    await page.click('[data-testid="long-comment-grade"]');
    await expect(page.locator('[data-testid="comment-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="comment-scroll"]')).toBeVisible();
  });
});