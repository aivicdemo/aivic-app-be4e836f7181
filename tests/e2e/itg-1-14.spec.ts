import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績入力画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('受験生選択し成績データ正常登録', async ({ page }) => {
    // SCEN-349
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.fill('[data-testid="subject"]', '数学');
    await page.fill('[data-testid="score"]', '85');
    await page.fill('[data-testid="test-date"]', '2024-01-15');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('成績データが正常に登録されました');
  });

  test('模試種別選択し実施日入力完了', async ({ page }) => {
    // SCEN-350
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="test-type"]', '全国模試');
    await page.fill('[data-testid="test-date"]', '2024-01-20');
    await page.click('[data-testid="complete-button"]');
    await expect(page.locator('[data-testid="test-type-display"]')).toContainText('全国模試');
    await expect(page.locator('[data-testid="test-date-display"]')).toContainText('2024-01-20');
  });

  test('科目別得点入力し偏差値自動計算', async ({ page }) => {
    // SCEN-351
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="japanese-score"]', '75');
    await page.fill('[data-testid="math-score"]', '82');
    await page.fill('[data-testid="english-score"]', '68');
    await page.fill('[data-testid="science-score"]', '78');
    await page.fill('[data-testid="social-score"]', '85');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="japanese-deviation"]')).toBeVisible();
  });

  test('満点設定し志望校判定結果表示', async ({ page }) => {
    // SCEN-352
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.fill('[data-testid="score"]', '100');
    await page.click('[data-testid="judgment-button"]');
    await expect(page.locator('[data-testid="judgment-result"]')).toContainText('A判定');
  });

  test('成績データ保存し確認ダイアログ表示', async ({ page }) => {
    // SCEN-353
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.fill('[data-testid="score"]', '85');
    await page.fill('[data-testid="test-date"]', '2024-01-15');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="confirmation-dialog"]')).toContainText('成績を保存しました');
  });

  test('過去成績履歴から推移グラフ表示', async ({ page }) => {
    // SCEN-354
    await page.goto(`${BASE_URL}/grade-input`);
    await page.click('[data-testid="history-button"]');
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.selectOption('[data-testid="period-select"]', '3months');
    await page.click('[data-testid="graph-display-button"]');
    await expect(page.locator('[data-testid="trend-graph"]')).toBeVisible();
  });

  test('受験生未選択で保存時エラー', async ({ page }) => {
    // SCEN-355
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="subject"]', '数学');
    await page.fill('[data-testid="score"]', '85');
    await page.fill('[data-testid="test-date"]', '2024-01-15');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('受験生を選択してください');
  });

  test('模試種別未選択でエラーメッセージ', async ({ page }) => {
    // SCEN-356
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="test-date"]', '2024-01-15');
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.fill('[data-testid="score"]', '85');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('模試種別を選択してください');
  });

  test('実施日未入力で登録失敗', async ({ page }) => {
    // SCEN-357
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.fill('[data-testid="score"]', '85');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('実施日を入力してください');
  });

  test('科目得点空欄で保存時エラー', async ({ page }) => {
    // SCEN-358
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.fill('[data-testid="subject"]', '数学');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('得点が未入力');
  });

  test('満点未設定で計算エラー表示', async ({ page }) => {
    // SCEN-359
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="subject"]', '数学');
    await page.fill('[data-testid="score"]', '80');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('満点が未設定');
  });

  test('ネットワークエラー時保存失敗', async ({ page, context }) => {
    // SCEN-360
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="subject"]', '数学');
    await page.fill('[data-testid="score"]', '85');
    await context.setOffline(true);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワークエラー');
  });

  test('得点にマイナス値入力でエラー', async ({ page }) => {
    // SCEN-361
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.fill('[data-testid="score"]', '-10');
    await page.click('[data-testid="subject"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('0以上の値を入力');
  });

  test('得点が満点超過時警告表示', async ({ page }) => {
    // SCEN-362
    await page.goto(`${BASE_URL}/grade-input`);
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.fill('[data-testid="max-score"]', '100');
    await page.fill('[data-testid="score"]', '101');
    await page.click('[data-testid="subject"]');
    await expect(page.locator('[data-testid="warning-message"]')).toContainText('得点が満点を超過');
  });

  test('実施日に未来日付入力検証', async ({ page }) => {
    // SCEN-363
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="test-name"]', 'テスト');
    await page.selectOption('[data-testid="subject-select"]', '数学');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await page.fill('[data-testid="test-date"]', futureDate.toISOString().split('T')[0]);
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('未来日付は無効');
  });

  test('文字数制限超過時入力制限', async ({ page }) => {
    // SCEN-364
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="subject"]', 'a'.repeat(60));
    await page.fill('[data-testid="score"]', '9999');
    await page.fill('[data-testid="comment"]', 'a'.repeat(600));
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文字数制限');
  });

  test('満点に0入力時エラー表示', async ({ page }) => {
    // SCEN-365
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="subject"]', '数学');
    await page.fill('[data-testid="max-score"]', '0');
    await page.fill('[data-testid="score"]', '80');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('満点に0が入力');
  });

  test('数値フィールドに文字入力制限', async ({ page }) => {
    // SCEN-366
    await page.goto(`${BASE_URL}/grade-input`);
    await page.click('[data-testid="score"]');
    await page.fill('[data-testid="score"]', 'abc');
    await page.fill('[data-testid="score"]', 'あいう');
    await page.fill('[data-testid="score"]', '!@#$%');
    await page.fill('[data-testid="score"]', '123');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="score"]')).toHaveValue('123');
  });

  test('重複データ登録時警告表示', async ({ page }) => {
    // SCEN-367
    await page.goto(`${BASE_URL}/grade-input`);
    await page.fill('[data-testid="student-id"]', 'existing-student');
    await page.selectOption('[data-testid="subject-select"]', '数学');
    await page.fill('[data-testid="test-date"]', '2024-01-15');
    await page.fill('[data-testid="score"]', '85');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="warning-dialog"]')).toContainText('既に登録されています');
  });

  test('大量データ入力時性能確認', async ({ page }) => {
    // SCEN-368
    await page.goto(`${BASE_URL}/grade-input`);
    const startTime = Date.now();
    await page.setInputFiles('[data-testid="csv-upload"]', 'test-data/1000-records.csv');
    await page.click('[data-testid="import-button"]');
    await page.waitForSelector('[data-testid="import-complete"]', { timeout: 30000 });
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(30000);
    await expect(page.locator('[data-testid="imported-count"]')).toContainText('1000');
  });
});