from pathlib import Path

html = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Zygote Builder</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
/* =========================================================
   ZYGOTE BUILDER — COSMOS × BIOLOGY
   Everything from the original interface is preserved:
   - all eight projects and URLs
   - numbering N.01–N.08
   - visit counter
   - logo asset
   - copy/descriptions
   - footer
   ========================================================= */

:root{
  --bg:#03050b;
  --bg2:#080c15;
  --panel:rgba(12,19,33,.58);
  --panel-strong:rgba(15,23,41,.76);
  --text:#f1f5ff;
  --muted:#9ca8bd;
  --line:rgba(194,218,255,.12);

  --cyan:#73d8ff;
  --cyan2:#b9efff;
  --violet:#9f8cff;
  --mint:#84edc6;
  --pink:#ff88ae;
  --gold:#ffd27e;

  --term-green:#7CFFB2;
  --mono:"DM Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --display:"Space Grotesk",ui-sans-serif,system-ui,"Segoe UI",sans-serif;

  --shadow:rgba(0,0,0,.48);
}

body.light{
  --bg:#edf5fd;
  --bg2:#dbe8f7;
  --panel:rgba(255,255,255,.62);
  --panel-strong:rgba(255,255,255,.82);
  --text:#152033;
  --muted:#5e6d83;
  --line:rgba(40,65,100,.14);

  --cyan:#1182b8;
  --cyan2:#3ba9d5;
  --violet:#6754ca;
  --mint:#198d6c;
  --pink:#c94e77;
  --gold:#b57a00;

  --shadow:rgba(52,75,110,.18);
}

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

html{
  scroll-behavior:smooth;
}

body{
  min-height:100vh;
  overflow-x:hidden;
  color:var(--text);
  font-family:var(--display);
  background:
    radial-gradient(circle at 12% 4%,rgba(115,216,255,.13),transparent 27%),
    radial-gradient(circle at 90% 17%,rgba(159,140,255,.12),transparent 28%),
    radial-gradient(circle at 50% 100%,rgba(132,237,198,.08),transparent 36%),
    linear-gradient(180deg,var(--bg),var(--bg2));
  transition:background .7s ease,color .45s ease;
  position:relative;
}

a{
  color:inherit;
}

button{
  font:inherit;
}

::selection{
  background:rgba(115,216,255,.22);
  color:var(--text);
}

/* ---------- Fixed cinematic layers ---------- */

#spaceCanvas,
#bioCanvas{
  position:fixed;
  inset:0;
  width:100%;
  height:100%;
  pointer-events:none;
}

#spaceCanvas{
  z-index:0;
}

#bioCanvas{
  z-index:1;
  opacity:.9;
}

.nebula{
  position:fixed;
  width:42vw;
  height:42vw;
  min-width:340px;
  min-height:340px;
  border-radius:50%;
  filter:blur(100px);
  pointer-events:none;
  z-index:0;
  opacity:.15;
  mix-blend-mode:screen;
  animation:nebulaFloat 18s ease-in-out infinite;
}

.nebula.one{
  top:-18vw;
  left:-12vw;
  background:var(--cyan);
}

.nebula.two{
  top:28vh;
  right:-15vw;
  background:var(--violet);
  animation-delay:-6s;
  animation-duration:24s;
}

.nebula.three{
  left:22vw;
  bottom:-22vw;
  background:var(--mint);
  animation-delay:-12s;
  animation-duration:27s;
}

@keyframes nebulaFloat{
  0%,100%{transform:translate3d(0,0,0) scale(1);}
  50%{transform:translate3d(70px,35px,0) scale(1.14);}
}

/* soft scan atmosphere */
.atmosphere{
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:4;
  opacity:.22;
  background:
    linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px);
  background-size:100% 4px;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.8),transparent 80%);
  -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,.8),transparent 80%);
}

/* scroll progress */
#scrollProgress{
  position:fixed;
  top:0;
  left:0;
  width:0%;
  height:3px;
  background:linear-gradient(90deg,var(--cyan),var(--violet),var(--mint));
  box-shadow:0 0 14px var(--cyan);
  z-index:1000;
}

/* ---------- top-right controls ---------- */

.top-controls{
  position:fixed;
  top:16px;
  right:16px;
  z-index:100;
  display:flex;
  align-items:center;
  gap:9px;
}

.visit-counter-fixed{
  display:flex;
  align-items:center;
  gap:9px;
  padding:9px 15px;
  border:1px solid rgba(124,255,178,.28);
  border-radius:999px;
  background:rgba(5,9,16,.58);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  box-shadow:0 10px 30px var(--shadow),0 0 18px rgba(124,255,178,.08);
  font-family:var(--mono);
  transition:.35s ease;
}

body.light .visit-counter-fixed{
  background:rgba(255,255,255,.62);
}

.visit-counter-fixed:hover{
  transform:translateY(-2px);
  border-color:rgba(124,255,178,.5);
}

.status-dot{
  width:7px;
  height:7px;
  border-radius:50%;
  display:inline-block;
  flex:0 0 auto;
  background:var(--mint);
  box-shadow:0 0 10px var(--mint);
  animation:blink 1.5s ease-in-out infinite;
}

@keyframes blink{
  0%,100%{opacity:.45;transform:scale(.9);}
  50%{opacity:1;transform:scale(1.35);}
}

.vcf-label{
  font-size:.61rem;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--muted);
}

.vcf-number{
  min-width:5ch;
  text-align:right;
  font-size:.83rem;
  font-weight:700;
  letter-spacing:.05em;
  color:var(--term-green);
  text-shadow:0 0 10px rgba(124,255,178,.48);
}

.theme-toggle{
  width:56px;
  height:31px;
  border:1px solid var(--line);
  border-radius:999px;
  background:rgba(5,9,16,.58);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  cursor:pointer;
  position:relative;
  box-shadow:0 10px 30px var(--shadow);
  transition:.35s ease;
}

body.light .theme-toggle{
  background:rgba(255,255,255,.62);
}

.theme-toggle:hover{
  transform:translateY(-2px);
  border-color:var(--cyan);
}

.theme-toggle::before,
.theme-toggle::after{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  font-size:11px;
  opacity:.6;
}

.theme-toggle::before{
  content:"☾";
  left:8px;
}

.theme-toggle::after{
  content:"☼";
  right:8px;
}

.toggle-knob{
  position:absolute;
  top:3px;
  left:4px;
  width:23px;
  height:23px;
  border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#fff,var(--cyan));
  box-shadow:0 0 16px rgba(115,216,255,.75);
  transition:left .48s cubic-bezier(.34,1.56,.64,1),background .35s ease,box-shadow .35s ease;
  z-index:2;
}

body.light .toggle-knob{
  left:28px;
  background:radial-gradient(circle at 35% 30%,#fff3bf,#ffb04e);
  box-shadow:0 0 16px rgba(255,176,78,.55);
}

/* ---------- Hero ---------- */

header{
  min-height:100vh;
  position:relative;
  z-index:5;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:115px 24px 95px;
}

header::before{
  content:"";
  position:absolute;
  width:min(720px,88vw);
  height:min(720px,88vw);
  left:50%;
  top:11%;
  transform:translateX(-50%);
  border-radius:50%;
  background:
    radial-gradient(circle,
      rgba(115,216,255,.08) 0 20%,
      rgba(159,140,255,.06) 35%,
      transparent 68%);
  filter:blur(25px);
  animation:heroHalo 9s ease-in-out infinite;
  pointer-events:none;
  z-index:-1;
}

@keyframes heroHalo{
  0%,100%{transform:translateX(-50%) scale(1);opacity:.65;}
  50%{transform:translateX(-50%) scale(1.08);opacity:1;}
}

header .eyebrow{
  display:inline-flex;
  align-items:center;
  gap:10px;
  margin-bottom:24px;
  font-family:var(--mono);
  font-size:.7rem;
  letter-spacing:.29em;
  text-transform:uppercase;
  color:var(--cyan);
  opacity:.86;
}

/* ---------- Central biology × astronomy system ---------- */

.zygote-system{
  width:330px;
  height:330px;
  position:relative;
  margin-bottom:24px;
  display:grid;
  place-items:center;
  transform:translateZ(0);
}

/* central biological membrane */
.cell{
  position:relative;
  width:148px;
  height:148px;
  border-radius:50%;
  display:grid;
  place-items:center;
  overflow:visible;
  background:
    radial-gradient(circle at 35% 30%,
      rgba(255,255,255,.98) 0 7%,
      rgba(189,240,255,.96) 11%,
      rgba(115,216,255,.44) 38%,
      rgba(115,216,255,.12) 62%,
      rgba(115,216,255,.03) 72%,
      transparent 74%);
  border:1px solid rgba(205,244,255,.48);
  box-shadow:
    0 0 32px rgba(115,216,255,.28),
    0 0 80px rgba(115,216,255,.16),
    inset 0 0 35px rgba(255,255,255,.18);
  animation:cellPulse 5.5s ease-in-out infinite,cellBreathe 7s ease-in-out infinite;
}

.cell::before{
  content:"";
  position:absolute;
  inset:-10px;
  border-radius:50%;
  border:1px solid rgba(115,216,255,.23);
  box-shadow:0 0 18px rgba(115,216,255,.12);
  animation:membrane 4.5s ease-in-out infinite;
}

.cell::after{
  content:"";
  position:absolute;
  inset:-22px;
  border-radius:50%;
  border:1px dashed rgba(159,140,255,.18);
  animation:membraneSpin 16s linear infinite;
}

@keyframes cellPulse{
  0%,100%{
    box-shadow:
      0 0 32px rgba(115,216,255,.24),
      0 0 70px rgba(115,216,255,.12),
      inset 0 0 35px rgba(255,255,255,.16);
  }
  50%{
    box-shadow:
      0 0 60px rgba(115,216,255,.42),
      0 0 115px rgba(159,140,255,.16),
      inset 0 0 48px rgba(255,255,255,.24);
  }
}

@keyframes cellBreathe{
  0%,100%{transform:translateY(0) scale(1);}
  50%{transform:translateY(-8px) scale(1.025);}
}

@keyframes membrane{
  0%,100%{transform:scale(.96);opacity:.3;}
  50%{transform:scale(1.08);opacity:.75;}
}

@keyframes membraneSpin{
  to{transform:rotate(360deg);}
}

/* nucleus */
.nucleus{
  position:absolute;
  width:56px;
  height:56px;
  border-radius:50%;
  background:
    radial-gradient(circle at 33% 28%,
      #fff 0 5%,
      #d9cbff 10%,
      #a995ff 40%,
      rgba(159,140,255,.2) 70%,
      transparent 72%);
  box-shadow:
    0 0 24px rgba(169,149,255,.65),
    0 0 50px rgba(169,149,255,.25);
  animation:nucleusDrift 6s ease-in-out infinite;
  z-index:2;
}

@keyframes nucleusDrift{
  0%,100%{transform:translate(-7px,-4px);}
  30%{transform:translate(6px,-7px);}
  60%{transform:translate(9px,6px);}
  100%{transform:translate(-7px,-4px);}
}

/* little organelles */
.organelle{
  position:absolute;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.22);
  opacity:.8;
  filter:drop-shadow(0 0 6px currentColor);
}

.organelle.a{width:18px;height:11px;left:33px;top:40px;color:var(--mint);transform:rotate(30deg);animation:orgA 4s ease-in-out infinite;}
.organelle.b{width:13px;height:20px;right:27px;top:47px;color:var(--pink);transform:rotate(-22deg);animation:orgB 5s ease-in-out infinite;}
.organelle.c{width:15px;height:9px;left:28px;bottom:36px;color:var(--gold);transform:rotate(-15deg);animation:orgC 4.8s ease-in-out infinite;}

@keyframes orgA{50%{transform:translate(9px,-6px) rotate(50deg);}}
@keyframes orgB{50%{transform:translate(-7px,8px) rotate(-2deg);}}
@keyframes orgC{50%{transform:translate(8px,5px) rotate(14deg);}}

/* orbital paths = electron shells / planetary orbits */
.shell{
  position:absolute;
  left:50%;
  top:50%;
  border:1px solid rgba(115,216,255,.2);
  border-radius:50%;
  transform-origin:center;
  pointer-events:none;
}

.shell.s1{
  width:220px;
  height:82px;
  margin-left:-110px;
  margin-top:-41px;
  transform:rotate(24deg);
  animation:shellRotate1 18s linear infinite;
}

.shell.s2{
  width:268px;
  height:122px;
  margin-left:-134px;
  margin-top:-61px;
  transform:rotate(-29deg);
  border-color:rgba(159,140,255,.2);
  animation:shellRotate2 24s linear infinite reverse;
}

.shell.s3{
  width:300px;
  height:178px;
  margin-left:-150px;
  margin-top:-89px;
  transform:rotate(68deg);
  border-color:rgba(132,237,198,.14);
  animation:shellRotate3 32s linear infinite;
}

@keyframes shellRotate1{to{rotate:360deg;}}
@keyframes shellRotate2{to{rotate:360deg;}}
@keyframes shellRotate3{to{rotate:360deg;}}

/* actual electrons */
.electron{
  position:absolute;
  width:10px;
  height:10px;
  border-radius:50%;
  background:#e8fbff;
  box-shadow:0 0 7px #fff,0 0 18px currentColor,0 0 30px currentColor;
  z-index:5;
}

.electron.e1{
  color:var(--cyan);
  left:50%;
  top:50%;
  transform-origin:0 0;
  animation:electron1 3.2s linear infinite;
}

.electron.e2{
  color:var(--violet);
  left:50%;
  top:50%;
  animation:electron2 4.7s linear infinite reverse;
}

.electron.e3{
  color:var(--mint);
  left:50%;
  top:50%;
  animation:electron3 6.5s linear infinite;
}

@keyframes electron1{
  from{transform:rotate(0deg) translateX(112px);}
  to{transform:rotate(360deg) translateX(112px);}
}

@keyframes electron2{
  from{transform:rotate(0deg) translateX(134px) scale(.88);}
  to{transform:rotate(360deg) translateX(134px) scale(.88);}
}

@keyframes electron3{
  from{transform:rotate(0deg) translateX(150px) scale(.74);}
  to{transform:rotate(360deg) translateX(150px) scale(.74);}
}

/* tiny satellites around the biological system */
.micro-particle{
  position:absolute;
  width:5px;
  height:5px;
  border-radius:50%;
  opacity:.8;
}

.micro-particle.p1{top:38px;left:72px;background:var(--cyan);box-shadow:0 0 14px var(--cyan);animation:micro1 5s ease-in-out infinite;}
.micro-particle.p2{right:41px;top:109px;background:var(--pink);box-shadow:0 0 14px var(--pink);animation:micro2 6s ease-in-out infinite;}
.micro-particle.p3{left:56px;bottom:53px;background:var(--gold);box-shadow:0 0 14px var(--gold);animation:micro3 4s ease-in-out infinite;}

@keyframes micro1{50%{transform:translate(18px,-12px) scale(1.5);}}
@keyframes micro2{50%{transform:translate(-11px,16px) scale(1.4);}}
@keyframes micro3{50%{transform:translate(18px,7px) scale(1.3);}}

/* DNA ribbon */
.dna-ribbon{
  position:absolute;
  width:70px;
  height:210px;
  right:-55px;
  top:62px;
  opacity:.52;
  transform:rotate(8deg);
  filter:drop-shadow(0 0 8px rgba(115,216,255,.16));
}

.dna-strand{
  position:absolute;
  left:50%;
  top:0;
  width:2px;
  height:100%;
  transform-origin:center;
}

.dna-strand.a{
  background:linear-gradient(var(--cyan),transparent 50%,var(--violet));
  animation:dnaWave 3.8s ease-in-out infinite;
}

.dna-strand.b{
  background:linear-gradient(var(--violet),transparent 50%,var(--mint));
  animation:dnaWave 3.8s ease-in-out infinite reverse;
}

.dna-bar{
  position:absolute;
  left:50%;
  width:36px;
  height:1px;
  background:linear-gradient(90deg,var(--cyan),var(--violet));
  transform-origin:center;
  opacity:.65;
}

@keyframes dnaWave{
  0%,100%{transform:translateX(-13px) skewY(-5deg);}
  50%{transform:translateX(13px) skewY(5deg);}
}

/* ---------- Hero copy ---------- */

header h1{
  font-size:clamp(3.2rem,8.5vw,7rem);
  line-height:.94;
  letter-spacing:-.055em;
  font-weight:600;
  background:linear-gradient(100deg,var(--text),var(--cyan2),var(--violet),var(--text));
  background-size:250% 100%;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  animation:titleFlow 10s linear infinite;
}

@keyframes titleFlow{
  from{background-position:0% 50%;}
  to{background-position:250% 50%;}
}

header p.hero-description{
  max-width:760px;
  margin:27px auto 0;
  color:var(--muted);
  font-size:1.05rem;
  line-height:1.95;
}

.build-tag{
  margin-top:18px;
  color:var(--muted);
  opacity:.65;
  font-family:var(--mono);
  font-size:.71rem;
  letter-spacing:.04em;
}

.status-ok{
  color:var(--term-green);
  text-shadow:0 0 8px rgba(124,255,178,.45);
}

.scroll-indicator{
  position:absolute;
  bottom:28px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:9px;
  color:var(--muted);
  font-family:var(--mono);
  font-size:.57rem;
  letter-spacing:.2em;
  text-transform:uppercase;
  opacity:.7;
  animation:scrollHint 2.6s ease-in-out infinite;
}

.scroll-line{
  width:1px;
  height:42px;
  background:linear-gradient(var(--cyan),transparent);
}

@keyframes scrollHint{
  0%,100%{transform:translateY(0);opacity:.45;}
  50%{transform:translateY(8px);opacity:1;}
}

/* ---------- Divider ---------- */

.divider{
  width:min(560px,78vw);
  height:1px;
  margin:0 auto 72px;
  background:linear-gradient(90deg,transparent,var(--cyan),var(--violet),var(--mint),transparent);
  box-shadow:0 0 14px rgba(115,216,255,.18);
  opacity:.55;
  position:relative;
  z-index:5;
}

/* ---------- Main ---------- */

main{
  width:min(1000px,92vw);
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:22px;
  position:relative;
  z-index:5;
  padding-bottom:80px;
}

/* a faint biological/cosmic spine behind cards */
main::before{
  content:"";
  position:absolute;
  left:28px;
  top:0;
  bottom:0;
  width:1px;
  background:linear-gradient(to bottom,transparent,var(--cyan),var(--violet),var(--mint),transparent);
  opacity:.18;
  pointer-events:none;
}

/* ---------- Cards ---------- */

.artifact{
  display:flex;
  align-items:center;
  gap:25px;
  padding:29px 35px;
  border:1px solid var(--line);
  border-radius:26px;
  background:
    linear-gradient(135deg,var(--panel),rgba(255,255,255,.015));
  backdrop-filter:blur(22px);
  -webkit-backdrop-filter:blur(22px);
  color:inherit;
  text-decoration:none;
  position:relative;
  overflow:hidden;

  opacity:0;
  transform:translateY(70px) scale(.97);
  filter:blur(4px);

  transition:
    transform .65s cubic-bezier(.2,.8,.2,1),
    opacity .7s ease,
    filter .7s ease,
    border-color .4s ease,
    box-shadow .5s ease,
    background .5s ease;
}

.artifact.reveal{
  opacity:1;
  transform:translateY(0) scale(1);
  filter:blur(0);
}

.artifact:nth-child(1){transition-delay:.03s;}
.artifact:nth-child(2){transition-delay:.10s;}
.artifact:nth-child(3){transition-delay:.17s;}
.artifact:nth-child(4){transition-delay:.24s;}
.artifact:nth-child(5){transition-delay:.31s;}
.artifact:nth-child(6){transition-delay:.38s;}
.artifact:nth-child(7){transition-delay:.45s;}
.artifact:nth-child(8){transition-delay:.52s;}

.artifact::before{
  content:"";
  position:absolute;
  width:360px;
  height:360px;
  left:-250px;
  top:-250px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(115,216,255,.13),transparent 68%);
  transition:transform 1s ease;
}

.artifact::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(120deg,transparent 22%,rgba(255,255,255,.07),transparent 78%);
  transform:translateX(-125%);
  transition:transform 1.2s ease;
}

.artifact:hover{
  transform:translateY(-9px) scale(1.012);
  border-color:rgba(115,216,255,.34);
  box-shadow:0 24px 80px var(--shadow),0 0 40px rgba(115,216,255,.07);
}

.artifact:hover::before{
  transform:translate3d(340px,180px,0);
}

.artifact:hover::after{
  transform:translateX(125%);
}

.artifact-icon{
  width:62px;
  height:62px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  position:relative;
  border-radius:50%;
  border:1px solid currentColor;
  background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.11),rgba(255,255,255,.015));
  box-shadow:0 0 25px currentColor;
  transition:transform .5s cubic-bezier(.34,1.56,.64,1);
}

.artifact-icon::before{
  content:"";
  position:absolute;
  inset:-8px;
  border-radius:50%;
  border:1px dashed currentColor;
  opacity:.32;
  animation:iconOrbit 16s linear infinite;
}

.artifact-icon::after{
  content:"";
  position:absolute;
  inset:7px;
  border-radius:50%;
  border-top:1px solid currentColor;
  opacity:.3;
  animation:iconOrbit 9s linear infinite reverse;
}

@keyframes iconOrbit{
  to{rotate:360deg;}
}

.artifact:hover .artifact-icon{
  transform:scale(1.1) rotate(8deg);
}

.artifact-icon svg{
  width:27px;
  height:27px;
  stroke:currentColor;
  position:relative;
  z-index:2;
}

.artifact-text{
  min-width:0;
  flex:1;
  position:relative;
  z-index:2;
}

.artifact-text > span{
  display:block;
  margin-bottom:10px;
  font-family:var(--mono);
  font-size:.68rem;
  letter-spacing:.21em;
  text-transform:uppercase;
  color:var(--cyan);
  opacity:.95;
}

.artifact h2{
  margin-bottom:10px;
  font-size:1.58rem;
  line-height:1.2;
  font-weight:600;
}

.artifact p{
  max-width:650px;
  color:var(--muted);
  font-size:.97rem;
  line-height:1.72;
}

.artifact-index{
  position:absolute;
  right:34px;
  top:18px;
  font-family:var(--mono);
  font-size:.62rem;
  letter-spacing:.15em;
  color:var(--muted);
  opacity:.42;
}

.arrow{
  position:absolute;
  right:34px;
  top:50%;
  transform:translate(-12px,-50%);
  color:var(--cyan);
  font-size:1.4rem;
  opacity:0;
  transition:.4s ease;
  z-index:3;
}

.artifact:hover .arrow{
  opacity:1;
  transform:translate(0,-50%);
}

/* ---------- Footer ---------- */

footer{
  position:relative;
  z-index:5;
  padding:100px 20px 65px;
  text-align:center;
  color:var(--muted);
  font-family:var(--mono);
  font-size:.78rem;
  letter-spacing:.07em;
}

.footer-system{
  width:180px;
  height:70px;
  position:relative;
  margin:0 auto 25px;
}

.footer-orbit{
  position:absolute;
  inset:0;
  border:1px solid var(--line);
  border-radius:50%;
  animation:iconOrbit 14s linear infinite;
}

.footer-orbit::after{
  content:"";
  position:absolute;
  width:8px;
  height:8px;
  border-radius:50%;
  top:-4px;
  left:50%;
  background:var(--cyan);
  box-shadow:0 0 15px var(--cyan);
}

.footer-cell{
  position:absolute;
  width:34px;
  height:34px;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  border-radius:50%;
  background:radial-gradient(circle,#fff 0 7%,var(--cyan) 18%,rgba(115,216,255,.08) 65%,transparent 70%);
  box-shadow:0 0 20px rgba(115,216,255,.35);
  animation:cellPulse 4s ease-in-out infinite;
}

/* ---------- responsive ---------- */

@media(max-width:700px){

  .top-controls{
    top:11px;
    right:11px;
    gap:7px;
  }

  .visit-counter-fixed{
    padding:7px 10px;
  }

  .vcf-label{
    display:none;
  }

  .theme-toggle{
    width:52px;
    height:29px;
  }

  .toggle-knob{
    width:21px;
    height:21px;
  }

  body.light .toggle-knob{
    left:27px;
  }

  header{
    padding-top:96px;
  }

  .zygote-system{
    transform:scale(.79);
    margin-top:-18px;
    margin-bottom:-5px;
  }

  header h1{
    font-size:clamp(3rem,15vw,5rem);
  }

  header p.hero-description{
    font-size:.96rem;
    line-height:1.8;
  }

  .artifact{
    padding:23px 21px;
    gap:17px;
    border-radius:22px;
  }

  .artifact-icon{
    width:49px;
    height:49px;
  }

  .artifact-icon svg{
    width:21px;
    height:21px;
  }

  .artifact-text > span{
    font-size:.58rem;
    letter-spacing:.12em;
  }

  .artifact h2{
    font-size:1.18rem;
  }

  .artifact p{
    font-size:.88rem;
    line-height:1.62;
  }

  .artifact-index,
  .arrow{
    display:none;
  }

  main::before{
    display:none;
  }

  .dna-ribbon{
    display:none;
  }

  .scroll-indicator{
    display:none;
  }
}

@media(prefers-reduced-motion:reduce){

  *,
  *::before,
  *::after{
    animation-duration:.001ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.001ms !important;
    scroll-behavior:auto !important;
  }

  #spaceCanvas,
  #bioCanvas{
    display:none;
  }
}
</style>
</head>

<body>

<div id="scrollProgress"></div>

<canvas id="spaceCanvas" aria-hidden="true"></canvas>
<canvas id="bioCanvas" aria-hidden="true"></canvas>

<div class="nebula one"></div>
<div class="nebula two"></div>
<div class="nebula three"></div>

<div class="atmosphere"></div>

<!-- =====================================================
     TOP CONTROLS — original visit counter preserved
===================================================== -->

<div class="top-controls">

  <div class="visit-counter-fixed" id="visitCounter">

    <span class="status-dot"></span>

    <span class="vcf-label">
      Number of Visits
    </span>

    <span class="vcf-number" id="visitNumber">
      ------
    </span>

  </div>

  <button
    class="theme-toggle"
    id="themeToggle"
    type="button"
    aria-label="Toggle dark and light mode"
    title="Toggle dark and light mode"
  >
    <span class="toggle-knob"></span>
  </button>

</div>

<!-- =====================================================
     HERO
===================================================== -->

<header>

  <p class="eyebrow">
    <span class="status-dot"></span>
    Experimental Lab
  </p>

  <!--
    Biology + Astronomy centerpiece:
    the membrane/cell is the "zygote",
    the nucleus is its biological core,
    the orbiting particles are electron-like satellites,
    and the orbit system deliberately resembles a miniature planetary system.
  -->

  <div class="zygote-system" aria-hidden="true">

    <div class="shell s1"></div>
    <div class="shell s2"></div>
    <div class="shell s3"></div>

    <div class="electron e1"></div>
    <div class="electron e2"></div>
    <div class="electron e3"></div>

    <div class="cell">

      <div class="organelle a"></div>
      <div class="organelle b"></div>
      <div class="organelle c"></div>

      <div class="nucleus"></div>

    </div>

    <div class="micro-particle p1"></div>
    <div class="micro-particle p2"></div>
    <div class="micro-particle p3"></div>

    <!-- DNA -->
    <div class="dna-ribbon">
      <div class="dna-strand a"></div>
      <div class="dna-strand b"></div>

      <span class="dna-bar" style="top:12px;"></span>
      <span class="dna-bar" style="top:30px;"></span>
      <span class="dna-bar" style="top:48px;"></span>
      <span class="dna-bar" style="top:66px;"></span>
      <span class="dna-bar" style="top:84px;"></span>
      <span class="dna-bar" style="top:102px;"></span>
      <span class="dna-bar" style="top:120px;"></span>
      <span class="dna-bar" style="top:138px;"></span>
      <span class="dna-bar" style="top:156px;"></span>
      <span class="dna-bar" style="top:174px;"></span>
      <span class="dna-bar" style="top:192px;"></span>
    </div>

  </div>

  <h1>Zygote Builder</h1>

  <p class="hero-description">
    A collection of thought experiments disguised as simulations.<br>
    Not finished. Not optimized. Not 'the best'. It's a 'thing'.
  </p>

  <p class="build-tag">
    // stack: three.js + cannon.js · render: static · status:
    <span class="status-ok">operational</span>
  </p>

  <div class="scroll-indicator">
    <span>Explore</span>
    <div class="scroll-line"></div>
  </div>

</header>

<div class="divider"></div>

<!-- =====================================================
     PROJECTS — ORIGINAL CONTENT PRESERVED
===================================================== -->

<main>

  <!-- N.08 -->
  <a class="artifact" href="./Astronomy.html">

    <div class="artifact-icon" style="color:#6dd5fa">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4.5"></circle>
        <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(-20 12 12)"></ellipse>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Explore Galaxies Online.</span>
      <h2>Intergalactic Cartography</h2>
      <p>Imaginary Universe for Astronomy Enthusiasts</p>
    </div>

    <span class="artifact-index">N.08</span>
    <span class="arrow">&rarr;</span>

  </a>

  <!-- N.07 -->
  <a class="artifact" href="./ZygoteBlocks.html">

    <div class="artifact-icon" style="color:#6dd5fa">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="8.5" y="4" width="7" height="7"></rect>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Curiousity of Structure</span>
      <h2>Zygote Blocks</h2>
      <p>Reliving our childhood - Stack the blocks!</p>
    </div>

    <span class="artifact-index">N.07</span>
    <span class="arrow">&rarr;</span>

  </a>

  <!-- N.06 -->
  <a class="artifact" href="./Trajectory%20Lab.html">

    <div class="artifact-icon" style="color:#7f7fd5">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 20h18M3 20V4"></path>
        <path d="M4 18c4-2 8-2 10-8s5-6 7-4"></path>
        <circle cx="14" cy="7" r="1.1" fill="currentColor" stroke="none"></circle>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Physics</span>
      <h2>Trajectory Lab</h2>
      <p>Simply projectile motion. No doubts left.</p>
    </div>

    <span class="artifact-index">N.06</span>
    <span class="arrow">&rarr;</span>

  </a>

  <!-- N.05 -->
  <a class="artifact" href="./Clean%20Park%20Game.html">

    <div class="artifact-icon" style="color:#91eac9">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"></path>
        <path d="M10 11v6M14 11v6"></path>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Behavioral System</span>
      <h2>Clean Park Game</h2>
      <p>Incentives, decay, and the uncomfortable truth that morality behaves differently in crowds.</p>
    </div>

    <span class="artifact-index">N.05</span>
    <span class="arrow">&rarr;</span>

  </a>

  <!-- N.04 -->
  <a class="artifact" href="./Comparison%20Matrix.html">

    <div class="artifact-icon" style="color:#f5a742">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="8" height="8"></rect>
        <rect x="13" y="3" width="8" height="8"></rect>
        <rect x="3" y="13" width="8" height="8"></rect>
        <rect x="13" y="13" width="8" height="8"></rect>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Cognitive Tool</span>
      <h2>Comparison Matrix</h2>
      <p>When intuition fails, structure steps in — not to decide, but to reveal trade-offs you were avoiding.</p>
    </div>

    <span class="artifact-index">N.04</span>
    <span class="arrow">&rarr;</span>

  </a>

  <!-- N.03 -->
  <a class="artifact" href="./Mirror%20Simulator.html">

    <div class="artifact-icon" style="color:#ff6f91">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l7 18H5z"></path>
        <path d="M12 21V3" stroke-dasharray="2 2"></path>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Perception Probe</span>
      <h2>Mirror Simulator</h2>
      <p>Observation alters outcomes. The mirror is not neutral. Neither are you.</p>
    </div>

    <span class="artifact-index">N.03</span>
    <span class="arrow">&rarr;</span>

  </a>

  <!-- N.02 -->
  <a class="artifact" href="./News%20Headlines.html">

    <div class="artifact-icon" style="color:#c792ea">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="1"></rect>
        <path d="M8 8h8M8 12h8M8 16h5"></path>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Narrative Experiment</span>
      <h2>News Headlines</h2>
      <p>Same facts. Different frames. Watch reality bend without breaking.</p>
    </div>

    <span class="artifact-index">N.02</span>
    <span class="arrow">&rarr;</span>

  </a>

  <!-- N.01 -->
  <a class="artifact" href="./Success%20Probability.html">

    <div class="artifact-icon" style="color:#69f0ae">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 19h18"></path>
        <path d="M4 19c3-1 4-13 8-13s5 12 8 13"></path>
      </svg>
    </div>

    <div class="artifact-text">
      <span>Flawed Model</span>
      <h2>Success Probability</h2>
      <p>Effort, luck, burnout, noise — simplified until the simplification itself becomes the lesson.</p>
    </div>

    <span class="artifact-index">N.01</span>
    <span class="arrow">&rarr;</span>

  </a>

</main>

<footer>

  <div class="footer-system">
    <div class="footer-orbit"></div>
    <div class="footer-cell"></div>
  </div>

  Zygote is a beginning, not a destination.

</footer>

<script>
/* =========================================================
   THEME
========================================================= */

const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme){
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem("zygote-theme", theme);
}

const savedTheme = localStorage.getItem("zygote-theme");

if(savedTheme){
  applyTheme(savedTheme);
}else if(window.matchMedia("(prefers-color-scheme: light)").matches){
  applyTheme("light");
}

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  applyTheme(isLight ? "dark" : "light");
});

/* =========================================================
   SCROLL PROGRESS + SCROLL-REACTIVE COSMOS
========================================================= */

const progress = document.getElementById("scrollProgress");
let targetScroll = window.scrollY;
let smoothScroll = window.scrollY;

window.addEventListener("scroll", () => {
  targetScroll = window.scrollY;

  const max =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;

  progress.style.width = pct + "%";
}, {passive:true});

/* =========================================================
   REVEAL CARDS
========================================================= */

const artifacts = document.querySelectorAll(".artifact");

const revealObserver = new IntersectionObserver((entries) => {

  entries.forEach((entry) => {

    if(entry.isIntersecting){
      entry.target.classList.add("reveal");
      revealObserver.unobserve(entry.target);
    }

  });

}, {
  threshold:.12,
  rootMargin:"0px 0px -50px 0px"
});

artifacts.forEach(card => revealObserver.observe(card));

/* =========================================================
   BACKGROUND SPACE CANVAS
   Stars slowly drift with depth/parallax.
========================================================= */

const spaceCanvas = document.getElementById("spaceCanvas");
const sctx = spaceCanvas.getContext("2d");

let sw = 0;
let sh = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

const stars = [];
const STAR_COUNT = 190;

function resizeSpace(){

  sw = window.innerWidth;
  sh = window.innerHeight;

  spaceCanvas.width = Math.floor(sw * dpr);
  spaceCanvas.height = Math.floor(sh * dpr);
  spaceCanvas.style.width = sw + "px";
  spaceCanvas.style.height = sh + "px";

  sctx.setTransform(dpr,0,0,dpr,0,0);
}

resizeSpace();
window.addEventListener("resize", resizeSpace);

function randomStar(){

  return {
    x: Math.random() * sw,
    y: Math.random() * sh,
    z: .15 + Math.random() * .85,
    r: .35 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
    twinkle: .4 + Math.random() * 1.5
  };
}

for(let i = 0; i < STAR_COUNT; i++){
  stars.push(randomStar());
}

/* pointer makes the starfield breathe slightly */
let pointerX = 0;
let pointerY = 0;

window.addEventListener("pointermove", (e) => {
  pointerX = (e.clientX / sw - .5) * 2;
  pointerY = (e.clientY / sh - .5) * 2;
}, {passive:true});

function drawSpace(time){

  sctx.clearRect(0,0,sw,sh);

  const dark = !document.body.classList.contains("light");

  for(const star of stars){

    star.y += .015 * star.z;

    if(star.y > sh + 4){
      star.y = -4;
      star.x = Math.random() * sw;
    }

    const px = star.x - pointerX * star.z * 12;
    const py = star.y - pointerY * star.z * 7;

    const alpha =
      (dark ? .35 : .18) +
      Math.sin(time * 0.001 * star.twinkle + star.phase) * .18;

    sctx.beginPath();
    sctx.fillStyle =
      `rgba(235,245,255,${Math.max(.05,alpha)})`;

    sctx.arc(px,py,star.r * star.z,0,Math.PI*2);
    sctx.fill();
  }

  requestAnimationFrame(drawSpace);
}

requestAnimationFrame(drawSpace);

/* =========================================================
   BIOLOGY CANVAS
   Neural/cellular filaments drift behind the cards.
========================================================= */

const bioCanvas = document.getElementById("bioCanvas");
const bctx = bioCanvas.getContext("2d");

let bw = 0;
let bh = 0;

function resizeBio(){

  bw = window.innerWidth;
  bh = window.innerHeight;

  bioCanvas.width = Math.floor(bw * dpr);
  bioCanvas.height = Math.floor(bh * dpr);
  bioCanvas.style.width = bw + "px";
  bioCanvas.style.height = bh + "px";

  bctx.setTransform(dpr,0,0,dpr,0,0);
}

resizeBio();
window.addEventListener("resize", resizeBio);

const filaments = [];

for(let i=0;i<13;i++){

  filaments.push({
    x: Math.random() * bw,
    y: Math.random() * bh,
    length: 70 + Math.random() * 180,
    amplitude: 8 + Math.random() * 20,
    speed: .00035 + Math.random() * .0004,
    phase: Math.random()*Math.PI*2
  });

}

function drawBio(time){

  bctx.clearRect(0,0,bw,bh);

  const light = document.body.classList.contains("light");

  bctx.lineWidth = 1;

  filaments.forEach((f,i) => {

    bctx.beginPath();

    for(let j=0;j<=70;j++){

      const t = j/70;

      const x =
        f.x +
        t * f.length;

      const y =
        f.y +
        Math.sin(
          t * Math.PI * 4 +
          time * f.speed +
          f.phase
        ) * f.amplitude;

      if(j===0){
        bctx.moveTo(x,y);
      }else{
        bctx.lineTo(x,y);
      }
    }

    bctx.strokeStyle =
      light
      ? `rgba(55,115,155,${.045 + (i%3)*.01})`
      : `rgba(115,216,255,${.045 + (i%3)*.015})`;

    bctx.stroke();

    /* cell-like nodes */
    for(let k=1;k<5;k++){

      const t = k/5;

      const x =
        f.x +
        t * f.length;

      const y =
        f.y +
        Math.sin(
          t * Math.PI * 4 +
          time * f.speed +
          f.phase
        ) * f.amplitude;

      bctx.beginPath();

      bctx.fillStyle =
        light
        ? "rgba(65,145,165,.15)"
        : "rgba(132,237,198,.10)";

      bctx.arc(x,y,2.2,0,Math.PI*2);
      bctx.fill();
    }

  });

  requestAnimationFrame(drawBio);
}

requestAnimationFrame(drawBio);

/* =========================================================
   EXTRA SCROLL MOTION
   Hero orbit system gently reacts to page movement.
========================================================= */

const zygoteSystem =
  document.querySelector(".zygote-system");

const nebulaNodes =
  document.querySelectorAll(".nebula");

function smoothFrame(){

  smoothScroll +=
    (targetScroll - smoothScroll) * .08;

  const heroShift =
    Math.min(smoothScroll,window.innerHeight) * .055;

  if(zygoteSystem){
    zygoteSystem.style.transform =
      `translateY(${-heroShift}px) scale(1)`;
  }

  nebulaNodes.forEach((node,index) => {

    const factor =
      index === 0 ? .025 :
      index === 1 ? -.018 :
      .012;

    node.style.translate =
      `0 ${smoothScroll * factor}px`;

  });

  requestAnimationFrame(smoothFrame);
}

requestAnimationFrame(smoothFrame);

/* =========================================================
   LIVE VISIT COUNTER — ORIGINAL LOGIC PRESERVED
========================================================= */

(function(){

  var COUNTER_KEY =
    "forwardbuilder-github-io-zygote-site-visits-v1";

  var BASE =
    "https://countapi.mileshilliard.com/api/v1";

  var SESSION_FLAG =
    "zygote_visit_counted";

  var el =
    document.getElementById("visitNumber");

  if(!el) return;

  function pad(n){
    return String(n).padStart(6,"0");
  }

  function animateTo(target){

    var startTime = null;
    var duration = 1100;

    function step(ts){

      if(!startTime) startTime = ts;

      var p =
        Math.min(
          (ts-startTime)/duration,
          1
        );

      var eased =
        1 -
        Math.pow(1-p,3);

      el.textContent =
        pad(Math.floor(eased * target));

      if(p < 1){
        requestAnimationFrame(step);
      }else{
        el.textContent = pad(target);
      }

    }

    requestAnimationFrame(step);
  }

  function showFallback(){
    el.textContent = "------";
  }

  var alreadyCountedThisSession =
    sessionStorage.getItem(SESSION_FLAG);

  var endpoint =
    alreadyCountedThisSession
      ? BASE + "/get/" + COUNTER_KEY
      : BASE + "/hit/" + COUNTER_KEY;

  fetch(endpoint)
    .then(function(r){
      return r.json();
    })
    .then(function(data){

      var val =
        parseInt(
          data && data.value,
          10
        );

      if(!isNaN(val)){

        animateTo(val);

        sessionStorage.setItem(
          SESSION_FLAG,
          "1"
        );

      }else{
        showFallback();
      }

    })
    .catch(function(){
      showFallback();
    });

})();
</script>

</body>
</html>
'''

path = Path("/mnt/data/index_zygote_builder_cosmos_biology.html")
path.write_text(html, encoding="utf-8")
print(path)
print(f"{len(html):,} characters")
