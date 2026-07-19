import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Hash password using PBKDF2 (used for seeding only — production uses bcrypt/argon2 via auth service).
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Database seed script for Solo Advertiser.
 * Creates:
 * - Super Admin user
 * - Default configuration entries (CFG-001 through CFG-055)
 * - Default feature flags (FF-001 through FF-020)
 * - Default dictionaries (payment methods, asset types, statuses, etc.)
 * - Default zones (Kathmandu Valley with 5 wards)
 * - Helmet advertising channel
 */
async function main() {
  console.log('🌱 Seeding database...');

  // ────────────────────────────────────────────────
  // 1. Super Admin User
  // ────────────────────────────────────────────────
  const adminEmail = 'admin@soloadvertiser.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashPassword('Admin@123'),
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        phone: '+9779800000000',
      },
    });
    console.log('✅ Super Admin created: admin@soloadvertiser.com');
  } else {
    console.log('⏭️  Super Admin already exists, skipping.');
  }

  // ────────────────────────────────────────────────
  // 2. Default Configuration Entries (CFG-001 through CFG-055)
  // ────────────────────────────────────────────────
  const configurations = [
    { key: 'CFG-001', category: 'platform', label: 'Platform Name', value: 'Solo Advertiser', valueType: 'string' },
    { key: 'CFG-002', category: 'platform', label: 'Platform Tagline', value: 'Helmet Advertising Platform', valueType: 'string' },
    { key: 'CFG-003', category: 'platform', label: 'Support Email', value: 'support@soloadvertiser.com', valueType: 'string' },
    { key: 'CFG-004', category: 'platform', label: 'Support Phone', value: '+977-01-4000000', valueType: 'string' },
    { key: 'CFG-005', category: 'platform', label: 'Default Currency', value: 'NPR', valueType: 'string' },
    { key: 'CFG-006', category: 'platform', label: 'Default Language', value: 'en', valueType: 'string' },
    { key: 'CFG-007', category: 'platform', label: 'Default Timezone', value: 'Asia/Kathmandu', valueType: 'string' },
    { key: 'CFG-008', category: 'verification', label: 'Verification SLA (hours)', value: '48', valueType: 'number' },
    { key: 'CFG-009', category: 'verification', label: 'Max Verification Attempts', value: '3', valueType: 'number' },
    { key: 'CFG-010', category: 'verification', label: 'Document Expiry Warning Days', value: '30', valueType: 'number' },
    { key: 'CFG-011', category: 'verification', label: 'Auto-reject After Days', value: '7', valueType: 'number' },
    { key: 'CFG-012', category: 'auth', label: 'OTP Length', value: '6', valueType: 'number' },
    { key: 'CFG-013', category: 'auth', label: 'OTP Expiry (seconds)', value: '300', valueType: 'number' },
    { key: 'CFG-014', category: 'auth', label: 'Max OTP Attempts', value: '5', valueType: 'number' },
    { key: 'CFG-015', category: 'auth', label: 'Session Timeout (minutes)', value: '60', valueType: 'number' },
    { key: 'CFG-016', category: 'auth', label: 'Max Active Sessions', value: '3', valueType: 'number' },
    { key: 'CFG-017', category: 'auth', label: 'Password Min Length', value: '8', valueType: 'number' },
    { key: 'CFG-018', category: 'auth', label: 'Account Lockout Attempts', value: '5', valueType: 'number' },
    { key: 'CFG-019', category: 'auth', label: 'Account Lockout Duration (minutes)', value: '30', valueType: 'number' },
    { key: 'CFG-020', category: 'finance', label: 'Platform Commission (%)', value: '15', valueType: 'number' },
    { key: 'CFG-021', category: 'finance', label: 'Minimum Payout Amount (NPR)', value: '500', valueType: 'number' },
    { key: 'CFG-022', category: 'finance', label: 'Payout Cycle (days)', value: '15', valueType: 'number' },
    { key: 'CFG-023', category: 'finance', label: 'Escrow Hold Period (days)', value: '7', valueType: 'number' },
    { key: 'CFG-024', category: 'finance', label: 'Late Payment Penalty (%)', value: '5', valueType: 'number' },
    { key: 'CFG-025', category: 'finance', label: 'Tax Rate (%)', value: '13', valueType: 'number' },
    { key: 'CFG-026', category: 'campaign', label: 'Min Campaign Duration (days)', value: '7', valueType: 'number' },
    { key: 'CFG-027', category: 'campaign', label: 'Max Campaign Duration (days)', value: '365', valueType: 'number' },
    { key: 'CFG-028', category: 'campaign', label: 'Min Riders Per Campaign', value: '5', valueType: 'number' },
    { key: 'CFG-029', category: 'campaign', label: 'Max Riders Per Campaign', value: '500', valueType: 'number' },
    { key: 'CFG-030', category: 'campaign', label: 'Campaign Approval SLA (hours)', value: '24', valueType: 'number' },
    { key: 'CFG-031', category: 'campaign', label: 'Min Budget Per Campaign (NPR)', value: '5000', valueType: 'number' },
    { key: 'CFG-032', category: 'campaign', label: 'Daily Rate Per Helmet (NPR)', value: '50', valueType: 'number' },
    { key: 'CFG-033', category: 'media', label: 'Max File Size (MB)', value: '10', valueType: 'number' },
    { key: 'CFG-034', category: 'media', label: 'Allowed Image Formats', value: 'jpg,jpeg,png,webp', valueType: 'string' },
    { key: 'CFG-035', category: 'media', label: 'Max Document Size (MB)', value: '25', valueType: 'number' },
    { key: 'CFG-036', category: 'media', label: 'Image Compression Quality', value: '80', valueType: 'number' },
    { key: 'CFG-037', category: 'media', label: 'Thumbnail Size (px)', value: '200', valueType: 'number' },
    { key: 'CFG-038', category: 'rider', label: 'Min Age', value: '18', valueType: 'number' },
    { key: 'CFG-039', category: 'rider', label: 'Max Helmets Per Rider', value: '2', valueType: 'number' },
    { key: 'CFG-040', category: 'rider', label: 'Inactivity Threshold (days)', value: '30', valueType: 'number' },
    { key: 'CFG-041', category: 'rider', label: 'Re-verification Interval (months)', value: '6', valueType: 'number' },
    { key: 'CFG-042', category: 'notification', label: 'Push Retry Attempts', value: '3', valueType: 'number' },
    { key: 'CFG-043', category: 'notification', label: 'SMS Daily Limit Per User', value: '5', valueType: 'number' },
    { key: 'CFG-044', category: 'notification', label: 'Quiet Hours Start (NPT)', value: '22:00', valueType: 'string' },
    { key: 'CFG-045', category: 'notification', label: 'Quiet Hours End (NPT)', value: '07:00', valueType: 'string' },
    { key: 'CFG-046', category: 'rate_limit', label: 'Auth Rate Limit (req/15min)', value: '10', valueType: 'number' },
    { key: 'CFG-047', category: 'rate_limit', label: 'OTP Rate Limit (req/15min)', value: '5', valueType: 'number' },
    { key: 'CFG-048', category: 'rate_limit', label: 'Upload Rate Limit (req/hr)', value: '20', valueType: 'number' },
    { key: 'CFG-049', category: 'rate_limit', label: 'API Rate Limit (req/min)', value: '100', valueType: 'number' },
    { key: 'CFG-050', category: 'rate_limit', label: 'Public Rate Limit (req/min)', value: '30', valueType: 'number' },
    { key: 'CFG-051', category: 'business', label: 'Max Sticker Designs Per Campaign', value: '3', valueType: 'number' },
    { key: 'CFG-052', category: 'business', label: 'Business Verification SLA (hours)', value: '72', valueType: 'number' },
    { key: 'CFG-053', category: 'assignment', label: 'Assignment Accept Timeout (hours)', value: '24', valueType: 'number' },
    { key: 'CFG-054', category: 'assignment', label: 'Max Concurrent Assignments', value: '3', valueType: 'number' },
    { key: 'CFG-055', category: 'assignment', label: 'Sticker Application Deadline (hours)', value: '48', valueType: 'number' },
  ];

  for (const config of configurations) {
    await prisma.configuration.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  console.log(`✅ ${configurations.length} configuration entries seeded.`);

  // ────────────────────────────────────────────────
  // 3. Default Feature Flags (FF-001 through FF-020)
  // ────────────────────────────────────────────────
  const featureFlags = [
    { key: 'FF-001', name: 'Google OAuth Login', description: 'Enable Google OAuth for login/registration', enabled: true },
    { key: 'FF-002', name: 'SMS OTP', description: 'Enable SMS-based OTP verification', enabled: true },
    { key: 'FF-003', name: 'Email Verification', description: 'Require email verification on registration', enabled: true },
    { key: 'FF-004', name: 'Push Notifications', description: 'Enable FCM push notifications', enabled: true },
    { key: 'FF-005', name: 'Auto-assignment', description: 'Enable automatic rider-campaign matching', enabled: false },
    { key: 'FF-006', name: 'eSewa Payments', description: 'Enable eSewa payment gateway', enabled: true },
    { key: 'FF-007', name: 'Khalti Payments', description: 'Enable Khalti payment gateway', enabled: true },
    { key: 'FF-008', name: 'Bank Transfer', description: 'Enable bank transfer payout method', enabled: true },
    { key: 'FF-009', name: 'IME Pay', description: 'Enable IME Pay payment gateway', enabled: false },
    { key: 'FF-010', name: 'Marketplace', description: 'Enable public campaign marketplace', enabled: false },
    { key: 'FF-011', name: 'Partner API', description: 'Enable external partner API access', enabled: false },
    { key: 'FF-012', name: 'Bulk Upload', description: 'Enable bulk rider/document upload', enabled: false },
    { key: 'FF-013', name: 'Advanced Analytics', description: 'Enable advanced analytics dashboard', enabled: false },
    { key: 'FF-014', name: 'Multi-language', description: 'Enable multi-language support (NE/EN)', enabled: false },
    { key: 'FF-015', name: 'Rider Gamification', description: 'Enable rider points and rewards system', enabled: false },
    { key: 'FF-016', name: 'Live Tracking', description: 'Enable real-time rider location tracking', enabled: false },
    { key: 'FF-017', name: 'Document OCR', description: 'Enable OCR for document auto-extraction', enabled: false },
    { key: 'FF-018', name: 'WebSocket Notifications', description: 'Enable real-time WebSocket notifications', enabled: true },
    { key: 'FF-019', name: 'Maintenance Mode', description: 'Enable platform maintenance mode', enabled: false },
    { key: 'FF-020', name: 'Registration Open', description: 'Allow new user registrations', enabled: true },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { enabled: flag.enabled },
      create: flag,
    });
  }
  console.log(`✅ ${featureFlags.length} feature flags seeded.`);

  // ────────────────────────────────────────────────
  // 4. Default Dictionaries
  // ────────────────────────────────────────────────
  const dictionaries: Array<{ category: string; code: string; label: string; sortOrder: number }> = [
    // Payment Methods
    { category: 'PAYMENT_METHOD', code: 'esewa', label: 'eSewa', sortOrder: 1 },
    { category: 'PAYMENT_METHOD', code: 'khalti', label: 'Khalti', sortOrder: 2 },
    { category: 'PAYMENT_METHOD', code: 'bank_transfer', label: 'Bank Transfer', sortOrder: 3 },
    { category: 'PAYMENT_METHOD', code: 'ime_pay', label: 'IME Pay', sortOrder: 4 },

    // Asset Types
    { category: 'ASSET_TYPE', code: 'helmet', label: 'Helmet', sortOrder: 1 },

    // Sticker Shapes
    { category: 'STICKER_SHAPE', code: 'circular', label: 'Circular', sortOrder: 1 },
    { category: 'STICKER_SHAPE', code: 'rectangular', label: 'Rectangular', sortOrder: 2 },

    // Campaign Categories
    { category: 'CAMPAIGN_CATEGORY', code: 'food_beverage', label: 'Food & Beverage', sortOrder: 1 },
    { category: 'CAMPAIGN_CATEGORY', code: 'retail', label: 'Retail', sortOrder: 2 },
    { category: 'CAMPAIGN_CATEGORY', code: 'education', label: 'Education', sortOrder: 3 },
    { category: 'CAMPAIGN_CATEGORY', code: 'technology', label: 'Technology', sortOrder: 4 },
    { category: 'CAMPAIGN_CATEGORY', code: 'healthcare', label: 'Healthcare', sortOrder: 5 },
    { category: 'CAMPAIGN_CATEGORY', code: 'finance', label: 'Finance', sortOrder: 6 },
    { category: 'CAMPAIGN_CATEGORY', code: 'entertainment', label: 'Entertainment', sortOrder: 7 },
    { category: 'CAMPAIGN_CATEGORY', code: 'travel', label: 'Travel', sortOrder: 8 },

    // Document Types
    { category: 'DOCUMENT_TYPE', code: 'citizenship_id', label: 'Citizenship ID', sortOrder: 1 },
    { category: 'DOCUMENT_TYPE', code: 'driving_license', label: 'Driving License', sortOrder: 2 },
    { category: 'DOCUMENT_TYPE', code: 'vehicle_bluebook', label: 'Vehicle Bluebook', sortOrder: 3 },
    { category: 'DOCUMENT_TYPE', code: 'pan_certificate', label: 'PAN Certificate', sortOrder: 4 },
    { category: 'DOCUMENT_TYPE', code: 'business_registration', label: 'Business Registration', sortOrder: 5 },
    { category: 'DOCUMENT_TYPE', code: 'representative_id', label: 'Representative ID', sortOrder: 6 },
    { category: 'DOCUMENT_TYPE', code: 'profile_photo', label: 'Profile Photo', sortOrder: 7 },
    { category: 'DOCUMENT_TYPE', code: 'helmet_photo', label: 'Helmet Photo', sortOrder: 8 },

    // Rider Statuses
    { category: 'RIDER_STATUS', code: 'registered', label: 'Registered', sortOrder: 1 },
    { category: 'RIDER_STATUS', code: 'documents_submitted', label: 'Documents Submitted', sortOrder: 2 },
    { category: 'RIDER_STATUS', code: 'under_review', label: 'Under Review', sortOrder: 3 },
    { category: 'RIDER_STATUS', code: 'verified', label: 'Verified', sortOrder: 4 },
    { category: 'RIDER_STATUS', code: 'active', label: 'Active', sortOrder: 5 },
    { category: 'RIDER_STATUS', code: 'suspended', label: 'Suspended', sortOrder: 6 },
    { category: 'RIDER_STATUS', code: 'inactive', label: 'Inactive', sortOrder: 7 },
    { category: 'RIDER_STATUS', code: 'rejected', label: 'Rejected', sortOrder: 8 },
    { category: 'RIDER_STATUS', code: 'deactivated', label: 'Deactivated', sortOrder: 9 },

    // Business Statuses
    { category: 'BUSINESS_STATUS', code: 'registered', label: 'Registered', sortOrder: 1 },
    { category: 'BUSINESS_STATUS', code: 'documents_submitted', label: 'Documents Submitted', sortOrder: 2 },
    { category: 'BUSINESS_STATUS', code: 'under_review', label: 'Under Review', sortOrder: 3 },
    { category: 'BUSINESS_STATUS', code: 'verified', label: 'Verified', sortOrder: 4 },
    { category: 'BUSINESS_STATUS', code: 'active', label: 'Active', sortOrder: 5 },
    { category: 'BUSINESS_STATUS', code: 'suspended', label: 'Suspended', sortOrder: 6 },
    { category: 'BUSINESS_STATUS', code: 'inactive', label: 'Inactive', sortOrder: 7 },
    { category: 'BUSINESS_STATUS', code: 'rejected', label: 'Rejected', sortOrder: 8 },
    { category: 'BUSINESS_STATUS', code: 'deactivated', label: 'Deactivated', sortOrder: 9 },

    // Campaign Statuses
    { category: 'CAMPAIGN_STATUS', code: 'draft', label: 'Draft', sortOrder: 1 },
    { category: 'CAMPAIGN_STATUS', code: 'pending_approval', label: 'Pending Approval', sortOrder: 2 },
    { category: 'CAMPAIGN_STATUS', code: 'approved', label: 'Approved', sortOrder: 3 },
    { category: 'CAMPAIGN_STATUS', code: 'active', label: 'Active', sortOrder: 4 },
    { category: 'CAMPAIGN_STATUS', code: 'paused', label: 'Paused', sortOrder: 5 },
    { category: 'CAMPAIGN_STATUS', code: 'completed', label: 'Completed', sortOrder: 6 },
    { category: 'CAMPAIGN_STATUS', code: 'cancelled', label: 'Cancelled', sortOrder: 7 },
    { category: 'CAMPAIGN_STATUS', code: 'rejected', label: 'Rejected', sortOrder: 8 },

    // Rejection Reasons
    { category: 'REJECTION_REASON', code: 'blurry_photo', label: 'Blurry Photo', sortOrder: 1 },
    { category: 'REJECTION_REASON', code: 'expired_document', label: 'Expired Document', sortOrder: 2 },
    { category: 'REJECTION_REASON', code: 'wrong_document', label: 'Wrong Document', sortOrder: 3 },
    { category: 'REJECTION_REASON', code: 'name_mismatch', label: 'Name Mismatch', sortOrder: 4 },
    { category: 'REJECTION_REASON', code: 'incomplete', label: 'Incomplete', sortOrder: 5 },

    // Ride Sharing Platforms
    { category: 'RIDE_SHARING_PLATFORM', code: 'pathao', label: 'Pathao', sortOrder: 1 },
    { category: 'RIDE_SHARING_PLATFORM', code: 'indrive', label: 'InDrive', sortOrder: 2 },
    { category: 'RIDE_SHARING_PLATFORM', code: 'tootle', label: 'Tootle', sortOrder: 3 },
    { category: 'RIDE_SHARING_PLATFORM', code: 'yango', label: 'Yango', sortOrder: 4 },
  ];

  for (const dict of dictionaries) {
    await prisma.dictionary.upsert({
      where: {
        category_code: { category: dict.category, code: dict.code },
      },
      update: { label: dict.label, sortOrder: dict.sortOrder },
      create: dict,
    });
  }
  console.log(`✅ ${dictionaries.length} dictionary entries seeded.`);

  // ────────────────────────────────────────────────
  // 5. Default Zones — Kathmandu Valley with 5 wards
  // ────────────────────────────────────────────────
  const zones = [
    { code: 'KTM-NORTH', name: 'North KTM', region: 'Kathmandu Valley', latitude: 27.7372, longitude: 85.3240, radius: 5000 },
    { code: 'KTM-SOUTH', name: 'South KTM', region: 'Kathmandu Valley', latitude: 27.6785, longitude: 85.3206, radius: 5000 },
    { code: 'KTM-CENTRAL', name: 'Central KTM', region: 'Kathmandu Valley', latitude: 27.7103, longitude: 85.3222, radius: 4000 },
    { code: 'LALITPUR', name: 'Lalitpur', region: 'Kathmandu Valley', latitude: 27.6644, longitude: 85.3188, radius: 5000 },
    { code: 'BHAKTAPUR', name: 'Bhaktapur', region: 'Kathmandu Valley', latitude: 27.6710, longitude: 85.4298, radius: 4000 },
  ];

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { code: zone.code },
      update: { name: zone.name },
      create: zone,
    });
  }
  console.log(`✅ ${zones.length} zones seeded (Kathmandu Valley).`);

  // ────────────────────────────────────────────────
  // 6. Helmet Advertising Channel
  // ────────────────────────────────────────────────
  await prisma.advertisingChannel.upsert({
    where: { code: 'CMM_005_LIVE' },
    update: {},
    create: {
      code: 'CMM_005_LIVE',
      name: 'Helmet Advertising',
      description: 'Physical helmet sticker advertising for ride-sharing riders',
      type: 'physical',
      status: 'active',
      costModel: 'daily_rate',
      minBudget: 5000,
      metadata: {
        assetType: 'helmet',
        stickerShapes: ['circular', 'rectangular'],
        targetPlatforms: ['pathao', 'indrive', 'tootle', 'yango'],
        coverageArea: 'Kathmandu Valley',
      },
    },
  });
  console.log('✅ Helmet advertising channel (CMM_005_LIVE) seeded.');

  console.log('\n🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
