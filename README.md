# Un-nexted

> A simplified Next.js clone built from scratch with Bun, React 18, and TypeScript

**Un-nexted** demonstrates the core concepts behind modern meta-frameworks: server-side rendering (SSR), client-side hydration, file-system routing, and server-side data fetching.

## What This Is

An educational project that implements the fundamental architecture of frameworks like Next.js:

- **Server-Side Rendering** - Pages render to HTML on the server using `renderToString()`
- **Client Hydration** - React 18's `hydrateRoot()` attaches event listeners to the static HTML
- **File-System Routing** - Files in `src/pages/` automatically become routes
- **Dynamic Routes** - `[param].tsx` files match dynamic URL segments
- **Server Props** - `getServerSideProps()` fetches data before rendering

## What This Is Not

- Not production-ready
- Not a Next.js replacement
- No API routes, image optimization, ISR, or App Router
- Minimal performance optimizations

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Visit `http://localhost:3000` and explore:

| Route | Description |
|-------|-------------|
| `/` | Homepage with interactive counter |
| `/about` | About page with interactive demo |
| `/blog/hello-world` | Dynamic route example |
| `/users` | Server-side data fetching demo |

## Project Structure

```
un-nexted/
├── src/
│   ├── types.ts          # Type definitions
│   ├── router.ts         # File-system router
│   ├── server.ts         # SSR HTTP server
│   ├── build.ts          # Bun.build wrapper
│   ├── client.tsx        # Client hydration entry
│   └── pages/            # Your pages go here
│       ├── index.tsx
│       ├── about.tsx
│       ├── 404.tsx
│       ├── users.tsx     # Demonstrates getServerSideProps
│       └── blog/
│           └── [slug].tsx  # Dynamic route
├── dist/                 # Build output (generated)
└── package.json
```

## Creating Pages

### Static Route

Create `src/pages/foo.tsx`:

```tsx
export default function Foo() {
  return <div>Foo Page</div>;
}
```

→ Accessible at `/foo`

### Dynamic Route

Create `src/pages/blog/[slug].tsx`:

```tsx
interface BlogPostProps {
  params: { slug: string };
}

export default function BlogPost({ params }: BlogPostProps) {
  return <div>Post: {params.slug}</div>;
}
```

→ `/blog/hello-world` renders with `params.slug = "hello-world"`

### Server-Side Data Fetching

```tsx
interface PageProps {
  users: Array<{ id: number; name: string }>;
}

export async function getServerSideProps() {
  // Fetch from API or database
  const users = await fetch('https://api.example.com/users').then(r => r.json());

  return { props: { users } };
}

export default function Users({ users }: PageProps) {
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

## How It Works

### SSR Pipeline

```
Request → Router matches URL → Import component → getServerSideProps? → renderToString() → HTML response
```

### Hydration Pipeline

```
Browser loads → Parse __UNNEXTED_DATA__ → Match route → Import component → hydrateRoot() → Interactive
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun 1.2+ |
| Framework | React 18.3 |
| Language | TypeScript 5.9 |
| Server | `Bun.serve()` |
| Bundler | `Bun.build()` |

## Scripts

```bash
bun run dev    # Start dev server (builds + serves)
bun run build  # Build client bundle only
bun run start  # Production mode
```

## Common Issues

### "Hydration failed" errors

The server-rendered HTML must match the client's initial render exactly. Common causes:

- Using `Math.random()`, `Date.now()`, or other non-deterministic values
- Conditional rendering based on `typeof window`
- CSS-in-JS libraries that render differently on server vs client

### "Component not found" errors

Check that:
- File is in `src/pages/`
- File exports a default component
- File extension is `.tsx`

### Route not matching

- Index routes must be `index.tsx`, not `Index.tsx`
- Dynamic segments use square brackets: `[slug].tsx`
- Check the server logs for registered routes

## License

MIT

---

**Key insight**: Next.js is "just" React + a compiler + a server. The magic is glob patterns and string manipulation. The hard part is getting hydration right.
