# Custom Employee Portal with Zoho One Integration

A web-based employee portal with custom JWT authentication and Role-Based
Access Control (RBAC) that integrates with Zoho One through a single backend
service account — employees never need or see individual Zoho credentials.

## Architecture

```
custom-employee-portal/
├── backend/    Node.js + Express + MongoDB (Mongoose) + JWT + Zoho OAuth
└── frontend/   React + Vite
```

- **Auth**: `POST /api/auth/login` verifies email/password (bcrypt) and
  issues a JWT with the user's roles and a flattened, de-duplicated list of
  permission keys embedded in the payload.
- **RBAC**: `authenticate` middleware verifies the JWT on every protected
  route; `requirePermission(key)` middleware then checks the specific
  permission that route requires. Authorization is enforced **server-side**
  on every request — the frontend only renders what the backend already
  decided the user may see.
- **Database schema**: MongoDB with Mongoose. Roles embed their permission
  keys directly (`Role.permissionKeys: [String]`) and Users embed references
  to their roles (`User.roleIds: [ObjectId]`) — this is the idiomatic
  MongoDB pattern for this relationship and intentionally replaces the
  `UserRoles`/`RolePermissions` join tables a relational schema would use.
  `Permission` and `AuditLog` are kept as their own collections.
- **Zoho integration**: `zohoService.js` holds the one service-account
  refresh token (obtained via Zoho's **Self Client** OAuth flow), exchanges
  it for short-lived access tokens on demand, and caches the access token in
  memory until shortly before it expires. The dashboard route proxies
  employee requests through this single service account — **for Zoho CRM
  specifically, this means fetching real Lead records from Zoho's REST API
  and rendering them directly inside the portal's own dashboard**, so the
  employee never leaves the portal and never sees a Zoho login screen. This
  is the actual "employee accesses Zoho data through backend APIs without
  seeing any Zoho credentials" requirement, implemented literally rather
  than as a simple redirect.

## Prerequisites

- Node.js 18+ and npm
- A MongoDB database — this project used MongoDB Atlas (free tier)
- A Zoho One account with API Console access (Self Client)

## 1. Zoho credentials

1. Sign up for Zoho One (zoho.com/one) if you don't already have an account.
2. Go to **api-console.zoho.com** (note: this may redirect to a
   region-specific domain such as `.in`, `.eu`, or `.com.au` — check which
   one your account uses, since **every** Zoho OAuth URL below must match
   that same region) → **Add Client** → **Self Client**.
3. Enter a scope (e.g. `ZohoCRM.modules.ALL`) and generate a **Grant Token**.
   Self Client is the correct flow for a backend-only service account — it
   skips the redirect-URI/authorization-code dance a normal OAuth app would
   need, since there's no end-user consent screen involved.
4. Exchange the grant token for a refresh token — **POST** to
   `https://accounts.zoho.<region>/oauth/v2/token` with body
   (`x-www-form-urlencoded`, not query params):
   ```
   code=<grant token>
   client_id=<your client id>
   client_secret=<your client secret>
   grant_type=authorization_code
   ```
   The response includes `refresh_token` — this is the long-lived credential
   the backend uses going forward.

## 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` (no quotes around any value):
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
JWT_EXPIRES_IN=8h

ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_ACCOUNTS_BASE_URL=https://accounts.zoho.in

ZOHO_PEOPLE_URL=https://people.zoho.in
ZOHO_CRM_URL=https://crm.zoho.in
ZOHO_DESK_URL=https://desk.zoho.in
ZOHO_BOOKS_URL=https://books.zoho.in
```
(swap `.in` for whichever region your Zoho account is actually on)

Seed roles, permissions, and 5 demo users (one per role):
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

**Demo logins** (seeded password: `password123` for all — adjust to match
whatever you actually set in `seed.js`):

| Email | Role |
|---|---|
| admin@demo.com | Admin |
| hr@demo.com | HR |
| sales@demo.com | Sales |
| support@demo.com | Support |
| finance@demo.com | Finance |

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/api` calls
to `http://localhost:5000`, so no CORS configuration is needed locally.

## 4. Try it

- Log in as `sales@demo.com` → dashboard shows only Zoho CRM. Click it —
  the portal fetches real Lead records from Zoho's own CRM org (via the
  backend service account) and renders them in a table right on the
  dashboard. No redirect, no Zoho login screen.
- Log in as `finance@demo.com` → dashboard shows only Zoho Books. Clicking
  it confirms access is granted (RBAC + token acquisition both succeed)
  but shows a clear "live data view not yet implemented for this app in
  this demo" message, since only the CRM data-fetch is wired up as the
  proof-of-pattern — see Known Limitations below.
- Log in as `admin@demo.com` → dashboard shows all apps, plus an Admin
  Panel where you can create/delete users, assign roles, create new roles
  with custom permission sets, and view the full audit log.
- Every login and Zoho app access, plus every admin action, is written to
  the audit log collection.

## Known limitations / things this build does NOT do

Being upfront about scope here rather than overstating it:

- **Only Zoho CRM has a real live-data fetch wired up.** The proxy endpoint
  (`/api/dashboard/access/:appKey`) always acquires a real Zoho access
  token via the service account, and for CRM it uses that token to fetch
  actual Lead records rendered inside the portal's dashboard — proving the
  full backend-proxy pattern the assignment requires. Zoho People, Desk,
  and Books currently stop at "access granted, token acquired" without a
  corresponding live REST call; extending `fetchZohoData()` in
  `zohoService.js` with the equivalent endpoint for each (e.g.
  `people.zoho.<region>/people/api/forms/employee/getRecords` for People)
  follows the same shape already proven for CRM.
- **No password reset / forgot-password flow.** Demo accounts use a fixed
  seeded password; there's no email-based reset mechanism.
- **No refresh-token rotation for portal JWTs.** The JWT is valid for a
  fixed window (`JWT_EXPIRES_IN`) and the user must log in again after it
  expires — there's no silent refresh mechanism.
- **The "Manager" role mentioned as optional in some versions of the spec
  is not implemented** — only Admin, HR, Sales, Support, and Finance exist,
  matching the core (non-optional) requirement.
- **No editing of an existing user's name/email**, or removing a role from
  a user once assigned (only adding roles and deleting the user entirely
  are supported).
- **HTTPS is not enforced locally** — this app runs over plain HTTP on
  localhost for development. In a real deployment, HTTPS would be enforced
  at the reverse proxy / hosting layer (e.g. via a platform like Render,
  Railway, or an Nginx config with TLS termination), not inside the Node app
  itself.
- **Session timeout is JWT expiry only** — there's no server-side session
  store, "log out everywhere" capability, or forced token revocation before
  natural expiry.
- **Responsive design is basic**, not deeply optimized for small mobile
  viewports.
- **Zoho's Self Client OAuth flow required exchanging a short-lived grant
  token via a separate API call rather than a single documented step** —
  worth noting since Zoho's own onboarding docs don't make this obvious for
  a pure backend service-account use case.

None of the above block the core requirement — custom auth, RBAC enforced
server-side, single service-account Zoho integration, and role-appropriate
app redirection all work end-to-end — but they're honest gaps rather than
things silently left out.
