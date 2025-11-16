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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b border-border/50 bg-card/80 sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="text-2xl font-bold gradient-text hover:opacity-90 transition-all duration-300"
            >
              {t('common.appName')}
            </Link>
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
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
                className="h-10 w-10 rounded-full hover:bg-muted/50 transition-all"
              >
                <Globe className="w-4 h-4" />
              </Button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in">
                  <button
                    onClick={() => changeLanguage('pt')}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm"
                  >
                    🇧🇷 Português
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm"
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => changeLanguage('es')}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm"
                  >
                    🇪🇸 Español
                  </button>
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              {user?.isPremium && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg shadow-yellow-500/20">
                  ⭐ Premium
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
              title={t('common.logout')}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}

