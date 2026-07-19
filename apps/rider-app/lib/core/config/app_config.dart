// Solo Advertiser — Rider App
// Environment configuration management
// Reads environment-specific values for API, socket, and feature flags

/// Application configuration loaded at startup
/// Supports development, staging, and production environments
class AppConfig {
  static late final AppConfig _instance;

  final String apiBaseUrl;
  final String socketUrl;
  final String environment;
  final bool enableAnalytics;
  final bool enableCrashReporting;
  final String googleMapsApiKey;
  final Duration tokenRefreshThreshold;

  AppConfig._({
    required this.apiBaseUrl,
    required this.socketUrl,
    required this.environment,
    required this.enableAnalytics,
    required this.enableCrashReporting,
    required this.googleMapsApiKey,
    required this.tokenRefreshThreshold,
  });

  static AppConfig get instance => _instance;

  /// Initialize configuration from environment
  /// Called once at app startup before widget tree is built
  static Future<void> initialize() async {
    // In production, these come from --dart-define or .env file
    const env = String.fromEnvironment('ENV', defaultValue: 'development');

    _instance = AppConfig._(
      apiBaseUrl: _getApiUrl(env),
      socketUrl: _getSocketUrl(env),
      environment: env,
      enableAnalytics: env == 'production',
      enableCrashReporting: env != 'development',
      googleMapsApiKey: const String.fromEnvironment('GOOGLE_MAPS_KEY', defaultValue: ''),
      tokenRefreshThreshold: const Duration(minutes: 5),
    );
  }

  static String _getApiUrl(String env) {
    switch (env) {
      case 'production':
        return 'https://api.soloadvertiser.com/v1';
      case 'staging':
        return 'https://staging-api.soloadvertiser.com/v1';
      default:
        return 'http://localhost:3000/v1';
    }
  }

  static String _getSocketUrl(String env) {
    switch (env) {
      case 'production':
        return 'wss://ws.soloadvertiser.com';
      case 'staging':
        return 'wss://staging-ws.soloadvertiser.com';
      default:
        return 'ws://localhost:3001';
    }
  }

  bool get isDevelopment => environment == 'development';
  bool get isStaging => environment == 'staging';
  bool get isProduction => environment == 'production';
}
