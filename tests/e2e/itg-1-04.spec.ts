import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("志望校管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'parent@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('志望校一覧が正常に表示される', async ({ page }) => {
    // SCEN-092
    await page.click('[data-testid="menu-schools"]');
    await page.waitForURL(`${BASE_URL}/schools`);
    await expect(page.locator('[data-testid="schools-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-item"]')).toContainText(['学校名', '偏差値', '合格可能性']);
  });

  test('志望校追加ボタンで新規登録できる', async ({ page }) => {
    // SCEN-093
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[name="schoolName"]', 'テスト高等学校');
    await page.fill('[name="department"]', '普通科');
    await page.fill('[name="deviation"]', '65');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="schools-list"]')).toContainText('テスト高等学校');
  });

  test('学校名検索で該当校が絞り込める', async ({ page }) => {
    // SCEN-094
    await page.goto(`${BASE_URL}/schools`);
    await page.fill('[data-testid="search-input"]', '○○高校');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="schools-list"] [data-testid="school-item"]')).toContainText('○○高校');
  });

  test('国公立フィルターで正しく絞り込める', async ({ page }) => {
    // SCEN-095
    await page.goto(`${BASE_URL}/schools`);
    await page.check('[data-testid="filter-public"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="school-type"]')).toContainText('国公立');
  });

  test('私立フィルターで正しく絞り込める', async ({ page }) => {
    // SCEN-096
    await page.goto(`${BASE_URL}/schools`);
    await page.check('[data-testid="filter-private"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="school-type"]')).toContainText('私立');
  });

  test('地域フィルターで該当地域が表示される', async ({ page }) => {
    // SCEN-097
    await page.goto(`${BASE_URL}/schools`);
    await page.selectOption('[data-testid="region-filter"]', '東京都');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="school-region"]')).toContainText('東京都');
  });

  test('偏差値範囲フィルターで絞り込める', async ({ page }) => {
    // SCEN-098
    await page.goto(`${BASE_URL}/schools`);
    await page.fill('[data-testid="deviation-min"]', '50');
    await page.fill('[data-testid="deviation-max"]', '65');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="school-deviation"]')).toContainText(/5[0-9]|6[0-5]/);
  });

  test('志望順位を正常に設定できる', async ({ page }) => {
    // SCEN-099
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="set-rank-button"]');
    await page.selectOption('[data-testid="rank-select"]', '1');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="school-rank"]')).toContainText('第一志望');
  });

  test('合格可能性が正しく表示される', async ({ page }) => {
    // SCEN-100
    await page.goto(`${BASE_URL}/schools`);
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="judgment-rank"]')).toContainText(/[A-E]判定/);
    await expect(page.locator('[data-testid="basis-data"]')).toContainText(['偏差値', '得点']);
  });

  test('必要偏差値が正確に表示される', async ({ page }) => {
    // SCEN-101
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="school-item"]:first-child');
    await expect(page.locator('[data-testid="required-deviation"]')).toBeVisible();
    await expect(page.locator('[data-testid="required-deviation"]')).toContainText(/\d+/);
  });

  test('現在偏差値との差分が表示される', async ({ page }) => {
    // SCEN-102
    await page.goto(`${BASE_URL}/schools`);
    await expect(page.locator('[data-testid="deviation-diff"]')).toBeVisible();
    await expect(page.locator('[data-testid="deviation-diff"].positive')).toHaveCSS('color', /green/i);
    await expect(page.locator('[data-testid="deviation-diff"].negative')).toHaveCSS('color', /red/i);
  });

  test('志望校詳細モーダルが開ける', async ({ page }) => {
    // SCEN-103
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="school-name"]:first-child');
    await expect(page.locator('[data-testid="school-detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-school-info"]')).toContainText(['学校名', '偏差値', '入試科目']);
  });

  test('志望校情報を編集できる', async ({ page }) => {
    // SCEN-104
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="edit-button"]:first-child');
    await page.fill('[name="schoolName"]', '△△高等学校');
    await page.fill('[name="deviation"]', '68');
    await page.selectOption('[name="priority"]', '第二志望');
    await page.fill('[name="memo"]', '文化祭見学予定');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="schools-list"]')).toContainText('△△高等学校');
  });

  test('存在しない学校名で検索結果なし', async ({ page }) => {
    // SCEN-105
    await page.goto(`${BASE_URL}/schools`);
    await page.fill('[data-testid="search-input"]', '存在しない高等学校');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results"]')).toContainText('該当する学校が見つかりませんでした');
  });

  test('特殊文字入力でエラーハンドリング', async ({ page }) => {
    // SCEN-106
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[name="schoolName"]', "<script>alert('test')</script>");
    await page.fill('[name="deviation"]', '@@##$$');
    await page.fill('[name="memo"]', "'; DROP TABLE schools; --");
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('不正な文字が含まれています');
  });

  test('範囲外偏差値設定でエラー表示', async ({ page }) => {
    // SCEN-107
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[name="schoolName"]', 'テスト高校');
    await page.fill('[name="deviation"]', '-10');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('偏差値が有効範囲外です');
  });

  test('同じ志望校重複登録でエラー', async ({ page }) => {
    // SCEN-108
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[name="schoolName"]', '○○高等学校');
    await page.click('[data-testid="register-button"]');
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[name="schoolName"]', '○○高等学校');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この志望校は既に登録されています');
  });

  test('志望順位上限超過でエラー表示', async ({ page }) => {
    // SCEN-109
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="add-school-button"]');
    await page.fill('[name="schoolName"]', '新しい高校');
    await page.selectOption('[name="rank"]', '1');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('志望校の登録上限数を超えています');
  });

  test('ネットワークエラー時の表示確認', async ({ page }) => {
    // SCEN-110
    await page.route('**/api/schools', route => route.abort());
    await page.goto(`${BASE_URL}/schools`);
    await expect(page.locator('[data-testid="network-error"]')).toContainText('ネットワークに接続できません');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('検索文字数1文字での動作確認', async ({ page }) => {
    // SCEN-111
    await page.goto(`${BASE_URL}/schools`);
    await page.fill('[data-testid="search-input"]', '東');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"], [data-testid="min-chars-message"]')).toBeVisible();
  });

  test('検索文字数上限での動作確認', async ({ page }) => {
    // SCEN-112
    await page.goto(`${BASE_URL}/schools`);
    await page.fill('[data-testid="search-input"]', 'a'.repeat(100));
    await page.click('[data-testid="search-button"]');
    await page.fill('[data-testid="search-input"]', 'a'.repeat(101));
    await expect(page.locator('[data-testid="char-limit-error"]')).toBeVisible();
  });

  test('偏差値最小値での絞り込み確認', async ({ page }) => {
    // SCEN-113
    await page.goto(`${BASE_URL}/schools`);
    await page.fill('[data-testid="deviation-min"]', '30');
    await page.click('[data-testid="apply-filter"]');
    const deviations = await page.locator('[data-testid="school-deviation"]').allTextContents();
    expect(deviations.every(d => parseInt(d) >= 30)).toBe(true);
  });

  test('偏差値最大値での絞り込み確認', async ({ page }) => {
    // SCEN-114
    await page.goto(`${BASE_URL}/schools`);
    await page.fill('[data-testid="deviation-max"]', '80');
    await page.click('[data-testid="filter-button"]');
    const deviations = await page.locator('[data-testid="school-deviation"]').allTextContents();
    expect(deviations.every(d => parseInt(d) <= 80)).toBe(true);
  });

  test('志望校0件時の画面表示確認', async ({ page }) => {
    // SCEN-115
    await page.goto(`${BASE_URL}/schools`);
    await expect(page.locator('[data-testid="empty-message"]')).toContainText('志望校が登録されていません');
    await expect(page.locator('[data-testid="add-school-link"]')).toBeVisible();
  });

  test('志望校上限登録時の動作確認', async ({ page }) => {
    // SCEN-116
    await page.goto(`${BASE_URL}/schools`);
    await page.click('[data-testid="add-school-button"]');
    await expect(page.locator('[data-testid="limit-error"], [data-testid="add-school-button"][disabled]')).toBeVisible();
  });
});