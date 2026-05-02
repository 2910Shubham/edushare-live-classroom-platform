import { NextRequest, NextResponse } from 'next/server';
import { parseResCloudinaryUrl, signedCloudinaryUrl } from '@/lib/cloudinary-delivery';

const ALLOWED_HOSTS = ['res.cloudinary.com', 'cloudinary.com'];

function browserLikeHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: '*/*',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  };
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (app) {
    try {
      headers.Referer = `${new URL(app).origin}/`;
    } catch {
      /* ignore invalid NEXT_PUBLIC_APP_URL */
    }
  }
  return headers;
}

async function fetchDelivery(url: string): Promise<Response> {
  return fetch(url, { headers: browserLikeHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('url');
    const deliveryExt = searchParams.get('deliveryExt');

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing file URL parameter' }, { status: 400 });
    }

    const decodedUrl = decodeURIComponent(fileUrl);

    try {
      const url = new URL(decodedUrl);
      if (!ALLOWED_HOSTS.some((host) => url.hostname.includes(host))) {
        return NextResponse.json({ error: 'Unauthorized file source' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // For raw Cloudinary URLs, try to convert to public URL first
    let fetchUrl = decodedUrl;
    const parsed = parseResCloudinaryUrl(decodedUrl);
    
    if (parsed && parsed.resourceType === 'raw') {
      console.log('Proxy: Converting raw Cloudinary URL to public URL');
      // Try to get a signed URL for raw resources
      const signed = signedCloudinaryUrl(parsed);
      if (signed) {
        console.log('Proxy: Using signed URL for raw resource');
        fetchUrl = signed;
      }
    }
    
    let response = await fetchDelivery(fetchUrl);
    const firstCldError = response.headers.get('x-cld-error');

    if (!response.ok && response.status === 401) {
      const parsed = parseResCloudinaryUrl(decodedUrl);
      const signed = parsed ? signedCloudinaryUrl(parsed) : null;
      if (signed) {
        response = await fetchDelivery(signed);
      }
    }

    if (!response.ok) {
      const errLower = (firstCldError ?? '').toLowerCase();
      const deliveryBlocked =
        response.status === 401 &&
        (errLower.includes('deny') ||
          errLower.includes('acl') ||
          errLower.includes('pdf') ||
          errLower.includes('restricted'));
      return NextResponse.json(
        {
          error: 'Failed to fetch file from storage',
          code: deliveryBlocked ? 'CLOUDINARY_DELIVERY_BLOCKED' : 'FETCH_FAILED',
          hint: deliveryBlocked
            ? 'Cloudinary is blocking this file. In the Cloudinary console: Settings → Security → enable “Allow delivery of PDF and ZIP files”. Re-upload materials after enabling, or ensure the asset is public.'
            : firstCldError
              ? `Cloudinary: ${firstCldError}`
              : undefined,
        },
        { status: response.status },
      );
    }

    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    const pathname = new URL(decodedUrl).pathname.toLowerCase();
    const extHint = deliveryExt?.toLowerCase();
    const pathHasPpt = pathname.endsWith('.ppt') || pathname.endsWith('.pptx');
    if (
      (extHint === 'ppt' || extHint === 'pptx') &&
      !pathHasPpt &&
      !contentType.includes('presentation') &&
      !contentType.includes('officedocument')
    ) {
      contentType =
        extHint === 'ppt'
          ? 'application/vnd.ms-powerpoint'
          : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    }
    if (pathname.endsWith('.pdf') && !contentType.toLowerCase().includes('pdf')) {
      contentType = 'application/pdf';
    }
    if (pathname.endsWith('.ppt') || pathname.endsWith('.pptx')) {
      if (!contentType.includes('presentation') && !contentType.includes('officedocument')) {
        contentType = pathname.endsWith('.pptx')
          ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          : 'application/vnd.ms-powerpoint';
      }
    }
    if (pathname.endsWith('.doc') || pathname.endsWith('.docx')) {
      if (!contentType.includes('word') && !contentType.includes('officedocument')) {
        contentType = pathname.endsWith('.docx')
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/msword';
      }
    }

    const headers = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600',
    });

    if (contentType.includes('pdf') || contentType.includes('application/')) {
      headers.set('Content-Disposition', 'inline');
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
