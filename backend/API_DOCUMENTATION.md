# BookHolidayRental API Documentation

## Overview

This document provides comprehensive information about how different user types interact with the BookHolidayRental API. The platform supports a multi-role system with specific permissions and capabilities for each role.

## Base URL

```
Development: http://localhost:8000
Production: https://your-domain.com
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles & API Access

### 1. SUPER_ADMIN (Platform Owner)
**Highest level of access with full platform control**

#### **User Management**
- `GET /api/admin/users` - View all users
- `PUT /api/admin/users/:id` - Modify any user's role/status
- `DELETE /api/admin/users/:id` - Remove users from platform
- `GET /api/admin/users/:id` - View detailed user information

#### **System Administration**
- `GET /api/admin/analytics` - Platform-wide analytics and insights
- `GET /api/admin/system-health` - System status and health checks
- `POST /api/admin/subscription-plans` - Create subscription plans
- `PUT /api/admin/subscription-plans/:id` - Modify subscription plans
- `DELETE /api/admin/subscription-plans/:id` - Remove subscription plans

#### **Property Oversight**
- `GET /api/admin/properties/queue` - Review all pending properties
- `PUT /api/admin/properties/:id/approve` - Approve/reject/suspend properties
- Full access to all property data and management

#### **Financial Control**
- Access to all payment records
- Platform revenue analytics
- Commission rate management

---

### 2. ADMIN (Platform Moderator)
**High-level access for platform moderation and management**

#### **User Moderation**
- `GET /api/admin/users` - View users (limited analytics)
- `PUT /api/admin/users/:id` - Modify user status (cannot change to SUPER_ADMIN)
- `GET /api/admin/users/:id` - View user details

#### **Content Moderation**
- `GET /api/admin/properties/queue` - Review pending properties
- `PUT /api/admin/properties/:id/approve` - Approve/reject properties
- `PUT /api/reviews/:id/admin-response` - Respond to user reviews
- `GET /api/admin/analytics` - Limited platform analytics

#### **Property Management**
- Can view and manage all properties
- Access to property approval workflow
- Can suspend problematic properties

---

### 3. AGENT (Property Representative)
**Professional property managers and real estate agents**

#### **Property Management**
- `POST /api/properties` - Create property listings
- `PUT /api/properties/:id` - Update property details
- `DELETE /api/properties/:id` - Remove properties
- `GET /api/properties/user` - View managed properties

#### **Booking Management**
- `GET /api/bookings/property/:propertyId` - View bookings for managed properties
- `PUT /api/bookings/:id` - Update booking details
- `PUT /api/bookings/:id/confirm` - Confirm pending bookings

#### **Client Interaction**
- Can manage properties on behalf of owners
- Access to property performance metrics
- Can respond to guest inquiries

#### **Limitations**
- Cannot approve their own properties
- Cannot access admin functions
- Cannot modify user roles

---

### 4. OWNER (Property Owner)
**Individuals who own properties and want to list them**

#### **Access Policy**
- Access to owner features is granted via the `ownerPaid` flag on the user record (set by an Admin/Super Admin).
- No subscription is required; previous subscription checks have been removed.

#### **Property Management**
- `POST /api/properties` - List new properties (requires `ownerPaid=true`)
- `PUT /api/properties/:id` - Update property details
- `DELETE /api/properties/:id` - Remove properties
- `GET /api/properties/user` - View owned properties

#### **Booking Oversight**
- `GET /api/bookings/property/:propertyId` - View property bookings
- `PUT /api/bookings/:id/confirm` - Confirm guest bookings
- Access to booking analytics and revenue data

#### **Review Management**
- `GET /api/reviews/owner` - View reviews for owned properties
- Can respond to guest reviews
- Access to property rating analytics

#### **Limitations**
- Cannot access owner features unless `ownerPaid=true`
- Properties require admin approval before going live

---

### 5. USER (Guest/Traveler)
**Regular users who browse and book properties**

#### **Property Discovery**
- `GET /api/properties` - Browse available properties
- `GET /api/properties/cities` - View popular destinations
- `GET /api/properties/:id` - View property details
- Advanced filtering by location, price, amenities, dates

#### **Booking Management**
- `POST /api/bookings` - Make property reservations
- `GET /api/bookings` - View booking history
- `GET /api/bookings/:id` - View booking details
- `PUT /api/bookings/:id` - Modify existing bookings
- `DELETE /api/bookings/:id` - Cancel bookings

#### **Review System**
- `POST /api/properties/:propertyId/reviews` - Write property reviews
- `GET /api/reviews/user` - View own review history
- `PUT /api/reviews/:id` - Edit own reviews
- `DELETE /api/reviews/:id` - Remove own reviews

#### **Profile Management**
- `GET /api/auth/me` - View profile
- `PUT /api/auth/profile` - Update profile information
- `PUT /api/auth/password` - Change password

#### **Limitations**
- Cannot create properties
- Cannot access admin functions
- Cannot modify other users' content

---

## API Endpoints by Category

### Authentication & Profile
```
POST   /api/auth/signup          - User registration
POST   /api/auth/login           - User login
GET    /api/auth/me              - Get current user profile
PUT    /api/auth/profile         - Update profile
PUT    /api/auth/password        - Change password
POST   /api/auth/refresh         - Refresh JWT token
POST   /api/auth/logout          - User logout
```

### Properties
```
GET    /api/properties           - List public properties
GET    /api/properties/cities    - Get popular cities
GET    /api/properties/:id       - Get property details
POST   /api/properties           - Create property (Agent/Owner)
PUT    /api/properties/:id       - Update property
DELETE /api/properties/:id       - Delete property
GET    /api/properties/user      - Get user's properties
GET    /api/properties/admin/queue - Admin review queue
PUT    /api/properties/:id/approve - Admin approve property
```

### Bookings
```
POST   /api/bookings                         - Create booking (USER)
GET    /api/bookings/user/list               - List current user's bookings (USER)
GET    /api/bookings/:id                     - Get booking details (USER/OWNER/AGENT/ADMIN)
PUT    /api/bookings/:id                     - Update booking (USER/OWNER/AGENT/ADMIN)
DELETE /api/bookings/:id                     - Cancel booking (USER/OWNER/AGENT/ADMIN)
GET    /api/bookings/property/:propertyId    - Get bookings for a property (OWNER/AGENT)
PUT    /api/bookings/:id/confirm             - Confirm booking (OWNER/AGENT)
```

### Reviews
```
POST   /api/properties/:propertyId/reviews - Add review
GET    /api/properties/:propertyId/reviews - List property reviews
GET    /api/reviews/:id          - Get review details
PUT    /api/reviews/:id          - Update review
DELETE /api/reviews/:id          - Delete review
PUT    /api/reviews/:id/admin-response - Admin respond to review
GET    /api/reviews/user         - Get user's reviews
GET    /api/reviews/owner        - Get property owner's reviews
```

### Subscriptions
```
GET    /api/subscriptions/plans  - Get available plans
POST   /api/subscriptions        - Create subscription
GET    /api/subscriptions/user   - Get user's subscription
PUT    /api/subscriptions/:id    - Update subscription
DELETE /api/subscriptions/:id    - Cancel subscription
GET    /api/subscriptions/usage  - Get subscription usage
```

### Media Management (Property Images)
```
POST   /api/properties/media/presign        - Generate presigned URL for S3 upload
POST   /api/properties/:id/media            - Add media URLs to a property (after uploading to S3)
DELETE /api/properties/:id/media            - Remove media URLs from a property (best-effort S3 delete)
```

### Admin Functions
```
GET    /api/admin/users          - List users
GET    /api/admin/users/:id      - Get user details
PUT    /api/admin/users/:id      - Update user
DELETE /api/admin/users/:id      - Delete user
GET    /api/admin/analytics      - Platform analytics
GET    /api/admin/subscription-plans - List subscription plans
POST   /api/admin/subscription-plans - Create subscription plan
PUT    /api/admin/subscription-plans/:id - Update subscription plan
DELETE /api/admin/subscription-plans/:id - Delete subscription plan
GET    /api/admin/system-health  - System health check
```

## Request/Response Examples

### Creating a Property (Owner/Agent)
```json
POST /api/properties
Authorization: Bearer <jwt-token>

{
  "title": "Cozy Mountain Cabin",
  "description": "Beautiful 2-bedroom cabin with mountain views",
  "location": "Mountain View",
  "city": "Aspen",
  "country": "USA",
  "address": "123 Mountain Road, Aspen, CO 81611",
  "latitude": 39.1911,
  "longitude": -106.8175,
  "price": 150.00,
  "pricePerNight": true,
  "amenities": {
    "wifi": true,
    "kitchen": true,
    "parking": true,
    "pool": false
  },
  "media": [
    {
      "type": "image",
      "url": "https://s3.amazonaws.com/bucket/cabin1.jpg",
      "caption": "Front view of the cabin",
      "isPrimary": true
    }
  ],
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "propertyType": "cabin",
  "instantBooking": false
}
```

### Making a Booking (User)
```json
POST /api/bookings
Authorization: Bearer <jwt-token>

{
  "propertyId": 1001,
  "startDate": "2024-02-15T00:00:00Z",
  "endDate": "2024-02-18T00:00:00Z",
  "guests": 2,
  "specialRequests": "Early check-in if possible"
}
```

### Adding a Review (User)
```json
POST /api/properties/1001/reviews
Authorization: Bearer <jwt-token>

{
  "rating": 5,
  "comment": "Amazing cabin with breathtaking views! Everything was perfect.",
  "bookingId": 501
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Uploads**: 10 requests per 15 minutes

## File Upload Guidelines

### Supported Formats
- Images: JPEG, PNG, WebP (max ~10MB per file)

### Upload Process (Property Images)
1. Generate presigned URL: `POST /api/properties/media/presign`
2. Upload file directly to S3 using the presigned URL
3. Save file URL to the property via `POST /api/properties/:id/media`

## Testing the API

### 1. User Registration Flow
```bash
# 1. Register as a regular user
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# 2. Login to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### 2. Property Owner Flow
```bash
# 1. Register as property owner
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@example.com","password":"password123","role":"OWNER"}'

# 2. View subscription plans
curl -X GET http://localhost:8000/api/subscriptions/plans

# 3. Purchase subscription (after getting JWT token)
curl -X POST http://localhost:8000/api/subscriptions \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"planId": 1}'
```

### 3. Admin Flow
```bash
# 1. Login as admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. View pending properties
curl -X GET http://localhost:8000/api/admin/properties/queue \
  -H "Authorization: Bearer <admin-jwt-token>"

# 3. Approve a property
curl -X PUT http://localhost:8000/api/admin/properties/1001/approve \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"LIVE","adminNotes":"Approved after review"}'
```

## Security Considerations

1. **JWT Tokens**: Store securely, refresh before expiration
2. **Role Validation**: Always verify user permissions on protected endpoints
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Rate Limiting**: Respect API rate limits to avoid temporary blocks
5. **File Uploads**: Validate file types and sizes before upload

## Support & Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check JWT token validity and expiration
2. **403 Forbidden**: Verify user has required role/permissions
3. **422 Validation Error**: Check request body against schema requirements
4. **429 Too Many Requests**: Reduce API call frequency

### Getting Help
- Check API response messages for specific error details
- Verify user role and permissions
- Ensure all required fields are provided
- Check JWT token expiration

---
