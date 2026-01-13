/**
 * Homepage with interactive counter
 */

import { useState } from 'react';

interface IndexProps {
  title?: string;
}

export default function Index({ title = 'Un-nexted' }: IndexProps) {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome to {title}
        </h1>
        <p style={{ color: '#666' }}>
          A Next.js clone built from scratch with SSR and hydration
        </p>
      </header>

      <main>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Interactive Counter</h2>
          <p>This counter demonstrates client-side hydration:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => setCount((c) => c - 1)}
              style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              -
            </button>
            <span style={{ fontSize: '1.5rem', minWidth: '3rem', textAlign: 'center' }}>
              {count}
            </span>
            <button
              onClick={() => setCount((c) => c + 1)}
              style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </section>

        <section>
          <h2>Features</h2>
          <ul>
            <li>✅ Server-Side Rendering (SSR)</li>
            <li>✅ Client Hydration</li>
            <li>✅ File-System Routing</li>
            <li>✅ Dynamic Routes</li>
            <li>✅ Server-Side Props</li>
          </ul>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Navigation</h2>
          <nav>
            <a href="/" style={{ marginRight: '1rem' }}>Home</a>
            <a href="/about" style={{ marginRight: '1rem' }}>About</a>
            <a href="/blog/hello-world" style={{ marginRight: '1rem' }}>Blog Post</a>
            <a href="/users">Users (SSP)</a>
          </nav>
        </section>
      </main>
    </div>
  );
}
