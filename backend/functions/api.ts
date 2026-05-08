import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { User, checkPermission } from './rbac';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE || 'main-table';

interface ResourceConfig {
  name: string;
  pkPrefix: string;
  fields: string[];
}

const RESOURCES: Record<string, ResourceConfig> = {
  '0': { name: '偏差値基準マスタ', pkPrefix: 'DEVIATION_STANDARD', fields: ['偏差値基準ID', '基準名', '基準コード', '対象学年', '教科名', '試験種別', '実施年度', '実施月', '母集団数', '平均点', '標準偏差', '満点', '最高点', '最低点', '地域区分', '学校区分', '偏差値上限', '偏差値下限', '適用開始日', '適用終了日', '有効フラグ', '備考', '作成日時', '更新日時', '作成者ID', '更新者ID'] },
  '1': { name: '合格ライン偏差値マスタ', pkPrefix: 'PASS_LINE_DEVIATION', fields: ['合格ライン偏差値ID', '学校ID', '学部ID', '学科ID', '入試方式ID', '年度', '合格ライン偏差値', '安全圏偏差値', '挑戦圏偏差値', 'データ提供元', 'データ更新日', '備考', '有効フラグ', '作成日時', '更新日時'] },
  '2': { name: '予備校成績データ', pkPrefix: 'PREP_SCHOOL_GRADE', fields: ['成績ID', '受験生ID', '予備校ID', 'テスト種別', 'テスト名', '実施日', '結果発表日', '総合得点', '総合満点', '総合偏差値', '総合順位', '受験者数', '志望校判定', '学年', '受験コース', '目標偏差値', '前回比較', '成績表画像パス', '講師コメント', '保護者確認フラグ', '保護者確認日時', '通知送信フラグ', '通知送信日時', 'データ登録者ID', '登録日時', '更新日時', '削除フラグ'] },
  '3': { name: '模試結果データ', pkPrefix: 'MOCK_EXAM_RESULT', fields: ['模試結果ID', '受験生ID', '模試名', '模試実施機関', '模試種別', '実施年度', '実施回数', '受験日', '結果発表日', '総合得点', '総合満点', '総合偏差値', '全国順位', '全国受験者数', '都道府県順位', '都道府県受験者数', '文理区分', '志望校判定結果', '成績表画像パス', '保護者確認フラグ', '保護者確認日時', 'コメント', 'データ登録者', '登録日時', '更新日時', '削除フラグ'] },
  '4': { name: '科目別成績データ', pkPrefix: 'SUBJECT_GRADE', fields: ['成績ID', '受験生ID', '模試ID', '科目コード', '科目名', '試験種別', '試験名', '実施日', '得点', '満点', '偏差値', '順位', '受験者数', '平均点', '最高点', '最低点', '標準偏差', '前回得点', '前回偏差値', '得点差', '偏差値差', '目標得点', '目標偏差値', '目標達成フラグ', '学年', '学期', '志望校判定', '単元名', '難易度', 'コメント', '弱点分野', '改善提案', 'データ取得元', 'データ取得日', '公開フラグ', '通知済フラグ', '登録日時', '更新日時', '登録者ID', '更新者ID'] },
  '5': { name: '偏差値履歴データ', pkPrefix: 'DEVIATION_HISTORY', fields: ['偏差値履歴ID', '受験生ID', '科目ID', '模試ID', '予備校成績ID', '偏差値', '偏差値詳細', '測定日', 'データ種別', 'テスト名', '得点', '満点', '平均点', '受験者数', '順位', '前回比較', '目標偏差値', '目標達成フラグ', '学年', '学期', '備考', '保護者通知済フラグ', '通知日時', 'データ登録者', 'データ登録日時', 'データ更新日時', '削除フラグ'] },
  '6': { name: '模試日程データ', pkPrefix: 'MOCK_EXAM_SCHEDULE', fields: ['模試日程ID', '模試名', '模試略称', '実施機関名', '対象学年', '模試種別', '実施日', '申込開始日', '申込締切日', '結果発表予定日', '実施時間', '受験料', '会場情報', '出題範囲', '備考', '申込可能フラグ', '公開フラグ', '重要度', '申込URL', '詳細情報URL', '作成日時', '更新日時', '作成者ID', '更新者ID'] },
  '7': { name: '志望校登録データ', pkPrefix: 'DESIRED_SCHOOL', fields: ['志望校登録ID', '受験生ID', '学校名', '学部名', '学科名', '入試方式', '志望順位', '入試日程', '出願締切日', '合格発表日', '必要偏差値', '目標得点率', '受験料', '学費年額', '所在地都道府県', '所在地市区町村', '国公私立区分', '学校種別', '併願校フラグ', '安全校フラグ', 'チャレンジ校フラグ', '出願予定フラグ', '出願完了フラグ', '受験完了フラグ', '合格フラグ', '進学決定フラグ', '備考', '登録日時', '更新日時', '削除フラグ'] },
  '8': { name: '合格可能性算出結果', pkPrefix: 'PASS_PROBABILITY', fields: ['合格可能性算出結果ID', '受験生ID', '志望校登録ID', '模試結果ID', '算出日時', '算出基準日', '総合偏差値', '志望校合格ライン偏差値', '合格可能性判定', '合格可能性パーセント', '偏差値差分', '必要偏差値上昇値', '算出方式', '信頼度', '前回算出結果ID', '判定変化', 'コメント', '保護者通知済フラグ', '保護者通知日時', '受験生確認済フラグ', '受験生確認日時', '重要度', '有効フラグ', '作成者ID', '作成日時', '更新日時'] },
  '9': { name: '成績推移分析結果', pkPrefix: 'GRADE_TREND_ANALYSIS', fields: ['分析結果ID', '受験生ID', '分析期間開始日', '分析期間終了日', '分析種別', '対象科目', '総合偏差値推移傾向', '偏差値変化量', '最高偏差値', '最低偏差値', '平均偏差値', '偏差値標準偏差', '成績安定度', '得意科目', '苦手科目', '改善科目', '要注意科目', '志望校合格可能性推移', '合格可能性変化量', '目標達成度', '学習効果判定', '推奨アクション', '保護者向けコメント', '次回目標偏差値', '分析実行日時', '分析者ID', '公開フラグ', '通知送信フラグ', '作成日時', '更新日時'] },
  '10': { name: '科目別分析結果', pkPrefix: 'SUBJECT_ANALYSIS', fields: ['分析結果ID', '受験生ID', '科目コード', '科目名', '分析期間開始日', '分析期間終了日', '分析実行日時', '現在偏差値', '前回偏差値', '偏差値変動', '平均得点率', '最高得点率', '最低得点率', '得点安定性指標', '志望校合格ライン偏差値', '合格ラインとの差', '弱点分野1', '弱点分野1得点率', '弱点分野2', '弱点分野2得点率', '弱点分野3', '弱点分野3得点率', '得意分野1', '得意分野1得点率', '得意分野2', '得意分野2得点率', '学習時間合計', '学習効率指標', '推奨学習時間', '改善提案1', '改善提案2', '改善提案3', '総合評価', '緊急度レベル', '目標達成予測日', '保護者向けコメント', '前回比較コメント', '分析データ件数', '信頼度', '次回分析予定日', 'アラート表示フラグ', '公開フラグ', '作成者ID', '更新者ID', '作成日時', '更新日時'] },
  '11': { name: '助言コンテンツマスタ', pkPrefix: 'ADVICE_CONTENT', fields: ['助言コンテンツID', '助言カテゴリ', '助言タイトル', '助言内容', '対象偏差値下限', '対象偏差値上限', '対象学年', '対象時期', '成績推移パターン', '合格可能性範囲下限', '合格可能性範囲上限', '優先度', '表示フラグ', '緊急度', '助言種別', '関連URL', '作成者ID', '承認者ID', '有効開始日', '有効終了日', '作成日時', '更新日時'] },
  '12': { name: '助言提案履歴', pkPrefix: 'ADVICE_PROPOSAL_HISTORY', fields: ['助言提案履歴ID', '受験生ID', '助言コンテンツID', '提案日時', '提案理由', '対象科目コード', '優先度', '緊急度', '提案時偏差値', '提案時合格可能性', '閲覧日時', '実行開始日時', '実行完了日時', '実行状況', '効果測定日時', '効果測定結果', '効果測定偏差値', '偏差値変化', '保護者コメント', '受験生コメント', '自動提案フラグ', '提案者ID', '関連模試ID', '関連成績データID', '通知送信日時', '通知方法', '有効期限', '削除フラグ', '作成日時', '更新日時'] },
  '13': { name: 'Webスクレイピング設定マスタ', pkPrefix: 'WEB_SCRAPING_CONFIG', fields: ['スクレイピング設定ID', '設定名', '対象サイト名', 'ベースURL', 'ログインURL', 'データ取得URL', 'ユーザー名フィールド名', 'パスワードフィールド名', 'ログインボタンセレクタ', '成績データセレクタ', '科目名セレクタ', '得点セレクタ', '偏差値セレクタ', '順位セレクタ', '実施日セレクタ', '待機時間秒', 'リトライ回数', 'タイムアウト秒', 'ヘッダー情報', '認証方式', 'データ形式', '文字エンコーディング', '実行頻度', '最終実行日時', '次回実行予定日時', '有効フラグ', '自動実行フラグ', 'エラー通知フラグ', '作成日時', '更新日時', '作成者ID', '更新者ID'] },
  '14': { name: '予備校サイト情報マスタ', pkPrefix: 'PREP_SCHOOL_SITE_INFO', fields: ['予備校サイト情報ID', '予備校名', '予備校略称', '公式サイトURL', '成績確認サイトURL', 'ログインページURL', 'API提供有無', 'APIURL', 'APIキー', 'スクレイピング対応有無', 'データ更新頻度', '対応模試種別', '偏差値算出方式', '成績表示形式', 'データ取得可能期間', '連携開始日', '連携終了日', '利用可能状態', '備考', '作成日時', '更新日時'] },
  '15': { name: 'データ取得ログ', pkPrefix: 'DATA_ACQUISITION_LOG', fields: ['ログID', '取得処理ID', 'データソース種別', 'データソース名', '取得対象URL', '取得データ種別', '受験生ID', '実行開始日時', '実行終了日時', '処理ステータス', '取得件数', 'エラー件数', 'エラーコード', 'エラーメッセージ', 'HTTPステータスコード', 'レスポンス時間', 'データサイズ', 'リトライ回数', 'スクレイピング設定ID', '実行サーバー', '実行ユーザー', '取得パラメータ', 'レスポンスヘッダー', '通知送信フラグ', '通知送信日時', '備考', '作成日時', '更新日時'] },
  '16': { name: '成績データ統合履歴', pkPrefix: 'GRADE_DATA_INTEGRATION_HISTORY', fields: ['統合履歴ID', '受験生ID', '統合処理日時', '統合対象期間開始日', '統合対象期間終了日', '統合処理種別', '統合処理ステータス', '予備校データ件数', '模試データ件数', '科目別データ件数', '統合後データ件数', '重複データ件数', 'エラーデータ件数', 'データ整合性チェック結果', '偏差値再計算実行フラグ', '合格可能性再算出実行フラグ', '統合処理開始日時', '統合処理終了日時', '処理時間秒', '統合ルール適用バージョン', 'エラーメッセージ', '統合処理詳細ログ', '実行者種別', '実行者ID', '通知送信フラグ', '通知送信日時', '備考', '作成日時', '更新日時'] },
  '17': { name: 'グラフ表示設定', pkPrefix: 'GRAPH_DISPLAY_CONFIG', fields: ['グラフ表示設定ID', '受験生ID', '保護者ID', 'グラフ種別', '表示データ種別', '対象科目', '表示期間開始日', '表示期間終了日', 'Y軸最小値', 'Y軸最大値', '目標ライン表示フラグ', '目標値', '合格ライン表示フラグ', '平均値表示フラグ', 'トレンドライン表示フラグ', 'グリッド表示フラグ', 'データポイント表示フラグ', '色設定', 'グラフタイトル', 'X軸ラベル', 'Y軸ラベル', '凡例表示フラグ', '凡例位置', 'アニメーション有効フラグ', 'デフォルト設定フラグ', '設定名', '備考', '作成日時', '更新日時', '削除フラグ'] },
  '18': { name: '通知設定マスタ', pkPrefix: 'NOTIFICATION_CONFIG', fields: ['通知設定ID', '受験生ID', '保護者ID', '通知種別コード', '通知種別名', '通知方法', '通知有効フラグ', '通知タイミング', '通知時刻', '通知曜日', '通知日', '偏差値変動閾値', '合格可能性変動閾値', '成績順位変動閾値', '対象科目', '対象模試種別', '通知メッセージテンプレート', '通知優先度', '通知頻度制限', '最終通知日時', '通知開始日', '通知終了日', '作成日時', '更新日時', '作成者ID', '更新者ID'] },
  '19': { name: '通知履歴', pkPrefix: 'NOTIFICATION_HISTORY', fields: ['通知履歴ID', '受験生ID', '保護者ID', '通知設定ID', '通知種別', '通知タイトル', '通知内容', '通知方法', '送信先アドレス', '優先度', '関連データ種別', '関連データID', '送信予定日時', '送信日時', '送信ステータス', '配信結果', 'エラーメッセージ', '既読フラグ', '既読日時', '開封フラグ', '開封日時', 'リンククリックフラグ', 'リンククリック日時', '再送回数', '最終再送日時', '有効期限', '削除フラグ', '作成日時', '更新日時'] },
  '20': { name: 'ログイン履歴', pkPrefix: 'LOGIN_HISTORY', fields: ['ログイン履歴ID', 'ユーザーID', '受験生ID', 'ログイン日時', 'ログアウト日時', 'IPアドレス', 'ユーザーエージェント', 'デバイス種別', 'OS種別', 'ブラウザ種別', 'ログイン方法', 'ログイン結果', '失敗理由', 'セッションID', 'セッション継続時間', 'アクセス地域', '不正アクセス疑い', '通知送信フラグ', 'リファラー', 'ログイン試行回数', '備考', '作成日時', '更新日時'] },
  '21': { name: 'システム利用ログ', pkPrefix: 'SYSTEM_USAGE_LOG', fields: ['ログID', 'ユーザーID', 'セッションID', '操作種別', '画面名', '機能名', '対象テーブル名', '対象レコードID', 'HTTPメソッド', 'リクエストURL', 'リクエストパラメータ', 'レスポンスステータス', '処理時間ミリ秒', 'IPアドレス', 'ユーザーエージェント', 'リファラー', 'デバイス種別', 'OS種別', 'ブラウザ種別', 'エラーフラグ', 'エラーコード', 'エラーメッセージ', '操作結果', '操作詳細', 'ログレベル', 'ログ出力日時', 'サーバー名', 'アプリケーションバージョン', '備考'] },
  '22': { name: 'データ変更履歴', pkPrefix: 'DATA_CHANGE_HISTORY', fields: ['変更履歴ID', '変更対象テーブル名', '変更対象レコードID', '変更種別', '変更前データ', '変更後データ', '変更項目名', '変更理由', '変更実行者ID', '変更実行者種別', '変更実行機能名', '変更実行IPアドレス', '変更実行ユーザーエージェント', 'トランザクションID', '変更承認者ID', '変更承認日時', '自動変更フラグ', '重要度レベル', '復旧可能フラグ', '関連受験生ID', '変更実行日時', '登録日時', '備考'] },
  '23': { name: 'エラーログ', pkPrefix: 'ERROR_LOG', fields: ['エラーID', '発生日時', 'エラーレベル', 'エラーコード', 'エラーメッセージ', 'スタックトレース', '発生モジュール', '発生機能', '発生画面', 'ユーザーID', 'セッションID', 'リクエストID', 'IPアドレス', 'ユーザーエージェント', 'リクエストURL', 'HTTPメソッド', 'リクエストパラメータ', 'レスポンスコード', '処理時間', 'データベースエラー', '外部API呼び出しエラー', 'ファイル処理エラー', '認証エラー', 'バリデーションエラー', 'システムエラー', '対応状況', '対応者', '対応開始日時', '対応完了日時', '対応内容', '根本原因', '再発防止策', '通知済み', '通知日時', '重要度', '影響範囲', '関連エラーID', 'サーバー名', 'アプリケーションバージョン', '削除フラグ', '作成日時', '更新日時'] },
  '24': { name: 'バッチ処理履歴', pkPrefix: 'BATCH_PROCESS_HISTORY', fields: ['バッチ処理履歴ID', 'バッチ処理名', 'バッチ処理種別', '実行開始日時', '実行終了日時', '実行ステータス', '処理対象件数', '処理成功件数', '処理失敗件数', '処理時間秒', '実行トリガー', '実行サーバー', 'プロセスID', '実行パラメータ', '処理結果メッセージ', 'エラーメッセージ', 'エラーコード', 'リトライ回数', '最大リトライ回数', '次回実行予定日時', '実行ユーザーID', '関連データID', 'ログファイルパス', 'メモリ使用量MB', 'CPU使用率', '通知送信フラグ', '通知送信日時', 'バックアップ作成フラグ', 'バックアップファイルパス', '登録日時'] }
};

function createResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

function getUserFromEvent(event: APIGatewayProxyEvent): User {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    throw new Error('Authorization header required');
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return {
      id: payload.sub || 'anonymous',
      role: payload.role || 'viewer',
      permissions: payload.permissions || []
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function createAuditLog(action: string, resource: string, userId: string, details?: any): Promise<void> {
  const auditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}_${randomUUID()}`,
    action,
    resource,
    userId,
    timestamp: new Date().toISOString(),
    details: details || {}
  };
  
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: auditLog
  }));
}

function validateResourceIndex(resourceIndex: string): ResourceConfig {
  const resource = RESOURCES[resourceIndex];
  if (!resource) {
    throw new Error(`Invalid resource index: ${resourceIndex}`);
  }
  return resource;
}

function addTimestamps(item: Record<string, any>, isUpdate: boolean = false): Record<string, any> {
  const now = new Date().toISOString();
  if (!isUpdate) {
    item.id = item.id || randomUUID();
    item.createdAt = now;
  }
  item.updatedAt = now;
  return item;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const path = event.path;
    const pathParts = path.split('/').filter(p => p);
    
    if (method === 'OPTIONS') {
      return createResponse(200, {});
    }
    
    let user: User;
    try {
      user = getUserFromEvent(event);
    } catch (error) {
      return createResponse(401, { error: 'Unauthorized' });
    }
    
    // GET /resources - リソース一覧取得
    if (method === 'GET' && path === '/resources') {
      try {
        checkPermission(user, 'resources', 'read');
      } catch (error) {
        return createResponse(403, { error: error.message });
      }
      
      const resourceList = Object.entries(RESOURCES).map(([index, config]) => ({
        index,
        name: config.name,
        fields: config.fields
      }));
      
      await createAuditLog('READ', 'resources', user.id);
      return createResponse(200, { resources: resourceList });
    }
    
    // リソース操作のパターンマッチング
    const resourceMatch = path.match(/^\/api\/(\d+)(?:\/(\w+))?(?:\/(\w+))?$/);
    if (!resourceMatch) {
      return createResponse(404, { error: 'Not found' });
    }
    
    const [, resourceIndex, action, id] = resourceMatch;
    
    let resource: ResourceConfig;
    try {
      resource = validateResourceIndex(resourceIndex);
    } catch (error) {
      return createResponse(400, { error: error.message });
    }
    
    // 一括インポート処理
    if (method === 'POST' && action === 'bulk') {
      try {
        checkPermission(user, resource.name, 'bulk');
      } catch (error) {
        return createResponse(403, { error: error.message });
      }
      
      const body = JSON.parse(event.body || '{}');
      const items = body.items || [];
      
      if (!Array.isArray(items)) {
        return createResponse(400, { error: 'items must be an array' });
      }
      
      let imported = 0;
      let failed = 0;
      const errors: string[] = [];
      
      // 25件ずつに分割してバッチ処理
      for (let i = 0; i < items.length; i += 25) {
        const batch = items.slice(i, i + 25);
        const writeRequests = batch.map(item => {
          const processedItem = addTimestamps({ ...item });
          processedItem.pk = `${resource.pkPrefix}#${processedItem.id}`;
          processedItem.sk = processedItem.id;
          
          return {
            PutRequest: {
              Item: processedItem
            }
          };
        });
        
        try {
          await docClient.send(new BatchWriteCommand({
            RequestItems: {
              [TABLE_NAME]: writeRequests
            }
          }));
          imported += batch.length;
        } catch (error) {
          failed += batch.length;
          errors.push(`Batch ${Math.floor(i/25) + 1}: ${error.message}`);
        }
      }
      
      await createAuditLog('BULK_IMPORT', resource.name, user.id, { imported, failed });
      return createResponse(200, { imported, failed, errors });
    }
    
    // 一覧取得
    if (method === 'GET' && !action) {
      try {
        checkPermission(user, resource.name, 'read');
      } catch (error) {
        return createResponse(403, { error: error.message });
      }
      
      const result = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(pk, :pkPrefix)',
        ExpressionAttributeValues: {
          ':pkPrefix': resource.pkPrefix
        }
      }));
      
      await createAuditLog('READ', resource.name, user.id);
      return createResponse(200, { items: result.Items || [] });
    }
    
    // 詳細取得
    if (method === 'GET' && action && !id) {
      try {
        checkPermission(user, resource.name, 'read');
      } catch (error) {
        return createResponse(403, { error: error.message });
      }
      
      const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `${resource.pkPrefix}#${action}`,
          sk: action
        }
      }));
      
      if (!result.Item) {
        return createResponse(404, { error: 'Item not found' });
      }
      
      await createAuditLog('READ', resource.name, user.id, { id: action });
      return createResponse(200, result.Item);
    }
    
    // 新規作成
    if (method === 'POST' && !action) {
      try {
        checkPermission(user, resource.name, 'create');
      } catch (error) {
        return createResponse(403, { error: error.message });
      }
      
      const body = JSON.parse(event.body || '{}');
      const item = addTimestamps(body);
      item.pk = `${resource.pkPrefix}#${item.id}`;
      item.sk = item.id;
      
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));
      
      await createAuditLog('CREATE', resource.name, user.id, { id: item.id });
      return createResponse(201, item);
    }
    
    // 更新
    if (method === 'PUT' && action && !id) {
      try {
        checkPermission(user, resource.name, 'update');
      } catch (error) {
        return createResponse(403, { error: error.message });
      }
      
      const body = JSON.parse(event.body || '{}');
      const item = addTimestamps(body, true);
      item.pk = `${resource.pkPrefix}#${action}`;
      item.sk = action;
      item.id = action;
      
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));
      
      await createAuditLog('UPDATE', resource.name, user.id, { id: action });
      return createResponse(200, item);
    }
    
    // 削除
    if (method === 'DELETE' && action && !id) {
      try {
        checkPermission(user, resource.name, 'delete');
      } catch (error) {
        return createResponse(403, { error: error.message });
      }
      
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `${resource.pkPrefix}#${action}`,
          sk: action
        }
      }));
      
      await createAuditLog('DELETE', resource.name, user.id, { id: action });
      return createResponse(200, { message: 'Item deleted successfully' });
    }
    
    return createResponse(404, { error: 'Not found' });
    
  } catch (error) {
    console.error('Error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};