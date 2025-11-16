'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

export default function PaymentPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleCreateCheckout = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await api.post('/payments/create-checkout', { installments });
      setCheckoutUrl(response.data.checkout_url);
      
      // Redirecionar para o checkout do GGCheckout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error: any) {
      alert('Erro ao criar checkout: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  // Verificar status do pagamento ao retornar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutId = urlParams.get('checkout_id');
    const status = urlParams.get('status');

    if (checkoutId && status === 'success') {
      // Verificar status do pagamento
      api.get(`/payments/verify/${checkoutId}`)
        .then(() => {
          updateUser({ isPremium: true });
        })
        .catch(console.error);
    }
  }, []);

  if (user?.isPremium) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Você já é Premium!</h2>
              <p className="text-muted-foreground">Aproveite todos os recursos disponíveis.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

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
        <h1 className="text-3xl font-bold">{t('payment.title')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('payment.title')}</CardTitle>
            <CardDescription>{t('payment.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('payment.installments')}</label>
              <Select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                disabled={loading}
              >
                <option value="1">1x de R$ 250,00</option>
                <option value="2">2x de R$ 125,00</option>
                <option value="3">3x de R$ 83,33</option>
                <option value="4">4x de R$ 62,50</option>
                <option value="5">5x de R$ 50,00</option>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground mb-2">
                Você será redirecionado para o checkout seguro do GGCheckout para finalizar o pagamento.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4" />
                <span>Pagamento seguro e criptografado</span>
              </div>
            </div>

            <Button
              onClick={handleCreateCheckout}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('payment.payNow')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
