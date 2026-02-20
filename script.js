let cantieri = JSON.parse(localStorage.getItem("cantieri")) || [];
let editIndex = null;

window.addEventListener("load", ()=>{
  setTimeout(()=>{
    const splash = document.getElementById("splashScreen");
    splash.style.opacity="0";
    splash.style.transition="opacity 0.7s ease";
    setTimeout(()=>{
      splash.style.display="none";
    },700);
  },2200);
});

function saveStorage(){
  localStorage.setItem("cantieri", JSON.stringify(cantieri));
}

function openNew(){
  editIndex = null;
  document.getElementById("formTitle").textContent="Nuovo Cantiere";

  nome.value="";
  indirizzo.value="";
  telefono.value="";
  stato.value="incorso";
  note.value="";

  home.classList.add("hidden");
  newPage.classList.remove("hidden");
  window.scrollTo(0,0);
}

function goHome(){
  newPage.classList.add("hidden");
  home.classList.remove("hidden");
  render();
}

function save(){
  let c={
    nome:nome.value,
    indirizzo:indirizzo.value,
    telefono:telefono.value,
    stato:stato.value,
    note:note.value
  };

  if(editIndex!==null){
    cantieri[editIndex]=c;
  } else {
    cantieri.push(c);
  }

  saveStorage();
  goHome();
}

function editCantiere(i){
  editIndex=i;
  let c=cantieri[i];

  document.getElementById("formTitle").textContent="Modifica Cantiere";

  nome.value=c.nome;
  indirizzo.value=c.indirizzo;
  telefono.value=c.telefono;
  stato.value=c.stato;
  note.value=c.note;

  home.classList.add("hidden");
  newPage.classList.remove("hidden");
}

function deleteCantiere(i){
  if(confirm("Eliminare questo cantiere?")){
    cantieri.splice(i,1);
    saveStorage();
    render();
  }
}

function render(){
  let filtro=document.getElementById("searchInput").value?.toLowerCase() || "";

  let incorso=cantieri.filter(c=>c.stato==="incorso").length;
  let problema=cantieri.filter(c=>c.stato==="problema").length;
  let chiuso=cantieri.filter(c=>c.stato==="chiuso").length;

  document.getElementById("incorso").textContent=incorso;
  document.getElementById("problema").textContent=problema;
  document.getElementById("chiusi").textContent=chiuso;

  lista.innerHTML="";

  cantieri
  .filter(c=>c.nome.toLowerCase().includes(filtro))
  .forEach((c,i)=>{
    lista.innerHTML+=`
    <div class="card ${c.stato}">
      <h3>${c.nome}</h3>

      <a class="link" href="tel:${c.telefono}">${c.telefono}</a>
      <a class="link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.indirizzo)}" target="_blank">${c.indirizzo}</a>

      <p style="margin-top:6px;font-size:14px">${c.note}</p>

      <div class="actions">
        <button class="editBtn" onclick="editCantiere(${i})">Modifica</button>
        <button class="deleteBtn" onclick="deleteCantiere(${i})">Elimina</button>
      </div>
    </div>
    `;
  });
}

document.getElementById("searchInput").addEventListener("input", render);

render();
function esportaDati(){
  let dataStr = JSON.stringify(cantieri);
  let blob = new Blob([dataStr], {type:"application/json"});
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "backup_install_manager.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importaDati(){
  document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", function(e){
  let file = e.target.files[0];
  if(!file) return;

  let reader = new FileReader();
  reader.onload = function(event){
    try{
      cantieri = JSON.parse(event.target.result);
      saveStorage();
      render();
      alert("Backup ripristinato con successo");
    } catch{
      alert("File non valido");
    }
  };
  reader.readAsText(file);
});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Service Worker registrato"))
      .catch(err => console.log("Errore SW:", err));
  });
}
