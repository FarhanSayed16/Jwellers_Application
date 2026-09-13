import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/config/providers.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/media/cloudinary_upload.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/models.dart';
import '../auth/soft_login_sheet.dart';

final myCustomRequestsProvider =
    FutureProvider.autoDispose<List<CustomRequestDto>>((ref) async {
  final customer = ref.watch(authProvider).valueOrNull;
  if (customer == null) return [];
  final data = await ref.read(apiClientProvider).getData<Map<String, dynamic>>(
        '/custom-requests/me',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
  final list = data['customRequests'] as List? ?? const [];
  return list
      .map((e) => CustomRequestDto.fromJson(Map<String, dynamic>.from(e as Map)))
      .toList();
});

class CustomRequestsScreen extends ConsumerWidget {
  const CustomRequestsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final features = ref.watch(featuresProvider).valueOrNull;
    if (features?.customRequests == false) {
      return Scaffold(
        appBar: AppBar(title: const Text('Custom requests')),
        body: const AppEmptyState(
          title: 'Not available',
          message: 'Custom requests are turned off for this shop.',
        ),
      );
    }

    final auth = ref.watch(authProvider).valueOrNull;
    if (auth == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Custom requests')),
        body: AppEmptyState(
          title: 'Login required',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(
            context,
            returnTo: '/custom-requests',
          ),
        ),
      );
    }

    final async = ref.watch(myCustomRequestsProvider);
    final fmt = DateFormat('dd MMM yyyy');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Custom requests'),
        actions: [
          IconButton(
            onPressed: () => context.push('/custom-requests/new'),
            icon: const Icon(Icons.add),
          ),
        ],
      ),
      body: async.when(
        loading: () => const AppSkeletonList(),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(myCustomRequestsProvider),
        ),
        data: (list) {
          if (list.isEmpty) {
            return AppEmptyState(
              title: 'No custom requests',
              message: 'Describe a made-to-order piece for the shop.',
              actionLabel: 'New request',
              onAction: () => context.push('/custom-requests/new'),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final r = list[index];
              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(
                  r.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  '${r.status} · ${fmt.format(r.createdAt.toLocal())}'
                  '${r.budgetHint != null ? ' · ${r.budgetHint}' : ''}',
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class NewCustomRequestScreen extends ConsumerStatefulWidget {
  const NewCustomRequestScreen({super.key});

  @override
  ConsumerState<NewCustomRequestScreen> createState() =>
      _NewCustomRequestScreenState();
}

class _NewCustomRequestScreenState extends ConsumerState<NewCustomRequestScreen> {
  final _desc = TextEditingController();
  final _budget = TextEditingController();
  final _urlCtrl = TextEditingController();
  final _urls = <String>[];
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _desc.dispose();
    _budget.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  void _addUrl() {
    final url = _urlCtrl.text.trim();
    if (url.isEmpty) return;
    if (!url.startsWith('http')) {
      setState(() => _error = 'Image URL must start with http');
      return;
    }
    if (_urls.length >= 10) {
      setState(() => _error = 'Maximum 10 reference images');
      return;
    }
    setState(() {
      _urls.add(url);
      _urlCtrl.clear();
      _error = null;
    });
  }

  Future<void> _uploadPhoto() async {
    if (_urls.length >= 10) {
      setState(() => _error = 'Maximum 10 reference images');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final url = await pickAndUploadCloudinaryImage(
        api: ref.read(apiClientProvider),
        purpose: 'custom_requests',
      );
      if (!mounted) return;
      setState(() {
        _urls.add(url);
        _loading = false;
      });
    } on ApiException catch (e) {
      if (e.code == 'CANCELLED') {
        if (mounted) {
          setState(() => _loading = false);
        }
        return;
      }
      if (mounted) {
        setState(() {
          _loading = false;
          _error = e.message;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = e.toString();
        });
      }
    }
  }

  Future<void> _submit() async {
    final description = _desc.text.trim();
    if (description.isEmpty) {
      setState(() => _error = 'Description is required');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).postData(
        '/custom-requests',
        body: {
          'description': description,
          if (_urls.isNotEmpty) 'referenceImageUrls': _urls,
          if (_budget.text.trim().isNotEmpty) 'budgetHint': _budget.text.trim(),
        },
        parse: (_) => null,
      );
      if (!mounted) return;
      ref.invalidate(myCustomRequestsProvider);
      context.go('/custom-requests');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Custom request submitted')),
      );
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New custom request')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _desc,
            maxLines: 5,
            maxLength: 5000,
            decoration: const InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(),
              hintText: 'Metal, style, occasion, approximate weight…',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _budget,
            decoration: const InputDecoration(
              labelText: 'Budget hint (optional)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          Text('Reference images', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 4),
          Text(
            'Upload a photo or paste an HTTPS image URL.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: _loading ? null : _uploadPhoto,
              icon: const Icon(Icons.photo_camera_outlined, size: 18),
              label: const Text('Upload photo'),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _urlCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Image URL',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: _addUrl,
                icon: const Icon(Icons.add),
              ),
            ],
          ),
          for (final url in _urls)
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(url, maxLines: 1, overflow: TextOverflow.ellipsis),
              trailing: IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => setState(() => _urls.remove(url)),
              ),
            ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ],
          const SizedBox(height: 20),
          AppPrimaryButton(
            label: 'Submit',
            loading: _loading,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
