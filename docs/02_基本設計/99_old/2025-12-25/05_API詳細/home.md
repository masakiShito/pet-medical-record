# API詳細：home

## 1. 概要
ホーム（S01）用のサマリ取得API。  
「今日の記録があるか」「直近の記録日」など、UIに必要な最小情報を返す。

- Base URL: `/api`
- MVPは認証なし（将来userスコープ）

---

## 2. エンドポイント一覧
| No | Method | Path | 概要 | 画面 |
|---:|---|---|---|---|
| S1 | GET | `/home/summary` | ペット別サマリ取得 | S01 |

---

## 3. GET /api/home/summary（S1）

### 3.1 Request（Query）
- `date`（任意）: `YYYY-MM-DD`（未指定なら当日）
  - その日付に対して「記録済みか」を返すため

#### 例
- `/api/home/summary?date=2025-12-24`

### 3.2 Response（200）
```json
{
  "date": "2025-12-24",
  "items": [
    {
      "pet": {
        "id": 1,
        "name": "momo",
        "species": "dog"
      },
      "today_record": {
        "exists": true,
        "record_id": 10
      },
      "latest_record": {
        "record_id": 10,
        "recorded_on": "2025-12-24",
        "title": "下痢っぽい",
        "updated_at": "2025-12-24T10:00:00"
      }
    }
  ]
}
```

### 3.3 Status Codes
- 200: OK

### 3.4 備考
- S01はこのAPIだけで「一覧 + 今日の記録導線 + 直近導線」を実装できる
- 実装を簡素にしたい場合は、本APIは省略して `GET /pets` + `GET /pets/{pet_id}/records?limit=1` でも代替可能（ただしリクエスト増）
