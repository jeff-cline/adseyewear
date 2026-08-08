// ADS Sports Eyewear — interactions
(function(){
  // Mobile drawer
  var mb = document.querySelector('.menu-btn'), dr = document.querySelector('.drawer');
  if(mb && dr){
    mb.addEventListener('click', function(){ dr.classList.add('open'); });
    dr.addEventListener('click', function(e){ if(e.target.matches('.x, a')) dr.classList.remove('open'); });
  }

  // Partner application form → CRM + email
  var form = document.getElementById('partner-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var msg = document.getElementById('form-msg');
      var btn = form.querySelector('button[type=submit]');
      var data = Object.fromEntries(new FormData(form).entries());
      if(!data.firstName || !data.lastName || !data.phone || !data.pitch){
        msg.className='form-msg err'; msg.textContent='Please fill in your name, phone, and a short note.'; return;
      }
      btn.disabled = true; var orig = btn.textContent; btn.textContent = 'Sending…';
      fetch('/api/partner', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)})
        .then(function(r){ return r.json().catch(function(){return {};}); })
        .then(function(j){
          if(j && j.ok){
            form.reset();
            window.location.href = '/thank-you.html';
          } else {
            msg.className='form-msg err'; msg.textContent = (j && j.error) || 'Something went wrong — please call or text us instead.';
            btn.disabled=false; btn.textContent=orig;
          }
        })
        .catch(function(){
          msg.className='form-msg err'; msg.textContent='Network error — please try again or call us.';
          btn.disabled=false; btn.textContent=orig;
        });
    });
  }
})();
