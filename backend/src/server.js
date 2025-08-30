import dotenv from 'dotenv';
import app from './app.js';
import prisma from './db.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Ensure Super Admin exists
async function ensureSuperAdmin() {
  try {
    const email = (process.env.SUPERADMIN_EMAIL || '').toLowerCase();
    const password = process.env.SUPERADMIN_PASSWORD || '';
    if (!email || !password) {
      console.warn('SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set. Skipping super admin seed.');
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.role === 'SUPER_ADMIN') {
      return; // already present
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    if (existing) {
      await prisma.user.update({
        where: { email },
        data: { role: 'SUPER_ADMIN', passwordHash, isActive: true }
      });
    } else {
      await prisma.user.create({
        data: { name: 'Super Admin', email, passwordHash, role: 'SUPER_ADMIN', isActive: true }
      });
    }
    console.log('✅ Super Admin ensured');
  } catch (err) {
    console.error('Failed to ensure Super Admin:', err);
  }
}

// Create server (ensure super admin in background)
ensureSuperAdmin().finally(() => {
  /* no-op */
});

const server = app.listen(PORT, () => {
  console.log(`🚀 BookHolidayRental API running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
