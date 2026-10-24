import React, { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProductStorySection } from '@/components/landing/ProductStorySection';
import { InteractivePreview } from '@/components/landing/InteractivePreview';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { PaperProblemSection } from '@/components/landing/PaperProblemSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { EarlyAccessSection } from '@/components/landing/EarlyAccessSection';
import { SavingsEstimator } from '@/components/landing/SavingsEstimator';
import { ReceiptModal, type ReceiptData } from '@/components/payments/ReceiptModal';

// Mock Next.js Link for SSR/Server rendering
vi.mock('next/link', () => ({
  default: ({ href, children, onClick, className, ...props }: any) => (
    <a href={href} onClick={onClick} className={className} {...props}>
      {children}
    </a>
  ),
}));

function renderToDOM(element: React.ReactElement): Document {
  const html = renderToString(element);
  return new DOMParser().parseFromString(html, 'text/html');
}

async function mountComponent(element: React.ReactElement): Promise<{ container: HTMLDivElement; cleanup: () => void }> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(element);
  });
  return {
    container,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      document.body.removeChild(container);
    },
  };
}

describe('Mobile Landing Header & Navigation', () => {
  it('renders direct Sign In button on mobile when not logged in', () => {
    const doc = renderToDOM(<LandingHeader userLoggedIn={false} />);
    const links = Array.from(doc.querySelectorAll('a'));
    
    // Check mobile-visible Sign In link (inside flex sm:hidden)
    const mobileSignIn = links.find(
      (a) => a.textContent?.trim() === 'Sign In' && a.className.includes('border-slate-200')
    );
    expect(mobileSignIn).toBeDefined();
    expect(mobileSignIn?.getAttribute('href')).toBe('/login');
  });

  it('renders direct Dashboard button on mobile when logged in', () => {
    const doc = renderToDOM(<LandingHeader userLoggedIn={true} />);
    const links = Array.from(doc.querySelectorAll('a'));
    
    const dashboardLink = links.find((a) => a.textContent?.includes('Dashboard'));
    expect(dashboardLink).toBeDefined();
    expect(dashboardLink?.getAttribute('href')).toBe('/dashboard');
  });

  it('contains mobile menu toggle button with accessibility labels', () => {
    const doc = renderToDOM(<LandingHeader userLoggedIn={false} />);
    const toggleButton = doc.querySelector('button[aria-label="Open menu"]');
    expect(toggleButton).not.toBeNull();
    expect(toggleButton?.className).toContain('min-h-[44px]');
  });
});

describe('HeroSection Mobile Touch & Actions', () => {
  it('renders primary CTAs, Sign In link, and ensures decorative glow does not intercept taps', () => {
    const doc = renderToDOM(<HeroSection />);

    const links = Array.from(doc.querySelectorAll('a'));

    // Primary CTA: Start Free Pilot -> /register
    const trialCta = links.find(
      (a) =>
        a.getAttribute('href') === '/register' &&
        (a.textContent?.includes('Start Free Pilot') || a.textContent?.includes('Start Your Free Trial'))
    );
    expect(trialCta).toBeDefined();
    expect(trialCta?.getAttribute('href')).toBe('/register');
    expect(trialCta?.className).toContain('min-h-[48px]');

    // Secondary CTA: See How It Works -> #story
    const storyCta = links.find((a) => a.textContent?.includes('See How It Works'));
    expect(storyCta).toBeDefined();
    expect(storyCta?.getAttribute('href')).toBe('#story');
    expect(storyCta?.className).toContain('min-h-[48px]');

    // Existing gym owner sign in prompt
    const signInPrompt = links.find((a) => a.textContent?.includes('Sign in to your gym'));
    expect(signInPrompt).toBeDefined();
    expect(signInPrompt?.getAttribute('href')).toBe('/login');

    // Ensure decorative blur element has pointer-events-none so it doesn't block touches
    const blurGlow = doc.querySelector('.blur-xl');
    expect(blurGlow).not.toBeNull();
    expect(blurGlow?.className).toContain('pointer-events-none');
  });
});

describe('ProductStorySection Interactive Demonstration (Rehearsal.dev Inspired)', () => {
  it('renders all 4 product story steps with accessible touch targets', () => {
    const doc = renderToDOM(<ProductStorySection />);

    const section = doc.querySelector('#story');
    expect(section).not.toBeNull();
    expect(section?.className).toContain('scroll-mt-16');

    // Check step buttons (Register, Payment, Ledger, Receipt)
    const stepButtons = Array.from(doc.querySelectorAll('button')).filter((b) => {
      const text = b.textContent?.toLowerCase() || '';
      return (
        text.includes('register') ||
        text.includes('payment') ||
        text.includes('ledger') ||
        text.includes('receipt')
      );
    });
    expect(stepButtons.length).toBeGreaterThanOrEqual(4);
    stepButtons.forEach((btn) => {
      expect(btn.className).toContain('min-h-[44px]');
    });
  });

  it('cycles through all 4 story steps dynamically', async () => {
    const { container, cleanup } = await mountComponent(<ProductStorySection />);

    // Step 1 initial state: Register Vikram Rathore
    expect(container.textContent).toContain('Step 1 of 4');
    expect(container.textContent).toContain('Enroll a member with automatic expiry dates');
    expect(container.textContent).toContain('New Member Enrollment');

    // Click "Step 2: Payment" button
    const paymentStepBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Payment') && b.textContent?.includes('Record Fees')
    );
    expect(paymentStepBtn).toBeDefined();

    await act(async () => {
      paymentStepBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Step 2 is now active
    expect(container.textContent).toContain('Step 2 of 4');
    expect(container.textContent).toContain('Record full or partial payments');
    expect(container.textContent).toContain('Partial Installment');

    // Click "Step 3: Ledger" button
    const duesStepBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Ledger') && b.textContent?.includes('Track Dues')
    );
    expect(duesStepBtn).toBeDefined();

    await act(async () => {
      duesStepBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Step 3 is now active
    expect(container.textContent).toContain('Step 3 of 4');
    expect(container.textContent).toContain('Spot upcoming renewals');
    expect(container.textContent).toContain('Gym Member Dues & Renewals');

    // Click "Step 4: Receipt" button
    const receiptStepBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Receipt') && b.textContent?.includes('Instant Voucher')
    );
    expect(receiptStepBtn).toBeDefined();

    await act(async () => {
      receiptStepBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Step 4 is now active: Shows Receipt Voucher and download/print buttons
    expect(container.textContent).toContain('Step 4 of 4');
    expect(container.textContent).toContain('Produce a professional receipt in 1 tap');
    expect(container.textContent).toContain('Download PDF');
    expect(container.textContent).toContain('Print Voucher');
    expect(container.textContent).toContain('WhatsApp Slip');

    cleanup();
  });
});

describe('Interactive Preview Sandbox Section', () => {
  it('has scroll-mt-16 for header clearance and responsive touch buttons', () => {
    const doc = renderToDOM(<InteractivePreview />);

    const section = doc.querySelector('#demo');
    expect(section).not.toBeNull();
    expect(section?.className).toContain('scroll-mt-16');

    // Payment collection simulation buttons stack properly on mobile
    const paymentButtons = Array.from(doc.querySelectorAll('button')).filter((b) => {
      const text = b.textContent?.toLowerCase() || '';
      return text.includes('paid') || text.includes('installment');
    });
    expect(paymentButtons.length).toBe(3);
    paymentButtons.forEach((btn) => {
      expect(btn.className).toContain('min-h-[44px]');
    });

    // Date input has touch-friendly height
    const dateInput = doc.querySelector('#previewStartDateInput') || doc.querySelector('#startDateInput');
    expect(dateInput).not.toBeNull();
    expect(dateInput?.className).toContain('min-h-[44px]');
  });
});

describe('Homepage Anchor Sections Scroll Clearance', () => {
  it('verifies all homepage sections have scroll-mt-16 for sticky header clearance', () => {
    const compDoc = renderToDOM(<ComparisonSection />);
    expect(compDoc.querySelector('#comparison')?.className).toContain('scroll-mt-16');

    const problemDoc = renderToDOM(<PaperProblemSection />);
    expect(problemDoc.querySelector('#problem')?.className).toContain('scroll-mt-16');

    const estimatorDoc = renderToDOM(<SavingsEstimator />);
    expect(estimatorDoc.querySelector('#estimator')?.className).toContain('scroll-mt-16');

    const workflowDoc = renderToDOM(<WorkflowSection />);
    expect(workflowDoc.querySelector('#workflow')?.className).toContain('scroll-mt-16');

    const earlyAccessDoc = renderToDOM(<EarlyAccessSection />);
    expect(earlyAccessDoc.querySelector('#early-access')?.className).toContain('scroll-mt-16');

    const faqDoc = renderToDOM(<FaqSection />);
    expect(faqDoc.querySelector('#faq')?.className).toContain('scroll-mt-16');
  });
});

describe('SavingsEstimator Mobile Usability & Presets', () => {
  it('renders size presets and stepper buttons with touch friendly heights', () => {
    const doc = renderToDOM(<SavingsEstimator />);

    // Presets exist
    const buttons = Array.from(doc.querySelectorAll('button'));
    const studioPreset = buttons.find((b) => b.textContent?.includes('Studio'));
    const standardPreset = buttons.find((b) => b.textContent?.includes('Standard'));
    const largePreset = buttons.find((b) => b.textContent?.includes('Large Gym'));

    expect(studioPreset).toBeDefined();
    expect(standardPreset).toBeDefined();
    expect(largePreset).toBeDefined();
    expect(studioPreset?.className).toContain('min-h-[44px]');

    // Steppers exist
    const minusBtn = doc.querySelector('button[aria-label="Decrease lookups"]');
    const plusBtn = doc.querySelector('button[aria-label="Increase lookups"]');
    expect(minusBtn).not.toBeNull();
    expect(plusBtn).not.toBeNull();
  });
});

describe('Receipt Modal Actions & Printing', () => {
  const sampleReceipt: ReceiptData = {
    id: 'pay-sample-12345678',
    amount: 1500,
    payment_date: '2026-10-18',
    payment_method: 'upi',
    transaction_reference: 'UPI-987654321',
    memberName: 'Pooja Sharma',
    memberMobile: '9811123456',
    memberEmail: 'pooja@example.com',
    planName: '1 Month Standard',
    gymName: 'Powerhouse Gym',
    gymPhone: '9876543210',
    gymAddress: '123 Main Road, Pune',
    agreedPrice: 1500,
    outstandingBalance: 0,
  };

  it('renders Download PDF as primary, Print Voucher in toolbar, and WhatsApp slip', () => {
    const doc = renderToDOM(
      <ReceiptModal receipt={sampleReceipt} isOpen={true} onClose={() => {}} />
    );

    // Download PDF button
    const buttons = Array.from(doc.querySelectorAll('button'));
    const downloadPdfBtn = buttons.find((b) => b.textContent?.includes('Download PDF'));
    expect(downloadPdfBtn).toBeDefined();
    expect(downloadPdfBtn?.className).toContain('bg-sky-600');

    // Print Voucher button
    const printVoucherBtn = buttons.find((b) => b.textContent?.includes('Print Voucher'));
    expect(printVoucherBtn).toBeDefined();

    // Close button
    const closeBtn = buttons.find((b) => b.textContent?.trim() === 'Close');
    expect(closeBtn).toBeDefined();

    // WhatsApp Slip link with phone
    const links = Array.from(doc.querySelectorAll('a'));
    const whatsAppSlip = links.find((a) => a.textContent?.includes('WhatsApp Slip'));
    expect(whatsAppSlip).toBeDefined();
    expect(whatsAppSlip?.getAttribute('href')).toContain('https://wa.me/919811123456');

    // Printable receipt wrapper exists with print styling ID
    const printableArea = doc.querySelector('#printable-receipt');
    expect(printableArea).not.toBeNull();
    expect(printableArea?.textContent).toContain('Powerhouse Gym');
    expect(printableArea?.textContent).toContain('Pooja Sharma');
  });
});

describe('Live Client-Side Interactions & State Updates', () => {
  it('updates SavingsEstimator calculations when tapping size presets or stepper buttons', async () => {
    const { container, cleanup } = await mountComponent(<SavingsEstimator />);

    // Initially: 120 members, 15 lookups, 26 days, 3 mins -> (15 * 3 * 26) / 60 = 19.5 hours
    expect(container.textContent).toContain('120 members');
    expect(container.textContent).toContain('19.5');

    // Click "Studio" preset (~45 members)
    const studioBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Studio')
    );
    expect(studioBtn).toBeDefined();

    await act(async () => {
      studioBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // 45 members -> suggested 5 lookups -> (5 * 3 * 26) / 60 = 6.5 hours
    expect(container.textContent).toContain('45 members');
    expect(container.textContent).toContain('6.5');

    // Click "+" stepper to increase lookups to 6
    const plusBtn = container.querySelector('button[aria-label="Increase lookups"]');
    expect(plusBtn).not.toBeNull();

    await act(async () => {
      plusBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // 6 lookups -> (6 * 3 * 26) / 60 = 7.8 hours
    expect(container.textContent).toContain('7.8');

    cleanup();
  });

  it('updates InteractivePreview plan, dues, and date calculations when interacting', async () => {
    const { container, cleanup } = await mountComponent(<InteractivePreview />);

    // Initial state: Sunil Verma (3 Months Exclusive, ₹4,500)
    expect(container.textContent).toContain('Enrollment for Sunil Verma');
    expect(container.textContent).toContain('₹4,500.00');

    // Click on Pooja Sharma (1 Month Standard, ₹1,500)
    const poojaBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Pooja Sharma')
    );
    expect(poojaBtn).toBeDefined();

    await act(async () => {
      poojaBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Plan and fee should now update to Pooja Sharma's plan (1 Month Standard, ₹1,500)
    expect(container.textContent).toContain('Enrollment for Pooja Sharma');
    expect(container.textContent).toContain('1 Month Standard');
    expect(container.textContent).toContain('₹1,500.00');

    // Click "Partial Installment"
    const partialBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Partial Installment')
    );
    expect(partialBtn).toBeDefined();

    await act(async () => {
      partialBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // For ₹1500 plan, partial defaults to ~50% (₹750), so pending due must be > 0 (₹750)
    expect(container.textContent).toContain('Pending Due');
    expect(container.textContent).toContain('₹750.00');

    cleanup();
  });

  it('switches tabs in ComparisonSection and WorkflowSection', async () => {
    const { container: compContainer, cleanup: compCleanup } = await mountComponent(<ComparisonSection />);
    const paymentTab = Array.from(compContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Check Payment Status')
    );
    await act(async () => {
      paymentTab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(compContainer.textContent).toContain('Scenario: Member states they already paid via UPI');
    compCleanup();

    const { container: flowContainer, cleanup: flowCleanup } = await mountComponent(<WorkflowSection />);
    const stage3Btn = Array.from(flowContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('See calculated expiry')
    );
    await act(async () => {
      stage3Btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(flowContainer.textContent).toContain('Expiry Date & Payment Voucher');
    flowCleanup();
  });

  it('triggers Download PDF and Print Voucher without crashing', async () => {
    const sampleReceipt: ReceiptData = {
      id: 'pay-test-999',
      amount: 2000,
      payment_date: '2026-10-18',
      payment_method: 'upi',
      memberName: 'Test Member',
      planName: '1 Month Standard',
      agreedPrice: 2000,
      outstandingBalance: 0,
    };

    // Spy on window.print
    const printSpy = vi.fn();
    window.print = printSpy;

    const { container, cleanup } = await mountComponent(
      <ReceiptModal receipt={sampleReceipt} isOpen={true} onClose={() => {}} />
    );

    // Click Print Voucher
    const printBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Print Voucher')
    );
    await act(async () => {
      printBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(printSpy).toHaveBeenCalled();

    // Click Download PDF: should execute without throwing Buffer is not defined
    const downloadBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Download PDF')
    );
    expect(() => {
      act(() => {
        downloadBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    }).not.toThrow();

    cleanup();
  });
});



