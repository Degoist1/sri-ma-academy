# Sri Ma Academy – Fee & Attendance Portal

MERN app. Players register and see their attendance, fees and season reports.
Coaches mark attendance, update fee payments and write season reports.

```
server/   Node + Express + Mongoose API   (port 5000)
client/   React (Vite) + Bootstrap + Axios (port 5173)
```

## Run on Mac

```bash
brew tap mongodb/brew && brew install mongodb-community node
brew services start mongodb-community

cd server
cp .env.example .env        # fill it in, see "Admin login" below
npm install
npm run dev

# new terminal
cd client
cp .env.example .env
npm install
npm run dev                 # open http://localhost:5173
```

## Where to change things

| I want to... | File |
|---|---|
| change academy name / batches / fees | `client/src/config.js` |
| change colours | `client/src/style.css` |
| change the admin password | `ADMIN_PASS_HASH` in `server/.env` (see "Admin login") |
| add a field to a player | `server/models.js` + `client/src/pages/Register.jsx` |
| add an API route | new file in `server/routes/`, then add one line in `server/server.js` |

## Experiment map

| # | Experiment | Where in this project |
|---|---|---|
| 1 | Bootstrap form + JS validation | `pages/Register.jsx` (`validate()`) |
| 2 | ES6 | arrow functions everywhere, anonymous function in `Coach.jsx` (`sort`), arrays (`map/filter/reduce/find`), events (`onClick/onChange/onSubmit`), popups (`alert/confirm/prompt`) |
| 3 | React components, JSX, props, state | `components/*`, `Field` in `Register.jsx` (props), `useState` |
| 4 | SPA, Router, hooks, lifecycle | `App.jsx` (Routes), `useNavigate`, `useEffect` (mount, update, cleanup) in `Player.jsx` / `Coach.jsx` |
| 5 | MongoDB CRUD | commands below |
| 6 | Express + Mongoose | `server/server.js`, `models.js`, `routes/` |
| 7 | Node basics | `server/node-demos/` |
| 8 | REST API + Postman | endpoints below |
| 9 | MERN with Axios | `client/src/api.js` |
| 10 | Deployment | last section |

## Exp 5: MongoDB shell (`mongosh`)

```js
show dbs
use sri_ma_academy
db.createCollection('players')
db.players.insertOne({ name: 'Rahul Patil', phone: '9876543210', age: 14, batch: 'Under-16', monthlyFee: 1000 })
db.players.insertMany([{ name: 'Aman Shah', phone: '9123456780', batch: 'Senior', monthlyFee: 1200 }])
db.players.find()
db.players.find({ batch: 'Under-16' })
db.players.updateOne({ phone: '9876543210' }, { $set: { monthlyFee: 1100 } })
db.players.deleteOne({ phone: '9123456780' })
show collections
```

## Exp 7: REPL

Type `node` in the terminal, try `2 + 3`, `[1,2,3].map(x => x * 2)`, `.help`, `_` (last result), `.exit`.
Then run the scripts in `server/node-demos/` with `node <file>`.

## Exp 8: API endpoints (test in Postman)

Create a collection with variable `baseUrl = http://localhost:5000/api`.
Coach routes need the header `Authorization: Bearer <token>` (get the token from `POST /coaches/login`). Admin routes need the admin token from `POST /admin/login`.

| Method | URL | Who | Expected |
|---|---|---|---|
| POST | `/players` | public | 201 (400 if phone repeats or fields missing) |
| GET | `/players/phone/:phone` | public | 200 / 404 |
| POST | `/coaches/register` | public | 201, body `{ "name": "...", "phone": "9876543210", "password": "min8chars" }` |
| POST | `/coaches/login` | public | 200 + token / 401 wrong / 403 not approved |
| POST | `/admin/login` | public | 200 + token / 401 (429 after 10 wrong tries) |
| GET | `/admin/coaches` | admin | 200 |
| PUT | `/admin/coaches/:id` | admin | 200, body `{ "status": "approved" }` |
| GET | `/admin/logs?role=coach` | admin | 200 |
| GET | `/players` | coach | 200 (401 without token) |
| PUT | `/players/:id` | coach | 200 / 404 |
| DELETE | `/players/:id` | coach | 200 / 404 |
| POST | `/attendance` | coach | 201, body `{ "date": "2026-10-02", "records": [{ "player": "<id>", "present": true }] }` |
| GET | `/attendance?date=2026-10-02` | coach | 200 |
| GET | `/attendance/player/:id` | public | 200 |
| PUT | `/fees` | coach | 200, body `{ "player": "<id>", "month": "2026-10", "amount": 1000, "paid": true, "mode": "upi" }` |
| GET | `/fees?month=2026-10` | coach | 200 |
| GET | `/fees/player/:id` | public | 200 |
| POST | `/reports` | coach | 201, body `{ "player": "<id>", "season": "2026-27 Winter", "matches": 12, "rating": 4, "remarks": "..." }` |
| GET | `/reports/player/:id` | public | 200 |
| DELETE | `/reports/:id` | coach | 200 / 404 |

## Exp 10: Deploy

1. **Database** – create a free cluster on MongoDB Atlas, make a database user, allow network access `0.0.0.0/0`, copy the connection string.
2. **GitHub** – push the whole folder (both `server` and `client`).
3. **Backend on Render** – New > Web Service, root directory `server`, build `npm install`, start `npm start`.
   Environment variables: `MONGO_URI` (Atlas string), `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS_HASH`, `CLIENT_URL` (the Netlify link, no trailing slash).
4. **Frontend on Netlify** (or Vercel) – base directory `client`, build `npm run build`, publish `dist`.
   Environment variable: `VITE_API_URL=https://<your-render-app>.onrender.com/api`
5. Open the Netlify link and test: register, player login, coach login.

Render's free plan sleeps when idle, so the first request after a break can take about a minute.

## Admin login

The admin page is at `/admin` (no link in the menu). It has two tabs: **Coach requests** (approve or reject new coaches) and **Activity log** (every login, failed login and data entry, with time, who and IP; failed attempts are highlighted red).

There is exactly one admin account and no sign-up route. Its details live only in `server/.env`:

```bash
cd server
# 1. make the secret used to sign login tokens, paste it as JWT_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# 2. make the hash of your admin password (10+ characters), paste it as ADMIN_PASS_HASH
node scripts/hash-password.js "your long password"
# 3. choose ADMIN_USER yourself
```

To change the password later, repeat step 2 and update `ADMIN_PASS_HASH` (on Render too).

**Coach flow:** coach registers on the Coach page > status is "pending" > admin approves > coach can log in. Rejecting a coach blocks them immediately, even if they are already logged in.

**What protects it**
- Password stored only as a bcrypt hash, never in code or the database.
- Login tokens (JWT) expire: 2 hours for admin, 8 hours for coaches. They sit in `sessionStorage`, so closing the tab logs out.
- Only 10 wrong login tries per 15 minutes per IP (admin and coach), then the server answers 429.
- A wrong username and a wrong password give the same message and take the same time.
- The server will not start without `JWT_SECRET`, `ADMIN_USER` and `ADMIN_PASS_HASH`.
- `helmet` security headers, CORS limited to `CLIENT_URL`, request size limit, and the hash is never sent to the browser.
- Always use the https links from Render and Netlify, never plain http.

**Honest limits:** this is solid for a college project and a small academy. Players still log in with only their phone number, and one shared admin password means the log cannot say which person used it. A bigger system would add two-factor login.
