import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/providers.dart';
import '../../features/about/about_screens.dart';
import '../../features/account/account_screen.dart';
import '../../features/legal/legal_screens.dart';
import '../../features/auth/otp_route_extra.dart';
import '../../features/auth/otp_screen.dart';
import '../../features/auth/phone_screen.dart';
import '../../features/billing/invoices_screen.dart';
import '../../features/calculator/calculator_screen.dart';
import '../../features/chat/chat_screens.dart';
import '../../features/collection/collection_screen.dart';
import '../../features/custom_requests/custom_request_screens.dart';
import '../../features/enquiry/enquiry_screens.dart';
import '../../features/home/home_screen.dart';
import '../../features/item/item_by_sku_screen.dart';
import '../../features/item/item_detail_screen.dart';
import '../../features/appointments/appointment_book_screen.dart';
import '../../features/growth/price_alerts_screen.dart';
import '../../features/growth/referrals_screen.dart';
import '../../features/notifications/notification_prime_screen.dart';
import '../../features/offers/offers_screen.dart';
import '../../features/old_gold/old_gold_screen.dart';
import '../../features/payments/pay_advance_screen.dart';

import '../../features/rates/rate_history_screen.dart';
import '../../features/search/search_screen.dart';
import '../../features/shell/main_shell.dart';
import '../../features/size_guide/size_guide_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/store/store_mode_screen.dart';
import '../../features/wishlist/wishlist_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  ref.watch(featuresProvider.select((v) => v.valueOrNull?.chat));

  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/notifications/prime',
        builder: (context, state) => const NotificationPrimeScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/collection',
            builder: (context, state) => const CollectionScreen(),
            routes: [
              GoRoute(
                path: ':categoryId',
                builder: (context, state) => CategoryBrowseScreen(
                  categoryId: state.pathParameters['categoryId']!,
                ),
                routes: [
                  GoRoute(
                    path: ':subId',
                    builder: (context, state) => ItemGridScreen(
                      title: 'Items',
                      categoryId: state.pathParameters['categoryId'],
                      subcategoryId: state.pathParameters['subId'],
                    ),
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: '/calculator',
            builder: (context, state) => const CalculatorScreen(),
          ),
          GoRoute(
            path: '/old-gold',
            builder: (context, state) => const OldGoldScreen(),
          ),
          GoRoute(
            path: '/pay-advance',
            builder: (context, state) => const PayAdvanceScreen(),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => const ChatListScreen(),
            routes: [
              GoRoute(
                path: ':threadId',
                builder: (context, state) => ChatThreadScreen(
                  threadId: state.pathParameters['threadId']!,
                ),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/items/:id',
        builder: (context, state) =>
            ItemDetailScreen(itemId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/items/sku/:sku',
        builder: (context, state) =>
            ItemBySkuScreen(sku: state.pathParameters['sku']!),
      ),
      GoRoute(
        path: '/appointments/book',
        builder: (context, state) => const AppointmentBookScreen(),
      ),
      GoRoute(
        path: '/referrals',
        builder: (context, state) => const ReferralsScreen(),
      ),
      GoRoute(
        path: '/price-alerts',
        builder: (context, state) => const PriceAlertsScreen(),
      ),
      GoRoute(
        path: '/store-mode',
        builder: (context, state) => const StoreModeScreen(),
      ),
      GoRoute(
        path: '/rates/history',
        builder: (context, state) => const RateHistoryScreen(),
      ),
      GoRoute(
        path: '/size-guide',
        builder: (context, state) => const SizeGuideScreen(),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/auth/phone',
        builder: (context, state) => PhoneAuthScreen(
          returnTo: state.uri.queryParameters['returnTo'],
        ),
      ),
      GoRoute(
        path: '/auth/otp',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is OtpRouteExtra) {
            return OtpAuthScreen(
              phone: extra.phone,
              returnTo: extra.returnTo,
              cooldownSeconds: extra.cooldownSeconds,
              devOtp: extra.devOtp,
            );
          }
          // Fallback: phone/cooldown/returnTo from query only — never read devOtp from URL.
          final phone = state.uri.queryParameters['phone'] ?? '';
          return OtpAuthScreen(
            phone: phone,
            returnTo: state.uri.queryParameters['returnTo'],
            cooldownSeconds:
                int.tryParse(state.uri.queryParameters['cooldown'] ?? '') ?? 30,
          );
        },
      ),
      GoRoute(
        path: '/invoices',
        builder: (context, state) => const InvoicesScreen(),
      ),
      GoRoute(
        path: '/account',
        builder: (context, state) => const AccountScreen(),
      ),
      GoRoute(
        path: '/wishlist',
        builder: (context, state) => const WishlistScreen(),
      ),
      GoRoute(
        path: '/enquiries',
        builder: (context, state) => const EnquiriesScreen(),
      ),
      GoRoute(
        path: '/custom-requests',
        builder: (context, state) => const CustomRequestsScreen(),
        routes: [
          GoRoute(
            path: 'new',
            builder: (context, state) => const NewCustomRequestScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/offers',
        builder: (context, state) => const OffersScreen(),
      ),
      GoRoute(
        path: '/about',
        builder: (context, state) => const AboutScreen(),
      ),
      GoRoute(
        path: '/settings/theme',
        builder: (context, state) => const _ThemeSettingsScreen(),
      ),
      GoRoute(
        path: '/legal/privacy',
        builder: (context, state) => const PrivacyScreen(),
      ),
      GoRoute(
        path: '/legal/terms',
        builder: (context, state) => const TermsScreen(),
      ),
      GoRoute(
        path: '/account/delete',
        builder: (context, state) => const DeleteAccountScreen(),
      ),
    ],
  );
});

class _ThemeSettingsScreen extends ConsumerWidget {
  const _ThemeSettingsScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeModeProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Theme')),
      body: RadioGroup<ThemeMode>(
        groupValue: mode,
        onChanged: (value) {
          if (value != null) {
            ref.read(themeModeProvider.notifier).state = value;
          }
        },
        child: const Column(
          children: [
            RadioListTile<ThemeMode>(
              title: Text('System'),
              value: ThemeMode.system,
            ),
            RadioListTile<ThemeMode>(
              title: Text('Light'),
              value: ThemeMode.light,
            ),
            RadioListTile<ThemeMode>(
              title: Text('Dark'),
              value: ThemeMode.dark,
            ),
          ],
        ),
      ),
    );
  }
}
