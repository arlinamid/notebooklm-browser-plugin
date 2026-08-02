#!/usr/bin/env node
/**
 * Regenerates the Chrome Web Store screenshots — 1280x800, the size the Store
 * requires — by framing the 720x600 popup on a captioned backdrop.
 *
 *   node scripts/build-screenshots.js
 *
 * Every popup change invalidates the existing store images, so run this before
 * any listing update. The sixth image (store-6-inpage.png) shows the extension
 * inside NotebookLM and is captured from a signed-in session by hand — it is
 * not produced here.
 *
 * EXT_ID must match the unpacked id Chrome assigns to this checkout.
 */
const path=require('path'),os=require('os');
const {chromium}=(()=>{
  for (const m of ['playwright','playwright-core','D:/tool/Codex-Chrome/node_modules/playwright']) {
    try { return require(m); } catch {}
  }
  console.error('Playwright not found. npm i -D playwright, then run this again.');
  process.exit(1);
})();
const EXT='D:/tool/notebooklm-browser-plugin', EXT_ID='cljakcgmldhfklcocmplpdmbcpdmckpo';
const OUT=path.join(__dirname,'..','docs','store-screenshots');

// Frames the 720x600 popup as a 1280x800 product shot — the Web Store's size.
const FRAME=(caption,sub)=>`
  document.querySelectorAll('#shotCap').forEach(e=>e.remove());
  if(!document.querySelector('.shot-panel')){
    const panel=document.createElement('div'); panel.className='shot-panel';
    while(document.body.firstChild) panel.appendChild(document.body.firstChild);
    document.body.appendChild(panel);
  }
  const cap=document.createElement('div'); cap.id='shotCap';
  cap.innerHTML='<h1>'+${JSON.stringify(caption)}+'</h1><p>'+${JSON.stringify(sub)}+'</p>';
  document.body.insertBefore(cap, document.querySelector('.shot-panel'));
  let s=document.getElementById('shotStyle');
  if(!s){ s=document.createElement('style'); s.id='shotStyle'; document.head.appendChild(s); }
  s.textContent=\`
    html,body{width:1280px!important;height:800px!important;max-height:none!important;
      overflow:hidden!important;display:flex!important;flex-direction:column!important;
      align-items:center!important;justify-content:center!important;gap:26px!important;
      background:linear-gradient(150deg,#0d1b3e 0%,#17265c 45%,#0f3b78 100%)!important;
      font-family:'Google Sans','Segoe UI',system-ui,sans-serif!important;}
    #shotCap{text-align:center;color:#fff;max-width:920px;}
    #shotCap h1{font-size:30px;font-weight:700;letter-spacing:-.5px;margin:0 0 8px;}
    #shotCap p{font-size:16px;color:rgba(255,255,255,.72);margin:0;line-height:1.45;}
    .shot-panel{width:720px;height:600px;display:flex;flex-direction:column;overflow:hidden;
      border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08);
      background:var(--bg-primary);flex:none;}\`;
`;

(async()=>{
 const ctx=await chromium.launchPersistentContext(path.join(os.tmpdir(),'pa-shot-'+Date.now()),{
   headless:false,viewport:{width:1280,height:800},deviceScaleFactor:1,
   args:[`--disable-extensions-except=${EXT}`,`--load-extension=${EXT}`]});
 const p=ctx.pages()[0]||await ctx.newPage();
 const url=`chrome-extension://${EXT_ID}/popup/popup.html`;
 await p.goto(url); await p.waitForTimeout(2500);

 await p.evaluate(async()=>{
   await paSaveChains([
    {id:'c1',title:'Research, then challenge it',steps:[
      {type:'custom',text:'Summarise the main argument across the selected sources.'},
      {type:'custom',text:'Now list the strongest objections the sources themselves raise.'},
      {type:'custom',text:'What would change your mind? Name the missing evidence.'}]},
    {id:'c2',title:'Study pass for an exam',steps:[
      {type:'custom',text:'Build a study guide for [TOPIC] from the sources.'},
      {type:'custom',text:'Quiz me on the parts I am most likely to get wrong.'}]},
    {id:'c3',title:'Brief, then deck',steps:[
      {type:'custom',text:'Write an executive brief of the findings.'},
      {type:'custom',text:'Turn that brief into a slide outline for a 10-minute talk.'}]}
   ]);
 });

 // railPinned is persisted, so each shot sets it explicitly
 const setRail=async(pinned,lang)=>{
   await p.evaluate(async v=>{await chrome.storage.sync.set({railPinned:v});},pinned);
   if(lang) await p.evaluate(async l=>{await chrome.storage.sync.set({language:l});},lang);
   await p.goto(url); await p.waitForTimeout(2400);
   await p.mouse.move(1150,760);   // keep the pointer off the rail
   await p.waitForTimeout(500);
 };

 const shots=[
  {file:'store-1-library.png',pinned:false,lang:'en',fmt:'audio-overview',
   cap:'229 ready-made prompts, one click away',
   sub:'Browse by format, filter by category and level, and send it straight into NotebookLM.'},
  {file:'store-2-formats.png',pinned:true,lang:'en',fmt:'slide-deck',
   cap:'Every format NotebookLM makes, with live counts',
   sub:'Audio, video, slides, infographics, flashcards, quizzes, reports, tables and chat.'},
  {file:'store-3-chains.png',pinned:false,lang:'en',fmt:'chains',
   cap:'Chain prompts so each answer builds on the last',
   sub:'Research, then dig into what it raised, then ask what it missed — in one click.'},
  {file:'store-4-slides.png',pinned:false,lang:'en',fmt:'slide-deck',
   cap:'62 slide-deck styles, written as full design briefs',
   sub:'Manga, brutalist editorial, neo-noir, magazine spread — palettes and layout rules included.'},
  {file:'store-5-languages.png',pinned:false,lang:'ja',fmt:'audio-overview',
   cap:'Twelve languages — the menus and the prompts themselves',
   sub:'A prompt you cannot read is a prompt you cannot adapt.'}
 ];

 for(const s of shots){
   await setRail(s.pinned,s.lang);
   await p.click(`[data-format="${s.fmt}"]`); await p.waitForTimeout(900);
   await p.mouse.move(1150,760); await p.waitForTimeout(400);
   await p.evaluate(FRAME(s.cap,s.sub)); await p.waitForTimeout(600);
   await p.screenshot({path:path.join(OUT,s.file),clip:{x:0,y:0,width:1280,height:800}});
   console.log(s.file,'  rail',s.pinned?'pinned':'collapsed','| lang',s.lang,'| tab',s.fmt);
 }
 await ctx.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
