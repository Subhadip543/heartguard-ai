# HeartGuard AI

**An AI-powered heart disease risk assessment system.**

HeartGuard AI is a software project designed to explore heart disease risk assessment using machine learning, with a web-based interface and a dedicated backend API.

The project aims to combine data processing, machine learning, backend engineering and frontend development into a modular application.

> **Disclaimer:** HeartGuard AI is an educational and research-oriented project. Its predictions are not medical diagnoses and must not replace professional medical advice.

---

## Project Overview

HeartGuard AI is being developed as a full-stack machine learning application.

### Core Components

| Component | Responsibility | Technology |
|---|---|---|
| Frontend | User interface and interaction | React, Vite, Tailwind CSS |
| Backend | REST API and application logic | Python, FastAPI |
| Machine Learning | Data processing, training and prediction | Python, Scikit-learn |
| Documentation | Technical and project documentation | Markdown |

## System Architecture

```text
              USER
                |
                v
        +---------------+
        |   FRONTEND    |
        | React + Vite  |
        +---------------+
                |
             HTTP API
                |
                v
        +---------------+
        |    BACKEND    |
        |    FastAPI    |
        +---------------+
                |
          ML Inference
                |
                v
        +---------------+
        |  ML PIPELINE  |
        | Scikit-learn  |
        +---------------+
                |
                v
         PREDICTION
```

*The architecture represents the intended system design. Full frontend-backend integration and ML inference are still under development.*

---

## Repository Structure

```text
heartguard-ai/
│
├── .github/                 # GitHub collaboration resources
│
├── frontend/                # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # FastAPI backend
│   ├── app/
│   ├── tests/
│   └── requirements.txt
│
├── ml/                      # Machine learning pipeline
│   ├── data/
│   ├── notebooks/
│   ├── src/
│   ├── models/
│   ├── experiments/
│   └── reports/
│
├── docs/                    # Project documentation
│
├── tests/                   # Integration and E2E tests
│
├── scripts/                 # Development scripts
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.11 or newer
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Subhadip543/heartguard-ai.git

cd heartguard-ai
```

### 2. Frontend Setup

```bash
cd frontend

npm ci

npm run dev
```

Frontend development server:

`http://localhost:5173`

### 3. Backend Setup

Open another terminal from the repository root:

```bash
cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend server:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

Health check:

`http://127.0.0.1:8000/health`

### 4. Machine Learning Setup

```bash
cd ml

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt
```

---

## Development Guidelines

- Keep frontend, backend and ML responsibilities separate.
- Use independent dependency environments.
- Never commit API keys, credentials or private datasets.
- Write modular and reusable code.
- Test changes before merging.
- Document significant architectural decisions.
- Use Git branches and pull requests for collaboration.

## Current Development Status

| Area | Status |
|---|---|
| React frontend | Initial implementation |
| Frontend project structure | Reorganized |
| FastAPI backend | Initial setup |
| Backend health endpoint | Implemented |
| ML pipeline | Structure created |
| Model training | Pending |
| Model evaluation | Pending |
| Frontend-backend integration | Pending |
| Automated testing | Pending |
| Deployment | Pending |

## Team Collaboration

All development takes place through the project's GitHub repository.

Contributors should work on dedicated branches, communicate changes and submit pull requests for review.

Repository: https://github.com/Subhadip543/heartguard-ai

---

## License

License information will be added when the project license is finalized.

---

**HeartGuard AI — Building a smarter approach to heart disease risk assessment.**