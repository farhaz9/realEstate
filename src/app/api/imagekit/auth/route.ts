
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// This is a placeholder API route.
// It demonstrates how you would generate an authentication signature on the backend.
// To make this work, you need to:
// 1. Ensure your environment variables are set correctly in your hosting environment.
// 2. This endpoint would be called by your frontend before an upload is initiated.

export async function GET(request: Request) {
  // Do not expose your private key to the client-side.
  // This endpoint should be the ONLY place your private key is used.
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    return NextResponse.json(
        { error: 'ImageKit environment variables are not configured.' },
        { status: 500 }
    );
  }

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error('Error generating ImageKit authentication parameters:', error);
    return NextResponse.json(
        { error: 'Failed to generate authentication signature.' },
        { status: 500 }
    );
  }
}
