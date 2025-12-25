# vet-visits（通院）API詳細（v2）

## 1. データ構造（例）
### VetVisit
```json
{
  "id": 10,
  "pet_id": 1,
  "visited_on": "2025-12-20",
  "hospital_name": "◯◯動物病院",
  "doctor_name": "山田",
  "chief_complaint": "嘔吐",
  "diagnosis": "胃腸炎",
  "cost_yen": 4500,
  "note": "整腸剤処方",
  "created_at": "2025-12-25T01:00:00Z",
  "updated_at": "2025-12-25T01:00:00Z"
}
```
※ `visited_on` は推奨。未導入の場合は `records.recorded_on` を受診日扱いにする運用も可能。

---

## 2. エンドポイント

### GET `/api/pets/{pet_id}/vet-visits`
- 用途: 通院一覧（S07）
- Query（任意）: `q`（キーワード）, `from`（開始日）, `to`（終了日）, `limit`, `offset`

**200 Response**
```json
{
  "items": [ /* VetVisit */ ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### POST `/api/pets/{pet_id}/vet-visits`
- 用途: 通院作成（S08）

**Request**
```json
{
  "visited_on": "2025-12-20",
  "hospital_name": "◯◯動物病院",
  "doctor_name": "山田",
  "chief_complaint": "嘔吐",
  "diagnosis": "胃腸炎",
  "cost_yen": 4500,
  "note": "整腸剤処方"
}
```

**201 Response**
```json
{ "item": { /* VetVisit */ } }
```

---

### GET `/api/pets/{pet_id}/vet-visits/{visit_id}`
- 用途: 通院詳細（S09）

**200 Response**
```json
{ "item": { /* VetVisit */ } }
```

---

### PUT `/api/pets/{pet_id}/vet-visits/{visit_id}`
- 用途: 通院更新（S08）

**Request**: POSTと同等

**200 Response**
```json
{ "item": { /* VetVisit */ } }
```

---

### DELETE `/api/pets/{pet_id}/vet-visits/{visit_id}`
- 用途: 通院削除（論理削除推奨）

**204 Response**: bodyなし

---

## 3. 共通エラー
**404**
```json
{ "detail": "Vet visit not found", "code": "NOT_FOUND" }
```

**422**
```json
{
  "detail": "Validation error",
  "code": "VALIDATION_ERROR",
  "fields": { "visited_on": "invalid_date" }
}
```
