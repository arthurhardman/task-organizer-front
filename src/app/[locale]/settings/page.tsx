'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Link } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [language, setLanguage] = useState(user?.language || 'pt');
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    setLoading(true);
    try {
      await api.patch('/auth/language', { language: newLanguage });
      updateUser({ language: newLanguage });
    } catch (error) {
      console.error('Error updating language:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">{t('navigation.settings')}</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
        </div>

        <Card className="card-hover border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Idioma / Language / Idioma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={loading}
              className="h-11 border-border/50 focus:border-primary transition-colors"
            >
              <option value="pt">🇧🇷 Português</option>
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
            </Select>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <p className="font-semibold text-lg">
                  {user.isPremium ? (
                    <span className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 text-sm font-bold rounded-full">
                        ⭐ Premium Ativo
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Plano Gratuito</span>
                  )}
                </p>
              </div>
              {!user.isPremium && (
                <Link href="/payment">
                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20">
                    Fazer Upgrade para Premium
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <CardTitle>Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Nome</p>
                <p className="font-semibold text-lg">{user.name}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold text-lg">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

