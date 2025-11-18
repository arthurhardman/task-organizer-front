'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Columns, List, Settings, LogOut, Globe, Coins, BarChart3, Menu, X, Users, Ticket } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, updateUser } = useAuthStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      hasFetchedRef.current = false;
      return;
    }
    
    // Evitar múltiplas chamadas - só busca uma vez por sessão de usuário
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    
    // Verificar status premium e créditos ao carregar
    const checkPremiumStatus = async () => {
      try {
        const response = await api.get('/payments/status');
        if (response.data.isPremium !== user.isPremium) {
          updateUser({ isPremium: response.data.isPremium });
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };
    
    // Buscar dados atualizados do usuário
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          updateUser({ 
            credits: response.data.credits,
            isAdmin: response.data.isAdmin,
            isBusiness: response.data.isBusiness,
            businessId: response.data.businessId,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    checkPremiumStatus();
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Só executa quando o ID do usuário muda (login/logout)

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null; // Será redirecionado
  }

  const changeLanguage = (lang: string) => {
    // O pathname do next-intl já não inclui o locale
    const currentPath = pathname || '/dashboard';
    // Usar window.location para garantir que o locale seja atualizado corretamente
    window.location.href = `/${lang}${currentPath === '/' ? '' : currentPath}`;
    setShowLangMenu(false);
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('navigation.dashboard') },
    { href: '/kanban', icon: Columns, label: t('navigation.kanban') },
    { href: '/lists', icon: List, label: t('navigation.lists') },
    ...(user?.isPremium ? [{ href: '/reports', icon: BarChart3, label: t('navigation.reports') }] : []),
    ...((user?.isBusiness || user?.isAdmin) ? [{ href: '/teams', icon: Users, label: t('navigation.teams') }] : []),
    ...((user?.isBusiness || user?.isAdmin) ? [{ href: '/tickets', icon: Ticket, label: t('navigation.tickets') }] : []),
    ...(user?.isAdmin ? [{ href: '/business-users', icon: Users, label: t('navigation.businessUsers') }] : []),
    { href: '/settings', icon: Settings, label: t('navigation.settings') },
  ];

  // Menu mobile com todos os itens
  const mobileNavItems = navItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b border-border/50 bg-card/80 sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Menu Mobile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden h-10 w-10 rounded-full hover:bg-muted/50 transition-all"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link 
              href="/dashboard" 
              className="text-xl md:text-2xl font-bold gradient-text hover:opacity-90 transition-all duration-300"
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
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
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
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              {!user?.isPremium && user?.credits !== undefined && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {user.credits === -1 ? '∞' : user.credits} {t('common.credits')}
                  </span>
                </div>
              )}
              {user?.isPremium && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg shadow-yellow-500/20">
                  ⭐ {t('common.premium')}
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
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* User info mobile */}
              <div className="pt-4 border-t border-border/50 mt-4">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    {!user?.isPremium && user?.credits !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {user.credits === -1 ? '∞' : user.credits} {t('common.credits')}
                      </p>
                    )}
                    {user?.isPremium && (
                      <p className="text-xs text-yellow-600 font-semibold">⭐ {t('common.premium')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="container mx-auto px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}

