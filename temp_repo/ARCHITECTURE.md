# 🌌 Nexora: Trading Universe - System Architecture

## 1. Domain Entities & ERD
- **User**: Profile, Balance (Simulated), XP, Level, Avatar, Language Preference.
- **Trade**: Market, Entry/Exit Price, Size, Leverage, Unrealized/Realized P&L.
- **Course**: Title, Chapters, AI Summary, Quiz Status.
- **Achievement**: BadgeName, Description, Unlock Criteria, Icon.

## 2. Authentication Context
- **Lite**: Basic access, 1H Chart resolution.
- **Pro**: Advanced indicators, Lower spreads, Exclusive education.
- **Admin**: CRM tools, user management, market manual adjustments.

## 3. Real-time Market Sync
- We utilize an Express proxy to aggregate market prices from public APIs (Binance/CoinGecko) and push them via Firebase/WebSockets to ensure zero-lag "Cinematic" ticker updates.

## 4. Multilingual Foundation
- i18next initialized with `detectBrowserLanguage`.
- Namespaces: `common`, `trading`, `education`, `auth`.

## 5. Scalability Path
- Component-driven development with CSS-in-JS (Tailwind) for consistent design across hundreds of modules.
- Serverless Cloud Functions to handle "Trade Closure" calculations to maintain data integrity.
