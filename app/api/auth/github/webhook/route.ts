import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const secret = process.env.WEBHOOK_SECRET || 'your-generated-secret';

export async function POST(request: NextRequest) {
  // Get the raw request body as an ArrayBuffer and convert to a Buffer
  const buf = await request.arrayBuffer();
  const body = Buffer.from(buf);

  // Get the signature from GitHub
  const signature = request.headers.get('x-hub-signature-256') || '';

  // Create HMAC digest using the secret and the raw body
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(body).digest('hex');

  // Verify that the computed digest matches the signature provided by GitHub
  if (signature !== digest) {
    return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
  }

  // Process your webhook payload
  // For example, parse the payload if needed:
  // const payload = JSON.parse(body.toString());

  return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
}
