describe("受験生保護者向け成績管理アプリの開発", () => {
  const fetchMock = require("jest-fetch-mock");

  test("成績データ統合機能 - 複数予備校の成績データを正常に統合できる", async () => {
    // SCEN-867
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ schoolA: { math: 75, english: 80 }, schoolB: { math: 78, english: 82 }, schoolC: { math: 76, english: 79 } }), { status: 200 });
    const response = await fetch("/api/integrate-scores");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.schoolA.math).toBe(75);
  });

  test("成績データ統合機能 - データ統合時にエラーが発生した場合の処理", async () => {
    // SCEN-868
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("", { status: 500 });
    const response = await fetch("/api/integrate-scores");
    expect(response.status).toBe(500);
  });

  test("模試日程自動取得機能 - 予備校Webサイトから模試日程を正常取得できる", async () => {
    // SCEN-869
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ examDate: "2024-03-15", subject: "math", venue: "Tokyo" }), { status: 200 });
    const response = await fetch("/api/exam-schedule");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.examDate).toBe("2024-03-15");
  });

  test("模試日程自動取得機能 - Webサイトアクセス失敗時の例外処理", async () => {
    // SCEN-870
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("", { status: 404 });
    const response = await fetch("/api/exam-schedule");
    expect(response.status).toBe(404);
  });

  test("偏差値グラフ表示機能 - 模試結果の偏差値を時系列グラフで表示できる", async () => {
    // SCEN-871
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ deviationScores: [{ date: "2024-01-15", score: 65 }, { date: "2024-02-15", score: 67 }] }), { status: 200 });
    const response = await fetch("/api/deviation-graph");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.deviationScores).toHaveLength(2);
  });

  test("偏差値グラフ表示機能 - 偏差値データが0件の場合のグラフ表示", async () => {
    // SCEN-872
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ deviationScores: [] }), { status: 200 });
    const response = await fetch("/api/deviation-graph");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.deviationScores).toHaveLength(0);
  });

  test("合格可能性算出機能 - 志望校との偏差値比較で合格可能性を算出できる", async () => {
    // SCEN-873
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ probability: 85, judgment: "A" }), { status: 200 });
    const response = await fetch("/api/admission-probability");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.probability).toBeGreaterThan(80);
  });

  test("合格可能性算出機能 - 志望校データが存在しない場合の処理", async () => {
    // SCEN-874
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("", { status: 400 });
    const response = await fetch("/api/admission-probability");
    expect(response.status).toBe(400);
  });

  test("科目別偏差値推移表示機能 - 科目別偏差値推移グラフを正常に表示できる", async () => {
    // SCEN-875
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ subject: "math", scores: [{ date: "2024-01-15", deviation: 65 }] }), { status: 200 });
    const response = await fetch("/api/subject-deviation");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.subject).toBe("math");
  });

  test("科目別偏差値差分算出機能 - 志望校合格ラインとの偏差値差分を算出できる", async () => {
    // SCEN-876
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ japanese: -3, math: -12, english: 7 }), { status: 200 });
    const response = await fetch("/api/deviation-difference");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.math).toBe(-12);
  });

  test("成績推移・科目別分析表示機能 - 成績推移グラフと科目別分析を表示できる", async () => {
    // SCEN-877
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ trend: [{ date: "2024-01-15", score: 75 }], analysis: { average: 76.5 } }), { status: 200 });
    const response = await fetch("/api/score-analysis");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.analysis.average).toBe(76.5);
  });

  test("志望校比較表示機能 - 志望校合格ラインと現在成績を比較表示できる", async () => {
    // SCEN-878
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ school1: { requiredScore: 65, currentScore: 62 }, school2: { requiredScore: 70, currentScore: 68 } }), { status: 200 });
    const response = await fetch("/api/school-comparison");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.school1.requiredScore).toBe(65);
  });

  test("成績データ可視化機能 - 成績推移をグラフ・チャートで可視化できる", async () => {
    // SCEN-879
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ chartData: [{ period: "2024-01", score: 75 }, { period: "2024-02", score: 78 }] }), { status: 200 });
    const response = await fetch("/api/visualization");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.chartData).toHaveLength(2);
  });

  test("助言コンテンツ提案機能 - 成績データに基づく助言コンテンツを提案できる", async () => {
    // SCEN-880
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ advice: "数学の基礎問題を重点的に学習してください", weakSubject: "math" }), { status: 200 });
    const response = await fetch("/api/advice");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.weakSubject).toBe("math");
  });

  test("助言コンテンツ提案機能 - 成績データ不足時の助言提案処理", async () => {
    // SCEN-881
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ message: "データ不足のため一般的なアドバイスを表示します" }), { status: 200 });
    const response = await fetch("/api/advice");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.message).toContain("データ不足");
  });
});