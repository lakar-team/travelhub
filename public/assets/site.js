(function(){
  var S = window.SITE || {};
  document.querySelectorAll("[data-contact]").forEach(function(a){
    a.href = "mailto:" + S.contactEmail + "?subject=" + encodeURIComponent("Tohoku halal travel enquiry");
  });
  document.querySelectorAll("[data-whatsapp]").forEach(function(a){
    if (S.whatsapp) a.href = "https://wa.me/" + S.whatsapp; else a.hidden = true;
  });
  document.querySelectorAll("form.signup").forEach(function(f){
    if (S.signupFormAction) { f.action = S.signupFormAction; f.method = "post"; }
    else f.addEventListener("submit", function(e){ e.preventDefault(); f.querySelector(".note").textContent = "Signup opens soon. Please check back!"; });
  });
  // simple lightbox for gallery images
  var box = document.createElement("div"); box.className = "lightbox"; box.hidden = true;
  box.innerHTML = '<img alt="">'; document.body.appendChild(box);
  box.addEventListener("click", function(){ box.hidden = true; });
  document.querySelectorAll(".gallery img").forEach(function(img){
    img.addEventListener("click", function(){ box.firstChild.src = img.src; box.firstChild.alt = img.alt; box.hidden = false; });
  });
})();
