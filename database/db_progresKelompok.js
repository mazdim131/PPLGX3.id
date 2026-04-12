const projectContainer = document.getElementById('project-container');
const inputCari = document.getElementById('searchBar');
const scriptUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIJ1GiDOOOy6Gc-mtMusYdtznDNVj4O8TeMWA1gLVE3fBdq72Td1jkiaGv8jYvoVFlm8Irn2faTH0b/pub?output=csv";

function normalizeText(value, fallback) {
    const normalized = String(value || "").replace(/"/g, "").trim();
    return normalized ? normalized.slice(0, 240) : fallback;
}

function getSafeDemoUrl(rawValue) {
    const rawLink = String(rawValue || "").trim().replace(/"/g, "");
    if (!rawLink) {
        return null;
    }

    try {
        const url = new URL(rawLink.startsWith('http') ? rawLink : `https://${rawLink}`);
        if (!["http:", "https:"].includes(url.protocol)) {
            return null;
        }
        return url.href;
    } catch (_) {
        return null;
    }
}

async function getSheetData() {
    try {
        const response = await fetch(scriptUrl);
        const data = await response.text();
        const rows = data.split(/\r?\n/).slice(1);

        const grid = document.createElement("div");
        grid.className = "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4";
        grid.id = "listProjek";

        rows.forEach(row => {
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (columns.length > 1) {
                const tanggal = normalizeText(columns[0], "-");
                const judul = normalizeText(columns[3], "");
                const mapel = normalizeText(columns[2], "");
                const email = normalizeText(columns[1], "-");
                const guru = normalizeText(columns[4], "-");
                const sulit = normalizeText(columns[5], "0");

                if (judul === "" && mapel === "") return;

                const linkDemo = getSafeDemoUrl(columns[7]);

                const item = document.createElement("div");
                item.className = "item-kartu";

                const card = document.createElement("div");
                card.className = "card h-100 shadow-sm";

                const cardBody = document.createElement("div");
                cardBody.className = "card-body";

                const title = document.createElement("h5");
                title.className = "card-title fw-bold";
                title.textContent = judul;

                const subtitle = document.createElement("h6");
                subtitle.className = "card-subtitle mb-2 text-muted";
                subtitle.textContent = `Kelompok: ${mapel}`;

                const separator = document.createElement("hr");

                const meta = document.createElement("small");
                const dateLabel = document.createElement("strong");
                dateLabel.textContent = "Tanggal:";
                const difficultyLabel = document.createElement("strong");
                difficultyLabel.textContent = "Kesulitan:";
                const teacherLabel = document.createElement("strong");
                teacherLabel.textContent = "Guru:";
                meta.append(
                    dateLabel,
                    document.createTextNode(` ${tanggal} `),
                    document.createElement("br"),
                    difficultyLabel,
                    document.createTextNode(` ${sulit}/5 `),
                    document.createElement("br"),
                    teacherLabel,
                    document.createTextNode(` ${guru}`)
                );

                cardBody.append(title, subtitle, separator, meta);

                const footer = document.createElement("div");
                footer.className = "card-footer bg-transparent d-flex justify-content-between align-items-center gap-2";

                const emailNode = document.createElement("small");
                emailNode.className = "text-muted text-truncate";
                emailNode.style.cssText = "font-size:0.75rem; max-width: 60%;";
                emailNode.title = email;
                emailNode.textContent = email;
                footer.appendChild(emailNode);

                if (linkDemo) {
                    const demoLink = document.createElement("a");
                    demoLink.href = linkDemo;
                    demoLink.target = "_blank";
                    demoLink.rel = "noopener noreferrer";
                    demoLink.className = "btn btn-sm btn-primary flex-shrink-0";
                    demoLink.textContent = "Live Demo";
                    footer.appendChild(demoLink);
                } else {
                    const invalidLink = document.createElement("span");
                    invalidLink.className = "badge text-bg-secondary";
                    invalidLink.textContent = "Link tidak valid";
                    footer.appendChild(invalidLink);
                }

                card.append(cardBody, footer);
                item.appendChild(card);
                grid.appendChild(item);
            }
        });

        projectContainer.replaceChildren(grid);

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
