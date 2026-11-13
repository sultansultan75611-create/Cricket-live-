# Cricket Live — live API starter

This starter connects the Cricket Live site to Cricket Data (formerly CricAPI).

## Setup
1. Create an API account at https://cricketdata.org/ (if account registration is permitted under the provider's terms; otherwise ask a parent/guardian to help).
2. Install Node.js 18 or newer.
3. Copy `.env.example` to `.env` and add your API key.
4. Run `npm install`, then `npm start`.
5. Open http://localhost:3000

**Keep the API key private.** It belongs only in `.env` on the server. Do not put it in the HTML file, publish it in a repository, or send it in chat.

## Routes
- `GET /api/matches` proxies the provider's `currentMatches` endpoint.
- `GET /api/scorecard/:matchId` proxies `match_scorecard`.
- `GET /api/health` confirms whether a key is configured without revealing it.

## Free-tier usage
Cricket Data currently advertises 100 requests/day for its basic current-matches endpoint. This starter refreshes every 20 minutes (about 72 match-list requests/day if left open continuously), leaving some room for scorecard calls. Confirm current quotas and terms in your provider account.

## Notes
The live connection will only work after a valid key is added and the Node server is run/deployed. I cannot verify live responses without an account key. Provider fields may differ between matches; unavailable fields are labelled unavailable, not invented.
