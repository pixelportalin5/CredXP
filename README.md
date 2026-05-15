# CredXP – Commercial Real Estate Platform

A modern, responsive commercial property listing platform for office spaces and shops, built as a full-stack MVP using the MERN architecture with Next.js.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Express](https://img.shields.io/badge/Express-5-green?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss)

---

## Features

- **Property Browsing** – Browse 50+ commercial office spaces and shops
- **Search & Filters** – Search by keyword, filter by type, location, price range
- **Pagination** – Server-side pagination with dynamic page controls
- **Sorting** – Sort by newest, price, or size
- **Property Details** – Full detail view with image gallery, amenities, and pricing
- **Contact Form** – Mock enquiry form on each property page
- **Responsive Design** – Mobile-first layout with tablet and desktop optimization
- **Loading States** – Skeleton loaders and smooth transitions
- **Error Handling** – Graceful error boundaries and empty states

---

## Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | Next.js 16 (App Router), React, Tailwind CSS |
| Backend    | Node.js, Express.js 5         |
| Database   | MongoDB Atlas, Mongoose        |
| HTTP       | Axios                          |
| Icons      | Lucide React                   |

---

## Project Structure

```
CredXP/
├── client/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Axios config
│   │   ├── services/           # API service layer
│   │   ├── types/              # Type definitions
│   │   └── utils/              # Helper functions
│   └── public/                 # Static assets
│
└── server/                     # Express Backend
    └── src/
        ├── config/             # Database config
        ├── controllers/        # Route handlers
        ├── middleware/         # Error handling
        ├── models/             # Mongoose schemas
        ├── routes/             # API routes
        ├── seed/               # Database seeder
        ├── services/           # Business logic
        └── utils/              # Utilities
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/credxp.git
cd credxp
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/credxp?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

### 4. Open the App

Visit [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/health`                     | Health check                         |
| GET    | `/api/properties`                 | List properties (pagination, filters, sort) |
| GET    | `/api/properties/search`          | Search properties                    |
| GET    | `/api/properties/status/:status`  | Get by status (Trending / Recently Posted) |
| GET    | `/api/properties/:id`             | Get property details                 |
| POST   | `/api/properties`                 | Create a property                    |

### Query Parameters

| Parameter  | Type   | Description                        |
|------------|--------|------------------------------------|
| `page`     | number | Page number (default: 1)           |
| `limit`    | number | Items per page (default: 10)       |
| `type`     | string | "Office Space" or "Shop"           |
| `status`   | string | "Trending" or "Recently Posted"    |
| `city`     | string | Filter by city name                |
| `minPrice` | number | Minimum price filter               |
| `maxPrice` | number | Maximum price filter               |
| `sort`     | string | newest, oldest, price_asc, price_desc, size_asc, size_desc |
| `q`        | string | Search keyword (search endpoint)   |

---

## Deployment

### Frontend – Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `client`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### Backend – Render

1. Push to GitHub
2. Create a **Web Service** on [Render](https://render.com)
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Add environment variables:
   - `MONGODB_URI` – Your MongoDB Atlas URI
   - `CLIENT_URL` – Your Vercel frontend URL
   - `PORT` – 5000
   - `NODE_ENV` – production

---

## Environment Variables

### Backend (`server/.env`)

| Variable      | Description                |
|---------------|----------------------------|
| `PORT`        | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string  |
| `CLIENT_URL`  | Frontend URL for CORS      |

### Frontend (`client/.env.local`)

| Variable              | Description           |
|-----------------------|-----------------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL  |

---

## Scripts

### Backend

| Command        | Description           |
|----------------|-----------------------|
| `npm run dev`  | Start with nodemon    |
| `npm start`    | Start production      |
| `npm run seed` | Seed the database     |

### Frontend

| Command        | Description           |
|----------------|-----------------------|
| `npm run dev`  | Start dev server      |
| `npm run build`| Production build      |
| `npm start`    | Start production      |

---

## License

This project is for educational and portfolio purposes.
