import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../core/network/api_client.dart';
import '../auth/auth_provider.dart';

class ChatThread {
  const ChatThread({
    required this.id,
    required this.subject,
    required this.itemId,
    required this.itemSku,
    required this.itemTitle,
    required this.status,
    required this.lastMessageAt,
    required this.lastMessagePreview,
    required this.unreadCustomer,
  });

  final String id;
  final String? subject;
  final String? itemId;
  final String? itemSku;
  final String? itemTitle;
  final String status;
  final DateTime? lastMessageAt;
  final String? lastMessagePreview;
  final int unreadCustomer;

  factory ChatThread.fromJson(Map<String, dynamic> json) => ChatThread(
        id: json['id']?.toString() ?? '',
        subject: json['subject']?.toString(),
        itemId: json['itemId']?.toString(),
        itemSku: json['itemSku']?.toString(),
        itemTitle: json['itemTitle']?.toString(),
        status: json['status']?.toString() ?? 'open',
        lastMessageAt: DateTime.tryParse(json['lastMessageAt']?.toString() ?? ''),
        lastMessagePreview: json['lastMessagePreview']?.toString(),
        unreadCustomer: (json['unreadCustomer'] as num?)?.toInt() ?? 0,
      );
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.senderType,
    required this.body,
    required this.attachmentUrls,
    required this.sentAt,
    required this.clientMessageId,
  });

  final String id;
  final String senderType;
  final String? body;
  final List<String> attachmentUrls;
  final DateTime sentAt;
  final String? clientMessageId;

  bool get isMine => senderType == 'customer';

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: json['id']?.toString() ?? '',
        senderType: json['senderType']?.toString() ?? 'staff',
        body: json['body']?.toString(),
        attachmentUrls: (json['attachmentUrls'] as List?)
                ?.map((e) => e.toString())
                .toList() ??
            const [],
        sentAt: DateTime.tryParse(json['sentAt']?.toString() ?? '') ??
            DateTime.now(),
        clientMessageId: json['clientMessageId']?.toString(),
      );
}

final chatThreadsProvider =
    AsyncNotifierProvider<ChatThreadsNotifier, List<ChatThread>>(
  ChatThreadsNotifier.new,
);

class ChatThreadsNotifier extends AsyncNotifier<List<ChatThread>> {
  @override
  Future<List<ChatThread>> build() async {
    final customer = ref.watch(authProvider).valueOrNull;
    if (customer == null) return [];
    final data = await ref.read(apiClientProvider).getData<Map<String, dynamic>>(
          '/chat/threads',
          parse: (json) => Map<String, dynamic>.from(json as Map),
        );
    final list = data['threads'] as List? ?? const [];
    return list
        .map((e) => ChatThread.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(build);
  }

  Future<ChatThread> startThread({String? itemId, String? subject}) async {
    final data = await ref.read(apiClientProvider).postData<Map<String, dynamic>>(
      '/chat/threads',
      body: {
        'itemId': ?itemId,
        'subject': ?subject,
      },
      parse: (json) => Map<String, dynamic>.from(json as Map),
    );
    final thread =
        ChatThread.fromJson(Map<String, dynamic>.from(data['thread'] as Map));
    await reload();
    return thread;
  }
}

final chatMessagesProvider =
    AsyncNotifierProvider.family<ChatMessagesNotifier, List<ChatMessage>, String>(
  ChatMessagesNotifier.new,
);

class ChatMessagesNotifier extends FamilyAsyncNotifier<List<ChatMessage>, String> {
  @override
  Future<List<ChatMessage>> build(String threadId) async {
    final data = await ref.read(apiClientProvider).getData<Map<String, dynamic>>(
          '/chat/threads/$threadId/messages',
          query: {'limit': 100},
          parse: (json) => Map<String, dynamic>.from(json as Map),
        );
    final list = data['messages'] as List? ?? const [];
    // Mark read (fire-and-forget style)
    try {
      await ref.read(apiClientProvider).postData(
            '/chat/threads/$threadId/read',
            body: {},
            parse: (_) => null,
          );
    } catch (_) {}
    return list
        .map((e) => ChatMessage.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => build(arg));
  }

  Future<void> send({
    String? body,
    List<String> attachmentUrls = const [],
  }) async {
    final clientMessageId = const Uuid().v4();
    await ref.read(apiClientProvider).postData(
      '/chat/threads/$arg/messages',
      body: {
        'body': body,
        if (attachmentUrls.isNotEmpty) 'attachmentUrls': attachmentUrls,
        'clientMessageId': clientMessageId,
      },
      parse: (_) => null,
    );
    await reload();
    await ref.read(chatThreadsProvider.notifier).reload();
  }
}
