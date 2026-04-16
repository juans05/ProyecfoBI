import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-options"

// @ts-ignore - Adaptando authOptions de v4 a v5
export const { auth, handlers, signIn, signOut } = NextAuth(authOptions)
