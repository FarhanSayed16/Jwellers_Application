import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/flavor/flavor_config.dart';

Future<void> bootstrap(FlavorConfig flavor) async {
  WidgetsFlutterBinding.ensureInitialized();
  FlavorConfig.init(flavor);
  runApp(const ProviderScope(child: JwellersApp()));
}
