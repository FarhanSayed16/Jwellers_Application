import { LegalShell } from '@/components/legal/LegalShell';

export default function PrivacyPolicyPage() {
  return (
    <LegalShell title="Privacy policy">
      <p>
        This app is operated by the jewellery retailer (the <strong>Shop</strong>) using the
        Jwellers white-label platform. For customer personal data, the Shop is the data
        controller. This page describes how the customer mobile app and related APIs handle
        information.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Phone number (OTP login)</li>
        <li>Optional display name</li>
        <li>Wishlist, enquiries, custom requests, and in-app chat messages you send</li>
        <li>Device push token (FCM) when you enable notifications</li>
        <li>Images you upload for chat or custom requests (via Cloudinary)</li>
        <li>Basic technical logs (request IDs, IP for rate limiting / security)</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>Authenticate you and keep you signed in</li>
        <li>Save wishlist and conversation history with the Shop</li>
        <li>Notify you about rates, chat replies, or new arrivals (if enabled)</li>
        <li>Prevent abuse (OTP and API rate limits)</li>
      </ul>

      <h2>Third parties</h2>
      <ul>
        <li>SMS OTP: MSG91 (when configured)</li>
        <li>Image hosting: Cloudinary</li>
        <li>Push: Firebase Cloud Messaging</li>
        <li>Hosting: cloud providers used by the Shop (e.g. Render / Vercel / MongoDB Atlas)</li>
        <li>Payments: Razorpay only if that module is enabled</li>
      </ul>

      <h2>Retention & deletion</h2>
      <p>
        You can delete your account in the app (Account → Delete account). We soft-delete your
        profile, anonymize your phone number, revoke sessions, deactivate push tokens, and clear
        your wishlist. The same phone can register again later as a new profile. Chat or enquiry
        history may be retained by the Shop for business records as permitted by law.
      </p>
      <p>
        Web / Play listing path:{' '}
        <a className="underline" href="/legal/delete-account">
          Delete my account / data
        </a>
        .
      </p>

      <h2>Contact</h2>
      <p>
        For privacy requests, contact the Shop using the phone or email shown in the app About
        screen, or email the support address published with the Play listing.
      </p>
    </LegalShell>
  );
}
