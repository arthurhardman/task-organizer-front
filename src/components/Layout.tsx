'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Columns, List, Settings, LogOut, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null; // Será redirecionado
  }

  const changeLanguage = (lang: string) => {
    const currentPath = pathname?.replace(/^\/(pt|en|es)/, '') || '';
    router.push(`/${lang}${currentPath}`);
    setShowLangMenu(false);
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('navigation.dashboard') },
    { href: '/kanban', icon: Columns, label: t('navigation.kanban') },
    { href: '/lists', icon: List, label: t('navigation.lists') },
    { href: '/settings', icon: Settings, label: t('navigation.settings') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
              {t('common.appName')}
            </Link>
            <div className="hidden md:flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="h-9 w-9"
              >
                <Globe className="w-4 h-4" />
              </Button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => changeLanguage('pt')}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  >
                    Português
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('es')}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  >
                    Español
                  </button>
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium">{user?.name}</span>
              {user?.isPremium && (
                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-semibold rounded-full">
                  Premium
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="h-9 w-9"
              title={t('common.logout')}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}

