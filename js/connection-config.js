document.addEventListener('DOMContentLoaded', function () {
    const toastElement = document.getElementById('connectionToast');
    const toastMessage = document.getElementById('toastMessage');
    const bsToast = new bootstrap.Toast(toastElement);

    function checkConnection() {
        if (navigator.onLine) {
            toastElement.classList.remove('bg-danger');
            toastElement.classList.add('bg-success');
            toastMessage.innerText = "Koneksi tersambung!";
        } else {
            toastElement.classList.remove('bg-success');
            toastElement.classList.add('bg-danger');
            toastMessage.innerText = "Tidak ada koneksi internet!";
        }
        bsToast.show();
    }

    checkConnection();

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
});
