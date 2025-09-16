
/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporarily disabled NextAuth due to build issues
// import NextAuth from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'

// const authOptions = {
//   providers: [
//     ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
//       GoogleProvider({
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       }),
//     ] : []),
//   ],
//   callbacks: {
//     async redirect({ url, baseUrl }: any) {
//       console.log('NextAuth redirect called:', { url, baseUrl })
//       console.log('NEXTAUTH_URL env var:', process.env.NEXTAUTH_URL)
//       // Allows relative callback URLs
//       if (url.startsWith("/")) return `${baseUrl}${url}`
//       // Allows callback URLs on the same origin
//       else if (new URL(url).origin === baseUrl) return url
//       return baseUrl
//     },
//     async session({ session, token }: any) {
//       console.log('NextAuth session callback:', { session, token })
//       return session
//     },
//     async jwt({ token, account, profile }: any) {
//       console.log('NextAuth JWT callback:', { token, account, profile })
//       return token
//     },
//   },
//   pages: {
//     signIn: '/',
//     error: '/',
//   },
//   session: {
//     strategy: 'jwt' as const,
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   debug: process.env.NODE_ENV === 'production',
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Auth temporarily disabled' }, { status: 503 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Auth temporarily disabled' }, { status: 503 });
}
