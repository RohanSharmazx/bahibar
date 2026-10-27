export interface BackupPreviewData {
  appName: string;
  version: string;
  exportedAt: string;
  gymName: string;
  plansCount: number;
  membersCount: number;
  membershipsCount: number;
  paymentsCount: number;
  totalAmountCollected: number;
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  preview?: BackupPreviewData;
  parsedData?: any;
}

/**
 * Validates a BahiBar or legacy GymManager JSON backup string and extracts preview summary.
 * Returns structured validation result and preview statistics.
 */
export function validateBackupJson(backupJsonString: string): BackupValidationResult {
  if (!backupJsonString || typeof backupJsonString !== 'string') {
    return { valid: false, error: 'Backup content is empty or invalid.' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(backupJsonString);
  } catch {
    return { valid: false, error: 'File is not a valid JSON document.' };
  }

  if (parsed.app !== 'BahiBar' && parsed.app !== 'GymManager') {
    return {
      valid: false,
      error: `Incompatible backup source (${parsed.app || 'unknown'}). Only backups created by BahiBar or GymManager can be restored.`,
    };
  }

  if (!parsed.version || !parsed.version.startsWith('1.')) {
    return {
      valid: false,
      error: `Incompatible backup version (${parsed.version || 'unknown'}). Expected v1.x.`,
    };
  }

  if (
    !Array.isArray(parsed.plans) ||
    !Array.isArray(parsed.members) ||
    !Array.isArray(parsed.memberships) ||
    !Array.isArray(parsed.payments)
  ) {
    return {
      valid: false,
      error: 'Backup structure is corrupt: missing one or more required collections (plans, members, memberships, payments).',
    };
  }

  const totalCollected = parsed.payments.reduce(
    (acc: number, p: any) => acc + (Number(p.amount) || 0),
    0
  );

  return {
    valid: true,
    preview: {
      appName: parsed.app,
      version: parsed.version,
      exportedAt: parsed.exported_at || 'Unknown',
      gymName: parsed.gym?.name || 'Gym Backup',
      plansCount: parsed.plans.length,
      membersCount: parsed.members.length,
      membershipsCount: parsed.memberships.length,
      paymentsCount: parsed.payments.length,
      totalAmountCollected: totalCollected,
    },
    parsedData: parsed,
  };
}
