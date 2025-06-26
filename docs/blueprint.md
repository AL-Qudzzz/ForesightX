# **App Name**: ForesightX

## Core Features:

- Landing Page: Landing page with a semi-transparent navbar, wallet connection, hero section, and 'How it works' section.
- Prediction Dashboard: Dashboard displaying an active round, countdown timer, AI sentiment analysis, prediction input, action buttons, and pool information.
- User Profile: Profile page showing the user's wallet address and prediction history (round, prediction, result, status).
- Wallet Connection: Connect to MetaMask wallet using window.ethereum and Ethers.js. Show connected/disconnected status and the shortened wallet address.
- AI Sentiment Analysis: Use Google Gemini API, via a Firebase Cloud Function tool, to fetch the sentiment analysis from crypto news headlines.
- Prediction Interaction: Implement a call to a smart contract placeholder upon prediction (UP/DOWN) button clicks to show a 'Transaction in process' notification and 'Transaction successful' on completion.
- Firestore Integration: Use Firestore to store prediction data after each successful blockchain transaction.

## Style Guidelines:

- Use a dark theme (dark mode) throughout the application.
- Primary color: Saturated purple (#A020F0) to represent technological innovation.
- Background color: Dark gray (#282828) for a clean, modern dark mode interface.
- Accent color: Bright blue (#3498DB), analogous to the primary purple, for interactive elements and highlights.
- Headline font: 'Space Grotesk', a sans-serif for a modern and technical look.
- Body font: 'Inter', a sans-serif for clear, readable text throughout the app.
- Use minimalist icons related to cryptocurrency and predictions.
- Employ a clean, modern layout with consistent spacing and alignment.
- Subtle animations when connecting the wallet and processing transactions.