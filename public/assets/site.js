(function(){
  var S = window.SITE || {};
  document.querySelectorAll("[data-contact]").forEach(function(a){
    a.href = "mailto:" + S.contactEmail + "?subject=" + encodeURIComponent("Tohoku halal travel enquiry");
  });
  document.querySelectorAll("[data-whatsapp]").forEach(function(a){
    if (S.whatsapp) a.href = "https://wa.me/" + S.whatsapp; else a.hidden = true;
  });
  document.querySelectorAll("[data-signup]").forEach(function(a){
    if (S.signupUrl) { a.href = S.signupUrl; a.target = "_blank"; a.rel = "noopener"; }
  });
  // simple lightbox for gallery images
  var box = document.createElement("div"); box.className = "lightbox"; box.hidden = true;
  box.innerHTML = '<img alt="">'; document.body.appendChild(box);
  box.addEventListener("click", function(){ box.hidden = true; });
  document.querySelectorAll(".gallery img").forEach(function(img){
    img.addEventListener("click", function(){ box.firstChild.src = img.src; box.firstChild.alt = img.alt; box.hidden = false; });
  });
})();
(function(){
  var els=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("in")});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}})},{threshold:.12});
  els.forEach(function(e){io.observe(e)});
})();
