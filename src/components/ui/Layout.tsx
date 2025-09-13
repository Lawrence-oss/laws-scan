import { Outlet } from 'react-router-dom';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

const Layout = () => {
  const { theme, setTheme } = useTheme();

return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Laws Scanner</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
     <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
  <div className="max-w-7xl mx-auto">
    <Outlet />
  </div>
</main>

      {/* Footer */}
      <footer className="border-t border-border py-6 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-center text-sm text-muted-foreground">
          <p>© 2025 Laws Scanner. All rights reserved.</p>
          <p>A security scanning tool for identifying website vulnerabilities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;