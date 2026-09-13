import 'package:intl/intl.dart';

import '../core/config/models.dart';
import '../features/catalog/models.dart';

final inrFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
final inrFormatPrecise =
    NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

String formatInr(double value, {bool precise = false}) =>
    (precise ? inrFormatPrecise : inrFormat).format(value);

String quotePurityForItem(ItemDto item) {
  if (item.metal.toLowerCase() == 'silver') return 'silver';
  switch (item.purity.toUpperCase()) {
    case '24K':
      return '24k';
    case '18K':
      return '18k';
    case '22K':
    default:
      return '22k';
  }
}

({String type, double value}) resolveMaking(
  ItemDto item,
  PublicShopConfig config,
) {
  if (item.makingCharge.type == 'inherit' || item.makingCharge.value == null) {
    return (
      type: config.makingChargeDefault.type == 'flat' ? 'flat' : 'percent',
      value: config.makingChargeDefault.value,
    );
  }
  return (
    type: item.makingCharge.type == 'flat' ? 'flat' : 'percent',
    value: item.makingCharge.value!,
  );
}

String formatRateTime(DateTime dt) {
  final local = dt.toLocal();
  return DateFormat('dd MMM, hh:mm a').format(local);
}

double ratePerGramForPurity(RateSnapshot rate, String purity) {
  switch (purity) {
    case '24k':
      return rate.gold24kPerGram;
    case '18k':
      return rate.gold18kPerGram;
    case 'silver':
      return rate.silverPerGram;
    case '22k':
    default:
      return rate.gold22kPerGram;
  }
}

/// Mirrors API `calculateQuote` formula (docs/03 §4) for offline/gate checks.
QuoteBreakup computeQuoteBreakup({
  required double ratePerGram,
  required double weightGrams,
  required String makingType,
  required double makingValue,
  required double gstPercent,
}) {
  double roundMoney(double n) => (n * 100).round() / 100;
  final metalValue = roundMoney(weightGrams * ratePerGram);
  final making = makingType == 'percent'
      ? roundMoney(metalValue * (makingValue / 100))
      : roundMoney(makingValue);
  final taxable = roundMoney(metalValue + making);
  final gst = roundMoney(taxable * (gstPercent / 100));
  final total = roundMoney(taxable + gst);
  return QuoteBreakup(
    metalValue: metalValue,
    making: making,
    taxable: taxable,
    gst: gst,
    total: total,
  );
}
