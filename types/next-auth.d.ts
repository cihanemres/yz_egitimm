import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "TEACHER" | "STUDENT";
  }
  interface Session {
    user: {
      id: string;
      role: "TEACHER" | "STUDENT";
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "TEACHER" | "STUDENT";
  }
}
