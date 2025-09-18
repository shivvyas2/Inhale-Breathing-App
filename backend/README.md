# Inhale Backend API

A modern Node.js backend API for the Inhale meditation app, featuring user management, session tracking, streak maintenance, and music management with Supabase and Clerk integration.

## 🚀 Features

- **User Management**: Complete user profiles with Clerk authentication
- **Session Tracking**: Record and track meditation sessions
- **Streak System**: Automatic streak calculation and maintenance
- **Music Management**: Audio file storage and retrieval
- **Webhook Integration**: Automatic user creation via Clerk webhooks
- **API Documentation**: Interactive Swagger UI
- **Real-time Data**: Supabase PostgreSQL database
- **Security**: JWT authentication and webhook verification

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and storage
- **Clerk** - Authentication and user management
- **Swagger UI** - API documentation
- **Joi** - Request validation
- **Helmet** - Security middleware

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/inhale-backend.git
cd inhale-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Configuration
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

### 5. Access the API

- **API Base URL**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **API Documentation**: `http://localhost:3000/api-docs`

## 📚 API Endpoints

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user profile

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/user/:userId` - Get user sessions
- `GET /api/sessions/:id` - Get session details

### Music
- `GET /api/music` - Get all music files
- `GET /api/music/:id` - Get specific music file
- `POST /api/music` - Upload new music file

### Streaks
- `GET /api/streaks/user/:userId` - Get user streak
- `PUT /api/streaks/user/:userId` - Update user streak

### Webhooks
- `POST /api/webhook/clerk` - Clerk webhook endpoint

## 🗄 Database Schema

The API uses Supabase PostgreSQL with the following tables:

- **users** - User profiles and data
- **sessions** - Meditation session records
- **streaks** - Daily streak tracking
- **music** - Audio file metadata
- **user_music_preferences** - User music preferences

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run build      # Build for production
```

### Project Structure

```
backend/
├── api/
│   └── index.js              # Vercel serverless function
├── src/
│   ├── config/
│   │   └── supabase.js       # Supabase configuration
│   ├── middleware/
│   │   └── validation.js     # Request validation
│   ├── routes/
│   │   ├── userRoutes.js     # User endpoints
│   │   ├── sessionRoutes.js  # Session endpoints
│   │   ├── musicRoutes.js    # Music endpoints
│   │   ├── streakRoutes.js   # Streak endpoints
│   │   └── webhookRoutes.js  # Webhook endpoints
│   └── server.js             # Main server file
├── docs/
│   └── swagger.yaml          # API documentation
├── package.json
├── vercel.json               # Vercel deployment config
└── README.md
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set root directory to `backend`
3. Add environment variables
4. Deploy automatically

### Railway

1. Connect your GitHub repository to Railway
2. Set root directory to `backend`
3. Add environment variables
4. Deploy automatically

### Manual Deployment

```bash
# Build the project
npm run build

# Start the server
npm start
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |

## 📖 API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` for interactive API documentation with Swagger UI.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the API documentation
- Review the Swagger UI at `/api-docs`

## 🔄 Webhook Setup

To enable automatic user creation:

1. Deploy the backend to Vercel/Railway
2. Get your webhook URL: `https://your-domain.com/api/webhook/clerk`
3. Configure Clerk webhook in your Clerk dashboard
4. Select events: `user.created` and `user.updated`
5. Add the webhook secret to your environment variables

## 🎯 Features in Detail

### User Management
- Automatic user profile creation via Clerk webhooks
- User data synchronization
- Profile updates and management

### Session Tracking
- Record meditation sessions
- Track session duration and type
- Calculate points and rewards

### Streak System
- Automatic streak calculation
- Daily streak maintenance
- Longest streak tracking

### Music Management
- Audio file storage in Supabase
- Music categorization and mood tagging
- User music preferences

---

Built with ❤️ for the Inhale meditation app
