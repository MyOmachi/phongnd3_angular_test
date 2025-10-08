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
    - 200 OK → Token valid; user data returned.
    - 401 Unauthorized → Token expired or invalid.
- This helps verify token hydration and automatic redirect behaviour.
- The DummyJSON API accepts only **integer** values for `expiresInMins`; `1` minute is the minimum.

<img width="1909" height="951" alt="image" src="https://github.com/user-attachments/assets/555026dd-bab4-490b-bd03-3770ed98f127" />

### Logout

- Added **Logout button** in the toolbar.
- Redirects back to `/login`.

### Infinite Scroll

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
Login with account emilys / emilyspass

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

The most challenging part was combining Angular’s @defer rendering with the infinite scroll directive.
@defer delays DOM creation, while the scroll directive relies on a visible element for its IntersectionObserver. When both ran together, the observer sometimes triggered too early or not at all because the deferred content wasn’t rendered yet.

- The Fix

Used a single scroll mechanism — kept only the appInfiniteScroll directive for clarity and predictable behavior.

Completed deferred views manually before initializing the observer, ensuring the target element exists in the DOM.

Separated rendering and data loading, letting @defer handle visuals while signals and services manage data flow.

Used Angular signals to sync DOM readiness with scroll state efficiently.

- Result

Smooth, consistent infinite scroll behavior.

No double triggers or missed loads.

Cleaner, more maintainable code with clear render–fetch separation.
