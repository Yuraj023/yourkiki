# Kiki - Your AI Companion Chatbot

## Project Overview

Kiki is a friendly AI companion designed to listen and support you whenever you need someone to talk to.

## How to Run the Project

To run this project locally, follow these steps:

```sh
# Step 1: Navigate to the project directory.
cd chatbot2.0

# Step 2: Install the necessary dependencies.
npm install

# Step 3: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

To build the project for deployment, run:
```sh
npm run build
```

The built files will be available in the `dist` directory.

## Security

This project now uses environment variables to manage sensitive API keys. All sensitive keys are stored in the `.env` file and accessed using Vite's environment variable system (`import.meta.env.VITE_*`). This ensures that sensitive information is not hardcoded in the source code.

## Database Setup

To enable user-specific chat history, you need to set up the database tables in Supabase:

1. Run the SQL commands in `supabase_setup.sql` to set up the profiles table
2. Run the SQL commands in `chat_tables_setup.sql` to set up the conversations and messages tables

## Features

- Real-time chat interface with AI companion
- Responsive design that works on mobile and desktop
- Theme customization (light/dark mode)
- User-specific conversation history persistence
- Settings for customizing the chat experience
- About page with project information
- Feedback form for user input

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript types
└── App.tsx         # Main application component
```

## Development

To contribute to this project:

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.