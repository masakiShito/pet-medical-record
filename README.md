# Pet Medical Record App

React + FastAPI + MySQL の開発環境を Docker Compose で構築するサンプルです。Apple Silicon (arm64) を想定しています。

## 前提

- Docker Desktop
- Docker Compose v2

## 構成

```
.
├── docker-compose.yml
├── .env.example
├── Makefile
├── frontend/
└── backend/
```

## 起動手順

### 初回

1. `.env.example` をコピーして `.env` を作成します。
   ```bash
   cp .env.example .env
   ```
2. Docker Compose を起動します。
   ```bash
   docker compose up -d --build
   ```
   Makefile を使う場合:
   ```bash
   make up
   ```

### 2回目以降

```bash
docker compose up -d
```
または
```bash
make up
```

## URL一覧

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Backend Docs (Swagger): http://localhost:8000/docs

## DB接続情報

`.env` で管理します。

- host: `localhost`
- port: `3306`
- user: `.env` の `MYSQL_USER`
- password: `.env` の `MYSQL_PASSWORD`
- database: `.env` の `MYSQL_DATABASE`

## マイグレーション / 初期化

現時点ではマイグレーションは用意していません。必要に応じて Alembic などを追加してください。

## よくあるトラブル

- **arm64 で MySQL が起動しない**: `docker-compose.yml` の `db` サービスで `platform: linux/arm64` を指定しています。Docker Desktop の設定で Rosetta が無効の場合は `platform` が必要になることがあります。
- **ポート競合**: `3306`, `8000`, `5173` が既に使用されている場合は `docker-compose.yml` の `ports` を変更してください。
- **MySQL 初回起動が遅い**: 初回は DB 初期化で数十秒かかることがあります。`docker compose logs -f db` で起動状況を確認してください。

## 開発メモ

### Frontend

- Vite を利用しています。
- 依存管理: `package.json` (npm)

### Backend

- FastAPI + Uvicorn をホットリロードで起動します。
- 依存管理: `backend/requirements.txt`
- `/health`: API の稼働確認
- `/db/health`: MySQL 接続確認

## よく使うコマンド

```bash
make up
make down
make logs
make reset
```
