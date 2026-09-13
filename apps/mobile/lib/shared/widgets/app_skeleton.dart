import 'package:flutter/material.dart';

class AppSkeleton extends StatelessWidget {
  const AppSkeleton({
    super.key,
    this.height = 16,
    this.width,
    this.borderRadius = 8,
  });

  final double height;
  final double? width;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.surfaceContainerHighest;
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: base.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

class AppSkeletonList extends StatelessWidget {
  const AppSkeletonList({super.key, this.count = 4});

  final int count;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: count,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) =>
          const AppSkeleton(height: 72, borderRadius: 12),
    );
  }
}
