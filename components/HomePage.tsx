'use client'

import { useEffect } from 'react'
import { i18n } from '@/lib/i18n'

export default function HomePage() {
  useEffect(() => {
    const nav      = document.getElementById('main-nav') as HTMLElement
    const wrapper  = document.querySelector('.hero-scroll-wrapper') as HTMLElement
    const sticky   = document.querySelector('.hero-sticky') as HTMLElement
    const bg       = document.querySelector('.hero-bg') as HTMLImageElement
    const eyebrow  = document.getElementById('hero-eyebrow') as HTMLElement
    const headline = document.getElementById('hero-headline') as HTMLElement
    const hint     = document.getElementById('scroll-hint') as HTMLElement

    function clamp(v: number, lo: number, hi: number) { return v < lo ? lo : v > hi ? hi : v }
    function norm(v: number, a: number, b: number)    { return clamp((v - a) / (b - a), 0, 1) }
    function easeOut(t: number)                        { return 1 - Math.pow(1 - t, 3) }

    let ticking       = false
    let cancelled     = false
    const loadStart   = performance.now()
    const LOAD_DUR    = 2400 /* ms for the opening cinematic reveal */
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function tick() {
      if (cancelled) return

      /* Scroll progress */
      const rect        = wrapper.getBoundingClientRect()
      const totalScroll = wrapper.offsetHeight - window.innerHeight
      const scrolled    = clamp(-rect.top, 0, totalScroll)
      const p           = totalScroll > 0 ? scrolled / totalScroll : 0

      /* Nav lives inside .hero-sticky (position:absolute; bottom:2rem) so it rides
         the sticky container with zero JS. We only toggle past-hero when the nav
         has physically risen to the viewport top, switching it to position:fixed. */
      const stickyB  = sticky.getBoundingClientRect().bottom
      const navH     = nav.offsetHeight
      const pastHero = stickyB <= navH + 32
      nav.classList.toggle('past-hero', pastHero)

      if (reducedMotion) {
        nav.classList.add('past-hero')
        nav.style.opacity = '1'
        bg.style.opacity = '1'; bg.style.transform = 'none'; bg.style.filter = 'none'
        eyebrow.style.opacity = '1'; eyebrow.style.transform = 'none'; eyebrow.style.filter = 'none'
        headline.style.opacity = '1'; headline.style.transform = 'none'; headline.style.filter = 'none'
        hint.style.opacity = '0'
        ticking = false
        return
      }

      const now = performance.now()
      /* Load progress: 0 → 1 over LOAD_DUR ms, eased */
      const lp = Math.min((now - loadStart) / LOAD_DUR, 1)
      const lv = easeOut(lp)

      /* Nav opacity: hidden during load+text reveal, fades in, stays visible while riding */
      nav.style.opacity = String(lp < 1 ? 0 : !pastHero ? easeOut(norm(p, 0.55, 0.68)) : 1)

      /* Opening reveal: zoom 1.12 → 1.06, fade in, desaturate → full colour */
      const scale = 1.12 - 0.06 * lv
      const drift = -p * 2.5
      bg.style.opacity   = String(lv)
      bg.style.transform = `scale(${scale}) translateY(${drift}%)`
      bg.style.filter    = `brightness(${1.3 - 0.3 * lv}) saturate(${0.6 + 0.4 * lv})`

      /* Scroll hint fades with both load and scroll progress */
      hint.style.opacity = String(lv * (1 - norm(p, 0, 0.08)))

      const ep = easeOut(norm(p, 0.10, 0.28))
      eyebrow.style.opacity   = String(ep)
      eyebrow.style.transform = `translateY(${(1 - ep) * 30}px)`
      eyebrow.style.filter    = `blur(${(1 - ep) * 6}px)`

      const hp = easeOut(norm(p, 0.33, 0.53))
      headline.style.opacity   = String(hp)
      headline.style.transform = `translateY(${(1 - hp) * 46}px) scale(${0.97 + hp * 0.03})`
      headline.style.filter    = `blur(${(1 - hp) * 11}px) brightness(${1 + (1 - hp) * 0.28})`

      ticking = false
      /* Keep looping until load animation finishes */
      if (lp < 1) { ticking = true; requestAnimationFrame(tick) }
    }

    function onScroll() {
      if (!ticking) { requestAnimationFrame(tick); ticking = true }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    tick() /* kick off immediately; starts the load animation */

    /* Service cards: click and keyboard */
    document.querySelectorAll<HTMLElement>('.service-card:not(.service-card--cta)').forEach(card => {
      function toggle() {
        const open = card.classList.toggle('open')
        card.setAttribute('aria-expanded', String(open))
      }
      card.addEventListener('click', toggle)
      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
      })
    })

    /* Scroll reveal: one-time IntersectionObserver, respects reducedMotion */
    if (!reducedMotion) {
      const revealTargets = document.querySelectorAll<HTMLElement>(
        '.section-label, .philosophy-section p, .services-intro, .service-card, .about-grid, .contact-left, .form-card'
      )
      revealTargets.forEach(el => el.classList.add('reveal'))

      /* Stagger service cards by index */
      document.querySelectorAll<HTMLElement>('.service-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 60}ms`
      })

      const revealObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            revealObs.unobserve(entry.target)
          }
        })
      }, { threshold: 0.12 })

      revealTargets.forEach(el => revealObs.observe(el))
    }

    /* Active nav link highlight on scroll */
    ;(function () {
      const sections = ['philosophy', 'services', 'about', 'contact']
      const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-links a')
      const visible  = new Set<string>()

      const navObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        })
        const active = sections.find(id => visible.has(id))
        navLinks.forEach(link => {
          link.classList.toggle('nav-active', link.getAttribute('href') === '#' + active)
        })
      }, { threshold: 0.3 })

      sections.forEach(id => {
        const el = document.getElementById(id)
        if (el) navObs.observe(el)
      })
    }())

    /* i18n */
    function applyLang(lang: string) {
      const validLang: 'en' | 'de' = lang === 'de' ? 'de' : 'en'
      const dict = i18n[validLang]
      document.documentElement.lang = validLang
      if (dict['meta.title']) document.title = dict['meta.title']
      if (dict['meta.description']) {
        const metaDesc = document.querySelector('meta[name="description"]')
        const ogDesc   = document.querySelector('meta[property="og:description"]')
        const twDesc   = document.querySelector('meta[name="twitter:description"]')
        if (metaDesc) metaDesc.setAttribute('content', dict['meta.description'])
        if (ogDesc)   ogDesc.setAttribute('content', dict['meta.description'])
        if (twDesc)   twDesc.setAttribute('content', dict['meta.description'])
      }

      document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
        const key   = el.getAttribute('data-i18n')!
        const value = dict[key]
        if (value === undefined) return
        if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = value
        } else {
          el.textContent = value
        }
      })

      document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach(el => {
        const key   = el.getAttribute('data-i18n-placeholder')!
        const value = dict[key]
        if (value !== undefined) (el as HTMLInputElement).setAttribute('placeholder', value)
      })

      document.querySelectorAll<HTMLElement>('.lang-opt').forEach(opt => {
        opt.classList.toggle('lang-opt--active', opt.getAttribute('data-lang') === validLang)
      })

      try { localStorage.setItem('quantrill-lang', validLang) } catch (_) {}
    }

    let storedLang: string | null = null
    try { storedLang = localStorage.getItem('quantrill-lang') } catch (_) {}
    applyLang(storedLang === 'de' ? 'de' : 'en')

    const langToggle = document.getElementById('lang-toggle')
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        applyLang(document.documentElement.lang === 'de' ? 'en' : 'de')
      })
    }

    /* Contact form — Formspree integration unchanged */
    const form = document.getElementById('contact-form') as HTMLFormElement | null
    if (form) {
      form.addEventListener('submit', (e: Event) => {
        e.preventDefault()
        const btn  = document.getElementById('form-submit-btn') as HTMLButtonElement
        const lang: 'en' | 'de' = document.documentElement.lang === 'de' ? 'de' : 'en'
        btn.textContent = i18n[lang]['form.sending'] || i18n.en['form.sending']
        btn.disabled = true
        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        }).then(res => {
          if (res.ok) {
            form.style.display = 'none'
            const success = document.getElementById('form-success')
            if (success) success.style.display = 'block'
          } else {
            btn.textContent = i18n[lang]['form.submit'] || i18n.en['form.submit']
            btn.disabled = false
            const error = document.getElementById('form-error')
            if (error) error.style.display = 'block'
          }
        }).catch(() => {
          btn.textContent = i18n[lang]['form.submit'] || i18n.en['form.submit']
          btn.disabled = false
          const error = document.getElementById('form-error')
          if (error) error.style.display = 'block'
        })
      })
    }

    return () => {
      cancelled = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <main>
        {/* ─── HERO ──────────────────────────────────────── */}
        <div className="hero-scroll-wrapper">
          <div className="hero-sticky">
            <nav id="main-nav" aria-label="Main navigation">
              <div className="nav-logo">
                <div className="logo-mark">
                  <img src="/logo.png" alt="TQ" width={32} height={32} style={{ display: 'block', borderRadius: '5px' }} />
                </div>
                <span className="nav-name">quantrill.me</span>
              </div>
              <ul className="nav-links">
                <li><a href="#philosophy" data-i18n="nav.about">About</a></li>
                <li><a href="#services" data-i18n="nav.services">Services</a></li>
                <li><a href="#contact" data-i18n="nav.contact">Contact</a></li>
              </ul>
              <div className="nav-lang">
                <button className="lang-toggle" id="lang-toggle" type="button" aria-label="Switch language">
                  <span className="lang-opt lang-opt--active" data-lang="en">EN</span>
                  <span className="lang-sep">/</span>
                  <span className="lang-opt" data-lang="de">DE</span>
                </button>
              </div>
            </nav>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-bg"
              src="/cover.jpg"
              alt="A hiker standing on an Alpine mountain ridge above the clouds"
              fetchPriority="high"
            />
            <div className="hero-overlay"></div>

            <div className="hero-content">
              <div className="hero-headline-group">
                <p className="hero-eyebrow" id="hero-eyebrow" data-i18n="hero.eyebrow" data-i18n-html="">
                  Digital Consultancy<br />Based in the Alps
                </p>
                <div id="hero-headline">
                  <h1 className="hero-h1" data-i18n="hero.headline" data-i18n-html="">
                    Simple solutions <br />for digital direction.
                  </h1>
                </div>
              </div>
            </div>

            <div className="scroll-hint" id="scroll-hint">
              <div className="scroll-hint-line"></div>
              <span>Scroll</span>
            </div>
          </div>
        </div>

        {/* ─── PHILOSOPHY ────────────────────────────────── */}
        <section className="philosophy-section" id="philosophy">
          <div className="section-inner">
            <h2 className="section-label" data-i18n="philosophy.label">Philosophy</h2>
            <div className="philosophy-grid">
              <p className="philosophy-lead" data-i18n="philosophy.p1">Good technology should serve the work, not generate more of it. The right system runs in the background, takes the admin off your desk, and stays out of the way while you do the actual job.</p>
              <div className="philosophy-body">
                <p data-i18n="philosophy.p2">Most of the tools small operators pay for aren&apos;t broken. They&apos;re underused. Software bought without a plan to implement it becomes another subscription line on the credit card statement. I look at what you already have before suggesting anything new.</p>
                <p data-i18n="philosophy.p3">I&apos;m based in Zell am See and I work with businesses across the valley. The mountain doesn&apos;t care about your booking system, but the guests it brings you do. The job, as I see it, is putting the right tool in the right place, configuring it properly, and then getting out of the way.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SERVICES ──────────────────────────────────── */}
        <section id="services">
          <div className="section-inner">
            <h2 className="section-label" data-i18n="services.label">What I do</h2>
            <p className="services-intro" data-i18n="services.intro">Four services, arranged as a ladder. Most operators come in at the second rung; some only need the first conversation. Everything I build is meant to run on its own after handover: clear documentation, no lock-in, no monthly retainer keeping the lights on.</p>

            <div className="process-strip process-strip--2col">
              <div className="process-step">
                <div className="process-num" data-i18n="services.step1_num">STEP 01</div>
                <div className="process-title" data-i18n="services.step1_title">Free consultation</div>
                <div className="process-desc" data-i18n="services.step1_desc">30 minutes by video call or in person in Zell am See. No pitch, no invoice.</div>
              </div>
              <div className="process-step">
                <div className="process-num" data-i18n="services.step2_num">STEP 02</div>
                <div className="process-title" data-i18n="services.step2_title">Matched service</div>
                <div className="process-desc" data-i18n="services.step2_desc">I tell you which service fits. If it&apos;s more than one, I&apos;ll say so. Either way, you get a clear proposal.</div>
              </div>
            </div>

            <div className="services-grid services-grid--cards">
              <div className="service-card" tabIndex={0} role="button" aria-expanded="false" aria-controls="service-expand-1">
                <div className="service-card-header">
                  <div className="service-title" data-i18n="service1.title">Digital Foundations</div>
                  <span className="service-expand-icon" aria-hidden="true">+</span>
                </div>
                <div className="service-desc" data-i18n="service1.desc">An audit and implementation sprint for businesses that know they&apos;re behind on the digital side and want it fixed properly. The usual entry point.</div>
                <div className="service-expand" id="service-expand-1">
                  <div className="service-expand-inner">
                    <p data-i18n="service1.expand">We go through what&apos;s actually in use: accounts, devices, files, email, and the workarounds your team has built up over time. I write up what&apos;s there, fix what&apos;s worth fixing, and hand back something you can run yourself.</p>
                  </div>
                </div>
              </div>

              <div className="service-card" tabIndex={0} role="button" aria-expanded="false" aria-controls="service-expand-2">
                <div className="service-card-header">
                  <div className="service-title" data-i18n="service2.title">Website</div>
                  <span className="service-expand-icon" aria-hidden="true">+</span>
                </div>
                <div className="service-desc" data-i18n="service2.desc">A website you actually own. Clean, fast, no monthly bloat.</div>
                <div className="service-expand" id="service-expand-2">
                  <div className="service-expand-inner">
                    <p data-i18n="service2.expand">A lot of small tourism businesses are stuck in expensive agency retainers or template platforms they can&apos;t manage themselves. This is the honest alternative. I design, build, and hand over the keys. When you want to change a phone number, you don&apos;t have to call anyone.</p>
                  </div>
                </div>
              </div>

              <div className="service-card" tabIndex={0} role="button" aria-expanded="false" aria-controls="service-expand-3">
                <div className="service-card-header">
                  <div className="service-title" data-i18n="service3.title">Automated Systems</div>
                  <span className="service-expand-icon" aria-hidden="true">+</span>
                </div>
                <div className="service-desc" data-i18n="service3.desc">Less manual work, without changing how your business runs.</div>
                <div className="service-expand" id="service-expand-3">
                  <div className="service-expand-inner">
                    <p data-i18n="service3.expand">If your day runs on shared spreadsheets, group chats and processes only held in someone&apos;s head, there&apos;s usually an automation that pays for itself inside a fortnight. I map how you actually work, find the slow seams, and put something quiet in place to handle them, using tools your team already knows.</p>
                  </div>
                </div>
              </div>

              <div className="service-card" tabIndex={0} role="button" aria-expanded="false" aria-controls="service-expand-4">
                <div className="service-card-header">
                  <div className="service-title" data-i18n="service4.title">Custom Build</div>
                  <span className="service-expand-icon" aria-hidden="true">+</span>
                </div>
                <div className="service-desc" data-i18n="service4.desc">Bespoke software, scoped per project. The top of the ladder.</div>
                <div className="service-expand" id="service-expand-4">
                  <div className="service-expand-inner">
                    <p data-i18n="service4.expand">Sometimes the right tool doesn&apos;t exist yet, or the one that does is the wrong shape. We scope it together, I build it, and it ships with documentation complete enough that anyone could pick it up.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="process-strip process-strip--1col">
              <div className="process-step">
                <div className="process-num" data-i18n="services.step3_num">STEP 03</div>
                <div className="process-title" data-i18n="services.step3_title">Scope, timeline and cost</div>
                <div className="process-desc" data-i18n="services.step3_desc">A written proposal with everything agreed upfront. No vague estimates, no surprises.</div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider"></div>

        {/* ─── TESTIMONIALS ─────────────────────────────────
            Hidden until real testimonials from Zell am See clients
            are added. To enable: remove style={{display:'none'}} below
            and replace the three placeholder cards with real content. */}
        <section className="testimonials-section" id="testimonials" style={{ display: 'none' }}>
          <div className="section-inner">
            <h2 className="section-label" data-i18n="testimonials.label">From the people I work with</h2>
            <div className="testimonials-grid">
              <article className="testimonial-card">
                <p className="testimonial-quote">&ldquo;[Testimonial quote, to be added]&rdquo;</p>
                <div className="testimonial-attribution">
                  <span className="testimonial-name">Name</span>
                  <span className="testimonial-business">Business, Zell am See</span>
                </div>
              </article>
              <article className="testimonial-card">
                <p className="testimonial-quote">&ldquo;[Testimonial quote, to be added]&rdquo;</p>
                <div className="testimonial-attribution">
                  <span className="testimonial-name">Name</span>
                  <span className="testimonial-business">Business, Zell am See</span>
                </div>
              </article>
              <article className="testimonial-card">
                <p className="testimonial-quote">&ldquo;[Testimonial quote, to be added]&rdquo;</p>
                <div className="testimonial-attribution">
                  <span className="testimonial-name">Name</span>
                  <span className="testimonial-business">Business, Zell am See</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ─── ABOUT ─────────────────────────────────────── */}
        <section id="about" className="about-section">
          <div className="section-inner">
            <h2 className="section-label" data-i18n="about.label">About</h2>
            <p className="about-intro" data-i18n="about.intro">I&apos;m Tom Quantrill, originally from Newcastle, now based in Zell am See.</p>
            <div className="about-grid">
              <div className="about-left">
                <div className="photo-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/profile.jpg" alt="Tom Quantrill" loading="lazy" width={1366} height={2048} />
                </div>
              </div>
              <div className="about-right">
                <p data-i18n="about.p1">Fifteen years across tourism, hospitality and operations in resorts and businesses around Europe. Managed teams, built processes from scratch, and spent a lot of time working out why things weren&apos;t running the way they should.</p>
                <p data-i18n="about.p2">I work alone. The person you speak to is the person who does the work. No subcontractors, no agency layer, no hand-off to a junior.</p>
                <p data-i18n="about.p3">Most of the work is remote. If you&apos;re in Zell am See, we can meet over a coffee.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="divider"></div>

        {/* ─── CONTACT ───────────────────────────────────── */}
        <section id="contact" className="contact-section">
          <div className="section-inner">
            <h2 className="section-label" data-i18n="contact.label">Contact</h2>
            <div className="contact-grid">
              <div className="contact-left">
                <h3 data-i18n="contact.heading">Let&apos;s have a conversation.</h3>
                <p data-i18n="contact.intro">The first consultation is free. Tell me what you&apos;re dealing with and I&apos;ll be honest about whether I can help.</p>
                <div className="contact-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--slate)' }}>
                    <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,6 12,13 22,6" />
                  </svg>
                  <a href="mailto:tom@quantrill.me"><strong>tom@quantrill.me</strong></a>
                </div>
                <div className="contact-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--slate)' }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.35 12 19.79 19.79 0 0 1 1.28 3.4 2 2 0 0 1 3.26 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.32-1.32a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a href="tel:+436608375882"><strong>+43 660 837 5882</strong></a>
                </div>
                <div className="contact-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--slate)' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span data-i18n="contact.location">Zell am See, Salzburg</span>
                </div>
              </div>

              <form className="form-card" action="https://formspree.io/f/xbdewavv" method="POST" id="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name" data-i18n="form.first_name">First name</label>
                    <input type="text" id="first_name" name="first_name" placeholder="Thomas" autoComplete="given-name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name" data-i18n="form.last_name">Last name</label>
                    <input type="text" id="last_name" name="last_name" placeholder="Muller" autoComplete="family-name" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="business_name" data-i18n="form.business_name" data-i18n-html="">
                    Business name <span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input type="text" id="business_name" name="business_name" placeholder="Bayern" />
                </div>
                <div className="form-group">
                  <label htmlFor="business_type" data-i18n="form.business_type">Type of enquiry</label>
                  <select id="business_type" name="business_type">
                    <option value="" data-i18n="form.option_select">Select one...</option>
                    <option data-i18n="form.option_freelancer">Freelancer / Sole trader</option>
                    <option data-i18n="form.option_small">Small business</option>
                    <option data-i18n="form.option_established">Established business</option>
                    <option data-i18n="form.option_family">Family / Personal</option>
                    <option data-i18n="form.option_org">Organisation / Charity</option>
                    <option data-i18n="form.option_other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="email" data-i18n="form.email">Email address</label>
                  <input type="email" id="email" name="email" placeholder="tom@example.com" autoComplete="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message" data-i18n="form.message">What are you dealing with?</label>
                  <textarea id="message" name="message" placeholder="Tell me what's going on..." data-i18n-placeholder="form.message_placeholder" required></textarea>
                </div>
                <button type="submit" className="form-submit" id="form-submit-btn" data-i18n="form.submit">Request free consultation</button>
                <p className="form-note" data-i18n="form.note">No commitment, happy to chat.</p>
              </form>

              <div
                id="form-success"
                aria-live="polite"
                style={{ display: 'none', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}
              >
                <p style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.75rem' }} data-i18n="form.success_title">
                  Thanks &mdash; I&apos;ll be in touch.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 300 }} data-i18n="form.success_desc">
                  I&apos;ll get back to you within one business day.
                </p>
              </div>
              <div
                id="form-error"
                aria-live="assertive"
                data-i18n="form.error"
                data-i18n-html=""
                style={{ display: 'none', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem 1.5rem', marginTop: '1rem', fontSize: '13px', color: 'var(--slate)' }}
              >
                Something went wrong. Please email <a href="mailto:tom@quantrill.me">tom@quantrill.me</a> directly.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ────────────────────────────────────── */}
      <footer>
        <div className="footer-logo">
          <div className="footer-logo-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="TQ" width={32} height={32} style={{ display: 'block', borderRadius: '4px' }} />
          </div>
          quantrill.me
        </div>
        <span data-i18n="footer.tagline">Tom Quantrill - Digital Consultancy - Zell am See</span>
      </footer>
    </>
  )
}
