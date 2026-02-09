const noteContainer = document.getElementById('list-note');
const urlSheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuVTz5dthdD5VMbdBH1BxsOej-udAUwvDe52bdhHqhobOUMcw3mgiydlmzpHQZQMpHE2zsqf9pPhji/pub?output=csv";

async function muatNote() {
    console.log("Sedang sinkronisasi data terbaru... ");

    try {
        if (!noteContainer) return console.error("Element id 'list-note' tidak ada di HTML!");
        const response = await fetch(urlSheets);
        if (!response.ok) throw new error("Link sheet bermasalah!");
        const data = await response.text();
        const rows = data.split(/\r?\n/).slice(1);
        let cardHtml = "";

        rows.forEach(row => {
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (columns.length > 1) {
                const nama = columns[2] ? columns[2].replace(/"/g, "") : "TanpaNama";
                const deskripsi = columns[3] ? columns[3].replace(/"/g, "") : "Tidak ada deskripsi";

                cardHtml += `
                    <div class="col mb-4">
                        <div class="card" style="width: 18rem;">
                            <div class="card-body">
                                <h5 class="card-title">${nama}</h5>
                                <p class="card-text">${deskripsi}</p>
                            </div>
                        </div>
                    </div>
                `
            }
        });

        noteContainer.innerHTML = cardHtml;
    } catch (error) {
        console.error("Gagal ambil data: ", error);
    }
}

muatNote()