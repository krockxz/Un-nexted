/**
 * About page
 */

import { useState } from 'react';

interface AboutProps {
  title?: string;
}

export default function About({ title = 'About' }: AboutProps) {
  const [likes, setLikes] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{title}</h1>
        <p style={{ color: '#666' }}>Learn about this project</p>
      </header>

      <main>
        <section style={{ marginBottom: '2rem' }}>
          <h2>What is Un-nexted?</h2>
          <p>
            Un-nexted is a simplified clone of Next.js built from scratch to understand
            the internals of modern meta-frameworks. It demonstrates the core concepts
            of server-side rendering, client-side hydration, and file-system routing.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Technology Stack</h2>
          <ul>
            <li><strong>Runtime:</strong> Bun - Fast JavaScript runtime with built-in bundler</li>
            <li><strong>Framework:</strong> React 18 - For SSR and hydration</li>
            <li><strong>Language:</strong> TypeScript - Type safety and better DX</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Interactive Demo</h2>
          <p>Like this page: {likes}</p>
          <button
            onClick={() => setLikes((l) => l + 1)}
            style={{
              padding: '0.5rem 1rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            👍 Like
          </button>
        </section>

        <section>
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
