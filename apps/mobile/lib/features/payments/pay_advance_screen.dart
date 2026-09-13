import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../../core/config/providers.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/format.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/soft_login_sheet.dart';

/// Creates a Razorpay order (or mock order when keys absent). Opens Checkout
/// when [razorpayKeyId] is present and not mock.
class PayAdvanceScreen extends ConsumerStatefulWidget {
  const PayAdvanceScreen({super.key});

  @override
  ConsumerState<PayAdvanceScreen> createState() => _PayAdvanceScreenState();
}

class _PayAdvanceScreenState extends ConsumerState<PayAdvanceScreen> {
  final _amountCtrl = TextEditingController(text: '1000');
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _result;
  String? _checkoutNote;
  Razorpay? _razorpay;

  @override
  void dispose() {
    _amountCtrl.dispose();
    _razorpay?.clear();
    super.dispose();
  }

  void _ensureRazorpay() {
    if (_razorpay != null) return;
    try {
      final rz = Razorpay();
      rz.on(Razorpay.EVENT_PAYMENT_SUCCESS, (PaymentSuccessResponse response) {
        if (!mounted) return;
        setState(() {
          _checkoutNote =
              'Payment submitted. Status will show paid once the shop/webhook confirms.';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment successful — confirmation pending shop/webhook.'),
          ),
        );
      });
      rz.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse response) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.message ?? 'Payment failed')),
        );
      });
      _razorpay = rz;
    } catch (e) {
      debugPrint('Razorpay init failed: $e');
      _razorpay = null;
    }
  }

  Future<void> _openRazorpayCheckout({
    required String keyId,
    required String orderId,
    required int amountInPaise,
    required String shopName,
  }) async {
    _ensureRazorpay();
    final rz = _razorpay;
    if (rz == null) {
      if (!mounted) return;
      setState(() {
        _checkoutNote =
            'Razorpay Checkout unavailable on this platform. Order created — complete payment with the shop.';
      });
      return;
    }

    try {
      rz.open({
        'key': keyId,
        'amount': amountInPaise,
        'name': shopName,
        'order_id': orderId,
        'currency': 'INR',
      });
    } catch (e) {
      debugPrint('Razorpay open failed: $e');
      if (!mounted) return;
      setState(() {
        _checkoutNote =
            'Could not open Razorpay Checkout. Order is created — ask the shop to confirm payment.';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open Razorpay Checkout')),
      );
    }
  }

  Future<void> _createOrder() async {
    if (!ref.read(authProvider.notifier).isLoggedIn) {
      await showSoftLoginSheet(
        context,
        returnTo: '/pay-advance',
        message: 'Login to pay a booking advance.',
      );
      if (!ref.read(authProvider.notifier).isLoggedIn) return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _result = null;
      _checkoutNote = null;
    });
    try {
      final rupees = double.tryParse(_amountCtrl.text.trim()) ?? 0;
      final paise = (rupees * 100).round();
      final api = ref.read(apiClientProvider);
      final data = await api.postData<Map<String, dynamic>>(
        '/payments/orders',
        body: {'amountInPaise': paise},
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      if (!mounted) return;
      setState(() {
        _loading = false;
        _result = data;
      });

      final mock = data['mock'] == true;
      final keyId = data['razorpayKeyId']?.toString();
      final payment = data['payment'] is Map
          ? Map<String, dynamic>.from(data['payment'] as Map)
          : null;
      final orderId = payment?['razorpayOrderId']?.toString();
      final amountInPaise = (payment?['amountInPaise'] as num?)?.toInt() ?? paise;
      final shopName =
          ref.read(publicConfigProvider).valueOrNull?.shopName ?? 'Jewellers';

      if (!mock && keyId != null && keyId.isNotEmpty && orderId != null) {
        await _openRazorpayCheckout(
          keyId: keyId,
          orderId: orderId,
          amountInPaise: amountInPaise,
          shopName: shopName,
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not create payment order';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final flags = ref.watch(featuresProvider).valueOrNull;
    if (flags != null && !flags.razorpayPayments) {
      return Scaffold(
        appBar: AppBar(title: const Text('Pay advance')),
        body: const AppEmptyState(
          title: 'Not available',
          message: 'Advance payments are not enabled for this shop.',
        ),
      );
    }

    final payment = _result?['payment'] is Map
        ? Map<String, dynamic>.from(_result!['payment'] as Map)
        : null;
    final mock = _result?['mock'] == true;

    return Scaffold(
      appBar: AppBar(title: const Text('Pay advance')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Book an item with a small advance. The shop confirms payment in admin.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _amountCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
            decoration: const InputDecoration(
              labelText: 'Amount (₹)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          AppPrimaryButton(
            label: _loading ? 'Creating…' : 'Create payment order',
            onPressed: _loading ? null : _createOrder,
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          if (payment != null) ...[
            const SizedBox(height: 24),
            Text('Order created', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text('Order ID: ${payment['razorpayOrderId']}'),
            Text(
              'Amount: ${formatInr((payment['amountRupees'] as num?)?.toDouble() ?? 0)}',
            ),
            Text('Status: ${payment['status']}'),
            if (mock) ...[
              const SizedBox(height: 8),
              Text(
                'Demo/mock mode — no Razorpay keys. Admin can mark paid via Mark paid or webhook.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ] else if (_checkoutNote != null) ...[
              const SizedBox(height: 8),
              Text(_checkoutNote!, style: Theme.of(context).textTheme.bodySmall),
            ] else if (_result?['razorpayKeyId'] != null) ...[
              const SizedBox(height: 8),
              Text(
                'Opening Razorpay Checkout…',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ],
        ],
      ),
    );
  }
}
