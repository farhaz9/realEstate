
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
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    const missingKeys = [
        !publicKey && "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
        !privateKey && "IMAGEKIT_PRIVATE_KEY",
        !urlEndpoint && "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT"
    ].filter(Boolean).join(', ');

    console.error(`ImageKit environment variables are not configured. Missing: ${missingKeys}`);
    return NextResponse.json(
        { message: `ImageKit server configuration error. The following environment variables are missing: ${missingKeys}` },
        { status: 500 }
    );
  }

  const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error('Error generating ImageKit authentication parameters:', error);
    return NextResponse.json(
        { message: 'Failed to generate authentication signature.' },
        { status: 500 }
    );
  }
}
