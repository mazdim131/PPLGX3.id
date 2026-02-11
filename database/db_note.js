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

                cardHtml +=
                    `     
                        <div class="col mb-2" style="vertical-align: top;">
                            <div class="card shadow-sm" style="width: 100%; max-width: 260px; box-sizing: border-box; border-radius: 12px; overflow: hidden; border: 1px solid black; padding: 16px;">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16" style="color: #555;">
                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                    </svg>
                                    <h5 class="ms-2 card-title" style="color: #333;">${nama}</h5>
                                </div>
                                <p class="card-text text-muted flex-grow-1">${deskripsi}</p>
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