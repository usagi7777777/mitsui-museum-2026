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
        const a=document.createElement('a');a.className='story-card town-'+esc(e.category);a.href='stories/'+encodeURIComponent(e.slug)+'.html';
        a.innerHTML=`<div class="story-card-image"><img src="${esc(urlFor(e.cover))}" alt="${esc(e.shortTitle)}" loading="lazy"></div><div class="story-card-copy"><p class="story-number">${esc(jo(i+1))} · ${esc(e.categoryLabel)} · ${esc(e.displayDate)}</p><h3>${esc(e.title)}</h3><p class="story-card-sub">${esc(e.shortTitle)} — ${esc(e.subtitle)}</p><p class="story-card-excerpt">${esc(e.excerpt)}</p><div class="story-card-bottom"><span>${esc(e.location)}　／　${esc(e.photos.length)} 葉</span><span>→</span></div></div>`;
        cards.appendChild(a);
      });
      filters.forEach(btn=>{let selected=btn.dataset.filter===filter;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));});
    }
    filters.forEach(btn=>btn.addEventListener('click',()=>render(btn.dataset.filter)));render('all');
    const cnt=$('#categoryNav .count');if(cnt)cnt.textContent=String(entries.length).padStart(2,'0');
    const nx=$('.next-number');if(nx)nx.textContent=jo(entries.length+1)+' — ';
  }
  if(page==='story'){
    const slug=document.body.dataset.slug;const entry=entries.find(e=>e.slug===slug);if(!entry)return;
    if(entry.tileFit==='contain')document.body.classList.add('tiles-contain');
    const imgs=entry.photos;
    const specials=(entry.highlights||[]).map(h=>[imgs[h.photo-1],h.title,h.description]);
    const hg=$('#highlightGrid');
    specials.forEach(([p,title,desc],i)=>{if(!p)return;
      const b=document.createElement('button');b.type='button';b.className='highlight-card';b.style='border:0;background:none;padding:0;text-align:left;font:inherit';
      b.innerHTML=`<div class="highlight-media"><img src="${esc(urlFor(p.src))}" alt="${esc(title)}" loading="lazy"></div><p class="highlight-meta"><span>その${esc(kan(i+1))}</span><span>拡大 →</span></p><h3 class="highlight-title">${esc(title)}</h3><p class="highlight-desc">${esc(desc)}</p>`;
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
    function setImage(i){index=(i+imgs.length)%imgs.length;const p=imgs[index];heroImg.src=urlFor(p.src);heroImg.alt=p.title;$('#lightboxTitle').textContent=p.title+' — '+p.description;$('#lightboxNumber').textContent=String(index+1).padStart(2,'0')+' / '+String(imgs.length).padStart(2,'0');$('#lightboxCaption').textContent=entry.captionLabel||'';}
    function openPhoto(i){setImage(i);dlg.showModal();}
    $('#closeDialog').addEventListener('click',()=>dlg.close());$('#previousPhoto').addEventListener('click',()=>setImage(index-1));$('#nextPhoto').addEventListener('click',()=>setImage(index+1));
    dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')setImage(index-1);if(e.key==='ArrowRight')setImage(index+1)});
  }
  function $$(selector){return Array.from(document.querySelectorAll(selector));}
  function kan(n){return ['一','二','三','四','五','六','七','八','九','十'][n-1]||String(n);}
  function jo(n){return '第'+kan(n)+'帖';}
})();
