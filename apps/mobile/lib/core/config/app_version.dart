/// SemVer-ish compare: returns negative if a < b, 0 if equal, positive if a > b.
/// Non-numeric segments treated as 0. Ignores build metadata after +.
int compareAppVersions(String a, String b) {
  List<int> parts(String v) {
    final core = v.split('+').first.split('-').first.trim();
    return core
        .split('.')
        .map((p) => int.tryParse(p.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0)
        .toList();
  }

  final pa = parts(a);
  final pb = parts(b);
  final len = pa.length > pb.length ? pa.length : pb.length;
  for (var i = 0; i < len; i++) {
    final x = i < pa.length ? pa[i] : 0;
    final y = i < pb.length ? pb[i] : 0;
    if (x != y) return x - y;
  }
  return 0;
}

bool needsForceUpdate({
  required String currentVersion,
  required String minVersion,
  required bool forceUpdateFlag,
}) {
  if (!forceUpdateFlag) return false;
  return compareAppVersions(currentVersion, minVersion) < 0;
}

bool needsSoftUpdate({
  required String currentVersion,
  required String latestVersion,
}) {
  return compareAppVersions(currentVersion, latestVersion) < 0;
}
