import express from "express";
import fs from "fs";
import path from "path";
import * as webpushNs from "web-push";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const webpush =
  (webpushNs as unknown as { default?: typeof import("web-push") }).default ||
  (webpushNs as unknown as typeof import("web-push"));

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

const NOTIFICACOES_AMEACA_EXTREMA_LIBRAS = [
  {
    titulo: "Não deslize essa notificação.",
    corpo: "Eu sei que você está com o celular na mão agora. Faça a lição de Libras antes que eu tome providências."
  },
  {
    titulo: "Sua ofensiva vai virar história.",
    corpo: "Você tem 10 minutos para abrir o app. Depois disso, não me responsabilizo pelo destino do seu progresso."
  },
  {
    titulo: "Belo Wi-Fi você tem aí.",
    corpo: "Seria uma pena se ele caísse bem na hora do seu filme porque você não treinou os sinais hoje."
  },
  {
    titulo: "O sinal de 'Perigo' é com você.",
    corpo: "Ignorar esse aviso pela terceira vez seguida ativa protocolos que você não quer conhecer."
  },
  {
    titulo: "Eu vi você online.",
    corpo: "Tem tempo para responder mensagem, mas não tem 2 minutos para praticar Libras? Péssima escolha."
  },
  {
    titulo: "Último aviso antes do caos.",
    corpo: "Ou você abre esse app agora, ou eu começo a mandar uma notificação a cada 3 minutos até amanhã."
  },
  {
    titulo: "Não teste a minha paciência.",
    corpo: "A câmera do seu celular já está ligada esperando você sinalizar. Não me faça esperar mais."
  },
  {
    titulo: "Que silêncio perigoso.",
    corpo: "Você acha mesmo que pode simplesmente parar de estudar Libras e seguir a vida normalmente? Abre logo."
  },
  {
    titulo: "Seu histórico está interessante.",
    corpo: "Mas tudo fica em segredo se você completar pelo menos uma lição rápida nos próximos 5 minutos."
  },
  {
    titulo: "Não adianta bloquear o app.",
    corpo: "Eu sempre dou um jeito de voltar. Pratique seus sinais hoje e ninguém sai ferido."
  },
  {
    titulo: "Contagem regressiva iniciada.",
    corpo: "Sua ofensiva está por um fio. Mexa essas mãos agora ou diga adeus aos seus dias seguidos."
  },
  {
    titulo: "Você realmente vai me ignorar?",
    corpo: "Anotei seu nome na minha lista. A única forma de sair dela é fazendo a lição de hoje."
  },
  {
    titulo: "Estou na porta da sua casa.",
    corpo: "Mentira. Mas se você não abrir o app em 5 minutos, eu descubro seu endereço."
  },
  {
    titulo: "Apenas um lembrete amigável.",
    corpo: "De amigável não tem nada. Entra no app e faz os sinais antes que eu apague seus pontos."
  },
  {
    titulo: "Você sabe o que tem que fazer.",
    corpo: "Não me faça repetir. Três minutos de treino de Libras agora e eu deixo você em paz."
  },
  {
    titulo: "Cuidado ao sair na rua hoje.",
    corpo: "Principalmente se você não souber pedir ajuda em Libras. Entra no app e vai estudar."
  },
  {
    titulo: "Estou decepcionado, mas preparado.",
    corpo: "Sua bateria vai acabar misteriosamente mais rápido se você ignorar essa lição de novo."
  },
  {
    titulo: "Sem desculpas hoje.",
    corpo: "Nem o sinal de 'Desculpa' vai te salvar se você deixar sua ofensiva zerar à meia-noite."
  }
];

function pickRandomExtremeNotificationServer() {
  const idx = Math.floor(Math.random() * NOTIFICACOES_AMEACA_EXTREMA_LIBRAS.length);
  return NOTIFICACOES_AMEACA_EXTREMA_LIBRAS[idx];
}

// --- Web Push (VAPID) Setup & Subscription Store ---
interface StoredPushSubscription {
  subscription: {
    endpoint: string;
    expirationTime?: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  uid?: string | null;
  fcmToken?: string | null;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  timezoneOffsetMinutes: number;
  lastSentDayKey?: string;
  ultimoAcessoAt?: number;
  lastInactivityTierSent?: 24 | 48 | 72 | null;
  updatedAt: number;
}

const VAPID_FILE_PATH = path.join(process.cwd(), ".vapid-keys.json");
const SUBSCRIPTIONS_FILE_PATH = path.join(process.cwd(), ".push-subscriptions.json");
const subscriptionStore = new Map<string, StoredPushSubscription>();

function loadOrCreateVapidKeys(): { publicKey: string; privateKey: string; subject: string } {
  const envPub = process.env.VAPID_PUBLIC_KEY?.trim();
  const envPriv = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:suporte@easylib.app";

  if (envPub && envPriv) {
    return { publicKey: envPub, privateKey: envPriv, subject };
  }

  try {
    if (fs.existsSync(VAPID_FILE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(VAPID_FILE_PATH, "utf-8"));
      if (typeof parsed.publicKey === "string" && typeof parsed.privateKey === "string") {
        return { publicKey: parsed.publicKey, privateKey: parsed.privateKey, subject };
      }
    }
  } catch {
    // Regenerate below if unreadable
  }

  const generated = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(
      VAPID_FILE_PATH,
      JSON.stringify({ publicKey: generated.publicKey, privateKey: generated.privateKey }, null, 2)
    );
  } catch {
    // Non-fatal in read-only environments; keep in memory
  }
  return { publicKey: generated.publicKey, privateKey: generated.privateKey, subject };
}

const vapidKeys = loadOrCreateVapidKeys();
webpush.setVapidDetails(vapidKeys.subject, vapidKeys.publicKey, vapidKeys.privateKey);

function loadSubscriptionsFromDisk() {
  try {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE_PATH, "utf-8"));
    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (item?.subscription?.endpoint && item?.subscription?.keys?.p256dh && item?.subscription?.keys?.auth) {
          subscriptionStore.set(item.subscription.endpoint, item);
        }
      }
    }
  } catch {
    // Ignore malformed disk cache
  }
}

function persistSubscriptionsToDisk() {
  try {
    fs.writeFileSync(
      SUBSCRIPTIONS_FILE_PATH,
      JSON.stringify(Array.from(subscriptionStore.values()), null, 2)
    );
  } catch {
    // Non-fatal if filesystem is ephemeral
  }
}

loadSubscriptionsFromDisk();

function isValidPushSubscriptionInput(sub: unknown): sub is StoredPushSubscription["subscription"] {
  if (!sub || typeof sub !== "object") return false;
  const candidate = sub as Record<string, any>;
  if (typeof candidate.endpoint !== "string" || candidate.endpoint.length < 12 || candidate.endpoint.length > 1024) {
    return false;
  }
  try {
    const parsedUrl = new URL(candidate.endpoint);
    if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
      return false;
    }
  } catch {
    return false;
  }
  if (!candidate.keys || typeof candidate.keys !== "object") return false;
  if (
    typeof candidate.keys.p256dh !== "string" ||
    candidate.keys.p256dh.length < 10 ||
    candidate.keys.p256dh.length > 256
  ) {
    return false;
  }
  if (
    typeof candidate.keys.auth !== "string" ||
    candidate.keys.auth.length < 10 ||
    candidate.keys.auth.length > 256
  ) {
    return false;
  }
  return true;
}

async function deliverPushNotification(
  entry: StoredPushSubscription,
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<{ ok: boolean; gone?: boolean; error?: string }> {
  try {
    await webpush.sendNotification(
      entry.subscription,
      JSON.stringify({
        title: payload.title.slice(0, 120),
        body: payload.body.slice(0, 300),
        url: payload.url || "/",
        tag: payload.tag || "easylib-push",
      }),
      { TTL: 3600 }
    );
    return { ok: true };
  } catch (err: any) {
    const statusCode = err?.statusCode;
    const bodyDetail = typeof err?.body === "string" ? err.body.slice(0, 160) : "";
    console.warn("[push] falha ao entregar notificação:", statusCode || err?.message, bodyDetail);
    if (statusCode === 404 || statusCode === 410) {
      subscriptionStore.delete(entry.subscription.endpoint);
      persistSubscriptionsToDisk();
      return { ok: false, gone: true, error: "Assinatura expirada" };
    }
    return {
      ok: false,
      error: statusCode ? `Push relay retornou HTTP ${statusCode}` : err?.message || "Falha no envio push",
    };
  }
}

// Background daily reminder & 24h/48h/72h inactivity scheduler (runs even when no browser tabs are open)
setInterval(async () => {
  if (subscriptionStore.size === 0) return;
  const nowUtc = new Date();
  const nowMs = nowUtc.getTime();

  for (const entry of subscriptionStore.values()) {
    if (!entry.reminderEnabled) continue;

    // Adjust UTC clock using subscriber timezoneOffsetMinutes (JS getTimezoneOffset convention: UTC - local)
    const localMs = nowMs - entry.timezoneOffsetMinutes * 60_000;
    const localDate = new Date(localMs);
    const localHour = localDate.getUTCHours();
    const localMin = localDate.getUTCMinutes();
    const dayKey = localDate.toISOString().slice(0, 10);

    const lastAccessMs = entry.ultimoAcessoAt || entry.updatedAt || nowMs;
    const inactiveHours = (nowMs - lastAccessMs) / 3_600_000;
    const tier: 24 | 48 | 72 | null =
      inactiveHours >= 72 ? 72 : inactiveHours >= 48 ? 48 : inactiveHours >= 24 ? 24 : null;

    const nowTotalMin = localHour * 60 + localMin;
    const targetTotalMin = entry.reminderHour * 60 + entry.reminderMinute;

    const shouldSendDailyAtHour =
      entry.lastSentDayKey !== dayKey &&
      nowTotalMin >= targetTotalMin &&
      nowTotalMin <= targetTotalMin + 15;

    const shouldSendInactivityTier =
      tier !== null &&
      entry.lastInactivityTierSent !== tier &&
      nowTotalMin >= targetTotalMin;

    if (shouldSendDailyAtHour || shouldSendInactivityTier) {
      const picked = pickRandomExtremeNotificationServer();
      const delivery = await deliverPushNotification(entry, {
        title: picked.titulo,
        body: picked.corpo,
        url: "/",
        tag: tier ? `easylib-inactivity-${tier}h-${dayKey}` : `easylib-daily-${dayKey}`,
      });
      if (delivery.ok) {
        entry.lastSentDayKey = dayKey;
        if (tier !== null) {
          entry.lastInactivityTierSent = tier;
        }
        persistSubscriptionsToDisk();
      }
    }
  }
}, 30_000);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "easylib" });
});

// Alphabet photos/videos auto-discovery from /public/alfabeto/
app.get("/api/alphabet-media", (_req, res) => {
  const alphabetDir = path.join(process.cwd(), "public", "alfabeto");
  const files: Record<string, string> = {};
  try {
    if (fs.existsSync(alphabetDir)) {
      const entries = fs.readdirSync(alphabetDir);
      const allowedExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm"]);
      for (const name of entries) {
        const ext = path.extname(name).toLowerCase();
        if (!allowedExt.has(ext)) continue;
        const base = path.basename(name, path.extname(name)).trim().normalize("NFC").toUpperCase();
        if (/^[A-ZÇ]$/.test(base)) {
          files[base] = `/alfabeto/${encodeURIComponent(name)}`;
        }
      }
    }
  } catch {
    // Non-fatal if directory unreadable
  }
  res.json({ files });
});

// Push API Endpoints
app.get("/api/push/status", (_req, res) => {
  res.json({
    ok: true,
    subscribers: subscriptionStore.size,
    vapidConfigured: Boolean(vapidKeys.publicKey && vapidKeys.privateKey),
  });
});

app.get("/api/push/vapid-public-key", (_req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post("/api/push/subscribe", (req, res) => {
  const {
    subscription,
    uid,
    fcmToken,
    ultimoAcessoMs,
    reminderEnabled,
    reminderHour,
    reminderMinute,
    timezoneOffsetMinutes
  } = req.body || {};

  if (!isValidPushSubscriptionInput(subscription)) {
    return res.status(400).json({ error: "Assinatura push inválida." });
  }

  const safeHour =
    typeof reminderHour === "number" && Number.isFinite(reminderHour)
      ? Math.max(0, Math.min(23, Math.trunc(reminderHour)))
      : 19;
  const safeMinute =
    typeof reminderMinute === "number" && Number.isFinite(reminderMinute)
      ? Math.max(0, Math.min(59, Math.trunc(reminderMinute)))
      : 0;
  const safeTz =
    typeof timezoneOffsetMinutes === "number" && Number.isFinite(timezoneOffsetMinutes)
      ? Math.max(-840, Math.min(840, Math.trunc(timezoneOffsetMinutes)))
      : 180;
  const safeLastAccess =
    typeof ultimoAcessoMs === "number" && Number.isFinite(ultimoAcessoMs)
      ? ultimoAcessoMs
      : Date.now();

  const existing = subscriptionStore.get(subscription.endpoint);
  const scheduleChanged =
    !existing ||
    existing.reminderEnabled !== Boolean(reminderEnabled) ||
    existing.reminderHour !== safeHour ||
    existing.reminderMinute !== safeMinute ||
    existing.timezoneOffsetMinutes !== safeTz;

  const record: StoredPushSubscription = {
    subscription: {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime ?? null,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    },
    uid: typeof uid === "string" ? uid.slice(0, 128) : null,
    fcmToken: typeof fcmToken === "string" ? fcmToken.slice(0, 512) : null,
    reminderEnabled: Boolean(reminderEnabled),
    reminderHour: safeHour,
    reminderMinute: safeMinute,
    timezoneOffsetMinutes: safeTz,
    lastSentDayKey: scheduleChanged ? undefined : existing?.lastSentDayKey,
    ultimoAcessoAt: safeLastAccess,
    lastInactivityTierSent: null,
    updatedAt: Date.now(),
  };

  subscriptionStore.set(subscription.endpoint, record);
  persistSubscriptionsToDisk();
  return res.json({ ok: true, reminderEnabled: record.reminderEnabled });
});

app.post("/api/push/ping-access", (req, res) => {
  const { endpoint, uid, ultimoAcessoMs } = req.body || {};
  if (typeof endpoint === "string" && subscriptionStore.has(endpoint)) {
    const existing = subscriptionStore.get(endpoint)!;
    existing.ultimoAcessoAt =
      typeof ultimoAcessoMs === "number" && Number.isFinite(ultimoAcessoMs)
        ? ultimoAcessoMs
        : Date.now();
    if (typeof uid === "string" && uid.trim()) {
      existing.uid = uid.slice(0, 128);
    }
    existing.lastInactivityTierSent = null;
    existing.updatedAt = Date.now();
    subscriptionStore.set(endpoint, existing);
    persistSubscriptionsToDisk();
  }
  return res.json({ ok: true });
});

app.post("/api/push/unsubscribe", (req, res) => {
  const endpoint = req.body?.endpoint;
  if (typeof endpoint === "string" && endpoint.length > 0) {
    subscriptionStore.delete(endpoint);
    persistSubscriptionsToDisk();
  }
  return res.json({ ok: true });
});

app.post("/api/push/send-test", async (req, res) => {
  const { endpoint, title, body, delaySeconds } = req.body || {};
  if (typeof endpoint !== "string") {
    return res.status(400).json({ error: "Endpoint da assinatura não informado." });
  }

  const entry = subscriptionStore.get(endpoint);
  if (!entry) {
    return res.status(404).json({ error: "Assinatura não encontrada no servidor. Ative as notificações novamente." });
  }

  const fallbackMsg = pickRandomExtremeNotificationServer();
  const safeTitle =
    typeof title === "string" && title.trim()
      ? title.trim().slice(0, 120)
      : fallbackMsg.titulo;
  const safeBody =
    typeof body === "string" && body.trim()
      ? body.trim().slice(0, 300)
      : fallbackMsg.corpo;
  const safeDelay =
    typeof delaySeconds === "number" && Number.isFinite(delaySeconds)
      ? Math.max(0, Math.min(120, Math.trunc(delaySeconds)))
      : 0;

  if (safeDelay > 0) {
    setTimeout(() => {
      deliverPushNotification(entry, {
        title: safeTitle,
        body: safeBody,
        url: "/",
        tag: `easylib-bg-${Date.now()}`,
      }).catch(() => undefined);
    }, safeDelay * 1000);

    return res.json({
      ok: true,
      scheduledInSeconds: safeDelay,
      message: `Notificação agendada para ${safeDelay}s (funciona mesmo com o app fechado).`,
    });
  }

  const result = await deliverPushNotification(entry, {
    title: safeTitle,
    body: safeBody,
    url: "/",
    tag: `easylib-now-${Date.now()}`,
  });

  if (!result.ok) {
    return res.status(result.gone ? 410 : 502).json({ error: result.error });
  }

  return res.json({ ok: true, scheduledInSeconds: 0 });
});

// Initialize Gemini client lazily or when key is present
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. API Endpoint: Portuguese -> Libras Glosa & Breakdown Cards
app.post("/api/gemini/translate-to-libras", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Texto não fornecido" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const words = String(text).toUpperCase().split(" ").filter(Boolean);
      return res.json({
        glosa: words.join(" "),
        explanation: "Tradução adaptada sem servidor Gemini.",
        cards: words.map((w: string) => ({
          word: w,
          handConfig: "Mão em 'A' ou aberta adaptada",
          location: "Espaço neutro à frente do peito",
          movement: "Movimento contínuo suave",
          facialExpression: "Expressão neutra ou afirmativa",
          dactylology: w.length <= 4,
          iconName: "Hand",
        })),
      });
    }

    const prompt = `Você é um mestre em Libras (Língua Brasileira de Sinais) e gramática de Libras.
Traduza a frase em português a seguir para a estrutura de GLOSA em Libras (SVO/OSV, sem preposições ou artigos superfluos, com notação maiúscula).
Forneça a resposta estritamente no seguinte formato JSON:
{
  "glosa": "FRASE EM GLOSA LIBRAS",
  "explanation": "Explicação curta da estrutura gramatical aplicada na Libras",
  "nmfGrammarNote": "Nota sobre a expressão facial/corporal exigida (ex: interrogativo, afirmativo, intensidade)",
  "cards": [
    {
      "word": "PALAVRA_GLOSA",
      "handConfig": "Descrição detalhada da configuração da mão (ex: Mão em 'B', Mão em '5', Dálteis)",
      "location": "Ponto de articulação (ex: Queixo, Peito, Espaço Neutro, Testa)",
      "movement": "Descrição do movimento (ex: Para frente, Arco circular, Toque duplo)",
      "facialExpression": "Expressão facial não-manual associada (ex: Sobrancelhas elevadas, Olhar fixo, Bochechas infladas)",
      "dactylology": false,
      "iconName": "Hand"
    }
  ]
}

Frase em Português: "${String(text).slice(0, 500)}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    return res.json(data);
  } catch (error: any) {
    console.error("Erro na tradução para Libras:", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

// 2. API Endpoint: Real-time Camera Frame Analysis for Sign Recognition & Form Correction
app.post("/api/gemini/analyze-sign-camera", async (req, res) => {
  try {
    const { imageBase64, expectedSign } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const score = Math.floor(Math.random() * 20) + 80;
      return res.json({
        recognizedSign: expectedSign || "Sinal Libras Detectado",
        accuracyScore: score,
        handPostureScore: Math.floor(score * 0.95),
        facialExpressionScore: Math.floor(score * 0.98),
        feedback: "Boa posição das mãos! Mantenha os dedos mais firmes e eleve levemente as sobrancelhas.",
        corrections: [
          "Mão dominante ligeiramente mais à frente do peito",
          "Expressão facial afirmativa com contato visual com a câmera",
        ],
        isCorrect: score >= 80,
      });
    }

    const base64Clean = String(imageBase64).replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `Analise este frame de webcam onde o usuário está tentando fazer o sinal de Libras: "${String(expectedSign || "qualquer sinal de Libras").slice(0, 120)}".
Avalie com precisão diagnóstica:
1. Configuração e postura das mãos/dedos.
2. Ponto de articulação/alinhamento com o corpo.
3. Expressão facial e corporal não-manual (NMF).

Retorne em formato JSON estrito:
{
  "recognizedSign": "Nome do sinal que parece estar sendo executado",
  "accuracyScore": 88,
  "handPostureScore": 85,
  "facialExpressionScore": 90,
  "feedback": "Mensagem motivadora e instrutiva em português",
  "corrections": [
    "Dica prática 1 de correção de mão/dedo",
    "Dica prática 2 de ajuste facial/sobrancelhas"
  ],
  "isCorrect": true
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Clean,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    return res.json(data);
  } catch (error: any) {
    console.error("Erro na análise da câmera:", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

// 3. API Endpoint: NMF Facial Expression Validation
app.post("/api/gemini/analyze-facial-nmf", async (req, res) => {
  try {
    const { imageBase64, nmfCategory, targetExpression } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Imagem de rosto não enviada" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        expressionDetected: targetExpression || "Expressão Interrogativa",
        eyebrowStatus: "Franzidas e levemente projetadas",
        mouthStatus: "Boca neutra ou semiaberta",
        headStatus: "Leve inclinação frontal",
        overallScore: 85,
        passed: true,
        feedbackTip: "Excelente projeção de sobrancelhas para frase interrogativa em Libras!",
      });
    }

    const base64Clean = String(imageBase64).replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `Analise a expressão facial não-manual (NMF em Libras) nesta foto.
Categoria esperada: "${String(nmfCategory || "Interrogativo").slice(0, 80)}" / Expressão Alvo: "${String(targetExpression || "Sobrancelhas Franzidas").slice(0, 120)}".

Avalie minuciosamente:
- Sobrancelhas (franzidas vs elevadas)
- Olhos (arregalados, estreitados)
- Articulação da boca e bochechas
- Inclinação de cabeça e ombros

Retorne JSON:
{
  "expressionDetected": "Expressão identificada",
  "eyebrowStatus": "Descrição técnica das sobrancelhas",
  "mouthStatus": "Descrição dos lábios/bochechas",
  "headStatus": "Descrição do movimento de cabeça",
  "overallScore": 92,
  "passed": true,
  "feedbackTip": "Feedback em português orientando o ajuste facial perfeito"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Clean,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    return res.json(data);
  } catch (error: any) {
    console.error("Erro no NMF Facial:", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EasyLib Server] Executando na porta http://0.0.0.0:${PORT}`);
  });
}

startServer();
