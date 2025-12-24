# API詳細：records

## 1. 概要
ペットの健康記録（親：records）と、子要素（体重/投薬/通院）をまとめて扱う。

- Base URL: `/api`
- 保存は **一括保存**（records + 子要素）
- 論理削除: `records.is_deleted = 1`
- 取得は records 詳細に子要素を含める（S06/S05の初期表示が楽）
- 保存処理は **トランザクション**（非機能設計に準拠）

---

## 2. エンドポイント一覧
| No | Method | Path | 概要 | 画面 |
|---:|---|---|---|---|
| R1 | GET | `/pets/{pet_id}/records` | 記録一覧取得 | S04 |
| R2 | POST | `/pets/{pet_id}/records` | 記録新規作成（子要素含む） | S05(new) |
| R3 | GET | `/pets/{pet_id}/records/{record_id}` | 記録詳細取得（子要素含む） | S06/S05(edit) |
| R4 | PUT | `/pets/{pet_id}/records/{record_id}` | 記録更新（子要素含む） | S05(edit) |
| R5 | DELETE | `/pets/{pet_id}/records/{record_id}` | 記録論理削除 | S05/S06 |

---

## 3. 共通データ型

### 3.1 Record（Response：詳細）
```json
{
  "id": 10,
  "pet_id": 1,
  "recorded_on": "2025-12-24",
  "title": "下痢っぽい",
  "condition_level": 3,
  "appetite_level": 4,
  "stool_level": 2,
  "memo": "フード変更したかも",
  "weights": [
    { "id": 100, "weight_kg": 6.70, "measured_at": "2025-12-24T08:00:00", "note": null }
  ],
  "medications": [
    { "id": 200, "name": "整腸剤", "dosage": "1/2錠", "frequency": "1日2回", "started_on": "2025-12-24", "ended_on": null, "note": null }
  ],
  "vet_visits": [
    { "id": 300, "hospital_name": "〇〇動物病院", "doctor": "田中", "reason": "下痢", "diagnosis": "胃腸炎", "cost_yen": 5500, "note": "1週間様子見" }
  ],
  "created_at": "2025-12-24T10:00:00",
  "updated_at": "2025-12-24T10:00:00"
}
```

### 3.2 RecordWeight（Request/Response）
```json
{ "id": 100, "weight_kg": 6.70, "measured_at": "2025-12-24T08:00:00", "note": null }
```

### 3.3 RecordMedication（Request/Response）
```json
{
  "id": 200,
  "name": "整腸剤",
  "dosage": "1/2錠",
  "frequency": "1日2回",
  "started_on": "2025-12-24",
  "ended_on": null,
  "note": null
}
```

### 3.4 RecordVetVisit（Request/Response）
```json
{
  "id": 300,
  "hospital_name": "〇〇動物病院",
  "doctor": "田中",
  "reason": "下痢",
  "diagnosis": "胃腸炎",
  "cost_yen": 5500,
  "note": "1週間様子見"
}
```

### 3.5 バリデーション（MVP）
- recorded_on: 必須、`YYYY-MM-DD`
- title: 0〜100文字
- condition_level / appetite_level / stool_level: 1〜5（任意）
- memo: 任意（上限は実装で制限可）
- weights[].weight_kg: 0.00〜999.99（DECIMAL(5,2)）
- vet_visits[].cost_yen: 0以上の整数
- medications[].name: 必須、1〜100文字

---

## 4. GET /api/pets/{pet_id}/records（R1）

### 4.1 Request（Query）
- `from`（任意）: `YYYY-MM-DD`
- `to`（任意）: `YYYY-MM-DD`
- `limit`（任意）: int（default=50, max=200）
- `offset`（任意）: int（default=0）

#### 例
- `/api/pets/1/records?from=2025-12-01&to=2025-12-31&limit=50&offset=0`

### 4.2 Response（200）
一覧はS04向けに軽量化（子要素は含めない）。詳細はR3で取得。
```json
{
  "items": [
    {
      "id": 10,
      "pet_id": 1,
      "recorded_on": "2025-12-24",
      "title": "下痢っぽい",
      "condition_level": 3,
      "appetite_level": 4,
      "stool_level": 2,
      "has_weights": true,
      "has_medications": true,
      "has_vet_visits": true,
      "updated_at": "2025-12-24T10:00:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 4.3 Status Codes
- 200: OK
- 404: Not Found（pet_idが存在しない/論理削除済み）

---

## 5. POST /api/pets/{pet_id}/records（R2）

### 5.1 Request Body（子要素込み）
```json
{
  "recorded_on": "2025-12-24",
  "title": "下痢っぽい",
  "condition_level": 3,
  "appetite_level": 4,
  "stool_level": 2,
  "memo": "フード変更したかも",
  "weights": [
    { "weight_kg": 6.70, "measured_at": "2025-12-24T08:00:00", "note": null }
  ],
  "medications": [
    { "name": "整腸剤", "dosage": "1/2錠", "frequency": "1日2回", "started_on": "2025-12-24", "ended_on": null, "note": null }
  ],
  "vet_visits": [
    { "hospital_name": "〇〇動物病院", "doctor": "田中", "reason": "下痢", "diagnosis": "胃腸炎", "cost_yen": 5500, "note": "1週間様子見" }
  ]
}
```

### 5.2 Response（201）
```json
{ "id": 10 }
```

### 5.3 Status Codes
- 201: Created
- 400: Validation Error
- 404: Not Found（pet_idが存在しない/論理削除済み）

### 5.4 処理仕様（重要）
- 親 `records` を作成後、子（weights/medications/vet_visits）を作成
- 途中失敗時はロールバック（整合性保証）
- 子配列が空/未指定でも保存可能（体重だけ/通院だけなど）

---

## 6. GET /api/pets/{pet_id}/records/{record_id}（R3）

### 6.1 Response（200）
```json
{
  "id": 10,
  "pet_id": 1,
  "recorded_on": "2025-12-24",
  "title": "下痢っぽい",
  "condition_level": 3,
  "appetite_level": 4,
  "stool_level": 2,
  "memo": "フード変更したかも",
  "weights": [
    { "id": 100, "weight_kg": 6.70, "measured_at": "2025-12-24T08:00:00", "note": null }
  ],
  "medications": [
    { "id": 200, "name": "整腸剤", "dosage": "1/2錠", "frequency": "1日2回", "started_on": "2025-12-24", "ended_on": null, "note": null }
  ],
  "vet_visits": [
    { "id": 300, "hospital_name": "〇〇動物病院", "doctor": "田中", "reason": "下痢", "diagnosis": "胃腸炎", "cost_yen": 5500, "note": "1週間様子見" }
  ],
  "created_at": "2025-12-24T10:00:00",
  "updated_at": "2025-12-24T10:00:00"
}
```

### 6.2 Status Codes
- 200: OK
- 404: Not Found（pet_id/record_idが不正、または論理削除済み）

---

## 7. PUT /api/pets/{pet_id}/records/{record_id}（R4）

### 7.1 Request Body
POSTと同形式。`id` を含めた子要素は「更新」、`id` なしは「追加」。
```json
{
  "recorded_on": "2025-12-24",
  "title": "下痢が改善",
  "condition_level": 4,
  "appetite_level": 4,
  "stool_level": 3,
  "memo": "薬が効いた",
  "weights": [
    { "id": 100, "weight_kg": 6.65, "measured_at": "2025-12-24T20:00:00", "note": null }
  ],
  "medications": [
    { "id": 200, "name": "整腸剤", "dosage": "1/2錠", "frequency": "1日2回", "started_on": "2025-12-24", "ended_on": null, "note": null }
  ],
  "vet_visits": [
    { "id": 300, "hospital_name": "〇〇動物病院", "doctor": "田中", "reason": "下痢", "diagnosis": "胃腸炎", "cost_yen": 5500, "note": "1週間様子見" }
  ]
}
```

### 7.2 子要素の更新ルール（推奨）
- **置き換え方式（シンプル）**：
  - リクエストで受け取った子配列を正として、DB側の子要素を同期する
  - `id` が存在しない行は追加、存在する行は更新、リクエストに無い既存行は削除（物理 or 論理は実装方針）
- MVPでは「物理削除」でOK（record自体は論理削除で保護）

### 7.3 Response（200）
```json
{ "id": 10 }
```

### 7.4 Status Codes
- 200: OK
- 400: Validation Error
- 404: Not Found

---

## 8. DELETE /api/pets/{pet_id}/records/{record_id}（R5）

### 8.1 挙動
- `records.is_deleted = 1`
- 子要素は残してOK（取得不能になるため実害なし）

### 8.2 Response（204）
- Bodyなし

### 8.3 Status Codes
- 204: No Content
- 404: Not Found
