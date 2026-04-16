<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/56adc57e-8bf8-48ae-bc04-8af9670bf7ca

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy (GitHub Pages)

This uses the [`gh-pages`](https://www.npmjs.com/package/gh-pages) CLI so you can publish without a GitHub Actions workflow (GitHub OAuth tokens often lack the `workflow` scope needed to push `.github/workflows`).

1. Push source to `main` as usual.
2. **Settings → Pages → Build and deployment**: set **Source** to **Deploy from a branch**, branch **`gh-pages`**, folder **`/ (root)`**.
3. From your machine (with `GEMINI_API_KEY` in `.env.local` if you need it at build time):

   ```bash
   npm install
   npm run deploy
   ```

   That builds `dist` and pushes it to the `gh-pages` branch.

Site URL: `https://adelaideW.github.io/PDF-envelopes---Coachmark/`
