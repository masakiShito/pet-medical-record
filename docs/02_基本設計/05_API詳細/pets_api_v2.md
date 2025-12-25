# pets API詳細（v2）

## 1. データ構造（例）
### Pet
```json
{
  "id": 1,
  "name": "Momo",
  "species": "cat",
  "sex": "female",
  "birth_date": "2022-04-01",
  "photo_url": null,
  "created_at": "2025-12-25T01:00:00Z",
  "updated_at": "2025-12-25T01:00:00Z"
}
```

### PetSummary
```json
{
  "pet_id": 1,
  "vet_visit_last": {
    "visit_id": 10,
    "visited_on": "2025-12-20",
    "hospital_name": "◯◯動物病院",
    "diagnosis": "胃腸炎",
    "cost_yen": 4500
  },
  "weight_last": {
    "weight_id": 20,
    "measured_on": "2025-12-24",
    "weight_kg": 4.25
  },
  "medication_active": {
    "count": 1,
    "items": [
      { "med_id": 30, "name": "整腸剤", "start_on": "2025-12-20", "end_on": null }
    ]
  }
}
```

---

## 2. エンドポイント

### GET `/api/pets`
- 用途: ペット一覧（S01/S02）

**200 Response**
```json
{ "items": [ /* Pet */ ] }
```

---

### POST `/api/pets`
- 用途: ペット作成（S03）

**Request**
```json
{
  "name": "Momo",
  "species": "cat",
  "sex": "female",
  "birth_date": "2022-04-01",
  "photo_url": null
}
```

**201 Response**
```json
{ "item": { /* Pet */ } }
```

---

### GET `/api/pets/{pet_id}`
- 用途: ペット取得（S04）

**200 Response**
```json
{ "item": { /* Pet */ } }
```

---

### PUT `/api/pets/{pet_id}`
- 用途: ペット更新（S03）

**Request**: POSTと同等（部分更新にするならPATCHに変更可）

**200 Response**
```json
{ "item": { /* Pet */ } }
```

---

### DELETE `/api/pets/{pet_id}`
- 用途: ペット削除（論理削除推奨）

**204 Response**: bodyなし

---

### GET `/api/pets/{pet_id}/summary`
- 用途: ペットサマリ（S01/S04）

**200 Response**
```json
{ "item": { /* PetSummary */ } }
```

---

## 3. 共通エラー
**404**
```json
{ "detail": "Pet not found", "code": "NOT_FOUND" }
```

**422**（バリデーション）
```json
{
  "detail": "Validation error",
  "code": "VALIDATION_ERROR",
  "fields": { "name": "required" }
}
```
