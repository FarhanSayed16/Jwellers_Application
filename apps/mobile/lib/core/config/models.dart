class ThemeTokens {
  const ThemeTokens({
    required this.primary,
    required this.secondary,
    required this.accent,
    required this.background,
    required this.surface,
    required this.textPrimary,
    required this.textSecondary,
    required this.border,
    required this.success,
    required this.warning,
    required this.error,
  });

  final String primary;
  final String secondary;
  final String accent;
  final String background;
  final String surface;
  final String textPrimary;
  final String textSecondary;
  final String border;
  final String success;
  final String warning;
  final String error;

  factory ThemeTokens.fromJson(Map<String, dynamic> json) {
    String req(String key) => json[key]?.toString() ?? '#000000';
    return ThemeTokens(
      primary: req('primary'),
      secondary: req('secondary'),
      accent: req('accent'),
      background: req('background'),
      surface: req('surface'),
      textPrimary: req('textPrimary'),
      textSecondary: req('textSecondary'),
      border: req('border'),
      success: req('success'),
      warning: req('warning'),
      error: req('error'),
    );
  }
}

class PublicShopConfig {
  const PublicShopConfig({
    required this.clientSlug,
    required this.shopName,
    required this.logoUrl,
    required this.contactPhone,
    required this.themeLight,
    required this.themeDark,
    this.fontsDisplay,
    this.fontsBody,
    this.source,
    this.makingChargeDefault = const MakingChargeDefault(type: 'percent', value: 12),
    this.gstPercentDefault = 3,
    this.socialWhatsapp,
    this.bisRegistrationNumber,
    this.gstNumber,
    this.privacyPolicyUrl,
    this.termsOfUseUrl,
    this.deleteAccountUrl,
    this.supportEmail,
    this.appUpdate = const AppUpdateInfo(),
  });

  final String clientSlug;
  final String shopName;
  final String logoUrl;
  final String contactPhone;
  final ThemeTokens themeLight;
  final ThemeTokens themeDark;
  final String? fontsDisplay;
  final String? fontsBody;
  final String? source;
  final MakingChargeDefault makingChargeDefault;
  final double gstPercentDefault;
  final String? socialWhatsapp;
  final String? bisRegistrationNumber;
  final String? gstNumber;
  final String? privacyPolicyUrl;
  final String? termsOfUseUrl;
  final String? deleteAccountUrl;
  final String? supportEmail;
  final AppUpdateInfo appUpdate;

  factory PublicShopConfig.fromJson(Map<String, dynamic> json) {
    final fonts = json['fonts'];
    final making = json['makingChargeDefault'];
    final social = json['socialLinks'];
    final update = json['appUpdate'];
    return PublicShopConfig(
      clientSlug: json['clientSlug']?.toString() ?? 'demo',
      shopName: json['shopName']?.toString() ?? 'Jewellers',
      logoUrl: json['logoUrl']?.toString() ?? '',
      contactPhone: json['contactPhone']?.toString() ?? '',
      themeLight: ThemeTokens.fromJson(
        Map<String, dynamic>.from(json['themeLight'] as Map? ?? {}),
      ),
      themeDark: ThemeTokens.fromJson(
        Map<String, dynamic>.from(json['themeDark'] as Map? ?? {}),
      ),
      fontsDisplay: fonts is Map ? fonts['display']?.toString() : null,
      fontsBody: fonts is Map ? fonts['body']?.toString() : null,
      source: json['source']?.toString(),
      makingChargeDefault: making is Map
          ? MakingChargeDefault(
              type: making['type']?.toString() ?? 'percent',
              value: (making['value'] as num?)?.toDouble() ?? 12,
            )
          : const MakingChargeDefault(type: 'percent', value: 12),
      gstPercentDefault: (json['gstPercentDefault'] as num?)?.toDouble() ?? 3,
      socialWhatsapp: social is Map ? social['whatsapp']?.toString() : null,
      bisRegistrationNumber: json['bisRegistrationNumber']?.toString(),
      gstNumber: json['gstNumber']?.toString(),
      privacyPolicyUrl: json['privacyPolicyUrl']?.toString(),
      termsOfUseUrl: json['termsOfUseUrl']?.toString(),
      deleteAccountUrl: json['deleteAccountUrl']?.toString(),
      supportEmail: json['supportEmail']?.toString(),
      appUpdate: update is Map
          ? AppUpdateInfo.fromJson(Map<String, dynamic>.from(update))
          : const AppUpdateInfo(),
    );
  }
}

class AppUpdateInfo {
  const AppUpdateInfo({
    this.minVersion = '1.0.0',
    this.latestVersion = '1.0.0',
    this.forceUpdate = false,
    this.storeUrlAndroid,
    this.storeUrlIos,
  });

  final String minVersion;
  final String latestVersion;
  final bool forceUpdate;
  final String? storeUrlAndroid;
  final String? storeUrlIos;

  factory AppUpdateInfo.fromJson(Map<String, dynamic> json) {
    return AppUpdateInfo(
      minVersion: json['minVersion']?.toString() ?? '1.0.0',
      latestVersion: json['latestVersion']?.toString() ?? '1.0.0',
      forceUpdate: json['forceUpdate'] == true,
      storeUrlAndroid: json['storeUrlAndroid']?.toString(),
      storeUrlIos: json['storeUrlIos']?.toString(),
    );
  }
}

class MakingChargeDefault {
  const MakingChargeDefault({required this.type, required this.value});

  final String type;
  final double value;
}

class FeatureFlags {
  const FeatureFlags({
    required this.chat,
    required this.whatsapp,
    required this.rateHistory,
    required this.sizeGuide,
    required this.offers,
    required this.customRequests,
    required this.hallmark,
    this.digitalBilling = false,
    this.razorpayPayments = false,
    this.oldGoldExchange = false,
    this.itemQr = false,
    this.shareRateCard = false,
    this.appointments = false,
    this.storeMode = false,
    this.curatedBoards = false,
    this.analytics = false,
    this.crmLight = false,
    this.schemes = false,
    this.referrals = false,
    this.priceAlerts = false,
    this.whatsappBusinessApi = false,
  });

  final bool chat;
  final bool whatsapp;
  final bool rateHistory;
  final bool sizeGuide;
  final bool offers;
  final bool customRequests;
  final bool hallmark;
  final bool digitalBilling;
  final bool razorpayPayments;
  final bool oldGoldExchange;
  final bool itemQr;
  final bool shareRateCard;
  final bool appointments;
  final bool storeMode;
  final bool curatedBoards;
  final bool analytics;
  final bool crmLight;
  final bool schemes;
  final bool referrals;
  final bool priceAlerts;
  final bool whatsappBusinessApi;

  factory FeatureFlags.fromJson(Map<String, dynamic> json) {
    bool flag(String key) => json[key] == true;
    return FeatureFlags(
      chat: flag('chat'),
      whatsapp: flag('whatsapp'),
      rateHistory: flag('rateHistory'),
      sizeGuide: flag('sizeGuide'),
      offers: flag('offers'),
      customRequests: flag('customRequests'),
      hallmark: flag('hallmark'),
      digitalBilling: flag('digitalBilling'),
      razorpayPayments: flag('razorpayPayments'),
      oldGoldExchange: flag('oldGoldExchange'),
      itemQr: flag('itemQr'),
      shareRateCard: flag('shareRateCard'),
      appointments: flag('appointments'),
      storeMode: flag('storeMode'),
      curatedBoards: flag('curatedBoards'),
      analytics: flag('analytics'),
      crmLight: flag('crmLight'),
      schemes: flag('schemes'),
      referrals: flag('referrals'),
      priceAlerts: flag('priceAlerts'),
      whatsappBusinessApi: flag('whatsappBusinessApi'),
    );
  }

  FeatureFlags copyWith({bool? chat}) => FeatureFlags(
        chat: chat ?? this.chat,
        whatsapp: whatsapp,
        rateHistory: rateHistory,
        sizeGuide: sizeGuide,
        offers: offers,
        customRequests: customRequests,
        hallmark: hallmark,
        digitalBilling: digitalBilling,
        razorpayPayments: razorpayPayments,
        oldGoldExchange: oldGoldExchange,
        itemQr: itemQr,
        shareRateCard: shareRateCard,
        appointments: appointments,
        storeMode: storeMode,
        curatedBoards: curatedBoards,
        analytics: analytics,
        crmLight: crmLight,
        schemes: schemes,
        referrals: referrals,
        priceAlerts: priceAlerts,
        whatsappBusinessApi: whatsappBusinessApi,
      );
}
