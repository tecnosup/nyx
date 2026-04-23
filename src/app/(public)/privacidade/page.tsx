import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Política de privacidade da ${SITE_CONFIG.name} — LGPD`,
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx max-w-3xl">
        <p className="label-mono text-nyx-muted mb-4">Institucional</p>
        <h1 className="heading-display text-4xl md:text-5xl mb-12">
          Política de privacidade
        </h1>

        <div className="bg-nyx-cream/60 border border-nyx-line p-4 text-xs text-nyx-muted mb-10">
          Documento em versão inicial, em conformidade com a LGPD (Lei
          13.709/2018). Revise com assessoria jurídica antes de uso com
          clientes finais.
        </div>

        <div className="prose-nyx space-y-8 text-nyx-ink leading-relaxed">
          <section>
            <h2 className="heading-display text-2xl mb-3">
              1. Quem somos
            </h2>
            <p>
              NYX é a controladora dos dados coletados neste site, nos termos
              da LGPD. Este documento descreve quais dados coletamos, por que
              coletamos e seus direitos.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              2. Dados que coletamos
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Dados de navegação:</strong> endereço IP, tipo de
                dispositivo, navegador, páginas visitadas (para melhorar a
                experiência do site).
              </li>
              <li>
                <strong>Dados de contato para compra:</strong> nome, telefone,
                endereço de entrega, método de pagamento preferido —
                fornecidos por você na conversa via WhatsApp ao finalizar uma
                compra.
              </li>
              <li>
                <strong>Cookies essenciais:</strong> usamos cookies
                estritamente necessários para o funcionamento do site (ex:
                carrinho, sessão administrativa).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              3. Por que usamos seus dados
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Processar pedidos e combinar envio</li>
              <li>Atender a dúvidas e reclamações</li>
              <li>Cumprir obrigações legais e fiscais</li>
              <li>Melhorar a navegação no site (dados agregados)</li>
            </ul>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              4. Com quem compartilhamos
            </h2>
            <p>
              Não vendemos seus dados. Podemos compartilhar com:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Transportadoras (apenas nome e endereço, para entrega)</li>
              <li>Meios de pagamento, quando aplicável</li>
              <li>Autoridades, quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              5. Por quanto tempo guardamos
            </h2>
            <p>
              Mantemos dados de pedido pelo prazo exigido pela legislação
              fiscal (normalmente 5 anos). Dados de navegação são mantidos por
              até 12 meses.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              6. Seus direitos (LGPD)
            </h2>
            <p>Você pode, a qualquer momento, solicitar:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Confirmação de que tratamos seus dados</li>
              <li>Acesso aos dados que temos sobre você</li>
              <li>Correção de dados incompletos ou desatualizados</li>
              <li>Anonimização ou exclusão dos dados</li>
              <li>Revogação de consentimento</li>
            </ul>
            <p className="mt-4">
              Para exercer esses direitos, nos contate via{" "}
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-nyx-muted"
              >
                @nyx no Instagram
              </a>{" "}
              ou pelo WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">7. Segurança</h2>
            <p>
              Usamos medidas técnicas e organizacionais razoáveis para
              proteger seus dados: conexão HTTPS, controle de acesso aos
              sistemas administrativos e infraestrutura em provedores
              certificados (Vercel, Firebase, Cloudinary).
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              8. Cookies e tecnologias de rastreamento
            </h2>
            <p>
              Atualmente usamos somente cookies estritamente necessários
              (sessão). Caso venhamos a ativar ferramentas de analytics
              (Google Analytics), uma atualização a esta política será
              publicada e um banner de consentimento será exibido.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">9. Alterações</h2>
            <p>
              Podemos atualizar esta política. A data da última revisão está
              ao final do documento.
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
