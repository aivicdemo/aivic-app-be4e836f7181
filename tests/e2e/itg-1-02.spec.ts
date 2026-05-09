import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績データ管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-034: 成績データ一覧が正常に表示される', async ({ page }) => {
    // SCEN-034
    await page.click('[data-testid="menu-score-management"]');
    await page.waitForSelector('[data-testid="score-table"]');
    await expect(page.locator('[data-testid="table-header-subject"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-data-row"]').first()).toBeVisible();
  });

  test('SCEN-035: 模試結果を正常に登録できる', async ({ page }) => {
    // SCEN-035
    await page.click('[data-testid="menu-mock-exam"]');
    await page.click('[data-testid="add-new-button"]');
    await page.fill('[data-testid="mock-name"]', '第1回全国模試');
    await page.fill('[data-testid="exam-date"]', '2024-03-15');
    await page.fill('[data-testid="japanese-score"]', '85');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-036: 予備校成績を正常に取得できる', async ({ page }) => {
    // SCEN-036
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="prep-school-tab"]');
    await page.selectOption('[data-testid="prep-school-select"]', 'kawai');
    await page.click('[data-testid="fetch-scores-button"]');
    await expect(page.locator('[data-testid="prep-school-scores"]')).toBeVisible();
  });

  test('SCEN-037: 科目別成績を正常に入力できる', async ({ page }) => {
    // SCEN-037
    await page.click('[data-testid="menu-score-input"]');
    await page.selectOption('[data-testid="subject-select"]', 'math');
    await page.fill('[data-testid="score-input"]', '85');
    await page.fill('[data-testid="test-date"]', '2024-03-15');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-038: 偏差値推移グラフが表示される', async ({ page }) => {
    // SCEN-038
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="deviation-trend-tab"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toBeVisible();
  });

  test('SCEN-039: 科目別レーダーチャートが表示', async ({ page }) => {
    // SCEN-039
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="radar-chart-button"]');
    await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-labels"]')).toBeVisible();
  });

  test('SCEN-040: 模試日程を正常に選択できる', async ({ page }) => {
    // SCEN-040
    await page.click('[data-testid="menu-mock-exam"]');
    await page.click('[data-testid="schedule-select-button"]');
    await page.click('[data-testid="mock-schedule-item"]');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="selected-schedule"]')).toBeVisible();
  });

  test('SCEN-041: 成績データを正常に検索できる', async ({ page }) => {
    // SCEN-041
    await page.click('[data-testid="menu-score-management"]');
    await page.fill('[data-testid="search-subject"]', '数学');
    await page.fill('[data-testid="search-from"]', '2024-01-01');
    await page.fill('[data-testid="search-to"]', '2024-03-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-042: 期間指定で成績データ絞り込み', async ({ page }) => {
    // SCEN-042
    await page.click('[data-testid="menu-score-management"]');
    await page.fill('[data-testid="filter-start-date"]', '2024-01-01');
    await page.fill('[data-testid="filter-end-date"]', '2024-03-31');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
  });

  test('SCEN-043: 科目絞り込みが正常に動作する', async ({ page }) => {
    // SCEN-043
    await page.click('[data-testid="menu-score-management"]');
    await page.selectOption('[data-testid="subject-filter"]', 'math');
    await expect(page.locator('[data-testid="filtered-math-results"]')).toBeVisible();
    await page.selectOption('[data-testid="subject-filter"]', 'all');
    await expect(page.locator('[data-testid="all-results"]')).toBeVisible();
  });

  test('SCEN-044: 偏差値範囲スライダーで絞り込み', async ({ page }) => {
    // SCEN-044
    await page.goto(`${baseURL}/scores`);
    await page.locator('[data-testid="deviation-slider-min"]').fill('50');
    await page.locator('[data-testid="deviation-slider-max"]').fill('65');
    await page.click('[data-testid="apply-filter-button"]');
    await expect(page.locator('[data-testid="filtered-deviation-results"]')).toBeVisible();
  });

  test('SCEN-045: 成績データを正常に編集できる', async ({ page }) => {
    // SCEN-045
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="edit-score-button"]');
    await page.fill('[data-testid="edit-subject"]', '数学A');
    await page.fill('[data-testid="edit-score"]', '90');
    await page.click('[data-testid="save-edit-button"]');
    await expect(page.locator('[data-testid="update-success-message"]')).toBeVisible();
  });

  test('SCEN-046: 必須項目未入力で登録エラー表示', async ({ page }) => {
    // SCEN-046
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="add-new-button"]');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="required-field-error"]')).toBeVisible();
  });

  test('SCEN-047: 不正な偏差値入力でエラー表示', async ({ page }) => {
    // SCEN-047
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="add-new-button"]');
    await page.fill('[data-testid="deviation-input"]', '-10');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="deviation-error"]')).toBeVisible();
  });

  test('SCEN-048: 存在しない模試選択でエラー表示', async ({ page }) => {
    // SCEN-048
    await page.goto(`${baseURL}/scores?mockId=MOCK-99999`);
    await expect(page.locator('[data-testid="mock-not-found-error"]')).toBeVisible();
  });

  test('SCEN-049: 予備校成績取得失敗時エラー表示', async ({ page }) => {
    // SCEN-049
    await page.route('**/api/prep-school-scores', route => route.abort());
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="fetch-prep-scores-button"]');
    await expect(page.locator('[data-testid="fetch-error-message"]')).toBeVisible();
  });

  test('SCEN-050: 無効な期間指定でエラー表示', async ({ page }) => {
    // SCEN-050
    await page.click('[data-testid="menu-score-management"]');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="invalid-period-error"]')).toBeVisible();
  });

  test('SCEN-051: 権限なし成績編集でエラー表示', async ({ page }) => {
    // SCEN-051
    await page.goto(`${baseURL}/scores/edit/1?role=guest`);
    await expect(page.locator('[data-testid="permission-error"]')).toBeVisible();
  });

  test('SCEN-052: ネットワークエラー時エラー表示', async ({ page }) => {
    // SCEN-052
    await page.context().setOffline(true);
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="refresh-button"]');
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  });

  test('SCEN-053: 偏差値0入力時の動作確認', async ({ page }) => {
    // SCEN-053
    await page.click('[data-testid="menu-score-input"]');
    await page.fill('[data-testid="deviation-input"]', '0');
    await page.fill('[data-testid="test-name"]', 'テスト');
    await page.fill('[data-testid="test-date"]', '2024-03-15');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="deviation-zero-saved"]')).toBeVisible();
  });

  test('SCEN-054: 偏差値100入力時の動作確認', async ({ page }) => {
    // SCEN-054
    await page.click('[data-testid="menu-score-input"]');
    await page.fill('[data-testid="deviation-input"]', '100');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-055: 全科目未選択時の動作確認', async ({ page }) => {
    // SCEN-055
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="display-button"]');
    await expect(page.locator('[data-testid="no-subject-selected-error"]')).toBeVisible();
  });

  test('SCEN-056: 最大文字数入力時の動作確認', async ({ page }) => {
    // SCEN-056
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="add-new-button"]');
    await page.fill('[data-testid="subject-name"]', 'A'.repeat(100));
    await page.fill('[data-testid="score-input"]', '9999');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="max-length-saved"]')).toBeVisible();
  });

  test('SCEN-057: 同一日程重複登録時の動作確認', async ({ page }) => {
    // SCEN-057
    await page.click('[data-testid="menu-score-management"]');
    await page.click('[data-testid="add-new-button"]');
    await page.fill('[data-testid="test-date"]', '2024-03-15');
    await page.fill('[data-testid="subject"]', '数学');
    await page.click('[data-testid="save-button"]');
    await page.fill('[data-testid="subject"]', '英語');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="duplicate-date-message"]')).toBeVisible();
  });

  test('SCEN-058: 過去日付入力時の動作確認', async ({ page }) => {
    // SCEN-058
    await page.click('[data-testid="menu-score-input"]');
    await page.fill('[data-testid="test-date"]', '2024-01-01');
    await page.fill('[data-testid="score-input"]', '85');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="past-date-saved"]')).toBeVisible();
  });

  test('SCEN-059: 未来日付入力時の動作確認', async ({ page }) => {
    // SCEN-059
    await page.click('[data-testid="menu-score-input"]');
    await page.fill('[data-testid="test-date"]', '2025-12-31');
    await page.fill('[data-testid="score-input"]', '85');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="future-date-error"]')).toBeVisible();
  });

  test('SCEN-060: 空データ状態での画面表示確認', async ({ page }) => {
    // SCEN-060
    await page.goto(`${baseURL}/scores?empty=true`);
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-data-button"]')).toBeVisible();
  });

  test('SCEN-061: 大量データ表示時の動作確認', async ({ page }) => {
    // SCEN-061
    await page.goto(`${baseURL}/scores?count=1000`);
    await page.waitForSelector('[data-testid="score-table"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="score-data-row"]')).toHaveCount(1000);
    await page.locator('[data-testid="score-table"]').scroll({ top: 5000 });
    await expect(page.locator('[data-testid="pagination-next"]')).toBeVisible();
  });
});