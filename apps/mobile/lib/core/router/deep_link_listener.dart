import 'package:app_links/app_links.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_router.dart';

/// Listens for `jwellers://items/sku/...` (and https path equivalents).
class DeepLinkListener extends ConsumerStatefulWidget {
  const DeepLinkListener({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<DeepLinkListener> createState() => _DeepLinkListenerState();
}

class _DeepLinkListenerState extends ConsumerState<DeepLinkListener> {
  final _appLinks = AppLinks();

  @override
  void initState() {
    super.initState();
    _appLinks.getInitialLink().then(_open);
    _appLinks.uriLinkStream.listen(_open);
  }

  void _open(Uri? uri) {
    if (uri == null) return;
    final route = deepLinkToRoute(uri);
    if (route == null) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(appRouterProvider).go(route);
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

String? deepLinkToRoute(Uri uri) {
  // jwellers://items/sku/SKU
  if (uri.host == 'items' && uri.pathSegments.length >= 2 && uri.pathSegments.first == 'sku') {
    return '/items/sku/${Uri.decodeComponent(uri.pathSegments[1])}';
  }
  // /items/sku/SKU (https or path-only)
  if (uri.pathSegments.length >= 3 &&
      uri.pathSegments[0] == 'items' &&
      uri.pathSegments[1] == 'sku') {
    return '/items/sku/${Uri.decodeComponent(uri.pathSegments[2])}';
  }
  return null;
}
