const DB_NAME = "installManagerDB";
const DB_VERSION = 1;
const STORE_NAME = "cantieri";

let db;

// ===== APRI DATABASE =====
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (event) {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      resolve();
    };

    request.onerror = function () {
      console.log("Errore DB");
      resolve(); // Non blocca app
    };
  });
}

// ===== AGGIUNGI =====
function addCantiere(nome) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.add({ nome, stato: "In Corso" });
}

// ===== LEGGI =====
function getCantieri() {
  return new Promise(resolve => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve([]);
  });
}

// ===== ELIMINA =====
function deleteCantiere(id) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
}

// ===== RENDER =====
async function renderCantieri() {
  const list = document.getElementById("cantieri-list");
  if (!list) return;

  list.innerHTML = "";
  const cantieri = await getCantieri();

  cantieri.forEach(c => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${c.nome}</h3>
      <button onclick="deleteItem(${c.id})">Elimina</button>
    `;
    list.appendChild(div);
  });
}

window.deleteItem = function (id) {
  deleteCantiere(id);
  setTimeout(renderCantieri, 200);
};

// ===== AVVIO APP =====
window.addEventListener("load", async () => {
  try {
    await openDB();
    await renderCantieri();
  } catch (e) {
    console.log("Errore inizializzazione", e);
  }

  const addBtn = document.getElementById("add-cantiere");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const nome = prompt("Nome Cantiere");
      if (!nome) return;
      addCantiere(nome);
      setTimeout(renderCantieri, 200);
    });
  }

  // Service Worker (non blocca)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  // SPLASH SEMPRE NASCOSTO
  const splash = document.getElementById("splash");
  if (splash) {
    setTimeout(() => {
      splash.style.display = "none";
    }, 1200);
  }
});
