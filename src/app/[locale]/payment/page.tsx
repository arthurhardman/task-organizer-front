'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { CheckCircle2, Loader2, ExternalLink, Coins, Sparkles, CheckCircle } from 'lucide-react';
import { PlansModal } from '@/components/PlansModal';

const BASIC_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/RNCPqNAHkEGRn21iIW2s'; // TODO: Atualizar com URL real do plano básico
const PREMIUM_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/RNCPqNAHkEGRn21iIW2s'; // TODO: Atualizar com URL real do plano premium

export default function PaymentPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleRedirectToCheckout = (checkoutUrl: string) => {
    if (!user) return;
    
    setLoading(true);
    // Redirecionar diretamente para o checkout do GGCheckout
    window.location.href = checkoutUrl;
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
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plano Básico */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Plano Básico</CardTitle>
                  <CardDescription className="text-sm mt-1">Ideal para começar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">R$ 24,90</div>
                <p className="text-muted-foreground text-sm">Pagamento único</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>50 créditos</strong> para criar tarefas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Acesso ao Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Acesso às Listas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="line-through">Acesso ao Kanban</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="line-through">Relatórios</span>
                </div>
              </div>

              <Button
                onClick={() => handleRedirectToCheckout(BASIC_CHECKOUT_URL)}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Assinar Plano Básico
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg shadow-yellow-500/20">
                ⭐ MAIS POPULAR
              </span>
            </div>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Sparkles className="w-6 h-6 text-yellow-900" />
                </div>
                <div>
                  <CardTitle className="text-xl">Plano Premium</CardTitle>
                  <CardDescription className="text-sm mt-1">Acesso completo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">R$ 39,90</div>
                <p className="text-muted-foreground text-sm">por mês</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Créditos ilimitados</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Acesso ao Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Acesso às Listas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Acesso ao Kanban</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Relatórios Avançados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Suporte Prioritário</span>
                </div>
              </div>

              <Button
                onClick={() => handleRedirectToCheckout(PREMIUM_CHECKOUT_URL)}
                className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Assinar Plano Premium
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
