/**
 * Shared validation and format rules for forms across the portal.
 * Use for required checks, format validation, and consistent error messages.
 */

/** Public code: alphanumeric with optional dashes (e.g. VE-A1B2-C3D4-E5F6) */
export const PUBLIC_CODE_PATTERN = /^[A-Za-z0-9-]+$/;
export const PUBLIC_CODE_MAX_LENGTH = 64;

/** UNS name: lowercase alphanumeric + hyphen, must end with .uns (e.g. alice.uns) */
export const UNS_NAME_PATTERN = /^[a-z0-9-]+\.uns$/;
export const UNS_NAME_HINT = "Format: name.uns (e.g. alice.uns)";

export const DESCRIPTION_TAG_MAX_LENGTH = 120;
export const ITEM_TAG_MAX_LENGTH = 120;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true };
}

export function validatePublicCode(value: string): ValidationResult {
  const r = validateRequired(value, "Public code");
  if (!r.valid) return r;
  const trimmed = value.trim();
  if (trimmed.length > PUBLIC_CODE_MAX_LENGTH) {
    return {
      valid: false,
      message: `Public code must be ${PUBLIC_CODE_MAX_LENGTH} characters or less.`,
    };
  }
  if (!PUBLIC_CODE_PATTERN.test(trimmed)) {
    return { valid: false, message: "Public code can only contain letters, numbers, and hyphens." };
  }
  return { valid: true };
}

export function validatePrivateCode(value: string): ValidationResult {
  const r = validateRequired(value, "Private code");
  if (!r.valid) return r;
  if (value.length > PUBLIC_CODE_MAX_LENGTH) {
    return {
      valid: false,
      message: `Private code must be ${PUBLIC_CODE_MAX_LENGTH} characters or less.`,
    };
  }
  return { valid: true };
}

export function validateUnsName(value: string): ValidationResult {
  const r = validateRequired(value, "UNS name");
  if (!r.valid) return r;
  const trimmed = value.trim().toLowerCase();
  if (!UNS_NAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message:
        "UNS name must end with .uns (e.g. alice.uns). Use lowercase letters, numbers, and hyphens.",
    };
  }
  return { valid: true };
}

export function validateDescriptionTag(value: string): ValidationResult {
  const r = validateRequired(value, "Description tag");
  if (!r.valid) return r;
  if (value.trim().length > DESCRIPTION_TAG_MAX_LENGTH) {
    return {
      valid: false,
      message: `Description tag must be ${DESCRIPTION_TAG_MAX_LENGTH} characters or less.`,
    };
  }
  return { valid: true };
}

export function validateItemTag(value: string): ValidationResult {
  const r = validateRequired(value, "Item tag");
  if (!r.valid) return r;
  if (value.trim().length > ITEM_TAG_MAX_LENGTH) {
    return { valid: false, message: `Item tag must be ${ITEM_TAG_MAX_LENGTH} characters or less.` };
  }
  return { valid: true };
}

export function validateValueAmount(value: string): ValidationResult {
  const r = validateRequired(value, "Value amount");
  if (!r.valid) return r;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return { valid: false, message: "Value amount must be a positive number." };
  }
  return { valid: true };
}

export function validateQuantity(value: string): ValidationResult {
  const r = validateRequired(value, "Quantity");
  if (!r.valid) return r;
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num) || num < 1) {
    return { valid: false, message: "Quantity must be at least 1." };
  }
  return { valid: true };
}

/** Accepted image MIME types for item upload */
const IMAGE_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
/** Minimum file size: 100 KB */
const IMAGE_MIN_BYTES = 100 * 1024;
/** Maximum file size: 5 MB */
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Validates an image file after upload/selection (run in onChange/onDrop, not before).
 * Checks type and file size.
 */
export function validateImageFile(file: File): ValidationResult {
  if (!IMAGE_ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, message: "Image must be PNG, JPG, or JPEG." };
  }
  if (file.size < IMAGE_MIN_BYTES) {
    return { valid: false, message: "Image must be at least 100 KB." };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { valid: false, message: "Image must be 5 MB or less." };
  }
  return { valid: true };
}
