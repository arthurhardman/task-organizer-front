'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Columns, List, Settings, LogOut, Globe } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              {t('common.appName')}
            </Link>
            <div className="flex gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLangMenu(!showLangMenu)}
              >
                <Globe className="w-4 h-4" />
              </Button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-md shadow-lg z-50">
                  <button
                    onClick={() => changeLanguage('pt')}
                    className="w-full text-left px-4 py-2 hover:bg-muted rounded-t-md"
                  >
                    Português
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className="w-full text-left px-4 py-2 hover:bg-muted"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('es')}
                    className="w-full text-left px-4 py-2 hover:bg-muted rounded-b-md"
                  >
                    Español
                  </button>
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            {user?.isPremium && (
              <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs rounded-full">
                Premium
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

