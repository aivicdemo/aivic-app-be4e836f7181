import { test, expect } from '@playwright/test';

test.describe("合格可能性評価画面", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('SCEN-676: 受験生選択で合格可能性が表示される', async ({ page }) => {
    // SCEN-676
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="student-select"]');
    await page.click('[data-testid="student-option-1"]');
    await expect(page.locator('[data-testid="evaluation-result"]')).toBeVisible();
  });

  test('SCEN-677: 志望校一覧が正常に表示される', async ({ page }) => {
    // SCEN-677
    await page.click('[data-testid="menu-evaluation"]');
    await expect(page.locator('[data-testid="school-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-deviation"]')).toBeVisible();
  });

  test('SCEN-678: 合格可能性判定結果が表示される', async ({ page }) => {
    // SCEN-678
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="student-select"]');
    await page.click('[data-testid="student-option-1"]');
    await page.click('[data-testid="evaluate-button"]');
    await expect(page.locator('[data-testid="judgment-result"]')).toBeVisible();
  });

  test('SCEN-679: 偏差値推移グラフが描画される', async ({ page }) => {
    // SCEN-679
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="student-select"]');
    await page.click('[data-testid="student-option-1"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toBeVisible();
  });

  test('SCEN-680: 科目別レーダーチャートが表示される', async ({ page }) => {
    // SCEN-680
    await page.click('[data-testid="menu-evaluation"]');
    await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-labels"]')).toBeVisible();
  });

  test('SCEN-681: 最新模試結果が表示される', async ({ page }) => {
    // SCEN-681
    await page.click('[data-testid="menu-evaluation"]');
    await expect(page.locator('[data-testid="latest-exam-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="exam-date"]')).toBeVisible();
  });

  test('SCEN-682: 合格ライン偏差値比較表が表示される', async ({ page }) => {
    // SCEN-682
    await page.click('[data-testid="menu-evaluation"]');
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-deviation-value"]')).toBeVisible();
  });

  test('SCEN-683: 判定履歴一覧が表示される', async ({ page }) => {
    // SCEN-683
    await page.click('[data-testid="menu-evaluation"]');
    await expect(page.locator('[data-testid="judgment-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toBeVisible();
  });

  test('SCEN-684: 評価基準日付を選択して更新される', async ({ page }) => {
    // SCEN-684
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="date-select"]');
    await page.fill('[data-testid="evaluation-date"]', '2024-01-15');
    await page.click('[data-testid="update-button"]');
    await expect(page.locator('[data-testid="updated-result"]')).toBeVisible();
  });

  test('SCEN-685: 志望校追加ボタンで登録画面に遷移', async ({ page }) => {
    // SCEN-685
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="add-school-button"]');
    await page.waitForURL('**/schools/add');
    await expect(page.locator('[data-testid="school-form"]')).toBeVisible();
  });

  test('SCEN-686: 志望校編集ボタンで編集画面に遷移', async ({ page }) => {
    // SCEN-686
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="edit-school-button"]');
    await page.waitForURL('**/schools/edit');
    await expect(page.locator('[data-testid="school-edit-form"]')).toBeVisible();
  });

  test('SCEN-687: 志望校削除ボタンで削除確認表示', async ({ page }) => {
    // SCEN-687
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="delete-school-button"]');
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-yes-button"]')).toBeVisible();
  });

  test('SCEN-688: 受験生未選択時エラーメッセージ表示', async ({ page }) => {
    // SCEN-688
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="evaluate-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('受験生を選択してください');
  });

  test('SCEN-689: 志望校未登録時メッセージ表示', async ({ page }) => {
    // SCEN-689
    await page.goto(`${baseURL}/evaluation-no-schools`);
    await expect(page.locator('[data-testid="no-schools-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-school-link"]')).toBeVisible();
  });

  test('SCEN-690: 模試結果未登録時メッセージ表示', async ({ page }) => {
    // SCEN-690
    await page.goto(`${baseURL}/evaluation-no-exams`);
    await expect(page.locator('[data-testid="no-exam-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-exam-link"]')).toBeVisible();
  });

  test('SCEN-691: データ取得失敗時エラー表示', async ({ page }) => {
    // SCEN-691
    await page.route('**/api/evaluation/**', route => route.abort());
    await page.click('[data-testid="menu-evaluation"]');
    await expect(page.locator('[data-testid="network-error"]')).toContainText('データの取得に失敗しました');
  });

  test('SCEN-692: 無効な日付選択時エラー表示', async ({ page }) => {
    // SCEN-692
    await page.click('[data-testid="menu-evaluation"]');
    await page.fill('[data-testid="date-input"]', '2024/13/32');
    await page.click('[data-testid="main-content"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('正しい日付を入力してください');
  });

  test('SCEN-693: 存在しない志望校編集時エラー表示', async ({ page }) => {
    // SCEN-693
    await page.goto(`${baseURL}/schools/99999/edit`);
    await expect(page.locator('[data-testid="school-not-found"]')).toContainText('指定された志望校が見つかりません');
  });

  test('SCEN-694: 削除権限なし時エラーメッセージ表示', async ({ page }) => {
    // SCEN-694
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="email"]', 'readonly@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="menu-evaluation"]');
    await page.click('[data-testid="delete-button"]');
    await expect(page.locator('[data-testid="permission-error"]')).toContainText('削除権限がありません');
  });

  test('SCEN-695: 受験生選択項目が1件の場合の動作', async ({ page }) => {
    // SCEN-695
    await page.goto(`${baseURL}/evaluation-single-student`);
    await page.click('[data-testid="student-select"]');
    await expect(page.locator('[data-testid="student-option"]')).toHaveCount(1);
    await page.click('[data-testid="student-option-1"]');
    await expect(page.locator('[data-testid="evaluation-content"]')).toBeVisible();
  });

  test('SCEN-696: 志望校が上限数登録時の追加操作', async ({ page }) => {
    // SCEN-696
    await page.goto(`${baseURL}/evaluation-max-schools`);
    await page.click('[data-testid="add-school-button"]');
    await expect(page.locator('[data-testid="limit-error"]')).toContainText('志望校が上限数に達しています');
  });

  test('SCEN-697: 偏差値が最大値時の表示確認', async ({ page }) => {
    // SCEN-697
    await page.goto(`${baseURL}/evaluation-max-deviation`);
    await expect(page.locator('[data-testid="deviation-value"]')).toContainText('80');
    await expect(page.locator('[data-testid="judgment-result"]')).toContainText('A判定');
  });

  test('SCEN-698: 偏差値が最小値時の表示確認', async ({ page }) => {
    // SCEN-698
    await page.click('[data-testid="menu-evaluation"]');
    await page.fill('[data-testid="deviation-input"]', '25');
    await page.click('[data-testid="evaluate-button"]');
    await expect(page.locator('[data-testid="judgment-result"]')).toContainText('E判定');
  });

  test('SCEN-699: 判定履歴が0件時の表示確認', async ({ page }) => {
    // SCEN-699
    await page.goto(`${baseURL}/evaluation-no-history`);
    await expect(page.locator('[data-testid="no-history-message"]')).toContainText('判定履歴がありません');
  });

  test('SCEN-700: 判定履歴が上限数時の表示確認', async ({ page }) => {
    // SCEN-700
    await page.goto(`${baseURL}/evaluation-max-history`);
    await expect(page.locator('[data-testid="history-item"]')).toHaveCount(100);
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test('SCEN-701: 評価基準日が最古日付時の動作', async ({ page }) => {
    // SCEN-701
    await page.click('[data-testid="menu-evaluation"]');
    await page.fill('[data-testid="date-input"]', '1900-01-01');
    await page.click('[data-testid="evaluate-button"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('評価基準日が無効です');
  });

  test('SCEN-702: 評価基準日が最新日付時の動作', async ({ page }) => {
    // SCEN-702
    await page.click('[data-testid="menu-evaluation"]');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="date-input"]', today);
    await page.click('[data-testid="evaluate-button"]');
    await expect(page.locator('[data-testid="data-date"]')).toContainText('データ基準日: 本日');
  });

  test('SCEN-703: 科目数が1科目のみ時のチャート表示', async ({ page }) => {
    // SCEN-703
    await page.goto(`${baseURL}/evaluation-single-subject`);
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-axis"]')).toBeVisible();
  });

  test('SCEN-704: 全科目偏差値0時のチャート表示', async ({ page }) => {
    // SCEN-704
    await page.goto(`${baseURL}/evaluation-zero-deviation`);
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="zero-data-message"]')).toBeVisible();
  });
});