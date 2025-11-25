// ===== FIX WIB =====
function getWaktuWIB() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + 7 * 3600000); // WIB = UTC + 7
}

// ===== HITUNG NOMOR MINGGU =====
function getWeekNumber(date) {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

// ===== KONVERSI WAKTU KE MENIT =====
function waktuKeMenit(waktuStr) {
    const [jam, menit] = waktuStr.split(":").map(Number);
    return jam * 60 + menit;
}

const now = new Date(); // waktu sekarang
const tanggal = now.getDate();        // 1 - 31
const bulan = now.getMonth() + 1;    // 0 - 11 → tambahkan 1
const tahun = now.getFullYear();     // misal 2025
// document.getElementById("tanggalWIB").innerHTML = `${tanggal}-${bulan}-${tahun}`;

// ===== JADWAL PRODUKTIF =====
const jadwalReguler = {
    "Senin": [
        { mapel: "Informatika", mulai: "08:20", selesai: "09:40" },
        { mapel: "Istirahat 1", mulai: "09:40", selesai: "10:00" },
        { mapel: "PJOK", mulai: "10:00", selesai: "12:00" },
        { mapel: "Istirahat 2", mulai: "12:00", selesai: "12:40" },
        { mapel: "PIPAS", mulai: "12:40", selesai: "16:00" }
    ],
    "Selasa": [
        { mapel: "Produktif", mulai: "08:00", selesai: "09:20" },
        { mapel: "Istirahat 1", mulai: "09:20", selesai: "09:40" },
        { mapel: "Produktif", mulai: "09:40", selesai: "11:40" },
        { mapel: "Istirahat 2", mulai: "11:40", selesai: "12:20" },
        { mapel: "Produktif", mulai: "12:20", selesai: "15:50" }
    ],
    "Rabu": [
        { mapel: "Produktif", mulai: "08:00", selesai: "09:20" },
        { mapel: "Istirahat 1", mulai: "09:20", selesai: "09:40" },
        { mapel: "PJOK", mulai: "09:40", selesai: "11:40" },
        { mapel: "Istirahat 2", mulai: "11:40", selesai: "12:20" },
        { mapel: "Produktif", mulai: "12:20", selesai: "15:50" }
    ],
    "Kamis": [
        { mapel: "Produktif", mulai: "08:00", selesai: "09:20" },
        { mapel: "Istirahat 1", mulai: "09:20", selesai: "09:40" },
        { mapel: "Produktif", mulai: "09:40", selesai: "10:20" },
        { mapel: "PIPAS", mulai: "10:20", selesai: "11:40" },
        { mapel: "Istirahat 2", mulai: "11:40", selesai: "12:20" },
        { mapel: "PIPAS", mulai: "12:20", selesai: "14:30" },
        { mapel: "Informatika", mulai: "14:30", selesai: "15:50" }
    ],
    "Jumat": [
    ]
};

// ===== JADWAL REGULER =====
const jadwalProduktif = {
    "Senin": [
        { mapel: "Matematika", mulai: "08:20", selesai: "09:40" },
        { mapel: "Istirahat 1", mulai: "09:40", selesai: "10:00" },
        { mapel: "PABP", mulai: "10:00", selesai: "11:20" },
        { mapel: "Bahasa Indonesia", mulai: "11:20", selesai: "12:00" },
        { mapel: "Istirahat 2", mulai: "12:00", selesai: "12:40" },
        { mapel: "Bahasa Indonesia", mulai: "12:40", selesai: "13:20" },
        { mapel: "Bahasa Sunda", mulai: "13:20", selesai: "14:40" },
        { mapel: "Sejarah", mulai: "14:40", selesai: "16:00" },
    ],
    "Selasa": [
        { mapel: "Kokurikuler", mulai: "08:00", selesai: "09:20" },
        { mapel: "Istirahat 1", mulai: "09:20", selesai: "09:40" },
        { mapel: "Kokurikuler", mulai: "09:40", selesai: "11:40" },
        { mapel: "Istirahat 2", mulai: "11:40", selesai: "12:20" },
        { mapel: "Kokurikuler", mulai: "12:20", selesai: "15:50" },
    ],
    "Rabu": [
        { mapel: "Bahasa Inggris", mulai: "08:00", selesai: "09:20" },
        { mapel: "Istirahat 1", mulai: "09:20", selesai: "09:40" },
        { mapel: "PP", mulai: "09:40", selesai: "11:00" },
        { mapel: "PABP", mulai: "11:00", selesai: "11:40" },
        { mapel: "Istirahat 2", mulai: "11:40", selesai: "12:20" },
        { mapel: "PABP", mulai: "12:20", selesai: "13:00" },
        { mapel: "Bahasa Indonesia", mulai: "13:00", selesai: "14:30" },
        { mapel: "Bahasa Sunda", mulai: "14:30", selesai: "15:50" },
    ],
    "Kamis": [
        { mapel: "Matematika", mulai: "08:00", selesai: "09:20" },
        { mapel: "Istirahat 1", mulai: "09:20", selesai: "09:40" },
        { mapel: "PP", mulai: "09:40", selesai: "11:00" },
        { mapel: "Bahasa Indonesia", mulai: "11:00", selesai: "11:40" },
        { mapel: "Istirahat 2", mulai: "11:40", selesai: "12:20" },
        { mapel: "Bahasa Indonesia", mulai: "12:20", selesai: "13:00" },
        { mapel: "KKA", mulai: "13:00", selesai: "14:30" },
        { mapel: "Bahasa Inggris", mulai: "14:30", selesai: "15:50" },
    ],
    "Jumat": [
        { mapel: "KKA", mulai: "07:45", selesai: "09:05" },
        { mapel: "Bahasa Inggris", mulai: "09:05", selesai: "10:25" },
        { mapel: "Matematika", mulai: "10:25", selesai: "11:05" },
        { mapel: "Istirahat", mulai: "11:05", selesai: "13:00" },
        { mapel: "Matematika", mulai: "13:00", selesai: "13:40" },
        { mapel: "Sejarah", mulai: "13:40", selesai: "15:00" },
    ]
};


// ===== TAMPILKAN JAM WIB =====
function tampilkanJam() {
    const now = getWaktuWIB();
    const jam = now.getHours().toString().padStart(2, '0');
    const menit = now.getMinutes().toString().padStart(2, '0');
    const detik = now.getSeconds().toString().padStart(2, '0');
    document.getElementById("jamWIB").innerHTML = `${jam}:${menit}:${detik}`;
    return now;
}

// ===== CEK PELAJARAN SEKARANG =====
function cekPelajaran() {
    const now = tampilkanJam(); // update jam dan ambil waktu sekarang
    const hariIndex = now.getDay();
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][hariIndex];

    const mingguKe = getWeekNumber(now);
    const jadwal = (mingguKe % 2 === 1 ? jadwalReguler : jadwalProduktif);

    if (!jadwal[hari]) {
        document.getElementById("statusPelajaran").innerHTML = `Hari ini (${hari}) tidak ada pelajaran.`;
        return;
    }

    const list = jadwal[hari];
    const sekarang = now.getHours() * 60 + now.getMinutes(); // total menit
    let status = `<p>${hari} / ${tanggal}-${bulan}-${tahun}</p><br>`;

    for (let i = 0; i < list.length; i++) {
        const pel = list[i];
        const mulai = waktuKeMenit(pel.mulai);
        const selesai = waktuKeMenit(pel.selesai);

        if (sekarang >= mulai && sekarang < selesai) {
            status += `Pelajaran <b>${pel.mapel}</b> sedang berlangsung`;
            document.getElementById("statusPelajaran").innerHTML = status;
            return;
        }
    }

    status += "<p>TIDAK ADA pelajaran yang berlangsung saat ini.</p>";
    document.getElementById("statusPelajaran").innerHTML = status;
}

// ===== AUTO REFRESH =====
setInterval(cekPelajaran, 1000); // update tiap detik
cekPelajaran(); // langsung tampil saat load


