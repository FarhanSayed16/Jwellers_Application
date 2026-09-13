import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/providers.dart';
import '../../shared/widgets/empty_error.dart';

/// Static ring / bangle / necklace charts + nearest-size estimator.
class SizeGuideScreen extends ConsumerStatefulWidget {
  const SizeGuideScreen({super.key});

  @override
  ConsumerState<SizeGuideScreen> createState() => _SizeGuideScreenState();
}

class _SizeGuideScreenState extends ConsumerState<SizeGuideScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 3, vsync: this);

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final enabled = ref.watch(featuresProvider).valueOrNull?.sizeGuide ?? true;
    if (!enabled) {
      return Scaffold(
        appBar: AppBar(title: const Text('Size guide')),
        body: const AppEmptyState(
          title: 'Size guide unavailable',
          message: 'This module is turned off for this shop.',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Size guide'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Ring'),
            Tab(text: 'Bangle'),
            Tab(text: 'Necklace'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          _SizeTab(
            title: 'Ring',
            unitHint: 'Inner circumference (mm)',
            chart: _ringChart,
            estimate: _nearestRing,
          ),
          _SizeTab(
            title: 'Bangle',
            unitHint: 'Inner diameter (mm)',
            chart: _bangleChart,
            estimate: _nearestBangle,
          ),
          _SizeTab(
            title: 'Necklace',
            unitHint: 'Length (inches)',
            chart: _necklaceChart,
            estimate: _nearestNecklace,
          ),
        ],
      ),
    );
  }
}

class _SizeRow {
  const _SizeRow({required this.size, required this.measure, this.note});

  final String size;
  final double measure;
  final String? note;
}

const _ringChart = <_SizeRow>[
  _SizeRow(size: '6', measure: 51.9),
  _SizeRow(size: '7', measure: 54.4),
  _SizeRow(size: '8', measure: 57.0),
  _SizeRow(size: '9', measure: 59.5),
  _SizeRow(size: '10', measure: 62.1),
  _SizeRow(size: '11', measure: 64.6),
  _SizeRow(size: '12', measure: 67.2),
  _SizeRow(size: '13', measure: 69.7),
  _SizeRow(size: '14', measure: 72.3),
  _SizeRow(size: '15', measure: 74.8),
  _SizeRow(size: '16', measure: 77.5),
];

const _bangleChart = <_SizeRow>[
  _SizeRow(size: '2-2', measure: 54.0, note: 'Small'),
  _SizeRow(size: '2-4', measure: 57.2),
  _SizeRow(size: '2-6', measure: 60.3, note: 'Medium'),
  _SizeRow(size: '2-8', measure: 63.5),
  _SizeRow(size: '2-10', measure: 66.7, note: 'Large'),
  _SizeRow(size: '2-12', measure: 69.9),
  _SizeRow(size: '3-0', measure: 73.0),
];

const _necklaceChart = <_SizeRow>[
  _SizeRow(size: 'Choker', measure: 14, note: 'Fits snug'),
  _SizeRow(size: 'Princess', measure: 18, note: 'Most common'),
  _SizeRow(size: 'Matinee', measure: 22),
  _SizeRow(size: 'Opera', measure: 28),
  _SizeRow(size: 'Rope', measure: 36),
];

_SizeRow _nearestRing(double value) => _nearest(_ringChart, value);
_SizeRow _nearestBangle(double value) => _nearest(_bangleChart, value);
_SizeRow _nearestNecklace(double value) => _nearest(_necklaceChart, value);

_SizeRow _nearest(List<_SizeRow> chart, double value) {
  return chart.reduce(
    (a, b) => (a.measure - value).abs() <= (b.measure - value).abs() ? a : b,
  );
}

class _SizeTab extends StatefulWidget {
  const _SizeTab({
    required this.title,
    required this.unitHint,
    required this.chart,
    required this.estimate,
  });

  final String title;
  final String unitHint;
  final List<_SizeRow> chart;
  final _SizeRow Function(double value) estimate;

  @override
  State<_SizeTab> createState() => _SizeTabState();
}

class _SizeTabState extends State<_SizeTab> {
  final _ctrl = TextEditingController();
  _SizeRow? _result;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _runEstimate() {
    final value = double.tryParse(_ctrl.text.trim());
    if (value == null || value <= 0) {
      setState(() => _result = null);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a positive measurement')),
      );
      return;
    }
    setState(() => _result = widget.estimate(value));
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          '${widget.title} chart',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        DataTable(
          columns: const [
            DataColumn(label: Text('Size')),
            DataColumn(label: Text('Measure')),
            DataColumn(label: Text('Note')),
          ],
          rows: [
            for (final row in widget.chart)
              DataRow(
                cells: [
                  DataCell(Text(row.size)),
                  DataCell(Text(row.measure.toString())),
                  DataCell(Text(row.note ?? '—')),
                ],
              ),
          ],
        ),
        const SizedBox(height: 20),
        Text('Estimator', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        TextField(
          controller: _ctrl,
          decoration: InputDecoration(
            labelText: widget.unitHint,
            border: const OutlineInputBorder(),
          ),
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
          ],
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: _runEstimate,
          child: const Text('Find nearest size'),
        ),
        if (_result != null) ...[
          const SizedBox(height: 16),
          Text(
            'Nearest: ${_result!.size}'
            '${_result!.note != null ? ' · ${_result!.note}' : ''}',
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ],
      ],
    );
  }
}
