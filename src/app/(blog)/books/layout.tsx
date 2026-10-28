import { ThemeSwitch } from '@registry/theme-switch/theme-switch';
export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-12 md:px-12 md:py-20">
      <main>{children}</main>
      <footer className="mt-24 flex justify-end border-t border-edge/5 pt-6">
        <ThemeSwitch />
      </footer>
    </div>
  );
}
