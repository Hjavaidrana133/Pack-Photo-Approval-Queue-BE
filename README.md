# Pack-Photo-Approval-Queue-BE

A Node.js application for tracking and managing packed orders using Redis.

## Features

- Filter and retrieve orders with status "packed"
- Redis integration with RediSearch for efficient filtering
- RESTful API for order management
- Date-based and carrier-based filtering

## Setup

### Prerequisites

- Node.js (>= 18.0.0)
- Redis (with RediSearch module)
- npm or yarn

### Installation

1. Clone the repository
```
git clone
cd Pack-Photo-Approval-Queue-BE
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
```
cp .env.example .env
```
Edit the `.env` file with your Redis configuration.

### Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```