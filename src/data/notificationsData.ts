export interface ExtremeNotificationItem {
  titulo: string;
  corpo: string;
}

export const NOTIFICACOES_AMEACA_EXTREMA_LIBRAS: ExtremeNotificationItem[] = [
  {
    titulo: 'Não deslize essa notificação.',
    corpo:
      'Eu sei que você está com o celular na mão agora. Faça a lição de Libras antes que eu tome providências.'
  },
  {
    titulo: 'Sua ofensiva vai virar história.',
    corpo:
      'Você tem 10 minutos para abrir o app. Depois disso, não me responsabilizo pelo destino do seu progresso.'
  },
  {
    titulo: 'Belo Wi-Fi você tem aí.',
    corpo:
      'Seria uma pena se ele caísse bem na hora do seu filme porque você não treinou os sinais hoje.'
  },
  {
    titulo: "O sinal de 'Perigo' é com você.",
    corpo:
      'Ignorar esse aviso pela terceira vez seguida ativa protocolos que você não quer conhecer.'
  },
  {
    titulo: 'Eu vi você online.',
    corpo:
      'Tem tempo para responder mensagem, mas não tem 2 minutos para praticar Libras? Péssima escolha.'
  },
  {
    titulo: 'Último aviso antes do caos.',
    corpo:
      'Ou você abre esse app agora, ou eu começo a mandar uma notificação a cada 3 minutos até amanhã.'
  },
  {
    titulo: 'Não teste a minha paciência.',
    corpo:
      'A câmera do seu celular já está ligada esperando você sinalizar. Não me faça esperar mais.'
  },
  {
    titulo: 'Que silêncio perigoso.',
    corpo:
      'Você acha mesmo que pode simplesmente parar de estudar Libras e seguir a vida normalmente? Abre logo.'
  },
  {
    titulo: 'Seu histórico está interessante.',
    corpo:
      'Mas tudo fica em segredo se você completar pelo menos uma lição rápida nos próximos 5 minutos.'
  },
  {
    titulo: 'Não adianta bloquear o app.',
    corpo:
      'Eu sempre dou um jeito de voltar. Pratique seus sinais hoje e ninguém sai ferido.'
  },
  {
    titulo: 'Contagem regressiva iniciada.',
    corpo:
      'Sua ofensiva está por um fio. Mexa essas mãos agora ou diga adeus aos seus dias seguidos.'
  },
  {
    titulo: 'Você realmente vai me ignorar?',
    corpo:
      'Anotei seu nome na minha lista. A única forma de sair dela é fazendo a lição de hoje.'
  },
  {
    titulo: 'Estou na porta da sua casa.',
    corpo:
      'Mentira. Mas se você não abrir o app em 5 minutos, eu descubro seu endereço.'
  },
  {
    titulo: 'Apenas um lembrete amigável.',
    corpo:
      'De amigável não tem nada. Entra no app e faz os sinais antes que eu apague seus pontos.'
  },
  {
    titulo: 'Você sabe o que tem que fazer.',
    corpo:
      'Não me faça repetir. Três minutos de treino de Libras agora e eu deixo você em paz.'
  },
  {
    titulo: 'Cuidado ao sair na rua hoje.',
    corpo:
      'Principalmente se você não souber pedir ajuda em Libras. Entra no app e vai estudar.'
  },
  {
    titulo: 'Estou decepcionado, mas preparado.',
    corpo:
      'Sua bateria vai acabar misteriosamente mais rápido se você ignorar essa lição de novo.'
  },
  {
    titulo: 'Sem desculpas hoje.',
    corpo:
      "Nem o sinal de 'Desculpa' vai te salvar se você deixar sua ofensiva zerar à meia-noite."
  }
];

export const INACTIVITY_TIERS_HOURS = [24, 48, 72] as const;

export function pickRandomExtremeNotification(seed?: number): ExtremeNotificationItem {
  const index =
    typeof seed === 'number' && Number.isFinite(seed)
      ? Math.abs(Math.trunc(seed)) % NOTIFICACOES_AMEACA_EXTREMA_LIBRAS.length
      : Math.floor(Math.random() * NOTIFICACOES_AMEACA_EXTREMA_LIBRAS.length);
  return NOTIFICACOES_AMEACA_EXTREMA_LIBRAS[index];
}

export function getInactivityTierForElapsedMs(elapsedMs: number): 24 | 48 | 72 | null {
  const hours = elapsedMs / 3_600_000;
  if (hours >= 72) return 72;
  if (hours >= 48) return 48;
  if (hours >= 24) return 24;
  return null;
}
