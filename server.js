const express = require('express');
const fs = require('fs');
const path = require('path');
const { text } = require('stream/consumers');
const app = express();
const PORT = process.env.PORT || 3000;


//permette di inserire i css nelle pagine html (HTML, CSS, immagini, ecc.) dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

//queste 2 righe servono per utilizzare il fetch
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function leggiFile(filePath) {
    const file = fs.readFileSync(filePath, 'utf-8');
    return file;
}

function estraiMeseAnno(dataInput) {
  const data = new Date(dataInput);
  const mese = (data.getMonth() + 1).toString().padStart(2, '0');
  const anno = data.getFullYear();
  return `${mese}/${anno}`;
}

function estraiAnno(dataInput) {
  const data = new Date(dataInput);
  const anno = data.getFullYear();
  return anno;
}

// Leggi il file all'avvio del server
const filePath = path.join(__dirname, 'public/gestionecosti.txt');
let file = '';
let righe = [];
let numRiga = 0;

file = leggiFile(filePath);

righe = file.split('\n');

app.listen(PORT, () => console.log(`Server in esecuzione sulla porta ${PORT}`));

//lancia pagina di login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});


//lancia pagina principale
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/home.html'));
});

app.get('/caricaForm', (req, res) => {
  const file = leggiFile(filePath);
  res.json(file);
});

app.get('/caricaSelezioneVendita', (req, res) => {
  const file = leggiFile(filePath);
  const righe = file.split('\n');
  
  let righeNonVendute = [];
  righe.forEach((riga) => {
    const campo = riga.split(',');
    if (campo[7] === 'FALSO') {
      righeNonVendute.push(riga + '\n');
    }
  });
  res.json(righeNonVendute);
});

//lancia pagina per aggiungere gli acquisti
app.get('/pagAcquisto', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/acquisto.html'));
});


app.get('/pagStorico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/storico.html'));
});

app.get('/storico', (req, res) => {
  const file = leggiFile(filePath);

  const righe = file.split('\n');

  res.json(righe); // Invia l'array con le righe lette dal file
});


app.post('/aggiornaRigaStorico', (req, res) => {
  const codice = req.body.riga[1];
  const campo = req.body.campo;
  const valore = req.body.valore;
  const file = leggiFile(filePath);
  const righe = file.split('\n');

  // Trova la riga corrispondente al codice
  let rigaDaAggiornare = 0;
  righe.forEach((riga, indice) => {
    const campi = riga.split(',');
    if (campi[3] === codice) {
      rigaDaAggiornare = indice;
    }
  });

  if (rigaDaAggiornare === -1) {
    return res.status(404).send('Riga non trovata');
  }

  // Aggiorna il campo specificato
  const campi = righe[rigaDaAggiornare].split(',');
  const indiceCampo = ['data', 'ordine', 'articolo', 'codice', 'descrizione', 'costo', 'ricavo', 'guadagno', 'mese'].indexOf(campo);
  if (indiceCampo === -1) {
    return res.status(400).send('Campo non valido');
  }

  campi[indiceCampo] = valore;
  righe[rigaDaAggiornare] = campi.join(',');

  // Scrivi le righe aggiornate nel file
  fs.writeFile(filePath, righe.join('\n'), (err) => {
    if (err) return res.status(500).send('Errore nel salvataggio');
    res.json({ codice, campo, valore });
  });
});

//lancia l'API per aggiungere gli acquisti

app.post('/aggiungiArticolo', (req, res) => {

  let data = req.body.data;
  if (data === undefined || data === '') {
    data = new Date().toISOString().split('T')[0]; // Imposta la data corrente se non fornita
  }

  //logica di aggiunta zeri ad origine e articolo
  const ordine = req.body.ordine;
  let veroOrdine = '';
  if (ordine.length === 1) {
    veroOrdine = '00' + ordine;
  }
  else if (ordine.length === 2) {
    veroOrdine = '0' + ordine;
  }
  else {
    veroOrdine = ordine;
  }

  const articolo = req.body.articolo;
  let veroArticolo = '';
  if (articolo.length === 1) {
    veroArticolo = '0' + articolo;
  }
  else {
    veroArticolo = articolo;
  }

  const anno = estraiAnno(data);
  const codice = anno +veroOrdine + veroArticolo;
  const descrizione = req.body.descrizione;
  const costo = req.body.costo;

  const mese = estraiMeseAnno(data);
  

  const riga = `\n${data},${veroOrdine},${veroArticolo},${codice},${descrizione},${costo},0,FALSO,0,${mese}`;
  fs.appendFile(filePath, riga, (err) => {
    if (err) return res.status(500).send('Errore nel salvataggio');
    const aggiungiArticolo = { veroOrdine, veroArticolo };
    res.json(aggiungiArticolo); // Invia l'oggetto con ordine e articolo aggiunti
  });
});


app.post('/terminaAcquisto', (req, res) => {

  let data = req.body.data;
  if (data === undefined || data === '') {
    data = new Date().toISOString().split('T')[0]; // Imposta la data corrente se non fornita
  }

  //logica di aggiunta zeri ad origine e articolo
  const ordine = req.body.ordine;
  let veroOrdine = '';
  if (ordine.length === 1) {
    veroOrdine = '00' + ordine;
  }
  else if (ordine.length === 2) {
    veroOrdine = '0' + ordine;
  }
  else {
    veroOrdine = ordine;
  }

  const articolo = req.body.articolo;
  let veroArticolo = '';
  if (articolo.length === 1) {
    veroArticolo = '0' + articolo;
  }
  else {
    veroArticolo = articolo;
  }

  const anno = estraiAnno(data);
  const codice = anno +veroOrdine + veroArticolo;
  const descrizione = req.body.descrizione;
  const costo = req.body.costo;

  const mese = estraiMeseAnno(data);
  

  const riga = `\n${data},${veroOrdine},${veroArticolo},${codice},${descrizione},${costo},0,FALSO,0,${mese}`;
  fs.appendFile(filePath, riga, (err) => {
    if (err) return res.status(500).send('Errore nel salvataggio');
    res.json(riga); // Invia la riga aggiunta come risposta
  });
});



app.post('/vendita', (req, res) => {
  const codice = req.body.codice;
  const ricavo = req.body.ricavo;
  const guadagno = 0;
  let rigaDaEliminare = 0;

  try {
    file = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('Errore nella lettura del file:', err);
  }
  righe = file.split('\n');

  righe.forEach((riga, indice) => {
    const campo = riga.split(',');
    if (campo[3] === codice) {
      rigaDaEliminare = indice;
    }
  });

  let nuovoFile = '';
  let nuovaRiga = '';


  // Aggiorna la riga corrispondente con il ricavo e lo stato
  righe.forEach((riga, indice) => {

    if (indice < righe.length - 1) { 
      if (indice !== rigaDaEliminare) {
        nuovoFile += riga + '\n';
      }
      else if (indice === rigaDaEliminare) {
        const campo = riga.split(',');
        campo[6] = ricavo;
        campo[7] = 'VERO';
        campo[8] = parseFloat(campo[6]) - parseFloat(campo[5]);
        nuovaRiga = campo.join(',');
        nuovoFile += nuovaRiga + '\n';
      }
    }
    else {
      if (indice !== rigaDaEliminare) {
        nuovoFile += riga;
      }
      else if (indice === rigaDaEliminare) {
        const campo = riga.split(',');
        campo[6] = ricavo;
        campo[7] = 'VERO';
        campo[8] = parseFloat(campo[6]) - parseFloat(campo[5]);
        nuovaRiga = campo.join(',');
        nuovoFile += nuovaRiga;
      }
    }
  });

  fs.writeFileSync(filePath, nuovoFile, 'utf-8');

});

app.get('/pagTabelle', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/tabelle.html'));
});