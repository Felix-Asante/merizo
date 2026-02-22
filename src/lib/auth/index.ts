import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

import db from "../db/pg";
import * as schemas from "../db/pg/drizzle/schemas";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schemas,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // requireEmailVerification: false,
  },
  plugins: [
    organization({
      schema: {
        organization: {
          additionalFields: {
            inviteCode: {
              type: "string",
              required: true,
              unique: true,
              input: true,
              returned: true,
            },
            currency: {
              type: "string",
              required: true,
              unique: false,
              input: true,
              returned: true,
            },
            type: {
              type: "string",
              required: false,
              input: true,
              returned: true,
            },
          },
        },
      },
    }),
  ],
});
