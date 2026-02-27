// ===== CONFIG DATABASE =====
const DB_NAME = "installManagerDB";
const DB_VERSION = 1;
const STORE_NAME = "cantieri";

let db;

// ===== APRI DATABASE =====
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (event) {
      db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = function () {
      reject("Errore apertura DB");
    };
  });
}

// ===== AGGIUNGI CANTIERE =====
function addCantiere(nome, stato) {
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.add({ nome, stato });
}

// ===== OTTIENI TUTTI =====
function getCantieri() {
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
  });
}

// ===== ELIMINA =====
function deleteCantiere(id) {
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.delete(id);
}

// ===== RENDER =====
async function renderCantieri() {
  const list = document.getElementById("cantieri-list");
  list.innerHTML = "";

  const cantieri = await getCantieri();

  cantieri.forEach(c => {
    const div = document.createElement("div");
    div.className = "cantiere";
    div.innerHTML = `
      <h3>${c.nome}</h3>
      <p>Stato: 
        <span style="color:${
          c.stato === "In Corso"
            ? "orange"
            : c.stato === "Completato"
            ? "green"
            : "red"
        }">${c.stato}</span>
      </p>
      <button onclick="deleteItem(${c.id})">Elimina</button>
    `;
    list.appendChild(div);
  });
}

// ===== WRAPPER ELIMINA =====
window.deleteItem = function (id) {
  deleteCantiere(id);
  setTimeout(renderCantieri, 200);
};

// ===== AVVIO APP =====
window.addEventListener("load", async () => {
  await openDB();
  renderCantieri();

  document.getElementById("add-cantiere").addEventListener("click", () => {
    const nome = prompt("Nome Cantiere");
    if (!nome) return;
    addCantiere(nome, "In Corso");
    setTimeout(renderCantieri, 200);
  });

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }

  // Splash hide
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
  }, 1500);
});
