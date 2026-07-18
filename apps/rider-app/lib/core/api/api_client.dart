// Solo Advertiser — Rider App
// HTTP client built on Dio with interceptors for auth and error handling
// Provides typed request methods for all API endpoints

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../auth/token_storage.dart';
import 'api_interceptor.dart';

/// Centralized API client for all HTTP requests
/// Configured with base URL, timeouts, and auth interceptors
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
        },
      ),
    );

    // Add interceptors in order
    _dio.interceptors.addAll([
      AuthInterceptor(tokenStorage: _tokenStorage, dio: _dio),
      LogInterceptor(
        requestBody: AppConfig.instance.isDevelopment,
        responseBody: AppConfig.instance.isDevelopment,
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
    );
  }
}

/// Riverpod provider for the API client
final apiClientProvider = Provider<ApiClient>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return ApiClient(tokenStorage: tokenStorage);
});
