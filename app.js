(function(){
  'use strict';
  const entries = window.MEMORY_ENTRIES || [];
  const base = document.body.dataset.base || '';
  const page = document.body.dataset.page;
  const urlFor = p => base + p;
  const $ = selector => document.querySelector(selector);
  const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function scrollProgress(){const range=document.documentElement.scrollHeight-window.innerHeight;$('.progress-line').style.width = (range > 0 ? 100*window.scrollY/range : 0) + '%';}
  window.addEventListener('scroll',scrollProgress,{passive:true});scrollProgress();
  if(page==='home'){
    const cards=$('#storyCards');const empty=$('#emptyState');
    const filters=$$('#categoryNav [data-filter]');
    function render(filter){
      const list=entries.filter(e=>filter==='all'||e.category===filter);
      cards.innerHTML='';empty.hidden=list.length>0;
      list.forEach((e,i)=>{
        const a=document.createElement('a');a.className='story-card';a.href='stories/'+encodeURIComponent(e.slug)+'.html';
        a.innerHTML=`<div class="story-card-image"><img src="${esc(urlFor(e.cover))}" alt="${esc(e.shortTitle)}" loading="lazy"></div><div class="story-card-copy"><p class="story-number">NOTE Nº ${String(i+1).padStart(3,'0')} · ${esc(e.categoryLabel.toUpperCase())} · ${esc(e.displayDate)}</p><h3>${esc(e.title)}</h3><p class="story-card-sub">${esc(e.shortTitle)} — ${esc(e.subtitle)}</p><p class="story-card-excerpt">${esc(e.excerpt)}</p><div class="story-card-bottom"><span>${esc(e.location)}　/　${esc(e.photos.length)} PHOTOS</span><span>↗</span></div></div>`;
        cards.appendChild(a);
      });
      filters.forEach(btn=>{let selected=btn.dataset.filter===filter;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));});
    }
    filters.forEach(btn=>btn.addEventListener('click',()=>render(btn.dataset.filter)));render('all');
  }
  if(page==='story'){
    const entry=entries.find(e=>e.slug==='mitsui-museum-2026-10-20');if(!entry)return;
    const imgs=entry.photos;
    const byOriginal=(pref)=>imgs.find(x=>x.original.startsWith(pref));
    const specials=[
      ['12EB7950','珠光青磁茶碗','南宋〜元の青磁。枇杷色の釉を前に、唐物を選び取った茶人たちの眼差しへ思いを馳せる。'],
      ['3F3608A8','粉引茶碗　銘「残雪」','銘を知ると、白の景色の中に季節の移ろいまで見えてくる。'],
      ['AF099E91','斗々屋茶碗　銘「かすみ」','茶碗に現れた景色をどう見立て、どんな銘を添えるか。'],
      ['A719141F','御所丸茶碗（黒刷毛目）','白と黒の対比。織部好みの沓形に、茶人の好みの強さが伝わる。'],
      ['217097C2','色絵鱗文茶碗　野々村仁清作','黒地に赤と金の鱗文。高麗の静けさの隣に、京焼の華やぎ。'],
      ['C6F09611','箱書と伝来','器の美とともに、それを伝えてきた人の言葉も鑑賞の手がかり。'],
    ];
    const hg=$('#highlightGrid');
    specials.forEach(([key,title,desc],i)=>{const p=byOriginal(key);if(!p)return;
      const b=document.createElement('button');b.type='button';b.className='highlight-card';b.style='border:0;background:none;padding:0;text-align:left;font:inherit';
      b.innerHTML=`<div class="highlight-media"><img src="${esc(urlFor(p.src))}" alt="${esc(title)}" loading="lazy"></div><p class="highlight-meta"><span>DETAIL ${String(i+1).padStart(2,'0')}</span><span>↗ VIEW</span></p><h3 class="highlight-title">${esc(title)}</h3><p class="highlight-desc">${esc(desc)}</p>`;
      b.addEventListener('click',()=>openPhoto(imgs.indexOf(p)));hg.appendChild(b);
    });
    const gg=$('#galleryGrid'), show=$('#showAllPhotos');let filter='all';let showAll=false;let visible=[];
    const imgCount=$('#photoCount');imgCount.textContent=String(imgs.length).padStart(2,'0');
    function renderPhotos(){
      visible=imgs.map((p,i)=>({...p,realIndex:i})).filter(p=>filter==='all'||p.category===filter);
      const slice=showAll?visible:visible.slice(0,12);gg.innerHTML='';
      slice.forEach(p=>{
        const btn=document.createElement('button');btn.type='button';btn.className='gallery-tile';btn.setAttribute('aria-label',`写真 ${p.index}: ${p.title} を拡大`);
        btn.innerHTML=`<img src="${esc(urlFor(p.src))}" alt="${esc(p.title)}" loading="lazy"><span class="tile-caption">${esc(p.title)} · ${String(p.index).padStart(2,'0')}</span>`;
        btn.addEventListener('click',()=>openPhoto(p.realIndex));gg.appendChild(btn);
      });
      const rest=visible.length-slice.length;show.hidden=rest===0;
      $('#remainingCount').textContent=rest>0?`（あと ${rest} 枚）`:'';
    }
    $$('#galleryFilters [data-photo-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.photoFilter;showAll=false; $$('#galleryFilters [data-photo-filter]').forEach(b=>{const t=b===btn;b.classList.toggle('active',t);b.setAttribute('aria-pressed',String(t));});renderPhotos();}));
    show.addEventListener('click',()=>{showAll=true;renderPhotos();});renderPhotos();
    const dlg=$('#photoDialog'),heroImg=$('#lightboxImage');let index=0;
    function setImage(i){index=(i+imgs.length)%imgs.length;const p=imgs[index];heroImg.src=urlFor(p.src);heroImg.alt=p.title;$('#lightboxTitle').textContent=p.title+' — '+p.description;$('#lightboxNumber').textContent=String(index+1).padStart(2,'0')+' / '+String(imgs.length).padStart(2,'0');$('#lightboxCaption').textContent='MITSUI MEMORIAL MUSEUM · 20 OCT 2026';}
    function openPhoto(i){setImage(i);dlg.showModal();}
    $('#closeDialog').addEventListener('click',()=>dlg.close());$('#previousPhoto').addEventListener('click',()=>setImage(index-1));$('#nextPhoto').addEventListener('click',()=>setImage(index+1));
    dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')setImage(index-1);if(e.key==='ArrowRight')setImage(index+1)});
  }
  function $$(selector){return Array.from(document.querySelectorAll(selector));}
})();
