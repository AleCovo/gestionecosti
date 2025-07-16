Una volta fatta la lettura e la gestione del file txt, si può utilizzare il seguente codice per scaricare un file excel dal browser:

// Crea i dati per il foglio Excel
            const data = [
                ["Oggetto acquistato", "Data d'acquisto", "Data di vendita", "Importo d'acquisto", "Importo di vendita"],
                [object, buyDate, sellDate, buyAmount, sellAmount]
            ];

            // Crea il foglio e la cartella
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Utente");

            // Salva il file
            XLSX.writeFile(workbook, "dati_utente.xlsx");
            });