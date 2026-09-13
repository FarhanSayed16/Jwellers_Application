import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/push/push_payload.dart';

void main() {
  test('rates_updated routes home', () {
    final p = PushPayload.fromData({'type': 'rates_updated'});
    expect(p.route, '/home');
  });

  test('chat_message routes thread when opaque id present', () {
    final p = PushPayload.fromData({
      'type': 'chat_message',
      'threadId': 'abc123',
    });
    expect(p.route, '/chat/abc123');
  });

  test('new_arrival routes item', () {
    final p = PushPayload.fromData({
      'type': 'new_arrival',
      'itemId': 'item99',
    });
    expect(p.route, '/items/item99');
  });
}
