/**
 * lib/auth-options.ts
 * Configuración de NextAuth v5 con Credentials Provider
 */

import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthService } from '@/domains/auth/auth.service'
import { LoginSchema } from '@/domains/auth/auth.schema'

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await AuthService.verifyCredentials(
          parsed.data.email,
          parsed.data.password
        )

        return user ?? null
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isRoot = (user as any).isRoot || false
        token.companyId = (user as any).companyId || null
        token.companyName = (user as any).companyName || 'Sistema'
        token.profiles = (user as any).profiles ?? []
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).isRoot = token.isRoot
        ;(session.user as any).companyId = token.companyId
        ;(session.user as any).companyName = token.companyName
        ;(session.user as any).profiles = token.profiles
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
}
