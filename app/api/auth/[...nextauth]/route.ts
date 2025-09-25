/**
 * NextAuth configuration options for authentication.
 *
 * - Uses MongoDB as the database for user management.
 * - Provides a credentials-based authentication provider using email and password.
 * - Passwords are validated using bcrypt.
 * - Session strategy is JWT-based.
 * - Custom sign-in page is set to `/auth/signin`.
 * - Session callback attaches the user ID from the JWT token to the session user object.
 * - The secret for NextAuth is loaded from the environment variable `NEXTAUTH_SECRET`.
 *
 * @see https://next-auth.js.org/configuration/options
 * @see https://next-auth.js.org/providers/credentials
 */
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

async function findUserByEmail(email: string) {
  await client.connect();
  const db = client.db();
  const user = await db.collection('User').findOne({ email });
  return user;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await findUserByEmail(credentials.email);
        console.log('Authorize debug:', {
          credentials,
          user,
          passwordMatch: user ? await bcrypt.compare(credentials.password, user.passwordHash) : null,
        });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        // NextAuth expects an object with at least an id and email
        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
