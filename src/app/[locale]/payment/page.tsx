'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

const CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/RNCPqNAHkEGRn21iIW2s';

export default function PaymentPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleRedirectToCheckout = () => {
    if (!user) return;
    
    setLoading(true);
    // Redirecionar diretamente para o checkout do GGCheckout
    window.location.href = CHECKOUT_URL;
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
  }, [updateUser]);

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
      <div className="max-w-2xl mx-auto space-y-8 animate-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">{t('payment.title')}</h1>
          <p className="text-muted-foreground">Desbloqueie todos os recursos premium</p>
        </div>
        
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <CardTitle className="text-2xl">{t('payment.title')}</CardTitle>
                <CardDescription className="text-base mt-1">{t('payment.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 p-6 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold gradient-text mb-2">R$ 25,00</div>
                <p className="text-muted-foreground">por mês</p>
              </div>
              <div className="space-y-2 text-sm text-foreground">
                <p className="font-medium">✨ Recursos Premium:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Acesso ilimitado a todas as funcionalidades</li>
                  <li>Suporte prioritário</li>
                  <li>Atualizações exclusivas</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 p-4 rounded-lg">
              <p className="text-sm text-foreground mb-2 font-medium">
                Você será redirecionado para o checkout seguro do GGCheckout para finalizar o pagamento.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4" />
                <span>Pagamento seguro e criptografado</span>
              </div>
            </div>

            <Button
              onClick={handleRedirectToCheckout}
              className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold text-lg shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.loading')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  {t('payment.payNow')}
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
