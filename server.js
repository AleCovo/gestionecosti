const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/scrivi', (req, res) => {
  const { object, buyDate, sellDate, buyAmount, sellAmount } = req.body;
  const riga = `${object}, ${buyDate}, ${sellDate}, ${buyAmount}, ${sellAmount}\n`;
  fs.appendFile('dati.txt', riga, (err) => {
    if (err) return res.status(500).send('Errore nel salvataggio');
    res.send('Dati salvati');
  });
});

app.listen(PORT, () => console.log(`Server in esecuzione su http://localhost:${PORT}`));