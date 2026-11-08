# HeartGuard AI — Frontend

The frontend is the user-facing interface of HeartGuard AI.

## Technology Stack

- React 19
- Vite
- React Router
- Tailwind CSS 4
- Lucide React

## Setup

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Environment Variables

Create a `.env` file in this directory if frontend environment variables are required.

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Never store private API keys or secrets in frontend environment variables.

## Development Guidelines

- Keep reusable UI components inside the components directory.
- Keep page-level components inside the Pages directory.
- Keep API communication separate from UI components as the application grows.
- Use meaningful component and variable names.
