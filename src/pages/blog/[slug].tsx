/**
 * Dynamic blog post page
 * Demonstrates dynamic routes with [slug] parameter
 */

import { useState } from 'react';

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export default function BlogPost({ params }: BlogPostProps) {
  const [likes, setLikes] = useState(0);

  // Simulate blog post data based on slug
  const posts: Record<string, { title: string; content: string }> = {
    'hello-world': {
      title: 'Hello World',
      content: 'Welcome to my first blog post! This is a demo of dynamic routing in Un-nexted.',
    },
    'ssr-guide': {
      title: 'Server-Side Rendering Guide',
      content: 'SSR allows your pages to be rendered on the server for better SEO and performance.',
    },
  };

  const post = posts[params.slug] || {
    title: params.slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    content: 'This is a placeholder blog post content.',
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Home</a>
        <h1 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{post.title}</h1>
        <p style={{ color: '#999' }}>Slug: {params.slug}</p>
      </header>

      <main>
        <article style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
          <p style={{ marginBottom: '1rem' }}>{post.content}</p>
          <p style={{ marginBottom: '1rem' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
          </p>
        </article>

        <section style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Interactive Features</h3>
          <p>This post has {likes} likes</p>
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
            👍 Like Post
          </button>
        </section>
      </main>
    </div>
  );
}
