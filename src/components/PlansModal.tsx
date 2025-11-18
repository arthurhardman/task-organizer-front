'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { CheckCircle2, Coins, Sparkles, ExternalLink, AlertCircle, Mail, Building2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
}

const BASIC_PLAN_PRICE = 24.90;
const PREMIUM_PLAN_PRICE = 39.90;
const BUSINESS_PLAN_PRICE = 99.90;
const BASIC_PLAN_CREDITS = 50;

// URLs dos checkouts do GGCheckout
const BASIC_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/RNCPqNAHkEGRn21iIW2s'; // Plano Básico
const PREMIUM_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/udNaQ9Xhb037aDqoYMvm'; // Plano Premium
const BUSINESS_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/aAcrF4goLLHYSUKTy7qT'; // Plano Business

export function PlansModal({ isOpen, onClose, currentCredits }: PlansModalProps) {
  const t = useTranslations();
  const { user } = useAuthStore();
  
  if (!isOpen) return null;

  const handlePlanClick = (checkoutUrl: string) => {
    window.location.href = checkoutUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
      <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-4xl w-full m-4 animate-slide-up max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                {t('payment.choosePlan')}
              </h2>
              <p className="text-muted-foreground">
                {currentCredits !== undefined && currentCredits >= 0 && (
                  <>{t('payment.creditsRemaining', { credits: currentCredits })}</>
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              ×
            </Button>
          </div>

          {/* Alerta importante sobre o e-mail */}
          {user?.email && (
            <Card className="mb-6 border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-900" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        {t('payment.emailAlertTitle')}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t('payment.emailAlertDescription')}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-yellow-500/30">
                      <p className="text-xs text-muted-foreground mb-1">{t('payment.useThisEmail')}</p>
                      <p className="text-sm font-bold text-foreground break-all flex items-center gap-2">
                        <Mail className="w-3 h-3 text-primary flex-shrink-0" />
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
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plano Básico */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 min-w-[320px]">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{t('payment.basicPlan')}</CardTitle>
                    <CardDescription>{t('payment.idealToStart')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    R$ {BASIC_PLAN_PRICE.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-muted-foreground text-sm">{t('payment.oneTimePayment')}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>{BASIC_PLAN_CREDITS} {t('payment.creditsForTasks')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.dashboardAccess')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
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
                  onClick={() => handlePlanClick(BASIC_CHECKOUT_URL)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('payment.signBasicPlan')}
                  </span>
                </Button>
              </CardContent>
            </Card>

            {/* Plano Premium */}
            <Card className="border-2 border-primary/50 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 relative min-w-[320px]">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg shadow-yellow-500/20">
                  ⭐ {t('payment.mostPopular')}
                </span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Sparkles className="w-6 h-6 text-yellow-900" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{t('payment.premiumPlan')}</CardTitle>
                    <CardDescription>{t('payment.fullAccess')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    R$ {PREMIUM_PLAN_PRICE.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-muted-foreground text-sm">{t('payment.perMonth')}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>{t('payment.unlimitedCredits')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.dashboardAccess')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.listsAccess')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.kanbanAccess')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.advancedReports')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
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
                  onClick={() => handlePlanClick(PREMIUM_CHECKOUT_URL)}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('payment.signPremiumPlan')}
                  </span>
                </Button>
              </CardContent>
            </Card>

            {/* Plano Business */}
            <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 relative min-w-[320px]">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/20">
                  🏢 Business
                </span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Plano Business</CardTitle>
                    <CardDescription>Para empresas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    R$ {BUSINESS_PLAN_PRICE.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-muted-foreground text-sm">{t('payment.perMonth')}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>{t('payment.unlimitedCredits')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.dashboardAccess')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.listsAccess')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.kanbanAccess')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{t('payment.advancedReports')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>Chamados e Equipes</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>Até 20 usuários</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>Gerenciamento de usuários</strong></span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePlanClick(BUSINESS_CHECKOUT_URL)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Assinar Plano Business
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

