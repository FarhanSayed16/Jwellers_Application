import 'bootstrap.dart';
import 'core/flavor/flavor_config.dart';

/// Acme Jewellers entrypoint.
/// Run: `flutter run --flavor acme -t lib/main_acme.dart`
Future<void> main() => bootstrap(FlavorConfig.acme());
