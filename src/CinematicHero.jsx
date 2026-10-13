import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Arrow, Icon, Logo } from './components';
import { useSite } from './context';
import './cinematic-hero.css';

const VIDEO_URL = 'https://media.base44.com/videos/public/6ac3b9dedcc8ad0cee4fc4e5/14ceabc62_IMG_9763.MP4';
const FRAME_COUNT = 120;
const frameUrl = index => `/hero-frames/frame-${String(index + 1).padStart(3, '0')}.webp`;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);
function storyVisibility(progress, start, end) {
 return ease(clamp((progress - start) / .055)) * ease(clamp((end - progress) / .055));
}

export default function CinematicHero() {
 const { fa, openQuote } = useSite();
 const wrapper = useRef(null), sticky = useRef(null), scene = useRef(null), canvas = useRef(null), video = useRef(null);
 const media = useRef(null), foreground = useRef(null), stories = useRef([]), counters = useRef([]), progressBar = useRef(null), scrollHint = useRef(null);
 const [loading, setLoading] = useState(0), [ready, setReady] = useState(false), [mode, setMode] = useState('poster');

 useEffect(() => {
  const root = wrapper.current, stage = sticky.current, player = video.current;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
  const context = canvas.current.getContext('2d', { alpha: false });
  let disposed = false, images = [], sequence = false, metadata = false, reduced = motion.matches;
  let raf = 0, lastTime = 0, target = 0, progress = 0, lastFrame = -1, seekTarget = 0;
  let tiltX = 0, tiltY = 0, mouseX = 0, mouseY = 0, loaded = 0;
  const wake = () => { if (!disposed && !raf) raf = requestAnimationFrame(render); };
  const measure = () => {
   const bounds = root.getBoundingClientRect();
   target = reduced ? 0 : clamp(-bounds.top / Math.max(1, root.offsetHeight - stage.offsetHeight));
   wake();
  };
  const resize = () => {
   const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
   canvas.current.width = Math.round(stage.clientWidth * ratio);
   canvas.current.height = Math.round(stage.clientHeight * ratio);
   lastFrame = -1;
   measure();
  };
  const seek = () => {
   if (!sequence && metadata && !reduced && !player.seeking && Math.abs(player.currentTime - seekTarget) > .016) player.currentTime = seekTarget;
  };
  function render(now) {
   raf = 0;
   if (disposed) return;
   const delta = Math.min((now - (lastTime || now - 16)) / 1000, .064);
   lastTime = now;
   const blend = 1 - Math.exp(-delta / .14);
   progress = reduced ? 0 : progress + (target - progress) * blend;
   if (Math.abs(target - progress) < .0002) progress = target;
   tiltX += (mouseX - tiltX) * blend;
   tiltY += (mouseY - tiltY) * blend;
   const index = Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1)));
   if (sequence && images[index] && index !== lastFrame && context) {
    const image = images[index], width = canvas.current.width, height = canvas.current.height;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    context.drawImage(image, (width - image.naturalWidth * scale) / 2, (height - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale);
    lastFrame = index;
   }
   if (!sequence && metadata) { seekTarget = progress * Math.max(0, player.duration - .04); seek(); }
   scene.current.style.transform = `rotateX(${-tiltY * 4}deg) rotateY(${tiltX * 4}deg)`;
   media.current.style.transform = `translateZ(-60px) scale(${1.15 - progress * .15}) rotateX(${reduced ? 0 : 8 * (1 - progress)}deg)`;
   foreground.current.style.transform = `translate3d(${tiltX * 24}px,${tiltY * 18 - progress * 70}px,90px)`;
   const opacity = [reduced ? 1 : storyVisibility(progress, -.055, .30), reduced ? 0 : storyVisibility(progress, .35, .65), reduced ? 0 : storyVisibility(progress, .70, 1.06)];
   stories.current.forEach((element, i) => {
    const entry = i === 0 ? 1 : ease(clamp((progress - [0,.35,.70][i]) / .08));
    element.style.opacity = opacity[i];
    element.style.transform = `translate3d(${tiltX * 38}px,${(1-entry)*42 + tiltY*28 - progress*24}px,${-200*(1-entry)}px)`;
    element.style.visibility = opacity[i] > .001 ? 'visible' : 'hidden';
    element.inert = opacity[i] < .1;
   });
   const count = ease(clamp((progress - .70) / .17));
   counters.current.forEach((element, i) => { element.textContent = [Math.round(15*count)+'+', Math.round(10*count)+'K+', Math.round(99*count)+'%'][i]; });
   progressBar.current.style.transform = `scaleY(${progress})`;
   scrollHint.current.style.opacity = reduced ? 0 : clamp(1 - progress / .07);
   root.dataset.progress = progress.toFixed(4);
   root.dataset.frame = String(index);
   if (Math.abs(target-progress) > .0002 || Math.abs(mouseX-tiltX) > .001 || Math.abs(mouseY-tiltY) > .001) wake();
  }
  const pointer = event => {
   if (reduced || !desktop.matches) return;
   const bounds = stage.getBoundingClientRect();
   mouseX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
   mouseY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
   wake();
  };
  const resetTilt = () => { mouseX = mouseY = 0; wake(); };
  const orientation = event => {
   if (reduced || desktop.matches || event.gamma == null || event.beta == null) return;
   mouseX = Math.max(-1, Math.min(1, event.gamma / 30));
   mouseY = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
   wake();
  };
  const motionChange = () => { reduced = motion.matches; resetTilt(); measure(); };
  const metadataLoaded = () => { metadata = Number.isFinite(player.duration); measure(); };
  const mediaFailed = () => { if (!sequence && !disposed) { setReady(true); setMode('poster'); } };
  player.addEventListener('loadedmetadata', metadataLoaded);
  player.addEventListener('seeked', seek);
  player.addEventListener('error', mediaFailed);
  player.load();

  async function loadSequence() {
   const loadImage = index => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { images[index] = image; loaded++; if (!disposed) setLoading(Math.round(loaded / (reduced ? 1 : FRAME_COUNT) * 100)); resolve(); };
    image.onerror = reject;
    image.src = frameUrl(index);
   });
   try {
    await loadImage(0);
    if (disposed) return;
    if (!reduced) {
     let next = 1;
     await Promise.all(Array.from({length: 6}, async () => { while (next < FRAME_COUNT && !disposed) await loadImage(next++); }));
    }
    if (disposed) return;
    sequence = true;
    setMode('canvas'); setReady(true); resize();
   } catch {
    if (disposed) return;
    setMode('video');
    if (metadata) setReady(true);
    else player.addEventListener('loadeddata', () => { if (!disposed) setReady(true); }, {once:true});
    if (player.error) mediaFailed();
    measure();
   }
  }
  loadSequence();
  window.addEventListener('scroll', measure, {passive:true});
  window.addEventListener('resize', resize);
  stage.addEventListener('pointermove', pointer);
  stage.addEventListener('pointerleave', resetTilt);
  // iOS requires a user permission gesture; never prompt just to decorate a hero.
  const gyroAllowed = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function';
  if (gyroAllowed) window.addEventListener('deviceorientation', orientation, {passive:true});
  motion.addEventListener('change', motionChange);
  resize();
  return () => {
   disposed = true; cancelAnimationFrame(raf);
   window.removeEventListener('scroll', measure); window.removeEventListener('resize', resize);
   stage.removeEventListener('pointermove', pointer); stage.removeEventListener('pointerleave', resetTilt);
   window.removeEventListener('deviceorientation', orientation); motion.removeEventListener('change', motionChange);
   player.removeEventListener('loadedmetadata', metadataLoaded); player.removeEventListener('seeked', seek); player.removeEventListener('error', mediaFailed);
   player.pause(); images = [];
  };
 }, [fa]);

 return <section ref={wrapper} className="cinematic-hero" data-mode={mode} data-ready={ready} aria-label={fa ? 'بار شما، مسیر ما' : 'Your cargo. Our road.'}>
  <div ref={sticky} className="cinematic-sticky">
   <div ref={scene} className="cinematic-scene">
    <div ref={media} className="cinematic-media">
     <img className="cinematic-poster" src={frameUrl(0)} alt="" fetchpriority="high"/>
     <video ref={video} src={VIDEO_URL} poster={frameUrl(0)} muted playsInline preload="auto" aria-hidden="true" className={mode === 'video' ? 'is-visible' : ''}/>
     <canvas ref={canvas} aria-hidden="true" className={mode === 'canvas' ? 'is-visible' : ''}/>
    </div>
    <div className="cinematic-shade"/>
    <div ref={foreground} className="cinematic-foreground" aria-hidden="true"><i/><i/><i/></div>
    <div className="cinematic-stories container" dir={fa ? 'rtl' : 'ltr'}>
     <div ref={element => stories.current[0] = element} className="cinematic-story cinematic-opening">
      <span className="eyebrow">{fa ? 'حمل‌ونقل جاده‌ای داخلی و بین‌المللی' : 'DOMESTIC & INTERNATIONAL ROAD FREIGHT'}</span>
      <h1>{fa ? <>بار شما،<br/><em>مسیر ما</em></> : <>Your cargo.<br/><em>Our road.</em></>}</h1>
      <div className="cinematic-buttons"><button className="button" onClick={openQuote}>{fa ? 'استعلام قیمت' : 'Get a quote'}<Arrow/></button><Link to="/track" className="button outline"><Icon name="PackageSearch" size={18}/>{fa ? 'رهگیری محموله' : 'Track shipment'}</Link></div>
     </div>
     <div ref={element => stories.current[1] = element} className="cinematic-story cinematic-route" style={{opacity:0,visibility:'hidden'}}>
      <span className="eyebrow">{fa ? 'فراتر از مرزها' : 'BEYOND BORDERS'}</span>
      <h2>{fa ? 'از تهران تا استانبول، از بندر تا مرز' : 'From Tehran to Istanbul. From port to border.'}</h2>
      <p>{fa ? 'حمل‌ونقل جاده‌ای بین‌المللی تحت رویه TIR؛ هماهنگی مطمئن از مبدأ تا مقصد.' : 'International road freight under the TIR system. Reliable coordination from origin to destination.'}</p>
     </div>
     <div ref={element => stories.current[2] = element} className="cinematic-story cinematic-numbers" style={{opacity:0,visibility:'hidden'}}>
      <span className="eyebrow">{fa ? 'اعتماد، در هر کیلومتر' : 'TRUST. EVERY KILOMETER.'}</span>
      <h2>{fa ? 'مسیرهای بیشتر. اطمینان بیشتر.' : 'More roads. More confidence.'}</h2>
      <div className="cinematic-counter-grid">{[[ 'کشور', 'Countries'],['مشتری','Clients'],['تحویل به‌موقع','On-time delivery']].map(([f,e],i) => <div key={e}><b dir="ltr" ref={element => counters.current[i] = element}>0</b><span>{fa ? f : e}</span></div>)}</div>
     </div>
    </div>
   </div>
   <div className="cinematic-progress" aria-hidden="true"><span ref={progressBar}/></div>
   <div ref={scrollHint} className="cinematic-scroll" aria-hidden="true"><span className="cinematic-mouse"><i/></span><span>{fa ? 'برای ادامه، اسکرول کنید' : 'SCROLL TO EXPLORE'}</span></div>
   {!ready && <div className="cinematic-loader" role="status"><Logo light/><span>{fa ? 'آماده‌سازی مسیر…' : 'PREPARING THE JOURNEY…'} {loading}%</span><div><i style={{transform:`scaleX(${loading/100})`}}/></div></div>}
  </div>
 </section>;
}
