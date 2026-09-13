import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/providers.dart';

/// Shop trust cues from public config — no fake “verified” language.
class TrustStrip extends ConsumerWidget {
  const TrustStrip({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(publicConfigProvider).valueOrNull;
    final features = ref.watch(featuresProvider).valueOrNull;
    if (config == null) return const SizedBox.shrink();

    final chips = <String>[];
    if (features?.hallmark == true) {
      chips.add('Hallmarked jewellery');
    }
    final bis = config.bisRegistrationNumber?.trim();
    if (bis != null && bis.isNotEmpty) {
      chips.add('BIS: $bis');
    }
    final gst = config.gstNumber?.trim();
    if (gst != null && gst.isNotEmpty) {
      chips.add('GSTIN: $gst');
    }
    if (chips.isEmpty) return const SizedBox.shrink();

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final label in chips)
          Chip(
            visualDensity: compact ? VisualDensity.compact : null,
            avatar: Icon(
              Icons.workspace_premium_outlined,
              size: compact ? 16 : 18,
              color: Theme.of(context).colorScheme.primary,
            ),
            label: Text(label, style: Theme.of(context).textTheme.labelMedium),
          ),
      ],
    );
  }
}
