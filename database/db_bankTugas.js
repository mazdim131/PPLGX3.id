const body = document.body
const urlSheets = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBon0ecZ1BJUOL2YlfGoaFV34POmHcq08Ii7ZEMXtyBGzRRN13bzw16N2cjFytGhVouXfVA0Gou1IZ/pub?gid=1306359463&single=true&output=csv' + '&t=' + Date.now();

async function muatTugas() {
    console.log("Sedang sinkronisasi data terbaru...");

    try {
        const response = await fetch(urlSheets);
        if (!response.ok) throw new Error('Link Sheets Bermasalah');

        const data = await response.text();
        const rows = data.split('\n').slice(1);
        const container = document.getElementById('listTugas');

        if (!container) return console.error("Elemen id 'listTugas' gak ada di HTML!");

        container.innerHTML = '';

        rows.forEach(row => {
            // Regex ini penting supaya kalau ada koma di dalam teks tugas gak berantakan
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (cols[1]) {
                const guru = cols[1].replace(/"/g, "");
                const mapel = cols[2].replace(/"/g, "");
                const tgl = cols[3].replace(/"/g, "");
                const waktu = cols[4].replace(/"/g, "");
                const isiTugas = cols[5].replace(/"/g, "");

                container.innerHTML += `
                    <div class="card mb-3 shadow-sm" style="border-left: 5px solid #1565C0; border-radius: 10px;">
                        <div class="card-body">
                            <h5 class="card-title font-weight-bold" style="color: #1565C0;">${mapel}</h5>
                            <p class="card-text"><strong>Tugas:</strong> ${isiTugas}</p>
                            <hr>
                            <p class="card-text small text-muted">
                                <b>Guru:</b> ${guru} | <b>Deadline:</b> ${tgl} (${waktu})
                            </p>
                        </div>
                    </div>
                `;
            }
        });
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