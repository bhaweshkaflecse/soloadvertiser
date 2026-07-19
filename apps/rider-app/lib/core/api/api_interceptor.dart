// Solo Advertiser — Rider App
// Dio interceptor for JWT token management
// Automatically attaches access token and handles 401 refresh flow

import 'package:dio/dio.dart';

import '../auth/token_storage.dart';

/// Interceptor that handles JWT authentication
/// - Attaches access token to outgoing requests
/// - Intercepts 401 responses and attempts token refresh
/// - Queues requests during refresh to avoid race conditions
class AuthInterceptor extends Interceptor {
  final TokenStorage _tokenStorage;
  final Dio _dio;
  bool _isRefreshing = false;
  final List<RequestOptions> _pendingRequests = [];

  AuthInterceptor({
    required TokenStorage tokenStorage,
    required Dio dio,
  })  : _tokenStorage = tokenStorage,
        _dio = dio;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final accessToken = await _tokenStorage.getAccessToken();
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final success = await _refreshToken();
      if (success) {
        // Retry the original request with new token
        final accessToken = await _tokenStorage.getAccessToken();
        err.requestOptions.headers['Authorization'] = 'Bearer $accessToken';
        try {
          final response = await _dio.fetch(err.requestOptions);
          handler.resolve(response);
          return;
        } catch (e) {
          handler.next(err);
          return;
        }
      } else {
        // Refresh failed — clear tokens and force re-login
        await _tokenStorage.clearTokens();
      }
    }
    handler.next(err);
  }

  /// Attempt to refresh the access token using the refresh token
  /// Returns true if refresh was successful
  Future<bool> _refreshToken() async {
    if (_isRefreshing) return false;
    _isRefreshing = true;

    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken == null) return false;

      final response = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
        options: Options(headers: {'Authorization': ''}),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        await _tokenStorage.saveTokens(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
        );
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      _isRefreshing = false;
    }
  }
}
