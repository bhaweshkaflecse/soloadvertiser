/**
 * Solo Advertiser SDK — Public API client (placeholder).
 *
 * This package will provide a typed SDK for external integrations
 * with the Solo Advertiser platform API.
 */

export const SDK_VERSION = '0.0.0';

export interface SdkConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

/**
 * Placeholder SDK client class.
 */
export class SoloAdvertiserSdk {
  constructor(private readonly config: SdkConfig) {}

  getConfig(): SdkConfig {
    return { ...this.config };
  }
}
