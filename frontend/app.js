const API = window.API_URL || "http://localhost:4000";
const s = (id)=>document.getElementById(id);

// SIEMPRE arrancar sin sesión (así 'Mis tareas' está oculta)
localStorage.removeItem("session");
let current = null;

function toast(msg){ alert(msg); }
function setLoading(btn, is){
  if(!btn) return;
  btn.disabled = !!is;
  btn.dataset.old = btn.dataset.old || btn.textContent;
  btn.textContent = is ? "Cargando..." : btn.dataset.old;
}

function showApp(){
  const logged = !!current;
  const authWrap = document.getElementById("auth");
  if (authWrap) authWrap.classList.toggle("hidden", logged);
  s("app").classList.toggle("hidden", !logged);
  if (logged) loadTasks();
}

// --- USERS ---
async function register(){
  const btn = s("btn_register");
  try{
    setLoading(btn, true);
    const body = { name:s("r_name").value.trim(), email:s("r_email").value.trim(), password:s("r_pass").value };
    if(!body.name || !body.email || !body.password) return toast("Completa nombre, correo y contraseña.");
    const r = await fetch(`${API}/users/register`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok) return toast(j.error || `Error ${r.status} al registrar`);
    toast("Usuario creado. Ahora, inicia sesión.");
    s("r_name").value = ""; s("r_email").value = ""; s("r_pass").value = "";
  }catch(e){ console.error(e); toast("No se pudo conectar con el API."); }
  finally{ setLoading(btn, false); }
}

async function login(){
  const btn = s("btn_login");
  try{
    setLoading(btn, true);
    const body = { email:s("l_email").value.trim(), password:s("l_pass").value };
    if(!body.email || !body.password) return toast("Completa correo y contraseña.");
    const r = await fetch(`${API}/users/login`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok) return toast(j.error || `Error ${r.status} al iniciar sesión`);
    current = j;
    toast(`¡Credenciales correctas! Bienvenido, ${j.name || j.email}.`);
    s("l_email").value = ""; s("l_pass").value = "";
    showApp();
  }catch(e){ console.error(e); toast("No se pudo conectar con el API."); }
  finally{ setLoading(btn, false); }
}

// --- TASKS ---
async function addTask(){
  const btn = s("btn_add");
  try{
    setLoading(btn, true);
    const body = { userId: current.userId, title: s("t_title").value.trim(), description: s("t_desc").value.trim() };
    if(!body.title) return toast("Escribe un título para la tarea.");
    const r = await fetch(`${API}/tasks`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok) return toast(j.error || `Error ${r.status} al crear tarea`);
    s("t_title").value=""; s("t_desc").value="";
    loadTasks();
  }catch(e){ console.error(e); toast("No se pudo crear la tarea."); }
  finally{ setLoading(btn, false); }
}

async function loadTasks(){
  try{
    const r = await fetch(`${API}/tasks/${current.userId}`);
    const list = await r.json().catch(()=>[]);
    const ul = s("tasks"); ul.innerHTML="";
    list.forEach(t=>{
      const isDone = t.status === "done";
      const li = document.createElement("li");
      li.innerHTML = `
        <div><b>${t.title}</b> - ${t.description || ""}
          <span class="badge">${t.status}</span>
        </div>
        <button data-id="${t.id}" data-status="${t.status}"
                class="btn ${isDone ? 'secondary sm' : 'secondary sm advance'}"
                ${isDone ? 'disabled' : ''}>
          ${isDone ? 'Completada' : 'Avanzar'}
        </button>`;
      ul.appendChild(li);
    });
  }catch(e){ console.error(e); toast("No se pudieron cargar las tareas."); }
}

async function advance(id){
  try{
    const r = await fetch(`${API}/tasks/${id}/status`, { method:"PUT" });
    if(!r.ok){ const j = await r.json().catch(()=>({})); return toast(j.error || `Error ${r.status} al actualizar`); }
    loadTasks();
  }catch(e){ console.error(e); toast("No se pudo actualizar la tarea."); }
}

// --- Wiring ---
s("btn_register").onclick = register;
s("btn_login").onclick = login;
s("btn_add").onclick = addTask;

s("tasks").addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const status = btn.dataset.status;
  const id = btn.getAttribute("data-id");
  if(status === "done"){ toast("Esta tarea ya está completada ✅"); return; }
  if(btn.classList.contains("advance")) advance(id);
});

s("btn_logout").onclick = ()=>{
  localStorage.removeItem("session");
  current = null;
  showApp();
};

// Estado inicial
showApp();
