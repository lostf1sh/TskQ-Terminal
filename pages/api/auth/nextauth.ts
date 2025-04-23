import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        if (
          creds?.username === process.env.ADMIN_USER &&
          creds?.password === process.env.ADMIN_PASS
        ) {
          return { name: "Admin" }
        }
        return null
      }
    })
  ]
})
