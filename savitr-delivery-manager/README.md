# Savitr Delivery Manager

A modern delivery management system built with Next.js, TypeScript, and MongoDB.

## Features

- 🚚 Comprehensive delivery management
- 📱 Responsive admin dashboard
- 🔐 Secure authentication system
- 📊 Real-time delivery tracking
- 🤖 AI-powered delivery optimization
- 📱 Mobile-friendly interface
- 🔄 Integration with India Post clone

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS
- NextAuth.js
- React Query
- Zod (for validation)

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (v6 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/savitr-delivery-manager.git
cd savitr-delivery-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_SECRET_CODE=your_admin_secret_code
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
savitr-delivery-manager/
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utility functions and configurations
│   ├── models/        # MongoDB models
│   ├── contexts/      # React contexts
│   ├── types/         # TypeScript type definitions
│   └── styles/        # Global styles
├── public/            # Static assets
└── scripts/           # Utility scripts
```

## Database Schema

### User Model
- name: String
- email: String (unique)
- password: String (hashed)
- role: Enum (admin/recipient)
- phone: String
- address: String
- adminSecretCode: String

### Delivery Model
- trackingId: String (unique)
- name: String
- phone: String
- email: String
- address: String
- deliveryDate: Date
- deliveryTime: String
- product: String
- status: Enum
- recipientId: ObjectId
- adminId: ObjectId
- rescheduleHistory: Array
- notes: String

## Integration with India Post Clone

The project integrates with the India Post clone through:
- CORS configuration in `next.config.js`
- Environment-based URL handling
- Secure API endpoints

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| NEXTAUTH_SECRET | Secret for NextAuth.js | Yes |
| NEXTAUTH_URL | Base URL for NextAuth.js | Yes |
| ADMIN_SECRET_CODE | Secret code for admin registration | Yes |

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/session - Get current session

### Deliveries
- GET /api/deliveries - List all deliveries
- POST /api/deliveries - Create new delivery
- GET /api/deliveries/:id - Get delivery details
- PUT /api/deliveries/:id - Update delivery
- DELETE /api/deliveries/:id - Delete delivery

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- CORS protection
- Input validation with Zod
- Environment variable protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database
- All contributors who have helped with the project
