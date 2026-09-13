import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/providers.dart';

/// Bottom tab shell. Chat destination only when FEATURE_CHAT is true.
class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.child});

  final Widget child;

  static const _alwaysTabs = <_TabSpec>[
    _TabSpec(path: '/home', label: 'Home', icon: Icons.home_outlined, selected: Icons.home),
    _TabSpec(
      path: '/collection',
      label: 'Collection',
      icon: Icons.grid_view_outlined,
      selected: Icons.grid_view,
    ),
    _TabSpec(
      path: '/calculator',
      label: 'Calculator',
      icon: Icons.calculate_outlined,
      selected: Icons.calculate,
    ),
  ];

  static const _chatTab = _TabSpec(
    path: '/chat',
    label: 'Chat',
    icon: Icons.chat_bubble_outline,
    selected: Icons.chat_bubble,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatEnabled = ref.watch(featuresProvider).valueOrNull?.chat ?? false;
    final tabs = [
      ..._alwaysTabs,
      if (chatEnabled) _chatTab,
    ];

    final location = GoRouterState.of(context).uri.path;
    var selected = 0;
    for (var i = 0; i < tabs.length; i++) {
      if (location == tabs[i].path || location.startsWith('${tabs[i].path}/')) {
        selected = i;
        break;
      }
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selected,
        onDestinationSelected: (index) => context.go(tabs[index].path),
        destinations: [
          for (final tab in tabs)
            NavigationDestination(
              icon: Icon(tab.icon),
              selectedIcon: Icon(tab.selected),
              label: tab.label,
            ),
        ],
      ),
    );
  }
}

class _TabSpec {
  const _TabSpec({
    required this.path,
    required this.label,
    required this.icon,
    required this.selected,
  });

  final String path;
  final String label;
  final IconData icon;
  final IconData selected;
}
