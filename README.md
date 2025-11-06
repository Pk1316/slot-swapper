# slot-swapper

Lightweight service for managing and swapping scheduled "slots" (time/assignment slots). This README explains tech stack, installation, running, API endpoints and the project workflow.

## Tech stack / requirements
- Node.js 18+ or 20+
- npm or yarn
- PostgreSQL 12+ (or any SQL DB supported by Prisma/TypeORM)
- Redis (optional, for caching / rate-limiting)
- Docker & Docker Compose (optional)
- JWT for auth
- Recommended dev tools: eslint, prettier, ts-node (if TypeScript)

## Getting started (install & run)

1. Clone
```
git clone <repo-url> /d:/slot-swapper
cd /d:/slot-swapper
```

2. Install
```
# npm
npm install

# or yarn
yarn
```

3. Environment
Create `.env` based on `.env.example`:
```
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/slot_swapper
JWT_SECRET=your_super_secret
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

4. Database
```
# run migrations / generate client (example for Prisma)
npx prisma migrate dev
npx prisma generate
```

5. Run (development)
```
npm run dev
```

6. Run (production)
```
npm run build
npm start
```

7. With Docker
```
docker-compose up --build
```

## Tests
```
npm test
# or
yarn test
```

## API Overview
Base URL: `http://localhost:3000/api/v1`  
Auth: Bearer JWT on protected endpoints.

Common response format:
```
{
    "status": "success" | "error",
    "data": { ... } | null,
    "message": "optional message"
}
```

### Endpoints

1. Health
- GET /api/v1/health
- Description: Basic health check.
- Auth: none
- Response 200:
```
{ "status": "success", "data": { "uptime": 123.4 } }
```

2. Authentication
- POST /api/v1/auth/login
- Description: Login with credentials, returns JWT.
- Body:
```
{ "email": "user@example.com", "password": "secret" }
```
- Response 200:
```
{ "status":"success", "data": { "token": "jwt.token.here", "user": { "id": "u1", "email": "..." } } }
```

- POST /api/v1/auth/register
- Description: Create account.
- Body:
```
{ "name":"User","email":"u@example.com","password":"secret" }
```

3. Slots CRUD
- GET /api/v1/slots
    - Description: List slots (supports paging & filters: date, status, owner).
    - Query: `?page=1&limit=20&date=2025-11-06`
    - Auth: optional (public read) or required depending on config.
- GET /api/v1/slots/:id
    - Description: Get slot details.
    - Auth: optional/required.
- POST /api/v1/slots
    - Description: Create a slot (owner creates available slot).
    - Auth: required
    - Body:
    ```
    {
        "title": "Morning Shift",
        "start": "2025-11-07T09:00:00Z",
        "end": "2025-11-07T12:00:00Z",
        "location": "Room A",
        "metadata": { ... }
    }
    ```
- PUT /api/v1/slots/:id
    - Description: Update slot (owner or admin).
    - Auth: required
- DELETE /api/v1/slots/:id
    - Description: Remove slot (owner or admin).
    - Auth: required

4. Swap requests
- POST /api/v1/swaps
    - Description: Request a swap between two slots or request to take a slot.
    - Auth: required
    - Body examples:
        - Swap two owned slots:
        ```
        { "fromSlotId":"s1", "toSlotId":"s2", "reason":"conflict" }
        ```
        - Request to take slot:
        ```
        { "targetSlotId":"s3", "message":"Can I take this?" }
        ```
    - Response: returns swap request object with status `pending`.
- GET /api/v1/swaps
    - Description: List swap requests (filters: status=pending|approved|rejected).
    - Auth: required (owner sees relevant).
- GET /api/v1/swaps/:id
    - Description: Details of a swap request.
    - Auth: required
- POST /api/v1/swaps/:id/approve
    - Description: Approve a pending swap (owner/admin/action taker).
    - Auth: required
- POST /api/v1/swaps/:id/reject
    - Description: Reject a pending swap.
    - Auth: required

5. Users
- GET /api/v1/users/:id
    - Description: Get public profile and slots.
- GET /api/v1/users/:id/slots
    - Description: List slots owned by user.

6. Audit / History
- GET /api/v1/history
    - Description: Paging list of events (swap created, approved, slot changed).
    - Auth: admin or owner-based filtering.

### Error responses
- 400 Bad Request — validation errors
- 401 Unauthorized — missing/invalid token
- 403 Forbidden — insufficient permissions
- 404 Not Found — resource missing
- 409 Conflict — e.g., overlapping slots, double-booking
- 500 Internal Server Error

### Example cURL
Login:
```
curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"u@example.com","password":"secret"}'
```
Create slot:
```
curl -X POST http://localhost:3000/api/v1/slots \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"title":"Shift","start":"2025-11-07T09:00:00Z","end":"2025-11-07T12:00:00Z"}'
```
Request swap:
```
curl -X POST http://localhost:3000/api/v1/swaps \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"targetSlotId":"s3","message":"Can I take this?"}'
```

## Data model
- User: id, name, email, role
- Slot: id, title, ownerId, start, end, location, status
- SwapRequest: id, requesterId, fromSlotId?, targetSlotId, status (pending|approved|rejected), createdAt
- AuditEvent: id, type, actorId, payload, createdAt



