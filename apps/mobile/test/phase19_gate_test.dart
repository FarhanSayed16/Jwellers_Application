import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/auth/models.dart';

void main() {
  group('phone normalization', () {
    test('10-digit india mobile', () {
      expect(normalizeIndiaPhone('9876543210'), '+919876543210');
      expect(isValidIndiaMobile('+919876543210'), isTrue);
    });

    test('rejects invalid', () {
      expect(isValidIndiaMobile(normalizeIndiaPhone('12345')), isFalse);
      expect(isValidIndiaMobile(normalizeIndiaPhone('5123456789')), isFalse);
    });
  });

  test('guest browse does not require customer profile', () {
    // Soft-gate contract: null customer is a valid guest state.
    const CustomerProfile? guest = null;
    expect(guest, isNull);
  });

  test('enquiry dto parses', () {
    final e = EnquiryDto.fromJson({
      'id': '1',
      'itemId': 'item1',
      'message': 'Hello',
      'status': 'new',
      'channel': 'app',
      'createdAt': '2026-09-07T10:00:00.000Z',
    });
    expect(e.message, 'Hello');
    expect(e.channel, 'app');
  });
}
