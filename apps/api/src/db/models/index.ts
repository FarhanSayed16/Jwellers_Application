export { ShopConfigModel } from './ShopConfig';
export { AdminUserModel } from './AdminUser';
export { CustomerModel } from './Customer';
export { SessionModel } from './Session';
export { OtpChallengeModel } from './OtpChallenge';
export { CategoryModel } from './Category';
export { ItemModel } from './Item';
export { RateModel } from './Rate';
export { WishlistModel } from './Wishlist';
export { EnquiryModel } from './Enquiry';
export { CustomRequestModel } from './CustomRequest';
export { OfferModel } from './Offer';
export { ChatThreadModel } from './ChatThread';
export { ChatMessageModel } from './ChatMessage';
export { DeviceModel } from './Device';
export { InvoiceModel } from './Invoice';
export { PaymentModel } from './Payment';
export { FeatureEventModel } from './FeatureEvent';
export { AuditLogModel } from './AuditLog';
export { MediaAssetModel } from './MediaAsset';
export { PasswordResetModel } from './PasswordReset';

/** Ensure all models register indexes when syncIndexes is called. */
export async function ensureAllModelsLoaded() {
  await Promise.all([
    import('./ShopConfig'),
    import('./AdminUser'),
    import('./Customer'),
    import('./Session'),
    import('./OtpChallenge'),
    import('./Category'),
    import('./Item'),
    import('./Rate'),
    import('./Wishlist'),
    import('./Enquiry'),
    import('./CustomRequest'),
    import('./Offer'),
    import('./ChatThread'),
    import('./ChatMessage'),
    import('./Device'),
    import('./Invoice'),
    import('./Payment'),
    import('./FeatureEvent'),
    import('./AuditLog'),
    import('./MediaAsset'),
    import('./PasswordReset'),
  ]);
}
