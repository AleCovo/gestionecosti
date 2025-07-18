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


function estraiMeseAnno(dataInput) {
  const data = new Date(dataInput);
  const mese = (data.getMonth() + 1).toString().padStart(2, '0');
  const anno = data.getFullYear();
  return `${mese}/${anno}`;
}


// Leggi il file all'avvio del server
const filePath = path.join(__dirname, 'public/gestionecosti.txt');
let file = '';
let righe = [];
let numRiga = 0;

try {
  file = fs.readFileSync(filePath, 'utf-8');
  console.log('Contenuto del file:', file);
} catch (err) {
  console.error('Errore nella lettura del file:', err);
}

righe = file.split('\n');



app.listen(PORT, () => console.log(`Server in esecuzione sulla porta ${PORT}`));

//lancia pagina principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/caricaForm', (req, res) => {
  
  
  try {
    file = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('Errore nella lettura del file:', err);
  }

  righe = file.split('\n');
  res.json(righe[righe.length - 1]);
});


//lancia pagina per aggiungere gli acquisti
app.get('/pagAcquisto', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/acquisto.html'));
});


app.get('/pagRiepilogo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/riepilogo.html'));
});

app.get('/riepilogo', (req, res) => {
  try {
    file = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('Errore nella lettura del file:', err);
  }

  righe = file.split('\n');


  res.json(righe); // Invia l'array con le righe lette dal file
});


//lancia l'API per aggiungere gli acquisti
app.post('/acquisto', (req, res) => {
  const data = req.body.data;


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

  const codice = veroOrdine + veroArticolo;
  const descrizione = req.body.descrizione;
  const costo = req.body.costo;

  const mese = estraiMeseAnno(data);
  

  const riga = `\n${data},${veroOrdine},${veroArticolo},${codice},${descrizione},${costo},0,FALSO,0,${mese}`;
  fs.appendFile(filePath, riga, (err) => {
    if (err) return res.status(500).send('Errore nel salvataggio');
    res.send('Dati salvati');
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