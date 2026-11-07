# Mailbox Order Manager

Demo video: (add link here)

Internal tool for selling pre-warmed Google/Microsoft mailboxes.

## Setup
1. `cp .env.example .env`
2. `docker compose up -d`
3. `npm install`
4. `npm run db:migrate`
5. `npm run db:seed`

## Run
- App: `npm run dev` (http://localhost:3000)
- Worker: `npm run worker`

## Logins
- Admin: admin@example.com / admin123
- Customer: customer@example.com / customer123

## Tests
`npm run test`

## Known limitations
- Worker crash may leave an order in PROVISIONING.
- Provider provisioning is mocked with random ~20% failure.
- No real email sending.
