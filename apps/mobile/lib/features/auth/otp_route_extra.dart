/// Passed via GoRouter `extra` — never put [devOtp] in the URL query string.
class OtpRouteExtra {
  const OtpRouteExtra({
    required this.phone,
    this.returnTo,
    this.cooldownSeconds = 30,
    this.devOtp,
  });

  final String phone;
  final String? returnTo;
  final int cooldownSeconds;
  final String? devOtp;
}
