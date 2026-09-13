import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/providers.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/format.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/soft_login_sheet.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  List<Map<String, dynamic>> _rows = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    if (!ref.read(authProvider.notifier).isLoggedIn) {
      setState(() {
        _loading = false;
        _rows = const [];
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.getData<Map<String, dynamic>>(
        '/me/invoices',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      final list = (data['invoices'] as List? ?? const [])
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
      if (!mounted) return;
      setState(() {
        _loading = false;
        _rows = list;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not load invoices';
      });
    }
  }

  Future<void> _openPdf(String? url) async {
    if (url == null || url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final flags = ref.watch(featuresProvider).valueOrNull;
    if (flags != null && !flags.digitalBilling) {
      return Scaffold(
        appBar: AppBar(title: const Text('Invoices')),
        body: const AppEmptyState(
          title: 'Not available',
          message: 'Digital billing is not enabled for this shop.',
        ),
      );
    }

    if (!ref.watch(authProvider.notifier).isLoggedIn) {
      return Scaffold(
        appBar: AppBar(title: const Text('Invoices')),
        body: AppEmptyState(
          title: 'Login required',
          message: 'Sign in to view your invoices.',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(context, returnTo: '/invoices'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoices'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? AppErrorRetry(message: _error!, onRetry: _load)
              : _rows.isEmpty
                  ? const AppEmptyState(
                      title: 'No invoices yet',
                      message: 'When the shop issues an invoice for you, it will appear here.',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _rows.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final inv = _rows[i];
                        final total = (inv['grandTotal'] as num?)?.toDouble() ?? 0;
                        final pdfUrl = inv['pdfUrl']?.toString();
                        return ListTile(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(color: Theme.of(context).dividerColor),
                          ),
                          title: Text(inv['invoiceNumber']?.toString() ?? 'Invoice'),
                          subtitle: Text(
                            '${inv['status'] ?? ''} · ${formatInr(total)}',
                          ),
                          trailing: pdfUrl != null && pdfUrl.isNotEmpty
                              ? IconButton(
                                  tooltip: 'Open PDF',
                                  icon: const Icon(Icons.picture_as_pdf_outlined),
                                  onPressed: () => _openPdf(pdfUrl),
                                )
                              : null,
                        );
                      },
                    ),
    );
  }
}
