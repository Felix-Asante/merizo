import type {
  LoginSchemaInput,
  SignupSchemaInput,
} from "@/validation/auth-validation";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/types/users";

export interface AuthInterface {
  signup: (body: SignupSchemaInput) => Promise<User>;
  login: (body: LoginSchemaInput) => Promise<User>;
}

export type AuthClient = typeof authClient;
