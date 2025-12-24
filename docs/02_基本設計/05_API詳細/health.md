# API詳細：health

## 1. 概要
稼働確認およびDB疎通確認用のヘルスチェックAPI。

- Base URL: `/api`
- Content-Type: `application/json`

---

## 2. エンドポイント一覧
| No | Method | Path | 概要 |
|---:|---|---|---|
| H1 | GET | `/health` | API稼働確認 |
| H2 | GET | `/db/health` | DB疎通確認 |

---

## 3. GET /api/health（H1）

### 3.1 Request
- Query: なし  
- Body: なし

### 3.2 Response（200）
```json
{
  "status": "ok"
}
```

### 3.3 Status Codes
- 200: OK

---

## 4. GET /api/db/health（H2）

### 4.1 Request
- Query: なし  
- Body: なし

### 4.2 Response（200）
```json
{
  "status": "ok",
  "db": "connected"
}
```

### 4.3 Response（503）
```json
{
  "detail": "Database connection failed"
}
```

### 4.4 Status Codes
- 200: OK  
- 503: Service Unavailable（DB疎通不可）
