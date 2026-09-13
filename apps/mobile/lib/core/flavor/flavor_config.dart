/// Compile-time / entrypoint flavor constants for each white-label client.
class FlavorConfig {
  FlavorConfig._({
    required this.slug,
    required this.appName,
    required this.apiBaseUrl,
    required this.applicationIdHint,
  });

  final String slug;
  final String appName;
  final String apiBaseUrl;
  final String applicationIdHint;

  static FlavorConfig? _instance;

  static FlavorConfig get instance {
    final current = _instance;
    if (current == null) {
      throw StateError('FlavorConfig.init must be called before runApp');
    }
    return current;
  }

  static bool get isInitialized => _instance != null;

  static void init(FlavorConfig config) {
    _instance = config;
  }

  static FlavorConfig demo({String? apiBaseUrl}) => FlavorConfig._(
        slug: 'demo',
        appName: 'Demo Jewellers',
        apiBaseUrl: apiBaseUrl ??
            const String.fromEnvironment(
              'API_BASE_URL',
              defaultValue: 'https://g6xrghvh-4000.inc1.devtunnels.ms/api/v1',
            ),
        applicationIdHint: 'com.yourco.demojewellers',
      );

  static FlavorConfig ratnaraj({String? apiBaseUrl}) => FlavorConfig._(
        slug: 'ratnaraj',
        appName: 'Ratnaraj Jewellers',
        apiBaseUrl: apiBaseUrl ??
            const String.fromEnvironment(
              'API_BASE_URL',
              defaultValue: 'https://g6xrghvh-4000.inc1.devtunnels.ms/api/v1',
            ),
        applicationIdHint: 'com.ratnaraj.jewellers',
      );

  static FlavorConfig acme({String? apiBaseUrl}) => FlavorConfig._(
        slug: 'acme',
        appName: 'Acme Jewellers',
        apiBaseUrl: apiBaseUrl ??
            const String.fromEnvironment(
              'API_BASE_URL',
              defaultValue: 'https://g6xrghvh-4000.inc1.devtunnels.ms/api/v1',
            ),
        applicationIdHint: 'com.acme.jewellers',
      );

}
