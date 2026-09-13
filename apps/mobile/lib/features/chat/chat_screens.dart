import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/media/cloudinary_upload.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/soft_login_sheet.dart';
import 'chat_providers.dart';

class ChatListScreen extends ConsumerStatefulWidget {
  const ChatListScreen({super.key});

  @override
  ConsumerState<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends ConsumerState<ChatListScreen> {
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _poll = Timer.periodic(const Duration(seconds: 8), (_) {
      ref.read(chatThreadsProvider.notifier).reload();
    });
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final customer = ref.watch(authProvider).valueOrNull;
    if (customer == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chat')),
        body: AppEmptyState(
          title: 'Login to chat',
          message: 'Message the shop about jewellery or orders.',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(
            context,
            returnTo: '/chat',
            message: 'Login to use chat.',
          ),
        ),
      );
    }

    final async = ref.watch(chatThreadsProvider);
    final fmt = DateFormat('dd MMM, hh:mm a');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        actions: [
          IconButton(
            onPressed: () async {
              final thread = await ref
                  .read(chatThreadsProvider.notifier)
                  .startThread(subject: 'General');
              if (context.mounted) context.push('/chat/${thread.id}');
            },
            icon: const Icon(Icons.add),
            tooltip: 'New chat',
          ),
        ],
      ),
      body: async.when(
        loading: () => const AppSkeletonList(),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.read(chatThreadsProvider.notifier).reload(),
        ),
        data: (threads) {
          if (threads.isEmpty) {
            return AppEmptyState(
              title: 'No conversations',
              message: 'Start from an item or tap + for a general chat.',
              actionLabel: 'Browse collection',
              onAction: () => context.go('/collection'),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(chatThreadsProvider.notifier).reload(),
            child: ListView.separated(
              itemCount: threads.length,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final t = threads[index];
                return ListTile(
                  title: Text(
                    t.itemTitle ?? t.subject ?? 'Chat',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    t.lastMessagePreview ?? 'No messages yet',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (t.lastMessageAt != null)
                        Text(
                          fmt.format(t.lastMessageAt!.toLocal()),
                          style: Theme.of(context).textTheme.labelSmall,
                        ),
                      if (t.unreadCustomer > 0) ...[
                        const SizedBox(height: 4),
                        CircleAvatar(
                          radius: 10,
                          backgroundColor: Theme.of(context).colorScheme.primary,
                          child: Text(
                            '${t.unreadCustomer}',
                            style: const TextStyle(fontSize: 10, color: Colors.white),
                          ),
                        ),
                      ],
                    ],
                  ),
                  onTap: () => context.push('/chat/${t.id}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class ChatThreadScreen extends ConsumerStatefulWidget {
  const ChatThreadScreen({super.key, required this.threadId});

  final String threadId;

  @override
  ConsumerState<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _ChatThreadScreenState extends ConsumerState<ChatThreadScreen> {
  final _ctrl = TextEditingController();
  final _attachCtrl = TextEditingController();
  Timer? _poll;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _poll = Timer.periodic(const Duration(seconds: 5), (_) {
      ref.read(chatMessagesProvider(widget.threadId).notifier).reload();
    });
  }

  @override
  void dispose() {
    _poll?.cancel();
    _ctrl.dispose();
    _attachCtrl.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final body = _ctrl.text.trim();
    final url = _attachCtrl.text.trim();
    if (body.isEmpty && url.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(chatMessagesProvider(widget.threadId).notifier).send(
            body: body.isEmpty ? null : body,
            attachmentUrls: url.isEmpty ? const [] : [url],
          );
      _ctrl.clear();
      _attachCtrl.clear();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _uploadPhoto() async {
    setState(() => _sending = true);
    try {
      final url = await pickAndUploadCloudinaryImage(
        api: ref.read(apiClientProvider),
        purpose: 'chat',
      );
      if (!mounted) return;
      setState(() {
        _attachCtrl.text = url;
        _sending = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _sending = false);
      if (e.code == 'CANCELLED') return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      setState(() => _sending = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final customer = ref.watch(authProvider).valueOrNull;
    if (customer == null) {
      return Scaffold(
        appBar: AppBar(),
        body: AppEmptyState(
          title: 'Login required',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(
            context,
            returnTo: '/chat/${widget.threadId}',
          ),
        ),
      );
    }

    final async = ref.watch(chatMessagesProvider(widget.threadId));
    final fmt = DateFormat('hh:mm a');

    return Scaffold(
      appBar: AppBar(title: const Text('Conversation')),
      body: Column(
        children: [
          Expanded(
            child: async.when(
              loading: () => const AppSkeletonList(),
              error: (e, _) => AppErrorRetry(
                message: e.toString(),
                onRetry: () =>
                    ref.read(chatMessagesProvider(widget.threadId).notifier).reload(),
              ),
              data: (messages) {
                if (messages.isEmpty) {
                  return const Center(child: Text('Say hello to the shop.'));
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final m = messages[index];
                    return Align(
                      alignment:
                          m.isMine ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.sizeOf(context).width * 0.78,
                        ),
                        decoration: BoxDecoration(
                          color: m.isMine
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (m.body != null && m.body!.isNotEmpty)
                              Text(
                                m.body!,
                                style: TextStyle(
                                  color: m.isMine
                                      ? Theme.of(context).colorScheme.onPrimary
                                      : null,
                                ),
                              ),
                            for (final url in m.attachmentUrls)
                              InkWell(
                                onTap: () async {
                                  final uri = Uri.parse(url);
                                  if (await canLaunchUrl(uri)) {
                                    await launchUrl(
                                      uri,
                                      mode: LaunchMode.externalApplication,
                                    );
                                  }
                                },
                                child: Text(
                                  'Attachment',
                                  style: TextStyle(
                                    decoration: TextDecoration.underline,
                                    color: m.isMine
                                        ? Theme.of(context).colorScheme.onPrimary
                                        : Theme.of(context).colorScheme.primary,
                                  ),
                                ),
                              ),
                            Text(
                              fmt.format(m.sentAt.toLocal()),
                              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: m.isMine
                                        ? Theme.of(context)
                                            .colorScheme
                                            .onPrimary
                                            .withValues(alpha: 0.7)
                                        : null,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Column(
                children: [
                  TextField(
                    controller: _attachCtrl,
                    decoration: const InputDecoration(
                      hintText: 'Attachment URL (optional)',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton.icon(
                      onPressed: _sending ? null : _uploadPhoto,
                      icon: const Icon(Icons.photo_camera_outlined, size: 18),
                      label: const Text('Upload photo'),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _ctrl,
                          decoration: const InputDecoration(
                            hintText: 'Message',
                            border: OutlineInputBorder(),
                          ),
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => _send(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      AppPrimaryButton(
                        label: 'Send',
                        loading: _sending,
                        onPressed: _send,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
