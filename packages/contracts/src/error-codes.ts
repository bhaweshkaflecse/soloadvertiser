/**
 * Domain-prefixed error code constants.
 * Structure only — codes will be populated as features are implemented.
 */
export const ERROR_CODES = {
  AUTH: {
    UNAUTHORIZED: 'AUTH_001',
    FORBIDDEN: 'AUTH_002',
    TOKEN_EXPIRED: 'AUTH_003',
    INVALID_CREDENTIALS: 'AUTH_004',
  },
  VALIDATION: {
    INVALID_INPUT: 'VAL_001',
    MISSING_REQUIRED_FIELD: 'VAL_002',
  },
  RESOURCE: {
    NOT_FOUND: 'RES_001',
    ALREADY_EXISTS: 'RES_002',
    CONFLICT: 'RES_003',
  },
  SYSTEM: {
    INTERNAL_ERROR: 'SYS_001',
    SERVICE_UNAVAILABLE: 'SYS_002',
    DATABASE_ERROR: 'SYS_003',
  },
} as const;
