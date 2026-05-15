// 1. Fungsi untuk menangani Login
function prosesLogin() {
    // Ambil data dari kotak input
    const username = document.getElementById('user').value;
    const password = document.getElementById('pass').value;

    // Skenario sederhana: Jika user & pass diisi (apa saja), maka login berhasil
    if (username !== "" && password !== "") {
        alert("Selamat datang, " + username + "! Sistem diaktifkan.");
        
        // Sembunyikan form login, tampilkan dashboard
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('user-dashboard').style.display = 'block';
        
        // Update nama di dashboard
        document.getElementById('display-name').innerText = username;
        
        // AKTIFKAN TOMBOL KIRIM (Glow akan menyala)
        const btnPost = document.getElementById('btn-post');
        const textArea = document.getElementById('main-post-area');
        
        btnPost.disabled = false;
        textArea.disabled = false;
        textArea.placeholder = "Tulis progres kamu hari ini...";
        document.getElementById('post-status-msg').innerText = "Status: Terhubung sebagai " + username;
        
    } else {
        alert("Username dan Password harus diisi!");
    }
}

// 2. Fungsi untuk Logout (Kembali ke awal)
function logout() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('user-dashboard').style.display = 'none';
    
    // Matikan lagi tombol kirim
    document.getElementById('btn-post').disabled = true;
    document.getElementById('main-post-area').disabled = true;
}