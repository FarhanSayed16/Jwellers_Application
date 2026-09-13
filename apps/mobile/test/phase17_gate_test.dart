import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/catalog/models.dart';
import 'package:mobile/shared/format.dart';
import 'package:mobile/shared/widgets/cached_image.dart';

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  test('quote purity maps item metal/purity', () {
    const gold = ItemDto(
      id: '1',
      sku: 'SKU1',
      title: 'Ring',
      description: null,
      categoryId: 'c',
      subcategoryId: null,
      images: [],
      metal: 'gold',
      purity: '22K',
      huid: null,
      hallmarkImageUrl: null,
      grossWeightGrams: 10,
      netWeightGrams: 9.5,
      makingCharge: MakingCharge(type: 'inherit'),
      stoneDetails: null,
      sizeInfo: null,
      tags: [],
      isNewArrival: true,
      isFeatured: false,
      status: 'active',
    );
    expect(quotePurityForItem(gold), '22k');

    const silver = ItemDto(
      id: '2',
      sku: 'SKU2',
      title: 'Chain',
      description: null,
      categoryId: 'c',
      subcategoryId: null,
      images: [],
      metal: 'silver',
      purity: 'other',
      huid: null,
      hallmarkImageUrl: null,
      grossWeightGrams: 20,
      netWeightGrams: 20,
      makingCharge: MakingCharge(type: 'percent', value: 10),
      stoneDetails: null,
      sizeInfo: null,
      tags: [],
      isNewArrival: false,
      isFeatured: true,
      status: 'active',
    );
    expect(quotePurityForItem(silver), 'silver');
  });

  testWidgets('cached image placeholder works in light and dark', (tester) async {
    Future<void> pumpTheme(ThemeData theme) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: theme,
          home: const Scaffold(
            body: SizedBox(
              width: 120,
              height: 120,
              child: AppCachedImage(url: ''),
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.byIcon(Icons.image_outlined), findsOneWidget);
    }

    await pumpTheme(bootstrapLightTheme());
    await pumpTheme(bootstrapDarkTheme());
  });

  test('rate snapshot parses live source', () {
    final rate = RateSnapshot.fromJson({
      'id': 'r1',
      'effectiveAt': '2026-09-07T10:00:00.000Z',
      'gold24kPerGram': 7000,
      'gold22kPerGram': 6400,
      'gold18kPerGram': 5200,
      'silverPerGram': 90,
      'source': 'manual',
    });
    expect(rate.isLive, isTrue);
    expect(rate.gold22kPerGram, 6400);
  });
}
