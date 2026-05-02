import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    // Reconstruct the original Cloudinary URL from the slug
    const { slug } = await params;
    const cloudinaryUrl = `https://res.cloudinary.com/${slug.join('/')}`;
    
    console.log('Public Document API: Requesting:', cloudinaryUrl);
    
    // Validate the URL to prevent SSRF attacks
    const allowedHosts = ['res.cloudinary.com', 'cloudinary.com'];
    
    try {
      const url = new URL(cloudinaryUrl);
      if (!allowedHosts.some(host => url.hostname.includes(host))) {
        return NextResponse.json({ error: 'Unauthorized file source' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the file from Cloudinary
    const response = await fetch(cloudinaryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      }
    });
    
    console.log('Public Document API: Response status:', response.status);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status });
    }

    // Get the content type and determine if we need to modify it
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    const pathname = new URL(cloudinaryUrl).pathname.toLowerCase();
    
    // Fix MIME type for PPT files if needed
    if (pathname.includes('/raw/upload/') && pathname.includes('ppt') && !contentType.includes('presentation')) {
      if (pathname.includes('pptx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      } else {
        contentType = 'application/vnd.ms-powerpoint';
      }
      console.log('Public Document API: Fixed MIME type to:', contentType);
    }
    
    // Create a new response with proper headers for external viewers
    const headers = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': 'inline', // Important for viewers
    });

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Public Document API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
