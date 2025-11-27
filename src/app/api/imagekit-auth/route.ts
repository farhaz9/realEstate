
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function GET(request: NextRequest) {
  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error('Error getting ImageKit authentication parameters:', error);
    return NextResponse.json(
      { error: 'Could not get authentication parameters' },
      { status: 500 }
    );
  }
}
