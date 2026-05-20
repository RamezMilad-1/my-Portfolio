import { Nav } from '@/components/public/nav';
import { Footer } from '@/components/public/footer';
import { AnimatedBackground } from '@/components/public/animated-background';
import { PageTransition } from '@/components/motion/page-transition';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <Nav />
      <main id="main-content" className="relative">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
