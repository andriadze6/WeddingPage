"use client";

import Image from "next/image";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { CSSProperties, Dispatch, KeyboardEvent, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import enMessages from "@/messages/en.json";
import itMessages from "@/messages/it.json";
import kaMessages from "@/messages/ka.json";
import Link from "next/link";

const messages = {
  ka: kaMessages,
  en: enMessages,
  it: itMessages,
} as const;

type Locale = keyof typeof messages;
type CountdownValue = { days: string; hours: string; minutes: string; seconds: string };

type SectionProps = {
  id: string;
  image: string;
  color: string;
  wide?: boolean;
  children: React.ReactNode;
  whiteCard: boolean;
};

const weddingDate = new Date("2026-06-04T15:30:00");
const initialCountdown: CountdownValue = { days: "--", hours: "--", minutes: "--", seconds: "--" };
const musicStartTime = 17;

const programme = [
  ["13:30", "event1.title", "event1.place", "event1.data-label"],
  ["14:30", "event2.title", "event2.place", "event2.data-label"],
  ["17:00", "event3.title", "event3.place", "event3.data-label"],
  ["17:30", "event4.title", "event4.place", "event4.data-label"],
  ["18:15", "event5.title", "event5.place", "event5.data-label"],
  ["19:30", "event6.title", "event6.place", "event6.data-label"],
  ["21:30", "event7.title", "event7.place", "event7.data-label"],
  ["22:00", "event8.title", "event8.place", "event8.data-label"],
] as const;

// Fill in each guest's full name exactly as they'll search for it.
// Example: { id: 1, guests: ["ანანო ბერიძე", "გიორგი მამულაძე", ...] }
const tables: { id: number; guests: string[] }[] = [
  { id: 1,  guests: [] },
  { id: 2,  guests: [] },
  { id: 3,  guests: [] },
  { id: 4,  guests: [] },
  { id: 5,  guests: [] },
  { id: 6,  guests: [] },
  { id: 7,  guests: [] },
  { id: 8,  guests: [] },
  { id: 9,  guests: [] },
  { id: 10, guests: [] },
];

const TABLE_POSITIONS = [
  { id: 1,  x: 70,  y: 90  },
  { id: 2,  x: 194, y: 90  },
  { id: 3,  x: 360, y: 90  },
  { id: 4,  x: 526, y: 90  },
  { id: 5,  x: 650, y: 90  },
  { id: 6,  x: 70,  y: 330 },
  { id: 7,  x: 194, y: 330 },
  { id: 8,  x: 360, y: 330 },
  { id: 9,  x: 526, y: 330 },
  { id: 10, x: 650, y: 330 },
];

function TableMap({ activeId }: { activeId: number | null }) {
  const R = 32, SR = 9, ORBIT = 44, N = 8;
  return (
    <svg viewBox="0 0 720 420" className="table-map" aria-hidden="true">
      <rect x="8" y="8" width="704" height="404" rx="16"
        fill="rgba(251,250,246,0.5)" stroke="var(--sepia)" strokeWidth="0.8"
        strokeOpacity="0.2" strokeDasharray="6,4" />
      <rect x="245" y="138" width="230" height="144" rx="10"
        fill="rgba(143,162,135,0.08)" stroke="var(--sepia)" strokeWidth="0.8" strokeOpacity="0.18" />
      <text x="360" y="214" textAnchor="middle" fontSize="11"
        fill="var(--sepia)" fillOpacity="0.35" fontStyle="italic">
        dance floor
      </text>
      {TABLE_POSITIONS.map(({ id, x, y }) => {
        const active = activeId === id;
        return (
          <g key={id}>
            {Array.from({ length: N }, (_, i) => {
              const a = (i / N) * 2 * Math.PI - Math.PI / 2;
              return (
                <circle key={i}
                  cx={x + ORBIT * Math.cos(a)} cy={y + ORBIT * Math.sin(a)} r={SR}
                  fill={active ? "rgba(143,162,135,0.45)" : "rgba(237,231,225,0.9)"}
                  stroke={active ? "var(--primary-dark)" : "var(--sepia)"}
                  strokeWidth="0.8" strokeOpacity={active ? 0.7 : 0.28}
                />
              );
            })}
            <circle cx={x} cy={y} r={R}
              fill={active ? "rgba(143,162,135,0.28)" : "rgba(243,241,236,0.95)"}
              stroke={active ? "var(--primary-dark)" : "var(--sepia)"}
              strokeWidth={active ? 2.2 : 1} strokeOpacity={active ? 1 : 0.32}
            />
            <text x={x} y={y + 6} textAnchor="middle" fontSize="14"
              fontWeight={active ? "600" : "400"}
              fill={active ? "var(--primary-dark)" : "var(--sepia)"}
              fillOpacity={active ? 1 : 0.55}>
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const cities = [
  {
    key: "city1",
    mapUrl: "https://www.google.com/maps/place/San+Miniato/",
    cssClass: "san-miniato",
  },
  {
    key: "city2",
    mapUrl: "https://www.google.com/maps/place/San+Gimignano/",
    cssClass: "san-gimignano",
  },
  {
    key: "city3",
    mapUrl: "https://www.google.com/maps/place/Volterra/",
    cssClass: "volterra",
  },
] as const;

const locations = [
  ["loc1.label", "loc1.name", "loc1.detail", "https://www.google.com/maps/place/Porta+Pisana/@43.7195573,10.9445634,3a,75y/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgICJv-WevAE!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAPNQkAGbG352QMl_BpLW56uoh3FpXJ9betTpolSmcsHljD6jmba8-kHRx8uMApWRJ5C1C6QA9Ioi0bigvAH93xG3P6JynHjMdR1x-X5pMRfYtNSfMdqoMv-xxB64BuQZAGgSepEexjw2mQ%3Dw203-h305-k-no!7i3264!8i4912!4m7!3m6!1s0x132a698da289908b:0x42c8ea34229d9380!8m2!3d43.7195989!4d10.944607!10e5!16s%2Fg%2F11gt__6lh4?entry=ttu&g_ep=EgoyMDI2MDQyOC4wIKXMDSoASAFQAw%3D%3D"],
  ["loc2.label", "loc2.name", "loc2.detail", "https://www.google.com/maps/place/Azienda+Agrituristica+Musignano/data=!4m2!3m1!1s0x0:0x70de6bce7c35a158?sa=X&ved=1t:2428&ictx=111"],
  ["loc3.label", "loc3.name", "loc3.detail", "https://www.google.com/maps/place/Agriturismo+Il+Piastrino/data=!4m2!3m1!1s0x132a66c61f8d0353:0x891b99f8190d3e1d?sa=X&ved=1t:242&ictx=111"],
] as const;

function getCountdown(): CountdownValue {
  const diff = Math.max(0, weddingDate.getTime() - Date.now());
  const seconds = Math.floor(diff / 1000);

  return {
    days: String(Math.floor(seconds / 86400)).padStart(2, "0"),
    hours: String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((seconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(seconds % 60).padStart(2, "0"),
  };
}

function Section({ id, image, color, wide, children, whiteCard = true }: SectionProps) {
  const style = { "--section-image": `url(${image})`, "--section-color": color } as CSSProperties;

  return (
    <section className="section" id={id} style={style}>
      <article className={`${whiteCard ? "white-card" : "white-card_none_background"} reveal${wide ? " wide" : ""}`}>{children}</article>
    </section>
  );
}

type WeddingInvitationProps = {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="Asia/Tbilisi">
      <WeddingInvitation locale={locale} setLocale={setLocale} />
    </NextIntlClientProvider>
  );
}

function WeddingInvitation({ locale, setLocale }: WeddingInvitationProps) {
  const [seatQuery, setSeatQuery] = useState("");
  const seatResult = useMemo(() => {
    const q = seatQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    for (const table of tables) {
      if (table.guests.some(g => g.toLowerCase().includes(q))) return table;
    }
    return "not-found" as const;
  }, [seatQuery]);

  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [hideEnvelope, setHideEnvelope] = useState(false);
  const [showEnvelopeMassage, setShowEnvelopeMassage] = useState(false);
  const [countdown, setCountdown] = useState<CountdownValue>(initialCountdown);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasTriedAutoPlayRef = useRef(false);
  const hasAttachedMusicStartListenersRef = useRef(false);
  const t = useTranslations();

  const playMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    if (!audio.paused) {
      setIsMusicPlaying(true);
      return true;
    }

    try {
      audio.currentTime = musicStartTime;
      await audio.play();
      setIsMusicPlaying(true);
      return true;
    } catch {
      setIsMusicPlaying(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setCountdown(getCountdown()), 0);
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in")),
      { threshold: 0.12 },
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [locale, hideEnvelope]);

  useEffect(() => {
    if (hasTriedAutoPlayRef.current) return;

    hasTriedAutoPlayRef.current = true;
    void playMusic();
  }, [playMusic]);

  useEffect(() => {
    if (hasAttachedMusicStartListenersRef.current) return;

    hasAttachedMusicStartListenersRef.current = true;
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const startMusic = () => {
      void playMusic().then((didPlay) => {
        if (!didPlay) return;
        events.forEach((event) => window.removeEventListener(event, startMusic));
      });
    };

    events.forEach((event) => window.addEventListener(event, startMusic, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, startMusic));
      hasAttachedMusicStartListenersRef.current = false;
    };
  }, [playMusic]);
  const openEnvelope = () => {
    setIsEnvelopeOpen(true);
    window.setTimeout(() => setHideEnvelope(true), 1300);
  };

  const handleEnvelopeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope();
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await playMusic();
    } else {
      audio.pause();
      setIsMusicPlaying(false);
    }
  };

  return (
    <>
      <div className="lang-wrap">
        <nav className="lang-switcher" aria-label="language">
          {(["ka", "en", "it"] as const).map((item) => (
            <button key={item} className={`lang-btn${locale === item ? " active" : ""}`} onClick={() => setLocale(item)}>
              {item === "ka" ? "ქარ" : item.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>
      {/* <div className="env-hands" aria-hidden="true">
        <Image className="env-hand env-hand-left" src="/assets/left-hand.png" alt="" width={170} height={170} priority />
        <Image className="env-hand env-hand-right" src="/assets/right-hand.png" alt="" width={170} height={170} priority />
      </div> */}
      {!hideEnvelope ? (
        <div  className={`envelope-screen${isEnvelopeOpen ? " open" : ""}`}>
          <div
            className="envelope-form-wrap envelope"
            role="button"
            tabIndex={0}
            aria-label="Open invitation"
            onClick={()=>{
              if(!showEnvelopeMassage){
                setShowEnvelopeMassage(!showEnvelopeMassage);
              }else{
                openEnvelope();
              }
            }}
            onKeyDown={handleEnvelopeKeyDown}
          >
            <div className="env-wrap">
              <div className="env-top" />
              <div className="env-bottom-wrap">
                <div className="env-bottom" />
              </div>
              <Image className="env-stamp" src="/assets/logo_red.webp" alt="Anano and Giorgi wax stamp" width={100} height={100} priority />
              <div className="env-card-peek-wrapper">
                <div className="env-card-peek">
                  <span>{t("envelope.title")}</span>
                  <span className="script">{t("envelope.names")}</span>
                  <small>04 · 06 · 2026</small>
                  <small className="env-hint">{t("envelope.click")} ✦</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      ):
      (
        <main style={{
          display:"flex",
          flexDirection:"column",
        }}>
          <div style={{
            position:"relative",
            width:"100%",
            height:"100%",
            display:"flex",
            flexDirection:"column",
          }} className="page_1_wrapper">

            <Section whiteCard = {false} id="s-hero" 
            image="" color="#A8B5A0">
              <Image
                className="bird-sketch"
                src="/assets/flying_machine_watercolor.webp"
                alt=""
                width={1200}
                height={800}
                priority
              />
              {/* <p className="eyebrow">{t("hero.eyebrow")}</p> */}
              <h1 className="names">
                {t("hero.Anano")}
                <span>{t("hero.amp")}</span>
                {t("hero.Giorgi")}
              </h1>
              <p className="date">{t("hero.date")}</p>
              <p className="place">{t("hero.location")}</p>
              <div className="countdown">
                <div><strong>{countdown.days}</strong><span>{t("countdown.days")}</span></div>
                <div><strong>{countdown.hours}</strong><span>{t("countdown.hours")}</span></div>
                <div><strong>{countdown.minutes}</strong><span>{t("countdown.minutes")}</span></div>
                <div><strong>{countdown.seconds}</strong><span>{t("countdown.seconds")}</span></div>
              </div>
            </Section>
          </div>


          <section style={{
            display:"list-item"
          }} className="section page_2_wrapper">
            <div className="over_laye"></div>
            <article className={`white-card reveal}`}>
                <p className="eyebrow reveal reveal-d1">{t("story.eyebrow")}</p>
                <h2 className="reveal reveal-d1">{t("story.title")}</h2>
                <div className="ornament reveal reveal-d2">✦</div>
                <span className="vitruvian-heart reveal reveal-d2" aria-hidden="true">
                  <Image
                    className="vitruvian"
                    src="/assets/ChatGPT Image May 2, 2026, 02_12_57 AM.png"
                    alt=""
                    width={220}
                    height={330}
                  />
                </span>
                <p className="story-text reveal reveal-d2">{t("story.text")}</p>
                <p className="signature reveal reveal-d3">{t("story.signature")}</p>
            </article>
          </section>

          {/* <Section whiteCard = {false} id="s-story" image="/assets/vinci.png" color="#A8B5A0">

          </Section> */}
          <section className="section page_3_wrapper">
            <article className={`white-card reveal`}>
              <p className="eyebrow">{t("programme.eyebrow")}</p>
              <h2>{t("programme.title")}</h2>
              <p className="subtitle">{t("programme.subtitle")}</p>
              <div className="timeline">
                {programme.map(([time, title, place,], index) => (
                  <div key={`${time}-${title}`} className={`timeline-item reveal reveal-d${Math.min(3, Math.floor(index / 2) + 1)}`}>
                    <time>{time}</time>
                    <div>
                      <p className="tl-main">{t(title)}</p>
                      <p className="tl-sub">{t(place)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>


          <section className="section page_4_wrapper">
            <article className={`white-card reveal`}>
              <p className="eyebrow">{t("venue.eyebrow")}</p>
              <h2>{t("venue.title")}</h2>
              <p className="intro">{t("venue.intro")}</p>
              <div className="location-grid">
                {locations.map(([label, name, detail, url], index) => (
                  <Link target="_blank" rel="noopener noreferrer" href={url} key={label} className={`loc-card reveal reveal-d${index + 1}`}>
                    <b>{t(label)}</b>
                    <span className="loc-name">{t(name)}</span>
                    <small>{t(detail)}</small>
                  </Link>
                ))}
              </div>
            </article>
          </section>
          <section className="section page_5_wrapper">
            <article className="white-card wide reveal">
              <p className="eyebrow">{t("explore.eyebrow")}</p>
              <h2>{t("explore.title")}</h2>
              <p className="subtitle">{t("explore.intro")}</p>
              <div className="city-grid">
                {cities.map(({ key, mapUrl, cssClass }, index) => (
                  <a
                    key={key}
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`city-card city-bg-${cssClass} reveal reveal-d${Math.min(3, index + 1)}`}
                  >
                    <div className="city-card-overlay" />
                    <div className="city-card-body">
                      <p className="city-card-name">{t(`${key}.name`)}</p>
                      <p className="city-card-desc">{t(`${key}.desc`)}</p>
                      <p className="city-card-distance">{t(`${key}.distance`)}</p>
                      <span className="city-card-maps-btn">📍 {t("explore.viewOnMaps")}</span>
                    </div>
                  </a>
                ))}
              </div>
            </article>
          </section>
          {/* <section className="section page_6_wrapper">
            <article className="white-card wide reveal">
              <p className="eyebrow">{t("seating.eyebrow")}</p>
              <h2>{t("seating.title")}</h2>
              <div className="seating-search">
                <input
                  className="seating-input"
                  type="text"
                  value={seatQuery}
                  onChange={e => setSeatQuery(e.target.value)}
                  placeholder={t("seating.placeholder")}
                  autoComplete="off"
                />
              </div>
              {seatQuery.trim().length >= 2 && (
                <div className={`seating-result${seatResult === "not-found" ? " not-found" : seatResult ? " found" : ""}`}>
                  {seatResult === "not-found" ? (
                    <p>{t("seating.notFound")}</p>
                  ) : seatResult ? (
                    <>
                      <p className="seat-table-num">{t("seating.result", { n: seatResult.id })}</p>
                      {seatResult.guests.length > 0 && (
                        <>
                          <p className="seat-together-label">{t("seating.together")}</p>
                          <ul className="seat-guests">
                            {seatResult.guests.map(g => <li key={g}>{g}</li>)}
                          </ul>
                        </>
                      )}
                    </>
                  ) : null}
                </div>
              )}
              <div className="table-map-wrap">
                <TableMap activeId={seatResult && seatResult !== "not-found" ? seatResult.id : null} />
              </div>
            </article>
          </section> */}
        </main>
      )
      }
      <button className={`music-toggle${isMusicPlaying ? " playing" : ""}`} onClick={toggleMusic} aria-label="play music">
        <span />
        <span />
        <span />
        <span />
      </button>
      <audio ref={audioRef} loop preload="auto" autoPlay>
        <source src="/assets/Dean Martin - That's Amore - NM Catalogue (128k).mp3" type="audio/mpeg" />
      </audio>


    </>
  );
}
