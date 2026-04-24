export function DeliveryInfo() {
  return (
    <div className="border-t border-nyx-line pt-6 space-y-5 text-sm">
      <div>
        <p className="label-mono text-xs text-nyx-muted mb-2">Entregas</p>
        <div className="space-y-0.5 text-nyx-ink leading-relaxed">
          <p>Seg – Sex: 08h às 12h30 e 18h30 às 21h30</p>
          <p>Sáb e feriados: 10h às 13h</p>
        </div>
        <p className="text-nyx-muted mt-2">
          Cruzeiro: R$&nbsp;5 &middot; Outras cidades: a combinar
        </p>
      </div>

      <div>
        <p className="label-mono text-xs text-nyx-muted mb-2">Trocas e devoluções</p>
        <ul className="space-y-1 text-nyx-muted leading-relaxed list-disc list-inside">
          <li>Até 3 dias após a aquisição</li>
          <li>Peça em perfeito estado, sem marcas de uso</li>
        </ul>
      </div>
    </div>
  );
}
