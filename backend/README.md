# BookHolidayRental Backend

A comprehensive property rental platform backend built with Node.js, Express, and Prisma.

## Features

- **User Management**: Multi-role system (Super Admin, Admin, Agent, Owner, User)
- **Property Management**: Full CRUD operations with approval workflow
- **Subscription System**: Plan-based property listing for owners
- **Booking System**: Complete booking management with payment tracking
- **Review System**: Property reviews with admin moderation
- **AWS S3 Integration**: Media upload and management
- **Role-based Access Control**: Secure endpoints with proper permissions
- **Rate Limiting**: API protection against abuse
- **Comprehensive Validation**: Input validation with Zod schemas

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- AWS Account (for S3)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd holiday/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory with the following variables:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8000
   FRONTEND_URL=http://localhost:3000

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/bookholidayrental?schema=public"

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRES_IN=7d

   # Password Hashing
   BCRYPT_SALT_ROUNDS=12

   # AWS S3 Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET_NAME=your-s3-bucket-name

   # Security
   SESSION_SECRET=your-session-secret-key
   COOKIE_SECRET=your-cookie-secret-key

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # File Upload
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,video/mp4,video/webm

   # Commission Rates (for platform revenue)
   PLATFORM_COMMISSION_RATE=0.15
   AGENT_COMMISSION_RATE=0.10

   # Popular Cities (comma-separated)
   POPULAR_CITIES=Virginia,Canada,Florida,Paris,London,Tokyo,New York,Los Angeles
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # (Optional) Open Prisma Studio
   npm run db:studio
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main entities:

- **Users**: Multi-role user management
- **Properties**: Property listings with approval workflow
- **Bookings**: Reservation system with payment tracking
- **Reviews**: Property reviews with moderation
- **Subscriptions**: Plan-based access for property owners
- **Cities**: Popular destinations management
- **Payments**: Financial transaction tracking

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Properties
- `GET /api/properties` - List public properties
- `GET /api/properties/cities` - Get popular cities
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (Agent/Owner)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/user` - Get user's properties
- `GET /api/properties/admin/queue` - Admin review queue
- `PUT /api/properties/:id/approve` - Admin approve property

### Reviews
- `POST /api/properties/:propertyId/reviews` - Add review
- `GET /api/properties/:propertyId/reviews` - List property reviews
- `GET /api/reviews/:id` - Get review details
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PUT /api/reviews/:id/admin-response` - Admin respond to review
- `GET /api/reviews/user` - Get user's reviews
- `GET /api/reviews/owner` - Get property owner's reviews

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/property/:propertyId` - Get property bookings

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/user` - Get user's subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/analytics` - Platform analytics
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## User Roles & Permissions

### Super Admin
- Full platform control
- Manage all users and roles
- System-wide analytics
- Global settings management

### Admin
- Property approval workflow
- User moderation
- Review management
- Limited analytics

### Agent
- Create property listings
- Manage assigned properties
- View property performance

### Property Owner
- List properties (with subscription)
- Manage own properties
- View earnings dashboard
- Manage bookings

### User (Guest)
- Browse and search properties
- Make bookings
- Write reviews
- View booking history

## File Upload

The application supports media uploads through AWS S3:

- **Supported formats**: JPEG, PNG, WebP, MP4, WebM, OGG
- **Maximum file size**: 10MB (configurable)
- **Storage**: AWS S3 with presigned URLs
- **Organization**: Files organized by property ID and type

## Payment System

The platform includes a payment tracking system:

- **Payment Status Tracking**: Pending, Paid, Failed, Refunded, Cancelled
- **Booking Payments**: Track payment status for each booking
- **Refund Processing**: Handle booking cancellations and refunds
- **Payment Records**: Maintain detailed payment history

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Endpoint protection
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request control
- **Helmet Security**: HTTP header security
- **Password Hashing**: Bcrypt with configurable salt rounds

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Code Style
- ES6+ modules (import/export)
- Async/await for asynchronous operations
- Comprehensive error handling
- Input validation with Zod
- Standardized API responses

## Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Configure database connection pooling
- Set up monitoring and logging
- Use environment-specific configurations

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection strings
- JWT secrets
- AWS credentials
- Security configurations

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## License

This project is licensed under the ISC License.

## Support

For support and questions, please refer to the project documentation or create an issue in the repository. 