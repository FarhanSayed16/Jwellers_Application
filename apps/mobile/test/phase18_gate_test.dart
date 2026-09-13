import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/catalog/models.dart';
import 'package:mobile/shared/format.dart';

void main() {
  test('quote breakup matches API formula (admin-visible rates)', () {
    // Same formula as apps/api rates.service calculateQuote
    const ratePerGram = 6400.0;
    const weight = 10.0;
    const makingPct = 12.0;
    const gstPct = 3.0;

    final breakup = computeQuoteBreakup(
      ratePerGram: ratePerGram,
      weightGrams: weight,
      makingType: 'percent',
      makingValue: makingPct,
      gstPercent: gstPct,
    );

    expect(breakup.metalValue, 64000.0);
    expect(breakup.making, 7680.0);
    expect(breakup.taxable, 71680.0);
    expect(breakup.gst, 2150.4);
    expect(breakup.total, 73830.4);
  });

  test('rate series selector maps purity fields', () {
    final rate = RateSnapshot.fromJson({
      'id': '1',
      'effectiveAt': '2026-09-07T10:00:00.000Z',
      'gold24kPerGram': 7000,
      'gold22kPerGram': 6400,
      'gold18kPerGram': 5200,
      'silverPerGram': 90,
      'source': 'manual',
    });
    expect(ratePerGramForPurity(rate, '24k'), 7000);
    expect(ratePerGramForPurity(rate, '22k'), 6400);
    expect(ratePerGramForPurity(rate, '18k'), 5200);
    expect(ratePerGramForPurity(rate, 'silver'), 90);
  });

  test('history list sorts with newest after append', () {
    final older = RateSnapshot.fromJson({
      'id': 'a',
      'effectiveAt': '2026-09-01T10:00:00.000Z',
      'gold24kPerGram': 6900,
      'gold22kPerGram': 6300,
      'gold18kPerGram': 5100,
      'silverPerGram': 85,
      'source': 'manual',
    });
    final newer = RateSnapshot.fromJson({
      'id': 'b',
      'effectiveAt': '2026-09-07T10:00:00.000Z',
      'gold24kPerGram': 7000,
      'gold22kPerGram': 6400,
      'gold18kPerGram': 5200,
      'silverPerGram': 90,
      'source': 'manual',
    });
    final points = [older, newer];
    final newestFirst = [...points]
      ..sort((a, b) => b.effectiveAt.compareTo(a.effectiveAt));
    expect(newestFirst.first.id, 'b');
    expect(newestFirst.first.gold22kPerGram, 6400);
  });
}
