import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../flavor/flavor_config.dart';
import '../storage/secure_storage.dart';
import 'api_exception.dart';
import 'auth_interceptor.dart';

final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => SecureStorageService(),
);

final tokenStoreProvider = Provider<TokenStore>(
  (ref) => TokenStore(ref.watch(secureStorageProvider)),
);

final dioProvider = Provider<Dio>((ref) {
  final flavor = FlavorConfig.instance;
  final tokenStore = ref.watch(tokenStoreProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: flavor.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ),
  );

  Future<bool> refresh(String refreshToken) async {
    try {
      final bare = Dio(
        BaseOptions(
          baseUrl: flavor.apiBaseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 30),
        ),
      );
      final res = await bare.post<Map<String, dynamic>>(
        '/auth/customer/token/refresh',
        data: {'refreshToken': refreshToken},
      );
      final body = res.data;
      final data = body?['data'];
      if (data is! Map<String, dynamic>) return false;
      final access = data['accessToken']?.toString();
      final nextRefresh = data['refreshToken']?.toString();
      if (access == null || nextRefresh == null) return false;
      await tokenStore.saveTokens(
        accessToken: access,
        refreshToken: nextRefresh,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  dio.interceptors.add(
    AuthInterceptor(dio: dio, tokenStore: tokenStore, refresh: refresh),
  );

  return dio;
});

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(dioProvider)),
);

class ApiClient {
  ApiClient(this._dio);

  final Dio _dio;

  Future<T> getData<T>(
    String path, {
    Map<String, dynamic>? query,
    T Function(Object? json)? parse,
  }) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(path, queryParameters: query);
      return _unwrap(res.data, parse);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<T> postData<T>(
    String path, {
    Object? body,
    T Function(Object? json)? parse,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(path, data: body);
      return _unwrap(res.data, parse);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<T> putData<T>(
    String path, {
    Object? body,
    T Function(Object? json)? parse,
  }) async {
    try {
      final res = await _dio.put<Map<String, dynamic>>(path, data: body);
      return _unwrap(res.data, parse);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<T> deleteData<T>(
    String path, {
    Object? body,
    T Function(Object? json)? parse,
  }) async {
    try {
      final res = await _dio.delete<Map<String, dynamic>>(path, data: body);
      return _unwrap(res.data, parse);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  T _unwrap<T>(Map<String, dynamic>? body, T Function(Object? json)? parse) {
    if (body == null) {
      throw ApiException(code: 'EMPTY', message: 'Empty response');
    }
    if (body['success'] != true) {
      final error = body['error'];
      if (error is Map<String, dynamic>) {
        throw ApiException(
          code: error['code']?.toString() ?? 'API_ERROR',
          message: error['message']?.toString() ?? 'Request failed',
          details: error['details'],
        );
      }
      throw ApiException(code: 'API_ERROR', message: 'Request failed');
    }
    final data = body['data'];
    if (parse != null) return parse(data);
    return data as T;
  }
}
