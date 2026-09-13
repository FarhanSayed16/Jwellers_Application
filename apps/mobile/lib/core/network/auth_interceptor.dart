import 'dart:async';

import 'package:dio/dio.dart';
import 'package:uuid/uuid.dart';

import '../storage/secure_storage.dart';
import 'api_exception.dart';

/// Queues requests while a single refresh is in flight (401 → refresh → retry).
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required Dio dio,
    required TokenStore tokenStore,
    required Future<bool> Function(String refreshToken) refresh,
  })  : _dio = dio,
        _tokenStore = tokenStore,
        _refresh = refresh;

  final Dio _dio;
  final TokenStore _tokenStore;
  final Future<bool> Function(String refreshToken) _refresh;

  bool _refreshing = false;
  final List<_Pending> _queue = [];

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    options.headers.putIfAbsent('X-Request-Id', () => const Uuid().v4());
    final token = await _tokenStore.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    final path = err.requestOptions.path;
    if (path.contains('/auth/customer/token/refresh') ||
        path.contains('/auth/customer/otp/')) {
      return handler.next(err);
    }

    final refreshToken = await _tokenStore.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      await _tokenStore.clear();
      return handler.next(err);
    }

    final completer = Completer<Response<dynamic>>();
    _queue.add(_Pending(err.requestOptions, completer));

    if (!_refreshing) {
      _refreshing = true;
      try {
        final ok = await _refresh(refreshToken);
        if (!ok) {
          await _tokenStore.clear();
          final expired = DioException(
            requestOptions: err.requestOptions,
            response: err.response,
            type: err.type,
            error: 'SESSION_EXPIRED',
            message: 'Session expired. Sign in again to continue.',
          );
          for (final pending in _queue) {
            pending.completer.completeError(expired);
          }
        } else {
          for (final pending in _queue) {
            try {
              final token = await _tokenStore.getAccessToken();
              final opts = pending.options;
              if (token != null) {
                opts.headers['Authorization'] = 'Bearer $token';
              }
              final response = await _dio.fetch<dynamic>(opts);
              pending.completer.complete(response);
            } catch (e) {
              pending.completer.completeError(e);
            }
          }
        }
      } finally {
        _queue.clear();
        _refreshing = false;
      }
    }

    try {
      final response = await completer.future;
      handler.resolve(response);
    } catch (e) {
      if (e is DioException) {
        handler.next(e);
      } else {
        handler.next(err);
      }
    }
  }
}

class _Pending {
  _Pending(this.options, this.completer);

  final RequestOptions options;
  final Completer<Response<dynamic>> completer;
}

ApiException mapDioError(DioException err) {
  if (err.error == 'SESSION_EXPIRED' ||
      (err.message?.contains('Session expired') ?? false)) {
    return ApiException(
      code: 'SESSION_EXPIRED',
      message: 'Session expired. Sign in again to continue.',
      statusCode: 401,
    );
  }
  final data = err.response?.data;
  if (data is Map<String, dynamic>) {
    final error = data['error'];
    if (error is Map<String, dynamic>) {
      return ApiException(
        code: error['code']?.toString() ?? 'HTTP_ERROR',
        message: error['message']?.toString() ?? err.message ?? 'Request failed',
        statusCode: err.response?.statusCode,
        details: error['details'],
      );
    }
  }
  if (err.type == DioExceptionType.connectionTimeout ||
      err.type == DioExceptionType.receiveTimeout ||
      err.type == DioExceptionType.sendTimeout) {
    return ApiException(
      code: 'TIMEOUT',
      message: 'Request timed out. Check your connection and try again.',
      statusCode: err.response?.statusCode,
    );
  }
  if (err.type == DioExceptionType.connectionError) {
    return ApiException(
      code: 'NETWORK',
      message: 'Cannot reach the server. Is the API running?',
      statusCode: err.response?.statusCode,
    );
  }
  return ApiException(
    code: 'HTTP_ERROR',
    message: err.message ?? 'Request failed',
    statusCode: err.response?.statusCode,
  );
}
