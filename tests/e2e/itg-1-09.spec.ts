import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("助言・アドバイス", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[data-testid="username"]', 'parent@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('SCEN-211: 助言画面の全コンテンツが正常表示', async ({ page }) => {
    // SCEN-211
    await page.click('[data-testid="advice-menu"]');
    await page.waitForSelector('[data-testid="advice-title"]');
    await expect(page.locator('[data-testid="advice-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="advice-footer"]')).toBeVisible();
  });

  test('SCEN-212: 総合助言エリアの内容が適切に表示', async ({ page }) => {
    // SCEN-212
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="comprehensive-advice"]')).toBeVisible();
    await expect(page.locator('[data-testid="study-policy"]')).toContainText('学習方針');
    await expect(page.locator('[data-testid="career-guidance"]')).toContainText('進路指導');
  });

  test('SCEN-213: 科目別改善提案リストが正常表示', async ({ page }) => {
    // SCEN-213
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="subject-improvement-button"]');
    await expect(page.locator('[data-testid="subject-improvement-list"]')).toBeVisible();
    await page.locator('[data-testid="improvement-list"]').scrollIntoView();
  });

  test('SCEN-214: 志望校別対策アドバイスが表示', async ({ page }) => {
    // SCEN-214
    await page.click('[data-testid="school-setting"]');
    await page.selectOption('[data-testid="target-school"]', 'school-1');
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="school-specific-advice"]')).toBeVisible();
  });

  test('SCEN-215: 学習計画提案が正常に表示', async ({ page }) => {
    // SCEN-215
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="study-plan-proposal"]')).toBeVisible();
    await expect(page.locator('[data-testid="subject-schedule"]')).toContainText('科目別スケジュール');
    await expect(page.locator('[data-testid="recommended-hours"]')).toContainText('推奨学習時間');
  });

  test('SCEN-216: 模試結果分析コメントが表示', async ({ page }) => {
    // SCEN-216
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="mock-test-1"]');
    await page.click('[data-testid="analysis-button"]');
    await expect(page.locator('[data-testid="analysis-comment"]')).toBeVisible();
  });

  test('SCEN-217: 偏差値目標達成アクションが表示', async ({ page }) => {
    // SCEN-217
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="subject-math"]');
    await expect(page.locator('[data-testid="deviation-actions"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-priority"]')).toContainText('優先度');
  });

  test('SCEN-218: 弱点科目克服方法が正常表示', async ({ page }) => {
    // SCEN-218
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="weak-subject-overcome"]');
    await expect(page.locator('[data-testid="overcome-method"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommended-materials"]')).toContainText('推奨教材');
  });

  test('SCEN-219: 時期別受験戦略が適切に表示', async ({ page }) => {
    // SCEN-219
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="period-strategy"]')).toBeVisible();
    await page.selectOption('[data-testid="period-selector"]', 'current');
    await expect(page.locator('[data-testid="strategy-content"]')).toContainText('戦略');
  });

  test('SCEN-220: 合格可能性向上対策が表示', async ({ page }) => {
    // SCEN-220
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="pass-probability-measures"]')).toBeVisible();
    await expect(page.locator('[data-testid="improvement-proposals"]')).toContainText('改善提案');
  });

  test('SCEN-221: 過去の助言履歴が正常に表示', async ({ page }) => {
    // SCEN-221
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="advice-history"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]').first()).toContainText('日付');
  });

  test('SCEN-222: 助言内容印刷が正常実行', async ({ page }) => {
    // SCEN-222
    await page.click('[data-testid="advice-menu"]');
    const printPromise = page.waitForEvent('popup');
    await page.click('[data-testid="print-button"]');
    const printPage = await printPromise;
    await expect(printPage).toBeTruthy();
  });

  test('SCEN-223: 助言内容保存が正常完了', async ({ page }) => {
    // SCEN-223
    await page.click('[data-testid="advice-menu"]');
    await page.fill('[data-testid="advice-title"]', 'テスト助言');
    await page.fill('[data-testid="advice-detail"]', 'テスト詳細');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-success"]')).toContainText('保存完了');
  });

  test('SCEN-224: 成績データなしで助言エラー', async ({ page }) => {
    // SCEN-224
    await page.click('[data-testid="student-no-grade"]');
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="generate-advice"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('成績データが不足');
  });

  test('SCEN-225: 志望校未設定で対策アドバイスエラー', async ({ page }) => {
    // SCEN-225
    await page.click('[data-testid="student-no-target"]');
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="strategy-advice"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('志望校が未設定');
  });

  test('SCEN-226: 模試結果なしで分析コメントエラー', async ({ page }) => {
    // SCEN-226
    await page.click('[data-testid="student-no-mock"]');
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="generate-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('模試結果が登録されていない');
  });

  test('SCEN-227: ネットワークエラーで助言読込失敗', async ({ page }) => {
    // SCEN-227
    await page.click('[data-testid="advice-menu"]');
    await page.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('ネットワークエラー');
  });

  test('SCEN-228: 印刷機能でシステムエラー発生', async ({ page }) => {
    // SCEN-228
    await page.click('[data-testid="advice-menu"]');
    await page.setOffline(true);
    await page.click('[data-testid="print-button"]');
    await expect(page.locator('[data-testid="print-error"]')).toContainText('印刷エラー');
  });

  test('SCEN-229: 保存処理でエラーメッセージ表示', async ({ page }) => {
    // SCEN-229
    await page.click('[data-testid="advice-menu"]');
    await page.fill('[data-testid="advice-input"]', 'テスト');
    await page.setOffline(true);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-error"]')).toContainText('保存に失敗');
  });

  test('SCEN-230: 権限なしでアクセス拒否エラー', async ({ page }) => {
    // SCEN-230
    await page.goto(`${baseUrl}/logout`);
    await page.goto(`${baseUrl}/advice`);
    await expect(page.locator('[data-testid="access-denied"]')).toContainText('アクセス権限がない');
  });

  test('SCEN-231: 助言履歴が空の場合の表示', async ({ page }) => {
    // SCEN-231
    await page.click('[data-testid="student-no-history"]');
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="advice-history"]');
    await expect(page.locator('[data-testid="empty-history"]')).toContainText('助言・アドバイスの履歴がありません');
  });

  test('SCEN-232: 最大件数の助言履歴表示', async ({ page }) => {
    // SCEN-232
    await page.click('[data-testid="student-max-history"]');
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="advice-history"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await page.locator('[data-testid="history-scroll"]').scrollIntoView();
  });

  test('SCEN-233: 全科目満点時の改善提案表示', async ({ page }) => {
    // SCEN-233
    await page.click('[data-testid="student-perfect-score"]');
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="perfect-message"]')).toContainText('素晴らしい成績');
  });

  test('SCEN-234: 全科目0点時の助言内容表示', async ({ page }) => {
    // SCEN-234
    await page.click('[data-testid="student-zero-score"]');
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="zero-advice"]')).toContainText('基礎からの学び直し');
  });

  test('SCEN-235: 複数志望校設定時の対策表示', async ({ page }) => {
    // SCEN-235
    await page.click('[data-testid="student-multi-target"]');
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="multi-school-strategy"]')).toBeVisible();
    await expect(page.locator('[data-testid="school-a-strategy"]')).toContainText('A高校');
  });

  test('SCEN-236: 受験直前期の戦略アドバイス', async ({ page }) => {
    // SCEN-236
    await page.click('[data-testid="student-pre-exam"]');
    await page.click('[data-testid="advice-menu"]');
    await page.click('[data-testid="pre-exam-strategy"]');
    await expect(page.locator('[data-testid="pre-exam-advice"]')).toContainText('受験直前期');
  });

  test('SCEN-237: 合格可能性100%時の対策表示', async ({ page }) => {
    // SCEN-237
    await page.click('[data-testid="student-100-percent"]');
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="probability-100"]')).toContainText('100%');
    await expect(page.locator('[data-testid="maintain-advice"]')).toContainText('学習レベルを維持');
  });

  test('SCEN-238: 長文助言内容の表示制御', async ({ page }) => {
    // SCEN-238
    await page.click('[data-testid="advice-menu"]');
    await expect(page.locator('[data-testid="long-advice"]')).toBeVisible();
    await page.locator('[data-testid="long-advice"]').scrollIntoView();
    await page.click('[data-testid="expand-button"]');
    await expect(page.locator('[data-testid="full-advice"]')).toBeVisible();
  });
});