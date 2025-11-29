/**
 * Mock implementation for next-auth/react used in Cosmos
 */

export const useSession = () => ({
  data: {
    user: {
      email: 'cosmos@example.com',
      name: 'Cosmos User',
    },
  },
  status: 'authenticated' as const,
})

export const signIn = () => {}
export const signOut = () => {}
