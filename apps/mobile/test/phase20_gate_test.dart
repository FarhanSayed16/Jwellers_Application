import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/chat/chat_providers.dart';

void main() {
  test('chat thread dto parses unread badge', () {
    final t = ChatThread.fromJson({
      'id': '1',
      'subject': 'Item CHAT-001',
      'itemId': 'i1',
      'itemSku': 'CHAT-001',
      'itemTitle': 'Ring',
      'status': 'pending_staff',
      'lastMessageAt': '2026-09-07T10:00:00.000Z',
      'lastMessagePreview': 'Hello',
      'unreadCustomer': 2,
    });
    expect(t.unreadCustomer, 2);
    expect(t.itemSku, 'CHAT-001');
  });

  test('message isMine for customer sender', () {
    final m = ChatMessage.fromJson({
      'id': 'm1',
      'senderType': 'customer',
      'body': 'Hi',
      'attachmentUrls': [],
      'sentAt': '2026-09-07T10:00:00.000Z',
    });
    expect(m.isMine, isTrue);
  });
}
