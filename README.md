# EVA AI - Automated Betting Platform

A complete React application for automated betting management with user dashboard and admin panel.

## Features

### Public Pages
- **Landing Page**: Marketing page with features and benefits
- **How It Works**: Step-by-step guide for users
- **Setup**: Bookmaker list with recommended deposits
- **Past Performance**: Historical performance data
- **Legal Pages**: Terms, Privacy Policy, and Risk Disclaimer

### User Dashboard
- **Dashboard**: Live performance statistics with real-time updates
- **Connect Accounts**: Secure bookmaker account connection flow
- **Profile**: User profile management
- Real-time data synchronization with betting bot system
- Per-bookmaker performance breakdown
- Profit sharing visualization (70% user / 30% EVA AI)

### Admin Panel
- User management and oversight
- View all connected bookmaker accounts
- Update account status (Awaiting → Active)
- View submitted credentials and proof of balance screenshots
- Filter users by status

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)

## Database Schema

### Tables
- `profiles` - User profiles with admin flag
- `bookmaker_accounts` - Bookmaker credentials and connection status
- `user_stats` - Latest performance statistics per user
- `bookmaker_stats` - Per-bookmaker performance breakdown
- `betting_history` - Daily profit history for charts

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have read access to all data
- Service role can update stats (for bot integration)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Bot Integration

The dashboard automatically updates when the betting bot writes data to the database:

### Option A: REST API Integration
Create an endpoint that accepts bot data and writes to Supabase tables.

### Option B: Direct Database Access
Bot system writes directly to:
- `user_stats` table for overall performance
- `bookmaker_stats` table for per-bookmaker data
- `betting_history` table for daily profit records

The frontend subscribes to real-time changes and updates automatically.

## Supported Bookmakers

1. Sportsbet - $250 deposit
2. PointsBet - $250 deposit
3. TAB - $200 deposit
4. Neds - $250 deposit
5. Ladbrokes - $250 deposit
6. Betr - $150 deposit
7. Boombet - $150 deposit

## Key User Flows

### New User Onboarding
1. Sign up with email/password
2. Navigate to Connect Accounts
3. Submit bookmaker credentials for each account
4. Admin reviews and activates accounts
5. Dashboard updates automatically with live data

### Admin Workflow
1. Review new user submissions in Admin Panel
2. Manually integrate credentials into bot system
3. Mark accounts as "Active" in admin panel
4. User dashboard begins showing live data

## Security Features

- Email/password authentication via Supabase Auth
- Encrypted credential storage
- Row Level Security policies
- Screenshot uploads stored in secure Supabase Storage
- Admin role-based access control

## Important Notes

- EVA AI does not hold funds or act as a bookmaker
- No betting or financial advice is provided
- Past performance does not guarantee future returns
- All funds remain in user bookmaker accounts
- Users authorize automated betting via service terms
