import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/providers.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';

class AppointmentBookScreen extends ConsumerStatefulWidget {
  const AppointmentBookScreen({super.key});

  @override
  ConsumerState<AppointmentBookScreen> createState() => _AppointmentBookScreenState();
}

class _AppointmentBookScreenState extends ConsumerState<AppointmentBookScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _noteCtrl = TextEditingController();
  DateTime _preferred = DateTime.now().add(const Duration(days: 1));
  bool _loading = false;
  String? _error;
  String? _ok;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final customer = ref.read(authProvider).valueOrNull;
      if (customer == null || !mounted) return;
      setState(() {
        if (_nameCtrl.text.isEmpty) _nameCtrl.text = customer.name;
        if (_phoneCtrl.text.isEmpty) _phoneCtrl.text = customer.phone;
      });
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _preferred,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_preferred),
    );
    if (time == null || !mounted) return;
    setState(() {
      _preferred = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
      _ok = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      await api.postData(
        '/appointments',
        body: {
          'name': _nameCtrl.text.trim(),
          'phone': _phoneCtrl.text.trim(),
          'preferredAt': _preferred.toUtc().toIso8601String(),
          'note': _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
          'partySize': 1,
        },
      );
      if (!mounted) return;
      setState(() {
        _loading = false;
        _ok = 'Visit requested. The shop will confirm shortly.';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not book visit';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final flags = ref.watch(featuresProvider).valueOrNull;
    if (flags != null && !flags.appointments) {
      return Scaffold(
        appBar: AppBar(title: const Text('Book a visit')),
        body: const AppEmptyState(
          title: 'Not available',
          message: 'Store appointments are not enabled for this shop.',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Book a visit')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Your name', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _phoneCtrl,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Preferred time'),
            subtitle: Text(_preferred.toLocal().toString().substring(0, 16)),
            trailing: TextButton(onPressed: _pickDateTime, child: const Text('Change')),
          ),
          TextField(
            controller: _noteCtrl,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Note (optional)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          AppPrimaryButton(
            label: _loading ? 'Sending…' : 'Request appointment',
            onPressed: _loading ? null : _submit,
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          if (_ok != null) ...[
            const SizedBox(height: 12),
            Text(_ok!),
          ],
        ],
      ),
    );
  }
}
