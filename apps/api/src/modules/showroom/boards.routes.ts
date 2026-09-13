import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import { deleteBoard, listAdminBoards, listPublicBoards, upsertBoard } from './boards.service';

export const boardsRouter = Router();

boardsRouter.get('/boards', requireFeature('curatedBoards'), async (_req, res, next) => {
  try {
    const data = await listPublicBoards();
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

boardsRouter.get(
  '/admin/boards',
  requireAdmin,
  requireFeature('curatedBoards'),
  async (_req, res, next) => {
    try {
      const data = await listAdminBoards();
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);

boardsRouter.post(
  '/admin/boards',
  requireAdmin,
  requireFeature('curatedBoards'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(120),
          itemIds: z.array(z.string()).optional(),
          sortOrder: z.number().int().optional(),
          isActive: z.boolean().optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid board', body.error.flatten()));
      }
      const board = await upsertBoard(body.data);
      return sendSuccess(res, { board }, 201);
    } catch (err) {
      return next(err);
    }
  },
);

boardsRouter.patch(
  '/admin/boards/:id',
  requireAdmin,
  requireFeature('curatedBoards'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(120),
          itemIds: z.array(z.string()).optional(),
          sortOrder: z.number().int().optional(),
          isActive: z.boolean().optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return next(badRequest('VALIDATION_ERROR', 'Invalid board', body.error.flatten()));
      }
      const board = await upsertBoard({ id: req.params.id, ...body.data });
      return sendSuccess(res, { board });
    } catch (err) {
      return next(err);
    }
  },
);

boardsRouter.delete(
  '/admin/boards/:id',
  requireAdmin,
  requireFeature('curatedBoards'),
  async (req, res, next) => {
    try {
      const data = await deleteBoard(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  },
);
