import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/config/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/format.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../catalog/models.dart';
import '../catalog/providers.dart';

class RateHistoryScreen extends ConsumerStatefulWidget {
  const RateHistoryScreen({super.key});

  @override
  ConsumerState<RateHistoryScreen> createState() => _RateHistoryScreenState();
}

class _RateHistoryScreenState extends ConsumerState<RateHistoryScreen> {
  String _series = '22k';

  @override
  Widget build(BuildContext context) {
    final features = ref.watch(featuresProvider).valueOrNull;
    if (features?.rateHistory == false) {
      return Scaffold(
        appBar: AppBar(title: const Text('Rate history')),
        body: const AppEmptyState(
          title: 'History unavailable',
          message: 'Rate history is turned off for this shop.',
        ),
      );
    }

    final async = ref.watch(rateHistoryProvider);
    final tokens = Theme.of(context).extension<AppTokens>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate history'),
        actions: [
          IconButton(
            onPressed: () => ref.read(rateHistoryProvider.notifier).reload(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: async.when(
        loading: () => const Padding(
          padding: EdgeInsets.all(16),
          child: AppSkeleton(height: 220, borderRadius: 12),
        ),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.read(rateHistoryProvider.notifier).reload(),
        ),
        data: (points) {
          if (points.isEmpty) {
            return const AppEmptyState(
              title: 'No history yet',
              message: 'Rates published by Admin will appear here.',
            );
          }

          final chronological = [...points]
            ..sort((a, b) => a.effectiveAt.compareTo(b.effectiveAt));
          final newestFirst = chronological.reversed.toList();

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('Series', style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  for (final p in ['24k', '22k', '18k', 'silver'])
                    ChoiceChip(
                      label: Text(p == 'silver' ? 'Silver' : p.toUpperCase()),
                      selected: _series == p,
                      onSelected: (_) => setState(() => _series = p),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 220,
                child: _RateChart(
                  points: chronological,
                  series: _series,
                  lineColor: Theme.of(context).colorScheme.primary,
                  borderColor: tokens?.border ?? Theme.of(context).dividerColor,
                ),
              ),
              const SizedBox(height: 20),
              Text('Published rates', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              for (final point in newestFirst)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(formatInr(ratePerGramForPurity(point, _series), precise: true)),
                  subtitle: Text(DateFormat('dd MMM yyyy, hh:mm a').format(point.effectiveAt.toLocal())),
                  trailing: Text(
                    point.source?.toUpperCase() ?? '',
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _RateChart extends StatelessWidget {
  const _RateChart({
    required this.points,
    required this.series,
    required this.lineColor,
    required this.borderColor,
  });

  final List<RateSnapshot> points;
  final String series;
  final Color lineColor;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    final spots = <FlSpot>[
      for (var i = 0; i < points.length; i++)
        FlSpot(i.toDouble(), ratePerGramForPurity(points[i], series)),
    ];
    final values = spots.map((s) => s.y).toList();
    final minY = values.reduce((a, b) => a < b ? a : b);
    final maxY = values.reduce((a, b) => a > b ? a : b);
    final pad = ((maxY - minY).abs() * 0.1).clamp(1.0, 500.0);

    return Container(
      padding: const EdgeInsets.fromLTRB(8, 16, 16, 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: LineChart(
        LineChartData(
          minY: minY - pad,
          maxY: maxY + pad,
          gridData: const FlGridData(show: false),
          borderData: FlBorderData(show: false),
          titlesData: FlTitlesData(
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 48,
                getTitlesWidget: (value, meta) => Text(
                  value.toInt().toString(),
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ),
            ),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: lineColor,
              barWidth: 3,
              dotData: FlDotData(show: points.length <= 24),
              belowBarData: BarAreaData(
                show: true,
                color: lineColor.withValues(alpha: 0.12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
