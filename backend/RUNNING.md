# Running the project (development)

Backend (Django):

- Python: use the provided Python 3.10 venv at `.venv310` (created during setup).
- Install dependencies (if needed):

```powershell
c:/Users/yasha/management/AI_PROJECT/Diracai_Backend_Employee_Management_mine/.venv310/Scripts/python.exe -m pip install -r Diracai_Backend_Employee_Management_mine/requirements.txt
```

- Apply migrations and run server:

```powershell
c:/Users/yasha/management/AI_PROJECT/Diracai_Backend_Employee_Management_mine/.venv310/Scripts/python.exe c:/Users/yasha/management/AI_PROJECT/Diracai_Backend_Employee_Management_mine/manage.py migrate
c:/Users/yasha/management/AI_PROJECT/Diracai_Backend_Employee_Management_mine/.venv310/Scripts/python.exe c:/Users/yasha/management/AI_PROJECT/Diracai_Backend_Employee_Management_mine/manage.py runserver 0.0.0.0:8000
```

Notes:
- The repository's default `.venv` may point to Python 3.13 which can be incompatible with some dependencies; use the included `.venv310` created for compatibility.

Frontend (Next.js):

- Install and run (port 3000):

```powershell
cd Diracai_Frontend_Employee_Management_mine
npm install
npm run dev
```

Access:
- Backend: http://0.0.0.0:8000/ (dev server)
- Frontend: http://localhost:3001/

Stopping:
- Stop dev servers with `CTRL-C` (or `CTRL-BREAK` on Windows for the Python server).
