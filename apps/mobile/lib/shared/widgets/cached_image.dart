import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'app_skeleton.dart';

/// Applies Cloudinary delivery transforms for list thumbs when URL is Cloudinary.
String cloudinaryThumbUrl(String url, {int width = 400, int? height}) {
  if (url.isEmpty) return url;
  if (!url.contains('res.cloudinary.com') || !url.contains('/upload/')) {
    return url;
  }
  final transform = height != null
      ? 'c_fill,w_$width,h_$height,q_auto,f_auto'
      : 'c_limit,w_$width,q_auto,f_auto';
  return url.replaceFirst('/upload/', '/upload/$transform/');
}

class AppCachedImage extends StatelessWidget {
  const AppCachedImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.borderRadius,
    this.thumb = false,
    this.thumbWidth = 400,
  });

  final String url;
  final BoxFit fit;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  /// When true, rewrite Cloudinary URLs to a bounded thumb transform.
  final bool thumb;
  final int thumbWidth;

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return _placeholder(context);
    }

    final resolved = thumb ? cloudinaryThumbUrl(url, width: thumbWidth) : url;

    final image = CachedNetworkImage(
      imageUrl: resolved,
      fit: fit,
      width: width,
      height: height,
      placeholder: (context, url) =>
          const AppSkeleton(height: double.infinity, borderRadius: 0),
      errorWidget: (context, url, error) => _placeholder(context),
    );

    if (borderRadius != null) {
      return ClipRRect(borderRadius: borderRadius!, child: image);
    }
    return image;
  }

  Widget _placeholder(BuildContext context) {
    return Container(
      width: width,
      height: height,
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      alignment: Alignment.center,
      child: Icon(
        Icons.image_outlined,
        color: Theme.of(context).colorScheme.onSurfaceVariant,
      ),
    );
  }
}
