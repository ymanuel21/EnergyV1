/**
 * Shared video upload limits for the CMS.
 * Used by both VideoPicker UI display and client-side validation.
 *
 * These reflect ACTUAL enforced limits from the infrastructure:
 * - Vercel serverless body limit: 4.5 MB (Hobby plan default)
 * - No resolution/duration/bitrate/aspect-ratio limits exist
 */

export const VIDEO_UPLOAD_LIMITS = {
  /** Vercel serverless body limit for multipart uploads (Hobby plan default) */
  maxSizeBytes: 4_500_000, // 4.5 MB
  maxSizeLabel: '4.5 MB',

  /** Accepted MIME types matching the file input accept attribute */
  allowedMimeTypes: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ] as const,

  /** Human-readable format list */
  formatLabel: 'MP4, WebM, MOV',

  /** Not enforced — included for transparency */
  maxResolution: null as string | null, // e.g. '1920×1080'
  maxDuration: null as number | null,    // seconds
} as const;

export type VideoValidationError =
  | { type: 'size'; message: string }
  | { type: 'format'; message: string };

/**
 * Validate a File object against upload limits.
 * Returns an error object if validation fails, or null if valid.
 */
export function validateVideoFile(file: File): VideoValidationError | null {
  // Check file size
  if (file.size > VIDEO_UPLOAD_LIMITS.maxSizeBytes) {
    return {
      type: 'size',
      message: `Video is too large (${(file.size / 1_000_000).toFixed(1)} MB). Maximum allowed is ${VIDEO_UPLOAD_LIMITS.maxSizeLabel}.`,
    };
  }

  // Check MIME type
  if (!VIDEO_UPLOAD_LIMITS.allowedMimeTypes.includes(file.type as any)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return {
      type: 'format',
      message: `Unsupported format${ext ? ` (.${ext})` : ''}. Please upload ${VIDEO_UPLOAD_LIMITS.formatLabel}.`,
    };
  }

  return null;
}
