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
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Idioma / Language / Idioma</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={loading}
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <p className="font-medium">
                  {user.isPremium ? (
                    <span className="text-green-500">Premium Ativo</span>
                  ) : (
                    <span className="text-muted-foreground">Plano Gratuito</span>
                  )}
                </p>
              </div>
              {!user.isPremium && (
                <Link href="/payment">
                  <Button>Fazer Upgrade</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

