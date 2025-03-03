// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

// export function middleware(req: NextRequest) {
//   const token = req.headers.get('Authorization')?.split(' ')[1];

//   if (!token) {
//     return NextResponse.json(
//       {
//         success: false,
//         status: 401,
//         statusText: 'Unauthorized - No token provided',
//       },
//       { status: 401 }
//     );
//   }

//   try {
//     console.log('in moddel waew');
//     const decodedToken = jwt.verify(token, JWT_SECRET);
//     req.headers.set('x-user-id', decodedToken.userId); // Pass userId to downstream handlers
//     return NextResponse.next(); // Proceed to the route handler
//   } catch (err) {
//     console.error('JWT Verification Error:', err);
//     return NextResponse.json(
//       {
//         success: false,
//         status: 401,
//         statusText: 'Unauthorized - Invalid token',
//       },
//       { status: 401 }
//     );
//   }
// }

// export const config = {
//   matcher: ['/api/:path*'], // Apply middleware only to API routes
// };
