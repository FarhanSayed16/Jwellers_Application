import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/flavor/flavor_config.dart';
import 'package:mobile/core/theme/app_theme.dart';

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  test('demo flavor constants', () {
    final flavor =
        FlavorConfig.demo(apiBaseUrl: 'http://localhost:4000/api/v1');
    expect(flavor.slug, 'demo');
    expect(flavor.appName, 'Demo Jewellers');
    expect(flavor.applicationIdHint, 'com.yourco.demojewellers');
  });

  test('bootstrap theme uses demo primary', () {
    final theme = bootstrapLightTheme();
    expect(theme.colorScheme.primary, parseBrandColor('#1F4B3F'));
  });
}
