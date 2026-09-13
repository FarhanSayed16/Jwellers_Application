import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/models.dart';
import '../auth/soft_login_sheet.dart';

final myEnquiriesProvider =
    FutureProvider.autoDispose<List<EnquiryDto>>((ref) async {
  final customer = ref.watch(authProvider).valueOrNull;
  if (customer == null) return [];
  final data = await ref.read(apiClientProvider).getData<Map<String, dynamic>>(
        '/enquiries/me',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
  final list = data['enquiries'] as List? ?? const [];
  return list
      .map((e) => EnquiryDto.fromJson(Map<String, dynamic>.from(e as Map)))
      .toList();
});

Future<void> showEnquireSheet(
  BuildContext context,
  WidgetRef ref, {
  String? itemId,
  String? itemLabel,
}) async {
  final customer = ref.read(authProvider).valueOrNull;
  if (customer == null) {
    await showSoftLoginSheet(
      context,
      returnTo: itemId != null ? '/items/$itemId' : '/enquiries',
      message: 'Login to send an enquiry.',
    );
    return;
  }

  final messageCtrl = TextEditingController();
  var submitting = false;

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setModal) {
          return Padding(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 8,
              bottom: MediaQuery.viewInsetsOf(context).bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Enquire', style: Theme.of(context).textTheme.titleLarge),
                if (itemLabel != null) ...[
                  const SizedBox(height: 4),
                  Text(itemLabel),
                ],
                const SizedBox(height: 12),
                TextField(
                  controller: messageCtrl,
                  maxLines: 4,
                  maxLength: 2000,
                  decoration: const InputDecoration(
                    labelText: 'Your message',
                    border: OutlineInputBorder(),
                    hintText: 'Ask about availability, size, or price…',
                  ),
                ),
                const SizedBox(height: 12),
                AppPrimaryButton(
                  label: 'Send enquiry',
                  loading: submitting,
                  onPressed: () async {
                    final msg = messageCtrl.text.trim();
                    if (msg.isEmpty) return;
                    setModal(() => submitting = true);
                    try {
                      await ref.read(apiClientProvider).postData(
                        '/enquiries',
                        body: {
                          'itemId': ?itemId,
                          'message': msg,
                          'channel': 'app',
                        },
                        parse: (_) => null,
                      );
                      if (context.mounted) {
                        Navigator.of(context).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Enquiry sent')),
                        );
                        ref.invalidate(myEnquiriesProvider);
                      }
                    } on ApiException catch (e) {
                      setModal(() => submitting = false);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.message)),
                        );
                      }
                    } catch (e) {
                      setModal(() => submitting = false);
                    }
                  },
                ),
              ],
            ),
          );
        },
      );
    },
  );

  messageCtrl.dispose();
}

class EnquiriesScreen extends ConsumerWidget {
  const EnquiriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider).valueOrNull;
    if (auth == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('My enquiries')),
        body: AppEmptyState(
          title: 'Login required',
          message: 'View enquiries you have sent to the shop.',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(
            context,
            returnTo: '/enquiries',
            message: 'Login to view enquiries.',
          ),
        ),
      );
    }

    final async = ref.watch(myEnquiriesProvider);
    final fmt = DateFormat('dd MMM yyyy');

    return Scaffold(
      appBar: AppBar(
        title: const Text('My enquiries'),
        actions: [
          IconButton(
            onPressed: () => showEnquireSheet(context, ref),
            icon: const Icon(Icons.add),
          ),
        ],
      ),
      body: async.when(
        loading: () => const AppSkeletonList(),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(myEnquiriesProvider),
        ),
        data: (list) {
          if (list.isEmpty) {
            return AppEmptyState(
              title: 'No enquiries yet',
              message: 'Ask about an item from its detail page.',
              actionLabel: 'Browse collection',
              onAction: () => context.go('/collection'),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final e = list[index];
              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(e.message, maxLines: 2, overflow: TextOverflow.ellipsis),
                subtitle: Text('${e.status} · ${fmt.format(e.createdAt.toLocal())}'),
                trailing: e.itemId != null
                    ? IconButton(
                        icon: const Icon(Icons.open_in_new),
                        onPressed: () => context.push('/items/${e.itemId}'),
                      )
                    : null,
              );
            },
          );
        },
      ),
    );
  }
}
