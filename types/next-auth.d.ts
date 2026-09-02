import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
  }
}

// next-auth/jwt yalnızca @auth/core/jwt modülünü yeniden dışa aktardığı için
// JWT arayüzü doğrudan kaynağında genişletilir.
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
