'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { CheckCircle2, Coins, Sparkles, ExternalLink } from 'lucide-react';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
}

const BASIC_PLAN_PRICE = 24.90;
const PREMIUM_PLAN_PRICE = 39.90;
const BASIC_PLAN_CREDITS = 50;

// URLs dos checkouts do GGCheckout
const BASIC_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/RNCPqNAHkEGRn21iIW2s'; // TODO: Atualizar com URL real do plano básico
const PREMIUM_CHECKOUT_URL = 'https://www.ggcheckout.com/checkout/v2/RNCPqNAHkEGRn21iIW2s'; // TODO: Atualizar com URL real do plano premium

export function PlansModal({ isOpen, onClose, currentCredits }: PlansModalProps) {
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
                Escolha seu Plano
              </h2>
              <p className="text-muted-foreground">
                {currentCredits !== undefined && currentCredits >= 0 && (
                  <>Você tem <span className="font-semibold text-primary">{currentCredits}</span> créditos restantes</>
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Plano Básico */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Plano Básico</CardTitle>
                    <CardDescription>Ideal para começar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    R$ {BASIC_PLAN_PRICE.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-muted-foreground text-sm">Pagamento único</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>{BASIC_PLAN_CREDITS} créditos</strong> para criar tarefas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Acesso ao Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Acesso às Listas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="line-through">Acesso ao Kanban</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="line-through">Relatórios</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePlanClick(BASIC_CHECKOUT_URL)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Assinar Plano Básico
                  </span>
                </Button>
              </CardContent>
            </Card>

            {/* Plano Premium */}
            <Card className="border-2 border-primary/50 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg shadow-yellow-500/20">
                  ⭐ MAIS POPULAR
                </span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Sparkles className="w-6 h-6 text-yellow-900" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Plano Premium</CardTitle>
                    <CardDescription>Acesso completo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    R$ {PREMIUM_PLAN_PRICE.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-muted-foreground text-sm">por mês</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>Créditos ilimitados</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Acesso ao Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Acesso às Listas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Acesso ao Kanban</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Relatórios Avançados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Suporte Prioritário</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePlanClick(PREMIUM_CHECKOUT_URL)}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Assinar Plano Premium
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

