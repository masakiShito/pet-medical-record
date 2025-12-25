# API詳細：pets

## 1. 概要
ペットの登録・編集・一覧・詳細取得を行う。

- Base URL: `/api`
- 論理削除: `is_deleted = 1`
- MVPは認証なし（将来 `user_id` でスコープ制限）

---

## 2. エンドポイント一覧
| No | Method | Path | 概要 | 画面 |
|---:|---|---|---|---|
| P1 | GET | `/pets` | ペット一覧取得 | S01/S02 |
| P2 | POST | `/pets` | ペット新規作成 | S03 |
| P3 | GET | `/pets/{pet_id}` | ペット詳細取得 | S04 |
| P4 | PUT | `/pets/{pet_id}` | ペット更新 | S03 |
| P5 | DELETE | `/pets/{pet_id}` | ペット論理削除 | （任意） |

---

## 3. 共通データ型

### 3.1 Pet（Response）
```json
{
  "id": 1,
  "name": "momo",
  "species": "dog",
  "breed": "shiba",
  "sex": "female",
  "birthday": "2023-04-01",
  "notes": "memo...",
  "created_at": "2025-12-24T10:00:00",
  "updated_at": "2025-12-24T10:00:00"
}
```

### 3.2 バリデーション
- name: 必須、1〜50文字
- species: `dog|cat|other`（必須）
- breed: 0〜50文字
- sex: `male|female|unknown`
- birthday: `YYYY-MM-DD`（未来日不可推奨）
- notes: 任意（上限は実装で制限してもよい）

---

## 4. GET /api/pets（P1）

### 4.1 Request
- Query（任意）
  - `include_deleted`（bool, default=false）※MVPは未使用でOK

### 4.2 Response（200）
```json
{
  "items": [
    {
      "id": 1,
      "name": "momo",
      "species": "dog",
      "breed": null,
      "sex": "female",
      "birthday": null,
      "notes": null,
      "created_at": "2025-12-24T10:00:00",
      "updated_at": "2025-12-24T10:00:00"
    }
  ]
}
```

### 4.3 Status Codes
- 200: OK

---

## 5. POST /api/pets（P2）

### 5.1 Request Body
```json
{
  "name": "momo",
  "species": "dog",
  "breed": "shiba",
  "sex": "female",
  "birthday": "2023-04-01",
  "notes": "memo..."
}
```

### 5.2 Response（201）
```json
{
  "id": 1
}
```

### 5.3 Status Codes
- 201: Created
- 400: Validation Error

---

## 6. GET /api/pets/{pet_id}（P3）

### 6.1 Response（200）
```json
{
  "id": 1,
  "name": "momo",
  "species": "dog",
  "breed": "shiba",
  "sex": "female",
  "birthday": "2023-04-01",
  "notes": "memo...",
  "created_at": "2025-12-24T10:00:00",
  "updated_at": "2025-12-24T10:00:00"
}
```

### 6.2 Status Codes
- 200: OK
- 404: Not Found（存在しない/論理削除済み）

---

## 7. PUT /api/pets/{pet_id}（P4）

### 7.1 Request Body（全更新）
```json
{
  "name": "momo",
  "species": "dog",
  "breed": "shiba",
  "sex": "female",
  "birthday": "2023-04-01",
  "notes": "memo..."
}
```

### 7.2 Response（200）
```json
{ "id": 1 }
```

### 7.3 Status Codes
- 200: OK
- 400: Validation Error
- 404: Not Found

---

## 8. DELETE /api/pets/{pet_id}（P5）

### 8.1 挙動
- `pets.is_deleted = 1` に更新
- 既存の records は保持（参照不可にするかはMVPでは「ペットが消えたらUIから見えない」でOK）

### 8.2 Response（204）
- Bodyなし

### 8.3 Status Codes
- 204: No Content
- 404: Not Found
