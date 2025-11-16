'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pagamento Cancelado</h2>
            <p className="text-muted-foreground mb-4">
              O pagamento foi cancelado. Você pode tentar novamente quando quiser.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push('/payment')}>
                Tentar Novamente
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

