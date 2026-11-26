import { initializeApp } from 'firebase/app';
import {
  ConfirmationResult,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import {
  getMessaging,
  getToken,
  isSupported as isMessagingSupported,
  onMessage
} from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');
appleProvider.setCustomParameters({ locale: 'pt_BR' });

export {
  createUserWithEmailAndPassword,
  getRedirectResult,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
};
export type { ConfirmationResult };

export function isUserVerifiedForFirestore(user: User | null): boolean {
  if (!user) return false;
  if (user.emailVerified) return true;
  if (user.phoneNumber) return true;
  return user.providerData.some(
    (p) => p.providerId === 'google.com' || p.providerId === 'apple.com'
  );
}

export async function requestFirebaseFcmToken(
  serviceWorkerRegistration?: ServiceWorkerRegistration
): Promise<string | null> {
  try {
    const supported = await isMessagingSupported();
    if (!supported) return null;

    const vapidKey = String(import.meta.env.VITE_FIREBASE_VAPID_KEY || '').trim();
    if (!vapidKey) {
      return null;
    }

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration
    });
    return token || null;
  } catch {
    return null;
  }
}

export async function listenForegroundFcmMessages(
  onPayload: (payload: { title?: string; body?: string }) => void
): Promise<() => void> {
  try {
    const supported = await isMessagingSupported();
    if (!supported) return () => undefined;
    const messaging = getMessaging(app);
    return onMessage(messaging, (msg) => {
      onPayload({
        title: msg.notification?.title || msg.data?.title,
        body: msg.notification?.body || msg.data?.body
      });
    });
  } catch {
    return () => undefined;
  }
}

export function formatFirebaseAuthError(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const rawMessage = error instanceof Error ? error.message : String(error || '');
  const currentHost =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : '';

  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'A janela de login foi fechada antes de concluir. Tente novamente ou use o modo na mesma aba.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela pop-up de login. Permita pop-ups ou use o botão alternativo na mesma aba.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Pop-up de login não suportado neste ambiente/navegador. Use o botão alternativo na mesma aba ou abra no navegador padrão.';
    case 'auth/web-storage-unsupported':
      return 'Os cookies/armazenamento do navegador estão bloqueados. Ative cookies para fazer login com Google.';
    case 'auth/operation-not-allowed':
      return 'Login com Google ainda não está ativado no Console do Firebase (Authentication > Sign-in method).';
    case 'auth/unauthorized-domain':
      return currentHost
        ? `O domínio "${currentHost}" ainda não está autorizado no Firebase Auth (Authentication > Settings > Authorized domains).`
        : 'Este domínio ainda não está autorizado no Firebase Auth (Authentication > Settings > Authorized domains).';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada no Firebase Authentication.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha inválidos. Confira seus dados ou redefina a senha.';
    case 'auth/email-already-in-use':
      return 'Já existe uma conta cadastrada com este e-mail. Tente entrar ou recuperar a senha.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Informe um endereço de e-mail válido.';
    case 'auth/invalid-phone-number':
      return 'Número de celular inválido. Use o formato com DDD, ex: +55 11 99999-9999.';
    case 'auth/invalid-verification-code':
      return 'Código SMS incorreto. Verifique os 6 dígitos enviados ao seu celular.';
    case 'auth/code-expired':
      return 'O código SMS expirou. Solicite um novo código.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas em sequência. Aguarde alguns minutos antes de tentar novamente.';
    case 'auth/captcha-check-failed':
    case 'auth/invalid-app-credential':
    case 'auth/missing-client-identifier':
      return 'Falha na verificação de segurança (reCAPTCHA) deste domínio. Recarregue ou verifique os domínios autorizados no Firebase Auth.';
    case 'auth/quota-exceeded':
      return 'Limite diário de envios de SMS atingido. Tente novamente mais tarde ou use outro método de entrada.';
    case 'auth/account-exists-with-different-credential':
      return 'Este e-mail já está vinculado a outro método de entrada.';
    case 'auth/internal-error':
      return 'Erro interno ao conectar com o Google Auth. Verifique sua conexão ou se o domínio está autorizado.';
    default:
      if (rawMessage.includes('network-request-failed')) {
        return 'Sem conexão com a internet no momento.';
      }
      return code
        ? `Não foi possível concluir o login (${code}).`
        : rawMessage || 'Não foi possível concluir a autenticação.';
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
