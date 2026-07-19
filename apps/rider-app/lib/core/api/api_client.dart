// Solo Advertiser — Rider App
// HTTP client built on Dio with interceptors for auth, refresh, and error handling.
// Provides typed request methods for all API endpoints with response parsing.

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../auth/token_storage.dart';
import 'api_interceptor.dart';

/// Typed API response envelope matching backend format
class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;
  final Map<String, dynamic>? meta;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.meta,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromData,
  ) {
    return ApiResponse(
      success: json['success'] ?? true,
      data: json['data'] != null ? fromData(json['data']) : null,
      error: json['error'] != null ? ApiError.fromJson(json['error']) : null,
      meta: json['meta'] as Map<String, dynamic>?,
    );
  }
}

/// Structured error from API
class ApiError {
  final String code;
  final String message;
  final Map<String, dynamic>? details;

  ApiError({required this.code, required this.message, this.details});

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] ?? 'UNKNOWN',
      message: json['message'] ?? 'An error occurred',
      details: json['details'] as Map<String, dynamic>?,
    );
  }
}

/// Paginated response with meta information
class PaginatedResponse<T> extends ApiResponse<List<T>> {
  final int page;
  final int limit;
  final int total;
  final int totalPages;
  final bool hasNext;

  PaginatedResponse({
    required bool success,
    List<T>? data,
    ApiError? error,
    Map<String, dynamic>? meta,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
    required this.hasNext,
  }) : super(success: success, data: data, error: error, meta: meta);

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromItem,
  ) {
    final meta = json['meta'] as Map<String, dynamic>? ?? {};
    final dataList = (json['data'] as List?)?.map((e) => fromItem(e)).toList();

    return PaginatedResponse(
      success: json['success'] ?? true,
      data: dataList,
      error: json['error'] != null ? ApiError.fromJson(json['error']) : null,
      meta: meta,
      page: meta['page'] ?? 1,
      limit: meta['limit'] ?? 20,
      total: meta['total'] ?? 0,
      totalPages: meta['totalPages'] ?? 1,
      hasNext: meta['hasNext'] ?? false,
    );
  }
}

/// Centralized API client for all HTTP requests.
/// Configured with base URL, timeouts, token interceptor with refresh logic,
/// and typed response parsing.
class ApiClient {
  late final Dio _dio;
  final TokenStorage _tokenStorage;

  ApiClient({required TokenStorage tokenStorage}) : _tokenStorage = tokenStorage {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.instance.apiBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Platform': 'rider-app',
          'X-Client-Version': AppConfig.instance.appVersion,
        },
      ),
    );

    // Add interceptors in order: Auth first, then logging
    _dio.interceptors.addAll([
      AuthInterceptor(tokenStorage: _tokenStorage, dio: _dio),
      _RetryOnTokenRefreshInterceptor(tokenStorage: _tokenStorage, dio: _dio),
      if (AppConfig.instance.isDevelopment)
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          error: true,
        ),
    ]);
  }

  /// GET request with optional query parameters
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    );
  }

  /// POST request with body
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    );
  }

  /// PUT request with body
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    CancelToken? cancelToken,
  }) {
    return _dio.put<T>(path, data: data, cancelToken: cancelToken);
  }

  /// PATCH request with partial body
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    CancelToken? cancelToken,
  }) {
    return _dio.patch<T>(path, data: data, cancelToken: cancelToken);
  }

  /// DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    CancelToken? cancelToken,
  }) {
    return _dio.delete<T>(path, cancelToken: cancelToken);
  }

  /// Multipart file upload (for documents, photos)
  Future<Response<T>> upload<T>(
    String path, {
    required FormData formData,
    void Function(int, int)? onSendProgress,
    CancelToken? cancelToken,
  }) {
    return _dio.post<T>(
      path,
      data: formData,
      onSendProgress: onSendProgress,
      cancelToken: cancelToken,
      options: Options(
        headers: {'Content-Type': 'multipart/form-data'},
      ),
    );
  }

  /// Parse a typed API response from a Dio response
  ApiResponse<T> parseResponse<T>(
    Response response,
    T Function(dynamic) fromData,
  ) {
    final json = response.data as Map<String, dynamic>;
    return ApiResponse.fromJson(json, fromData);
  }

  /// Parse a paginated API response from a Dio response
  PaginatedResponse<T> parsePaginatedResponse<T>(
    Response response,
    T Function(dynamic) fromItem,
  ) {
    final json = response.data as Map<String, dynamic>;
    return PaginatedResponse.fromJson(json, fromItem);
  }
}

/// Interceptor that retries failed requests after a successful token refresh
class _RetryOnTokenRefreshInterceptor extends Interceptor {
  final TokenStorage _tokenStorage;
  final Dio _dio;
  bool _isRefreshing = false;
  final List<Function> _pendingRequests = [];

  _RetryOnTokenRefreshInterceptor({
    required TokenStorage tokenStorage,
    required Dio dio,
  })  : _tokenStorage = tokenStorage,
        _dio = dio;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      if (!_isRefreshing) {
        _isRefreshing = true;
        try {
          final refreshToken = await _tokenStorage.getRefreshToken();
          if (refreshToken == null) {
            handler.next(err);
            return;
          }

          final response = await Dio().post(
            '${AppConfig.instance.apiBaseUrl}/auth/refresh',
            data: {'refreshToken': refreshToken},
          );

          if (response.statusCode == 200) {
            final newAccessToken = response.data['data']?['accessToken'] ?? response.data['accessToken'];
            final newRefreshToken = response.data['data']?['refreshToken'] ?? response.data['refreshToken'];

            await _tokenStorage.setAccessToken(newAccessToken);
            if (newRefreshToken != null) {
              await _tokenStorage.setRefreshToken(newRefreshToken);
            }

            // Retry pending requests
            for (final pending in _pendingRequests) {
              pending();
            }
            _pendingRequests.clear();

            // Retry the original request
            final opts = err.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccessToken';
            final retryResponse = await _dio.fetch(opts);
            handler.resolve(retryResponse);
          } else {
            await _tokenStorage.clear();
            handler.next(err);
          }
        } catch (e) {
          await _tokenStorage.clear();
          handler.next(err);
        } finally {
          _isRefreshing = false;
        }
      } else {
        // Queue the request while refresh is in progress
        handler.next(err);
      }
    } else {
      handler.next(err);
    }
  }
}

/// Riverpod provider for the API client
final apiClientProvider = Provider<ApiClient>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return ApiClient(tokenStorage: tokenStorage);
});
