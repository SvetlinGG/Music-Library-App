# SoundVibe – Music Library App

A React app where you can browse classic albums, search the iTunes music library, listen to songs, read band history and keep your own album collection.

## Live Demo

**Deployed app:** https://music-library-sgg.netlify.app/

---

## How to Install and Run

You need [Node.js](https://nodejs.org/) (version 18 or newer).

```bash
# 1. Clone the project
git clone https://github.com/SvetlinGG/Music-Library-App.git
cd Music-Library-App

# 2. Install the packages
npm install

# 3. Start the app (opens on http://localhost:5173)
npm run dev
```

Other commands:

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run build`   | Makes the production build in the `dist` folder |
| `npm run preview` | Runs the production build locally            |
| `npm run lint`    | Checks the code with ESLint                   |

The backend is **Supabase** (already online), so you do not need to start a server.

---

## Tech Stack

- **React 19** + **Vite**
- **React Router** for the pages
- **Supabase** for login, register and the database (comments, collection, favorites)
- **iTunes Search API** for albums, songs and covers
- **Wikipedia API** for band history
- **YouTube API** for playing music
- Plain **CSS files** for styling

---

## Project Architecture

```
Music-Library-App/
├── index.html              # The single HTML page
├── package.json            # Packages and scripts
├── vite.config.js          # Vite settings
├── public/
│   └── _redirects          # Netlify: send every URL to index.html (page refresh works)
├── netlify/functions/
│   └── itunes.mjs          # Small proxy to iTunes (iPhone search fix)
├── supabase/               # SQL for the database tables and security rules
│   ├── comments.sql
│   ├── favorites.sql
│   └── music-collection.sql
└── src/
    ├── main.jsx            # Starts the app: Router + AuthProvider + App
    ├── App.jsx             # All routes (pages) of the app
    │
    ├── api/                # All requests to remote services
    │   ├── auth-Supabase.js         # Register, login, logout, session refresh
    │   ├── comments-Supabase.js     # Comments: create, read, update, delete
    │   ├── collection-Supabase.js   # My Collection: read, add, remove
    │   ├── favorites-Supabase.js    # My Favorites: read, add, remove
    │   ├── user-Supabase-request.js # Supabase URL and public key
    │   ├── iTunes.js                # Search albums / songs / artists, tracklists
    │   ├── wikipedia.js             # Band history text
    │   └── youTubeApi.js            # Find a video and create the player
    │
    ├── contexts/
    │   └── AuthContext.jsx  # Shares the logged-in user across the app
    │
    ├── hooks/               # Custom hooks
    │   ├── useCollection.js # Load / add / remove albums in My Collection
    │   └── useFavorites.js  # Load / add / remove favorites
    │
    ├── components/          # Pages and UI parts
    │   ├── Header.jsx        # Top navigation
    │   ├── ThemeToggle.jsx   # Dark / light mode button
    │   ├── RouteGuards.jsx   # PrivateRoute and GuestRoute
    │   ├── AlbumCatalog.jsx  # Home page – catalog + search
    │   ├── MusicCard.jsx     # One album card in the grid
    │   ├── AlbumDetails.jsx  # Album page – info, tracklist, player
    │   ├── AlbumComments.jsx # Comments under an album
    │   ├── YouTubePlayer.jsx # Plays an album or song
    │   ├── BandHistory.jsx   # Band history from Wikipedia
    │   ├── MyCollection.jsx  # User's collection
    │   ├── MyFavorites.jsx   # User's favorites
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── ErrorPage.jsx     # Shown when something breaks
    │   └── NotFound.jsx      # 404 page
    │
    ├── data/
    │   └── albums.js        # Starting list of classic albums for the home page
    │
    └── styles/              # One CSS file per part of the app
        ├── styles.css
        ├── header.css
        ├── album-catalog.css
        ├── album-details.css
        ├── music-card.css
        ├── collection.css
        ├── favorites.css
        ├── auth.css
        └── error-page.css
```

**How the parts work together:**

1. A **component** (page) needs data.
2. It calls a function from the **`api/`** folder (or a **custom hook** that uses it).
3. The `api/` function sends a `fetch` request to Supabase, iTunes, Wikipedia or YouTube.
4. The component saves the answer in **state** and shows it. While waiting it shows "Loading...", and if something fails it shows an error message.
5. **`AuthContext`** gives every component the current user, so it knows who is logged in.

---

# Functional Guide

## 1. Project Overview

**Application Name:** SoundVibe – Music Library App

**Application Category / Topic:** Music library / social music catalog

**Main Purpose:**
SoundVibe helps music fans find albums and learn about them in one place. You can search any album, song or artist from iTunes, see the tracklist, play songs from YouTube and read the band's history from Wikipedia. Logged-in users can build their own album collection, save favorites and write comments about albums.

## 2. User Access & Permissions

### Guest (Not Authenticated)

- **Available pages / routes:**
  - `/` – Home (album catalog and search)
  - `/albums/:albumId` – Album details
  - `/artists/:artistName` – Band history
  - `/login` and `/register`
- **Public data shown:** the album catalog, search results, album details, tracklist, the music player, band history and all comments (read only).

### Authenticated User

- **Main sections / pages:** everything a guest sees, plus `/my-collection` and `/my-favorites`.
- **Details pages:** the same album and band pages, but now with a comment form and working "Add to Collection" and favorite (♥) buttons.
- **Create / Edit / Delete actions:**
  - Write a comment, and **edit or delete only your own** comments.
  - Add albums to My Collection and remove them.
  - Add albums to My Favorites and remove them.

## 3. Authentication & Session Handling

### Authentication Flow

1. **When the app loads:** `AuthContext` looks in the browser storage for a saved session. If it finds one, the user is logged in right away.
2. **How the status is checked:** every component can call `useAuth()` and read `isLoggedIn` and `user`. Before every private request, `getSession()` checks if the token is expired. If it is, it gets a new token from Supabase automatically.
3. **On successful registration:** the user is sent to the Login page with a success message.
4. **On successful login:** the session is saved and the user goes back to the page they came from (or to Home).
5. **On logout:** the session is deleted from storage and from Supabase, and the user goes to Home.

### Session Persistence

- **Where is it stored?** In React Context (`AuthContext`) while the app runs, and in the browser:
  - **"Remember me" checked** → `localStorage` (stays after closing the browser)
  - **"Remember me" not checked** → `sessionStorage` (deleted when the tab is closed)
- **After a page refresh:** `AuthContext` reads the saved session at startup, so the user stays logged in. If the token is old, it is refreshed automatically.

## 4. Routing Structure

### Route Guards Logic

Routes are split with two guard components in `RouteGuards.jsx`:

- **`PrivateRoute`** – only for logged-in users (`/my-collection`, `/my-favorites`). A guest is sent to `/login` with a message, and after login comes back to the same page.
- **`GuestRoute`** – only for guests (`/login`, `/register`). A logged-in user is sent to Home.

### Main Routes

7 top-level routes + 1 "not found" route:

| Route                  | Page            | Access     |
| ---------------------- | --------------- | ---------- |
| `/`                    | Album Catalog   | Everyone   |
| `/albums/:albumId`     | Album Details   | Everyone   |
| `/artists/:artistName` | Band History    | Everyone   |
| `/login`               | Login           | Guests     |
| `/register`            | Register        | Guests     |
| `/my-collection`       | My Collection   | Logged in  |
| `/my-favorites`        | My Favorites    | Logged in  |
| `*`                    | 404 Not Found   | Everyone   |

### Nested & Parameterized Routes

- **Nested routing:** yes. `PrivateRoute` and `GuestRoute` are layout routes. The protected pages are their child routes and show through `<Outlet />`.
- **URL parameters:**
  - `/albums/:albumId` – the album ID
  - `/artists/:artistName` – the band name

## 5. List → Details Flow

### Catalog / List Page

- **What data is shown?** Album cards with cover, title, artist, year and genre.
- **How the user interacts:**
  - **Search** – type in the search box to search iTunes (waits 0.5 s after you stop typing).
  - **Filter** – choose to search **Albums**, **Songs** or **Artists**.
  - **Sort** – sort the catalog by **Year**, **Artist** or **Title**.

### Details Page

- **How navigation works:** the **Details** button on each card is a `<Link>` to `/albums/:albumId`. `useNavigate` is used for redirects (for example, to Login) and for the "Back" button on the band page.
- **Data from the route parameter:** `useParams()` gives the `albumId`. With it the page loads the album info and tracklist from iTunes and the comments from Supabase. On the band page, `artistName` is used to load the history from Wikipedia.

## 6. Data Source & Backend

### Backend Type

**Real backend – Supabase (Backend-as-a-Service).**

- **Supabase Auth** – register, login, logout and token refresh.
- **Supabase database (PostgreSQL)** with 3 tables: `comments`, `music-collection` and `favorites`.
- **Row Level Security** rules (in the `supabase/` folder) make sure users can only change their own data.

Extra public APIs: **iTunes** (music data), **Wikipedia** (band history) and **YouTube** (music player).

## 7. Data Operations (CRUD)

The full CRUD collection is **Comments** (table `comments`).

### Create (POST)

A logged-in user writes text in the comment form under an album and clicks **Post Comment**. The app sends a `POST` request to Supabase, and the new comment appears at the top of the list.

### Read (GET)

When the Album Details page opens, the comments for that album are loaded with a `GET` request (newest first) and shown under the tracklist. Everyone can read them, including guests.

### Update (PATCH)

- Only the author sees the **✎ Edit** button on their comment. Clicking it turns the comment into a text box with **Save** and **Cancel**.
- On **Save** the app sends a `PATCH` request. The edited comment replaces the old one in the list right away and shows "· edited".

### Delete

- Only the author sees the **🗑 Delete** button. The app asks "Delete this comment?" and the user confirms with **Yes, delete**.
- The app sends a `DELETE` request, and the comment is removed from the list right away.

**Author check:** the Edit / Delete buttons show only for the author. The request also filters by the user's ID, and Supabase security rules block changes to other users' comments.

Other collections: **My Collection** and **My Favorites** support Create, Read and Delete.

## 8. Forms & Validation

### Forms Used

1. **Register form** – username, email, password, confirm password
2. **Login form** – email, password, "Remember me"
3. **Comment form** – add a new comment
4. **Edit comment form** – change your comment
5. **Search form** – search text, search type and sort order on the Home page

### Validation Rules

- **Email (Login / Register):** required, must be a valid email format.
- **Comment text:** required (cannot be empty or only spaces), max **500** characters. A live counter shows `0/500`, and the button is disabled while the text is empty.
- **Password (Register) – multiple rules:**
  - required
  - at least **6** characters
  - must match **Confirm Password**
- **Username (Register):** required, cannot be only spaces.

Errors are shown in red under the form, and the submit button is disabled while the request is running.

## 9. React-Specific Techniques

### Hooks & Component Lifecycle

- **`useState`** – in almost every component (form fields, loading, errors, data).
- **`useEffect`** – loading data (albums, tracklists, comments, band history), the search delay, the YouTube player, the theme.
- **`useContext`** – through `useAuth()`.
- **`useCallback` / `useMemo`** – in `AuthContext` and the custom hooks.
- **React Router hooks** – `useParams`, `useNavigate`, `useLocation`.
- **Custom hooks** – `useCollection`, `useFavorites`, `useAuth`.

**Mount / update / unmount example – `YouTubePlayer`:**
- **Mount:** when it opens, it searches YouTube and creates the video player.
- **Update:** when the user clicks another song, the effect runs again and loads the new video.
- **Unmount:** when the player closes, the cleanup function destroys the player, so the music stops.

The Home page search works the same way. Each new letter clears the old timer in the cleanup function, so the app only searches after the user stops typing.

### Context API

`AuthContext` shares:
- `user` (id, email, username) and `isLoggedIn`
- `login()`, `logout()` and `getSession()` (gives a valid token)

It is used by: `Header`, `Login`, `RouteGuards`, `AlbumCatalog`, `AlbumDetails`, `AlbumComments`, `MyCollection`, `MyFavorites` and the hooks `useCollection` and `useFavorites`.

### Component Styling

Plain **external CSS files** in `src/styles/`, one for each part of the app. CSS variables are used for colors, so the app has **dark and light themes** (the toggle in the header). The layout also works on mobile screens.

## 10. Typical User Flow

1. The user opens the Home page and sees the catalog of classic albums.
2. They search for "Iron Maiden", open an album with **Details** and see the tracklist.
3. They click a song, and it plays in the YouTube player. They also open **Band History**.
4. They try to add a comment, so the app asks them to **Register**, then **Login**.
5. After login they return to the album, post a comment, then edit it.
6. They click **+ Add to Collection** and the ♥ button.
7. They open **My Collection** and **My Favorites** to see their saved albums, and remove one.
8. They click **Logout**.

## 11. Error & Edge Case Handling

- **Authentication errors:**
  - Wrong email or password → "Wrong email or password."
  - Email not confirmed → message asking the user to confirm their email.
  - Email already registered → clear message on the Register page.
  - Expired session → the token is refreshed automatically. If that fails, the user is logged out with a message.
  - A guest opening a private page → sent to Login with a message.
- **Network or data errors:**
  - Every request is wrapped in `try / catch`, so the app does not crash.
  - Pages show "Loading..." while waiting and an error message if the request fails.
  - If an album cannot be loaded, a friendly **Error Page** is shown.
  - If an album cover image fails, a colored cover with the title is shown instead.
- **Empty or missing data states:**
  - Empty collection or favorites → "Your shelf is empty" with a link to the catalog.
  - No comments → "No comments yet. Be the first to share your thoughts!"
  - No tracklist → "No tracklist found for this album."
  - Wrong album ID, wrong band name or wrong URL → **404 Not Found** page.
