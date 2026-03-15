import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

/** Allowed MIME types grouped by category */
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf'],
};

/** All allowed MIME types flattened */
const ALL_ALLOWED_MIME_TYPES = Object.values(ALLOWED_MIME_TYPES).flat();

/** Default max file size: 5 MB */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/**
 * Generates a unique filename preserving the original extension.
 */
const generateFilename = (
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = extname(file.originalname);
  callback(null, `${uniqueSuffix}${ext}`);
};

/**
 * Validates uploaded files against allowed MIME types.
 */
const fileFilter = (allowedTypes: string[]): MulterOptions['fileFilter'] => {
  return (_req, file, callback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `File type '${file.mimetype}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        ),
        false,
      );
    }
    callback(null, true);
  };
};

export interface IFileUploadOptions {
  /** Upload destination directory (default: './uploads') */
  destination?: string;
  /** Max file size in bytes (default: 5 MB) */
  maxSize?: number;
  /** Allowed MIME types (default: images + documents) */
  allowedTypes?: string[];
}

/**
 * Creates a standardized Multer configuration.
 *
 * @example
 * // Default config (images + documents, 5 MB, ./uploads)
 * @UseInterceptors(FileInterceptor('file', createUploadOptions()))
 *
 * @example
 * // Images only, 2 MB limit, custom destination
 * @UseInterceptors(FileInterceptor('avatar', createUploadOptions({
 *   destination: './uploads/avatars',
 *   maxSize: 2 * 1024 * 1024,
 *   allowedTypes: ['image/jpeg', 'image/png'],
 * })))
 */
export const createUploadOptions = (
  options?: IFileUploadOptions,
): MulterOptions => {
  const {
    destination = './uploads',
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = ALL_ALLOWED_MIME_TYPES,
  } = options ?? {};

  return {
    storage: diskStorage({
      destination,
      filename: generateFilename,
    }),
    limits: { fileSize: maxSize },
    fileFilter: fileFilter(allowedTypes),
  };
};

/** Pre-built config for image-only uploads */
export const IMAGE_UPLOAD_OPTIONS: IFileUploadOptions = {
  allowedTypes: ALLOWED_MIME_TYPES.image,
};

/** Pre-built config for document-only uploads */
export const DOCUMENT_UPLOAD_OPTIONS: IFileUploadOptions = {
  allowedTypes: ALLOWED_MIME_TYPES.document,
};
