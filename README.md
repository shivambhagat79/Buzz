# Buzz: A real-time chat app

## Overview

This is a [Next.js](https://nextjs.org/) project designed using NextUI and Tailwind CSS, with the following backend tech stack:

- **_MongoDb_** for database
- **_Express_** for APIs
- **_WebSockets_** for real-time communication and client management
- **_NodeJS_** for run-time environment

## Features

The project has the following features:

- Real-time chats
- Encrypted User authentication and chats using bcrypt
- Real-time user activity tracking to check which users are online
- Fiile sharing

## Getting Started

create and modify the **_.env_** file in /server folder and add the following fields

- **_PORT_** : backend server port
- **_CLIENT_URL_** : url of frontend client
- **_MONGO_URL_** : url of mongoDB server
- **_JWT_SECRET_** : secret to encrypt user tokens on browser

To run the backend server:

```bash
cd /server
node index.js
```

To run the frontend development server:

```bash
cd /client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
