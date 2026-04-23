import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Trocas e devoluções",
  description: "Política de trocas e devoluções",
  alternates: { canonical: "/trocas" },
};

export default function ReturnsPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-nyx max-w-3xl">
        <p className="label-mono text-nyx-muted mb-4">Institucional</p>
        <h1 className="heading-display text-4xl md:text-5xl mb-12">
          Trocas e devoluções
        </h1>

        <div className="bg-nyx-cream/60 border border-nyx-line p-4 text-xs text-nyx-muted mb-10">
          Documento em versão inicial, baseado no Código de Defesa do
          Consumidor (Lei 8.078/1990). Revise com assessoria jurídica antes
          de uso com clientes finais.
        </div>

        <div className="prose-nyx space-y-8 text-nyx-ink leading-relaxed">
          <section>
            <h2 className="heading-display text-2xl mb-3">
              1. Direito de arrependimento (7 dias)
            </h2>
            <p>
              Compras feitas à distância (pelo site ou WhatsApp) podem ser
              canceladas em até <strong>7 dias corridos</strong> a partir do
              recebimento do produto, conforme Art. 49 do CDC. Nesse caso, o
              valor pago é devolvido integralmente.
            </p>
            <p className="mt-3">
              Para exercer o arrependimento, nos contate pelo WhatsApp
              informando o pedido. Orientamos sobre o envio de volta. O
              produto deve estar em perfeito estado, com etiquetas e embalagem
              originais.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              2. Troca por defeito
            </h2>
            <p>
              Se a peça chegar com defeito de fabricação, você tem até{" "}
              <strong>30 dias</strong> (para produtos não duráveis) ou{" "}
              <strong>90 dias</strong> (duráveis) para solicitar troca, a
              contar do recebimento. Fotografe o defeito e envie pelo
              WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              3. Troca de tamanho ou modelo
            </h2>
            <p>
              Como trabalhamos com drops limitados e estoque pequeno, trocas
              de tamanho estão sujeitas à disponibilidade. Fale com a gente
              pelo WhatsApp em até 7 dias após o recebimento e avaliamos caso
              a caso.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              4. Como proceder
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Entre em contato pelo WhatsApp com o número do pedido</li>
              <li>Nós confirmamos o pedido e orientamos o envio de volta</li>
              <li>
                Após recebermos e conferirmos o produto, processamos a troca
                ou o estorno em até 7 dias úteis
              </li>
            </ol>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              5. Custo do envio de devolução
            </h2>
            <p>
              Se o motivo for defeito de fabricação ou erro nosso (peça
              errada), nós cobrimos o frete. Em caso de arrependimento (7
              dias), o custo do envio de volta é por sua conta, conforme
              prevê o CDC.
            </p>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">
              6. Não aceitamos troca quando
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Peça usada, lavada ou sem etiqueta original</li>
              <li>Solicitação feita fora dos prazos acima</li>
              <li>
                Dano causado pelo uso inadequado (não seguir as instruções
                de lavagem, por exemplo)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="heading-display text-2xl mb-3">7. Contato</h2>
            <p>
              Qualquer dúvida sobre troca ou devolução:{" "}
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-nyx-muted"
              >
                @nyx no Instagram
              </a>{" "}
              ou WhatsApp no botão de qualquer produto.
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
