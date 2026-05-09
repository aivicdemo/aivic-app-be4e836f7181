import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("ダッシュボード", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'parent@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test("SCEN-001: ダッシュボード初回表示で全要素正常表示", async ({ page }) => {
    // SCEN-001
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="grades-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="notifications"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-menu"]')).toBeVisible();
  });

  test("SCEN-002: 受験生基本情報の正常表示確認", async ({ page }) => {
    // SCEN-002
    await expect(page.locator('[data-testid="student-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-grade"]')).toBeVisible();
    await expect(page.locator('[data-testid="target-schools"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-avatar"]')).toBeVisible();
  });

  test("SCEN-003: 最新偏差値カードの数値表示確認", async ({ page }) => {
    // SCEN-003
    await expect(page.locator('[data-testid="latest-deviation-card"]')).toBeVisible();
    const deviationValue = await page.locator('[data-testid="deviation-value"]').textContent();
    const numValue = parseFloat(deviationValue || '0');
    expect(numValue).toBeGreaterThanOrEqual(0);
    expect(numValue).toBeLessThanOrEqual(100);
  });

  test("SCEN-004: 志望校合格可能性一覧の表示確認", async ({ page }) => {
    // SCEN-004
    await expect(page.locator('[data-testid="admission-probability-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="probability-grade"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="update-date"]').first()).toBeVisible();
  });

  test("SCEN-005: 成績推移グラフの描画確認", async ({ page }) => {
    // SCEN-005
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-y-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test("SCEN-006: 科目別レーダーチャートの表示確認", async ({ page }) => {
    // SCEN-006
    await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-label"]')).toHaveCount(5);
    await expect(page.locator('[data-testid="radar-data-point"]')).toHaveCount(5);
  });

  test("SCEN-007: 直近模試結果サマリー表示確認", async ({ page }) => {
    // SCEN-007
    await expect(page.locator('[data-testid="recent-mock-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="mock-test-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="test-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-scores"]')).toBeVisible();
  });

  test("SCEN-008: 次回模試予定の正常表示確認", async ({ page }) => {
    // SCEN-008
    await expect(page.locator('[data-testid="upcoming-mock-tests"]')).toBeVisible();
    await expect(page.locator('[data-testid="upcoming-test-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="test-schedule"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="test-venue"]').first()).toBeVisible();
  });

  test("SCEN-009: 成績改善提案アラート表示確認", async ({ page }) => {
    // SCEN-009
    await expect(page.locator('[data-testid="improvement-alerts"]')).toBeVisible();
    await page.click('[data-testid="expand-alert"]');
    await expect(page.locator('[data-testid="improvement-methods"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-priority"]')).toBeVisible();
  });

  test("SCEN-010: 科目別弱点分析結果表示確認", async ({ page }) => {
    // SCEN-010
    await expect(page.locator('[data-testid="weakness-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-weakness"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-rate"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="weakness-chart"]')).toBeVisible();
  });

  test("SCEN-011: 月間学習進捗バーの表示確認", async ({ page }) => {
    // SCEN-011
    await expect(page.locator('[data-testid="monthly-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-percentage"]')).toBeVisible();
  });

  test("SCEN-012: 志望校偏差値比較チャート表示確認", async ({ page }) => {
    // SCEN-012
    await expect(page.locator('[data-testid="deviation-comparison-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-deviation"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="current-deviation"]')).toBeVisible();
    await expect(page.locator('[data-testid="deviation-gap"]').first()).toBeVisible();
  });

  test("SCEN-013: 重要通知お知らせ一覧表示確認", async ({ page }) => {
    // SCEN-013
    await expect(page.locator('[data-testid="important-notifications"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-date"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="notification-title"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="notification-priority"]').first()).toBeVisible();
    await page.click('[data-testid="notification-item"]');
  });

  test("SCEN-014: ダッシュボード画面リロード動作確認", async ({ page }) => {
    // SCEN-014
    await page.reload();
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="grades-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="notifications"]')).toBeVisible();
  });

  test("SCEN-015: データ取得失敗時エラー表示確認", async ({ page }) => {
    // SCEN-015
    await page.route('**/api/dashboard/**', route => route.fulfill({ status: 500 }));
    await page.reload();
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test("SCEN-016: 偏差値データ未登録時の表示確認", async ({ page }) => {
    // SCEN-016
    await page.route('**/api/deviation/**', route => route.fulfill({ status: 200, json: { data: null } }));
    await page.reload();
    await expect(page.locator('[data-testid="no-deviation-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="deviation-chart"]')).not.toBeVisible();
  });

  test("SCEN-017: 志望校未設定時の表示確認", async ({ page }) => {
    // SCEN-017
    await page.route('**/api/target-schools/**', route => route.fulfill({ status: 200, json: { data: [] } }));
    await page.reload();
    await expect(page.locator('[data-testid="no-target-schools-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="set-target-school-link"]')).toBeVisible();
  });

  test("SCEN-018: 模試結果なし時の表示確認", async ({ page }) => {
    // SCEN-018
    await page.route('**/api/mock-results/**', route => route.fulfill({ status: 200, json: { data: [] } }));
    await page.reload();
    await expect(page.locator('[data-testid="no-mock-results-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="mock-results-chart"]')).not.toBeVisible();
  });

  test("SCEN-019: 学習進捗データなし時の表示確認", async ({ page }) => {
    // SCEN-019
    await page.route('**/api/study-progress/**', route => route.fulfill({ status: 200, json: { data: null } }));
    await page.reload();
    await expect(page.locator('[data-testid="no-study-data-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).not.toBeVisible();
  });

  test("SCEN-020: 通知データなし時の表示確認", async ({ page }) => {
    // SCEN-020
    await page.route('**/api/notifications/**', route => route.fulfill({ status: 200, json: { data: [] } }));
    await page.reload();
    await expect(page.locator('[data-testid="no-notifications-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-list"]')).not.toBeVisible();
  });

  test("SCEN-021: ネットワークエラー時の表示確認", async ({ page, context }) => {
    // SCEN-021
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-testid="network-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    await context.setOffline(false);
  });

  test("SCEN-022: サーバーエラー時の表示確認", async ({ page }) => {
    // SCEN-022
    await page.route('**/api/**', route => route.fulfill({ status: 500 }));
    await page.reload();
    await expect(page.locator('[data-testid="server-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test("SCEN-023: セッション切れ時の表示確認", async ({ page, context }) => {
    // SCEN-023
    await context.clearCookies();
    await page.reload();
    await page.waitForURL(`${BASE_URL}/login`);
    await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
  });

  test("SCEN-024: 偏差値0の境界値表示確認", async ({ page }) => {
    // SCEN-024
    await page.route('**/api/deviation/**', route => route.fulfill({ status: 200, json: { data: { value: 0 } } }));
    await page.reload();
    await expect(page.locator('[data-testid="deviation-value"]')).toContainText('0');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
  });

  test("SCEN-025: 偏差値100の境界値表示確認", async ({ page }) => {
    // SCEN-025
    await page.route('**/api/deviation/**', route => route.fulfill({ status: 200, json: { data: { value: 100 } } }));
    await page.reload();
    await expect(page.locator('[data-testid="deviation-value"]')).toContainText('100');
    await expect(page.locator('[data-testid="deviation-chart"]')).toBeVisible();
  });

  test("SCEN-026: 合格可能性0%時の表示確認", async ({ page }) => {
    // SCEN-026
    await page.route('**/api/admission-probability/**', route => route.fulfill({ status: 200, json: { data: [{ school: 'Test School', probability: 0 }] } }));
    await page.reload();
    await expect(page.locator('[data-testid="probability-grade"]')).toContainText('0%');
    await expect(page.locator('[data-testid="encouragement-message"]')).toBeVisible();
  });

  test("SCEN-027: 合格可能性100%時の表示確認", async ({ page }) => {
    // SCEN-027
    await page.route('**/api/admission-probability/**', route => route.fulfill({ status: 200, json: { data: [{ school: 'Test School', probability: 100 }] } }));
    await page.reload();
    await expect(page.locator('[data-testid="probability-grade"]')).toContainText('100%');
    await expect(page.locator('[data-testid="probability-indicator"]')).toBeVisible();
  });

  test("SCEN-028: 科目数最小時のチャート表示確認", async ({ page }) => {
    // SCEN-028
    await page.route('**/api/subjects/**', route => route.fulfill({ status: 200, json: { data: [{ name: 'Math', score: 80 }] } }));
    await page.reload();
    await expect(page.locator('[data-testid="subject-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-axis-labels"]')).toBeVisible();
  });

  test("SCEN-029: 科目数最大時のチャート表示確認", async ({ page }) => {
    // SCEN-029
    const subjects = Array.from({ length: 10 }, (_, i) => ({ name: `Subject${i+1}`, score: 70 + i }));
    await page.route('**/api/subjects/**', route => route.fulfill({ status: 200, json: { data: subjects } }));
    await page.reload();
    await expect(page.locator('[data-testid="subject-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test("SCEN-030: 志望校数最大時の表示確認", async ({ page }) => {
    // SCEN-030
    const schools = Array.from({ length: 10 }, (_, i) => ({ name: `School${i+1}`, probability: 60 + i }));
    await page.route('**/api/target-schools/**', route => route.fulfill({ status: 200, json: { data: schools } }));
    await page.reload();
    await expect(page.locator('[data-testid="target-school-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="max-schools-message"]')).toBeVisible();
  });

  test("SCEN-031: 通知件数最大時の表示確認", async ({ page }) => {
    // SCEN-031
    await page.route('**/api/notifications/count/**', route => route.fulfill({ status: 200, json: { count: 999 } }));
    await page.reload();
    await expect(page.locator('[data-testid="notification-badge"]')).toContainText('999+');
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test("SCEN-032: 長い受験生名の表示確認", async ({ page }) => {
    // SCEN-032
    const longName = 'あ'.repeat(50);
    await page.route('**/api/student/**', route => route.fulfill({ status: 200, json: { data: { name: longName } } }));
    await page.reload();
    const nameElement = page.locator('[data-testid="student-name"]');
    await expect(nameElement).toBeVisible();
    await expect(page.locator('[data-testid="dashboard"]')).toHaveCSS('overflow', 'hidden');
  });

  test("SCEN-033: 長い志望校名の表示確認", async ({ page }) => {
    // SCEN-033
    const longSchoolName = '国立大学法人東京大学理学部数学科数理情報学コース大学院進学準備プログラム';
    await page.route('**/api/target-schools/**', route => route.fulfill({ status: 200, json: { data: [{ name: longSchoolName }] } }));
    await page.reload();
    await expect(page.locator('[data-testid="school-name"]')).toBeVisible();
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(page.locator('[data-testid="target-school-list"]')).toBeVisible();
  });
});