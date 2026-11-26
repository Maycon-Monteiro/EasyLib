import { UserProfile, LibrasTrack, LeagueTier } from '../types';
import { LIBRAS_ACHIEVEMENTS, LIBRAS_QUESTS } from '../data/librasData';

const STORAGE_KEY = 'duolingo_libras_user_profile_v1';
const LAST_PRACTICE_DATE_KEY = 'duolingo_libras_last_practice_date_v1';
const RESET_MIGRATION_KEY = 'easylib_data_reset_v2';

const VALID_TRACKS: LibrasTrack[] = ['iniciante', 'intermediario', 'avancado', 'gramatica_nmf'];
const VALID_LEAGUES: LeagueTier[] = [
  'Bronze',
  'Prata',
  'Ouro',
  'Safira',
  'Rubi',
  'Esmeralda',
  'Ametista',
  'Pérola',
  'Obsidiana',
  'Diamante'
];

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOffsetDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + deltaDays);
  return getLocalDateKey(dt);
}

export function diffCalendarDays(prevDateKey: string, nextDateKey: string): number {
  const [py, pm, pd] = prevDateKey.split('-').map(Number);
  const [ny, nm, nd] = nextDateKey.split('-').map(Number);
  if (!py || !pm || !pd || !ny || !nm || !nd) return 0;
  const prevUtc = Date.UTC(py, pm - 1, pd);
  const nextUtc = Date.UTC(ny, nm - 1, nd);
  return Math.round((nextUtc - prevUtc) / 86400000);
}

export function reconcileStreakOnLoad(
  streakDays: number,
  lastDateKey: string | null,
  todayKey: string,
  freezeCount: number
): {
  streakDays: number;
  streakFreezeCount: number;
  hasActiveStreakFreeze: boolean;
  nextLastDateKey: string | null;
} {
  if (!lastDateKey || streakDays <= 0) {
    return {
      streakDays: lastDateKey === todayKey ? Math.max(1, streakDays) : streakDays,
      streakFreezeCount: freezeCount,
      hasActiveStreakFreeze: freezeCount > 0,
      nextLastDateKey: lastDateKey
    };
  }

  const gap = diffCalendarDays(lastDateKey, todayKey);
  if (gap <= 1) {
    return {
      streakDays,
      streakFreezeCount: freezeCount,
      hasActiveStreakFreeze: freezeCount > 0,
      nextLastDateKey: lastDateKey
    };
  }

  if (gap === 2 && freezeCount > 0) {
    const nextFreeze = freezeCount - 1;
    return {
      streakDays,
      streakFreezeCount: nextFreeze,
      hasActiveStreakFreeze: nextFreeze > 0,
      nextLastDateKey: getOffsetDateKey(todayKey, -1)
    };
  }

  return {
    streakDays: 0,
    streakFreezeCount: freezeCount,
    hasActiveStreakFreeze: freezeCount > 0,
    nextLastDateKey: lastDateKey
  };
}

export function computeNextStreakOnPractice(
  currentStreak: number,
  lastDateKey: string | null,
  todayKey: string
): number {
  if (!lastDateKey) {
    return Math.max(1, currentStreak + 1);
  }
  const gap = diffCalendarDays(lastDateKey, todayKey);
  if (gap === 0) {
    return Math.max(1, currentStreak);
  }
  if (gap === 1) {
    return Math.max(1, currentStreak) + 1;
  }
  return 1;
}

export const DEFAULT_PROFILE: UserProfile = {
  userId: 'DUO-LIBRAS-7842',
  name: 'Visitante',
  username: 'visitante_easylib',
  avatar: 'preset:libi',
  selectedTrack: 'iniciante',
  xp: 0,
  gems: 0,
  hearts: 5,
  maxHearts: 5,
  streakDays: 0,
  hasActiveStreakFreeze: false,
  streakFreezeCount: 0,
  isSuperDuolingo: false,
  completedNodeIds: [],
  learnedSignIds: [],
  viewedSignIds: [],
  favoriteSignIds: [],
  currentLeague: 'Bronze',
  duoOutfit: 'classic',
  unlockedOutfits: ['classic'],
  nameTagId: 'tag_classic',
  nameTagImage: 'preset:libi',
  nameTagSubtitle: '',
  playerClassId: 'class_aprendiz',
  unlockedNameTags: ['tag_classic'],
  unlockedClasses: ['class_aprendiz'],
  unlockedVideoIds: [],
  fcmToken: '',
  ultimoAcessoMs: Date.now(),
  wagerActive: false,
  wagerDaysLeft: 0,
  quests: LIBRAS_QUESTS,
  achievements: LIBRAS_ACHIEVEMENTS,
  mistakeHistory: []
};

function asSafeNumber(value: unknown, fallback: number, min = 0, max = 10000000): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function asSafeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((v) => String(v)).filter(Boolean);
}

export function sanitizeStoredProfile(raw: unknown): UserProfile {
  if (!raw || typeof raw !== 'object') return DEFAULT_PROFILE;
  const parsed = raw as Record<string, unknown>;

  const maxHearts = asSafeNumber(parsed.maxHearts, DEFAULT_PROFILE.maxHearts, 1, 20);
  const hearts = asSafeNumber(parsed.hearts, DEFAULT_PROFILE.hearts, 0, maxHearts);
  const rawQuests = Array.isArray(parsed.quests) ? parsed.quests : [];
  const questById = new Map<string, Record<string, unknown>>();
  for (const q of rawQuests) {
    if (q && typeof q === 'object' && typeof (q as { id?: unknown }).id === 'string') {
      questById.set((q as { id: string }).id, q as Record<string, unknown>);
    }
  }

  const sanitizedQuests = LIBRAS_QUESTS.map((defQ) => {
    const saved = questById.get(defQ.id);
    if (!saved) return defQ;
    const current = asSafeNumber(saved.current, defQ.current, 0, defQ.target);
    return {
      ...defQ,
      current,
      completed: Boolean(saved.completed) || current >= defQ.target,
      claimed: Boolean(saved.claimed)
    };
  });

  const xp = asSafeNumber(parsed.xp, DEFAULT_PROFILE.xp, 0, 10000000);
  const completedNodeIds = asSafeStringArray(parsed.completedNodeIds, DEFAULT_PROFILE.completedNodeIds);

  const rawAchievements = Array.isArray(parsed.achievements) ? parsed.achievements : [];
  const achById = new Map<string, Record<string, unknown>>();
  for (const a of rawAchievements) {
    if (a && typeof a === 'object' && typeof (a as { id?: unknown }).id === 'string') {
      achById.set((a as { id: string }).id, a as Record<string, unknown>);
    }
  }

  const sanitizedAchievements = LIBRAS_ACHIEVEMENTS.map((defA) => {
    const saved = achById.get(defA.id);
    return {
      ...defA,
      currentProgress:
        defA.id === 'ach_xp'
          ? xp
          : defA.id === 'ach_nodes'
          ? completedNodeIds.length
          : asSafeNumber(saved?.currentProgress, defA.currentProgress, 0, 10000000)
    };
  });

  const unlockedOutfits = asSafeStringArray(parsed.unlockedOutfits, DEFAULT_PROFILE.unlockedOutfits);
  if (!unlockedOutfits.includes('classic')) {
    unlockedOutfits.unshift('classic');
  }

  const unlockedNameTags = asSafeStringArray(parsed.unlockedNameTags, DEFAULT_PROFILE.unlockedNameTags);
  if (!unlockedNameTags.includes('tag_classic')) {
    unlockedNameTags.unshift('tag_classic');
  }

  const unlockedClasses = asSafeStringArray(parsed.unlockedClasses, DEFAULT_PROFILE.unlockedClasses);
  if (!unlockedClasses.includes('class_aprendiz')) {
    unlockedClasses.unshift('class_aprendiz');
  }

  return {
    userId: typeof parsed.userId === 'string' && parsed.userId.trim() ? parsed.userId.trim() : DEFAULT_PROFILE.userId,
    name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim().slice(0, 80) : DEFAULT_PROFILE.name,
    username:
      typeof parsed.username === 'string' && parsed.username.trim()
        ? parsed.username.trim().slice(0, 40)
        : DEFAULT_PROFILE.username,
    avatar: typeof parsed.avatar === 'string' && parsed.avatar.trim() ? parsed.avatar.trim().slice(0, 16) : DEFAULT_PROFILE.avatar,
    selectedTrack: VALID_TRACKS.includes(parsed.selectedTrack as LibrasTrack)
      ? (parsed.selectedTrack as LibrasTrack)
      : DEFAULT_PROFILE.selectedTrack,
    xp,
    gems: asSafeNumber(parsed.gems, DEFAULT_PROFILE.gems, 0, 10000000),
    hearts,
    maxHearts,
    streakDays: asSafeNumber(parsed.streakDays, DEFAULT_PROFILE.streakDays, 0, 36500),
    hasActiveStreakFreeze:
      typeof parsed.hasActiveStreakFreeze === 'boolean'
        ? parsed.hasActiveStreakFreeze
        : DEFAULT_PROFILE.hasActiveStreakFreeze,
    streakFreezeCount: asSafeNumber(parsed.streakFreezeCount, DEFAULT_PROFILE.streakFreezeCount, 0, 100),
    isSuperDuolingo:
      typeof parsed.isSuperDuolingo === 'boolean'
        ? parsed.isSuperDuolingo
        : DEFAULT_PROFILE.isSuperDuolingo,
    completedNodeIds,
    learnedSignIds: asSafeStringArray(parsed.learnedSignIds, DEFAULT_PROFILE.learnedSignIds),
    viewedSignIds: asSafeStringArray(parsed.viewedSignIds, DEFAULT_PROFILE.viewedSignIds),
    favoriteSignIds: asSafeStringArray(parsed.favoriteSignIds, DEFAULT_PROFILE.favoriteSignIds),
    currentLeague: VALID_LEAGUES.includes(parsed.currentLeague as LeagueTier)
      ? (parsed.currentLeague as LeagueTier)
      : DEFAULT_PROFILE.currentLeague,
    duoOutfit: typeof parsed.duoOutfit === 'string' && parsed.duoOutfit.trim() ? parsed.duoOutfit.trim() : 'classic',
    unlockedOutfits,
    nameTagId:
      typeof parsed.nameTagId === 'string' && parsed.nameTagId.trim()
        ? parsed.nameTagId.trim().slice(0, 40)
        : DEFAULT_PROFILE.nameTagId,
    nameTagImage:
      typeof parsed.nameTagImage === 'string'
        ? parsed.nameTagImage.slice(0, 16000)
        : DEFAULT_PROFILE.nameTagImage,
    nameTagSubtitle:
      typeof parsed.nameTagSubtitle === 'string'
        ? parsed.nameTagSubtitle.slice(0, 40)
        : DEFAULT_PROFILE.nameTagSubtitle,
    playerClassId:
      typeof parsed.playerClassId === 'string' && parsed.playerClassId.trim()
        ? parsed.playerClassId.trim().slice(0, 40)
        : DEFAULT_PROFILE.playerClassId,
    unlockedNameTags,
    unlockedClasses,
    unlockedVideoIds: asSafeStringArray(parsed.unlockedVideoIds, DEFAULT_PROFILE.unlockedVideoIds),
    fcmToken: typeof parsed.fcmToken === 'string' ? parsed.fcmToken.slice(0, 512) : '',
    ultimoAcessoMs:
      typeof parsed.ultimoAcessoMs === 'number' && Number.isFinite(parsed.ultimoAcessoMs)
        ? parsed.ultimoAcessoMs
        : DEFAULT_PROFILE.ultimoAcessoMs,
    wagerActive: typeof parsed.wagerActive === 'boolean' ? parsed.wagerActive : false,
    wagerDaysLeft: asSafeNumber(parsed.wagerDaysLeft, 0, 0, 30),
    quests: sanitizedQuests,
    achievements: sanitizedAchievements,
    mistakeHistory: Array.isArray(parsed.mistakeHistory) ? parsed.mistakeHistory : []
  };
}

export const storageService = {
  hasPracticedToday(): boolean {
    try {
      return localStorage.getItem(LAST_PRACTICE_DATE_KEY) === getLocalDateKey();
    } catch {
      return false;
    }
  },

  getUserProfile(): UserProfile {
    try {
      if (!localStorage.getItem(RESET_MIGRATION_KEY)) {
        const clean = this.resetAllData();
        localStorage.setItem(RESET_MIGRATION_KEY, '1');
        return clean;
      }

      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const sanitized = sanitizeStoredProfile(JSON.parse(data));
        const today = getLocalDateKey();
        const lastDate = localStorage.getItem(LAST_PRACTICE_DATE_KEY);
        const reconciled = reconcileStreakOnLoad(
          sanitized.streakDays,
          lastDate,
          today,
          sanitized.streakFreezeCount
        );
        if (
          reconciled.streakDays !== sanitized.streakDays ||
          reconciled.streakFreezeCount !== sanitized.streakFreezeCount
        ) {
          const updated: UserProfile = {
            ...sanitized,
            streakDays: reconciled.streakDays,
            streakFreezeCount: reconciled.streakFreezeCount,
            hasActiveStreakFreeze: reconciled.hasActiveStreakFreeze
          };
          if (reconciled.nextLastDateKey) {
            localStorage.setItem(LAST_PRACTICE_DATE_KEY, reconciled.nextLastDateKey);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }
        return sanitized;
      }
    } catch (e) {
      console.warn('Failed to read storage', e);
    }
    return { ...DEFAULT_PROFILE, ultimoAcessoMs: Date.now() };
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeStoredProfile(profile)));
    } catch (e) {
      console.warn('Failed to save storage', e);
    }
  },

  touchLastAccess(): UserProfile {
    const profile = this.getUserProfile();
    const updatedProfile: UserProfile = {
      ...profile,
      ultimoAcessoMs: Date.now()
    };
    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  addXpAndGems(xp: number, gems: number, markDailyPractice = false): UserProfile {
    const profile = this.getUserProfile();
    const plusMultiplier = profile.isSuperDuolingo ? 1.5 : 1;
    const effectiveXp = xp > 0 ? Math.round(xp * plusMultiplier) : xp;
    const effectiveGems = gems > 0 ? Math.round(gems * plusMultiplier) : gems;

    const newXp = Math.max(0, profile.xp + effectiveXp);
    const newGems = Math.max(0, profile.gems + effectiveGems);

    let nextStreak = profile.streakDays;
    let nextWagerDaysLeft = profile.wagerDaysLeft;
    let nextWagerActive = profile.wagerActive;
    let bonusWagerGems = 0;

    if (markDailyPractice) {
      try {
        const today = getLocalDateKey();
        const lastDate = localStorage.getItem(LAST_PRACTICE_DATE_KEY);
        const wasNewDay = lastDate !== today;
        nextStreak = computeNextStreakOnPractice(profile.streakDays, lastDate, today);
        localStorage.setItem(LAST_PRACTICE_DATE_KEY, today);

        if (wasNewDay && profile.wagerActive && profile.wagerDaysLeft > 0) {
          nextWagerDaysLeft = profile.wagerDaysLeft - 1;
          if (nextWagerDaysLeft === 0) {
            nextWagerActive = false;
            bonusWagerGems = 100;
          }
        }
      } catch {
        nextStreak = Math.max(1, profile.streakDays);
      }
    }

    const updatedQuests = profile.quests.map((q) => {
      if ((q.id === 'q_daily_1' || q.id === 'q_daily_2') && markDailyPractice && !q.completed) {
        const nextVal = Math.min(q.target, q.current + 1);
        return { ...q, current: nextVal, completed: nextVal >= q.target };
      }
      return q;
    });

    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXp,
      gems: newGems + bonusWagerGems,
      streakDays: nextStreak,
      wagerActive: nextWagerActive,
      wagerDaysLeft: nextWagerDaysLeft,
      quests: updatedQuests,
      ultimoAcessoMs: Date.now()
    };

    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  markNodeCompleted(nodeId: string, xpReward: number, gemsReward: number): UserProfile {
    const profile = this.addXpAndGems(xpReward, gemsReward, true);
    const completedSet = new Set(profile.completedNodeIds);
    completedSet.add(nodeId);

    const updatedProfile: UserProfile = {
      ...profile,
      completedNodeIds: Array.from(completedSet)
    };

    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  markSignLearned(signId: string): UserProfile {
    const profile = this.getUserProfile();
    const set = new Set(profile.learnedSignIds);
    set.add(signId);

    const updatedProfile = {
      ...profile,
      learnedSignIds: Array.from(set)
    };
    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  markSignViewed(signId: string): UserProfile {
    const profile = this.getUserProfile();
    const existing = profile.viewedSignIds || [];
    if (existing.includes(signId)) {
      return profile;
    }
    const updatedProfile = {
      ...profile,
      viewedSignIds: [...existing, signId]
    };
    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  toggleFavoriteSign(signId: string): UserProfile {
    const profile = this.getUserProfile();
    const set = new Set(profile.favoriteSignIds);
    if (set.has(signId)) {
      set.delete(signId);
    } else {
      set.add(signId);
    }

    const updatedProfile = {
      ...profile,
      favoriteSignIds: Array.from(set)
    };
    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  loseHeart(): { profile: UserProfile; outOfHearts: boolean } {
    const profile = this.getUserProfile();
    return { profile, outOfHearts: false };
  },

  refillHearts(): UserProfile {
    return this.getUserProfile();
  },

  setTrack(track: LibrasTrack): UserProfile {
    const profile = this.getUserProfile();
    const updatedProfile = { ...profile, selectedTrack: track };
    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  setLibrasTrack(track: LibrasTrack): UserProfile {
    return this.setTrack(track);
  },

  toggleSuperDuolingo(): UserProfile {
    const profile = this.getUserProfile();
    const isSuper = !profile.isSuperDuolingo;
    const updatedProfile = {
      ...profile,
      isSuperDuolingo: isSuper,
      hearts: profile.maxHearts
    };
    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  },

  resetAllData(): UserProfile {
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          key !== RESET_MIGRATION_KEY &&
          (key.startsWith('duolingo_libras_') ||
            key.startsWith('easylib_active_room_') ||
            key.startsWith('easylib_saved_rooms_') ||
            key === 'easylib_push_settings_v1')
        ) {
          keysToDelete.push(key);
        }
      }
      for (const k of keysToDelete) {
        localStorage.removeItem(k);
      }
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_PRACTICE_DATE_KEY);
      localStorage.setItem(RESET_MIGRATION_KEY, '1');
    } catch {
      // Ignore storage availability errors in tests/SSR
    }
    return {
      ...DEFAULT_PROFILE,
      ultimoAcessoMs: Date.now(),
      quests: LIBRAS_QUESTS.map((q) => ({ ...q })),
      achievements: LIBRAS_ACHIEVEMENTS.map((a) => ({ ...a }))
    };
  }
};
