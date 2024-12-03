# React Frontend Optimization

This project serves as a template for building Progressive Web Apps (PWAs) that include offline functionality, background syncing, push notifications, and code splitting. The app leverages service workers for offline support and background syncing, ensuring data is kept up-to-date.

## Features

- Progressive Web App (PWA): Works offline and can be installed for use on mobile and desktop.
- Offline Functionality: Create, edit, and delete content without an internet connection. Data is stored using IndexedDB.
- Background Syncing: Changes are automatically synced when the device is online. This sync process updates the server with the most recent data.
- Push Notifications: Notifications alert users to updates and changes within the app.
- Code Splitting: Improves initial load performance by loading only the necessary code.

## Setup Instructions

1. Start the Backend Server and Frontend

   To start the server and frontend together, use the following steps:

   1. Install dependencies: First, navigate to your project directory and install the required dependencies for both the client and server.

      ```bash
      yarn install
      ```

   2. Start both server and frontend: To start both the backend and frontend at the same time, run the dev script from your root project directory. This will run the server (Express API) and the frontend (React app) concurrently.

      ```bash
      yarn dev
      ```

2. Build the Application for Production

   To create a production build of the app (both frontend and backend), run:

   ```bash
   yarn build
   ```

   After building the app, you can start both the server and frontend in production mode using:

   ```bash
   yarn start
   ```

3. Generate VAPID Keys for Web Push

   First, navigate to server directory and run the command:

   ```bash
   npx web-push generate-vapid-keys
   ```

4. ENV

   Create `.env` file for both client and server. See examples:

   [Frontend ENV](client/.env.example)

   [Backend ENV](server/.env.example)
