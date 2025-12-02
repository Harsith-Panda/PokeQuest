# 🧭 PokeQuest – A Location-Based Pokémon Adventure Web App

> **Explore. Capture. Compete.**  
> A web-based location adventure where players discover, capture, and rank Pokémon-like creatures around their real-world surroundings 🌍.

---

## 🚀 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [API Endpoints](#-api-endpoints)
- [Database Design](#-database-design)
- [Installation & Setup](#-installation--setup)
- [Usage Flow](#-usage-flow)
- [Search, Sorting, Filtering & Pagination](#-search-sorting-filtering--pagination)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌍 Overview
**PokeQuest** is a full-stack web application that gamifies real-world exploration.  
Players log in, view their surroundings on a live map, discover virtual Pokémon-like creatures nearby, capture them, and climb a global leaderboard.  

The app integrates **geolocation**, **gamification**, and **real-time web technologies** to deliver an immersive outdoor experience — all through a web interface.

---

## 🎯 MVP Goal
For the first release (MVP), my focus is to build a **solid foundation** with:
- ✅ User authentication (JWT)
- ✅ Pokémon spawning around user’s location (on-demand + random)
- ✅ Capture mechanism with distance validation
- ✅ Global leaderboard ranked by XP
- ✅ Map visualization using Google Maps API

Future updates will include:
- Real-time spawns (Socket.IO)
- Expiry timers for spawns
- Live leaderboards
- Player battles & trading

---

##  🌍 Access the App

👉 Visit: https://poke-quest-web.vercel.app/

## 🎮 Features

| Category | Feature | Description |
|-----------|----------|-------------|
| 👤 **Authentication** | JWT-based login & signup | Secure user management using access tokens |
| 📍 **Spawning System** | GeoJSON-based random spawns | Generates Pokémon-like creatures near players |
| 🧲 **Capture Mechanism** | Distance-based capture check | Players can catch Pokémon within 200m |
| 🎒 **Inventory System** | View captured creatures | Lists all captured Pokémon with timestamps |
| 🏆 **Leaderboard** | Global player ranking | Sorted by XP / capture count |
| 🗺️ **Map Visualization** | Google Maps / Leaflet | Displays player location & nearby Pokémon |

---

## 🧰 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | Next.js (React), Tailwind CSS, Axios, Google Maps API |
| **Backend** | Node.js, Express.js, RESTful API |
| **Database** | MongoDB (GeoJSON for geolocation) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Version Control** | Git + GitHub |
| **Testing** | Postman, Jest (optional) |
| **Hosting** | Vercel / Render / MongoDB Atlas |

---

## 🧾 API Endpoints

| Endpoint | Method | Description | Access |
|-----------|---------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/login` | POST | Authenticate user and return JWT | Public |
| `/api/spawns/nearby?lat=&lng=` | GET | Fetch nearby Pokémon spawns | Authenticated |
| `/api/capture/:spawnId` | POST | Capture a Pokémon within valid distance | Authenticated |
| `/api/inventory` | GET | Fetch user’s captured Pokémon | Authenticated |
| `/api/leaderboard` | GET | View global leaderboard | Public |
| `/api/spawns/generate` | POST | Manually generate test spawns (admin only) | Admin |

---

## 🧬 Database Design

### 🗺️ **User Collection**
```js
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  xp: Number,
  captures: [ObjectId of Capture],
  createdAt: Date,
  isVerified: Boolean
}
```

### 🎯 Capture Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  spawnId: ObjectId,
  capturedAt: Date
}
```

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com//pokequest.git
cd pokequest
```

### 2️⃣ Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in `/server`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_MAPS_API_KEY=your_key
```

### 4️⃣ Run Development Servers
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## 🔁 Usage Flow

1. **Signup/Login** → Receive JWT token
2. **Grant location access** → Map centers on your position
3. **Nearby Search** → Fetch nearby Pokémon spawns
4. **Capture** → Catch Pokémon within range
5. **Leaderboard** → View your rank among all players

## 🔍 Search, Sorting, Filtering & Pagination

| Feature | Implementation |
|---------|----------------|
| **Search** | Search spawns by name/type |
| **Sorting** | Leaderboard sorted by XP or capture count |
| **Filtering** | Filter Pokémon by type (fire, water, etc.) |
| **Pagination** | Paginated inventory & leaderboard results |

## 🧩 Future Enhancements

- 🔄 Real-time spawns & captures using Socket.IO
- ⏱️ Spawn expiry timers (despawn after N minutes)
- 📍 Multi-player proximity events
- 🎮 Trading or battling system
- 📊 Advanced analytics dashboard
- 🧠 AI-driven spawn rarity distribution

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repo
2. Create a new branch (`feature/new-feature`)
3. Commit your changes
4. Submit a pull request 🚀

## 💬 Contact

- 👤 **Author:** Harsith Priyan S
- 🔗 **GitHub:** https://github.com/Harsith-Panda
- 🔗 **LinkedIn:** https://linkedin.com/in/harsithpriyans/

## 🌟 Star the Repo

If you liked this project, give it a ⭐ on GitHub — it really motivates me!
