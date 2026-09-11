import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import {
  requireAdmin,
  requireAdminOrCustomer,
  requireCustomer,
} from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest, unauthorized } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  createOrGetThread,
  getThreadForActor,
  listAdminThreads,
  listCustomerThreads,
  listMessages,
  markThreadRead,
  patchThreadStatus,
  sendMessage,
} from './chat.service';

export const chatRouter = Router();

const chatMessageLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    if (req.admin?.id) return `chat:admin:${req.admin.id}`;
    if (req.customer?.id) return `chat:customer:${req.customer.id}`;
    return 'chat:anonymous';
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'CHAT_RATE_LIMITED',
        message: 'Too many messages. Try again in a minute.',
        details: {},
      },
      meta: { requestId: res.locals.requestId },
    });
  },
});

const statusEnum = z.enum(['open', 'pending_customer', 'pending_staff', 'closed']);

chatRouter.post(
  '/chat/threads',
  requireFeature('chat'),
  requireCustomer,
  async (req, res, next) => {
    try {
      const body = z
        .object({
          itemId: z.string().optional().nullable(),
          subject: z.string().max(200).optional().nullable(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid thread payload', body.error.flatten()));
      }
      const result = await createOrGetThread({
        customerId: req.customer!.id,
        itemId: body.data.itemId,
        subject: body.data.subject,
      });
      return sendSuccess(res, result, result.created ? 201 : 200);
    } catch (err) {
      return next(err);
    }
  },
);

chatRouter.get(
  '/chat/threads',
  requireFeature('chat'),
  requireCustomer,
  async (req, res, next) => {
    try {
      const data = await listCustomerThreads(req.customer!.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

chatRouter.get(
  '/admin/chat/threads',
  requireFeature('chat'),
  requireAdmin,
  async (req, res, next) => {
    try {
      const query = z
        .object({
          status: statusEnum.optional(),
        })
        .safeParse(req.query);
      if (!query.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid query', query.error.flatten()));
      }
      const data = await listAdminThreads(query.data);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

chatRouter.get(
  '/chat/threads/:id',
  requireFeature('chat'),
  requireAdminOrCustomer,
  async (req, res, next) => {
    try {
      const thread = await getThreadForActor({
        threadId: req.params.id,
        customerId: req.customer?.id,
        isAdmin: Boolean(req.admin),
      });
      return sendSuccess(res, { thread });
    } catch (err) {
      return next(err);
    }
  },
);

chatRouter.get(
  '/chat/threads/:id/messages',
  requireFeature('chat'),
  requireAdminOrCustomer,
  async (req, res, next) => {
    try {
      const query = z
        .object({
          limit: z.coerce.number().int().positive().max(100).optional(),
          cursor: z.string().optional(),
        })
        .safeParse(req.query);
      if (!query.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid query', query.error.flatten()));
      }
      const data = await listMessages({
        threadId: req.params.id,
        customerId: req.customer?.id,
        isAdmin: Boolean(req.admin),
        limit: query.data.limit,
        before: query.data.cursor,
      });
      return sendSuccess(res, data, 200, {
        pagination: { nextCursor: data.nextCursor, hasMore: Boolean(data.nextCursor) },
      });
    } catch (err) {
      return next(err);
    }
  },
);

chatRouter.post(
  '/chat/threads/:id/messages',
  requireFeature('chat'),
  requireAdminOrCustomer,
  chatMessageLimiter,
  async (req, res, next) => {
    try {
      const body = z
        .object({
          body: z.string().max(4000).optional().nullable(),
          attachmentUrls: z.array(z.string().url()).max(10).optional(),
          clientMessageId: z.string().min(8).max(100).optional().nullable(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid message payload', body.error.flatten()));
      }

      if (!req.admin && !req.customer) {
        return next(unauthorized('AUTH_REQUIRED', 'Authentication required'));
      }

      const result = await sendMessage({
        threadId: req.params.id,
        senderType: req.admin ? 'staff' : 'customer',
        senderId: req.admin ? req.admin.id : req.customer!.id,
        body: body.data.body,
        attachmentUrls: body.data.attachmentUrls,
        clientMessageId: body.data.clientMessageId,
        customerId: req.customer?.id,
        isAdmin: Boolean(req.admin),
      });
      return sendSuccess(res, result, result.created ? 201 : 200);
    } catch (err) {
      return next(err);
    }
  },
);

chatRouter.post(
  '/chat/threads/:id/read',
  requireFeature('chat'),
  requireAdminOrCustomer,
  async (req, res, next) => {
    try {
      const thread = await markThreadRead({
        threadId: req.params.id,
        customerId: req.customer?.id,
        isAdmin: Boolean(req.admin),
      });
      return sendSuccess(res, { thread });
    } catch (err) {
      return next(err);
    }
  },
);

chatRouter.patch(
  '/chat/threads/:id',
  requireFeature('chat'),
  requireAdmin,
  async (req, res, next) => {
    try {
      const body = z.object({ status: statusEnum }).safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid patch payload', body.error.flatten()));
      }
      const thread = await patchThreadStatus({
        threadId: req.params.id,
        status: body.data.status,
      });
      return sendSuccess(res, { thread });
    } catch (err) {
      return next(err);
    }
  },
);
