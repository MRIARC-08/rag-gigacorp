// frontend/lib/auth.ts
// NextAuth configuration with Google OAuth

import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session so we can use it in components
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, account, profile }) {
      return token
    }
  },
  
  pages: {
    signIn: "/",   // Redirect to home page for login
  }
}
