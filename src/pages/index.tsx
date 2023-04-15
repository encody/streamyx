import { CreateStreamForm } from '@/components/CreateStreamForm';
import { StreamPlayer } from '@/components/StreamPlayer';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <nav className="flex flex-col gap-2 p-2">
        <Link href="/create">Create a stream</Link>
      </nav>
    </main>
  );
}
