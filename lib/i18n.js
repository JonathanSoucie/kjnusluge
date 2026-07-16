"use client";
import { createContext, useContext, useEffect, useState } from "react";

const dict = {
  hr: {
    nav: { process: "Proces", funding: "Sufinanciranje", team: "Tim", faq: "Pitanja", contact: "Kontakt", cta: "Besplatna procjena" },
    hero: {
      eyebrow: "Nezavisno savjetovanje za automatizaciju · Istra",
      title_a: "Automatizirajte pametno.",
      title_b: "Uz sufinanciranje.",
      sub: "Nezavisni smo konzultanti: procjenjujemo isplativost, strukturiramo EU i HR poticaje — i povezujemo vas s provjerenim hrvatskim integratorom koji projektira i gradi rješenje.",
      cta1: "Zatražite besplatnu procjenu",
      cta2: "Kako radimo",
      trust: ["Ne prodajemo robote — neovisni smo", "30–60 % investicije pokriveno poticajima", "Provjereni hrvatski integratori"],
    },
    pillars: {
      code: "S.01 — Što radimo",
      title: "Tri stvari koje radimo za vas",
      items: [
        { n: "01", t: "Iskrena procjena isplativosti", d: "Mjerljiv ROI za konkretnu radnu stanicu — uz jasnu preporuku. Ako se automatizacija kod vas ne isplati, to ćemo vam i reći." },
        { n: "02", t: "EU i HR sufinanciranje", d: "Poticaji često pokrivaju 30–60 % investicije. Pronalazimo pravi program, računamo isplativost sa sufinanciranjem i pripremamo dokumentaciju." },
        { n: "03", t: "Provjereni integratori", d: "Raspisujemo natječaj među provjerenim hrvatskim integratorima i nadziremo izvedbu do preuzimanja. Vi dobivate najbolju cijenu — bez rizika." },
      ],
    },
    process: {
      code: "S.02 — Proces",
      title: "Od prvog razgovora do puštanja u rad",
      sub: "Angažman u koracima — vaš rizik raste tek kad je isplativost dokazana.",
      steps: [
        { t: "Besplatna snimka prilika", tag: "besplatno", d: "Dolazimo u pogon, prošetamo proizvodnjom i kažemo vam gdje automatizacija ima smisla — i okvirno što bi donijela. 30 minuta, bez obveze." },
        { t: "Audit isplativosti", tag: "", d: "Detaljna analiza odabrane radne stanice: ciklusi, radna snaga, propusnost. Dobivate mjerljiv ROI i plan sufinanciranja za konkretnu investiciju." },
        { t: "Natječaj i izbor integratora", tag: "", d: "Na temelju audita pripremamo specifikaciju i vaš projekt raspisujemo među provjerenim hrvatskim integratorima. Uspoređujemo ponude po jasnim kriterijima i vodimo vas do najbolje vrijednosti." },
        { t: "Nadzor i preuzimanje", tag: "", d: "Nadziremo izgradnju prema specifikaciji i vodimo preuzimanje prema mjerljivim kriterijima — sustav je gotov tek kad radi kako je obećano." },
      ],
    },
    funding: {
      code: "S.03 — Sufinanciranje",
      title: "Investicija koja se ne plaća u cijelosti iz vašeg džepa",
      sub: "Hrvatska i EU aktivno sufinanciraju automatizaciju proizvodnje. Većina naših klijenata to ne zna — ili ne zna kako do toga doći. Mi to strukturiramo kao dio svakog projekta.",
      stats: [
        { v: "30–60", u: "%", k: "tipičan udio sufinanciranja investicije" },
        { v: "12–24", u: "mj.", k: "tipičan povrat uz sufinanciranje" },
        { v: "0", u: "€", k: "trošak prve procjene — besplatna je" },
      ],
      note: "Važno: prijave za većinu programa moraju se predati prije početka investicije. Zato sufinanciranje planiramo od prvog dana, a ne naknadno.",
    },
    team: {
      code: "S.04 — Tim",
      title: "Tko stoji iza projekta",
      members: [
        { init: "J", name: "Jonathan Soucie", img: "/team/jon.jpg", role: "Inženjering i projektiranje", bio: "Kanadski inženjer robotike s praktičnim iskustvom u ugradbenim sustavima i projektiranju robotskih ćelija. Vodi procjene, tehničke specifikacije i simulacije." },
        { init: "K", name: "Karlo Bunjački", img: "/team/karlo.jpeg", role: "Financije i sufinanciranje", bio: "Stručnjak za financije i računovodstvo s dubokim poznavanjem EU fondova i hrvatskih poticaja. Vodi strukturiranje sufinanciranja i poslovni razvoj." },
        { init: "N", name: "Nicola Sartori", img: "/team/nick.jpeg", role: "Strategija i poslovni razvoj", bio: "Diplomirani stručnjak međunarodnog poslovanja s iskustvom u strategiji i marketingu, istraživanju tržišta i pozicioniranju brenda u Italiji i Sjevernoj Americi. Vodi kontakt s klijentima, partnerstva i komunikacije." },
      ],
    },
    faq: {
      code: "S.05 — Česta pitanja",
      title: "Ono što nas svi pitaju",
      items: [
        { q: "S kojim industrijama radite?", a: "Najviše s metaloprerađivačkom industrijom (posluživanje CNC strojeva), preradom plastike (posluživanje brizgalica) i prehrambenom industrijom (paletizacija i pakiranje). Ako je vaš proces repetitivan i mjerljiv — vjerojatno ga možemo procijeniti." },
        { q: "Koliki je povrat investicije?", a: "Kod klijenata s više smjena ili nepopunjenim radnim mjestima, tipično 12–24 mjeseca uz sufinanciranje. Ključni faktor: robot pokriva smjene koje danas ne možete popuniti." },
        { q: "Prodajete li robote?", a: "Ne. Neovisni smo konzultanti — ne zastupamo nijednog proizvođača i ne zarađujemo na hardveru. Zato naša preporuka odgovara vašem procesu, a ne tuđoj proviziji." },
        { q: "Tko gradi sustav?", a: "Provjereni hrvatski integratori. Mi raspisujemo natječaj među njima i nadziremo izvedbu do preuzimanja. Vi dobivate konkurentnu cijenu i jednog odgovornog partnera — nas." },
        { q: "Što ako se automatizacija kod nas ne isplati?", a: "Reći ćemo vam to otvoreno — s brojkama. Otprilike trećini tvrtki koje procijenimo preporučujemo da (još) ne automatiziraju. Naš proizvod je točan odgovor, a ne prodaja robota." },
        { q: "Kako funkcionira sufinanciranje?", a: "EU i hrvatski programi (vaučeri za digitalizaciju, potpore za opremu, porezne olakšice za modernizaciju) pokrivaju 30–60 % opravdanih troškova. Prijava se u pravilu mora predati prije početka investicije — zato to planiramo od prvog dana." },
        { q: "Koliko traje projekt?", a: "Snimka prilika: 1 dan. Audit: 1–2 tjedna. Specifikacija i natječaj: 4–8 tjedana. Izgradnja i puštanje u rad: ovisno o integratoru, tipično 8–16 tjedana. Većina inženjerskog posla odvija se offline, u simulaciji — pa je zastoj vaše proizvodnje minimalan." },
        { q: "Je li kobot siguran za rad uz ljude?", a: "Da — uz ispravnu procjenu rizika. Svaka ćelija se isporučuje sukladno normama EN ISO 10218 i ISO/TS 15066, s CE oznakom i potpunom sigurnosnom dokumentacijom. To je uvjet preuzimanja, ne opcija." },
      ],
    },
    contact: {
      code: "S.06 — Kontakt",
      title: "Razgovarajmo o vašoj proizvodnji",
      sub: "Prvi korak je besplatan i bez obveze: pola sata razgovora i obilazak pogona. Ako automatizacija kod vas nema smisla — čut ćete i to.",
      f: { name: "Ime i prezime", company: "Tvrtka", email: "E-mail", phone: "Telefon", msg: "Poruka (npr. što proizvodite i gdje vas najviše žulja)", send: "Pošaljite upit", note: "Slanjem se otvara vaš e-mail klijent s pripremljenom porukom." },
    },
    footer: { rights: "Sva prava pridržana." },
  },
  en: {
    nav: { process: "Process", funding: "Funding", team: "Team", faq: "FAQ", contact: "Contact", cta: "Free assessment" },
    hero: {
      eyebrow: "Independent automation consulting · Istria",
      title_a: "Automate smart.",
      title_b: "With funding.",
      sub: "We're independent consultants: we assess the payback, structure EU and Croatian incentives — and connect you with a vetted Croatian integrator who designs and builds the solution.",
      cta1: "Request a free assessment",
      cta2: "How we work",
      trust: ["We don't sell robots — we're independent", "30–60% covered by incentives", "Vetted Croatian integrators"],
    },
    pillars: {
      code: "S.01 — What we do",
      title: "Three things we do for you",
      items: [
        { n: "01", t: "Honest ROI assessment", d: "A defensible payback figure for a specific workstation — with a clear recommendation. If automation doesn't pay off in your plant, we'll tell you exactly that." },
        { n: "02", t: "EU & Croatian funding", d: "Incentives often cover 30–60% of the investment. We find the right programme, calculate payback with the subsidy included, and prepare the paperwork." },
        { n: "03", t: "Vetted integrators", d: "We tender your project among vetted Croatian integrators and oversee the build to acceptance. You get the best price — without the risk." },
      ],
    },
    process: {
      code: "S.02 — Process",
      title: "From first conversation to commissioning",
      sub: "A staged engagement — your risk grows only after the payback is proven.",
      steps: [
        { t: "Free opportunity scan", tag: "free", d: "We visit your plant, walk the floor, and tell you where automation makes sense — and roughly what it would return. 30 minutes, no obligation." },
        { t: "ROI audit", tag: "", d: "A detailed analysis of the chosen workstation: cycles, labour, throughput. You get a defensible payback figure and a funding plan for a concrete investment." },
        { t: "Tender & integrator selection", tag: "", d: "Based on the audit we prepare the specification and tender your project among vetted Croatian integrators, comparing bids against clear criteria and guiding you to the best value." },
        { t: "Oversight & acceptance", tag: "", d: "We supervise the build against the specification and run acceptance against measurable criteria — the system is done only when it performs as promised." },
      ],
    },
    funding: {
      code: "S.03 — Funding",
      title: "An investment you don't pay for entirely out of pocket",
      sub: "Croatia and the EU actively subsidise manufacturing automation. Most of our clients don't know this — or don't know how to access it. We structure it into every project.",
      stats: [
        { v: "30–60", u: "%", k: "typical share of the investment covered" },
        { v: "12–24", u: "mo.", k: "typical payback with funding included" },
        { v: "0", u: "€", k: "cost of the first assessment — it's free" },
      ],
      note: "Important: most programmes require the application to be filed before the investment starts. That's why we plan funding from day one, not as an afterthought.",
    },
    team: {
      code: "S.04 — Team",
      title: "Meet the Team",
      members: [
        { init: "J", name: "Jonathan Soucie", img: "/team/jon.jpg", role: "Engineering & Design", bio: "Canadian robotics engineer with hands-on experience in embedded systems and robotic cell design. Leads assessments, technical specifications and simulation." },
        { init: "K", name: "Karlo Bunjački", img: "/team/karlo.jpeg", role: "Finance & Funding", bio: "Finance and accounting expert with deep knowledge of EU funds and Croatian incentives. Leads funding structuring and business development." },
        { init: "N", name: "Nicola Sartori", img: "/team/nick.jpeg", role: "Strategy & Outreach", bio: "International business graduate with experience in strategy and marketing across Italy and North America. Leads client outreach, partnerships and communications." },
      ],
    },
    faq: {
      code: "S.05 — FAQ",
      title: "What everyone asks us",
      items: [
        { q: "Which industries do you work with?", a: "Mostly metal processing (CNC machine tending), plastics (injection moulding machine tending) and food production (palletizing and packing). If your process is repetitive and measurable — we can probably assess it." },
        { q: "What payback is realistic?", a: "For clients running multiple shifts or with unfillable positions, typically 12–24 months with funding included. The key driver: the robot covers the shifts you can't staff today." },
        { q: "Do you sell robots?", a: "No. We're independent consultants — we represent no manufacturer and earn nothing on hardware. That's why our recommendation fits your process, not someone's commission." },
        { q: "Who builds the system?", a: "Vetted Croatian integrators. We tender your project among them and oversee the build to acceptance. You get a competitive price and one accountable partner — us." },
        { q: "What if automation doesn't pay off for us?", a: "We'll tell you openly — with numbers. We advise roughly a third of the companies we assess not to automate (yet). Our product is the accurate answer, not a robot sale." },
        { q: "How does the funding work?", a: "EU and Croatian programmes (digitalisation vouchers, equipment grants, modernisation tax incentives) cover 30–60% of eligible costs. Applications generally must be filed before the investment starts — which is why we plan it from day one." },
        { q: "How long does a project take?", a: "Opportunity scan: 1 day. Audit: 1–2 weeks. Specification and tender: 4–8 weeks. Build and commissioning: integrator-dependent, typically 8–16 weeks. Most engineering happens offline in simulation, so disruption to your production is minimal." },
        { q: "Is a cobot safe to work next to people?", a: "Yes — with a proper risk assessment. Every cell is delivered to EN ISO 10218 and ISO/TS 15066, CE-marked, with complete safety documentation. That's a condition of acceptance, not an option." },
      ],
    },
    contact: {
      code: "S.06 — Contact",
      title: "Let's talk about your production",
      sub: "The first step is free and without obligation: a half-hour conversation and a plant walk-through. If automation doesn't make sense for you — you'll hear that too.",
      f: { name: "Full name", company: "Company", email: "E-mail", phone: "Phone", msg: "Message (e.g. what you make and where it hurts most)", send: "Send inquiry", note: "Submitting opens your e-mail client with a pre-filled message." },
    },
    footer: { rights: "All rights reserved." },
  },
  it: {
    nav: { process: "Processo", funding: "Finanziamenti", team: "Team", faq: "FAQ", contact: "Contatti", cta: "Valutazione gratuita" },
    hero: {
      eyebrow: "Consulenza indipendente per l'automazione · Istria",
      title_a: "Automatizza in modo intelligente.",
      title_b: "Con i finanziamenti.",
      sub: "Siamo consulenti indipendenti: valutiamo il ritorno dell'investimento, strutturiamo gli incentivi UE e croati — e vi mettiamo in contatto con un integratore croato qualificato che progetta e realizza la soluzione.",
      cta1: "Richiedi una valutazione gratuita",
      cta2: "Come lavoriamo",
      trust: ["Non vendiamo robot — siamo indipendenti", "30–60% coperto dagli incentivi", "Integratori croati qualificati"],
    },
    pillars: {
      code: "S.01 — Cosa facciamo",
      title: "Tre cose che facciamo per voi",
      items: [
        { n: "01", t: "Valutazione onesta del ROI", d: "Un ritorno dell'investimento misurabile per una postazione specifica — con una raccomandazione chiara. Se nel vostro stabilimento l'automazione non conviene, ve lo diremo apertamente." },
        { n: "02", t: "Finanziamenti UE e croati", d: "Gli incentivi coprono spesso il 30–60% dell'investimento. Individuiamo il programma giusto, calcoliamo il ritorno con il contributo incluso e prepariamo la documentazione." },
        { n: "03", t: "Integratori qualificati", d: "Mettiamo il vostro progetto a gara tra integratori croati qualificati e supervisioniamo la realizzazione fino al collaudo. Ottenete il miglior prezzo — senza rischi." },
      ],
    },
    process: {
      code: "S.02 — Processo",
      title: "Dal primo colloquio alla messa in servizio",
      sub: "Un incarico per fasi — il vostro rischio cresce solo quando il ritorno è dimostrato.",
      steps: [
        { t: "Analisi gratuita delle opportunità", tag: "gratis", d: "Visitiamo lo stabilimento, percorriamo la produzione e vi diciamo dove l'automazione ha senso — e indicativamente quanto renderebbe. 30 minuti, senza impegno." },
        { t: "Audit del ROI", tag: "", d: "Un'analisi dettagliata della postazione scelta: cicli, manodopera, produttività. Ottenete un ritorno misurabile e un piano di finanziamento per un investimento concreto." },
        { t: "Gara e scelta dell'integratore", tag: "", d: "Sulla base dell'audit prepariamo la specifica e mettiamo il progetto a gara tra integratori croati qualificati, confrontando le offerte secondo criteri chiari e guidandovi verso il miglior valore." },
        { t: "Supervisione e collaudo", tag: "", d: "Supervisioniamo la realizzazione secondo la specifica e gestiamo il collaudo secondo criteri misurabili — il sistema è finito solo quando funziona come promesso." },
      ],
    },
    funding: {
      code: "S.03 — Finanziamenti",
      title: "Un investimento che non pagate interamente di tasca vostra",
      sub: "La Croazia e l'UE sovvenzionano attivamente l'automazione della produzione. La maggior parte dei nostri clienti non lo sa — o non sa come accedervi. Noi lo strutturiamo in ogni progetto.",
      stats: [
        { v: "30–60", u: "%", k: "quota tipica dell'investimento coperta" },
        { v: "12–24", u: "mesi", k: "ritorno tipico con i finanziamenti inclusi" },
        { v: "0", u: "€", k: "costo della prima valutazione — è gratuita" },
      ],
      note: "Importante: per la maggior parte dei programmi la domanda va presentata prima dell'inizio dell'investimento. Per questo pianifichiamo i finanziamenti dal primo giorno, non a posteriori.",
    },
    team: {
      code: "S.04 — Team",
      title: "Il nostro team",
      members: [
        { init: "J", name: "Jonathan Soucie", img: "/team/jon.jpg", role: "Ingegneria e progettazione", bio: "Ingegnere robotico canadese con esperienza pratica in sistemi embedded e progettazione di celle robotizzate. Guida le valutazioni, le specifiche tecniche e le simulazioni." },
        { init: "K", name: "Karlo Bunjački", img: "/team/karlo.jpeg", role: "Finanza e finanziamenti", bio: "Esperto di finanza e contabilità con una profonda conoscenza dei fondi UE e degli incentivi croati. Guida la strutturazione dei finanziamenti e lo sviluppo commerciale." },
        { init: "N", name: "Nicola Sartori", img: "/team/nick.jpeg", role: "Strategia e sviluppo commerciale", bio: "Laureato in business internazionale con esperienza in strategia e marketing in Italia e Nord America. Guida i rapporti con i clienti, le partnership e la comunicazione." },
      ],
    },
    faq: {
      code: "S.05 — FAQ",
      title: "Le domande che tutti ci fanno",
      items: [
        { q: "Con quali settori lavorate?", a: "Soprattutto lavorazione dei metalli (asservimento di macchine CNC), plastica (asservimento di presse a iniezione) e industria alimentare (pallettizzazione e confezionamento). Se il vostro processo è ripetitivo e misurabile — probabilmente possiamo valutarlo." },
        { q: "Quale ritorno è realistico?", a: "Per i clienti con più turni o posizioni scoperte, in genere 12–24 mesi con i finanziamenti inclusi. Il fattore chiave: il robot copre i turni che oggi non riuscite a coprire con il personale." },
        { q: "Vendete robot?", a: "No. Siamo consulenti indipendenti — non rappresentiamo nessun produttore e non guadagniamo sull'hardware. Per questo la nostra raccomandazione si adatta al vostro processo, non alla provvigione di qualcuno." },
        { q: "Chi costruisce il sistema?", a: "Integratori croati qualificati. Mettiamo il vostro progetto a gara tra di loro e supervisioniamo la realizzazione fino al collaudo. Ottenete un prezzo competitivo e un unico partner responsabile — noi." },
        { q: "E se da noi l'automazione non conviene?", a: "Ve lo diremo apertamente — con i numeri. A circa un terzo delle aziende che valutiamo consigliamo di non automatizzare (per ora). Il nostro prodotto è la risposta corretta, non la vendita di un robot." },
        { q: "Come funzionano i finanziamenti?", a: "I programmi UE e croati (voucher per la digitalizzazione, contributi per le attrezzature, agevolazioni fiscali per la modernizzazione) coprono il 30–60% dei costi ammissibili. In genere la domanda va presentata prima dell'inizio dell'investimento — per questo la pianifichiamo dal primo giorno." },
        { q: "Quanto dura un progetto?", a: "Analisi delle opportunità: 1 giorno. Audit: 1–2 settimane. Specifica e gara: 4–8 settimane. Realizzazione e messa in servizio: dipende dall'integratore, in genere 8–16 settimane. La maggior parte dell'ingegneria avviene offline, in simulazione, quindi l'impatto sulla vostra produzione è minimo." },
        { q: "Un cobot è sicuro accanto alle persone?", a: "Sì — con una corretta valutazione dei rischi. Ogni cella è consegnata conforme alle norme EN ISO 10218 e ISO/TS 15066, con marcatura CE e documentazione di sicurezza completa. È una condizione del collaudo, non un'opzione." },
      ],
    },
    contact: {
      code: "S.06 — Contatti",
      title: "Parliamo della vostra produzione",
      sub: "Il primo passo è gratuito e senza impegno: mezz'ora di colloquio e una visita allo stabilimento. Se l'automazione non ha senso per voi — ve lo diremo.",
      f: { name: "Nome e cognome", company: "Azienda", email: "E-mail", phone: "Telefono", msg: "Messaggio (es. cosa producete e dove sono i problemi maggiori)", send: "Invia richiesta", note: "L'invio apre il vostro client di posta con un messaggio precompilato." },
    },
    footer: { rights: "Tutti i diritti riservati." },
  },
};

const LangCtx = createContext(null);

const LANGS = ["hr", "en", "it"];

export function LangProvider({ children }) {
  const [lang, setLang] = useState("hr");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lang");
      if (LANGS.includes(saved)) setLang(saved);
    } catch (e) {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const choose = (next) => {
    if (!LANGS.includes(next)) return;
    try { window.localStorage.setItem("lang", next); } catch (e) {}
    setLang(next);
  };
  return <LangCtx.Provider value={{ lang, choose, t: dict[lang] }}>{children}</LangCtx.Provider>;
}
export function useLang() { return useContext(LangCtx); }
