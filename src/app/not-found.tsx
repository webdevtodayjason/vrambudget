import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'not found: vrambudget',
};

export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>That route does not exist.</p>
    </main>
  );
}
