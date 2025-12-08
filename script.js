// Search button functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.querySelector('.search-button');
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            // Navigate to search page
            window.location.href = 'search.html';
        });
        
        // Optional: Handle keyboard navigation
        searchButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                searchButton.click();
            }
        });
    }

    // words to scroll (the scrolling effect on the landing page)
    // ==== CONFIG: words and fonts for each marquee ====
    const marqueeConfigs = [
    {
      id: 'marquee1',/*scrolling the text number 1*/
      words: ["click ","on ","the ","search ","bar ","to ","search ","for ","lodges"],
      fonts: ["NicoMoji, sans-serif"],
    
      groupsCount: 6,
      speedSeconds: null // if null, read from parent data-speed or default
    },
    {
      id: 'marquee2',/*scrolling text number 2*/
      words: ["click ","on ","the ","lodge ","finder ","to ","view ","avavailable ","lodges "],
      fonts: ["NicoMoji, sans-serif"],
       
      groupsCount: 5,
      speedSeconds: null
    }
  ];
  
    // helper to create one group
    function createGroup(words, fonts, startFontIndex=0){
      const g = document.createElement('div');
      g.className = 'group';
      let fi = startFontIndex;
      for (const w of words){
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w;
        // initial font assigned cyclically
        span.style.fontFamily = fonts[fi % fonts.length];
        // small random tilt for variety
        span.style.transform = `rotate(${(Math.random()*2-1)}deg) scale(${1 + (Math.random()*0.03)})`;
        g.appendChild(span);
        fi++;
      }
      return g;
    }
    
    // build a marquee given config and the element id
    function buildMarquee(cfg){
      const el = document.getElementById(cfg.id);
      if (!el) {
        console.warn('Marquee element not found:', cfg.id);
        return;
      }
    
      // speed: prefer the parent data-speed attribute if provided
      const parent = el.closest('.marquee-wrap');
      let speed = cfg.speedSeconds || (parent && parent.dataset && parent.dataset.speed) || 12;
      // set CSS custom property on the marquee element so each can have own speed
      el.style.setProperty('--speed', speed + 's');
    
      // clear
      el.innerHTML = '';
    
      // create groups
      for (let i=0; i < cfg.groupsCount; i++){
        el.appendChild(createGroup(cfg.words, cfg.fonts, i));
      }
      // duplicate for seamless loop - clone the content properly
      const clone = el.cloneNode(true);
      el.appendChild(clone);
    }
    
    // random font changer for a marquee
    function startFontRandomizer(cfg, intervalMs = 1800){
      const el = document.getElementById(cfg.id);
      if (!el) return;
      const timer = setInterval(() => {
        const words = el.querySelectorAll('.word');
        if (!words.length) return;
        // change some subset, e.g., 15-25%
        const picks = Math.max(1, Math.round(words.length * 0.18));
        for (let i=0;i<picks;i++){
          const idx = Math.floor(Math.random() * words.length);
          const node = words[idx];
          node.style.opacity = 0.2;
          // pick a random font for this marquee
          const f = cfg.fonts[Math.floor(Math.random() * cfg.fonts.length)];
          setTimeout(() => {
            node.style.fontFamily = f;
            node.style.transform = `rotate(${(Math.random()*2-1)}deg) scale(${1 + (Math.random()*0.03)})`;
            node.style.opacity = 1;
          }, 180);
        }
      }, intervalMs);
    
      // stop timer if user prefers reduced motion
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        clearInterval(timer);
      }
      return timer;
    }
  
    // initialize all marquees
    const activeTimers = [];
    for (const cfg of marqueeConfigs){
      buildMarquee(cfg);
      const t = startFontRandomizer(cfg, 2000 + Math.floor(Math.random()*800));
      activeTimers.push(t);
    }
    
    // OPTIONAL: Rebuild on resize (helps ensure duplication width matches viewport)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        for (const cfg of marqueeConfigs) buildMarquee(cfg);
      }, 240);
    });
});
