<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lNo_V1NfckGIbTX5F6uU8YV8zvn8KZfD

## Run Locally (Web Version)

**Prerequisites:** Node.js

1.  **Install dependencies:**
    `npm install`
2.  **Set up your environment variables:**
    Create a file named `.env.local` in the root of the project and add the following line, replacing `your_api_key_here` with your actual Gemini API key:
    `VITE_GEMINI_API_KEY=your_api_key_here`
3.  **Run the app:**
    `npm run dev`

## Run Locally (Desktop App)

**Prerequisites:** Node.js

1.  **Follow all the steps for the Web Version.**
2.  **Run the Electron app in development mode:**
    `npm run electron:dev`
3.  **To build the distributable application:**
    `npm run electron:build`
    The output will be in the `release` directory.
