import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';

/// Pick an image and upload to Cloudinary via signed POST /media/sign.
Future<String> pickAndUploadCloudinaryImage({
  required ApiClient api,
  required String purpose,
  ImageSource source = ImageSource.gallery,
}) async {
  final picker = ImagePicker();
  final file = await picker.pickImage(
    source: source,
    maxWidth: 2048,
    maxHeight: 2048,
    imageQuality: 85,
  );
  if (file == null) {
    throw ApiException(code: 'CANCELLED', message: 'No image selected');
  }

  final sign = await api.postData<Map<String, dynamic>>(
    '/media/sign',
    body: {'purpose': purpose, 'resourceType': 'image'},
    parse: (json) => Map<String, dynamic>.from(json as Map),
  );

  final uploadUrl = sign['uploadUrl']?.toString();
  if (uploadUrl == null || uploadUrl.isEmpty) {
    throw ApiException(code: 'SIGN_FAILED', message: 'Missing upload URL');
  }

  final form = FormData.fromMap({
    'file': await MultipartFile.fromFile(
      file.path,
      filename: file.name,
    ),
    'api_key': sign['apiKey']?.toString() ?? '',
    'timestamp': sign['timestamp']?.toString() ?? '',
    'signature': sign['signature']?.toString() ?? '',
    'folder': sign['folder']?.toString() ?? '',
  });

  final bare = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
    ),
  );
  final res = await bare.post<Map<String, dynamic>>(uploadUrl, data: form);
  final secureUrl = res.data?['secure_url']?.toString();
  if (secureUrl == null || secureUrl.isEmpty) {
    debugPrint('Cloudinary upload response: ${res.data}');
    throw ApiException(code: 'UPLOAD_FAILED', message: 'Upload did not return secure_url');
  }
  return secureUrl;
}
