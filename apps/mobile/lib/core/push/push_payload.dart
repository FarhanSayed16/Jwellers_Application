/// Pure helpers for FCM data payloads (no Firebase import — unit-testable).
class PushPayload {
  const PushPayload({
    required this.type,
    this.threadId,
    this.itemId,
  });

  final String type;
  final String? threadId;
  final String? itemId;

  factory PushPayload.fromData(Map<String, dynamic> data) {
    return PushPayload(
      type: data['type']?.toString() ?? '',
      threadId: data['threadId']?.toString(),
      itemId: data['itemId']?.toString(),
    );
  }

  /// GoRouter location to open after tap, or null to stay / refresh home.
  String? get route {
    switch (type) {
      case 'rates_updated':
        return '/home';
      case 'chat_message':
        if (threadId != null && threadId!.isNotEmpty) {
          return '/chat/$threadId';
        }
        return '/chat';
      case 'new_arrival':
        if (itemId != null && itemId!.isNotEmpty) {
          return '/items/$itemId';
        }
        return '/collection';
      case 'price_alert':
        return '/price-alerts';
      default:
        return null;
    }
  }
}
