Here’s a **detailed `README.md`** for your **NestJS backend** that explains the architecture, the flow of the WebSocket gateway (`SessionGateway`), and the roles of each part of your app — going as deep into the technical details as possible:

---

# 🎮 Game Session Backend (NestJS + WebSocket)

This is the backend service for the Game Session app. It handles real-time interactions between users and game sessions using **NestJS WebSockets** and **Socket.IO**. It also interacts with the database via **TypeORM** and manages authentication using **JWT**.

---

## 🚀 Features

- WebSocket-powered session management
- Secure user authentication with JWT
- Real-time updates on:
  - Session joins
  - Number selections
- Dynamic session state tracking (`playerCount`, `responseCount`)
- Participation tracking via a many-to-one relationship between users and sessions

---

## 🧱 Architecture

```bash
src/
├── auth/
│   └── entities/
│       └── user.entity.ts        # User model
├── participation/
│   └── entities/
│       └── participation.entity.ts # Tracks user choices per session
├── session/
│   ├── session.gateway.ts        # Core WebSocket logic
│   └── entities/
│       └── session.entity.ts     # Game session model
```

---

## 🧠 WebSocket Flow (`SessionGateway`)

### ✅ Initialization

- The gateway initializes using `@WebSocketGateway({ cors: { origin: '*' } })`.
- It logs socket initialization via `afterInit()`.

```ts
@WebSocketGateway({ cors: { origin: '*' } })
```

---

### 🔌 Client Connection

#### `handleConnection(client: Socket)`

- When a client connects, it extracts the `userId` from the URL query params.
- It maps the `client.id` to the `userId` for tracking disconnections and managing state.

```ts
const params = client.handshake.url.split('?');
const userData = new URLSearchParams(params[1]);
this.users[userId] = client.id;
this.clientIds[client.id] = userId;
```

---

### ❌ Client Disconnection

#### `handleDisconnect(client: Socket)`

- Cleans up user and client references when a user disconnects.

```ts
const userId = this.clientIds[client.id];
delete this.users[userId];
delete this.clientIds[client.id];
```

---

### 🎯 Joining a Session

#### `@SubscribeMessage('join-session')`

##### Incoming Payload:

```ts
{
  sessionId: string;
  token: string; // JWT from client localStorage
}
```

##### Flow:

1. **JWT Verification**:

   - The token is verified using the JWT secret.
   - The user is retrieved from the DB using the decoded ID.

2. **Session Lookup**:

   - Finds the session by ID from the database.
   - If not found, the join is ignored.

3. **User Joins Room**:

   - Uses `client.join(sessionId)` to allow room-based messaging.

4. **Participation Creation**:

   - Creates a `Participation` record linking the user and session.

5. **Session State Update**:

   - Updates `playerCount` in the session to reflect the number of participants.

6. **Emit `user-joined` to All Clients**:
   - Sends the session state, user ID, and player count.

##### Emitted Payload:

```ts
{
  clientId, userId, sessionId, playerCount, responseCount, session, token;
}
```

---

### 🔢 Picking a Number

#### `@SubscribeMessage('number-pick')`

##### Incoming Payload:

```ts
{
  sessionId: string;
  userId: string;
  number: number;
}
```

##### Flow:

1. **Validates session and user**:

   - Checks if both session and user exist.

2. **Fetches Participation**:

   - Ensures the user has joined the session.

3. **Updates User’s Choice**:

   - Saves the chosen number in their `Participation` record.

4. **Counts Valid Responses**:

   - Uses `Between(0, 11)` to count all submitted numbers (assumes valid range).

5. **Updates `responseCount` on Session**:

   - Reflects total number of users who submitted a number.

6. **Emits `number-picked` Event**:
   - Sends updated session info and count to all clients.

##### Emitted Payload:

```ts
{
  clientId, number, respondCount, session;
}
```

---

## 🧮 Entity Relationships

### 🧑 User Entity

- Tracks basic user info and stats (e.g., totalWins, totalLosses).

```ts
@OneToMany(() => Participation, (p) => p.user)
participations: Participation[];
```

### 🎲 Session Entity

- Holds session-specific details: start time, player count, response count.

```ts
@OneToMany(() => Participation, (p) => p.session)
participations: Participation[];
```

### 🧾 Participation Entity

- Represents a many-to-one relationship between `User` and `Session`.
- Stores user’s selected number for a session.

```ts
@ManyToOne(() => User)
user: User;

@ManyToOne(() => Session)
session: Session;

@Column({ nullable: true })
chosenNumber: number;
```

---

## 🔐 Authentication Strategy

- JWT is sent from the client during WebSocket connection or session join.
- On the server:
  - `jwt.verify()` decodes and validates the token.
  - `decoded.id` is used to retrieve the user securely.

> Note: For scalability, consider migrating to a proper WebSocket middleware auth layer.

---

## 📡 Socket Events Summary

| Event           | Triggered By | Description                                |
| --------------- | ------------ | ------------------------------------------ |
| `join-session`  | Client       | User joins a session                       |
| `user-joined`   | Server       | Sent to all when a user joins a session    |
| `number-pick`   | Client       | User picks a number for the active session |
| `number-picked` | Server       | Sent to all after number is submitted      |

---

## 🧪 Testing

- Test with Socket.IO client tools or directly via frontend
- Be sure to include a valid token in the payload
- Use tools like [Postman WebSocket](https://blog.postman.com/websocket-request-support/) for manual event testing

---

## 🌍 Environment Variables

```env
JWT_SECRET=your_jwt_secret_key
```

---

## 📘 Future Improvements

- Add WebSocket authentication middleware
- Handle duplicate number selections
- Add `session-ended` or `winner-announced` events
- Add room-based event scoping: `this.server.to(sessionId).emit(...)`
- Track disqualified users (e.g., for picking late or invalid numbers)

---

Let me know if you want this exported to a Markdown file or if you'd like an additional diagram (e.g., sequence or flowchart) for this WebSocket setup!
