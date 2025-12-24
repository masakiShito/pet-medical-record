# 04_API一覧

## 1. 目的
ペットカルテアプリ（MVP）のフロントエンド実装に必要なAPIを一覧化し、エンドポイント抜け漏れを防ぐ。

---

## 2. 前提（MVP）
- 認証なし（シングルユーザー想定）
- データは論理削除（`is_deleted`）を基本
- 記録は `records` を親にし、子要素（体重/投薬/通院）を紐づける
- APIはREST（FastAPI）想定

---

## 3. 共通仕様（最小）
- Base URL: `/api`
- 日付形式: `YYYY-MM-DD`
- レスポンス: JSON
- エラー: `{"detail": "..."}`
- 論理削除: `DELETE` で `is_deleted = 1`（物理削除はしない）

---

## 4. API一覧

### 4.1 ヘルスチェック
| No | Method | Path | 概要 | 主な用途（画面） |
|---:|---|---|---|---|
| H1 | GET | `/health` | API稼働確認 | 開発/監視 |
| H2 | GET | `/db/health` | DB疎通確認 | 開発/監視 |

---

### 4.2 ペット
| No | Method | Path | 概要 | 主な用途（画面） |
|---:|---|---|---|---|
| P1 | GET | `/pets` | ペット一覧取得 | S01/S02 |
| P2 | POST | `/pets` | ペット新規作成 | S03 |
| P3 | GET | `/pets/{pet_id}` | ペット詳細取得 | S04 |
| P4 | PUT | `/pets/{pet_id}` | ペット更新 | S03 |
| P5 | DELETE | `/pets/{pet_id}` | ペット論理削除 | （MVPはUI後回し可） |

---

### 4.3 記録（親：records）
| No | Method | Path | 概要 | 主な用途（画面） |
|---:|---|---|---|---|
| R1 | GET | `/pets/{pet_id}/records` | 記録一覧取得（期間/件数指定） | S04 |
| R2 | POST | `/pets/{pet_id}/records` | 記録新規作成（子要素含む） | S05(new) |
| R3 | GET | `/pets/{pet_id}/records/{record_id}` | 記録詳細取得（子要素含む） | S06 / S05(edit初期表示) |
| R4 | PUT | `/pets/{pet_id}/records/{record_id}` | 記録更新（子要素含む） | S05(edit) |
| R5 | DELETE | `/pets/{pet_id}/records/{record_id}` | 記録論理削除 | S05/S06 |

#### 記録一覧の代表的クエリ
- `?from=2025-01-01&to=2025-12-31`
- `?limit=50&offset=0`
- `?type=weight|medication|vet_visit`（任意：フィルタ拡張用）

---

### 4.4 子要素（任意：分割APIとして用意する場合）
MVPは **R2/R4で子要素込みの一括保存**が最短。  
ただしUIで「行追加/行削除」を独立させたい場合は以下を用意する。

#### 体重（record_weights）
| No | Method | Path | 概要 | 主な用途 |
|---:|---|---|---|---|
| W1 | POST | `/records/{record_id}/weights` | 体重行追加 | S05 |
| W2 | PUT | `/records/{record_id}/weights/{weight_id}` | 体重行更新 | S05 |
| W3 | DELETE | `/records/{record_id}/weights/{weight_id}` | 体重行削除 | S05 |

#### 投薬（record_medications）
| No | Method | Path | 概要 | 主な用途 |
|---:|---|---|---|---|
| M1 | POST | `/records/{record_id}/medications` | 投薬行追加 | S05 |
| M2 | PUT | `/records/{record_id}/medications/{medication_id}` | 投薬行更新 | S05 |
| M3 | DELETE | `/records/{record_id}/medications/{medication_id}` | 投薬行削除 | S05 |

#### 通院（record_vet_visits）
| No | Method | Path | 概要 | 主な用途 |
|---:|---|---|---|---|
| V1 | POST | `/records/{record_id}/vet-visits` | 通院行追加 | S05 |
| V2 | PUT | `/records/{record_id}/vet-visits/{visit_id}` | 通院行更新 | S05 |
| V3 | DELETE | `/records/{record_id}/vet-visits/{visit_id}` | 通院行削除 | S05 |

---

### 4.5 ホーム（サマリ：任意）
S01（ホーム）で「直近情報」だけ軽く取りたい場合に用意する。  
（R1で代替も可能）

| No | Method | Path | 概要 | 主な用途（画面） |
|---:|---|---|---|---|
| S1 | GET | `/home/summary` | ペット別サマリ（直近記録/今日の有無など） | S01 |

---

## 5. MVP推奨パターン（実装を楽にする）
- **推奨：記録は一括保存**（R2/R4で子要素もまとめて送受信）
  - フロントの状態管理がシンプル
  - 子要素のAPI増殖を防げる
- 子要素API（W/M/V）は「必要になったら追加」でOK

---

## 6. 次工程
- 05_API詳細/（`pets.md` `records.md` `health.md` など）を作成し、Request/Response・バリデーション・ステータスコードを確定する
