'use client';

import { useState, FormEvent } from 'react';
import type { LiteFormData, BusinessType } from '@/lib/types';
import styles from './lite.module.css';

// ─── Translations ─────────────────────────────────────────────────────────────

const t = {
  en: {
    heading: 'Tell us about your business',
    intro: 'This short form helps Tom understand your situation before your consultation. It takes around 10 minutes to complete.',
    section1: 'Your business',
    section2: 'The situation',
    section3: 'Digital tools',
    submit: 'Submit',
    submitting: 'Submitting…',
    fieldBusinessName: 'Business name',
    fieldBusinessType: 'Type of business',
    fieldLocation: 'Location',
    fieldContactName: 'Your name',
    fieldContactRole: 'Your role',
    fieldYears: 'Years operating',
    fieldStaff: 'Number of staff',
    fieldPeakSeasons: 'Peak seasons',
    fieldBookingChannels: 'How you take bookings',
    fieldLanguages: 'Languages the business operates in',
    fieldPrompted: 'What prompted you to get in touch?',
    fieldFrustrations: 'What are you currently frustrated by?',
    fieldTried: 'What have you already tried?',
    fieldOutcome: 'What would a good outcome look like for you?',
    fieldPreviousWork: 'Any previous work with consultants or tech people?',
    fieldWebsite: 'Website platform',
    fieldEmail: 'Email & communication tools',
    fieldSocial: 'Social media platforms',
    fieldReviews: 'Where reviews come in',
    fieldSubscriptions: 'Software subscriptions you pay for',
    typeAccommodation: 'Accommodation',
    typeRental: 'Rental',
    typeExperiences: 'Experiences & Activities',
    typeFood: 'Food & Beverage',
    roleOwner: 'Owner',
    roleManager: 'Manager',
    roleBoth: 'Owner & manager',
    bookDirect: 'Direct',
    bookOTA: 'OTA',
    bookPhone: 'Phone',
    bookWalkIn: 'Walk-in',
    bookMix: 'Mix',
    thankYouHeading: 'Thank you',
    thankYouBody: 'Your responses have been submitted. Tom will be in touch shortly.',
    errorMsg: 'Something went wrong. Please try again.',
    required: 'required',
  },
  de: {
    heading: 'Erzählen Sie uns von Ihrem Unternehmen',
    intro: 'Dieses kurze Formular hilft Tom, Ihre Situation vor der Beratung zu verstehen. Es dauert etwa 10 Minuten.',
    section1: 'Ihr Unternehmen',
    section2: 'Die Situation',
    section3: 'Digitale Tools',
    submit: 'Absenden',
    submitting: 'Wird gesendet…',
    fieldBusinessName: 'Unternehmensname',
    fieldBusinessType: 'Art des Unternehmens',
    fieldLocation: 'Standort',
    fieldContactName: 'Ihr Name',
    fieldContactRole: 'Ihre Rolle',
    fieldYears: 'Jahre in Betrieb',
    fieldStaff: 'Anzahl der Mitarbeiter',
    fieldPeakSeasons: 'Hauptsaison(en)',
    fieldBookingChannels: 'Wie nehmen Sie Buchungen an?',
    fieldLanguages: 'Sprachen, in denen das Unternehmen tätig ist',
    fieldPrompted: 'Was hat Sie dazu bewogen, Kontakt aufzunehmen?',
    fieldFrustrations: 'Was frustriert Sie derzeit?',
    fieldTried: 'Was haben Sie bereits versucht?',
    fieldOutcome: 'Was wäre für Sie ein gutes Ergebnis?',
    fieldPreviousWork: 'Haben Sie schon früher mit Beratern oder IT-Experten zusammengearbeitet?',
    fieldWebsite: 'Website-Plattform',
    fieldEmail: 'E-Mail & Kommunikations-Tools',
    fieldSocial: 'Social-Media-Plattformen',
    fieldReviews: 'Wo kommen Bewertungen herein?',
    fieldSubscriptions: 'Software-Abonnements, die Sie bezahlen',
    typeAccommodation: 'Unterkunft',
    typeRental: 'Verleih',
    typeExperiences: 'Erlebnisse & Aktivitäten',
    typeFood: 'Gastronomie',
    roleOwner: 'Inhaber/in',
    roleManager: 'Geschäftsführer/in',
    roleBoth: 'Inhaber/in & Geschäftsführer/in',
    bookDirect: 'Direkt',
    bookOTA: 'OTA',
    bookPhone: 'Telefon',
    bookWalkIn: 'Walk-in',
    bookMix: 'Mix',
    thankYouHeading: 'Vielen Dank',
    thankYouBody: 'Ihre Antworten wurden übermittelt. Tom wird sich in Kürze bei Ihnen melden.',
    errorMsg: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    required: 'erforderlich',
  },
} as const;

type Lang = 'en' | 'de';

// ─── Default form data ────────────────────────────────────────────────────────

const defaultData: LiteFormData = {
  businessName: '', businessType: '', location: '',
  contactName: '', contactRole: '',
  operatingYears: '', staffCount: '', peakSeasons: '',
  bookingChannels: [], operatingLanguages: '',
  whatPrompted: '', currentFrustrations: '', alreadyTried: '', goodOutcome: '', previousWork: '',
  websitePlatform: '', websiteHosting: '', websiteManager: '',
  emailTools: '', socialPlatforms: '', reviewsSources: '', subscriptions: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface LiteFormProps {
  token: string;
  clientName?: string;
}

export default function LiteForm({ token, clientName }: LiteFormProps) {
  const [lang, setLang] = useState<Lang>('en');
  const [formData, setFormData] = useState<LiteFormData>({
    ...defaultData,
    contactName: clientName ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const tr = t[lang];

  function set<K extends keyof LiteFormData>(field: K, value: LiteFormData[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function toggleChannel(ch: string) {
    set('bookingChannels', formData.bookingChannels.includes(ch)
      ? formData.bookingChannels.filter(x => x !== ch)
      : [...formData.bookingChannels, ch]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/consultation/lite?token=${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submit failed');
      setSubmitted(true);
    } catch {
      setError(tr.errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.thankYou}>
          <h1 className={styles.thankYouHeading}>{tr.thankYouHeading}</h1>
          <p className={styles.thankYouBody}>{tr.thankYouBody}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.langToggle}>
          <button
            type="button"
            className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
            onClick={() => setLang('en')}
          >EN</button>
          <span className={styles.langSep}>/</span>
          <button
            type="button"
            className={`${styles.langBtn} ${lang === 'de' ? styles.langBtnActive : ''}`}
            onClick={() => setLang('de')}
          >DE</button>
        </div>
        <h1 className={styles.heading}>{tr.heading}</h1>
        <p className={styles.intro}>{tr.intro}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Section 1: Business Basics */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>{tr.section1}</h2>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldBusinessName}</label>
            <input type="text" className={styles.input} value={formData.businessName} onChange={e => set('businessName', e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldBusinessType}</label>
            <div className={styles.radioGroup}>
              {(['accommodation', 'rental', 'experiences', 'food'] as BusinessType[]).map(type => (
                <label key={type} className={styles.radioLabel}>
                  <input type="radio" name="businessType" value={type} checked={formData.businessType === type} onChange={() => set('businessType', type)} className={styles.radioInput} />
                  <span className={styles.radioText}>
                    {type === 'accommodation' ? tr.typeAccommodation : type === 'rental' ? tr.typeRental : type === 'experiences' ? tr.typeExperiences : tr.typeFood}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>{tr.fieldLocation}</label>
              <input type="text" className={styles.input} value={formData.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>{tr.fieldYears}</label>
              <input type="text" className={styles.input} value={formData.operatingYears} onChange={e => set('operatingYears', e.target.value)} />
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>{tr.fieldContactName}</label>
              <input type="text" className={styles.input} value={formData.contactName} onChange={e => set('contactName', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>{tr.fieldContactRole}</label>
              <div className={styles.radioGroup}>
                {(['owner', 'manager', 'both'] as const).map(role => (
                  <label key={role} className={styles.radioLabel}>
                    <input type="radio" name="contactRole" value={role} checked={formData.contactRole === role} onChange={() => set('contactRole', role)} className={styles.radioInput} />
                    <span className={styles.radioText}>
                      {role === 'owner' ? tr.roleOwner : role === 'manager' ? tr.roleManager : tr.roleBoth}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldStaff}</label>
            <input type="text" className={styles.input} value={formData.staffCount} onChange={e => set('staffCount', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldPeakSeasons}</label>
            <input type="text" className={styles.input} value={formData.peakSeasons} onChange={e => set('peakSeasons', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldBookingChannels}</label>
            <div className={styles.checkboxGroup}>
              {[
                { value: 'direct', label: tr.bookDirect },
                { value: 'ota', label: tr.bookOTA },
                { value: 'phone', label: tr.bookPhone },
                { value: 'walk_in', label: tr.bookWalkIn },
                { value: 'mix', label: tr.bookMix },
              ].map(opt => (
                <label key={opt.value} className={styles.checkboxLabel}>
                  <input type="checkbox" checked={formData.bookingChannels.includes(opt.value)} onChange={() => toggleChannel(opt.value)} className={styles.checkboxInput} />
                  <span className={styles.checkboxText}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldLanguages}</label>
            <input type="text" className={styles.input} value={formData.operatingLanguages} onChange={e => set('operatingLanguages', e.target.value)} />
          </div>
        </div>

        {/* Section 2: The Problem */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>{tr.section2}</h2>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldPrompted} <span className={styles.req}>*</span></label>
            <textarea className={styles.textarea} rows={4} value={formData.whatPrompted} onChange={e => set('whatPrompted', e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldFrustrations}</label>
            <textarea className={styles.textarea} rows={4} value={formData.currentFrustrations} onChange={e => set('currentFrustrations', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldTried}</label>
            <textarea className={styles.textarea} rows={3} value={formData.alreadyTried} onChange={e => set('alreadyTried', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldOutcome}</label>
            <textarea className={styles.textarea} rows={3} value={formData.goodOutcome} onChange={e => set('goodOutcome', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldPreviousWork}</label>
            <textarea className={styles.textarea} rows={3} value={formData.previousWork} onChange={e => set('previousWork', e.target.value)} />
          </div>
        </div>

        {/* Section 3: Digital Inventory (condensed, universal only) */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>{tr.section3}</h2>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldWebsite}</label>
            <input type="text" className={styles.input} value={formData.websitePlatform} onChange={e => set('websitePlatform', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldEmail}</label>
            <textarea className={styles.textarea} rows={2} value={formData.emailTools} onChange={e => set('emailTools', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldSocial}</label>
            <input type="text" className={styles.input} value={formData.socialPlatforms} onChange={e => set('socialPlatforms', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldReviews}</label>
            <input type="text" className={styles.input} value={formData.reviewsSources} onChange={e => set('reviewsSources', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{tr.fieldSubscriptions}</label>
            <textarea className={styles.textarea} rows={3} value={formData.subscriptions} onChange={e => set('subscriptions', e.target.value)} />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? tr.submitting : tr.submit}
        </button>
      </form>
    </div>
  );
}
