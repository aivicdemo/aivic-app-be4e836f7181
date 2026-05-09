import { test, expect } from '@playwright/test';

test.describe("偏差値推移分析", () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-117: 期間選択で偏差値推移グラフ表示', async ({ page }) => {
    // SCEN-117
    await page.click('[data-testid="menu-deviation-analysis"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-04-01');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
  });

  test('SCEN-118: 複数科目選択でグラフ表示', async ({ page }) => {
    // SCEN-118
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.check('[data-testid="subject-math"]');
    await page.check('[data-testid="subject-english"]');
    await page.check('[data-testid="subject-japanese"]');
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('数学');
  });

  test('SCEN-119: 模試種別切替でデータ更新', async ({ page }) => {
    // SCEN-119
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.selectOption('[data-testid="exam-type-selector"]', 'simulationB');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
  });

  test('SCEN-120: 志望校合格ライン正常表示', async ({ page }) => {
    // SCEN-120
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.selectOption('[data-testid="target-school"]', 'school1');
    await page.click('[data-testid="show-pass-line-button"]');
    await expect(page.locator('[data-testid="pass-line"]')).toBeVisible();
    await expect(page.locator('[data-testid="gap-display"]')).toContainText('合格まで');
  });

  test('SCEN-121: 科目別偏差値一覧表示', async ({ page }) => {
    // SCEN-121
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.click('[data-testid="subject-list-tab"]');
    await page.selectOption('[data-testid="student-selector"]', 'student1');
    await page.selectOption('[data-testid="period-selector"]', '6months');
    await page.click('[data-testid="display-button"]');
    await expect(page.locator('[data-testid="subject-table"]')).toBeVisible();
  });

  test('SCEN-122: 前回比較増減値表示', async ({ page }) => {
    // SCEN-122
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.selectOption('[data-testid="student-selector"]', 'student1');
    await expect(page.locator('[data-testid="deviation-change"]')).toContainText(/[+-]\d+\.\d+/);
  });

  test('SCEN-123: 目標偏差値設定保存', async ({ page }) => {
    // SCEN-123
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.click('[data-testid="target-setting-button"]');
    await page.fill('[data-testid="target-deviation"]', '65');
    await page.selectOption('[data-testid="target-deadline"]', '2024-12');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="confirm-yes"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-124: 分析結果コメント表示', async ({ page }) => {
    // SCEN-124
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.selectOption('[data-testid="student-selector"]', 'student1');
    await page.selectOption('[data-testid="analysis-period"]', '6months');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="analysis-comment"]')).toBeVisible();
  });

  test('SCEN-125: 印刷ボタンで印刷画面表示', async ({ page }) => {
    // SCEN-125
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    const printPromise = page.waitForEvent('dialog');
    await page.click('[data-testid="print-button"]');
  });

  test('SCEN-126: エクスポートでファイル出力', async ({ page }) => {
    // SCEN-126
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.selectOption('[data-testid="student-selector"]', 'student1');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    await page.selectOption('[data-testid="file-format"]', 'csv');
    await page.click('[data-testid="download-button"]');
  });

  test('SCEN-127: 詳細分析画面遷移', async ({ page }) => {
    // SCEN-127
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await page.click('[data-testid="chart-data-point"]');
    await page.click('[data-testid="detailed-analysis-button"]');
    await expect(page.locator('[data-testid="detailed-analysis-content"]')).toBeVisible();
  });

  test('SCEN-128: グラフ表示設定変更反映', async ({ page }) => {
    // SCEN-128
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await page.click('[data-testid="graph-settings-button"]');
    await page.selectOption('[data-testid="period-setting"]', '1year');
    await page.selectOption('[data-testid="chart-type"]', 'bar');
    await page.check('[data-testid="subject-math"]');
    await page.check('[data-testid="subject-english"]');
    await page.click('[data-testid="apply-settings-button"]');
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();
  });

  test('SCEN-129: 科目未選択でエラーメッセージ', async ({ page }) => {
    // SCEN-129
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('科目を選択してください');
  });

  test('SCEN-130: データ取得失敗でエラー表示', async ({ page }) => {
    // SCEN-130
    await page.route('**/api/deviation-data', route => route.abort());
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データの取得に失敗しました');
  });

  test('SCEN-131: 目標偏差値に文字入力でエラー', async ({ page }) => {
    // SCEN-131
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.fill('[data-testid="target-deviation"]', 'abc');
    await page.click('body');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('数値を入力してください');
  });

  test('SCEN-132: 印刷失敗時エラーハンドリング', async ({ page }) => {
    // SCEN-132
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
    await page.evaluate(() => { window.print = () => { throw new Error('Print failed'); }; });
    await page.click('[data-testid="print-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('プリンターの接続を確認してください');
  });

  test('SCEN-133: エクスポート失敗時エラー表示', async ({ page }) => {
    // SCEN-133
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await expect(page.locator('[data-testid="deviation-data"]')).toBeVisible();
    await page.route('**/api/export', route => route.abort());
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('エクスポートに失敗しました');
  });

  test('SCEN-134: 画面遷移失敗時エラー処理', async ({ page }) => {
    // SCEN-134
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.route('**/deviation-graph', route => route.abort());
    await page.click('[data-testid="show-graph-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-135: 目標偏差値0入力時の動作', async ({ page }) => {
    // SCEN-135
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.fill('[data-testid="target-deviation"]', '0');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('目標偏差値は1以上の値を入力してください');
  });

  test('SCEN-136: 目標偏差値100入力時の動作', async ({ page }) => {
    // SCEN-136
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.fill('[data-testid="target-deviation"]', '100');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('SCEN-137: 全科目選択時の表示', async ({ page }) => {
    // SCEN-137
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.click('[data-testid="select-all-subjects"]');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('国語');
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('数学');
  });

  test('SCEN-138: データなし期間選択時の表示', async ({ page }) => {
    // SCEN-138
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2020-01-31');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('選択された期間にはデータがありません');
  });

  test('SCEN-139: 最大期間選択時の動作', async ({ page }) => {
    // SCEN-139
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.selectOption('[data-testid="period-selector"]', 'all');
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
  });

  test('SCEN-140: 大量データ表示時の性能', async ({ page }) => {
    // SCEN-140
    await page.goto(`${BASE_URL}/deviation-analysis`);
    await page.selectOption('[data-testid="period-selector"]', 'all');
    await page.selectOption('[data-testid="subject-selector"]', 'all');
    await page.selectOption('[data-testid="student-selector"]', 'student-large-data');
    const startTime = Date.now();
    await page.click('[data-testid="execute-analysis-button"]');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible({ timeout: 5000 });
  });
});