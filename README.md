# Glam by Lulu

The public site stores its data in Supabase. There is no local database and no Docker.

The app uses the project at `NEXT_PUBLIC_SUPABASE_URL` with the service role key on the server only. Copy `.env.example` to `.env` and fill in the Supabase URL, anon key, and service role key. Do not commit `.env`.

## Run

```bash
npm install
npm run db:seed
npm run dev
```

Open http://localhost:3000.

`npm run db:seed` loads the sample catalogue. `npm run db:reset-demo` removes rows marked as demo and keeps real enquiries, subscribers, and orders.

Sample sign-in password: `DemoPass123!`

- amina.waweru@example.com
- faith.njeri@example.com
- wanjiku.aoko@example.com
- studio@glambylulu.co.ke (studio desk at `/admin`)

The sample catalogue is demonstration data.

## Database

Tables are created in the `public` schema with a `glam_` prefix. The SQL is in `prisma/migrations/20261022120000_glam_init/migration.sql`. Row level security is enabled. The server uses the service role key, which bypasses those policies. The anon key is not given write access.

M-Pesa, email, image hosting, and maps stay empty until those keys are added. Checkout saves an order as pending payment and does not charge a phone.
