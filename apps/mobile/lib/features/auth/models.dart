class CustomerProfile {
  const CustomerProfile({
    required this.id,
    required this.phone,
    required this.name,
  });

  final String id;
  final String phone;
  final String name;

  factory CustomerProfile.fromJson(Map<String, dynamic> json) => CustomerProfile(
        id: json['id']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
      );

  CustomerProfile copyWith({String? name}) => CustomerProfile(
        id: id,
        phone: phone,
        name: name ?? this.name,
      );
}

class OtpRequestResult {
  const OtpRequestResult({
    required this.ok,
    required this.phone,
    required this.expiresInSeconds,
    required this.cooldownSeconds,
    this.devOtp,
  });

  final bool ok;
  final String phone;
  final int expiresInSeconds;
  final int cooldownSeconds;
  final String? devOtp;

  factory OtpRequestResult.fromJson(Map<String, dynamic> json) => OtpRequestResult(
        ok: json['ok'] == true,
        phone: json['phone']?.toString() ?? '',
        expiresInSeconds: (json['expiresInSeconds'] as num?)?.toInt() ?? 300,
        cooldownSeconds: (json['cooldownSeconds'] as num?)?.toInt() ?? 30,
        devOtp: json['devOtp']?.toString(),
      );
}

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.customer,
  });

  final String accessToken;
  final String refreshToken;
  final CustomerProfile customer;
}

class EnquiryDto {
  const EnquiryDto({
    required this.id,
    required this.itemId,
    required this.message,
    required this.status,
    required this.channel,
    required this.createdAt,
  });

  final String id;
  final String? itemId;
  final String message;
  final String status;
  final String channel;
  final DateTime createdAt;

  factory EnquiryDto.fromJson(Map<String, dynamic> json) => EnquiryDto(
        id: json['id']?.toString() ?? '',
        itemId: json['itemId']?.toString(),
        message: json['message']?.toString() ?? '',
        status: json['status']?.toString() ?? 'new',
        channel: json['channel']?.toString() ?? 'app',
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
            DateTime.now(),
      );
}

class WishlistEntry {
  const WishlistEntry({
    required this.id,
    required this.itemId,
    required this.addedAt,
    required this.sku,
    required this.title,
    required this.primaryImageUrl,
    required this.metal,
    required this.purity,
  });

  final String id;
  final String itemId;
  final DateTime addedAt;
  final String sku;
  final String title;
  final String primaryImageUrl;
  final String metal;
  final String purity;

  factory WishlistEntry.fromJson(Map<String, dynamic> json) {
    final item = json['item'];
    final map = item is Map ? Map<String, dynamic>.from(item) : <String, dynamic>{};
    return WishlistEntry(
      id: json['id']?.toString() ?? '',
      itemId: json['itemId']?.toString() ?? map['id']?.toString() ?? '',
      addedAt: DateTime.tryParse(json['addedAt']?.toString() ?? '') ?? DateTime.now(),
      sku: map['sku']?.toString() ?? '',
      title: map['title']?.toString() ?? 'Item',
      primaryImageUrl: map['primaryImageUrl']?.toString() ?? '',
      metal: map['metal']?.toString() ?? '',
      purity: map['purity']?.toString() ?? '',
    );
  }
}

class CustomRequestDto {
  const CustomRequestDto({
    required this.id,
    required this.description,
    required this.referenceImageUrls,
    required this.budgetHint,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String description;
  final List<String> referenceImageUrls;
  final String? budgetHint;
  final String status;
  final DateTime createdAt;

  factory CustomRequestDto.fromJson(Map<String, dynamic> json) => CustomRequestDto(
        id: json['id']?.toString() ?? '',
        description: json['description']?.toString() ?? '',
        referenceImageUrls: (json['referenceImageUrls'] as List?)
                ?.map((e) => e.toString())
                .toList() ??
            const [],
        budgetHint: json['budgetHint']?.toString(),
        status: json['status']?.toString() ?? 'new',
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
            DateTime.now(),
      );
}

/// Normalize India mobile to E.164-ish digits the API accepts.
String normalizeIndiaPhone(String raw) {
  var digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.startsWith('91') && digits.length == 12) {
    return '+$digits';
  }
  if (digits.length == 10) {
    return '+91$digits';
  }
  if (raw.trim().startsWith('+')) {
    return '+$digits';
  }
  return digits.isEmpty ? raw.trim() : '+$digits';
}

bool isValidIndiaMobile(String normalized) {
  final digits = normalized.replaceAll(RegExp(r'\D'), '');
  return RegExp(r'^91[6-9]\d{9}$').hasMatch(digits);
}
