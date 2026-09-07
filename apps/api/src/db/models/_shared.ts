import { Schema } from 'mongoose';

export const themeTokensSchema = new Schema(
  {
    primary: { type: String, required: true },
    secondary: { type: String, required: true },
    accent: { type: String, required: true },
    background: { type: String, required: true },
    surface: { type: String, required: true },
    textPrimary: { type: String, required: true },
    textSecondary: { type: String, required: true },
    border: { type: String, required: true },
    success: { type: String, required: true },
    warning: { type: String, required: true },
    error: { type: String, required: true },
  },
  { _id: false },
);

export const softDeleteField = {
  deletedAt: { type: Date, default: null },
};
