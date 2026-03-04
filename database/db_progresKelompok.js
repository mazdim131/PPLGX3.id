const projectContainer = document.getElementById('project-container');
const inputCari = document.getElementById('searchBar');
const scriptUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIJ1GiDOOOy6Gc-mtMusYdtznDNVj4O8TeMWA1gLVE3fBdq72Td1jkiaGv8jYvoVFlm8Irn2faTH0b/pub?output=csv";

async function getSheetData() {
    try {
        const response = await fetch(scriptUrl);
        const data = await response.text();
        const rows = data.split(/\r?\n/).slice(1);

        let cardHtml = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" id="listProjek">';

        rows.forEach(row => {
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (columns.length > 1) {
                const tanggal = columns[0] ? columns[0].replace(/"/g, "") : "";
                const judul = columns[3] ? columns[3].replace(/"/g, "").trim() : "";
                const mapel = columns[2] ? columns[2].replace(/"/g, "").trim() : "";
                const email = columns[1] ? columns[1].replace(/"/g, "") : "";
                const guru = columns[4] ? columns[4].replace(/"/g, "") : "";
                const sulit = columns[5] ? columns[5].replace(/"/g, "") : "0";

                if (judul === "" && mapel === "") return;

                let rawLink = columns[7] ? columns[7].trim().replace(/"/g, "") : "#";
                const linkDemo = (rawLink.startsWith('http')) ? rawLink : `https://${rawLink}`;

                cardHtml += `
                    <div class="item-kartu"> 
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title fw-bold">${judul}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">Kelompok: ${mapel}</h6>
                                <hr>
                                <small>
                                    <strong>Tanggal:</strong> ${tanggal} <br>
                                    <strong>Kesulitan:</strong> ${sulit}/5 <br>
                                    <strong>Guru:</strong> ${guru}
                                </small>
                            </div>
                            <div class="card-footer bg-transparent d-flex justify-content-between align-items-center gap-2">
                                <small class="text-muted text-truncate" style="font-size:0.75rem; max-width: 60%;" title="${email}">
                                    ${email}
                                </small>
                                <a href="${linkDemo}" target="_blank" class="btn btn-sm btn-primary flex-shrink-0">Live Demo</a>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        cardHtml += '</div>';
        projectContainer.innerHTML = cardHtml;

    } catch (error) {
        console.error("Gagal ambil data: ", error);
    }
}

getSheetData();

inputCari.addEventListener('input', function () {
    const kataKunci = inputCari.value.toLowerCase();
    const semuaKartu = document.getElementsByClassName('item-kartu');

    Array.from(semuaKartu).forEach(item => {
        const judul = item.querySelector('.card-title').innerText.toLowerCase();
        const mapel = item.querySelector('.card-subtitle').innerText.toLowerCase();

        if (judul.includes(kataKunci) || mapel.includes(kataKunci)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
});