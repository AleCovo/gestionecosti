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


// Leggi il file all'avvio del server
const filePath = path.join(__dirname, 'public/gestionecosti.txt');
let file = '';
let testo = [];

try {
  file = fs.readFileSync(filePath, 'utf-8');
  console.log('Contenuto del file:', file);
} catch (err) {
  console.error('Errore nella lettura del file:', err);
}

testo = file.split('\n');
const index = (testo.length + 1).toString();
console.log('Indice per il nuovo acquisto:', index);



app.listen(PORT);

//lancia pagina principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


//lancia pagina per aggiungere gli acquisti
app.get('/acquisto', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/acquisto.html'));
});


//lancia l'API per aggiungere gli acquisti
app.post('/scrivi', (req, res) => {
  const { object, buyDate, sellDate, buyAmount, sellAmount } = req.body;
  const riga = `\n${index},${object},${buyDate},${sellDate},${buyAmount},${sellAmount}`;
  fs.appendFile('public/gestionecosti.txt', riga, (err) => {
    if (err) return res.status(500).send('Errore nel salvataggio');
    res.send('Dati salvati');
  });
});

app.listen(PORT, () => console.log(`Server in esecuzione su http://localhost:${PORT}`));