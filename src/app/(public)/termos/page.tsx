import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Termos de uso da ${SITE_CONFIG.name}`,
  alternates: { canonical: "/termos" },
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx max-w-3xl">
        <p className="label-mono text-nyx-muted mb-4">Institucional</p>
        <h1 className="heading-display text-4xl md:text-5xl mb-12">
          Termos de uso
        </h1>

        <div className="bg-nyx-cream/60 border border-nyx-line p-4 text-xs text-nyx-muted mb-10">
          Documento em versão inicial. Revise com assessoria jurídica antes de
          uso em produção com clientes finais.
        </div>

        <div className="prose-nyx space-y-8 text-nyx-ink leading-relaxed">
          <section>
            <h2 className="heading-display text-2xl mb-3">1. Sobre a NYX</h2>
            <p>
              A NYX é uma marca de streetwear que comercializa peças em edições
              limitadas (drops). Ao acessar ou usar este site, você concorda
              com estes termos.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              2. Cadastro e uso do site
            </h2>
            <p>
              O site é de navegação livre. Compras são realizadas via contato
              direto pelo WhatsApp a partir do botão &quot;Quero essa peça&quot;
              na página do produto. Nenhum cadastro é obrigatório.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              3. Produtos e disponibilidade
            </h2>
            <p>
              As peças são vendidas em quantidades limitadas. A disponibilidade
              mostrada no site é atualizada manualmente e pode sofrer variação
              até a confirmação do pedido via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">4. Preços e pagamento</h2>
            <p>
              Os preços são exibidos em reais (BRL) e podem ser alterados sem
              aviso prévio. O pagamento é combinado diretamente no atendimento
              via WhatsApp, podendo ser via Pix, transferência bancária ou
              cartão de crédito.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">5. Entrega</h2>
            <p>
              Prazos e custos de envio são combinados caso a caso no atendimento
              via WhatsApp. A NYX trabalha com envio para todo o Brasil via
              Correios ou transportadora parceira.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              6. Propriedade intelectual
            </h2>
            <p>
              Todo o conteúdo do site — textos, imagens, logotipo, design e
              código — é de propriedade da NYX ou de seus licenciantes, protegido
              pelas leis de direitos autorais brasileiras.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              7. Limitação de responsabilidade
            </h2>
            <p>
              A NYX não se responsabiliza por indisponibilidades temporárias do
              site, atrasos de entrega causados por terceiros ou variações de
              estoque entre a exibição no site e a confirmação do pedido.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">8. Alterações</h2>
            <p>
              A NYX pode alterar estes termos a qualquer momento. Verifique esta
              página regularmente.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">9. Contato</h2>
            <p>
              Dúvidas sobre estes termos:{" "}
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-nyx-muted"
              >
                @nyx no Instagram
              </a>
              .
            </p>
          </section>

          <p className="label-mono text-xs text-nyx-muted pt-10 border-t border-nyx-line">
            Última atualização: abril de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
