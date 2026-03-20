/* ============================================================
   PORTCRAFT — builder.js
   Full portfolio builder: state, rendering, download
   ============================================================ */

const PF = (() => {

  /* ─── STATE ─── */
  let state = {
    name:'', title:'', tagline:'', about:'', location:'', exp:'',
    email:'', phone:'', github:'', linkedin:'', website:'', twitter:'',
    photo:'',
    skills:[],     // {name, level}
    techs:[],      // string[]
    projects:[],   // {title,desc,tech,github,live,img}
    edu:[],        // {degree,school,year,grade}
    experience:[], // {role,company,period,desc}
    hobbies:'', certs:'', langs:'',
    template:'modern',
    color:'#7090ff',
    font:'syne',
    layout:'sidebar',
    showHobbies:false, showCerts:false, showLangs:false
  };

  let currentStep = 1;
  const TOTAL_STEPS = 6;
  const STEP_TITLES = ['📋 Basic Info','🔗 Contact & Links','🏷 Skills','💼 Projects','🎓 Education & Experience','🎨 Design & Style'];

  /* ─── INIT ─── */
  function init() {
    buildStepDots();
    renderSkills(); renderProjects(); renderEdu(); renderExp();
    // Pre-add one of each
    addSkill(); addProject(); addEdu(); addExp();
    updateStepUI();
    render();

    // Checkbox toggles
    document.getElementById('showHobbies').addEventListener('change', e => {
      state.showHobbies = e.target.checked;
      document.getElementById('hobbiesWrap').style.display = e.target.checked ? 'flex' : 'none';
      render();
    });
    document.getElementById('showCerts').addEventListener('change', e => {
      state.showCerts = e.target.checked;
      document.getElementById('certsWrap').style.display = e.target.checked ? 'flex' : 'none';
      render();
    });
    document.getElementById('showLangs').addEventListener('change', e => {
      state.showLangs = e.target.checked;
      document.getElementById('langsWrap').style.display = e.target.checked ? 'flex' : 'none';
      render();
    });

    // Set first template option active
    document.querySelector('.tpl-option[data-tpl="modern"]').classList.add('active');
  }

  /* ─── STEP NAVIGATION ─── */
  function buildStepDots() {
    const c = document.getElementById('stepDots');
    c.innerHTML = '';
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const d = document.createElement('div');
      d.className = 'step-dot' + (i < currentStep ? ' done' : i === currentStep ? ' active' : '');
      d.onclick = () => goTo(i);
      c.appendChild(d);
    }
  }

  function goTo(n) {
    syncState();
    currentStep = n;
    document.querySelectorAll('.step-page').forEach((p,i) => p.classList.toggle('active', i+1 === n));
    updateStepUI();
    buildStepDots();
  }

  function next() { if (currentStep < TOTAL_STEPS) goTo(currentStep + 1); }
  function prev() { if (currentStep > 1) goTo(currentStep - 1); }

  function updateStepUI() {
    document.getElementById('stepTitle').textContent = STEP_TITLES[currentStep-1];
    document.getElementById('btnPrev').style.display = currentStep > 1 ? '' : 'none';
    document.getElementById('btnNext').style.display = currentStep < TOTAL_STEPS ? '' : 'none';
    document.getElementById('btnDownload').style.display = currentStep === TOTAL_STEPS ? '' : 'none';
  }

  /* ─── SYNC STATE FROM DOM ─── */
  function syncState() {
    const g = id => (document.getElementById(id)||{}).value || '';
    state.name     = g('f-name');
    state.title    = g('f-title');
    state.tagline  = g('f-tagline');
    state.about    = g('f-about');
    state.location = g('f-location');
    state.exp      = g('f-exp');
    state.email    = g('f-email');
    state.phone    = g('f-phone');
    state.github   = g('f-github');
    state.linkedin = g('f-linkedin');
    state.website  = g('f-website');
    state.twitter  = g('f-twitter');
    state.hobbies  = g('f-hobbies');
    state.certs    = g('f-certs');
    state.langs    = g('f-langs');
    state.font     = g('fontStyle') || 'syne';
    state.layout   = g('layoutStyle') || 'sidebar';

    // Skills from DOM
    state.skills = [];
    document.querySelectorAll('.skill-entry').forEach(el => {
      const nm = el.querySelector('.skill-name')?.value?.trim();
      const lv = parseInt(el.querySelector('.skill-level')?.value||'80');
      if (nm) state.skills.push({name:nm, level:lv});
    });
    // Projects
    state.projects = [];
    document.querySelectorAll('.proj-entry').forEach(el => {
      state.projects.push({
        title: el.querySelector('.pj-title')?.value||'',
        desc:  el.querySelector('.pj-desc')?.value||'',
        tech:  el.querySelector('.pj-tech')?.value||'',
        github:el.querySelector('.pj-github')?.value||'',
        live:  el.querySelector('.pj-live')?.value||''
      });
    });
    // Edu
    state.edu = [];
    document.querySelectorAll('.edu-entry').forEach(el => {
      state.edu.push({
        degree: el.querySelector('.ed-degree')?.value||'',
        school: el.querySelector('.ed-school')?.value||'',
        year:   el.querySelector('.ed-year')?.value||'',
        grade:  el.querySelector('.ed-grade')?.value||''
      });
    });
    // Experience
    state.experience = [];
    document.querySelectorAll('.exp-entry').forEach(el => {
      state.experience.push({
        role:    el.querySelector('.ex-role')?.value||'',
        company: el.querySelector('.ex-company')?.value||'',
        period:  el.querySelector('.ex-period')?.value||'',
        desc:    el.querySelector('.ex-desc')?.value||''
      });
    });
  }

  function render() { syncState(); renderPreview(); }

  /* ─── PHOTO ─── */
  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { toast('Photo must be under 5MB','error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      state.photo = ev.target.result;
      const zone = document.getElementById('photoZone');
      zone.classList.add('has-photo');
      document.getElementById('photoImg').src = state.photo;
      render();
    };
    reader.readAsDataURL(file);
  }

  /* ─── SKILLS ─── */
  let skillId = 0;
  function addSkill() {
    const id = ++skillId;
    const c = document.getElementById('skillsList');
    const div = document.createElement('div');
    div.className = 'dyn-item skill-entry';
    div.dataset.id = id;
    div.innerHTML = `
      <span class="dyn-remove" onclick="PF.rmSkill(${id})">✕</span>
      <div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding-right:36px">
        <input class="input skill-name" placeholder="e.g. JavaScript" oninput="PF.render()"/>
        <span class="range-val skill-val" style="min-width:36px;text-align:center">85%</span>
      </div>
      <div style="margin-top:8px;padding-right:36px;display:flex;align-items:center;gap:10px">
        <span style="font-size:0.72rem;color:var(--t3);width:60px;flex-shrink:0">Proficiency</span>
        <input type="range" class="skill-level" min="10" max="100" value="85"
          oninput="this.closest('.dyn-item').querySelector('.skill-val').textContent=this.value+'%';PF.render()"/>
      </div>`;
    c.appendChild(div);
  }
  function rmSkill(id) { document.querySelector(`.skill-entry[data-id='${id}']`)?.remove(); render(); }

  /* ─── TECH TAGS ─── */
  function techKey(e) { if (e.key==='Enter'){e.preventDefault();addTech();} }
  function addTech() {
    const inp = document.getElementById('techInput');
    const val = inp.value.trim();
    if (!val || state.techs.includes(val)) { inp.value=''; return; }
    state.techs.push(val);
    inp.value='';
    renderTechTags();
    render();
  }
  function rmTech(t) { state.techs=state.techs.filter(x=>x!==t); renderTechTags(); render(); }
  function renderTechTags() {
    document.getElementById('techTags').innerHTML =
      state.techs.map(t=>`<span class="tag-chip">${h(t)}<span class="rm" onclick="PF.rmTech('${h(t)}')">✕</span></span>`).join('');
  }

  /* ─── PROJECTS ─── */
  let projId = 0;
  function addProject() {
    const id = ++projId;
    const c = document.getElementById('projectsList');
    const div = document.createElement('div');
    div.className = 'dyn-item proj-entry';
    div.dataset.id = id;
    div.innerHTML = `
      <span class="dyn-remove" onclick="PF.rmProject(${id})">✕</span>
      <div style="padding-right:36px">
        <div class="input-row">
          <div class="field" style="margin-bottom:10px"><label>Project Title</label><input class="input pj-title" placeholder="My Awesome App" oninput="PF.render()"/></div>
          <div class="field" style="margin-bottom:10px"><label>Tech Stack</label><input class="input pj-tech" placeholder="React, Node, MongoDB" oninput="PF.render()"/></div>
        </div>
        <div class="field" style="margin-bottom:10px"><label>Description</label><textarea class="textarea pj-desc" rows="2" placeholder="What does this project do? What problem does it solve?" oninput="PF.render()"></textarea></div>
        <div class="input-row">
          <div class="field" style="margin-bottom:0"><label>GitHub URL</label><input class="input pj-github" placeholder="https://github.com/..." oninput="PF.render()"/></div>
          <div class="field" style="margin-bottom:0"><label>Live Demo URL</label><input class="input pj-live" placeholder="https://..." oninput="PF.render()"/></div>
        </div>
      </div>`;
    c.appendChild(div);
  }
  function rmProject(id) { document.querySelector(`.proj-entry[data-id='${id}']`)?.remove(); render(); }

  /* ─── EDUCATION ─── */
  let eduId = 0;
  function addEdu() {
    const id = ++eduId;
    const c = document.getElementById('eduList');
    const div = document.createElement('div');
    div.className = 'dyn-item edu-entry';
    div.dataset.id = id;
    div.innerHTML = `
      <span class="dyn-remove" onclick="PF.rmEdu(${id})">✕</span>
      <div style="padding-right:36px">
        <div class="input-row">
          <div class="field" style="margin-bottom:10px"><label>Degree / Certificate</label><input class="input ed-degree" placeholder="B.Tech Computer Science" oninput="PF.render()"/></div>
          <div class="field" style="margin-bottom:10px"><label>Year</label><input class="input ed-year" placeholder="2019 – 2023" oninput="PF.render()"/></div>
        </div>
        <div class="input-row">
          <div class="field" style="margin-bottom:0"><label>School / University</label><input class="input ed-school" placeholder="IIT Bombay" oninput="PF.render()"/></div>
          <div class="field" style="margin-bottom:0"><label>Grade / GPA</label><input class="input ed-grade" placeholder="9.2 CGPA / 3.8 GPA" oninput="PF.render()"/></div>
        </div>
      </div>`;
    c.appendChild(div);
  }
  function rmEdu(id) { document.querySelector(`.edu-entry[data-id='${id}']`)?.remove(); render(); }

  /* ─── EXPERIENCE ─── */
  let expId = 0;
  function addExp() {
    const id = ++expId;
    const c = document.getElementById('expList');
    const div = document.createElement('div');
    div.className = 'dyn-item exp-entry';
    div.dataset.id = id;
    div.innerHTML = `
      <span class="dyn-remove" onclick="PF.rmExp(${id})">✕</span>
      <div style="padding-right:36px">
        <div class="input-row">
          <div class="field" style="margin-bottom:10px"><label>Job Title / Role</label><input class="input ex-role" placeholder="Senior Frontend Developer" oninput="PF.render()"/></div>
          <div class="field" style="margin-bottom:10px"><label>Period</label><input class="input ex-period" placeholder="Jan 2022 – Present" oninput="PF.render()"/></div>
        </div>
        <div class="field" style="margin-bottom:10px"><label>Company</label><input class="input ex-company" placeholder="Google, Meta, Startup Inc." oninput="PF.render()"/></div>
        <div class="field" style="margin-bottom:0"><label>Description</label><textarea class="textarea ex-desc" rows="2" placeholder="Key responsibilities and achievements..." oninput="PF.render()"></textarea></div>
      </div>`;
    c.appendChild(div);
  }
  function rmExp(id) { document.querySelector(`.exp-entry[data-id='${id}']`)?.remove(); render(); }

  /* ─── RENDERERS (DOM) ─── */
  function renderSkills() {}
  function renderProjects() {}
  function renderEdu() {}
  function renderExp() {}

  /* ─── TEMPLATE & COLOR ─── */
  function setTpl(tpl, el) {
    state.template = tpl;
    document.querySelectorAll('.tpl-option').forEach(e=>e.classList.remove('active'));
    if (el) el.classList.add('active');
    render();
  }
  function setColor(color, el) {
    state.color = color;
    document.getElementById('customColor').value = color;
    if (el) {
      document.querySelectorAll('.color-swatch').forEach(e=>e.classList.remove('sel'));
      el.classList.add('sel');
    }
    render();
  }

  /* ─── PREVIEW WIDTH ─── */
  function setPreviewWidth(w, tab) {
    const frame = document.getElementById('previewFrame');
    const wrap = document.getElementById('previewWrap');
    frame.style.width = w;
    if (w !== '100%') {
      wrap.style.padding = '20px';
      frame.style.borderRadius = '12px';
      frame.style.boxShadow = '0 24px 60px rgba(0,0,0,0.7)';
      frame.style.maxWidth = w;
    } else {
      wrap.style.padding = '0';
      frame.style.borderRadius = '0';
      frame.style.boxShadow = 'none';
      frame.style.maxWidth = '100%';
    }
    document.querySelectorAll('.preview-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
  }

  /* ─── RESET ─── */
  function reset() {
    if (!confirm('Reset everything? All your data will be cleared.')) return;
    location.reload();
  }

  /* ─── TOAST ─── */
  function toast(msg, type='info') {
    const icons = {success:'✅',error:'❌',info:'ℹ️'};
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type]}</span>${msg}`;
    c.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity 0.4s';setTimeout(()=>t.remove(),400)},3500);
  }

  /* ─── HTML ESCAPE ─── */
  function h(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ══════════════════════════════════════
     PORTFOLIO HTML GENERATOR
  ══════════════════════════════════════ */
  function buildHTML(forDownload=false) {
    const s = state;
    const ac = s.color;
    const acDim = ac+'22';
    const acGlow = ac+'44';

    const fontMap = {
      syne: "'Syne', sans-serif",
      playfair: "'Playfair Display', serif",
      mono: "'JetBrains Mono', monospace",
      poppins: "'Poppins', sans-serif"
    };
    const gfontMap = {
      syne: 'Syne:wght@400;600;700;800',
      playfair: 'Playfair+Display:wght@400;600;700;800',
      mono: 'JetBrains+Mono:wght@400;500;600',
      poppins: 'Poppins:wght@300;400;500;600;700'
    };
    const fontFace = fontMap[s.font] || fontMap.syne;
    const gfont = gfontMap[s.font] || gfontMap.syne;

    // Template colors
    const tpl = {
      modern: { bg:'#070810', bg2:'#0c0d1a', bg3:'#111228', txt:'#f0f2ff', txt2:'#8892b0', border:'rgba(255,255,255,0.08)' },
      neon:   { bg:'#030305', bg2:'#080810', bg3:'#0d0014', txt:'#f5f0ff', txt2:'#9d8fb0', border:'rgba(255,255,255,0.07)' },
      light:  { bg:'#f8faff', bg2:'#ffffff', bg3:'#edf2ff', txt:'#0f172a', txt2:'#475569', border:'rgba(0,0,0,0.08)' }
    }[s.template] || {bg:'#070810',bg2:'#0c0d1a',bg3:'#111228',txt:'#f0f2ff',txt2:'#8892b0',border:'rgba(255,255,255,0.08)'};

    const isLight = s.template === 'light';

    const initials = s.name ? s.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'ME';
    const avatarHTML = s.photo
      ? `<img src="${s.photo}" alt="${h(s.name)}" style="width:100%;height:100%;object-fit:cover"/>`
      : `<span style="font-family:${fontFace};font-weight:800;font-size:2rem">${initials}</span>`;

    // Skills HTML
    const skillsHTML = s.skills.length ? s.skills.map(sk=>`
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:0.88rem;font-weight:600;color:${tpl.txt}">${h(sk.name)}</span>
          <span style="font-size:0.75rem;font-weight:600;color:${ac};font-family:monospace">${sk.level}%</span>
        </div>
        <div style="height:5px;background:${tpl.bg3};border-radius:4px;overflow:hidden;border:1px solid ${tpl.border}">
          <div class="skill-bar" data-w="${sk.level}" style="height:100%;width:0%;background:linear-gradient(90deg,${ac},${ac}bb);border-radius:4px;transition:width 1.2s cubic-bezier(0.16,1,0.3,1)"></div>
        </div>
      </div>`).join('') : '<p style="color:'+tpl.txt2+';font-size:0.85rem">No skills added.</p>';

    // Tech tags
    const techHTML = s.techs.length ? s.techs.map(t=>`
      <span style="display:inline-block;padding:5px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;background:${ac}18;color:${ac};border:1px solid ${ac}40;margin:4px">${h(t)}</span>`).join('') : '';

    // Projects HTML
    const projHTML = s.projects.filter(p=>p.title).map(p=>`
      <div class="reveal-card" style="background:${tpl.bg3};border:1px solid ${tpl.border};border-radius:14px;padding:22px;margin-bottom:18px;transition:all 0.3s;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:linear-gradient(to bottom,${ac},${ac}66)"></div>
        <div style="padding-left:12px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px">
            <h3 style="font-family:${fontFace};font-weight:700;font-size:1.05rem;color:${tpl.txt};margin:0">${h(p.title)}</h3>
            <div style="display:flex;gap:8px;flex-shrink:0">
              ${p.github?`<a href="${h(p.github)}" target="_blank" style="padding:4px 12px;border-radius:6px;font-size:0.72rem;font-weight:600;background:${tpl.bg2};border:1px solid ${tpl.border};color:${tpl.txt2};text-decoration:none;transition:all 0.2s">GitHub</a>`:''}
              ${p.live?`<a href="${h(p.live)}" target="_blank" style="padding:4px 12px;border-radius:6px;font-size:0.72rem;font-weight:600;background:${ac};color:${isLight?'#fff':'#000'};text-decoration:none;transition:all 0.2s">Live →</a>`:''}
            </div>
          </div>
          ${p.desc?`<p style="color:${tpl.txt2};font-size:0.875rem;line-height:1.65;margin-bottom:12px">${h(p.desc)}</p>`:''}
          ${p.tech?`<div style="display:flex;flex-wrap:wrap;gap:6px">${p.tech.split(',').map(t=>`<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-family:monospace;background:${ac}14;color:${ac};border:1px solid ${ac}30">${h(t.trim())}</span>`).join('')}</div>`:''}
        </div>
      </div>`).join('') || `<p style="color:${tpl.txt2};font-size:0.85rem">No projects added yet.</p>`;

    // Education HTML
    const eduHTML = s.edu.filter(e=>e.degree||e.school).map(e=>`
      <div style="display:flex;gap:16px;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid ${tpl.border}">
        <div style="width:44px;height:44px;border-radius:10px;background:${ac}18;border:1px solid ${ac}40;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">🎓</div>
        <div>
          <div style="font-weight:700;font-size:0.95rem;color:${tpl.txt};margin-bottom:3px">${h(e.degree)}</div>
          <div style="font-size:0.85rem;color:${ac};margin-bottom:3px">${h(e.school)}</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            ${e.year?`<span style="font-size:0.78rem;color:${tpl.txt2}">${h(e.year)}</span>`:''}
            ${e.grade?`<span style="font-size:0.78rem;color:${tpl.txt2}">GPA: ${h(e.grade)}</span>`:''}
          </div>
        </div>
      </div>`).join('') || `<p style="color:${tpl.txt2};font-size:0.85rem">No education added yet.</p>`;

    // Experience HTML
    const expHTML = s.experience.filter(e=>e.role).map((e,i)=>`
      <div style="display:flex;gap:16px;margin-bottom:24px;position:relative">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0">
          <div style="width:12px;height:12px;border-radius:50%;background:${ac};box-shadow:0 0 8px ${ac}80;margin-top:5px;flex-shrink:0"></div>
          ${i<s.experience.filter(e=>e.role).length-1?`<div style="width:2px;flex:1;background:linear-gradient(to bottom,${ac}60,transparent);margin-top:6px"></div>`:''}
        </div>
        <div style="flex:1;padding-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;margin-bottom:4px">
            <div>
              <div style="font-weight:700;font-size:0.95rem;color:${tpl.txt}">${h(e.role)}</div>
              <div style="font-size:0.85rem;color:${ac};font-weight:600">${h(e.company)}</div>
            </div>
            ${e.period?`<span style="font-size:0.75rem;color:${tpl.txt2};padding:3px 10px;background:${tpl.bg3};border-radius:6px;border:1px solid ${tpl.border};white-space:nowrap">${h(e.period)}</span>`:''}
          </div>
          ${e.desc?`<p style="font-size:0.85rem;color:${tpl.txt2};line-height:1.65;margin:0">${h(e.desc)}</p>`:''}
        </div>
      </div>`).join('') || `<p style="color:${tpl.txt2};font-size:0.85rem">No experience added yet.</p>`;

    // Contact links
    const contactLinks = [
      s.email    && {icon:'📧',label:'Email',val:s.email,href:`mailto:${s.email}`},
      s.phone    && {icon:'📱',label:'Phone',val:s.phone,href:`tel:${s.phone}`},
      s.github   && {icon:'💻',label:'GitHub',val:s.github.replace('https://',''),href:s.github},
      s.linkedin && {icon:'🔗',label:'LinkedIn',val:s.linkedin.replace('https://',''),href:s.linkedin},
      s.website  && {icon:'🌐',label:'Website',val:s.website.replace('https://',''),href:s.website},
      s.twitter  && {icon:'🐦',label:'Twitter',val:s.twitter.replace('https://',''),href:s.twitter},
    ].filter(Boolean);

    const contactHTML = contactLinks.map(c=>`
      <a href="${h(c.href)}" target="_blank" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;border:1px solid ${tpl.border};background:${tpl.bg3};text-decoration:none;color:${tpl.txt2};margin-bottom:10px;transition:all 0.2s" onmouseover="this.style.borderColor='${ac}';this.style.color='${ac}';this.style.background='${ac}15'" onmouseout="this.style.borderColor='${tpl.border}';this.style.color='${tpl.txt2}';this.style.background='${tpl.bg3}'">
        <span style="font-size:1.1rem">${c.icon}</span>
        <div>
          <div style="font-size:0.7rem;color:${tpl.txt2};text-transform:uppercase;letter-spacing:0.08em">${c.label}</div>
          <div style="font-size:0.85rem;font-weight:500;color:${tpl.txt}">${h(c.val)}</div>
        </div>
        <span style="margin-left:auto;font-size:0.8rem;opacity:0.4">→</span>
      </a>`).join('');

    // Section header helper
    const SH = (icon, title) => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid ${ac}30">
        <div style="width:34px;height:34px;border-radius:8px;background:${ac}18;border:1px solid ${ac}40;display:flex;align-items:center;justify-content:center;font-size:0.9rem">${icon}</div>
        <h2 style="font-family:${fontFace};font-size:1.15rem;font-weight:800;color:${tpl.txt};margin:0;letter-spacing:-0.01em">${title}</h2>
      </div>`;

    // Layout-specific HTML
    let bodyHTML = '';

    if (s.layout === 'sidebar') {
      bodyHTML = `
        <div style="display:grid;grid-template-columns:280px 1fr;gap:0;min-height:100vh">
          <!-- SIDEBAR -->
          <aside style="background:${tpl.bg2};border-right:1px solid ${tpl.border};padding:36px 24px;position:sticky;top:0;height:100vh;overflow-y:auto;display:flex;flex-direction:column">
            <!-- Avatar -->
            <div style="text-align:center;margin-bottom:24px">
              <div style="width:100px;height:100px;border-radius:50%;overflow:hidden;border:3px solid ${ac};box-shadow:0 0 24px ${ac}50;margin:0 auto 16px;background:linear-gradient(135deg,${ac},${ac}80);display:flex;align-items:center;justify-content:center;color:${isLight?'#fff':tpl.txt}">${avatarHTML}</div>
              <h1 style="font-family:${fontFace};font-size:1.3rem;font-weight:800;color:${tpl.txt};margin-bottom:6px;letter-spacing:-0.02em">${h(s.name)||'Your Name'}</h1>
              <p style="font-size:0.82rem;color:${ac};font-weight:600;margin-bottom:6px">${h(s.title)||'Your Title'}</p>
              ${s.location?`<p style="font-size:0.75rem;color:${tpl.txt2}">📍 ${h(s.location)}</p>`:''}
              ${s.exp?`<p style="font-size:0.75rem;color:${tpl.txt2};margin-top:4px">⏱ ${h(s.exp)} years experience</p>`:''}
            </div>
            <!-- Tagline -->
            ${s.tagline?`<p style="font-size:0.82rem;color:${tpl.txt2};text-align:center;font-style:italic;padding:10px;border-radius:8px;border:1px solid ${tpl.border};margin-bottom:20px;line-height:1.6">"${h(s.tagline)}"</p>`:''}
            <!-- Tech Tags -->
            ${techHTML?`<div style="margin-bottom:20px"><p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${tpl.txt2};margin-bottom:10px">Tech Stack</p><div>${techHTML}</div></div>`:''}
            <!-- Contact links -->
            ${contactHTML?`<div style="margin-top:auto"><p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${tpl.txt2};margin-bottom:10px">Contact</p>${contactHTML}</div>`:''}
          </aside>
          <!-- MAIN -->
          <main style="padding:48px 48px;background:${tpl.bg}">
            <!-- About -->
            ${s.about?`<section style="margin-bottom:48px">${SH('👋','About Me')}<p style="color:${tpl.txt2};line-height:1.75;font-size:0.95rem">${h(s.about)}</p></section>`:''}
            <!-- Skills -->
            ${s.skills.length?`<section style="margin-bottom:48px">${SH('🏷','Skills & Proficiency')}${skillsHTML}</section>`:''}
            <!-- Projects -->
            <section style="margin-bottom:48px">${SH('💼','Projects')}${projHTML}</section>
            <!-- Education -->
            <section style="margin-bottom:48px">${SH('🎓','Education')}${eduHTML}</section>
            <!-- Experience -->
            <section style="margin-bottom:48px">${SH('💼','Work Experience')}${expHTML}</section>
            <!-- Optional sections -->
            ${s.showHobbies&&s.hobbies?`<section style="margin-bottom:48px">${SH('🎯','Hobbies & Interests')}<p style="color:${tpl.txt2};font-size:0.9rem;line-height:1.7">${h(s.hobbies)}</p></section>`:''}
            ${s.showCerts&&s.certs?`<section style="margin-bottom:48px">${SH('🏆','Certifications')}<p style="color:${tpl.txt2};font-size:0.9rem;line-height:1.7">${h(s.certs)}</p></section>`:''}
            ${s.showLangs&&s.langs?`<section style="margin-bottom:48px">${SH('🌍','Languages')}<p style="color:${tpl.txt2};font-size:0.9rem;line-height:1.7">${h(s.langs)}</p></section>`:''}
          </main>
        </div>`;
    } else if (s.layout === 'hero') {
      bodyHTML = `
        <!-- HERO HEADER -->
        <header style="background:linear-gradient(135deg,${tpl.bg},${tpl.bg2},${tpl.bg3});border-bottom:1px solid ${tpl.border};padding:80px 0 60px;text-align:center;position:relative;overflow:hidden">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,${ac}10,transparent)"></div>
          <div style="position:relative;z-index:1;max-width:700px;margin:0 auto;padding:0 24px">
            <div style="width:120px;height:120px;border-radius:50%;overflow:hidden;border:4px solid ${ac};box-shadow:0 0 40px ${ac}50;margin:0 auto 24px;background:linear-gradient(135deg,${ac},${ac}80);display:flex;align-items:center;justify-content:center;color:${isLight?'#fff':tpl.txt}">${avatarHTML}</div>
            <h1 style="font-family:${fontFace};font-size:clamp(2rem,5vw,3.2rem);font-weight:800;color:${tpl.txt};margin-bottom:10px;letter-spacing:-0.03em">${h(s.name)||'Your Name'}</h1>
            <p style="font-size:1.1rem;color:${ac};font-weight:600;margin-bottom:10px">${h(s.title)||'Your Title'}</p>
            ${s.tagline?`<p style="font-size:0.95rem;color:${tpl.txt2};font-style:italic;margin-bottom:16px">"${h(s.tagline)}"</p>`:''}
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px">${techHTML}</div>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
              ${s.github?`<a href="${h(s.github)}" style="padding:10px 20px;border-radius:8px;background:${ac};color:${isLight?'#fff':'#000'};text-decoration:none;font-size:0.85rem;font-weight:700">GitHub</a>`:''}
              ${s.linkedin?`<a href="${h(s.linkedin)}" style="padding:10px 20px;border-radius:8px;background:${tpl.bg3};border:1px solid ${tpl.border};color:${tpl.txt2};text-decoration:none;font-size:0.85rem;font-weight:600">LinkedIn</a>`:''}
              ${s.email?`<a href="mailto:${h(s.email)}" style="padding:10px 20px;border-radius:8px;background:${tpl.bg3};border:1px solid ${tpl.border};color:${tpl.txt2};text-decoration:none;font-size:0.85rem;font-weight:600">Email Me</a>`:''}
            </div>
          </div>
        </header>
        <main style="max-width:860px;margin:0 auto;padding:60px 24px;background:${tpl.bg}">
          ${s.about?`<section style="margin-bottom:48px">${SH('👋','About Me')}<p style="color:${tpl.txt2};line-height:1.75;font-size:0.95rem">${h(s.about)}</p></section>`:''}
          ${s.skills.length?`<section style="margin-bottom:48px">${SH('🏷','Skills')}${skillsHTML}</section>`:''}
          <section style="margin-bottom:48px">${SH('💼','Projects')}${projHTML}</section>
          <section style="margin-bottom:48px">${SH('🎓','Education')}${eduHTML}</section>
          <section style="margin-bottom:48px">${SH('⚡','Experience')}${expHTML}</section>
          ${s.showHobbies&&s.hobbies?`<section style="margin-bottom:48px">${SH('🎯','Hobbies')}<p style="color:${tpl.txt2};font-size:0.9rem;line-height:1.7">${h(s.hobbies)}</p></section>`:''}
          ${s.showLangs&&s.langs?`<section style="margin-bottom:48px">${SH('🌍','Languages')}<p style="color:${tpl.txt2};font-size:0.9rem;line-height:1.7">${h(s.langs)}</p></section>`:''}
        </main>`;
    } else {
      // Card layout
      bodyHTML = `
        <div style="background:${tpl.bg};min-height:100vh;padding:40px 20px">
          <div style="max-width:780px;margin:0 auto">
            <!-- Hero Card -->
            <div style="background:linear-gradient(135deg,${tpl.bg2},${tpl.bg3});border:1px solid ${tpl.border};border-radius:20px;padding:40px;margin-bottom:24px;text-align:center;position:relative;overflow:hidden">
              <div style="position:absolute;inset:0;background:radial-gradient(circle at 70% 30%,${ac}0d,transparent)"></div>
              <div style="position:relative">
                <div style="width:90px;height:90px;border-radius:50%;overflow:hidden;border:3px solid ${ac};box-shadow:0 0 24px ${ac}50;margin:0 auto 16px;background:linear-gradient(135deg,${ac},${ac}80);display:flex;align-items:center;justify-content:center;color:${isLight?'#fff':tpl.txt}">${avatarHTML}</div>
                <h1 style="font-family:${fontFace};font-size:1.8rem;font-weight:800;color:${tpl.txt};margin-bottom:6px">${h(s.name)||'Your Name'}</h1>
                <p style="color:${ac};font-weight:600;margin-bottom:8px">${h(s.title)}</p>
                ${s.location?`<p style="font-size:0.82rem;color:${tpl.txt2}">📍 ${h(s.location)}</p>`:''}
                ${s.tagline?`<p style="font-size:0.88rem;color:${tpl.txt2};font-style:italic;margin-top:10px">"${h(s.tagline)}"</p>`:''}
              </div>
            </div>
            <!-- Cards -->
            ${s.about?`<div style="background:${tpl.bg2};border:1px solid ${tpl.border};border-radius:16px;padding:28px;margin-bottom:18px">${SH('👋','About')}<p style="color:${tpl.txt2};line-height:1.75;font-size:0.9rem">${h(s.about)}</p></div>`:''}
            ${s.skills.length?`<div style="background:${tpl.bg2};border:1px solid ${tpl.border};border-radius:16px;padding:28px;margin-bottom:18px">${SH('🏷','Skills')}${skillsHTML}</div>`:''}
            ${techHTML?`<div style="background:${tpl.bg2};border:1px solid ${tpl.border};border-radius:16px;padding:28px;margin-bottom:18px">${SH('⚙️','Tech Stack')}<div>${techHTML}</div></div>`:''}
            <div style="background:${tpl.bg2};border:1px solid ${tpl.border};border-radius:16px;padding:28px;margin-bottom:18px">${SH('💼','Projects')}${projHTML}</div>
            <div style="background:${tpl.bg2};border:1px solid ${tpl.border};border-radius:16px;padding:28px;margin-bottom:18px">${SH('🎓','Education')}${eduHTML}</div>
            <div style="background:${tpl.bg2};border:1px solid ${tpl.border};border-radius:16px;padding:28px;margin-bottom:18px">${SH('⚡','Experience')}${expHTML}</div>
            ${contactHTML?`<div style="background:${tpl.bg2};border:1px solid ${tpl.border};border-radius:16px;padding:28px;margin-bottom:18px">${SH('📬','Contact')}${contactHTML}</div>`:''}
          </div>
        </div>`;
    }

    // NAV (for downloaded version)
    const navHTML = forDownload ? `
      <nav style="position:sticky;top:0;z-index:100;background:${tpl.bg}dd;backdrop-filter:blur(20px);border-bottom:1px solid ${tpl.border};padding:0 24px">
        <div style="display:flex;align-items:center;justify-content:space-between;height:64px;max-width:1200px;margin:0 auto">
          <span style="font-family:${fontFace};font-weight:800;font-size:1.1rem;color:${tpl.txt}">${h(s.name)||'Portfolio'}</span>
          <div style="display:flex;gap:16px">
            <a href="#about" style="font-size:0.85rem;color:${tpl.txt2};text-decoration:none">About</a>
            <a href="#skills" style="font-size:0.85rem;color:${tpl.txt2};text-decoration:none">Skills</a>
            <a href="#projects" style="font-size:0.85rem;color:${tpl.txt2};text-decoration:none">Projects</a>
            <a href="#contact" style="font-size:0.85rem;color:${tpl.txt2};text-decoration:none">Contact</a>
          </div>
        </div>
      </nav>` : '';

    const skillAnimScript = `
      <script>
        // Animate skill bars on load
        window.addEventListener('load',function(){
          setTimeout(function(){
            document.querySelectorAll('.skill-bar').forEach(function(bar){
              bar.style.width=bar.dataset.w+'%';
            });
          },300);
        });
        // Reveal animations
        var observer=new IntersectionObserver(function(entries){
          entries.forEach(function(e){if(e.isIntersecting)e.target.style.opacity='1',e.target.style.transform='none'});
        },{threshold:0.1});
        document.querySelectorAll('.reveal-card').forEach(function(el){
          el.style.opacity='0';el.style.transform='translateY(16px)';el.style.transition='all 0.5s ease';
          observer.observe(el);
        });
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(function(a){
          a.addEventListener('click',function(e){
            var t=document.querySelector(this.getAttribute('href'));
            if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
          });
        });
      <\/script>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${h(s.name)||'Portfolio'} — ${h(s.title)||'Developer'}</title>
<meta name="description" content="${h(s.about||'').slice(0,150)}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=${gfont}&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:${fontFace};background:${tpl.bg};color:${tpl.txt};line-height:1.7;overflow-x:hidden}
a{text-decoration:none;color:inherit}
img{display:block;max-width:100%;height:auto}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:${tpl.bg}}
::-webkit-scrollbar-thumb{background:${tpl.bg3};border-radius:4px}
@media(max-width:768px){
  div[style*="grid-template-columns:280px"]{display:block!important}
  aside[style*="position:sticky"]{height:auto!important;position:relative!important;border-right:none!important;border-bottom:1px solid ${tpl.border}!important}
}
</style>
</head>
<body>
${navHTML}
${bodyHTML}
${skillAnimScript}
</body>
</html>`;
  }

  /* ─── RENDER PREVIEW ─── */
  function renderPreview() {
    const frame = document.getElementById('previewFrame');
    const html = buildHTML(false);
    // Use srcdoc for live preview
    frame.srcdoc = html;
  }

  /* ─── DOWNLOAD ─── */
  function download() {
    syncState();
    if (!state.name) { toast('Please enter your name first!','error'); return; }
    const html = buildHTML(true);
    const blob = new Blob([html],{type:'text/html;charset=utf-8'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${(state.name||'portfolio').toLowerCase().replace(/\s+/g,'-')}-portfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Portfolio downloaded! 🎉','success');
  }

  /* ─── PUBLIC API ─── */
  return {
    init, render, handlePhoto,
    addSkill, rmSkill,
    techKey, addTech, rmTech,
    addProject, rmProject,
    addEdu, rmEdu,
    addExp, rmExp,
    setTpl, setColor,
    setPreviewWidth,
    prev, next, reset, download
  };

})();

// Boot
document.addEventListener('DOMContentLoaded', PF.init);
