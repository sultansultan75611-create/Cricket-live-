# Boundary — Live Cricket Website

A responsive cricket scores website using CricketData API v1.

## Requirements
- Node.js 18 or newer (includes `fetch`)
- A CricketData API key

## Setup
1. Install Node.js.
2. Extract this project folder.
3. Open a terminal in the folder.
4. Run `npm install`.
5. Copy `.env.example` to `.env`.
6. Put your newly generated API key in `.env`:
   `CRICKET_API_KEY=your_key_here`
7. Run `npm start`.
8. Open `http://localhost:3000`.

## Features
- Current matches from `/v1/currentMatches`
- Filters for live, upcoming and completed matches based on API flags
- Search by team, series or venue
- Match details via `/v1/match_info?id=...`
- Automatic refresh every 60 seconds
- Responsive dark sports dashboard

## Security
Never commit `.env` or put the API key in browser JavaScript. The Express server keeps the key on the server. Use HTTPS and configure environment variables with your hosting provider when deploying.

## API notes
The site displays fields returned by your API. Availability of match details, innings scores and team logos depends on the provider's response and your API plan. The current API response is not guaranteed to include ball-by-ball data.


## Deploy free on Render
1. Push this project to a private GitHub repository. Do not upload `.env`; use `.env.example` only as a template.
2. In Render, choose New > Web Service and connect the private GitHub repository.
3. Set Build Command to `npm install` and Start Command to `npm start`.
4. Choose the Free instance plan.
5. In Environment Variables, add `CRICKET_API_KEY` with your newly generated API key. Never put the key in frontend files or commit it.
6. Create the service and wait for deployment to finish. Open the `onrender.com` URL shown in the dashboard.

The included `render.yaml` describes the service, but add the secret `CRICKET_API_KEY` in the Render dashboard. Free services may sleep after inactivity and can take a little time to wake up.
