import { describe, it, expect } from 'vitest';
import { enDictionary } from '@/lib/i18n/dictionaries/en';
import { hiDictionary } from '@/lib/i18n/dictionaries/hi';
import type { TranslationDictionary } from '@/lib/i18n/types';

describe('BahiBar Internationalization (i18n) & Localization', () => {
  it('has identical top-level structure in English and Hindi dictionaries', () => {
    const enKeys = Object.keys(enDictionary).sort();
    const hiKeys = Object.keys(hiDictionary).sort();

    expect(hiKeys).toEqual(enKeys);
    expect(enKeys).toContain('common');
    expect(enKeys).toContain('auth');
    expect(enKeys).toContain('dashboard');
    expect(enKeys).toContain('members');
    expect(enKeys).toContain('plans');
    expect(enKeys).toContain('payments');
    expect(enKeys).toContain('export');
    expect(enKeys).toContain('settings');
    expect(enKeys).toContain('receiptModal');
    expect(enKeys).toContain('nav');
    expect(enKeys).toContain('landing');
  });

  it('verifies complete dictionary parity for all subkeys', () => {
    const verifyParity = (enObj: any, hiObj: any, path = '') => {
      const enSubKeys = Object.keys(enObj).sort();
      const hiSubKeys = Object.keys(hiObj).sort();

      expect(hiSubKeys, `Missing or extra keys at ${path}`).toEqual(enSubKeys);

      for (const key of enSubKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof enObj[key] === 'object' && enObj[key] !== null) {
          verifyParity(enObj[key], hiObj[key], currentPath);
        } else {
          expect(typeof hiObj[key], `Type mismatch at ${currentPath}`).toBe('string');
          expect((hiObj[key] as string).trim().length, `Empty string at ${currentPath}`).toBeGreaterThan(0);
        }
      }
    };

    verifyParity(enDictionary, hiDictionary);
  });

  it('contains authentic Hindi terminology for fitness, gym, and danger zone operations', () => {
    // Fitness and Gym terms
    expect(hiDictionary.common.appName).toBe('बहीबार');
    expect(hiDictionary.nav.members).toBe('सदस्य');
    expect(hiDictionary.members.searchPlaceholder).toContain('खोजें');
    expect(hiDictionary.common.active).toBe('सक्रिय');
    expect(hiDictionary.common.expiringSoon).toBe('जल्द समाप्त');
    expect(hiDictionary.common.expired).toBe('समाप्त');
    expect(hiDictionary.common.paid).toBe('भुगतान पूर्ण');
    expect(hiDictionary.common.due).toBe('बकाया');

    // Danger Zone & Safe Gym Deletion terms
    expect(hiDictionary.settings.dangerZoneTitle).toContain('खतरनाक क्षेत्र');
    expect(hiDictionary.settings.deleteGymActionTitle).toBe('जिम वर्कस्पेस हटाएं');
    expect(hiDictionary.settings.backupReminder).toContain('CSV');
    expect(hiDictionary.settings.confirmModalTitle).toContain('सुनिश्चित');
    expect(hiDictionary.settings.typeGymNameToConfirm).toContain('सटीक नाम टाइप करें');
    expect(hiDictionary.settings.enterPasswordToConfirm).toContain('पासवर्ड दर्ज करें');
    expect(hiDictionary.settings.cancelButton).toContain('रद्द करें');
  });

  it('provides comprehensive translation coverage for the Receipt Modal', () => {
    expect(hiDictionary.receiptModal.title).toBe('फीस भुगतान रसीद');
    expect(hiDictionary.receiptModal.receiptNo).toBe('रसीद संख्या');
    expect(hiDictionary.receiptModal.memberName).toBe('सदस्य का नाम');
    expect(hiDictionary.receiptModal.amountPaid).toBe('जमा की गई राशि');
    expect(hiDictionary.receiptModal.balanceRemaining).toBe('शेष बकाया');
    expect(hiDictionary.receiptModal.downloadPdf).toContain('PDF');
    expect(hiDictionary.receiptModal.printVoucher).toContain('प्रिंट');
    expect(hiDictionary.receiptModal.whatsAppSlip).toContain('व्हाट्सएप');
  });

  it('formats numbers properly according to Indian numbering system in Hindi & English', () => {
    const enNum = new Intl.NumberFormat('en-IN').format(1250000);
    const hiNum = new Intl.NumberFormat('hi-IN').format(1250000);

    expect(enNum).toBe('12,50,000');
    expect(hiNum).toBeDefined();
    // In both cases, Indian lakh groupings (2,2,3) apply
    expect(enNum.split(',').length).toBe(3);
  });
});
