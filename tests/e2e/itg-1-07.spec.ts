import { test, expect } from '@playwright/test';

test.describe("合格可能性診断", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.fill('[data-testid="email-input"]', 'parent@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('SCEN-165: 受験生選択して診断実行できる', async ({ page }) => {
    // SCEN-165
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page).toHaveURL(/.*diagnosis-result/);
  });

  test('SCEN-166: 志望校選択して合格可能性表示', async ({ page }) => {
    // SCEN-166
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="school-type-select"]', 'high-school');
    await page.selectOption('[data-testid="region-select"]', 'tokyo');
    await page.fill('[data-testid="school-search-input"]', '東京高校');
    await page.click('[data-testid="school-search-result-1"]');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
  });

  test('SCEN-167: 複数模試選択して診断実行', async ({ page }) => {
    // SCEN-167
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.check('[data-testid="exam-check-1"]');
    await page.check('[data-testid="exam-check-2"]');
    await page.check('[data-testid="exam-check-3"]');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="judgment-result"]')).toBeVisible();
  });

  test('SCEN-168: 偏差値比較グラフが表示される', async ({ page }) => {
    // SCEN-168
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="deviation-graph-tab"]');
    await expect(page.locator('[data-testid="deviation-comparison-graph"]')).toBeVisible();
  });

  test('SCEN-169: 科目別合格可能性一覧表示', async ({ page }) => {
    // SCEN-169
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.click('[data-testid="subject-possibility-tab"]');
    await expect(page.locator('[data-testid="subject-possibility-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-japanese"]')).toBeVisible();
  });

  test('SCEN-170: 成績推移チャートが描画される', async ({ page }) => {
    // SCEN-170
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await expect(page.locator('[data-testid="grade-trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-y-axis"]')).toBeVisible();
  });

  test('SCEN-171: 合格ライン到達度表示される', async ({ page }) => {
    // SCEN-171
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="pass-line-achievement"]')).toBeVisible();
  });

  test('SCEN-172: 必要偏差値向上値が算出表示', async ({ page }) => {
    // SCEN-172
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.fill('[data-testid="current-deviation-input"]', '50');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="required-deviation-improvement"]')).toBeVisible();
  });

  test('SCEN-173: 同偏差値帯実績データ表示', async ({ page }) => {
    // SCEN-173
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.fill('[data-testid="school-input"]', '志望校名');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="same-deviation-data"]')).toBeVisible();
  });

  test('SCEN-174: 改善提案アドバイス表示される', async ({ page }) => {
    // SCEN-174
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.fill('[data-testid="school-input"]', '志望校名');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="improvement-advice"]')).toBeVisible();
  });

  test('SCEN-175: 受験生未選択で診断実行エラー', async ({ page }) => {
    // SCEN-175
    await page.goto(`${baseURL}/diagnosis`);
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('受験生を選択してください');
  });

  test('SCEN-176: 志望校未選択で診断実行エラー', async ({ page }) => {
    // SCEN-176
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('志望校');
  });

  test('SCEN-177: 模試未選択で診断実行エラー', async ({ page }) => {
    // SCEN-177
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('模試を選択してください');
  });

  test('SCEN-178: 成績データなしでエラー表示', async ({ page }) => {
    // SCEN-178
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'no-grade-student');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('成績データが不足');
  });

  test('SCEN-179: 存在しない志望校選択エラー', async ({ page }) => {
    // SCEN-179
    await page.click('[data-testid="menu-diagnosis"]');
    await page.fill('[data-testid="school-input"]', '存在しない高校');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('志望校が見つかりません');
  });

  test('SCEN-180: システムエラー時の表示確認', async ({ page }) => {
    // SCEN-180
    await page.route('**/api/diagnosis', route => route.fulfill({ status: 500 }));
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="student-select"]', 'student1');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="system-error-message"]')).toBeVisible();
  });

  test('SCEN-181: 受験生選択境界値テスト', async ({ page }) => {
    // SCEN-181
    await page.click('[data-testid="menu-diagnosis"]');
    await page.click('[data-testid="student-select"]');
    await expect(page.locator('[data-testid="no-students-message"]')).toBeVisible();
    await page.selectOption('[data-testid="student-select"]', 'max-student');
    await expect(page.locator('[data-testid="student-select"]')).toHaveValue('max-student');
  });

  test('SCEN-182: 志望校選択最大数制限確認', async ({ page }) => {
    // SCEN-182
    await page.click('[data-testid="menu-diagnosis"]');
    for (let i = 1; i <= 10; i++) {
      await page.click(`[data-testid="school-add-${i}"]`);
    }
    await page.click('[data-testid="school-add-11"]');
    await expect(page.locator('[data-testid="max-school-error"]')).toBeVisible();
  });

  test('SCEN-183: 模試選択上限値テスト', async ({ page }) => {
    // SCEN-183
    await page.click('[data-testid="menu-diagnosis"]');
    for (let i = 1; i <= 5; i++) {
      await page.check(`[data-testid="exam-check-${i}"]`);
    }
    await page.check('[data-testid="exam-check-6"]');
    await expect(page.locator('[data-testid="max-exam-error"]')).toBeVisible();
  });

  test('SCEN-184: 偏差値0での診断実行確認', async ({ page }) => {
    // SCEN-184
    await page.click('[data-testid="menu-diagnosis"]');
    await page.fill('[data-testid="deviation-input"]', '0');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="invalid-deviation-error"]')).toBeVisible();
  });

  test('SCEN-185: 偏差値100での診断実行確認', async ({ page }) => {
    // SCEN-185
    await page.click('[data-testid="menu-diagnosis"]');
    await page.fill('[data-testid="deviation-input"]', '100');
    await page.selectOption('[data-testid="school-select"]', 'school1');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="diagnosis-result"]')).toBeVisible();
  });

  test('SCEN-186: 合格可能性0%表示確認', async ({ page }) => {
    // SCEN-186
    await page.click('[data-testid="menu-diagnosis"]');
    await page.fill('[data-testid="deviation-input"]', '30');
    await page.selectOption('[data-testid="school-select"]', 'high-level-school');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="success-rate"]')).toContainText('0%');
    await expect(page.locator('[data-testid="advice-message"]')).toBeVisible();
  });

  test('SCEN-187: 合格可能性100%表示確認', async ({ page }) => {
    // SCEN-187
    await page.click('[data-testid="menu-diagnosis"]');
    await page.selectOption('[data-testid="school-select"]', 'low-level-school');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="success-rate"]')).toContainText('100%');
  });

  test('SCEN-188: 長い志望校名表示確認', async ({ page }) => {
    // SCEN-188
    await page.click('[data-testid="menu-diagnosis"]');
    await page.fill('[data-testid="school-search-input"]', '非常に長い学校名を持つ教育機関テスト高等学校附属中学校');
    await page.click('[data-testid="school-search-result-1"]');
    await page.click('[data-testid="diagnosis-execute-button"]');
    await expect(page.locator('[data-testid="selected-school-name"]')).toBeVisible();
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(page.locator('[data-testid="selected-school-name"]')).toBeVisible();
  });
});