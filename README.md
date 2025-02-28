# CommunityPulse

CommunityPulse is a map-based platform for citizens to post, upvote, and collaborate on local community issues. It helps bridge the gap between citizens and local government, making it easier for community concerns to be heard and addressed.

## Features

- 🗺️ Interactive map showing community issues
- 📝 Report new issues with details, location, and photos
- 👍 Upvote issues that matter to you
- 💬 Comment on issues to provide additional information
- 🔍 Filter and sort issues by status, category, and popularity
- 🏛️ Connect with government representatives based on issue type
- 📊 View heatmaps of issue density and popularity

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Mapping**: Mapbox GL JS / React Map GL
- **State Management**: Zustand
- **Form Handling**: React Hook Form, Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works fine)
- Mapbox account (for map functionality)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/communitypulse.git
cd communitypulse
```

2. Install dependencies:

```bash
npm install
```

3. Create a Supabase project:

   - Go to [Supabase](https://supabase.com) and create a new project
   - Copy your project URL and anon key
   - Run the SQL script in `supabase/schema.sql` in the Supabase SQL editor to set up the database schema

4. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key
   - Add your Mapbox access token

```bash
cp .env.local.example .env.local
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The easiest way to deploy the application is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set the environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
