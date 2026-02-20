import { authClient } from "@/lib/auth/client";
import type { AuthClient, AuthInterface } from "./interface";

export function createAuthService(client: AuthClient): AuthInterface {
  return {
    async signup(body) {
      const { data, error } = await client.signUp.email({
        email: body.email,
        password: body.password,
        name: body.name,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data!.user;
    },

    async login(body) {
      const { data, error } = await client.signIn.email({
        email: body.email,
        password: body.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data!.user;
    },
  };
}

export const authService = createAuthService(authClient);
