function redirect() {
    let username_log = document.getElementById("username").value;
    let password_log = document.getElementById("password").value;

    if (username_log == "admin" && password_log == "123") {
        alert("Login berhasil!")
        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSeh8flM6s8AvxULXIMNFY9SGqqRA_Ka4q4AfpsPjJ8jSIh9wA/viewform"
    } else {
        alert("Login gagal!")
        window, location.href = "/index.html"
    }
}