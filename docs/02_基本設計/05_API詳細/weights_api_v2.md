# weights（体重）API詳細（v2）

## 1. データ構造（例）
### Weight
```json
{
  "id": 20,
  "pet_id": 1,
  "measured_on": "2025-12-24",
  "weight_kg": 4.25,
  "note": "夜ごはん後",
  "created_at": "2025-12-25T01:00:00Z",
  "updated_at": "2025-12-25T01:00:00Z"
}
```

---

## 2. エンドポイント

### GET `/api/pets/{pet_id}/weights`
- 用途: 体重一覧（S10）
- Query（任意）: `from`, `to`, `limit`, `offset`

**200 Response**
```json
{
  "items": [ /* Weight */ ],
  "total": 1,
  "limit": 200,
  "offset": 0
}
```

---

### POST `/api/pets/{pet_id}/weights`
- 用途: 体重作成（S11）

**Request**
```json
{
  "measured_on": "2025-12-24",
  "weight_kg": 4.25,
  "note": "夜ごはん後"
}
```

**201 Response**
```json
{ "item": { /* Weight */ } }
```

---

### GET `/api/pets/{pet_id}/weights/{weight_id}`
- 用途: 編集初期表示

**200 Response**
```json
{ "item": { /* Weight */ } }
```

---

### PUT `/api/pets/{pet_id}/weights/{weight_id}`
- 用途: 体重更新

**Request**: POSTと同等

**200 Response**
```json
{ "item": { /* Weight */ } }
```

---

### DELETE `/api/pets/{pet_id}/weights/{weight_id}`
- 用途: 体重削除（論理削除推奨）

**204 Response**: bodyなし

---

## 3. 共通エラー
**404**
```json
{ "detail": "Weight not found", "code": "NOT_FOUND" }
```
