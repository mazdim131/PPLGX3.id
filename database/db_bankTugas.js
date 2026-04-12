const body = document.body
const urlSheets = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBon0ecZ1BJUOL2YlfGoaFV34POmHcq08Ii7ZEMXtyBGzRRN13bzw16N2cjFytGhVouXfVA0Gou1IZ/pub?gid=1306359463&single=true&output=csv' + '&t=' + Date.now();

function normalizeText(value, fallback) {
    const normalized = String(value || "").replace(/"/g, "").trim();
    return normalized ? normalized.slice(0, 280) : fallback;
}

async function muatTugas() {
    console.log("Sedang sinkronisasi data terbaru...");

    try {
        const response = await fetch(urlSheets);
        if (!response.ok) throw new Error('Link Sheets Bermasalah');

        const data = await response.text();
        const rows = data.split('\n').slice(1);
        const container = document.getElementById('listTugas');

        if (!container) return console.error("Elemen id 'listTugas' gak ada di HTML!");

        const fragment = document.createDocumentFragment();

        rows.forEach(row => {
            // Regex ini penting supaya kalau ada koma di dalam teks tugas gak berantakan
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (cols[1]) {
                const guru = normalizeText(cols[1], "Guru tidak diketahui");
                const mapel = normalizeText(cols[2], "Mapel tidak diketahui");
                const tgl = normalizeText(cols[3], "-");
                const waktu = normalizeText(cols[4], "-");
                const isiTugas = normalizeText(cols[5], "Tidak ada deskripsi tugas.");

                const card = document.createElement("div");
                card.className = "card mb-3 shadow-sm";
                card.style.cssText = "border-left: 5px solid #1565C0; border-radius: 10px; margin: auto;";

                const cardBody = document.createElement("div");
                cardBody.className = "card-body";

                const title = document.createElement("h5");
                title.className = "card-title font-weight-bold";
                title.style.color = "#1565C0";
                title.textContent = mapel;

                const task = document.createElement("p");
                task.className = "card-text";
                const taskLabel = document.createElement("strong");
                taskLabel.textContent = "Tugas:";
                task.append(taskLabel, document.createTextNode(` ${isiTugas}`));

                const separator = document.createElement("hr");

                const meta = document.createElement("p");
                meta.className = "card-text small text-muted";
                const teacher = document.createElement("b");
                teacher.textContent = "Guru:";
                const deadline = document.createElement("b");
                deadline.textContent = "Deadline:";
                meta.append(
                    teacher,
                    document.createTextNode(` ${guru} | `),
                    deadline,
                    document.createTextNode(` ${tgl} (${waktu})`)
                );

                cardBody.append(title, task, separator, meta);
                card.appendChild(cardBody);
                fragment.appendChild(card);
            }
        });

        container.replaceChildren(fragment);
    } catch (error) {
        console.error("Gagal ambil data:", error);
    }
}

const inputCari = document.getElementById('searchBar');

inputCari.addEventListener('keyup', function () {
    const kataKunci = inputCari.value.toLowerCase();
    const listTugas = document.getElementById('listTugas');
    const semuaKartu = listTugas.getElementsByClassName('card');

    let condition = false;

    for (let i = 0; i < semuaKartu.length; i++) {
        const judulMapel = semuaKartu[i].getElementsByClassName('card-title')[0].innerText.toLowerCase();

        if (judulMapel.includes(kataKunci)) {
            semuaKartu[i].style.display = "";
            condition = true;
        } else {
            semuaKartu[i].style.display = "none";
            condition = false;
        }
    }
});

muatTugas();
setInterval(() => {
    console.clear()
    console.log("Sync data terbaru pada: " + new Date().toLocaleTimeString());
    muatTugas();
}, 100000);
