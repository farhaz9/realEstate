
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function GET(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    const missingKeys: string[] = [];
    if (!publicKey) missingKeys.push("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
    if (!privateKey) missingKeys.push("IMAGEKIT_PRIVATE_KEY");
    if (!urlEndpoint) missingKeys.push("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");

    const errorMessage = `ImageKit server configuration error. The following environment variables are missing: ${missingKeys.join(', ')}. Please check your server environment variables.`;
    
    console.error(errorMessage);
    
    return NextResponse.json(
        { message: errorMessage },
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
