# MindMate

MindMate is a full-stack mental wellness chat app with a calm web interface, Express API, optional MongoDB authentication, and supportive wellbeing responses.

This project is for general wellbeing support only. It does not diagnose, treat, or replace professional mental health care. If someone may hurt themselves or someone else, they should contact emergency services or a crisis line immediately.

## Features

- Responsive chat interface with light and dark themes
- Mood check-in and quick-start wellbeing prompts
- Local user registration for name and email
- Wellness alert emails with precaution recommendations based on mood and latest message
- Express API with `/api/chat`, `/api/chat/private`, and `/api/health`
- Crisis-aware response path with immediate support guidance
- Built-in local support replies when `OPENAI_API_KEY` is not configured
- Optional JWT auth backed by MongoDB
- Docker Compose setup for backend, MongoDB, and the optional ML service

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, OpenAI SDK
- Database: MongoDB and Mongoose
- Optional ML service: Flask
- Tooling: Docker Compose

## Project Structure

```text
ai-mental-health-assistant/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── ml/
│   ├── api/
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## Local Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create a backend environment file:

```bash
cp .env.example .env
```

3. Add values to `backend/.env`.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mhcdb
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
RESEND_API_KEY=your-resend-api-key
ALERT_FROM_EMAIL=MindMate <alerts@yourdomain.com>
```

`OPENAI_API_KEY` is optional. Without it, MindMate uses built-in local wellbeing replies.

`RESEND_API_KEY` and `ALERT_FROM_EMAIL` are optional for local testing. Without them, MindMate prepares the alert email and opens the user's email app through a mail link. With them, the backend sends the alert automatically.

4. Start the backend:

```bash
npm start
```

5. Open the app:

```text
http://localhost:5000
```

## Docker

From the repository root:

```bash
docker compose up --build
```

The app will be available at `http://localhost:5000`.

## Production Deployment

For a public release, create your own OpenAI API key from your OpenAI account and add it as a secret environment variable in your hosting provider.

Required production environment variables:

```env
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-long-random-secret
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
RESEND_API_KEY=your-resend-api-key
ALERT_FROM_EMAIL=MindMate <alerts@yourdomain.com>
```

Do not paste real API keys into source files, commits, screenshots, or the README. Keep them only in `.env` locally and in deployment secrets on platforms like Render, Railway, Vercel, Netlify, or Docker hosting.

## API

### Health

```http
GET /api/health
```

### Public Chat

```http
POST /api/chat
Content-Type: application/json

{
  "message": "I feel overwhelmed today"
}
```

### Wellness Alert

```http
POST /api/alerts
Content-Type: application/json

{
  "name": "Anchal",
  "email": "anchal@example.com",
  "message": "I feel anxious today",
  "mood": 2
}
```

### Authenticated Chat

```http
POST /api/chat/private
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Help me make a grounding plan"
}
```

## Security Notes

- Never commit `.env` files or real API keys.
- Replace `JWT_SECRET` with a long random value before deployment.
- Configure CORS more narrowly before production deployment.

## Author

Anchal Kumari
