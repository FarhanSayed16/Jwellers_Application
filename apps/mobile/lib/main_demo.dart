import 'bootstrap.dart';
import 'core/flavor/flavor_config.dart';

/// Demo Jewellers entrypoint.
/// Run: `flutter run --flavor demo -t lib/main_demo.dart`
Future<void> main() => bootstrap(FlavorConfig.demo());
