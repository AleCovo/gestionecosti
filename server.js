const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // serve index.html

// Endpoint per scrivere su dati.txt
app.post('/scrivi', (req, res) => {
  const { index, object, buyDate, sellDate, buyAmount, sellAmount } = req.body;

  const nuovaLinea = `\n${index},${object},${buyDate},${sellDate},${buyAmount},${sellAmount}`;

  fs.appendFile(path.join(__dirname, 'gestionecosti.txt'), nuovaLinea, err => {
    if (err) {
      console.error('Errore scrittura file:', err);
      return res.status(500).send('Errore scrittura file');
    }
    res.send('Riga aggiunta con successo!');
  });
});

// Avvia server
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});