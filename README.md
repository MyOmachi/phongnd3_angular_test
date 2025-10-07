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
