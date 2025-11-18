'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { CheckCircle2, Loader2, ExternalLink, Coins, Sparkles, CheckCircle, AlertCircle, Mail, Building2, X } from 'lucide-react';
import { PlansModal } from '@/components/PlansModal';

const BASIC_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/RNCPqNAHkEGRn21iIW2s'; // Plano Básico
const PREMIUM_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/udNaQ9Xhb037aDqoYMvm'; // Plano Premium
const BUSINESS_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/aAcrF4goLLHYSUKTy7qT'; // Plano Business

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
              <h2 className="text-2xl font-bold mb-2">{t('payment.alreadyPremium')}</h2>
              <p className="text-muted-foreground">{t('payment.enjoyResources')}</p>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Removido router das dependências

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">{t('payment.title')}</h1>
          <p className="text-muted-foreground">{t('payment.unlockPremium')}</p>
        </div>

        {/* Alerta importante sobre o e-mail */}
        <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-900" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    {t('payment.emailAlertTitle')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('payment.emailAlertDescription')}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-yellow-500/30">
                  <p className="text-xs text-muted-foreground mb-1">{t('payment.useThisEmail')}</p>
                  <p className="text-lg font-bold text-foreground break-all flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    {user.email}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {t('payment.emailAlertWarning')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Plano Básico */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[320px]">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{t('payment.basicPlan')}</CardTitle>
                  <CardDescription className="text-sm mt-1">{t('payment.idealToStart')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">R$ 24,90</div>
                <p className="text-muted-foreground text-sm">{t('payment.oneTimePayment')}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>50 {t('payment.creditsForTasks')}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.dashboardAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.listsAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="line-through">{t('payment.kanbanAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="line-through">{t('reports.title')}</span>
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
                    {t('payment.signBasicPlan')}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative min-w-[320px]">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg shadow-yellow-500/20">
                ⭐ {t('payment.mostPopular')}
              </span>
            </div>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Sparkles className="w-6 h-6 text-yellow-900" />
                </div>
                <div>
                  <CardTitle className="text-xl">{t('payment.premiumPlan')}</CardTitle>
                  <CardDescription className="text-sm mt-1">{t('payment.fullAccess')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">R$ 39,90</div>
                <p className="text-muted-foreground text-sm">{t('payment.perMonth')}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>{t('payment.unlimitedCredits')}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.dashboardAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.listsAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.kanbanAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.advancedReports')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.prioritySupport')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="line-through">Chamados e Equipes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="line-through">Gerenciamento de usuários</span>
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
                    {t('payment.signPremiumPlan')}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Business */}
          <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative min-w-[320px]">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/20">
                🏢 Business
              </span>
            </div>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Plano Business</CardTitle>
                  <CardDescription className="text-sm mt-1">Para empresas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">R$ 99,90</div>
                <p className="text-muted-foreground text-sm">{t('payment.perMonth')}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>{t('payment.unlimitedCredits')}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.dashboardAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.listsAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.kanbanAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{t('payment.advancedReports')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Chamados e Equipes</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Até 20 usuários</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Gerenciamento de usuários</strong></span>
                </div>
              </div>

              <Button
                onClick={() => handleRedirectToCheckout(BUSINESS_CHECKOUT_URL)}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
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
                    Assinar Plano Business
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
