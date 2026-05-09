import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("志望校合格ライン比較画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@test.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-705: 志望校一覧が正常に表示される', async ({ page }) => {
    // SCEN-705
    await page.click('[data-testid="menu-school-comparison"]');
    await page.waitForURL('**/school-comparison');
    await expect(page.locator('[data-testid="school-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-item"]')).toHaveCount(3);
  });

  test('SCEN-706: 合格ライン偏差値が正しく表示される', async ({ page }) => {
    // SCEN-706
    await page.click('[data-testid="menu-school-management"]');
    await page.waitForURL('**/school-comparison');
    await expect(page.locator('[data-testid="deviation-score"]')).toContainText(/\d+\.\d/);
    await expect(page.locator('[data-testid="school-deviation"]').first()).toBeVisible();
  });

  test('SCEN-707: 現在偏差値が正しく表示される', async ({ page }) => {
    // SCEN-707
    await page.click('[data-testid="menu-school-comparison"]');
    await page.waitForURL('**/school-comparison');
    await expect(page.locator('[data-testid="current-deviation"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-deviation"]')).toContainText(/\d+/);
  });

  test('SCEN-708: 偏差値差分が正しく計算表示される', async ({ page }) => {
    // SCEN-708
    await page.click('[data-testid="menu-school-management"]');
    await page.check('[data-testid="school-1"]');
    await page.check('[data-testid="school-2"]');
    await page.click('[data-testid="compare-button"]');
    await expect(page.locator('[data-testid="deviation-diff"]')).toBeVisible();
  });

  test('SCEN-709: 合格可能性判定が正しく表示される', async ({ page }) => {
    // SCEN-709
    await page.click('[data-testid="menu-school-comparison"]');
    await page.click('[data-testid="school-select"]');
    await expect(page.locator('[data-testid="success-rate"]')).toContainText(/[A-E]判定/);
    await expect(page.locator('[data-testid="success-percentage"]')).toBeVisible();
  });

  test('SCEN-710: 科目別偏差値グラフが表示される', async ({ page }) => {
    // SCEN-710
    await page.click('[data-testid="menu-school-comparison"]');
    await page.waitForURL('**/school-comparison');
    await expect(page.locator('[data-testid="subject-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-chart"]')).toHaveCount(5);
  });

  test('SCEN-711: 志望校追加ボタンで学校を追加できる', async ({ page }) => {
    // SCEN-711
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[data-testid="school-search"]', '東京高校');
    await page.click('[data-testid="add-confirm-button"]');
    await expect(page.locator('[data-testid="school-list"]')).toContainText('東京高校');
  });

  test('SCEN-712: 志望校削除ボタンで学校を削除できる', async ({ page }) => {
    // SCEN-712
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="delete-school-button"]');
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('[data-testid="deleted-school"]')).not.toBeVisible();
  });

  test('SCEN-713: 模試種別選択で表示が切り替わる', async ({ page }) => {
    // SCEN-713
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.selectOption('[data-testid="exam-type"]', '進研模試');
    await expect(page.locator('[data-testid="exam-data"]')).toContainText('進研模試');
    await expect(page.locator('[data-testid="school-info"]')).toBeVisible();
  });

  test('SCEN-714: 表示期間選択で対象期間を変更できる', async ({ page }) => {
    // SCEN-714
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.selectOption('[data-testid="period-select"]', '6months');
    await expect(page.locator('[data-testid="period-data"]')).toContainText('直近6ヶ月');
    await expect(page.locator('[data-testid="graph-data"]')).toBeVisible();
  });

  test('SCEN-715: 科目絞り込みで表示科目を制限できる', async ({ page }) => {
    // SCEN-715
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.check('[data-testid="subject-math"]');
    await page.check('[data-testid="subject-english"]');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="subject-display"]')).toHaveCount(2);
  });

  test('SCEN-716: 合格可能性フィルターで絞り込める', async ({ page }) => {
    // SCEN-716
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.selectOption('[data-testid="success-filter"]', 'A');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="filtered-schools"]')).toContainText('A判定');
  });

  test('SCEN-717: 志望校データなしでメッセージ表示', async ({ page }) => {
    // SCEN-717
    await page.goto(`${BASE_URL}/school-comparison`);
    await expect(page.locator('[data-testid="no-schools-message"]')).toContainText('志望校が登録されていません');
    await expect(page.locator('[data-testid="register-school-link"]')).toBeVisible();
  });

  test('SCEN-718: 成績データなしでエラー表示', async ({ page }) => {
    // SCEN-718
    await page.goto(`${BASE_URL}/school-comparison`);
    await expect(page.locator('[data-testid="no-grade-error"]')).toContainText('成績データが登録されていません');
    await expect(page.locator('[data-testid="grade-register-guide"]')).toBeVisible();
  });

  test('SCEN-719: 存在しない志望校追加でエラー', async ({ page }) => {
    // SCEN-719
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[data-testid="school-search"]', 'テスト架空高等学校');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="school-not-found"]')).toContainText('指定された学校が見つかりません');
  });

  test('SCEN-720: 削除済み志望校削除でエラー', async ({ page }) => {
    // SCEN-720
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="delete-school-1"]');
    await page.click('[data-testid="confirm-delete"]');
    await page.click('[data-testid="delete-school-1"]');
    await expect(page.locator('[data-testid="already-deleted-error"]')).toBeVisible();
  });

  test('SCEN-721: 無効な模試種別選択でエラー', async ({ page }) => {
    // SCEN-721
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.selectOption('[data-testid="exam-type"]', 'invalid-exam');
    await page.click('[data-testid="compare-execute"]');
    await expect(page.locator('[data-testid="invalid-exam-error"]')).toContainText('選択された模試種別が無効です');
  });

  test('SCEN-722: 未来日期間選択でエラー表示', async ({ page }) => {
    // SCEN-722
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.fill('[data-testid="end-date"]', '2025-12-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="future-date-error"]')).toContainText('未来の日付は選択できません');
  });

  test('SCEN-723: 全科目絞り込み解除でエラー', async ({ page }) => {
    // SCEN-723
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="uncheck-all"]');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="no-subject-error"]')).toContainText('科目を1つ以上選択してください');
  });

  test('SCEN-724: ネットワークエラー時の表示', async ({ page }) => {
    // SCEN-724
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-725: 志望校0校時の表示状態', async ({ page }) => {
    // SCEN-725
    await page.click('[data-testid="menu-school-comparison"]');
    await expect(page.locator('[data-testid="zero-schools-message"]')).toContainText('志望校が登録されていません');
    await expect(page.locator('[data-testid="register-link"]')).toBeVisible();
  });

  test('SCEN-726: 志望校上限登録時の追加制御', async ({ page }) => {
    // SCEN-726
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[data-testid="school-search"]', '新規高校');
    await page.click('[data-testid="add-confirm"]');
    await expect(page.locator('[data-testid="limit-reached-error"]')).toContainText('志望校登録上限に達しています');
  });

  test('SCEN-727: 偏差値0時の差分表示', async ({ page }) => {
    // SCEN-727
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="compare-execute"]');
    await expect(page.locator('[data-testid="deviation-diff"]')).toContainText('合格ラインまで');
    await expect(page.locator('[data-testid="diff-value"]')).toBeVisible();
  });

  test('SCEN-728: 偏差値100時の表示', async ({ page }) => {
    // SCEN-728
    await page.goto(`${BASE_URL}/school-comparison`);
    await expect(page.locator('[data-testid="deviation-100"]')).toContainText('100');
    await expect(page.locator('[data-testid="comparison-result"]')).toBeVisible();
  });

  test('SCEN-729: 同一偏差値時の判定表示', async ({ page }) => {
    // SCEN-729
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.click('[data-testid="compare-execute"]');
    await expect(page.locator('[data-testid="same-deviation-judgment"]')).toBeVisible();
    await expect(page.locator('[data-testid="detailed-judgment"]')).toContainText('判定');
  });

  test('SCEN-730: 最短期間選択時の表示', async ({ page }) => {
    // SCEN-730
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.selectOption('[data-testid="period-select"]', '1month');
    await expect(page.locator('[data-testid="shortest-period-data"]')).toBeVisible();
    await expect(page.locator('[data-testid="period-message"]')).toContainText('1ヶ月');
  });

  test('SCEN-731: 最長期間選択時の表示', async ({ page }) => {
    // SCEN-731
    await page.click('[data-testid="menu-school-comparison"]');
    await page.selectOption('[data-testid="period-select"]', '3years');
    await page.click('[data-testid="update-button"]');
    await expect(page.locator('[data-testid="longest-period-data"]')).toBeVisible();
  });

  test('SCEN-732: 1科目のみ選択時の表示', async ({ page }) => {
    // SCEN-732
    await page.goto(`${BASE_URL}/school-comparison`);
    await page.check('[data-testid="subject-math"]');
    await page.click('[data-testid="compare-execute"]');
    await expect(page.locator('[data-testid="single-subject-display"]')).toHaveCount(1);
  });

  test('SCEN-733: 合格可能性100%時の表示', async ({ page }) => {
    // SCEN-733
    await page.goto(`${BASE_URL}/school-comparison`);
    await expect(page.locator('[data-testid="success-rate-100"]')).toContainText('100%');
    await expect(page.locator('[data-testid="success-icon-green"]')).toBeVisible();
  });

  test('SCEN-734: 合格可能性0%時の表示', async ({ page }) => {
    // SCEN-734
    await page.click('[data-testid="menu-school-comparison"]');
    await page.click('[data-testid="compare-display"]');
    await expect(page.locator('[data-testid="success-rate-0"]')).toContainText('0%');
    await expect(page.locator('[data-testid="warning-red"]')).toBeVisible();
  });
});