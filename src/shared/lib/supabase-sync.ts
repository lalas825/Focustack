import { toast } from "sonner";
import { tSync } from "@/shared/lib/i18n";
import type { TranslationKey } from "@/shared/lib/i18n";

interface SyncOptions<TState> {
  /** The Supabase operation to execute */
  op: () => PromiseLike<{ error: unknown | null }>;
  /** Snapshot of state BEFORE the optimistic mutation */
  rollbackState: TState;
  /** Zustand set function to restore state on failure */
  restore: (state: TState) => void;
  /** i18n key for the error toast message */
  errorKey: TranslationKey;
}

/**
 * Fires a Supabase operation in the background.
 * On error: restores the pre-mutation state and shows an error toast.
 */
export async function syncToSupabase<TState>(opts: SyncOptions<TState>) {
  const { error } = await opts.op();
  if (error) {
    opts.restore(opts.rollbackState);
    toast.error(tSync(opts.errorKey), { duration: 4000 });
  }
}

interface NotifyOnlyOptions {
  op: () => PromiseLike<{ error: unknown | null }>;
  errorKey: TranslationKey;
}

/**
 * Fires a Supabase operation — notify-only on error (no rollback).
 * Used for accumulative operations where rollback is not meaningful.
 */
export async function syncToSupabaseNotifyOnly(opts: NotifyOnlyOptions) {
  const { error } = await opts.op();
  if (error) {
    toast.warning(tSync(opts.errorKey), { duration: 4000 });
  }
}
