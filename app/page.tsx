"use client";

import Image from "next/image";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { CSSProperties, Dispatch, KeyboardEvent, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
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

const programme = [
  ["15:30", "event1.title", "event1.place"],
  ["16:00", "event2.title", "event2.place"],
  ["18:00", "event3.title", "event3.place"],
  ["20:00", "event4.title", "event4.place"],
  ["22:30", "event5.title", "heart"],
  ["23:00", "event6.title", "event6.place"],
] as const;

const locations = [
  ["loc1.label", "loc1.name", "loc1.detail", ""],
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
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [hideEnvelope, setHideEnvelope] = useState(false);
  const [showEnvelopeMassage, setShowEnvelopeMassage] = useState(false);
  const [countdown, setCountdown] = useState<CountdownValue>(initialCountdown);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = useTranslations();

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
  const font =  useMemo(() => {
    if(locale === "en"){
      return "serif"
    }else if (locale === "it"){
      return "serif"
    }else if (locale === "ka"){
      return "geo"
    }
  }, [locale]);

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
      try {
        await audio.play();
        setIsMusicPlaying(true);
      } catch {
        setIsMusicPlaying(false);
      }
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
              <Image className="env-stamp" src="/assets/envelope_candle_stamp_AG.webp" alt="Anano and Giorgi wax stamp" width={78} height={78} priority />
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


          <section className="section page_2_wrapper">
            <div className="over_laye"></div>
            <article className={`white-card reveal}`}>
                <p className="eyebrow reveal reveal-d1">{t("story.eyebrow")}</p>
                <h2 className="reveal reveal-d1">{t("story.title")}</h2>
                <div className="ornament reveal reveal-d2">✦</div>
                <span className="vitruvian-heart reveal reveal-d2" aria-hidden="true">
                  <Image
                    className="vitruvian"
                    src="/assets/floral_heart.webp"
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
                {programme.map(([time, title, place], index) => (
                  <div key={`${time}-${title}`} className={`timeline-item reveal reveal-d${Math.min(3, Math.floor(index / 2) + 1)}`}>
                    <time>{time}</time>
                    <div>
                      <p className="tl-main">{t(title)}</p>
                      <p className="tl-sub">{place === "heart" ? "♡" : t(place)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <Section whiteCard = {true} id="s-locations" image="/assets/agriturismo_il_piastrino.webp" color="#C9D3C2" wide>
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
            {/* <div className="map-wrap reveal">
              <Image src="/assets/Road.png" alt="Tuscany wedding route map" className="tuscany-map" width={1200} height={760} sizes="(min-width: 760px) 620px, calc(100vw - 36px)" />
            </div> */}
          </Section>
        </main>
      )
      }
      <button className={`music-toggle${isMusicPlaying ? " playing" : ""}`} onClick={toggleMusic} aria-label="play music">
        <span />
        <span />
        <span />
        <span />
      </button>
      <audio ref={audioRef} loop preload="none">
        <source src="https://cdn.pixabay.com/audio/2022/10/14/audio_3946a7c3a3.mp3" type="audio/mpeg" />
      </audio>


    </>
  );
}
