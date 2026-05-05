import { Nav } from '@/components/public/nav';
import { Footer } from '@/components/public/footer';
import { PageTransition } from '@/components/motion/page-transition';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
