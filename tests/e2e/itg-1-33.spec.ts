import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("分析結果表示画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('SCEN-841: 総合偏差値推移グラフが正常表示', async ({ page }) => {
    // SCEN-841
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="deviation-trend-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="graph-x-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="graph-y-axis-label"]')).toBeVisible();
  });

  test('SCEN-842: 志望校合格可能性判定が表示', async ({ page }) => {
    // SCEN-842
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="school-assessment"]')).toBeVisible();
    await expect(page.locator('[data-testid="assessment-grade"]')).toBeVisible();
  });

  test('SCEN-843: 科目別レーダーチャートが描画', async ({ page }) => {
    // SCEN-843
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.click('[data-testid="subject-analysis-tab"]');
    await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
  });

  test('SCEN-844: 最新模試結果サマリー表示', async ({ page }) => {
    // SCEN-844
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="latest-test-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="test-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="test-date"]')).toBeVisible();
  });

  test('SCEN-845: 成績推移トレンド分析表示', async ({ page }) => {
    // SCEN-845
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.click('[data-testid="trend-analysis-tab"]');
    await page.selectOption('[data-testid="subject-select"]', 'math');
    await page.click('[data-testid="analyze-button"]');
  });

  test('SCEN-846: 科目別弱点分析結果表示', async ({ page }) => {
    // SCEN-846
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.click('[data-testid="weakness-analysis-tab"]');
    await expect(page.locator('[data-testid="weakness-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="weakness-items"]')).toBeVisible();
  });

  test('SCEN-847: 志望校との偏差値差表示', async ({ page }) => {
    // SCEN-847
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="school-comparison"]')).toBeVisible();
    await expect(page.locator('[data-testid="deviation-difference"]')).toBeVisible();
  });

  test('SCEN-848: 学習アドバイス提案表示', async ({ page }) => {
    // SCEN-848
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="learning-advice"]')).toBeVisible();
    await expect(page.locator('[data-testid="advice-content"]')).toBeVisible();
  });

  test('SCEN-849: 期間選択フィルター動作確認', async ({ page }) => {
    // SCEN-849
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.selectOption('[data-testid="period-filter"]', '3months');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible();
  });

  test('SCEN-850: 科目絞り込みフィルター動作', async ({ page }) => {
    // SCEN-850
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.selectOption('[data-testid="subject-filter"]', 'math');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="filtered-result"]')).toBeVisible();
  });

  test('SCEN-851: 模試種別選択ボタン切替', async ({ page }) => {
    // SCEN-851
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.click('[data-testid="test-type-button-2"]');
    await expect(page.locator('[data-testid="test-type-button-2"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="analysis-data"]')).toBeVisible();
  });

  test('SCEN-852: グラフ表示切替タブ動作', async ({ page }) => {
    // SCEN-852
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.click('[data-testid="line-chart-tab"]');
    await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();
    await page.click('[data-testid="pie-chart-tab"]');
    await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible();
  });

  test('SCEN-853: データ未取得時のエラー表示', async ({ page }) => {
    // SCEN-853
    await page.route('**/api/analysis**', route => route.abort());
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-854: グラフ描画失敗時のエラー', async ({ page }) => {
    // SCEN-854
    await page.route('**/api/graph-data**', route => route.fulfill({ status: 500 }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="graph-error"]')).toBeVisible();
  });

  test('SCEN-855: ネットワーク障害時の表示', async ({ page }) => {
    // SCEN-855
    await page.context().setOffline(true);
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  });

  test('SCEN-856: 無効な期間選択時のエラー', async ({ page }) => {
    // SCEN-856
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-05-01');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="period-error"]')).toBeVisible();
  });

  test('SCEN-857: 存在しない科目選択エラー', async ({ page }) => {
    // SCEN-857
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.evaluate(() => {
      const select = document.querySelector('[data-testid="subject-select"]') as HTMLSelectElement;
      select.value = 'invalid-subject';
    });
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="subject-error"]')).toBeVisible();
  });

  test('SCEN-858: 志望校未設定時のエラー', async ({ page }) => {
    // SCEN-858
    await page.route('**/api/schools**', route => route.fulfill({ body: JSON.stringify([]) }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="no-school-error"]')).toBeVisible();
  });

  test('SCEN-859: 模試データ0件時の表示', async ({ page }) => {
    // SCEN-859
    await page.route('**/api/test-data**', route => route.fulfill({ body: JSON.stringify([]) }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
  });

  test('SCEN-860: 偏差値データ1件のみ表示', async ({ page }) => {
    // SCEN-860
    await page.route('**/api/deviation-data**', route => route.fulfill({
      body: JSON.stringify([{ deviation: 65, date: '2024-01-01' }])
    }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="single-data-point"]')).toBeVisible();
  });

  test('SCEN-861: 全科目未受験時の表示', async ({ page }) => {
    // SCEN-861
    await page.route('**/api/subject-data**', route => route.fulfill({ body: JSON.stringify({}) }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="no-subject-data"]')).toBeVisible();
  });

  test('SCEN-862: 最大期間選択時の動作', async ({ page }) => {
    // SCEN-862
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.selectOption('[data-testid="period-select"]', 'all');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible();
  });

  test('SCEN-863: 全科目選択時のレーダー表示', async ({ page }) => {
    // SCEN-863
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await page.check('[data-testid="select-all-subjects"]');
    await page.click('[data-testid="radar-display-button"]');
    await expect(page.locator('[data-testid="all-subjects-radar"]')).toBeVisible();
  });

  test('SCEN-864: 偏差値上限値表示確認', async ({ page }) => {
    // SCEN-864
    await page.route('**/api/deviation-data**', route => route.fulfill({
      body: JSON.stringify([{ deviation: 100, subject: 'math' }])
    }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="deviation-value"]')).toHaveText('100');
  });

  test('SCEN-865: 偏差値下限値表示確認', async ({ page }) => {
    // SCEN-865
    await page.route('**/api/deviation-data**', route => route.fulfill({
      body: JSON.stringify([{ deviation: 25, subject: 'math' }])
    }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="deviation-value"]')).toHaveText('25');
  });

  test('SCEN-866: 同一偏差値連続時の表示', async ({ page }) => {
    // SCEN-866
    await page.route('**/api/deviation-data**', route => route.fulfill({
      body: JSON.stringify([
        { deviation: 60, date: '2024-01-01' },
        { deviation: 60, date: '2024-02-01' },
        { deviation: 60, date: '2024-03-01' }
      ])
    }));
    await page.click('[data-testid="menu-analysis"]');
    await page.waitForURL(`${BASE_URL}/analysis`);
    await expect(page.locator('[data-testid="horizontal-line-graph"]')).toBeVisible();
  });
});