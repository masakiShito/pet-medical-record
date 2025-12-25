# medications（投薬）API詳細（v2）

## 1. データ構造（例）
### Medication
```json
{
  "id": 30,
  "pet_id": 1,
  "name": "整腸剤",
  "dosage": "1/2錠",
  "frequency": "1日2回",
  "start_on": "2025-12-20",
  "end_on": null,
  "note": "7日分",
  "created_at": "2025-12-25T01:00:00Z",
  "updated_at": "2025-12-25T01:00:00Z"
}
```

- `end_on` が `null` の場合は継続中扱い（MVP）
- `end_on` が今日より前の場合は終了扱い（一覧のpastへ）

---

## 2. エンドポイント

### GET `/api/pets/{pet_id}/medications`
- 用途: 投薬一覧（S12）
- Query（任意）: `status=active|past|all`（未指定はall）

**200 Response**
```json
{ "items": [ /* Medication */ ] }
```

---

### GET `/api/pets/{pet_id}/medications/active`
- 用途: 継続中の投薬取得（S01/S04のサマリ用途、任意）

**200 Response**
```json
{ "items": [ /* Medication */ ] }
```

---

### POST `/api/pets/{pet_id}/medications`
- 用途: 投薬作成（S13）

**Request**
```json
{
  "name": "整腸剤",
  "dosage": "1/2錠",
  "frequency": "1日2回",
  "start_on": "2025-12-20",
  "end_on": null,
  "note": "7日分"
}
```

**201 Response**
```json
{ "item": { /* Medication */ } }
```

---

### GET `/api/pets/{pet_id}/medications/{med_id}`
- 用途: 編集初期表示

**200 Response**
```json
{ "item": { /* Medication */ } }
```

---

### PUT `/api/pets/{pet_id}/medications/{med_id}`
- 用途: 投薬更新

**200 Response**
```json
{ "item": { /* Medication */ } }
```

---

### DELETE `/api/pets/{pet_id}/medications/{med_id}`
- 用途: 投薬削除（論理削除推奨）

**204 Response**: bodyなし

---

## 3. 共通エラー
**404**
```json
{ "detail": "Medication not found", "code": "NOT_FOUND" }
```

**422**（必須）
```json
{
  "detail": "Validation error",
  "code": "VALIDATION_ERROR",
  "fields": { "name": "required" }
}
```
