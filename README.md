# 🛍️ PhongND3Shop – Dummy Shop Web (Angular)

## 1. Overview

This project implements the **Dummy Shop** technical test using **Angular 17+ (standalone components, signals, @if, @defer)**.
It demonstrates authentication, product browsing with infinite scroll, favourites management, and token handling

---

## 2. Core Features (aligned with requirements)

### Login

- Authenticates against `POST https://dummyjson.com/auth/login`.
- Only logged-in users can access other routes.
- Invalid routes are redirected back to the product list (as required).
- Uses **NgRx** to store user state and hydrate it from token on refresh.

> **Note:** Because the DummyJSON backend enforces a minimum `expiresInMins: 1`,
> each access token is valid for about **1 minute**. After that, you will need to log in again.

### Product List

- Loads product data from `GET https://dummyjson.com/auth/products`.
- Each product displays:
  - Image (thumbnail)
  - Title
  - Description
  - Price
  - Button to **mark/unmark as favourite**
- Implements **infinite scroll**.
- Redirects to `/products` automatically after successful login.

### Favourites

- If an item is unmarked here, it stays visible until leaving the page — as requested.
- When revisiting `/favourites`, only currently marked items reappear.

### Check Token (for testers)

- Added a **“Check Token” button** on the header for testers.
- When clicked:
  - Opens the **Network tab** in Developer Tools → You’ll see a `GET /auth/me` request.
  - **Expected results:**
    - ✅ 200 OK → Token valid; user data returned.
    - ❌ 401 Unauthorized → Token expired or invalid.
- This helps verify token hydration and automatic redirect behaviour.
- The DummyJSON API accepts only **integer** values for `expiresInMins`; `1` minute is the minimum.

<img width="1909" height="951" alt="image" src="https://github.com/user-attachments/assets/555026dd-bab4-490b-bd03-3770ed98f127" />

### Logout

- Added **Logout button** in the toolbar.
- Redirects back to `/login`.

### ♾️ Infinite Scroll

- Implemented using a custom directive `appInfiniteScroll`.
- Detects when the bottom element intersects the viewport to trigger loading the next page.
- Used consistently across **Products** and **Favourites** pages.
- Compatible with Angular’s new `@defer` blocks (handled via manual completion in tests).

---

## 3. Technical Stack

| Layer       | Technology                                                                         |
| ----------- | ---------------------------------------------------------------------------------- |
| UI          | Angular Material + Tailwind                                                        |
| State       | NgRx Store + Effects                                                               |
| Data        | DummyJSON API (`https://dummyjson.com`)                                            |
| Routing     | Standalone `app.routes.ts`                                                         |
| Guards      | `authGuard`, `unknownRedirectGuard`                                                |
| Interceptor | `AuthInterceptor` attaches `Authorization` header                                  |
| Testing     | Jasmine + Karma (unit), Cypress (e2e)                                              |
| Coverage    | **81.25% statements**, **83.24% lines**, **65.21% functions**, **59.52% branches** |

---

## 4. How to Run

```bash
npm install
npm start
```

Then open [http://localhost:4200](http://localhost:4200)

---

## 5. How to Test Manually

### A) Happy-path flow

| Step | What to do                                                 | Expected Result                               |
| ---- | ---------------------------------------------------------- | --------------------------------------------- |
| 1    | Go to `/login`                                             | See login form                                |
| 2    | Enter DummyJSON credentials (e.g., `kminchelle / 0lelplR`) | Redirected to `/products`                     |
| 3    | Scroll down                                                | Infinite scroll loads next batch              |
| 4    | Click ❤️ on some products                                  | Favourites marked                             |
| 5    | Visit `/favourites`                                        | Only marked items visible                     |
| 6    | Click “Check Token”                                        | `GET /auth/me` request appears in Network tab |
| 7    | Wait ~1 minute for token expiry, then click again          | 401 appears → app redirects to login          |
| 8    | Click “Logout”                                             | Tokens cleared, returned to login             |

### B) Invalid route behaviour (required by spec)

**Case 1 — Logged IN user**

1. Log in successfully.
2. In the address bar, type an invalid route (e.g., `/abc/does-not-exist`) and press Enter.
3. **Expected:** The app redirects you to **`/products`**.

**Case 2 — NOT logged in**

1. Ensure you’re logged out (click **Logout** or clear session storage).
2. In the address bar, type an invalid route (e.g., `/abc/does-not-exist`) and press Enter.
3. **Expected:** You are redirected to **`/login`**

---

## 6. The Trickiest Part & the Fix

The most challenging part of the project was **combining Angular’s `@defer` rendering mechanism with the infinite scroll feature**.

By design, `@defer` postpones rendering certain template sections until specific conditions are met (like entering the viewport or user interaction).
However, the **Infinite Scroll Directive** depends on the **DOM being fully available** so that its `IntersectionObserver` can track the bottom element correctly.

When both were active:

- The deferred product list template wasn’t rendered yet when the observer initialized.
- The observer would either trigger prematurely or fail entirely because the target element didn’t exist in the DOM.
- This caused inconsistent loading behaviour and race conditions between rendering and data fetching.

### 🧠 The Solution

To solve this cleanly and keep the application stable and testable:

1. **Chose a single scroll mechanism** — kept only the `appInfiniteScroll` directive, removing all extra scroll logic from deferred templates.
   → This ensured a single, predictable trigger for loading more items.
2. **Manually completed deferred views** whenever they were needed for activation logic (e.g., first render of product list).
   → That means the component explicitly waits for deferred rendering to complete before setting up observers.
3. **Refactored product loading flow** so that rendering (`@defer`) and data fetching (HTTP + signals) no longer depend on each other — the directive only reacts once the DOM is ready.
4. **Used Angular signals** to synchronize state updates between rendered elements and observer callbacks without triggering extra change detection cycles.

### ✅ Result

- The UI feels faster because `@defer` still defers heavy DOM sections.
- Infinite scroll triggers consistently and never double-fires.
- The code stays simple: one directive, one observable chain, predictable behaviour.
