

# CryptoChat — Encrypted Chat App UI

## Overview
A dark glassmorphism chat application with authentication, real-time encryption demo, message history, and settings. All frontend with mock data — Supabase integration later.

## Design System
- **Theme**: Dark glassmorphism with animated gradient mesh background (cyan + purple blobs)
- **Colors**: Background #0F172A, Cyan accent #06B6D4, Purple accent #A855F7, Glass surfaces with blur(16px)
- **Typography**: Inter font, monospace for encrypted text
- **Border radius**: 24px pages, 16px cards, 12px inputs/buttons, full for pills

## Screens & Features

### 1. Landing / Auth Page
- Centered glass card (max-w 420px) over animated gradient mesh
- "CryptoChat" branding with lock icon
- Tab switcher (Login / Sign Up) with sliding pill indicator
- Login: email, password (show/hide toggle), forgot password link, cyan gradient button
- Sign Up: display name, email, password, confirm password, purple gradient button
- Form states: focus glow, error shake, loading spinner, success checkmark

### 2. Main Chat Layout (3-column)
- **Sidebar (220px)**: User info with initials avatar, nav links (Chats/History/Settings), conversation list with 3 mock chats, encryption mode indicator, logout
- **Chat Window (flex-1)**: Header with user info + mode toggle + shift key input, message bubbles showing original/encrypted/decrypted sections, system messages, date separators, input bar with live character count
- **Encryption Panel (340px)**: Mode info card, live encryption preview (updates per keystroke), session log, symmetric vs asymmetric comparison table

### 3. History Page
- Search input, mode filter dropdown, date range picker (UI only)
- Glass table with timestamp, mode badge, original/encrypted messages, shift key, conversation partner
- Expandable rows showing full message details

### 4. Settings Page
- Profile section: editable display name, read-only email, initials avatar
- Encryption defaults: mode toggle, default shift key
- Session section: clear log + logout buttons

## Key Components
- `GlassCard` — reusable glassmorphism wrapper
- `ModeToggle` — pill toggle for Symmetric/Asymmetric
- `ChatBubble` — sent (3-section) and received variants
- `useCrypto` hook — Caesar cipher + Base64 encoding (client-side)
- Animated gradient mesh background component

## Interactions & Animations
- Chat bubbles fade + slide up on appear
- Mode switch transitions accent colors over 500ms
- Staggered sidebar conversation list fade-in
- Send button scale pulse, input focus glow ring
- Page transitions with fade
- Error shake animation on invalid forms

## Responsive Behavior
- Tablet: encryption panel hidden behind toggle
- Mobile: bottom nav, full-width chat, slide-up encryption panel

