import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("志望校登録画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('志望校検索で学校名入力し検索結果表示', async ({ page }) => {
    // SCEN-571
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '山田高等学校');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('.search-results')).toBeVisible();
  });

  test('学校種別選択で対象校が絞り込み表示', async ({ page }) => {
    // SCEN-572
    await page.goto(`${baseURL}/schools/register`);
    await page.selectOption('select[name="schoolType"]', '高等学校');
    await expect(page.locator('.school-list')).toBeVisible();
    await page.selectOption('select[name="schoolType"]', '大学');
    await expect(page.locator('.school-list')).toBeVisible();
  });

  test('都道府県選択で地域校が絞り込み表示', async ({ page }) => {
    // SCEN-573
    await page.goto(`${baseURL}/schools/register`);
    await page.selectOption('select[name="prefecture"]', '東京都');
    await page.click('select[name="school"]');
    await expect(page.locator('select[name="school"] option')).toContainText('東京');
  });

  test('学部学科選択で該当学科が表示', async ({ page }) => {
    // SCEN-574
    await page.goto(`${baseURL}/schools/register`);
    await page.selectOption('select[name="university"]', '○○大学');
    await page.selectOption('select[name="faculty"]', '工学部');
    await page.click('select[name="department"]');
    await expect(page.locator('select[name="department"] option')).not.toHaveCount(0);
  });

  test('入試方式複数選択で登録完了', async ({ page }) => {
    // SCEN-575
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '○○大学');
    await page.check('input[name="examType"][value="general"]');
    await page.check('input[name="examType"][value="recommendation"]');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('志望順位設定で第1志望登録', async ({ page }) => {
    // SCEN-576
    await page.goto(`${baseURL}/schools/register`);
    await page.click('button[data-testid="add-school"]');
    await page.fill('input[name="schoolName"]', '第1志望校');
    await page.selectOption('select[name="priority"]', '1');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.school-list')).toContainText('第1志望');
  });

  test('合格ライン偏差値が正しく表示', async ({ page }) => {
    // SCEN-577
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '○○高校');
    await page.click('button[data-testid="search-button"]');
    await page.click('.school-item:first-child');
    await expect(page.locator('.deviation-score')).toBeVisible();
  });

  test('偏差値差分がマイナス値で表示', async ({ page }) => {
    // SCEN-578
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '高偏差値校');
    await page.click('button[data-testid="register-button"]');
    await page.goto(`${baseURL}/schools/list`);
    await expect(page.locator('.deviation-diff')).toContainText('-');
  });

  test('合格可能性判定結果が表示', async ({ page }) => {
    // SCEN-579
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '○○大学');
    await page.selectOption('select[name="faculty"]', '工学部');
    await page.selectOption('select[name="examType"]', 'general');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.possibility-result')).toBeVisible();
  });

  test('登録済み志望校一覧に追加表示', async ({ page }) => {
    // SCEN-580
    await page.goto(`${baseURL}/schools/register`);
    await page.click('button[data-testid="add-school"]');
    await page.fill('input[name="schoolName"]', '新志望校');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.registered-schools')).toContainText('新志望校');
  });

  test('志望校削除で一覧から除去', async ({ page }) => {
    // SCEN-581
    await page.goto(`${baseURL}/schools/register`);
    const schoolName = await page.locator('.school-item:first-child .school-name').textContent();
    await page.click('.school-item:first-child .delete-button');
    await page.click('button[data-testid="confirm-delete"]');
    await expect(page.locator('.school-list')).not.toContainText(schoolName || '');
  });

  test('志望校名未入力で登録エラー', async ({ page }) => {
    // SCEN-582
    await page.goto(`${baseURL}/schools/register`);
    await page.selectOption('select[name="schoolType"]', '高等学校');
    await page.fill('input[name="deviation"]', '65');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('学校種別未選択で登録エラー', async ({ page }) => {
    // SCEN-583
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '○○高等学校');
    await page.fill('input[name="deviation"]', '65');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('存在しない学校名で検索結果なし', async ({ page }) => {
    // SCEN-584
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', 'テスト架空学校999');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('.no-results')).toContainText('該当する学校が見つかりませんでした');
  });

  test('同一志望順位重複登録でエラー', async ({ page }) => {
    // SCEN-585
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '○○高校');
    await page.selectOption('select[name="priority"]', '1');
    await page.click('button[data-testid="register-button"]');
    await page.fill('input[name="schoolName"]', '△△高校');
    await page.selectOption('select[name="priority"]', '1');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.error-message')).toContainText('同じ志望順位が既に登録されています');
  });

  test('志望校未選択で削除ボタン無効', async ({ page }) => {
    // SCEN-586
    await page.goto(`${baseURL}/schools/register`);
    await expect(page.locator('button[data-testid="delete-button"]')).toBeDisabled();
  });

  test('入試方式未選択で登録エラー', async ({ page }) => {
    // SCEN-587
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '○○大学');
    await page.selectOption('select[name="faculty"]', '工学部');
    await page.selectOption('select[name="department"]', '機械工学科');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('第10志望まで登録済みで追加不可', async ({ page }) => {
    // SCEN-588
    await page.goto(`${baseURL}/schools/register`);
    for (let i = 1; i <= 10; i++) {
      await page.fill('input[name="schoolName"]', `志望校${i}`);
      await page.selectOption('select[name="priority"]', i.toString());
      await page.click('button[data-testid="register-button"]');
    }
    await expect(page.locator('button[data-testid="add-school"]')).toBeDisabled();
  });

  test('志望校名255文字で登録', async ({ page }) => {
    // SCEN-589
    await page.goto(`${baseURL}/schools/register`);
    const longName = 'a'.repeat(255);
    await page.fill('input[name="schoolName"]', longName);
    await page.selectOption('select[name="schoolType"]', '高等学校');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('志望校名256文字でエラー', async ({ page }) => {
    // SCEN-590
    await page.goto(`${baseURL}/schools/register`);
    const tooLongName = 'a'.repeat(256);
    await page.fill('input[name="schoolName"]', tooLongName);
    await page.selectOption('select[name="schoolType"]', '高等学校');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('全入試方式選択で登録', async ({ page }) => {
    // SCEN-591
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '○○大学');
    await page.check('input[name="allExamTypes"]');
    await expect(page.locator('input[name="examType"]')).toBeChecked();
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('登録上限0件時の削除操作', async ({ page }) => {
    // SCEN-592
    await page.goto(`${baseURL}/schools/register`);
    await expect(page.locator('button[data-testid="delete-button"]')).toBeDisabled();
  });

  test('特殊文字含む学校名で検索', async ({ page }) => {
    // SCEN-593
    await page.goto(`${baseURL}/schools/register`);
    await page.fill('input[name="schoolName"]', '聖マリア女学院高等学校（東京）');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('.search-results')).toBeVisible();
    await page.click('.school-item:first-child');
    await page.click('button[data-testid="register-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });
});