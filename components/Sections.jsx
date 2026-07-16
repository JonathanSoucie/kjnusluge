"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { site } from "@/site.config";

const RobotScene = dynamic(() => import("./RobotScene"), { ssr: false });

export function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Navbar() {
  const { t, lang, choose } = useLang();
  const [open, setOpen] = useState(false);
  const links = [
    ["#process", t.nav.process],
    ["#funding", t.nav.funding],
    ["#team", t.nav.team],
    ["#faq", t.nav.faq],
    ["#contact", t.nav.contact],
  ];
  return (
    <nav>
      <div className="wrap nav-inner">
        <a className="brand" href="#top"><img className="brand-logo" src="/praxes-logo-dark.png" alt={site.name} /></a>
        <div className="nav-links">
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </div>
        <div className="lang-toggle" role="group" aria-label="Language">
          {["hr", "en", "it"].map((l) => (
            <button key={l} className={lang === l ? "on" : ""} onClick={() => choose(l)} aria-pressed={lang === l}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <a className="nav-cta" href="#contact">{t.nav.cta}</a>
        <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M4.5 4.5l11 11M15.5 4.5l-11 11" /> : <path d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="nav-menu">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a className="menu-cta" href="#contact" onClick={() => setOpen(false)}>{t.nav.cta}</a>
        </div>
      )}
    </nav>
  );
}

const check = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8.5l3.5 3.5 7.5-8" /></svg>
);

export function Hero() {
  const { t } = useLang();
  return (
    <header className="hero" id="top">
      <div className="hero-canvas"><RobotScene /></div>
      <div className="hero-fade" />
      <div className="wrap" style={{ width: "100%" }}>
        <motion.div className="hero-content"
          initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className="eyebrow">{t.hero.eyebrow}</div>
          <h1>{t.hero.title_a}<br /><span className="accent">{t.hero.title_b}</span></h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-ctas">
            <a className="btn-primary" href="#contact">{t.hero.cta1}</a>
            <a className="btn-ghost" href="#process">{t.hero.cta2}</a>
          </div>
          <div className="trust-strip">
            {t.hero.trust.map((x, i) => (
              <span className="trust-item" key={i}>{check}{x}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </header>
  );
}

export function Pillars() {
  const { t } = useLang();
  return (
    <section className="block">
      <div className="wrap">
        <Reveal>
          <div className="sec-code">{t.pillars.code}</div>
          <h2>{t.pillars.title}</h2>
        </Reveal>
        <div className="pillars">
          {t.pillars.items.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="pillar">
                <span className="p-num">{p.n}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const { t } = useLang();
  return (
    <section className="block grid-bg" id="process" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "#fbfcfd" }}>
      <div className="wrap">
        <Reveal>
          <div className="sec-code">{t.process.code}</div>
          <h2>{t.process.title}</h2>
          <p className="sec-sub">{t.process.sub}</p>
        </Reveal>
        <div className="steps">
          {t.process.steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="step">
                <div className="s-num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{s.t}{s.tag && <span className="tag-free">{s.tag}</span>}</h3>
                  <p>{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Funding() {
  const { t } = useLang();
  return (
    <section className="block fund-band" id="funding">
      <div className="wrap">
        <Reveal>
          <div className="sec-code">{t.funding.code}</div>
          <h2>{t.funding.title}</h2>
          <p className="sec-sub">{t.funding.sub}</p>
        </Reveal>
        <div className="fund-stats">
          {t.funding.stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="fund-stat">
                <div className="v">{s.v}<small>{s.u}</small></div>
                <div className="k">{s.k}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}><p className="fund-note">{t.funding.note}</p></Reveal>
      </div>
    </section>
  );
}

export function Team() {
  const { t } = useLang();
  return (
    <section className="block" id="team">
      <div className="wrap">
        <Reveal>
          <div className="sec-code">{t.team.code}</div>
          <h2>{t.team.title}</h2>
        </Reveal>
        <div className="team-grid">
          {t.team.members.map((m, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="member">
                <div className="avatar">
                  {m.img ? <img src={m.img} alt={m.name} /> : m.init}
                </div>
                <h3>{m.name}</h3>
                <div className="role">{m.role}</div>
                <p>{m.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useLang();
  const [open, setOpen] = useState(0);
  return (
    <section className="block grid-bg" id="faq" style={{ borderTop: "1px solid var(--line)", background: "#fbfcfd" }}>
      <div className="wrap">
        <Reveal>
          <div className="sec-code">{t.faq.code}</div>
          <h2>{t.faq.title}</h2>
        </Reveal>
        <div className="faq-list">
          {t.faq.items.map((f, i) => (
            <Reveal key={i} delay={Math.min(i * 0.04, 0.2)}>
              <div className={`faq-item${open === i ? " open" : ""}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                  {f.q}<span className="chev">+</span>
                </button>
                {open === i && <div className="faq-a">{f.a}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", msg: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Upit — ${form.company || form.name}`);
    const body = encodeURIComponent(
      `Ime: ${form.name}\nTvrtka: ${form.company}\nE-mail: ${form.email}\nTelefon: ${form.phone}\n\n${form.msg}`
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  };
  return (
    <section className="block" id="contact" style={{ borderTop: "1px solid var(--line)" }}>
      <div className="wrap">
        <Reveal>
          <div className="sec-code">{t.contact.code}</div>
          <h2>{t.contact.title}</h2>
        </Reveal>
        <div className="contact-grid">
          <Reveal>
            <div className="contact-info">
              <p>{t.contact.sub}</p>
              <div className="contact-meta">
                <span>{site.email}</span>
                <span>{site.phone}</span>
                <span>{site.city}</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <form className="contact" onSubmit={submit}>
              <div className="f-row">
                <div><label>{t.contact.f.name}</label><input required value={form.name} onChange={set("name")} /></div>
                <div><label>{t.contact.f.company}</label><input value={form.company} onChange={set("company")} /></div>
              </div>
              <div className="f-row">
                <div><label>{t.contact.f.email}</label><input type="email" required value={form.email} onChange={set("email")} /></div>
                <div><label>{t.contact.f.phone}</label><input value={form.phone} onChange={set("phone")} /></div>
              </div>
              <div><label>{t.contact.f.msg}</label><textarea value={form.msg} onChange={set("msg")} /></div>
              <button className="btn-primary" type="submit">{t.contact.f.send}</button>
              <span className="form-note">{t.contact.f.note}</span>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer>
      <div className="wrap foot-inner">
        <span className="brand"><img className="brand-logo foot-logo" src="/praxes-logo-dark.png" alt={site.name} /></span>
        <span>© {new Date().getFullYear()} {site.name} · {t.footer.rights}</span>
      </div>
    </footer>
  );
}
