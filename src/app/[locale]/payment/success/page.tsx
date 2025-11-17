'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function PaymentSuccessPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutId = urlParams.get('checkout_id');

    if (checkoutId && user) {
      // Verificar status do pagamento
      api.get(`/payments/verify/${checkoutId}`)
        .then(() => {
          updateUser({ isPremium: true });
        })
        .catch(console.error);
    }
  }, [user, updateUser]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('payment.paymentSuccess')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('payment.premiumActivated')}
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              {t('payment.goToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

