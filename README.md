# PhongND3Shop - Angular E-commerce Application

## 1) Goal

I created small app that demonstrates an **infinite-scroll product list**, simple **favourites** management, and **login**, with a clean, maintainable **unit test** suite.

## 2) What I used

- **Angular v20** with **standalone components** and **signals** for simple local state.
- **NgRx** for long-lived app state (user, favourites).
- **Angular Material** for basic UI.
- **Tailwind** for styling
- **Deferrable views (`@defer`)** to postpone rendering heavy parts for a snappier feel.
- A single **infinite scroll directive** to load the next page when the list nears the end.

## 3) What I built

- **Products**: server-side pagination + infinite scroll to load more items.
- **Favourites**: mark/unmark items and keep them in sync with the store.
- **Auth**: a simple login flow that navigates to the products page on success.
- **Tests**: unit tests for components (Products, ProductsList, Favourites), store (actions/reducer/selectors), and effects (login).

## 4) The trickiest part & the fix

**Combining `@defer` with infinite scrolling.** Deferred content can be rendered later, which easily breaks code that touches the DOM too early.

- **Solution**: pick a **single** mechanism for infinite scroll (the directive), and **manually complete** `@defer` in tests. This keeps the code lean and the tests reliable.

## 5) App routes

- When a **not logged-in** user navigates to an **invalid route**, the app **redirects to `/login`**.
- When a **logged-in** user navigates to an **invalid route**, the app **redirects to `/products`** (the main product list).

## 6) “Check token” button (refresh flow demo)

- **What it is:** A small dev/testing button that appears **only when logged in**.
- **Where:** Top toolbar, next to **Logout**.
- **What it does:** Sends a request to the protected endpoint **`/auth/me`** using the current **Bearer access token**.
- **Why it matters:** Most of the app’s calls (e.g., `/products`) are public and won’t 401 when the access token expires. This button forces a call to a protected API so you can observe the **auto-refresh** behavior.

**Expected behavior**

1. If the access token is **still valid** → `/auth/me` returns **200** (no refresh needed).
2. If the access token is **expired** → the request returns **401**, and the **AuthInterceptor** will:
   - Call **`/auth/refresh`** with the stored refresh token.
   - Save the new tokens.
   - **Retry** the original `/auth/me` call → should now succeed (200).
  

<img width="1909" height="951" alt="image" src="https://github.com/user-attachments/assets/555026dd-bab4-490b-bd03-3770ed98f127" />




> Notes:
>
> - This button doesn’t change app data; it simply “pings” a protected endpoint to exercise the **401 → refresh → retry** flow.
>
