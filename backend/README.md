# ResponSync Backend Architecture

Production-grade, scalable backend foundation for **ResponSync** — an AI-powered emergency response and disaster management system.

---

## 🛠 Tech Stack

- **Language**: Python 3.12+
- **Framework**: FastAPI
- **Database**: PostgreSQL (Supabase) with PostGIS spatial support
- **ORM**: SQLAlchemy 2.0 (Async) + GeoAlchemy2
- **Validation**: Pydantic v2 & `pydantic-settings`
- **Migrations**: Alembic
- **HTTP Client**: `httpx`
- **AI Integration**: Google GenAI SDK (Gemini)

---

## 📁 Project Structure

```
backend/
├── .env.example          # Environment variables template
├── .gitignore            # Git exclusion rules
├── README.md             # Project documentation
├── requirements.txt      # Python dependencies
├── alembic.ini           # Alembic migration configuration
├── alembic/              # Migration scripts & version history
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── app/
│   ├── main.py           # FastAPI application entry point
│   ├── api/              # API routing & endpoint definitions
│   │   ├── router.py
│   │   └── endpoints/
│   │       └── health.py
│   ├── core/             # Configuration, logging, exception handlers
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   ├── db/               # Database engine, session & base models
│   │   ├── base.py
│   │   ├── database.py
│   │   └── session.py
│   ├── models/           # SQLAlchemy models (tables)
│   ├── schemas/          # Pydantic schemas (request/response)
│   ├── services/         # Business logic services
│   ├── agents/           # AI agents (Gemini / LangGraph)
│   ├── utils/            # Helper functions
│   └── middleware/       # Custom ASGI middlewares (CORS, Logging)
└── tests/                # Automated pytest suite
    ├── conftest.py
    └── test_health.py
```

---

## 🚀 Setup & Installation

### 1. Prerequisites

- Python 3.12 or higher
- PostgreSQL instance with `postgis` extension enabled (or Supabase project)

### 2. Virtual Environment Setup

Navigate to the `backend/` directory:

```bash
cd backend
```

Create a virtual environment:

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and fill in your actual credentials:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL async connection string (`postgresql+asyncpg://...`) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_KEY` | Supabase Anon Key |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `OPENWEATHER_API_KEY` | OpenWeather API Key |
| `MAPBOX_API_KEY` | Mapbox GL API Key |
| `JWT_SECRET` | Secret key for JWT signing |

---

## 🏃 Running the Server

Start the local development server with auto-reload:

```bash
uvicorn app.main:app --reload --port 8000
```

Access:
- **Health Check Endpoint**: `http://127.0.0.1:8000/health`
- **Interactive OpenAPI (Swagger UI)**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 🧪 Running Tests

Execute the automated test suite using `pytest`:

```bash
pytest
```

---

## 🗄 Database Migrations (Alembic)

Generate a new migration after adding SQLAlchemy models:

```bash
alembic revision --autogenerate -m "Add new table"
```

Apply pending migrations:

```bash
alembic upgrade head
```
