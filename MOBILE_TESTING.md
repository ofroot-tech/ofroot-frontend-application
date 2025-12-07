/**
 * Mobile Testing Checklist
 *
 * Before shipping the conversion funnel to production, test these viewports:
 *
 * DEVICES & SIZES:
 *  - iPhone 12 (390×844, 2x)
 *  - iPhone SE (375×667, 2x)
 *  - iPad (768×1024, 2x)
 *  - Android (360×800, 3x) — Samsung Galaxy S10
 *  - Desktop (1440×900) — reference baseline
 *
 * PAGES TO TEST (Priority Order):
 *  1. /  (Homepage)
 *  2. /consulting (Consulting page)
 *  3. /pricing (Pricing page)
 *  4. /consulting/book (Booking page + Calendly widget)
 *
 * CRITICAL CHECKS:
 *
 * HomePage (/)
 *  ✓ Hero: Headline and CTA stack vertically on mobile
 *  ✓ Features: Grid switches from 3-col to 1-col below md breakpoint
 *  ✓ Buttons: Full-width or stacked CTA buttons on small screens
 *  ✓ Text sizes: Readable without zooming (min 16px on inputs)
 *  ✓ Navbar: Hamburger menu works, drawer slides from right
 *  ✓ Footer: Links stack vertically on mobile
 *
 * Consulting Page (/consulting)
 *  ✓ Hero: Service list readable on mobile
 *  ✓ Engagements: 4-step process displays as vertical stack
 *  ✓ Cards: Spacing and padding consistent
 *  ✓ CTA: "Book a Call" button is tappable (min 44×44px)
 *
 * Pricing Page (/pricing)
 *  ✓ Tier cards: Stack vertically below lg breakpoint
 *  ✓ Pricing: Numbers readable without horizontal scroll
 *  ✓ Comparison table: Horizontal scroll with sticky first column (if needed)
 *  ✓ CTA buttons: Full width below md breakpoint
 *  ✓ FAQ: Accordion or vertical list is expanded clearly
 *
 * Booking Page (/consulting/book)
 *  ✓ Two-column layout: Stacks to single column below lg (this is critical)
 *  ✓ Calendly widget: Responsive to viewport width
 *  ✓ Widget height: Taller on mobile (800px) for scroll room
 *  ✓ Pre-call form: IFrame renders without overflow
 *  ✓ Touch targets: All buttons have 44×44px minimum
 *
 * COMMON MOBILE ISSUES TO WATCH:
 *  ✗ Horizontal scrolling (except intentional overflow)
 *  ✗ Text smaller than 16px (causes mobile zoom on tap)
 *  ✗ Buttons smaller than 44×44px (Apple's tap target size)
 *  ✗ Fixed headers blocking content
 *  ✗ Form inputs without proper padding
 *  ✗ Calendly embed breaking layout
 *  ✗ Images not respecting max-width: 100%
 *
 * PERFORMANCE CHECKS:
 *  ✓ Lighthouse score on mobile: Target 85+ (Performance)
 *  ✓ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
 *  ✓ Script loads don't block render: lazyOnload for Calendly/JotForm
 *
 * TESTING TOOLS:
 *  1. Chrome DevTools: F12 → Toggle device toolbar (Ctrl+Shift+M)
 *  2. Real device testing: iOS/Android phones if available
 *  3. Lighthouse: Chrome DevTools → Lighthouse tab
 *  4. WebPageTest: https://www.webpagetest.org
 *  5. BrowserStack: Cross-browser mobile testing (paid)
 *
 * COMMANDS TO RUN:
 *  npm run dev        # Start local server
 *  npm run build      # Full production build
 *  npm run test       # Run unit tests
 *
 * TESTING WORKFLOW:
 *  1. Start dev server: npm run dev
 *  2. Open in Chrome: http://localhost:3000
 *  3. Press F12, toggle device toolbar (Ctrl+Shift+M)
 *  4. Select iPhone 12 from device menu
 *  5. Scroll through each page and check boxes above
 *  6. Test form submissions (Calendly, pre-call brief)
 *  7. Test navigation (Navbar mobile menu, internal links)
 *  8. Run Lighthouse audit for performance baseline
 *
 * ACCEPTANCE CRITERIA:
 *  ✓ All pages load without horizontal scroll
 *  ✓ Calendly widget is fully visible and tappable
 *  ✓ Forms are submittable on mobile
 *  ✓ Navigation works (hamburger + drawer)
 *  ✓ Lighthouse performance score > 80
 *  ✓ No TypeScript or console errors
 *  ✓ CTA buttons convert (tracking events fire)
 *
 * KNOWN ISSUES & FIXES:
 *
 *  Issue: Calendly embed too small on mobile
 *  Fix: BookingWidget now uses 800px height on mobile (see components/consulting/BookingWidget.tsx)
 *
 *  Issue: Layout shifts on form load
 *  Fix: PreCallBriefForm has min-height to prevent CLS
 *
 *  Issue: Hamburger menu doesn't close after navigation
 *  Fix: Navbar's closeMobileMenu() is called on link click
 *
 * DATES TESTED:
 *  - 2025-12-07: Initial build, schema.org added, layouts responsive
 *
 * NEXT STEPS:
 *  1. Manual mobile testing on real devices
 *  2. A/B test CTA copy ("Book Discovery Call" vs "Schedule Now")
 *  3. Monitor Calendly booking completion rate
 *  4. Check Sentry for any mobile-specific errors
 *  5. Optimize images (WebP with fallback)
 */

// This file is documentation. No export needed.
