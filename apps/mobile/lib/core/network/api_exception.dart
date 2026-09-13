class ApiException implements Exception {
  ApiException({
    required this.code,
    required this.message,
    this.statusCode,
    this.details,
  });

  final String code;
  final String message;
  final int? statusCode;
  final Object? details;

  @override
  String toString() => 'ApiException($code): $message';
}

class ApiEnvelope<T> {
  ApiEnvelope({required this.data, this.requestId});

  final T data;
  final String? requestId;
}
