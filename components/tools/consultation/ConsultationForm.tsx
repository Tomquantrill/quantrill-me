'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  ConsultationFormData,
  PartAData,
  PartBData,
  BusinessType,
  SaveStatus,
} from '@/lib/types';
import styles from './ConsultationForm.module.css';

// ─── Defaults ───────────────────────────────────────────────────────────────

const defaultPartA: PartAData = {
  businessName: '', businessType: '', location: '', contactRole: '',
  operatingYears: '', staffCount: '', staffBreakdown: '', peakSeasons: '', peakSplit: '',
  bookingChannels: [], annualVolume: '', declinedVolume: false, operatingLanguages: '',
  whatPrompted: '', currentFrustrations: '', alreadyTried: '', goodOutcome: '', previousWork: '',
  websitePlatform: '', websiteHosting: '', websiteLastUpdated: '', websiteManager: '',
  emailTools: '', socialPlatforms: '', socialWhoRuns: '', socialActivity: '',
  reviewsSources: '', reviewsHandling: '', docStorage: '', staffAccounts: '', subscriptions: '',
  pms: '', channelManager: '', otas: '', directBookingEngine: '', roomTracking: '', cleaningSchedule: '', guestComms: '',
  rentalBookingSystem: '', stockManagement: '', rentalPayments: '', damageDeposits: '', seasonalChangeover: '',
  expBookingSystem: '', guideAllocation: '', capacityWaitlist: '', waiverHandling: '', expPayments: '',
  fbReservations: '', fbPOS: '', supplierOrdering: '', stockWastage: '', fbStaffScheduling: '',
  typicalDay: '', repetitiveTasks: '', multiSystemLogin: '', paperWhatsapp: '', regularBreaks: '', keyPersonAway: '',
  problemScope: '', budgetPosture: '', budgetFigure: '', decisionProcess: '', timeline: '', budgetVibe: '', budgetNotes: '',
};

const defaultPartB: PartBData = {
  servicesFit: [], recommendedTier: '', tierNotes: '',
  painPoint1: '', painPoint2: '', painPoint3: '',
  quickWins: '', complexityFlags: '',
  redFlags: [], redFlagNotes: '',
  effortEstimate: '', fitRating: 0, fitRatingReason: '',
  followUpActions: '',
};

const defaultData: ConsultationFormData = {
  contactName: '', partA: defaultPartA, partB: defaultPartB, notes: '',
};

// ─── Summary builder ─────────────────────────────────────────────────────────

function buildSummary(d: ConsultationFormData) {
  const { contactName, partA: a, partB: b, notes } = d;
  const inv: Record<string, unknown> = {
    website: { platform: a.websitePlatform, hosting: a.websiteHosting, lastUpdated: a.websiteLastUpdated, manager: a.websiteManager },
    email: a.emailTools,
    social: { platforms: a.socialPlatforms, whoRuns: a.socialWhoRuns, activity: a.socialActivity },
    reviews: { sources: a.reviewsSources, handling: a.reviewsHandling },
    docStorage: a.docStorage,
    staffAccounts: a.staffAccounts,
    subscriptions: a.subscriptions,
  };
  if (a.businessType === 'accommodation') {
    inv.accommodation = { pms: a.pms, channelManager: a.channelManager, otas: a.otas, directBookingEngine: a.directBookingEngine, roomTracking: a.roomTracking, cleaningSchedule: a.cleaningSchedule, guestComms: a.guestComms };
  } else if (a.businessType === 'rental') {
    inv.rental = { bookingSystem: a.rentalBookingSystem, stockManagement: a.stockManagement, payments: a.rentalPayments, damageDeposits: a.damageDeposits, seasonalChangeover: a.seasonalChangeover };
  } else if (a.businessType === 'experiences') {
    inv.experiences = { bookingSystem: a.expBookingSystem, guideAllocation: a.guideAllocation, capacityWaitlist: a.capacityWaitlist, waiverHandling: a.waiverHandling, payments: a.expPayments };
  } else if (a.businessType === 'food') {
    inv.foodBeverage = { reservations: a.fbReservations, pos: a.fbPOS, supplierOrdering: a.supplierOrdering, stockWastage: a.stockWastage, staffScheduling: a.fbStaffScheduling };
  }
  return {
    meta: { contact: contactName, businessName: a.businessName, businessType: a.businessType, location: a.location, generatedAt: new Date().toISOString() },
    businessBasics: { contactRole: a.contactRole, operatingYears: a.operatingYears, staff: a.staffCount, staffBreakdown: a.staffBreakdown, peakSeasons: a.peakSeasons, peakSplit: a.peakSplit, bookingChannels: a.bookingChannels, annualVolume: a.declinedVolume ? 'Declined to share' : a.annualVolume, operatingLanguages: a.operatingLanguages },
    theProblem: { whatPrompted: a.whatPrompted, currentFrustrations: a.currentFrustrations, alreadyTried: a.alreadyTried, goodOutcome: a.goodOutcome, previousWork: a.previousWork },
    digitalInventory: inv,
    workflow: { typicalDay: a.typicalDay, repetitiveTasks: a.repetitiveTasks, multiSystemLogin: a.multiSystemLogin, paperWhatsapp: a.paperWhatsapp, regularBreaks: a.regularBreaks, keyPersonAway: a.keyPersonAway },
    budgetAppetite: { scope: a.problemScope, budgetPosture: a.budgetPosture, budgetFigure: a.budgetFigure, decisionProcess: a.decisionProcess, timeline: a.timeline, vibe: a.budgetVibe, notes: a.budgetNotes },
    assessment: { servicesFit: b.servicesFit, recommendedTier: b.recommendedTier, tierNotes: b.tierNotes, painPoints: [b.painPoint1, b.painPoint2, b.painPoint3].filter(Boolean), quickWins: b.quickWins, complexityFlags: b.complexityFlags, redFlags: b.redFlags, redFlagNotes: b.redFlagNotes, effortEstimate: b.effortEstimate, fitRating: b.fitRating, fitRatingReason: b.fitRatingReason, followUpActions: b.followUpActions },
    privateNotes: notes,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AccordionSection({ id, title, open, onToggle, children }: {
  id: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={styles.accordion}>
      <button
        type="button"
        className={`${styles.accordionHeader} ${open ? styles.accordionOpen : ''}`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`section-${id}`}
      >
        <span className={styles.accordionTitle}>{title}</span>
        <span className={styles.accordionIcon} aria-hidden="true">+</span>
      </button>
      <div
        id={`section-${id}`}
        className={`${styles.accordionBody} ${open ? styles.accordionBodyOpen : ''}`}
      >
        <div className={styles.accordionBodyInner}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {hint && <span className={styles.fieldHint}>{hint}</span>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={styles.input}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      className={styles.textarea}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

function RadioGroup({ name, value, options, onChange }: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.radioGroup} role="radiogroup">
      {options.map(opt => (
        <label key={opt.value} className={styles.radioLabel}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className={styles.radioInput}
          />
          <span className={styles.radioText}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({ value, options, onChange }: {
  value: string[];
  options: { value: string; label: string }[];
  onChange: (v: string[]) => void;
}) {
  function toggle(item: string) {
    onChange(value.includes(item) ? value.filter(x => x !== item) : [...value, item]);
  }
  return (
    <div className={styles.checkboxGroup}>
      {options.map(opt => (
        <label key={opt.value} className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className={styles.checkboxInput}
          />
          <span className={styles.checkboxText}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function SaveIndicator({ status, lastSaved }: { status: SaveStatus; lastSaved: Date | null }) {
  const label = status === 'saved'
    ? lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved'
    : status === 'saving' ? 'Saving…'
    : 'Unsaved';

  return (
    <span className={`${styles.saveStatus} ${styles[`saveStatus_${status}`]}`}>
      <span className={styles.saveStatusDot} />
      {label}
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ConsultationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<ConsultationFormData>(defaultData);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNew, setIsNew] = useState(true);

  const formDataRef = useRef(formData);
  const consultationIdRef = useRef(consultationId);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { consultationIdRef.current = consultationId; }, [consultationId]);

  // Load existing consultation from URL param
  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;

    setIsLoading(true);
    setIsNew(false);
    fetch(`/api/consultation?id=${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        if (data.summary_json) setFormData(data.summary_json);
        setConsultationId(id);
        setLastSaved(new Date(data.created_at));
        setSaveStatus('saved');
      })
      .catch(() => setLoadError('Failed to load consultation. Check the URL and try again.'))
      .finally(() => setIsLoading(false));
  }, [searchParams]);

  // Auto-save
  const performSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const id = consultationIdRef.current;
      const body = formDataRef.current;
      const method = id ? 'PATCH' : 'POST';
      const url = id ? `/api/consultation?id=${id}` : '/api/consultation';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Save failed');

      const data = await res.json() as { id: string; created_at: string };

      if (!id && data.id) {
        setConsultationId(data.id);
        router.replace(`/tools/consultation?id=${data.id}`, { scroll: false });
      }

      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch {
      setSaveStatus('unsaved');
    }
  }, [router]);

  const triggerAutoSave = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(performSave, 2000);
  }, [performSave]);

  // Field updaters
  const setA = useCallback(<K extends keyof PartAData>(field: K, value: PartAData[K]) => {
    setFormData(prev => ({ ...prev, partA: { ...prev.partA, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const setB = useCallback(<K extends keyof PartBData>(field: K, value: PartBData[K]) => {
    setFormData(prev => ({ ...prev, partB: { ...prev.partB, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const setRoot = useCallback((field: 'contactName' | 'notes', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    const summary = buildSummary(formDataRef.current);
    await navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!consultationIdRef.current) {
      await performSave();
    }
    const id = consultationIdRef.current;
    if (!id) return;
    await fetch(`/api/consultation?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formDataRef.current, status: 'complete' }),
    });
    setSaveStatus('saved');
    setLastSaved(new Date());
    setShowSummary(true);
  }, [performSave]);

  const handleNewConsultation = useCallback(() => {
    router.push('/tools/consultation');
    setFormData(defaultData);
    setConsultationId(null);
    setOpenSections(new Set());
    setSaveStatus('saved');
    setLastSaved(null);
    setShowSummary(false);
    setIsNew(true);
  }, [router]);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <div className={styles.loading}>Loading consultation…</div>;
  }

  if (loadError) {
    return <div className={styles.errorPage}>{loadError}</div>;
  }

  const a = formData.partA;
  const b = formData.partB;
  const businessType = a.businessType as BusinessType;

  const bookingChannelOptions = [
    { value: 'direct', label: 'Direct' },
    { value: 'ota', label: 'OTA' },
    { value: 'phone', label: 'Phone' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'mix', label: 'Mix' },
  ];

  return (
    <div className={styles.wrapper}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            {a.businessName || 'New consultation'}
          </h1>
          {formData.contactName && (
            <p className={styles.pageSubtitle}>{formData.contactName}</p>
          )}
        </div>
        <div className={styles.pageHeaderRight}>
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
          <button type="button" className={styles.btnSecondary} onClick={handleNewConsultation}>
            + New
          </button>
          <button type="button" className={styles.btn} onClick={performSave}>
            Save
          </button>
        </div>
      </div>

      <form className={styles.form} onSubmit={e => e.preventDefault()}>

        {/* ── Contact name (outside accordion) ── */}
        <div className={styles.topFields}>
          <Field label="Client name">
            <TextInput
              value={formData.contactName}
              onChange={v => setRoot('contactName', v)}
              placeholder="Who you're meeting with"
            />
          </Field>
        </div>

        {/* ═══════════════════════════════════════════ PART A */}
        <div className={styles.partLabel}>
          <span className={styles.partLabelDot} />
          Part A — During the meeting
        </div>

        {/* ── Section 1: Business Basics ── */}
        <AccordionSection id="s1" title="1 — Business Basics" open={openSections.has('s1')} onToggle={() => toggleSection('s1')}>
          <div className={styles.fieldGrid}>
            <Field label="Business name">
              <TextInput value={a.businessName} onChange={v => setA('businessName', v)} placeholder="Trading name" />
            </Field>
            <Field label="Location">
              <TextInput value={a.location} onChange={v => setA('location', v)} placeholder="Town or region" />
            </Field>
          </div>

          <Field label="Business type">
            <RadioGroup
              name="businessType"
              value={a.businessType}
              onChange={v => setA('businessType', v as BusinessType)}
              options={[
                { value: 'accommodation', label: 'Accommodation' },
                { value: 'rental', label: 'Rental' },
                { value: 'experiences', label: 'Experiences & Activities' },
                { value: 'food', label: 'Food & Beverage' },
              ]}
            />
          </Field>

          <Field label="Who I'm speaking to">
            <RadioGroup
              name="contactRole"
              value={a.contactRole}
              onChange={v => setA('contactRole', v as PartAData['contactRole'])}
              options={[
                { value: 'owner', label: 'Owner' },
                { value: 'manager', label: 'Manager' },
                { value: 'both', label: 'Owner and manager' },
              ]}
            />
          </Field>

          <div className={styles.fieldGrid}>
            <Field label="Years operating">
              <TextInput value={a.operatingYears} onChange={v => setA('operatingYears', v)} placeholder="e.g. 6 years" />
            </Field>
            <Field label="Staff count">
              <TextInput value={a.staffCount} onChange={v => setA('staffCount', v)} placeholder="Total headcount" />
            </Field>
          </div>

          <Field label="Staff breakdown" hint="Seasonal vs permanent split">
            <TextInput value={a.staffBreakdown} onChange={v => setA('staffBreakdown', v)} placeholder="e.g. 4 permanent, 8 seasonal" />
          </Field>

          <Field label="Peak seasons" hint="When and how pronounced">
            <TextInput value={a.peakSeasons} onChange={v => setA('peakSeasons', v)} placeholder="e.g. Dec–Mar ski, July–Aug summer" />
          </Field>

          <Field label="Peak/off split">
            <TextInput value={a.peakSplit} onChange={v => setA('peakSplit', v)} placeholder="e.g. 80% revenue in 5 months" />
          </Field>

          <Field label="How they primarily take bookings">
            <CheckboxGroup
              value={a.bookingChannels}
              onChange={v => setA('bookingChannels', v)}
              options={bookingChannelOptions}
            />
          </Field>

          <Field label="Rough annual booking volume" hint="Optional — note if they decline">
            <div className={styles.inlineRow}>
              <TextInput
                value={a.annualVolume}
                onChange={v => setA('annualVolume', v)}
                placeholder="Bookings or revenue per year"
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={a.declinedVolume}
                  onChange={e => setA('declinedVolume', e.target.checked)}
                />
                <span className={styles.checkboxText}>Declined to share</span>
              </label>
            </div>
          </Field>

          <Field label="Languages the business operates in">
            <TextInput value={a.operatingLanguages} onChange={v => setA('operatingLanguages', v)} placeholder="e.g. German, English" />
          </Field>
        </AccordionSection>

        {/* ── Section 2: The Problem ── */}
        <AccordionSection id="s2" title="2 — The Problem They Came With" open={openSections.has('s2')} onToggle={() => toggleSection('s2')}>
          <Field label="What prompted this conversation">
            <TextArea value={a.whatPrompted} onChange={v => setA('whatPrompted', v)} placeholder="In their words — what made them reach out or agree to this call?" />
          </Field>
          <Field label="Current frustrations">
            <TextArea value={a.currentFrustrations} onChange={v => setA('currentFrustrations', v)} placeholder="What are they currently frustrated by?" />
          </Field>
          <Field label="What they've already tried">
            <TextArea value={a.alreadyTried} onChange={v => setA('alreadyTried', v)} placeholder="Any previous attempts to fix this?" rows={3} />
          </Field>
          <Field label="What a good outcome looks like to them">
            <TextArea value={a.goodOutcome} onChange={v => setA('goodOutcome', v)} placeholder="In their terms, not mine" rows={3} />
          </Field>
          <Field label="Previous work with consultants, agencies, or tech people">
            <TextArea value={a.previousWork} onChange={v => setA('previousWork', v)} placeholder="Any history? How did it go?" rows={3} />
          </Field>
        </AccordionSection>

        {/* ── Section 3: Digital Inventory ── */}
        <AccordionSection id="s3" title="3 — Digital Inventory" open={openSections.has('s3')} onToggle={() => toggleSection('s3')}>

          <div className={styles.subSectionLabel}>Website</div>
          <div className={styles.fieldGrid}>
            <Field label="Platform">
              <TextInput value={a.websitePlatform} onChange={v => setA('websitePlatform', v)} placeholder="e.g. WordPress, Wix" />
            </Field>
            <Field label="Hosting">
              <TextInput value={a.websiteHosting} onChange={v => setA('websiteHosting', v)} placeholder="e.g. Hostinger, unknown" />
            </Field>
          </div>
          <div className={styles.fieldGrid}>
            <Field label="Last updated">
              <TextInput value={a.websiteLastUpdated} onChange={v => setA('websiteLastUpdated', v)} placeholder="Approximate date or 'not sure'" />
            </Field>
            <Field label="Who manages it">
              <TextInput value={a.websiteManager} onChange={v => setA('websiteManager', v)} placeholder="Owner, agency, no one" />
            </Field>
          </div>

          <div className={styles.subSectionLabel}>Email & communication</div>
          <Field label="What they use, how the team communicates">
            <TextArea value={a.emailTools} onChange={v => setA('emailTools', v)} placeholder="e.g. Gmail, WhatsApp groups, nothing formal" rows={2} />
          </Field>

          <div className={styles.subSectionLabel}>Social media</div>
          <div className={styles.fieldGrid}>
            <Field label="Platforms">
              <TextInput value={a.socialPlatforms} onChange={v => setA('socialPlatforms', v)} placeholder="e.g. Instagram, Facebook" />
            </Field>
            <Field label="Who runs it">
              <TextInput value={a.socialWhoRuns} onChange={v => setA('socialWhoRuns', v)} placeholder="Owner, staff, agency" />
            </Field>
          </div>
          <Field label="How active">
            <TextInput value={a.socialActivity} onChange={v => setA('socialActivity', v)} placeholder="e.g. sporadic, 2x/week" />
          </Field>

          <div className={styles.subSectionLabel}>Review management</div>
          <div className={styles.fieldGrid}>
            <Field label="Where reviews come in">
              <TextInput value={a.reviewsSources} onChange={v => setA('reviewsSources', v)} placeholder="e.g. Google, Booking.com, TripAdvisor" />
            </Field>
            <Field label="How they handle them">
              <TextInput value={a.reviewsHandling} onChange={v => setA('reviewsHandling', v)} placeholder="Respond, ignore, delegate" />
            </Field>
          </div>

          <div className={styles.subSectionLabel}>Documents & storage</div>
          <Field label="Where files live, how they're shared">
            <TextArea value={a.docStorage} onChange={v => setA('docStorage', v)} placeholder="e.g. Google Drive, USB sticks, no system" rows={2} />
          </Field>

          <div className={styles.subSectionLabel}>Staff access & accounts</div>
          <Field label="Who has access to what, how passwords are managed">
            <TextArea value={a.staffAccounts} onChange={v => setA('staffAccounts', v)} placeholder="Shared logins, individual accounts, no system" rows={2} />
          </Field>

          <div className={styles.subSectionLabel}>Subscriptions</div>
          <Field label="What they pay for, whether they use it">
            <TextArea value={a.subscriptions} onChange={v => setA('subscriptions', v)} placeholder="List what you can capture — cost is useful if they know it" rows={2} />
          </Field>

          {/* Accommodation-specific */}
          {businessType === 'accommodation' && (
            <>
              <div className={styles.subSectionLabel}>Accommodation systems</div>
              <div className={styles.fieldGrid}>
                <Field label="Property management system">
                  <TextInput value={a.pms} onChange={v => setA('pms', v)} placeholder="e.g. Mews, Cloudbeds, none" />
                </Field>
                <Field label="Channel manager">
                  <TextInput value={a.channelManager} onChange={v => setA('channelManager', v)} placeholder="e.g. SiteMinder, none" />
                </Field>
              </div>
              <Field label="OTAs they list on">
                <TextInput value={a.otas} onChange={v => setA('otas', v)} placeholder="e.g. Booking.com, Airbnb, Expedia" />
              </Field>
              <Field label="Direct booking engine">
                <TextInput value={a.directBookingEngine} onChange={v => setA('directBookingEngine', v)} placeholder="Platform or none" />
              </Field>
              <Field label="Room allocation & occupancy tracking">
                <TextArea value={a.roomTracking} onChange={v => setA('roomTracking', v)} placeholder="How do they track availability?" rows={2} />
              </Field>
              <Field label="Cleaning & maintenance scheduling">
                <TextArea value={a.cleaningSchedule} onChange={v => setA('cleaningSchedule', v)} placeholder="WhatsApp, paper, software?" rows={2} />
              </Field>
              <Field label="Guest communication (pre, during, post stay)">
                <TextArea value={a.guestComms} onChange={v => setA('guestComms', v)} placeholder="Manual emails, automated, nothing?" rows={2} />
              </Field>
            </>
          )}

          {/* Rental-specific */}
          {businessType === 'rental' && (
            <>
              <div className={styles.subSectionLabel}>Rental systems</div>
              <Field label="Booking & reservation system">
                <TextInput value={a.rentalBookingSystem} onChange={v => setA('rentalBookingSystem', v)} placeholder="Software or manual" />
              </Field>
              <Field label="Stock & inventory management">
                <TextArea value={a.stockManagement} onChange={v => setA('stockManagement', v)} placeholder="Spreadsheet, software, memory?" rows={2} />
              </Field>
              <Field label="POS & payment processing">
                <TextInput value={a.rentalPayments} onChange={v => setA('rentalPayments', v)} placeholder="e.g. SumUp, cash" />
              </Field>
              <Field label="Damage tracking & deposits">
                <TextArea value={a.damageDeposits} onChange={v => setA('damageDeposits', v)} placeholder="Paper, software, no system?" rows={2} />
              </Field>
              <Field label="Seasonal stock changeover">
                <TextArea value={a.seasonalChangeover} onChange={v => setA('seasonalChangeover', v)} placeholder="How is this managed?" rows={2} />
              </Field>
            </>
          )}

          {/* Experiences-specific */}
          {businessType === 'experiences' && (
            <>
              <div className={styles.subSectionLabel}>Experience & activity systems</div>
              <Field label="Booking & scheduling system">
                <TextInput value={a.expBookingSystem} onChange={v => setA('expBookingSystem', v)} placeholder="e.g. FareHarbor, Bookeo, manual" />
              </Field>
              <Field label="Guide or resource allocation">
                <TextArea value={a.guideAllocation} onChange={v => setA('guideAllocation', v)} placeholder="How are guides/staff assigned to bookings?" rows={2} />
              </Field>
              <Field label="Capacity & waitlist management">
                <TextArea value={a.capacityWaitlist} onChange={v => setA('capacityWaitlist', v)} placeholder="How do they handle full sessions?" rows={2} />
              </Field>
              <Field label="Waiver & consent handling">
                <TextArea value={a.waiverHandling} onChange={v => setA('waiverHandling', v)} placeholder="Paper waivers, digital, nothing?" rows={2} />
              </Field>
              <Field label="Payment processing">
                <TextInput value={a.expPayments} onChange={v => setA('expPayments', v)} placeholder="How and when do they take payment?" />
              </Field>
            </>
          )}

          {/* Food & Beverage-specific */}
          {businessType === 'food' && (
            <>
              <div className={styles.subSectionLabel}>Food & beverage systems</div>
              <Field label="Reservation system">
                <TextInput value={a.fbReservations} onChange={v => setA('fbReservations', v)} placeholder="e.g. OpenTable, phone, nothing" />
              </Field>
              <Field label="POS & till">
                <TextInput value={a.fbPOS} onChange={v => setA('fbPOS', v)} placeholder="e.g. Lightspeed, old till" />
              </Field>
              <Field label="Supplier ordering process">
                <TextArea value={a.supplierOrdering} onChange={v => setA('supplierOrdering', v)} placeholder="Phone, email, portal?" rows={2} />
              </Field>
              <Field label="Stock & wastage tracking">
                <TextArea value={a.stockWastage} onChange={v => setA('stockWastage', v)} placeholder="Spreadsheet, software, none?" rows={2} />
              </Field>
              <Field label="Staff scheduling">
                <TextInput value={a.fbStaffScheduling} onChange={v => setA('fbStaffScheduling', v)} placeholder="App, WhatsApp, paper rota?" />
              </Field>
            </>
          )}
        </AccordionSection>

        {/* ── Section 4: Workflow ── */}
        <AccordionSection id="s4" title="4 — Workflow Mapping" open={openSections.has('s4')} onToggle={() => toggleSection('s4')}>
          <Field label="Walk me through a typical busy day">
            <TextArea value={a.typicalDay} onChange={v => setA('typicalDay', v)} placeholder="Open-ended — let them tell it in order. Don't guide." rows={5} />
          </Field>
          <Field label="Repetitive tasks that feel annoying">
            <TextArea value={a.repetitiveTasks} onChange={v => setA('repetitiveTasks', v)} placeholder="What happens every day that they'd love to stop doing?" rows={3} />
          </Field>
          <Field label="Tasks that require logging into multiple systems">
            <TextArea value={a.multiSystemLogin} onChange={v => setA('multiSystemLogin', v)} placeholder="Which and how many?" rows={3} />
          </Field>
          <Field label="What still happens on paper, WhatsApp, or in someone's head">
            <TextArea value={a.paperWhatsapp} onChange={v => setA('paperWhatsapp', v)} placeholder="Unofficial systems that run the business" rows={3} />
          </Field>
          <Field label="What breaks or goes wrong regularly">
            <TextArea value={a.regularBreaks} onChange={v => setA('regularBreaks', v)} placeholder="Recurring failures, mistakes, near-misses" rows={3} />
          </Field>
          <Field label="What happens when a key person is away">
            <TextArea value={a.keyPersonAway} onChange={v => setA('keyPersonAway', v)} placeholder="Does the system cope or does it fall apart?" rows={3} />
          </Field>
        </AccordionSection>

        {/* ── Section 5: Budget & Appetite ── */}
        <AccordionSection id="s5" title="5 — Budget & Appetite" open={openSections.has('s5')} onToggle={() => toggleSection('s5')}>
          <Field label="Are they coming in with a specific problem or open to a broader look?">
            <RadioGroup
              name="problemScope"
              value={a.problemScope}
              onChange={v => setA('problemScope', v as PartAData['problemScope'])}
              options={[
                { value: 'specific', label: 'Specific problem' },
                { value: 'full_audit', label: 'Open to a full audit' },
                { value: 'not_sure', label: 'Not sure yet' },
              ]}
            />
          </Field>

          <Field label="Budget posture">
            <RadioGroup
              name="budgetPosture"
              value={a.budgetPosture}
              onChange={v => setA('budgetPosture', v as PartAData['budgetPosture'])}
              options={[
                { value: 'none', label: 'No budget defined' },
                { value: 'rough', label: 'Rough number in mind' },
                { value: 'ready', label: 'Ready to commit' },
              ]}
            />
          </Field>

          {(a.budgetPosture === 'rough' || a.budgetPosture === 'ready') && (
            <Field label="Budget figure or range">
              <TextInput value={a.budgetFigure} onChange={v => setA('budgetFigure', v)} placeholder="What they said" />
            </Field>
          )}

          <Field label="Decision-making process">
            <RadioGroup
              name="decisionProcess"
              value={a.decisionProcess}
              onChange={v => setA('decisionProcess', v as PartAData['decisionProcess'])}
              options={[
                { value: 'spot', label: 'Can decide on the spot' },
                { value: 'discuss', label: 'Needs to discuss with someone' },
                { value: 'slow', label: 'Slow mover' },
              ]}
            />
          </Field>

          <Field label="Timeline expectations">
            <RadioGroup
              name="timeline"
              value={a.timeline}
              onChange={v => setA('timeline', v as PartAData['timeline'])}
              options={[
                { value: 'urgent', label: 'Urgent (within a month)' },
                { value: 'near_term', label: 'Near term (1–3 months)' },
                { value: 'no_urgency', label: 'No urgency' },
              ]}
            />
          </Field>

          <Field label="Budget & appetite vibe">
            <RadioGroup
              name="budgetVibe"
              value={a.budgetVibe}
              onChange={v => setA('budgetVibe', v as PartAData['budgetVibe'])}
              options={[
                { value: 'open', label: 'Open and engaged' },
                { value: 'cautious', label: 'Cautious but interested' },
                { value: 'hesitant', label: 'Hesitant' },
                { value: 'hard_to_read', label: 'Hard to read' },
              ]}
            />
          </Field>

          <Field label="Notes on budget & appetite">
            <TextArea value={a.budgetNotes} onChange={v => setA('budgetNotes', v)} placeholder="Any additional context" rows={3} />
          </Field>
        </AccordionSection>

        {/* ═══════════════════════════════════════════ PART B */}
        <div className={styles.partBSeparator}>
          <div className={styles.separatorLine} />
          <span className={styles.partBLabel}>Part B — Private assessment</span>
          <div className={styles.separatorLine} />
        </div>

        <div className={styles.partBNote}>
          Complete this after the meeting. Not visible to the client.
        </div>

        {/* Services fit */}
        <Field label="Which services fit">
          <CheckboxGroup
            value={b.servicesFit}
            onChange={v => setB('servicesFit', v)}
            options={[
              { value: 'digital_audit', label: 'Digital Foundations' },
              { value: 'website', label: 'Website' },
              { value: 'automated', label: 'Automated Systems' },
              { value: 'custom', label: 'Custom Build' },
            ]}
          />
        </Field>

        {/* Recommended tier */}
        <Field label="Recommended tier">
          <RadioGroup
            name="recommendedTier"
            value={b.recommendedTier}
            onChange={v => setB('recommendedTier', v as PartBData['recommendedTier'])}
            options={[
              { value: 'tier1', label: 'Tier 1 — Identify' },
              { value: 'tier2', label: 'Tier 2 — Implement' },
              { value: 'tier3', label: 'Tier 3 — Ongoing' },
            ]}
          />
        </Field>
        <Field label="Reasoning for tier">
          <TextArea value={b.tierNotes} onChange={v => setB('tierNotes', v)} placeholder="Why this tier?" rows={2} />
        </Field>

        {/* Pain points */}
        <div className={styles.fieldGroupLabel}>Top 3 pain points I identified (mine, not necessarily theirs)</div>
        <Field label="Pain point 1">
          <TextInput value={b.painPoint1} onChange={v => setB('painPoint1', v)} placeholder="What I saw as the real problem" />
        </Field>
        <Field label="Pain point 2">
          <TextInput value={b.painPoint2} onChange={v => setB('painPoint2', v)} placeholder="" />
        </Field>
        <Field label="Pain point 3">
          <TextInput value={b.painPoint3} onChange={v => setB('painPoint3', v)} placeholder="" />
        </Field>

        <Field label="Quick wins I spotted">
          <TextArea value={b.quickWins} onChange={v => setB('quickWins', v)} placeholder="Low-effort, fast-payoff fixes" rows={3} />
        </Field>

        <Field label="Complexity flags or complications">
          <TextArea value={b.complexityFlags} onChange={v => setB('complexityFlags', v)} placeholder="What makes this harder than it looks?" rows={3} />
        </Field>

        {/* Red flags */}
        <Field label="Red flags">
          <CheckboxGroup
            value={b.redFlags}
            onChange={v => setB('redFlags', v)}
            options={[
              { value: 'scope_creep', label: 'Scope creep risk' },
              { value: 'slow_decision', label: 'Slow decision maker' },
              { value: 'resistant', label: 'Resistant to change' },
              { value: 'unrealistic', label: 'Unrealistic expectations' },
              { value: 'none', label: 'None' },
            ]}
          />
        </Field>
        <Field label="Red flag notes">
          <TextArea value={b.redFlagNotes} onChange={v => setB('redFlagNotes', v)} placeholder="Context on any flags" rows={2} />
        </Field>

        {/* Effort estimate */}
        <Field label="Rough effort estimate">
          <RadioGroup
            name="effortEstimate"
            value={b.effortEstimate}
            onChange={v => setB('effortEstimate', v as PartBData['effortEstimate'])}
            options={[
              { value: 'less_day', label: 'Less than a day' },
              { value: 'one_two_days', label: '1–2 days' },
              { value: 'three_five_days', label: '3–5 days' },
              { value: 'one_two_weeks', label: '1–2 weeks' },
              { value: 'longer', label: 'Longer' },
            ]}
          />
        </Field>

        {/* Fit rating */}
        <Field label="Overall fit rating (1–5)">
          <div className={styles.ratingGroup}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                className={`${styles.ratingBtn} ${b.fitRating === n ? styles.ratingBtnActive : ''}`}
                onClick={() => setB('fitRating', n)}
                aria-label={`Rating ${n}`}
                aria-pressed={b.fitRating === n}
              >
                {n}
              </button>
            ))}
          </div>
        </Field>
        <Field label="One line of reasoning">
          <TextInput value={b.fitRatingReason} onChange={v => setB('fitRatingReason', v)} placeholder="Why this score?" />
        </Field>

        {/* Follow-up */}
        <Field label="Follow-up actions before writing the proposal">
          <TextArea value={b.followUpActions} onChange={v => setB('followUpActions', v)} placeholder="What needs to happen before I write anything?" rows={3} />
        </Field>

        {/* Private notes */}
        <div className={styles.partBSeparator} style={{ marginTop: '2rem' }}>
          <div className={styles.separatorLine} />
          <span className={styles.partBLabel}>Private notes</span>
          <div className={styles.separatorLine} />
        </div>
        <Field label="Tom's notes">
          <TextArea value={formData.notes} onChange={v => setRoot('notes', v)} placeholder="Anything else that doesn't fit above" rows={4} />
        </Field>

        {/* ── Complete & summary ── */}
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={handleComplete}>
            Mark complete & generate summary
          </button>
        </div>

      </form>

      {/* ── Summary output ── */}
      {showSummary && (
        <div className={styles.summarySection}>
          <div className={styles.summaryHeader}>
            <span className={styles.summaryTitle}>Summary JSON</span>
            <button type="button" className={styles.btnSecondary} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
          <pre className={styles.summaryPre}>
            {JSON.stringify(buildSummary(formData), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
