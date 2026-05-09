import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("成績変化通知機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', 'parent@example.com');
    await page.fill('#password', 'password');
    await page.click('#login-button');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test("通知設定をONに切り替えできる", async ({ page }) => {
    // SCEN-735
    await page.click('text=設定');
    await page.click('#notification-toggle');
    await page.click('#save-button');
    await expect(page.locator('#notification-toggle')).toBeChecked();
  });

  test("通知設定をOFFに切り替えできる", async ({ page }) => {
    // SCEN-736
    await page.click('text=設定');
    await page.click('#notification-toggle');
    await page.click('#save-button');
    await expect(page.locator('#notification-toggle')).not.toBeChecked();
  });

  test("通知タイミングを選択できる", async ({ page }) => {
    // SCEN-737
    await page.click('text=設定');
    await page.selectOption('#timing-select', '1日後');
    await page.click('#save-button');
    await expect(page.locator('#timing-select')).toHaveValue('1日後');
  });

  test("複数科目を選択して保存できる", async ({ page }) => {
    // SCEN-738
    await page.click('text=設定');
    await page.check('#subject-math');
    await page.check('#subject-english');
    await page.click('#save-button');
    await expect(page.locator('#subject-math')).toBeChecked();
  });

  test("偏差値閾値を設定して保存できる", async ({ page }) => {
    // SCEN-739
    await page.click('text=設定');
    await page.fill('#deviation-threshold', '55');
    await page.click('#save-button');
    await expect(page.locator('#deviation-threshold')).toHaveValue('55');
  });

  test("順位閾値を設定して保存できる", async ({ page }) => {
    // SCEN-740
    await page.click('text=設定');
    await page.fill('#rank-threshold', '10');
    await page.click('#save-button');
    await expect(page.locator('#rank-threshold')).toHaveValue('10');
  });

  test("通知方法でメールを選択できる", async ({ page }) => {
    // SCEN-741
    await page.click('text=設定');
    await page.check('#notification-email');
    await page.click('#save-button');
    await expect(page.locator('#notification-email')).toBeChecked();
  });

  test("通知方法でアプリ内通知を選択", async ({ page }) => {
    // SCEN-742
    await page.click('text=設定');
    await page.check('#notification-app');
    await page.click('#save-button');
    await expect(page.locator('#notification-app')).toBeChecked();
  });

  test("通知時間帯を設定できる", async ({ page }) => {
    // SCEN-743
    await page.click('text=設定');
    await page.fill('#start-time', '08:00');
    await page.fill('#end-time', '20:00');
    await page.click('#save-button');
    await expect(page.locator('#start-time')).toHaveValue('08:00');
  });

  test("緊急通知設定を有効にできる", async ({ page }) => {
    // SCEN-744
    await page.click('text=設定');
    await page.check('#emergency-notification');
    await page.click('#save-button');
    await expect(page.locator('#emergency-notification')).toBeChecked();
  });

  test("通知履歴一覧を表示できる", async ({ page }) => {
    // SCEN-745
    await page.click('text=通知履歴');
    await expect(page.locator('#notification-history')).toBeVisible();
    await expect(page.locator('.notification-item')).toHaveCount({ min: 1 });
  });

  test("通知内容プレビューを表示", async ({ page }) => {
    // SCEN-746
    await page.click('text=設定');
    await page.fill('#notification-content', 'テスト内容');
    await page.click('#preview-button');
    await expect(page.locator('#preview-modal')).toBeVisible();
  });

  test("テスト通知を送信できる", async ({ page }) => {
    // SCEN-747
    await page.click('text=設定');
    await page.click('#test-notification-button');
    await page.fill('#test-message', 'テストメッセージ');
    await page.click('#send-test');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("設定内容を保存できる", async ({ page }) => {
    // SCEN-748
    await page.click('text=設定');
    await page.check('#notification-toggle');
    await page.selectOption('#timing-select', '日次');
    await page.click('#save-button');
    await page.reload();
    await expect(page.locator('#notification-toggle')).toBeChecked();
  });

  test("偏差値に文字入力でエラー表示", async ({ page }) => {
    // SCEN-749
    await page.click('text=設定');
    await page.fill('#deviation-threshold', 'abc');
    await page.press('#deviation-threshold', 'Tab');
    await expect(page.locator('text=数値を入力してください')).toBeVisible();
  });

  test("順位に負の値入力でエラー表示", async ({ page }) => {
    // SCEN-750
    await page.click('text=設定');
    await page.fill('#rank-threshold', '-5');
    await page.click('#save-button');
    await expect(page.locator('text=正の整数を入力してください')).toBeVisible();
  });

  test("科目未選択で保存時エラー", async ({ page }) => {
    // SCEN-751
    await page.click('text=設定');
    await page.check('#notification-toggle');
    await page.click('#save-button');
    await expect(page.locator('text=科目を選択してください')).toBeVisible();
  });

  test("通知方法未選択で保存エラー", async ({ page }) => {
    // SCEN-752
    await page.click('text=設定');
    await page.uncheck('#notification-email');
    await page.uncheck('#notification-app');
    await page.click('#save-button');
    await expect(page.locator('text=通知方法を選択してください')).toBeVisible();
  });

  test("無効な時間帯設定でエラー", async ({ page }) => {
    // SCEN-753
    await page.click('text=設定');
    await page.fill('#start-time', '25:00');
    await page.fill('#end-time', '23:00');
    await page.click('#save-button');
    await expect(page.locator('text=無効な時間帯です')).toBeVisible();
  });

  test("ネットワークエラー時の保存失敗", async ({ page }) => {
    // SCEN-754
    await page.route('**/api/settings', route => route.abort());
    await page.click('text=設定');
    await page.check('#notification-toggle');
    await page.click('#save-button');
    await expect(page.locator('text=保存に失敗しました')).toBeVisible();
  });

  test("偏差値閾値0入力での動作確認", async ({ page }) => {
    // SCEN-755
    await page.click('text=設定');
    await page.fill('#deviation-threshold', '0');
    await page.click('#save-button');
    await expect(page.locator('text=0以上の値を入力してください')).toBeVisible();
  });

  test("偏差値閾値100入力での動作", async ({ page }) => {
    // SCEN-756
    await page.click('text=設定');
    await page.fill('#deviation-threshold', '100');
    await page.click('#save-button');
    await expect(page.locator('#deviation-threshold')).toHaveValue('100');
  });

  test("順位閾値1入力での動作確認", async ({ page }) => {
    // SCEN-757
    await page.click('text=設定');
    await page.fill('#rank-threshold', '1');
    await page.click('#save-button');
    await expect(page.locator('#rank-threshold')).toHaveValue('1');
  });

  test("全科目選択時の動作確認", async ({ page }) => {
    // SCEN-758
    await page.click('text=設定');
    await page.check('#select-all-subjects');
    await page.click('#save-button');
    await expect(page.locator('#subject-math')).toBeChecked();
  });

  test("全科目未選択時の動作確認", async ({ page }) => {
    // SCEN-759
    await page.click('text=設定');
    await page.uncheck('#select-all-subjects');
    await page.click('#save-button');
    await expect(page.locator('text=通知対象科目を1つ以上選択してください')).toBeVisible();
  });

  test("通知時間帯24時間設定確認", async ({ page }) => {
    // SCEN-760
    await page.click('text=設定');
    await page.fill('#start-time', '00:00');
    await page.fill('#end-time', '23:59');
    await page.click('#save-button');
    await expect(page.locator('#start-time')).toHaveValue('00:00');
  });

  test("通知履歴0件時の表示確認", async ({ page }) => {
    // SCEN-761
    await page.click('text=通知履歴');
    await expect(page.locator('text=通知履歴はありません')).toBeVisible();
  });

  test("通知履歴大量データ表示確認", async ({ page }) => {
    // SCEN-762
    await page.click('text=通知履歴');
    await expect(page.locator('#notification-history')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.notification-item')).toHaveCount({ min: 1000 });
  });
});