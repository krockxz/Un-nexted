/**
 * Users page with Server-Side Props
 * Demonstrates data fetching with getServerSideProps
 */

import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersPageProps {
  users: User[];
  fetchedAt: string;
}

/**
 * Server-side data fetching function
 * Runs on the server before rendering
 */
export async function getServerSideProps() {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simulate fetching data from an API
  const users: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com' },
    { id: 5, name: 'Evan Williams', email: 'evan@example.com' },
  ];

  return {
    props: {
      users,
      fetchedAt: new Date().toISOString(),
    },
  };
}

export default function Users({ users, fetchedAt }: UsersPageProps) {
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Users</h1>
        <p style={{ color: '#666' }}>
          Data fetched at: {new Date(fetchedAt).toLocaleString()}
        </p>
      </header>

      <main>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Search Users</h2>
          <input
            type="text"
            placeholder="Filter by name or email..."
            value={filter}
            onChange={(e) => setFilter((e.target as HTMLInputElement).value)}
            style={{
              padding: '0.75rem',
              width: '100%',
              maxWidth: '400px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <p style={{ marginTop: '0.5rem', color: '#666' }}>
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </section>

        <section>
          <h2>User List</h2>
          {selectedUser ? (
            <div style={{ padding: '1rem', background: '#f0f8ff', borderRadius: '8px', marginBottom: '1rem' }}>
              <h3>{selectedUser.name}</h3>
              <p>Email: {selectedUser.email}</p>
              <p>ID: {selectedUser.id}</p>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{user.name}</strong>
                    <br />
                    <span style={{ color: '#666' }}>{user.email}</span>
                  </div>
                  <button
                    onClick={() => setSelectedUser(user)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          )}
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
