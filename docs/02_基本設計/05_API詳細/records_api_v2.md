# records（1日まとめ）API詳細（v2）

## 1. 位置づけ
- 「履歴（S05）」「記録詳細（S06）」「まとめて記録（S14）」のためのAPI
- 領域別（通院/体重/投薬）を使う場合でも、**横断で振り返る**用途として残す

---

## 2. データ構造（例）
### Record（子要素込み）
```json
{
  "id": 100,
  "pet_id": 1,
  "recorded_on": "2025-12-24",
  "condition": "normal",
  "note": "元気",
  "weights": [
    { "id": 20, "measured_on": "2025-12-24", "weight_kg": 4.25, "note": null }
  ],
  "medications": [
    { "id": 30, "name": "整腸剤", "dosage": "1/2錠", "frequency": "1日2回", "start_on": "2025-12-20", "end_on": null, "note": "7日分" }
  ],
  "vet_visits": [
    { "id": 10, "visited_on": "2025-12-24", "hospital_name": "◯◯動物病院", "diagnosis": "胃腸炎", "cost_yen": 4500, "note": "整腸剤処方" }
  ]
}
```

---

## 3. エンドポイント

### GET `/api/pets/{pet_id}/records`
- 用途: 記録一覧（S05）
- Query（任意）: `from`, `to`, `has=vet_visit|weight|medication`

**200 Response**
```json
{ "items": [ /* Record（サマリでも可） */ ] }
```

---

### POST `/api/pets/{pet_id}/records`
- 用途: 記録作成（S14）

**Request**
```json
{
  "recorded_on": "2025-12-24",
  "condition": "normal",
  "note": "元気",
  "weights": [
    { "measured_on": "2025-12-24", "weight_kg": 4.25, "note": null }
  ],
  "medications": [
    { "name": "整腸剤", "dosage": "1/2錠", "frequency": "1日2回", "start_on": "2025-12-20", "end_on": null, "note": "7日分" }
  ],
  "vet_visits": [
    { "visited_on": "2025-12-24", "hospital_name": "◯◯動物病院", "diagnosis": "胃腸炎", "cost_yen": 4500, "note": "整腸剤処方" }
  ]
}
```

**201 Response**
```json
{ "item": { /* Record */ } }
```

---

### GET `/api/pets/{pet_id}/records/{record_id}`
- 用途: 記録詳細（S06）

**200 Response**
```json
{ "item": { /* Record */ } }
```

---

### PUT `/api/pets/{pet_id}/records/{record_id}`
- 用途: 記録更新（S14）

**200 Response**
```json
{ "item": { /* Record */ } }
```

---

### DELETE `/api/pets/{pet_id}/records/{record_id}`
- 用途: 記録削除（論理削除推奨）

**204 Response**: bodyなし

