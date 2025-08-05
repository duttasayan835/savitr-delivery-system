# From-IndiaPost-to-Savitr-AI

# Savitr-AI Delivery System

A comprehensive delivery management system consisting of two integrated applications:
1. India Post Clone (Frontend)
2. Savitr Delivery Manager (Backend + Frontend)

## System Overview

This project combines two applications that work together to provide a complete delivery management solution:

- **India Post Clone**: A modern clone of the India Post website that serves as the entry point for users
- **Savitr Delivery Manager**: A full-featured delivery management system with admin dashboard

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (v6 or higher)
- Git

## Directory Structure

```
Complete Savitr-AI from India POST/
├── indiapost-clone/          # India Post Clone (Frontend)
└── savitr-delivery-manager/  # Savitr Delivery Manager (Full Stack)
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/savitr-ai-delivery-system.git
cd savitr-ai-delivery-system
```

### 2. Set Up India Post Clone

```bash
cd indiapost-clone
npm install
```

Create `.env` file:
```env
VITE_SAVITR_AI_URL=http://localhost:3000
VITE_INDIA_POST_URL=http://localhost:5173
```

### 3. Set Up Savitr Delivery Manager

```bash
cd ../savitr-delivery-manager
npm install
```

Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
ADMIN_SECRET_CODE=your_admin_secret_here

# Twilio Configuration (Optional for SMS features)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Development Settings
SEND_REAL_SMS_IN_DEV=false
SEND_MOCK_NOTIFICATIONS=true
NODE_ENV=development
```

## Running the System

### Option 1: Using Separate Terminals

1. Start MongoDB:
```bash
mongod
```

2. Start Savitr Delivery Manager (Terminal 1):
```bash
cd savitr-delivery-manager
npm run dev
```

3. Start India Post Clone (Terminal 2):
```bash
cd indiapost-clone
npm run dev
```

### Option 2: Using a Script

Create a `start.sh` file in the root directory:

```bash
#!/bin/bash

# Start MongoDB
mongod &

# Start Savitr Delivery Manager
cd savitr-delivery-manager
npm run dev &

# Start India Post Clone
cd ../indiapost-clone
npm run dev
```

Make it executable and run:
```bash
chmod +x start.sh
./start.sh
```

## Accessing the Applications

- India Post Clone: http://localhost:5173
- Savitr Delivery Manager: http://localhost:3000

## Integration Points

The two applications communicate through:

1. **URL Integration**
   - India Post Clone's Savitr-AI link points to Savitr Delivery Manager
   - CORS is configured to allow communication between the applications

2. **Data Flow**
   - Users can access Savitr Delivery Manager through the India Post Clone interface
   - Delivery data is stored in MongoDB and accessible through the Savitr Delivery Manager API

## Development Workflow

1. **Making Changes**
   - Work on India Post Clone in the `indiapost-clone` directory
   - Work on Savitr Delivery Manager in the `savitr-delivery-manager` directory

2. **Testing Integration**
   - Ensure both applications are running
   - Test the link between applications by clicking the Savitr-AI icon in India Post Clone
   - Verify that it correctly redirects to the Savitr Delivery Manager

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - India Post Clone uses port 5173
   - Savitr Delivery Manager uses port 3000
   - Ensure these ports are available

2. **MongoDB Connection**
   - Verify MongoDB is running
   - Check the connection string in Savitr Delivery Manager's `.env` file

3. **CORS Issues**
   - Ensure CORS is properly configured in `next.config.js`
   - Check that the URLs in both `.env` files match

### Debugging Steps

1. Check application logs in both terminals
2. Verify MongoDB connection
3. Clear browser cache if experiencing UI issues
4. Restart both applications if changes aren't reflecting

## Environment Variables

### India Post Clone
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_SAVITR_AI_URL | URL for Savitr-AI integration | http://localhost:3000 |
| VITE_INDIA_POST_URL | Base URL for India Post clone | http://localhost:5173 |

### Savitr Delivery Manager
| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| NEXTAUTH_SECRET | Secret for NextAuth.js | Yes |
| NEXTAUTH_URL | Base URL for NextAuth.js | Yes |
| ADMIN_SECRET_CODE | Secret code for admin registration | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
1. Check the troubleshooting section
2. Review the documentation in each project's README
3. Open an issue in the repository 