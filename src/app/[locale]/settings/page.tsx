'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Link } from '@/i18n/routing';
import { Globe, CreditCard, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentHistoryItem {
  id: number;
  checkoutId: string;
  status: string;
  amount: number;
  currency: string;
  installments: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
}

interface SubscriptionStatus {
  isPremium: boolean;
  subscription: {
    expires_at: string | null;
    isExpired: boolean;
    daysUntilExpiry: number | null;
  } | null;
}

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [language, setLanguage] = useState(user?.language || 'pt');
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const hasFetchedRef = useRef(false); // Flag para garantir que só busca uma vez

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
      hasFetchedRef.current = false; // Resetar flag quando não há usuário
      return;
    }
    
    // Garantir que só busca os dados uma vez por sessão de usuário
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchSubscriptionStatus();
      fetchPaymentHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Executa apenas quando o ID do usuário muda (login/logout)

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/payments/status');
      setSubscriptionStatus(response.data);
      // Atualizar status premium no store
      if (response.data.isPremium !== user?.isPremium) {
        updateUser({ isPremium: response.data.isPremium });
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/payments/history');
      setPaymentHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">{t('navigation.settings')}</h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>

        <Card className="card-hover border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              {t('payment.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">{t('settings.status')}</p>
                <p className="font-semibold text-lg">
                  {user?.isBusiness ? (
                    <span className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-white text-sm font-bold rounded-full">
                        🏢 {t('payment.businessActive')}
                      </span>
                    </span>
                  ) : subscriptionStatus?.isPremium ? (
                    <span className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 text-sm font-bold rounded-full">
                        ⭐ {t('payment.premiumActive')}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t('payment.freePlan')}</span>
                  )}
                </p>
              </div>
              
              {subscriptionStatus?.subscription && (
                <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                  {subscriptionStatus.subscription.expires_at && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{t('payment.expiresIn')}</p>
                        <p className="font-semibold">
                          {subscriptionStatus.subscription.isExpired ? (
                            <span className="text-destructive flex items-center gap-1">
                              <XCircle className="w-4 h-4" />
                              {t('payment.expired')}
                            </span>
                          ) : subscriptionStatus.subscription.daysUntilExpiry !== null ? (
                            <span className="text-primary flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {subscriptionStatus.subscription.daysUntilExpiry} {subscriptionStatus.subscription.daysUntilExpiry === 1 ? t('payment.day') : t('payment.days')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(subscriptionStatus.subscription.expires_at), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </>
                  )}
                </div>
              )}

              {(!subscriptionStatus?.isPremium || subscriptionStatus?.subscription?.isExpired) && (
                <Link href="/payment">
                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20">
                    {subscriptionStatus?.subscription?.isExpired ? t('payment.renewSubscription') : t('payment.upgradeToPremium')}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('settings.paymentHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('settings.noPaymentsFound')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {payment.status === 'active' && !payment.isExpired ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                        <span className="font-semibold">
                          R$ {(payment.amount / 100).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'active' && !payment.isExpired
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : payment.isExpired
                            ? 'bg-destructive/20 text-destructive border border-destructive/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {payment.status === 'active' && !payment.isExpired
                          ? t('settings.active')
                          : payment.isExpired
                          ? t('payment.expired')
                          : payment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(payment.createdAt), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {payment.expiresAt && (
                        <span>
                          {t('settings.expires')}: {format(new Date(payment.expiresAt), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                    {payment.checkoutId && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        ID: {payment.checkoutId.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <CardTitle>{t('settings.account')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">{t('common.name')}</p>
                <p className="font-semibold text-lg">{user.name}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">{t('common.email')}</p>
                <p className="font-semibold text-lg">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

