/**
 * Distribution module interfaces — CTX-017
 * Distribution center types, print partner capabilities.
 */

/**
 * Distribution center types.
 */
export enum DistributionCenterType {
  COLLECTION_POINT = 'collection_point',
  INSTALLATION_CENTER = 'installation_center',
  COORDINATION_HUB = 'coordination_hub',
}

/**
 * Print partner capabilities.
 */
export const PRINT_CAPABILITIES = [
  'vinyl_wrap',
  'sticker_printing',
  'fabric_printing',
  'banner_printing',
  'large_format',
  'vehicle_wrap',
  'helmet_sticker',
  'jacket_print',
  'tshirt_print',
] as const;

/**
 * Distribution center status values.
 */
export enum CenterStatus {
  ACTIVE = 'active',
  TEMPORARILY_CLOSED = 'temporarily_closed',
  PERMANENTLY_CLOSED = 'permanently_closed',
}

/**
 * Print partner status values.
 */
export enum PrintPartnerStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}
