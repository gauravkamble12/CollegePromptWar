@echo off
echo Starting City Life: Full-Stack Smart City Explorer...
start cmd /k "call .\venv\Scripts\activate && python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3
start cmd /k "cd frontend && npm run dev"
echo Both Backend (http://127.0.0.1:8000) and Frontend (http://localhost:3000) have been started!
pause
