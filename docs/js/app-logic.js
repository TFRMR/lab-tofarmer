// MANTRA WEB3 (Sudah include di sini untuk jaga-jaga)
var exports = {};

// Variabel global untuk menyimpan data warga
let databaseWarga = {};

/**
 * Logika Hitung Level (Rumus Mastermind)
 * Digunakan untuk dashboard dan hover avatar
 */
function getTofLevel(xp) {
    if (xp >= 33000) return 91 + Math.min(Math.floor((xp - 33000) / 1000), 8);
    if (xp >= 9000) return 61 + Math.min(Math.floor((xp - 9000) / 500), 29);
    if (xp >= 3000) return 31 + Math.min(Math.floor((xp - 3000) / 200), 29);
    return Math.max(1, Math.min(Math.floor(xp / 100), 30));
}

// 1. Fungsi untuk sinkronisasi data dari JSON (Auto-Count, Leveling, & Avatar Stack)
async function updateEkosistemStats() {
    try {
        const response = await fetch('/lab-tofarmer/data/users.json');
        if (!response.ok) throw new Error('File JSON tidak ditemukan');
        
        databaseWarga = await response.json();
        const daftarUsername = Object.keys(databaseWarga);
        const totalWarga = daftarUsername.length;

        let totalElite = 0;
        const photoContainer = document.getElementById('grower-photos');
        if (photoContainer) photoContainer.innerHTML = "";

        // Tampilkan SEMUA anggota tanpa batas index < 8
        daftarUsername.forEach((username) => {
            const warga = databaseWarga[username];
            const xp = warga.xp || 0;
            const level = getTofLevel(xp);
            
            // Tentukan Title Kasta berdasarkan XP untuk Title Hover
            let rank = "GROWER";
            if (xp >= 33000) { rank = "ELITE"; totalElite++; }
            else if (xp >= 9000) rank = "SPECIALIST";
            else if (xp >= 3000) rank = "PRO";

            const img = document.createElement('img');
            img.src = warga.img;
            
            // PRIVASI: Hanya tampilkan Username dan Detail Kasta saat di-hover
            img.alt = username;
            img.title = `@${username} | ${rank} (Lv.${level})`; 
            
            img.classList.add('mini-avatar');
            if (rank === "ELITE") {
                img.classList.add('avatar-elite');
            }

            img.style.cursor = "pointer";
            img.onclick = () => {
                window.location.href = `/lab-tofarmer/profil?user=${username}`;
            };
            
            if (photoContainer) photoContainer.appendChild(img);
        });

        if (document.getElementById('count-growers')) {
            document.getElementById('count-growers').innerText = totalWarga;
        }

        if (document.getElementById('count-elite')) {
            document.getElementById('count-elite').innerText = totalElite;
        }

        // LOGIKA DRAG-TO-SCROLL (Agar foto bisa digulir manual dengan klik & tarik)
        const slider = document.getElementById('grower-photos');
        if (slider) {
            let isDown = false;
            let startX;
            let scrollLeft;

            slider.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
            });
            slider.addEventListener('mouseleave', () => { isDown = false; });
            slider.addEventListener('mouseup', () => { isDown = false; });
            slider.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - slider.offsetLeft;
                const walk = (x - startX) * 2; 
                slider.scrollLeft = scrollLeft - walk;
            });
        }

        // Jalankan pengecekan session setelah data JSON termuat
        checkLoginSession();
        
    } catch (error) {
        console.error("Gagal sinkronisasi data warga:", error);
    }
}

// 2. Fungsi untuk menangani Login (Sekarang dengan LocalStorage agar Session awet)
function prosesLogin(autoUser = null, autoPass = null) {
    const inputUser = autoUser || document.getElementById('user').value.trim();
    const inputPass = autoPass || document.getElementById('pass').value;

    if (databaseWarga[inputUser]) {
        const dataUser = databaseWarga[inputUser];

        if (inputPass === dataUser.password) {
            // Simpan Session agar tidak logout saat pindah halaman
            localStorage.setItem('tof_session_user', inputUser);
            localStorage.setItem('tof_session_pass', inputPass);

            document.getElementById('login-form').style.display = 'none';
            document.getElementById('user-dashboard').style.display = 'block';
            
            // UPDATE DASHBOARD (PRIVASI: Nama asli disembunyikan, tampilkan Username)
            document.getElementById('display-name').innerText = "@" + inputUser;
            document.getElementById('display-role').innerText = "LEVEL " + getTofLevel(dataUser.xp);
            document.getElementById('user-xp').innerText = dataUser.xp.toLocaleString();
            document.getElementById('user-tof').innerText = dataUser.tof.toLocaleString() + " TOF";
            
            const userImg = document.getElementById('user-img');
            const profileIcon = document.getElementById('profile-icon');
            if (dataUser.img) {
                userImg.src = dataUser.img;
                userImg.style.display = 'block';
                profileIcon.style.display = 'none';
            }
            
            document.getElementById('btn-post').disabled = false;
            document.getElementById('main-post-area').disabled = false;
            document.getElementById('post-status-msg').innerText = "Status: Online sebagai " + inputUser;

        } else if (!autoUser) {
            alert("Password salah!");
        }
    } else if (!autoUser) {
        alert("Username tidak terdaftar!");
    }
}

/**
 * Cek apakah user sudah login sebelumnya
 */
function checkLoginSession() {
    const savedUser = localStorage.getItem('tof_session_user');
    const savedPass = localStorage.getItem('tof_session_pass');
    if (savedUser && savedPass) {
        prosesLogin(savedUser, savedPass);
    }
}

// 3. Fungsi untuk Logout (Hapus Session)
function logout() {
    localStorage.removeItem('tof_session_user');
    localStorage.removeItem('tof_session_pass');
    
    // Refresh halaman untuk membersihkan state
    location.reload();
}

// JALANKAN FUNGSI OTOMATIS SAAT WEB DIBUKA
document.addEventListener('DOMContentLoaded', () => {
    updateEkosistemStats();
});