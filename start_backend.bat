@echo off
echo Starting City Life Backend (FastAPI + Uvicorn)...
call .\venv\Scripts\activate
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
pause
