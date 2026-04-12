const noteContainer = document.getElementById('list-note');
const urlSheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuVTz5dthdD5VMbdBH1BxsOej-udAUwvDe52bdhHqhobOUMcw3mgiydlmzpHQZQMpHE2zsqf9pPhji/pub?output=csv";

function normalizeText(value, fallback) {
    const normalized = String(value || "").replace(/"/g, "").trim();
    return normalized ? normalized.slice(0, 240) : fallback;
}

async function muatNote() {
    console.log("Sedang sinkronisasi data terbaru... ");

    try {
        if (!noteContainer) return console.error("Element id 'list-note' tidak ada di HTML!");
        const response = await fetch(urlSheets);
        if (!response.ok) throw new Error("Link sheet bermasalah!");
        const data = await response.text();
        const rows = data.split(/\r?\n/).slice(1);
        const fragment = document.createDocumentFragment();

        rows.forEach(row => {
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (columns.length > 1) {
                const nama = normalizeText(columns[2], "TanpaNama");
                const deskripsi = normalizeText(columns[3], "Tidak ada deskripsi");

                const column = document.createElement("div");
                column.className = "col mb-2";
                column.style.verticalAlign = "top";

                const card = document.createElement("div");
                card.className = "card shadow-sm";
                card.style.cssText = "width: 100%; max-width: 260px; box-sizing: border-box; border-radius: 12px; overflow: hidden; border: 1px solid black; padding: 16px;";

                const cardBody = document.createElement("div");
                cardBody.className = "card-body";
                cardBody.title = `Catatan ${nama}`;

                const heading = document.createElement("div");
                heading.className = "d-flex align-items-center mb-2";
                heading.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16" style="color: #555;"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>';

                const title = document.createElement("h5");
                title.className = "ms-2 card-title";
                title.style.color = "#333";
                title.textContent = nama;

                const description = document.createElement("p");
                description.className = "card-text text-muted flex-grow-1";
                description.textContent = deskripsi;

                heading.appendChild(title);
                cardBody.append(heading, description);
                card.appendChild(cardBody);
                column.appendChild(card);
                fragment.appendChild(column);
            }
        });

        noteContainer.replaceChildren(fragment);
    } catch (error) {
        console.error("Gagal ambil data: ", error);
    }
}

muatNote()
