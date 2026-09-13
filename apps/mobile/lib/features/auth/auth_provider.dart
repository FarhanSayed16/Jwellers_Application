import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/push/push_service.dart';
import '../wishlist/wishlist_provider.dart';
import 'models.dart';

final authProvider = AsyncNotifierProvider<AuthNotifier, CustomerProfile?>(
  AuthNotifier.new,
);

class AuthNotifier extends AsyncNotifier<CustomerProfile?> {
  @override
  Future<CustomerProfile?> build() async {
    final token = await ref.read(tokenStoreProvider).getAccessToken();
    if (token == null || token.isEmpty) return null;
    try {
      return await _fetchMe();
    } on ApiException {
      return null;
    }
  }

  Future<CustomerProfile> _fetchMe() {
    return ref.read(apiClientProvider).getData(
      '/auth/customer/me',
      parse: (json) =>
          CustomerProfile.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  Future<OtpRequestResult> requestOtp(String phone) {
    return ref.read(apiClientProvider).postData(
      '/auth/customer/otp/request',
      body: {'phone': phone},
      parse: (json) =>
          OtpRequestResult.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  Future<CustomerProfile> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    final data = await ref.read(apiClientProvider).postData<Map<String, dynamic>>(
      '/auth/customer/otp/verify',
      body: {
        'phone': phone,
        'otp': otp,
        'deviceInfo': 'flutter-mobile',
      },
      parse: (json) => Map<String, dynamic>.from(json as Map),
    );

    final access = data['accessToken']?.toString();
    final refresh = data['refreshToken']?.toString();
    final customerJson = data['customer'];
    if (access == null || refresh == null || customerJson is! Map) {
      throw ApiException(code: 'AUTH_INVALID', message: 'Invalid verify response');
    }

    await ref.read(tokenStoreProvider).saveTokens(
          accessToken: access,
          refreshToken: refresh,
        );

    final customer =
        CustomerProfile.fromJson(Map<String, dynamic>.from(customerJson));
    state = AsyncData(customer);
    await ref.read(wishlistIdsProvider.notifier).reload();
    await ref.read(pushServiceProvider).registerWithApiIfLoggedIn();
    return customer;
  }

  Future<void> logout() async {
    try {
      await ref.read(pushServiceProvider).unregisterCurrent();
    } catch (_) {}
    try {
      await ref.read(apiClientProvider).postData(
            '/auth/customer/logout',
            body: {},
            parse: (_) => null,
          );
    } catch (_) {
      // Still clear local session.
    }
    await ref.read(tokenStoreProvider).clear();
    state = const AsyncData(null);
    await ref.read(wishlistIdsProvider.notifier).reload();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(build);
  }

  bool get isLoggedIn => state.valueOrNull != null;
}
