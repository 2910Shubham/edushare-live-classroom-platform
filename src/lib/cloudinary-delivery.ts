import cloudinary from '@/lib/cloudinary';

const EXT = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ppt',
  'pptx',
  'doc',
  'docx',
]);

export type ParsedCloudinaryDelivery = {
  cloudName: string;
  resourceType: 'image' | 'video' | 'raw';
  version?: number;
  publicId: string;
  format?: string;
};

/**
 * Parse https://res.cloudinary.com/{cloud}/{resource}/upload/...
 */
export function parseResCloudinaryUrl(urlStr: string): ParsedCloudinaryDelivery | null {
  try {
    const u = new URL(urlStr);
    if (u.hostname !== 'res.cloudinary.com') return null;
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length < 4 || segments[2] !== 'upload') return null;

    const cloudName = segments[0];
    const rt = segments[1];
    if (rt !== 'image' && rt !== 'video' && rt !== 'raw') return null;

    let i = 3;
    while (i < segments.length && segments[i].includes(',')) {
      i++;
    }
    let version: number | undefined;
    if (/^v\d+$/.test(segments[i] ?? '')) {
      version = parseInt(segments[i].slice(1), 10);
      i++;
    }

    const joined = segments.slice(i).join('/');
    if (!joined) return null;

    let publicId = joined;
    let format: string | undefined;
    if (rt === 'raw') {
      // Raw assets use the full public_id path including extension (e.g. edushare/file.pdf).
      publicId = joined;
      format = undefined;
    } else {
      const lastDot = joined.lastIndexOf('.');
      if (lastDot > 0) {
        const ext = joined.slice(lastDot + 1).toLowerCase();
        if (EXT.has(ext)) {
          format = ext === 'jpeg' ? 'jpg' : ext;
          publicId = joined.slice(0, lastDot);
        }
      }
    }

    return { cloudName, resourceType: rt, version, publicId, format };
  } catch {
    return null;
  }
}

/**
 * Build a time-limited signed delivery URL (for ACL / strict delivery modes).
 */
export function signedCloudinaryUrl(parsed: ParsedCloudinaryDelivery): string | null {
  const expectedCloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!expectedCloud || parsed.cloudName !== expectedCloud) return null;
  if (!process.env.CLOUDINARY_API_SECRET?.trim()) return null;

  try {
    const opts: Record<string, unknown> = {
      resource_type: parsed.resourceType,
      secure: true,
      sign_url: true,
      type: 'upload',
    };
    if (parsed.version != null && !Number.isNaN(parsed.version)) {
      opts.version = parsed.version;
    }
    if (parsed.format && parsed.resourceType !== 'raw') {
      opts.format = parsed.format;
    }

    return cloudinary.url(parsed.publicId, opts);
  } catch {
    return null;
  }
}
