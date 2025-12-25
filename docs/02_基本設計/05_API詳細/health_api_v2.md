# health API詳細（v2）

## エンドポイント
### GET `/api/health`
- 用途: API稼働確認

**200 Response**
```json
{
  "status": "ok"
}
```

---

### GET `/api/db/health`
- 用途: DB疎通確認（SELECT 1 等）

**200 Response**
```json
{
  "status": "ok",
  "db": "ok"
}
```

**503 Response**
```json
{
  "detail": "DB connection failed",
  "code": "DB_UNAVAILABLE"
}
```
