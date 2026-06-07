import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getOrCreateProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, Clock, Heart } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Escuta mudanças de estado de autenticação para capturar o evento de confirmação de e-mail
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          try {
            // Busca ou cria o perfil do usuário recém-confirmado
            const { data, error } = await getOrCreateProfile(session.user.id);

            if (error) throw error;
            setUserProfile(data);
          } catch (err) {
            console.error('Erro ao buscar perfil do usuário:', err);
          } finally {
            setLoading(false);
          }
        } else {
          // Se não houver sessão ativa após 3 segundos, encerra o carregamento
          const timer = setTimeout(() => {
            setLoading(false);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    );

    // Verificação inicial rápida
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getOrCreateProfile(session.user.id)
          .then(({ data }) => {
            if (data) setUserProfile(data);
            setLoading(false);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const LOGO_PRO_FAMILIA = '/images/logo-pro-familia.png';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHzmMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-50 pointer-events-none"></div>

      <Card className="relative w-full max-w-lg shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        {/* Banner superior com cor de destaque suave */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

        <CardHeader className="text-center space-y-4 pt-8 pb-4 px-8">
          <div className="flex justify-center">
            <img
              src={LOGO_PRO_FAMILIA}
              alt="Pró-Família Geração de Renda"
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              {loading ? 'Verificando Confirmação...' : 'E-mail Confirmado com Sucesso!'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {loading
                ? 'Aguarde um momento enquanto processamos sua autenticação.'
                : `Seja muito bem-vindo(a) ao Pró-Família Conecta${userProfile?.name ? `, ${userProfile.name}` : ''}!`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm text-center">
                Autenticando seu perfil com segurança...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Box de Sucesso do E-mail */}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 text-sm">Conta Ativada</h4>
                  <p className="text-green-700 text-xs mt-1">
                    Seu endereço de e-mail foi verificado e sua conta no sistema está ativa.
                  </p>
                </div>
              </div>

              {/* Box Informativo sobre Aprovação */}
              <div className="flex items-start gap-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Aprovação do Administrador Necessária</h4>
                  <p className="text-blue-800 text-xs mt-1 leading-relaxed">
                    Para começar a anunciar suas ofertas ou utilizar plenamente o sistema, <strong>é necessário aguardar que o administrador aprove o seu perfil</strong>.
                  </p>
                </div>
              </div>

              {/* Box Institucional / Trabalho Voluntário */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                <Heart className="h-5 w-5 text-red-500 shrink-0 mt-0.5 fill-red-100" />
                <div>
                  <h4 className="font-semibold text-indigo-950 text-sm">Iniciativa Voluntária e Beneficente</h4>
                  <p className="text-indigo-900 text-xs mt-1 leading-relaxed">
                    O <strong>Pró-Família Conecta</strong> é uma plataforma gerida de forma totalmente voluntária e beneficente. O administrador analisará o seu perfil o mais breve possível para liberar seu acesso!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md transition-all duration-200"
                >
                  Ir para a Vitrine
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="flex-1 border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Voltar para o Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
