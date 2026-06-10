(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero line reveal ---------- */
  window.addEventListener("load", function(){
    document.querySelectorAll(".reveal-up i").forEach(function(el,i){
      el.style.transition = "transform 1s cubic-bezier(.2,.8,.2,1)";
      el.style.transitionDelay = (0.15 + i*0.12) + "s";
      requestAnimationFrame(function(){ el.style.transform = "translateY(0)"; });
    });
    document.querySelectorAll(".hero .r").forEach(function(el,i){
      el.style.transitionDelay = (0.5 + i*0.12) + "s";
      el.classList.add("in");
    });
  });

  /* ---------- Lisbon UTC offset (DST-aware) ---------- */
  var tz = document.getElementById("tz");
  if(tz && window.Intl && Intl.DateTimeFormat){
    try{
      var off = new Intl.DateTimeFormat("en-GB", {timeZone:"Europe/Lisbon", timeZoneName:"shortOffset"})
        .formatToParts(new Date())
        .filter(function(p){ return p.type === "timeZoneName"; })[0].value; // "GMT" or "GMT+1"
      tz.textContent = "Lisbon, PT · " + (off === "GMT" ? "UTC+0" : off.replace("GMT","UTC"));
    }catch(e){ /* keep static fallback */ }
  }

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("yr");
  if(yr) yr.textContent = new Date().getFullYear();

  /* ---------- Scroll progress + nav ---------- */
  var bar = document.getElementById("bar");
  var nav = document.getElementById("nav");
  function onScroll(){
    var h = document.documentElement;
    var p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = (p*100) + "%";
    nav.classList.toggle("scrolled", h.scrollTop > 40);
  }
  window.addEventListener("scroll", onScroll, {passive:true});

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {threshold:0.16, rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll(".r").forEach(function(el){ io.observe(el); });

  /* ---------- Pipeline stages ---------- */
  var pipeIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add("in"); });
  }, {threshold:0.3});
  document.querySelectorAll("[data-stage]").forEach(function(el){ pipeIO.observe(el); });

/* ---------- Active nav link ---------- */
  var sections = ["about","roadmap","skills","contact"].map(function(id){ return document.getElementById(id); });
  var navlinks = document.querySelectorAll("[data-nav]");
  var navIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        navlinks.forEach(function(a){
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      }
    });
  }, {rootMargin:"-45% 0px -45% 0px", threshold:0});
  sections.forEach(function(s){ if(s) navIO.observe(s); });

  /* ---------- Stat showroom (rotating slides + animated counters) ---------- */
  var show = document.getElementById("show");
  if(show){
    var slides = show.querySelectorAll(".show-slide");
    var sdots = show.querySelectorAll(".show-dot");
    var sCur = 0, sTimer = null, sStarted = false;

    function countUp(el){
      var target = parseFloat(el.dataset.count);
      var dec = parseInt(el.dataset.dec||"0",10);
      var suf = el.dataset.suffix||"";
      var t0 = null, dur = 1400;
      function step(ts){
        if(!t0) t0 = ts;
        var k = Math.min(1,(ts-t0)/dur);
        var eased = 1-Math.pow(1-k,3);
        el.textContent = (target*eased).toFixed(dec) + suf;
        if(k<1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec) + suf;
      }
      requestAnimationFrame(step);
    }

    function playSlide(slide){
      slide.querySelectorAll("[data-count]").forEach(countUp);
      slide.querySelectorAll(".bar i").forEach(function(el){
        el.style.transition = "none";
        el.style.width = "0%";
        void el.offsetWidth; /* flush so the reset isn't animated */
        el.style.transition = "width 1.5s cubic-bezier(.2,.8,.2,1)";
        el.style.width = el.dataset.w + "%";
      });
    }

    function goSlide(i){
      sCur = (i + slides.length) % slides.length;
      slides.forEach(function(s,idx){ s.classList.toggle("is-on", idx===sCur); });
      sdots.forEach(function(d,idx){ d.classList.toggle("active", idx===sCur); });
      playSlide(slides[sCur]);
    }

    function sSchedule(){
      clearInterval(sTimer);
      if(!reduce) sTimer = setInterval(function(){ goSlide(sCur+1); }, 12000);
    }

    var gIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting && !sStarted){
          sStarted = true;
          playSlide(slides[sCur]);
          sSchedule();
        }
      });
    }, {threshold:0.4});
    gIO.observe(show);

    show.addEventListener("mouseenter", function(){ clearInterval(sTimer); });
    show.addEventListener("mouseleave", function(){ if(sStarted) sSchedule(); });

    sdots.forEach(function(d,i){
      d.addEventListener("click", function(){ goSlide(i); sSchedule(); });
    });
  }

  /* ---------- Custom cursor ---------- */
  var cur = document.getElementById("cur"), dot = document.getElementById("curdot");
  if(cur && !reduce && !matchMedia("(hover:none)").matches){
    var cx=innerWidth/2, cy=innerHeight/2, tx=cx, ty=cy;
    document.addEventListener("mousemove", function(e){ tx=e.clientX; ty=e.clientY; dot.style.transform="translate("+tx+"px,"+ty+"px) translate(-50%,-50%)"; });
    (function loop(){ cx+=(tx-cx)*0.18; cy+=(ty-cy)*0.18; cur.style.transform="translate("+cx+"px,"+cy+"px) translate(-50%,-50%)"; requestAnimationFrame(loop); })();
    document.querySelectorAll("a, [data-cursor], button, .stack li, .card").forEach(function(el){
      el.addEventListener("mouseenter", function(){ cur.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function(){ cur.classList.remove("is-hover"); });
    });
  }

  /* ---------- Card spotlight + tilt ---------- */
  if(!reduce){
    document.querySelectorAll("[data-tilt]").forEach(function(el){
      el.addEventListener("mousemove", function(e){
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX-r.left)/r.width*100)+"%");
        el.style.setProperty("--my", ((e.clientY-r.top)/r.height*100)+"%");
      });
    });
  }

  /* ---------- Hero network canvas ---------- */
  var canvas = document.getElementById("net");
  if(canvas && !reduce){
    var ctx = canvas.getContext("2d"), W, H, DPR = Math.min(devicePixelRatio||1, 2);
    var nodes = [], packets = [], mouse = {x:-999,y:-999};
    function size(){
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W*DPR; canvas.height = H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
      var count = Math.min(70, Math.floor(W*H/16000));
      nodes = [];
      for(var i=0;i<count;i++){
        nodes.push({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*0.25, vy:(Math.random()-.5)*0.25, r:Math.random()*1.6+0.6 });
      }
    }
    function spawnPacket(){
      if(nodes.length<2) return;
      var a = nodes[(Math.random()*nodes.length)|0];
      var b = nodes[(Math.random()*nodes.length)|0];
      if(a===b) return;
      packets.push({a:a,b:b,t:0,sp:0.006+Math.random()*0.01});
    }
    function tick(){
      ctx.clearRect(0,0,W,H);
      // links
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i];
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>W) n.vx*=-1;
        if(n.y<0||n.y>H) n.vy*=-1;
        // mouse repel-attract
        var dxm=n.x-mouse.x, dym=n.y-mouse.y, dm=Math.hypot(dxm,dym);
        if(dm<140){ n.x+=dxm/dm*0.6; n.y+=dym/dm*0.6; }
        for(var j=i+1;j<nodes.length;j++){
          var m=nodes[j], dx=n.x-m.x, dy=n.y-m.y, d=Math.hypot(dx,dy);
          if(d<128){
            ctx.strokeStyle="rgba(200,242,63,"+(0.10*(1-d/128))+")";
            ctx.lineWidth=0.6;
            ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(m.x,m.y); ctx.stroke();
          }
        }
        var near = dm<150;
        ctx.fillStyle = near ? "rgba(255,91,58,.9)" : "rgba(200,242,63,.55)";
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,7); ctx.fill();
      }
      // packets
      for(var p=packets.length-1;p>=0;p--){
        var pk=packets[p]; pk.t+=pk.sp;
        if(pk.t>=1){ packets.splice(p,1); continue; }
        var px=pk.a.x+(pk.b.x-pk.a.x)*pk.t, py=pk.a.y+(pk.b.y-pk.a.y)*pk.t;
        ctx.fillStyle="#c8f23f"; ctx.shadowColor="#c8f23f"; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(px,py,2,0,7); ctx.fill(); ctx.shadowBlur=0;
      }
      if(Math.random()<0.04) spawnPacket();
      requestAnimationFrame(tick);
    }
    canvas.addEventListener("mousemove", function(e){ var r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; });
    canvas.addEventListener("mouseleave", function(){ mouse.x=-999; mouse.y=-999; });
    addEventListener("resize", size);
    size(); tick();
  }

  onScroll();
})();
