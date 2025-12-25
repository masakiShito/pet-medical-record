# 04_API一覧（改訂版：領域別ページ設計 v2）

## 1. 目的
本ドキュメントは、ペットカルテアプリ（MVP）のAPIを一覧化し、フロント実装とバックエンド実装の「契約（Contract）」を固定する。

本v2では、通院（vet-visits）を主役にしつつ、体重（weights）・投薬（medications）を領域別に扱えるようにする。

---

## 2. API方針（v2）
- **領域別APIを提供**（/vet-visits, /weights, /medications）  
  → 画面（S07〜S13）の実装が直感的になる
- 既存の「1日まとめ（records）」も残す（S05/S06/S14の互換）
- MVPでは認証なし想定（将来: user_id 追加等で拡張）
- 削除は基本 **論理削除**（is_deleted, deleted_at等）を推奨（実装は後で統一）

---

## 3. 共通仕様（概要）
- Base URL: `/api`
- Content-Type: `application/json`
- 日付: `YYYY-MM-DD`
- 金額: `cost_yen` は整数（円）
- エラー: `{"detail": "...", "code": "...", "fields": {...}}`（詳細は各API詳細参照）

---

## 4. API一覧（v2）

### 4.1 Health
| No | 種別 | Method | Path | 用途 | 詳細 |
|---:|---|---|---|---|---|
| H1 | health | GET | `/health` | API稼働確認 | health_api_v2.md |
| H2 | health | GET | `/db/health` | DB疎通確認 | health_api_v2.md |

### 4.2 Pets
| No | 種別 | Method | Path | 用途 | 詳細 |
|---:|---|---|---|---|---|
| P1 | pets | GET | `/pets` | ペット一覧取得（S01/S02） | pets_api_v2.md |
| P2 | pets | POST | `/pets` | ペット作成（S03） | pets_api_v2.md |
| P3 | pets | GET | `/pets/{pet_id}` | ペット取得（S04） | pets_api_v2.md |
| P4 | pets | PUT | `/pets/{pet_id}` | ペット更新（S03） | pets_api_v2.md |
| P5 | pets | DELETE | `/pets/{pet_id}` | ペット削除（論理） | pets_api_v2.md |
| P6 | pets | GET | `/pets/{pet_id}/summary` | ペットサマリ（S01/S04） | pets_api_v2.md |

### 4.3 Vet Visits（通院）
| No | 種別 | Method | Path | 用途 | 詳細 |
|---:|---|---|---|---|---|
| V1 | vet_visits | GET | `/pets/{pet_id}/vet-visits` | 通院一覧（S07） | vet_visits_api_v2.md |
| V2 | vet_visits | POST | `/pets/{pet_id}/vet-visits` | 通院作成（S08） | vet_visits_api_v2.md |
| V3 | vet_visits | GET | `/pets/{pet_id}/vet-visits/{visit_id}` | 通院詳細（S09） | vet_visits_api_v2.md |
| V4 | vet_visits | PUT | `/pets/{pet_id}/vet-visits/{visit_id}` | 通院更新（S08） | vet_visits_api_v2.md |
| V5 | vet_visits | DELETE | `/pets/{pet_id}/vet-visits/{visit_id}` | 通院削除（論理） | vet_visits_api_v2.md |

### 4.4 Weights（体重）
| No | 種別 | Method | Path | 用途 | 詳細 |
|---:|---|---|---|---|---|
| W1 | weights | GET | `/pets/{pet_id}/weights` | 体重一覧（S10） | weights_api_v2.md |
| W2 | weights | POST | `/pets/{pet_id}/weights` | 体重作成（S11） | weights_api_v2.md |
| W3 | weights | GET | `/pets/{pet_id}/weights/{weight_id}` | 体重取得（編集初期表示） | weights_api_v2.md |
| W4 | weights | PUT | `/pets/{pet_id}/weights/{weight_id}` | 体重更新（S11） | weights_api_v2.md |
| W5 | weights | DELETE | `/pets/{pet_id}/weights/{weight_id}` | 体重削除（論理） | weights_api_v2.md |

### 4.5 Medications（投薬）
| No | 種別 | Method | Path | 用途 | 詳細 |
|---:|---|---|---|---|---|
| M1 | medications | GET | `/pets/{pet_id}/medications` | 投薬一覧（S12） | medications_api_v2.md |
| M2 | medications | POST | `/pets/{pet_id}/medications` | 投薬作成（S13） | medications_api_v2.md |
| M3 | medications | GET | `/pets/{pet_id}/medications/{med_id}` | 投薬取得（編集初期表示） | medications_api_v2.md |
| M4 | medications | PUT | `/pets/{pet_id}/medications/{med_id}` | 投薬更新（S13） | medications_api_v2.md |
| M5 | medications | DELETE | `/pets/{pet_id}/medications/{med_id}` | 投薬削除（論理） | medications_api_v2.md |
| M6 | medications | GET | `/pets/{pet_id}/medications/active` | 継続中投薬（任意） | medications_api_v2.md |

### 4.6 Records（1日まとめ）
| No | 種別 | Method | Path | 用途 | 詳細 |
|---:|---|---|---|---|---|
| R1 | records | GET | `/pets/{pet_id}/records` | 記録一覧（履歴S05） | records_api_v2.md |
| R2 | records | POST | `/pets/{pet_id}/records` | 記録作成（S14） | records_api_v2.md |
| R3 | records | GET | `/pets/{pet_id}/records/{record_id}` | 記録詳細（S06） | records_api_v2.md |
| R4 | records | PUT | `/pets/{pet_id}/records/{record_id}` | 記録更新（S14） | records_api_v2.md |
| R5 | records | DELETE | `/pets/{pet_id}/records/{record_id}` | 記録削除（論理） | records_api_v2.md |

---

## 5. 備考（MVPでの実装優先度）
- **最優先**: H1/H2, P1/P2/P3/P6, V1〜V4（通院）, W1〜W4（体重）, M1〜M4（投薬）, R1/R3（履歴）
- **次点**: 削除系（DELETE）
- **将来**: 検索/フィルタ、ページング、添付、再診管理

