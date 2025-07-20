Methuselah is a platform designed to explore and promote personalized longevity-related solutions. This project leverages modern web technologies, MongoDB for database storage, and provides a set of APIs for both user-facing and admin features. Below you'll find a detailed README including MongoDB dependencies and API descriptions. This work is for the purpose of CSC 4996 at Wayne State University. We welcome contributions and feedback as we shape the future of Methuselah.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Technologies](#technologies)
- [MongoDB Dependencies](#mongodb-dependencies)
- [API Endpoints](#api-endpoints)
  - [Auth & User APIs](#auth--user-apis)
  - [Admin APIs](#admin-apis)
  - [Chat & RAG APIs](#chat--rag-apis)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

Methuselah is a platform designed to explore and promote longevity-related solutions. While still in its infancy, the project leverages modern web technologies to deliver a scalable and user-friendly experience. This repository contains the frontend application, with plans for expanded features and integrations in future iterations.

---

## 🛠 Technologies

- **Frontend Framework:** Next.js 13.5.6 (TypeScript)
- **Backend:** Node.js 20, Express, MongoDB (Mongoose)
- **Database:** MongoDB Atlas (Cloud)
- **Other:** Cypress (testing), Ant Design (UI), HuggingFace Inference API

---

## 🟢 MongoDB Dependencies

Methuselah is tightly integrated with MongoDB. You must have a MongoDB Atlas cluster (or local MongoDB instance) and set the `MONGODB_URI` in your `.env.local` file.

**MongoDB Collections:**
- `Longevity.KnowledgeBase` – Stores knowledge chunks and their embeddings
- `users` – User accounts and profile data
- `conversations` – Chat session data
- `chunks` – Uploaded or managed data chunks (admin panel)

**Connecting to MongoDB:**
- Backend uses Mongoose (`mongoose.connect(process.env.MONGODB_URI)`)
- Ingest scripts and admin tools directly access and manipulate collections

**Populate KnowledgeBase Example:**
```js
// backend/ingest.js
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const kb = client.db('Longevity').collection('KnowledgeBase');
await kb.insertOne({ id: 'sleep', text: '...', embedding: [...] });
await client.close();
```

---

## 🔗 API Endpoints

### Auth & User APIs

- `POST /api/userLogin` – Log in user
- `POST /api/userRegister` – Register new user
- `POST /api/userLogout` – Log out user
- `GET /api/checkAuth` – Check if user is authenticated
- `GET /api/userSettings` – Get user settings
- `GET /api/userData` – Get user profile/data
- `GET /api/userProfile` – Fetch profile info
- `GET /api/userChatHist` – Get chat history
- `POST /api/feedback` – Submit user feedback

### Admin APIs

- `GET /api/admin/chunks` – List all knowledge chunks (for moderation)
- `DELETE /api/admin/chunks` – Delete selected chunks
- `PATCH /api/admin/chunks/:id` – Edit a specific chunk
- `POST /api/admin/uploadData` – Upload data files (admin only)

### Chat & RAG APIs

- `POST /api/ragSearch` – Retrieve relevant knowledge snippets via search
- `POST /api/ragChat` – Multi-turn RAG-enabled chat
- `GET /api/health-metrics` – Get user health metrics
- `GET /api/healthz` – Health check endpoint
- `POST /api/conversations` – Create a chat session
- `GET /api/conversations` – List user chat sessions
- `GET /api/conversations/:id` – Get single chat session
- `POST /api/conversations/:id/messages` – Add message to a conversation

### Other APIs

- `GET /api/web3-auth?address=0x...` – Request Web3 authentication nonce
- `POST /api/web3-auth` – Verify signed nonce for Web3 login

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas cluster (or local instance)
- `.env.local` file with secrets/keys, including `MONGODB_URI`

### Installation

```bash
git clone https://github.com/violetyousif/Methuselah.git
cd Methuselah
npm install
```

### Running Locally

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

### Running the Backend/API

```bash
cd backend
node server.js
```

---

## 🤝 Contributing

We are excited to build Methuselah with the community! To contribute:

1. Fork the repository

2. Create a feature branch:

```bash
git checkout -b feature/YourFeature
```

3. Commit your changes:

```bash
git commit -m 'Add YourFeature'
```

4. Push to the branch:

```bash
git push origin feature/YourFeature
```

5. Open a Pull Request.Await approval and github checks

> For questions, join our Discord server or open an issue.

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 📬 Contact

- [Join Discord](https://discord.gg/JNMzdaqG)
- Open an issue
- Email: [hj7083@wayne.edu](mailto:hj7083@wayne.edu)

