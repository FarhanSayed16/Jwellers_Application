import { getMongoConnectionState } from '../../db/connection';
import { CategoryModel } from '../../db/models/Category';
import { ChatThreadModel } from '../../db/models/ChatThread';
import { CustomerModel } from '../../db/models/Customer';
import { EnquiryModel } from '../../db/models/Enquiry';
import { ItemModel } from '../../db/models/Item';
import { RateModel } from '../../db/models/Rate';
import { notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

/** Stub dashboard counts — expand as modules land. */
export async function getAdminDashboard() {
  assertDb();

  const [
    itemsTotal,
    itemsActive,
    itemsDraft,
    itemsDeleted,
    categoriesTotal,
    enquiriesOpen,
    chatsOpen,
    customersTotal,
    ratesCount,
  ] = await Promise.all([
    ItemModel.countDocuments({ deletedAt: null }).exec(),
    ItemModel.countDocuments({ deletedAt: null, status: 'active' }).exec(),
    ItemModel.countDocuments({ deletedAt: null, status: 'draft' }).exec(),
    ItemModel.countDocuments({ deletedAt: { $ne: null } }).exec(),
    CategoryModel.countDocuments({ deletedAt: null }).exec(),
    EnquiryModel.countDocuments({
      deletedAt: null,
      status: { $in: ['new', 'in_progress'] },
    }).exec(),
    ChatThreadModel.countDocuments({
      deletedAt: null,
      status: { $in: ['open', 'pending_customer', 'pending_staff'] },
    }).exec(),
    CustomerModel.countDocuments({ deletedAt: null }).exec(),
    RateModel.countDocuments().exec(),
  ]);

  return {
    items: {
      total: itemsTotal,
      active: itemsActive,
      draft: itemsDraft,
      deleted: itemsDeleted,
    },
    categories: { total: categoriesTotal },
    enquiries: { open: enquiriesOpen },
    chats: { open: chatsOpen },
    customers: { total: customersTotal },
    rates: { snapshots: ratesCount },
  };
}
