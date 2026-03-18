import { redirect } from 'next/navigation';

export default function Home() {
  // Always redirect the root to the bar interface which will hit the auth middleware
  redirect('/bar');
}
