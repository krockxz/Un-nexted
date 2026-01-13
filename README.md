# Un-nexted

> **De-mystifying the meta-framework.** A "build-your-own" implementation of Next.js core features from scratch.

**Un-nexted** is a raw implementation of the server-side rendering (SSR) pipeline that powers modern web frameworks. It strips away the complexity of production codebases to reveal the fundamental architecture: how a server turns React components into HTML strings, and how the browser "hydrates" that static HTML into an interactive app.

##  Why I Built This

I used Next.js daily but treated it as a black box. I knew *how* to use `getServerSideProps` and file-based routing, but I didn't truly understand *how they worked*.

I built **Un-nexted** to answer specific engineering questions:
*   **Routing:** How does a file on a disk (`pages/about.tsx`) become a URL route (`/about`) without me writing a router config?
*   **SSR vs. CSR:** How exactly does the server send HTML that React can "pick up" later?
*   **Hydration:** What actually happens during `hydrateRoot`, and why do hydration mismatch errors occur?
*   **Bundling:** How do we bundle code differently for the server (Node/Bun) vs. the browser?

**Key Insight:** Next.js is "just" React + a Compiler + a Server. The "magic" is mostly string manipulation, glob patterns, and careful state synchronization.

***

##  Architecture

The project implements the "Isomorphic" React flow in four distinct stages:

1.  **The Build Step (Bundler):**
    *   Uses `Bun.build` to compile client-side code.
    *   Separates server-only logic (secrets, DB calls) from client bundles.
2.  **The Server (SSR):**
    *   Interlopes requests and matches URLs to file paths.
    *   Executes `getServerSideProps` to fetch data.
    *   Renders the component tree to a string using `react-dom/server`.
3.  **The Transport:**
    *   Injects initial data (`__UNNEXTED_DATA__`) into the HTML window object so the client doesn't need to refetch data.
4.  **The Client (Hydration):**
    *   The browser loads the JS bundle.
    *   React reads the server-rendered HTML and attaches event listeners (Hydration).

***

##  Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Start the development server (Builds + Serves)
bun run dev
```

Visit `http://localhost:3000`.

### Explore the Demos
| Route | Feature Demonstrated |
| :--- | :--- |
| `/` | **Hydration:** Static HTML becomes interactive (Counter). |
| `/users` | **SSR Data:** Fetches data on the server before rendering. |
| `/blog/hello-world` | **Dynamic Routing:** Matches `[slug].tsx` patterns. |

***

##  Project Structure

Every file has a specific purpose in the pipeline:

```text
src/
├── app/
│   ├── server.ts      # The HTTP server (matches URL -> Page)
│   ├── router.ts      # The "Magic": Scans filesystem to build route map
│   ├── build.ts       # The Bundler: Compiles client.tsx for the browser
│   └── client.tsx     # The Entry Point: Runs in browser to hydrate DOM
├── pages/             # Your application code (Next.js style)
│   ├── index.tsx
│   └── blog/
│       └── [slug].tsx # Dynamic route example
└── types.ts
```

***

##  How It Works (The Code Patterns)

### 1. File-System Routing
Instead of a static route config, we scan the directory at startup.
```typescript
// router.ts logic
const glob = new Glob("src/pages/**/*.tsx");
for await (const file of glob.scan()) {
  const route = file.replace("src/pages", "").replace(".tsx", "");
  routes.set(route, file); // Maps "/about" -> "src/pages/about.tsx"
}
```

### 2. Server-Side Data Fetching
We emulate Next.js's data fetching pattern by calling a static function on the component before rendering.
```typescript
// server.ts logic
const Page = await import(filePath);
let props = {};

// If the page needs data, fetch it on the server
if (Page.getServerSideProps) {
  props = await Page.getServerSideProps(context);
}

// Render with data
const html = renderToString(<Page {...props} />);
```

***

##  Creating Pages

### Dynamic Routes
Create a file named with brackets, e.g., `src/pages/blog/[slug].tsx`.
```tsx
// src/pages/blog/[slug].tsx
export default function Post({ params }) {
  return <h1>Reading: {params.slug}</h1>;
}
```

### Data Fetching
Export `getServerSideProps` to fetch data server-side.
```tsx
// src/pages/users.tsx
export async function getServerSideProps() {
  const data = await db.getUsers();
  return { props: { users: data } };
}

export default function Users({ users }) {
  return <div>{users.map(u => <div key={u.id}>{u.name}</div>)}</div>;
}
```

***

It lacks production features like:
*   Caching / ISR (Incremental Static Regeneration)
*   API Routes
*   Image Optimization
*   Security Headers
*   Advanced Error Boundaries


