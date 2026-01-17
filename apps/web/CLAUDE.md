# Frontend Context

## Purpose

Next.js 16 dashboard for real-time server monitoring with modern React 19 features and Tailwind CSS 4 styling.

## Tech Stack

- **Framework**: Next.js 16.1 with App Router
- **React**: 19.2 (with new features: async components, use hook)
- **Styling**: Tailwind CSS 4 (native CSS engine)
- **TypeScript**: 5.x with strict mode
- **Linting**: ESLint 9 with next config

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group: Auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/       # Route group: Protected routes
│   │   ├── layout.tsx     # Dashboard shell (sidebar, nav)
│   │   ├── page.tsx       # Main dashboard
│   │   ├── monitors/
│   │   │   ├── page.tsx   # Monitor list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Monitor details
│   │   │       └── logs/
│   │   │           └── page.tsx   # Ping logs
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/               # API routes (optional BFF layer)
│   │   └── auth/
│   │       └── [...]/
│   ├── layout.tsx         # Root layout (fonts, providers)
│   ├── page.tsx          # Landing page
│   └── globals.css       # Tailwind directives
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   ├── monitors/         # Feature components
│   │   ├── monitor-card.tsx
│   │   ├── monitor-form.tsx
│   │   ├── monitor-status.tsx
│   │   └── ping-chart.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/
│   ├── api.ts            # API client (fetch wrapper)
│   ├── auth.ts           # Auth utilities
│   ├── utils.ts          # General utilities (cn, etc.)
│   └── constants.ts      # App constants
├── hooks/
│   ├── use-monitors.ts   # Monitor data hooks
│   ├── use-auth.ts       # Auth state hook
│   └── use-websocket.ts  # Real-time updates
├── types/
│   ├── monitor.ts        # Monitor types
│   ├── ping-log.ts       # PingLog types
│   └── user.ts           # User types
└── public/               # Static assets
    ├── favicon.ico
    └── images/
```

## Architecture Patterns

### App Router Fundamentals

**Server Components (Default)**
- Async components that fetch data directly
- No `'use client'` directive needed
- Cannot use hooks (useState, useEffect)
- Ideal for data fetching, static content

```typescript
// app/(dashboard)/monitors/page.tsx
export default async function MonitorsPage() {
  const monitors = await getMonitors(); // Direct fetch
  return <MonitorList monitors={monitors} />;
}
```

**Client Components**
- Add `'use client'` at the top
- Use React hooks, event handlers
- Interactive forms, real-time updates

```typescript
'use client';
import { useState } from 'react';

export function MonitorForm() {
  const [url, setUrl] = useState('');
  // ...
}
```

### Route Groups

**Auth Routes** (`(auth)/`)
- Public pages: login, register
- Shared layout with centered form
- No navigation sidebar

**Dashboard Routes** (`(dashboard)/`)
- Protected routes (require auth)
- Shared layout with sidebar + header
- All monitor management pages

### Data Fetching Patterns

**Server-Side Fetching** (Recommended for initial load)
```typescript
async function getMonitors(userId: string) {
  const res = await fetch(`${process.env.API_URL}/api/v1/uptime/monitors`, {
    headers: { 
      'Authorization': `Bearer ${await getServerToken()}`,
    },
    cache: 'no-store', // Always fresh data
    // OR: cache: 'force-cache' for static data
    // OR: next: { revalidate: 60 } for ISR
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

**Client-Side Fetching** (For real-time updates)
```typescript
'use client';
import useSWR from 'swr'; // Install: npm i swr

export function MonitorStats({ id }: { id: string }) {
  const { data, error, mutate } = useSWR(
    `/api/v1/uptime/monitors/${id}/logs`,
    fetcher,
    { refreshInterval: 30000 } // Poll every 30s
  );

  if (error) return <ErrorState />;
  if (!data) return <LoadingSkeleton />;
  
  return <StatsDisplay data={data} />;
}
```

## TypeScript Types (Based on Prisma Schema)

### Monitor Type
```typescript
// types/monitor.ts
export enum Status {
  PENDING = 'PENDING',
  UP = 'UP',
  DOWN = 'DOWN'
}

export interface Monitor {
  id: string;
  userId: string;
  name: string;
  url: string;
  frequency: number;        // Check interval in seconds
  isActive: boolean;
  nextCheck: string;        // ISO datetime
  lastCheck: string | null; // ISO datetime
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonitorDto {
  name: string;
  url: string;
  frequency?: number; // Optional, defaults to 60
}
```

### PingLog Type
```typescript
// types/ping-log.ts
export interface PingLog {
  id: string;
  monitorId: string;
  statusCode: number;       // HTTP status (200, 404, 500)
  durationMs: number;       // Response time
  error: string | null;
  timestamp: string;        // ISO datetime
  success: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorStats {
  uptime: number;           // Percentage
  avgResponseTime: number;  // Milliseconds
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
}
```

### User Type
```typescript
// types/user.ts
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
```

## Styling with Tailwind CSS 4

### Setup
Tailwind 4 uses native CSS engine (no PostCSS needed in most cases).

**globals.css**:
```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... custom CSS variables */
  }
}
```

### Common Patterns

**Responsive Design**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

**Dark Mode** (if implementing):
```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* Automatic theme switching */}
</div>
```

**Status Badge**:
```tsx
export function StatusBadge({ status }: { status: Status }) {
  const variants = {
    UP: 'bg-green-100 text-green-800',
    DOWN: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
      {status}
    </span>
  );
}
```

## Forms & Validation

### Recommended Stack
Install these for production-ready forms:
```bash
npm install react-hook-form zod @hookform/resolvers
```

### Form Example
```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const monitorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  frequency: z.number().min(30, 'Minimum 30 seconds').default(60)
});

type MonitorFormData = z.infer<typeof monitorSchema>;

export function CreateMonitorForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<MonitorFormData>({
    resolver: zodResolver(monitorSchema)
  });

  const onSubmit = async (data: MonitorFormData) => {
    const res = await fetch('/api/v1/uptime/monitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // Handle response...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input {...register('name')} className="..." />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      {/* More fields... */}
    </form>
  );
}
```

## Authentication

### Token Storage
**Recommended**: httpOnly cookies (most secure)

```typescript
// lib/auth.ts
export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include', // Send cookies
    body: JSON.stringify({ email, password })
  });
  
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function getSession() {
  // Server-side only
  const token = cookies().get('auth_token');
  if (!token) return null;
  // Verify token...
}
```

### Protected Routes
```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

## Real-Time Updates

### Option 1: Polling with SWR
```typescript
'use client';
import useSWR from 'swr';

export function LiveMonitorStatus({ id }: { id: string }) {
  const { data } = useSWR(
    `/api/v1/uptime/monitors/${id}`,
    fetcher,
    { refreshInterval: 10000 } // Poll every 10s
  );
  
  return <StatusDisplay status={data?.status} />;
}
```

### Option 2: WebSocket (Install socket.io-client)
```typescript
'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useMonitorUpdates(monitorId: string) {
  const [status, setStatus] = useState<Status>();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!);
    
    socket.emit('subscribe', { monitorId });
    socket.on('monitor-update', (data) => {
      setStatus(data.status);
    });

    return () => {
      socket.emit('unsubscribe', { monitorId });
      socket.disconnect();
    };
  }, [monitorId]);

  return status;
}
```

## Environment Variables

### Public Variables (Prefix: NEXT_PUBLIC_)
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

**Usage**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// Available in both server and client components
```

### Private Variables (Server-side only)
```bash
DATABASE_URL=postgresql://...
API_SECRET_KEY=...
```

**Usage**: Only in Server Components, API routes, server actions

## Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/ping-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Client-side only
});
```

### Font Optimization
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Loading & Error States

### Loading UI
```tsx
// app/(dashboard)/monitors/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-20 bg-gray-200 animate-pulse rounded" />
      <div className="h-20 bg-gray-200 animate-pulse rounded" />
    </div>
  );
}
```

### Error Boundary
```tsx
// app/(dashboard)/monitors/error.tsx
'use client';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Try again
      </button>
    </div>
  );
}
```

### Not Found
```tsx
// app/(dashboard)/monitors/[id]/not-found.tsx
export default function NotFound() {
  return <h2>Monitor not found</h2>;
}
```

## Common Component Patterns

### Monitor Card
```tsx
import { Monitor } from '@/types/monitor';
import { StatusBadge } from '@/components/ui/status-badge';

export function MonitorCard({ monitor }: { monitor: Monitor }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{monitor.name}</h3>
        <StatusBadge status={monitor.status} />
      </div>
      <p className="text-sm text-gray-600 mt-2">{monitor.url}</p>
      <div className="flex items-center gap-4 mt-4 text-sm">
        <span>Checks every {monitor.frequency}s</span>
        {monitor.lastCheck && (
          <span>Last: {new Date(monitor.lastCheck).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}
```

### Data Table
```tsx
export function MonitorsTable({ monitors }: { monitors: Monitor[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">URL</th>
          <th className="text-left p-2">Status</th>
          <th className="text-left p-2">Frequency</th>
        </tr>
      </thead>
      <tbody>
        {monitors.map(monitor => (
          <tr key={monitor.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{monitor.name}</td>
            <td className="p-2">{monitor.url}</td>
            <td className="p-2"><StatusBadge status={monitor.status} /></td>
            <td className="p-2">{monitor.frequency}s</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Development Commands

```bash
# Start dev server
npm run dev
# http://localhost:3000

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Important Rules & Best Practices

1. **Server vs Client**: Default to Server Components, only use Client Components when needed (interactivity, hooks)
2. **Environment Variables**: Public vars MUST have `NEXT_PUBLIC_` prefix
3. **Images**: Always use `next/image` for automatic optimization
4. **Fonts**: Use `next/font` for optimal font loading
5. **API Calls**: Use absolute URLs in Server Components, relative in Client Components
6. **Error Handling**: Implement error.tsx boundaries for graceful failures
7. **Loading States**: Add loading.tsx for better UX during data fetching
8. **TypeScript**: Enable strict mode, define types for all API responses
9. **Accessibility**: Use semantic HTML, ARIA labels where needed
10. **SEO**: Export `metadata` object from pages for proper meta tags

## Metadata for SEO

```typescript
// app/(dashboard)/monitors/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monitors | Uptime Dashboard',
  description: 'Manage and monitor your servers',
};

export default function MonitorsPage() {
  // ...
}
```

## Debugging Tips

1. **React DevTools**: Install browser extension
2. **Next.js Debug**: `DEBUG=* npm run dev` for verbose logs
3. **Network Tab**: Monitor API calls, check request/response
4. **Server Logs**: Server component console.logs appear in terminal
5. **Client Logs**: Client component logs appear in browser console

## Common Issues & Solutions

### Issue: "use client" not working
- Ensure directive is at the very top of the file
- Check for any comments or imports above it

### Issue: Environment variables undefined
- Public vars need `NEXT_PUBLIC_` prefix
- Restart dev server after adding new variables
- Check `.env.local` exists and is in `.gitignore`

### Issue: Hydration mismatch
- Server and client rendered different HTML
- Avoid `localStorage`, `window` in Server Components
- Use `useEffect` for client-only logic

### Issue: Fetch not working in Server Component
- Use absolute URLs (http://localhost:4000/...)
- Check CORS if calling external API
- Verify API is running

## Recommended Next Steps

1. **Install UI Library**: Consider shadcn/ui for pre-built components
2. **Add State Management**: Zustand or Jotai for complex client state
3. **Implement Auth**: NextAuth.js for complete auth solution
4. **Add Testing**: Vitest + React Testing Library
5. **Setup Analytics**: Vercel Analytics or Google Analytics
6. **Error Tracking**: Sentry for production error monitoring