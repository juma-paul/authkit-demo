# AuthKit Demo — Reference Client

> Production-ready frontend for the AuthKit API — featuring OAuth, 2FA, secure session management, and a polished responsive UI.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

[Live Demo](https://authkit-demo-six.vercel.app) | [Features](#features) | [Getting Started](#getting-started) | [Screenshots](#demo)

---

## About

This is the **reference client** for [AuthKit](https://github.com/juma-paul/authkit), a multi-tenant identity API. It demonstrates how to integrate AuthKit into a real application with production-quality UX patterns.

**Why this project stands out:**

- Implements complete authentication flows (not just login/register)
- Handles edge cases: token refresh, session expiry, rate limiting, account recovery
- Production-quality error handling and user feedback
- Mobile-first responsive design
- Clean, maintainable code architecture

## Tags

`nextjs` `react` `typescript` `tailwindcss` `authentication` `oauth` `2fa` `shadcn-ui` `axios` `zod`

## Tech Stack

| Category             | Technology                     |
| -------------------- | ------------------------------ |
| **Framework**        | Next.js 16 (App Router)        |
| **Language**         | TypeScript                     |
| **Styling**          | Tailwind CSS 4                 |
| **UI Components**    | shadcn/ui + Radix UI           |
| **Forms**            | React Hook Form + Zod          |
| **State Management** | React Context + TanStack Query |
| **HTTP Client**      | Axios with interceptors        |
| **Notifications**    | Sonner                         |
| **Icons**            | Lucide React                   |
| **Image Upload**     | Cloudinary                     |

## Features

### Identity & Authentication

- **Email/Password Login** — Traditional authentication with validation
- **OAuth Integration** — Google and GitHub social login
- **User Registration** — With email verification flow
- **Password Reset** — Secure forgot password with email link
- **Session Management** — Automatic token refresh, secure logout

### Security

- **Two-Factor Authentication (2FA)** — TOTP-based with QR code or manual setup
- **Backup Codes** — Emergency recovery codes for 2FA
- **Account Soft Delete** — 30-day recovery window
- **Account Restoration** — Recover deleted accounts via email
- **Rate Limit Handling** — Graceful degradation with user feedback

### User Experience

- **Responsive Design** — Mobile-first with bottom navigation drawer
- **Toast Notifications** — Contextual feedback for all actions
- **Loading States** — Visual feedback during async operations
- **Form Validation** — Real-time validation with Zod schemas
- **Avatar Upload** — Cloudinary integration for profile images

### Profile Management

- **Update Profile** — Name, avatar customization
- **Change Email** — With verification
- **Change Password** — With session invalidation
- **2FA Management** — Enable/disable with verification

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Backend API running (see [AuthKit](https://github.com/juma-paul/authkit))

### Installation

```bash
# Clone the repository
git clone https://github.com/juma-paul/authkit-demo.git
cd authkit-demo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
# NEXT_PUBLIC_API_KEY=your_tenant_api_key
# NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo

**Live Demo:** [authkit-demo-six.vercel.app](https://authkit-demo-six.vercel.app)

**Video Walkthrough:**

[![AuthKit Demo](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

> _Click to watch the full demo on YouTube_

### Screenshots

<div align="center">

#### Login & Registration

| Login                           | Register                              | 2FA Verification            |
| ------------------------------- | ------------------------------------- | --------------------------- |
| ![Login](screenshots/login.png) | ![Register](screenshots/register.png) | ![2FA](screenshots/2fa.png) |

#### Profile Management

| Profile                             | 2FA Setup                               | Mobile View                       |
| ----------------------------------- | --------------------------------------- | --------------------------------- |
| ![Profile](screenshots/profile.png) | ![2FA Setup](screenshots/2fa-setup.png) | ![Mobile](screenshots/mobile.png) |

</div>

## Development

### How I Built It

The Axios interceptor automatically handles authentication edge cases:

**Token Refresh:**

1. Queues failed requests during refresh
2. Refreshes the access token via `/auth/refresh`
3. Retries queued requests with new token

**Rate Limiting:**

1. Detects 429 responses
2. Shows user-friendly toast notification
3. Dispatches custom event for global handling

**Mobile Responsiveness:**

- Bottom navigation bar on mobile devices
- Sidebar converts to slide-out drawer
- Touch-friendly input sizing
- Responsive grid layouts

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Register  │────>│   Verify    │────>│    Login    │
│             │     │    Email    │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┤
                    │                          │
                    ▼                          ▼
            ┌─────────────┐           ┌─────────────┐
            │  2FA Check  │           │  Dashboard  │
            │ (if enabled)│           │             │
            └──────┬──────┘           └─────────────┘
                   │
                   ▼
            ┌─────────────┐
            │  Enter Code │
            │  or Backup  │
            └──────┬──────┘
                   │
                   ▼
            ┌─────────────┐
            │  Dashboard  │
            └─────────────┘
```

### What I Learned

- **Token Refresh Race Conditions** — Frontend interceptors need request queuing during refresh to avoid multiple refresh calls
- **Toast Timing** — Matching toast duration with navigation delays prevents jarring UX
- **Mobile-First 2FA** — QR codes need a manual entry alternative for same-device setup

### Future Improvements

- [ ] Add dark mode toggle
- [ ] Implement remember me functionality
- [ ] Add biometric authentication support
- [ ] Offline-first with service workers

## Project Structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register, etc.)
│   ├── (dashboard)/       # Protected pages (chat, profile)
│   └── api/               # API utilities and interceptors
├── components/
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile management components
│   ├── shell/             # Layout components (Sidebar, BottomNav)
│   └── ui/                # shadcn/ui components
├── providers/             # React Context providers
├── lib/                   # Utilities and helpers
└── types/                 # TypeScript type definitions
```

## Related Projects

- **[AuthKit](https://github.com/juma-paul/authkit)** — The multi-tenant identity API that powers this frontend. Deploy once, use across all your projects.

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with Next.js, TypeScript, and Tailwind CSS as a reference implementation for AuthKit.**

If you found this helpful, consider giving it a star
<img src="https://github.githubassets.com/images/icons/emoji/unicode/2b50.png" 
     height="18" 
     style="vertical-align: text-bottom;" />

</div>
