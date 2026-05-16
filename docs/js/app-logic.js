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
                // Gunakan path lengkap agar tidak 404
                window.location.href = `/lab-tofarmer/profil/?user=${username}`;
            };
            
            if (photoContainer) photoContainer.appendChild(img);
        });

        if (document.getElementById('count-growers')) {
            document.getElementById('count-growers').innerText = totalWarga;
        }

        if (document.getElementById('count-elite')) {
            document.getElementById('count-elite').innerText = totalElite;
        }

        // 📊 PIPA WEB3 LIVE: HITUNG TOTAL ASET LANGSUNG DARI BRANKAS NODE ALGORAND ASLI
        let kalkulasiTotalAset = 0;
        
        // Membaca saldo dari seluruh dompet warga secara paralel di internet
        const semuaJanjiSaldo = daftarUsername.map(async (username) => {
            const warga = databaseWarga[username];
            if (warga.wallet_address && warga.wallet_address.trim() !== "") {
                const saldoAsliWarga = await ambilSaldoTofBlockchain(warga.wallet_address);
                kalkulasiTotalAset += saldoAsliWarga;
            }
        });
        
        // Tunggu hingga ketukan pintu ke server blockchain selesai semua
        await Promise.all(semuaJanjiSaldo);

        // Suntik langsung hasil akumulasi saldo riil ke elemen papan atas
        const elemenTotalAsset = document.getElementById('total-asset');
        if (elemenTotalAsset) {
            elemenTotalAsset.innerHTML = `${kalkulasiTotalAset.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span class="econ-symbol">TOF</span>`;
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

// 2. Fungsi untuk menangani Login Web3 Wallet (Menggantikan sistem input password manual lama)
let currentWalletAddress = null;

async function eksekusiLoginWallet() {
    try {
        let mockAddress = prompt("MANTRA WEB3 TOFARMER:\nMasukkan Alamat Wallet Address Algorand Anda untuk Akses Node:");
        
        if (!mockAddress || mockAddress.trim() === "") {
            alert("Koneksi dompet dibatalkan, Mas Manto!");
            return;
        }

        // Amankan input: bersihkan spasi gaib dan paksa jadi huruf kecil semua
        currentWalletAddress = mockAddress.trim().toLowerCase();
        
        // Robot menyisir database users.json mencari wallet_address yang cocok
        const daftarUsername = Object.keys(databaseWarga);
        let userDitemukan = null;

        for (let username of daftarUsername) {
            let dbAddress = databaseWarga[username].wallet_address;
            // Evaluasi pengunci: samakan ke huruf kecil dan buang spasi agar lolos verifikasi adil
            if (dbAddress && dbAddress.trim().toLowerCase() === currentWalletAddress) {
                userDitemukan = username;
                break;
            }
        }

        if (userDitemukan) {
            // KONDISI 1: DOMPET TERDAFTAR -> LANGSUNG LOGIN
            const dataUser = databaseWarga[userDitemukan];
            
            // Simpan karakter asli inputan dompet ke session browser
            localStorage.setItem('tof_session_wallet', mockAddress.trim());

            document.getElementById('login-form').style.display = 'none';
            document.getElementById('user-dashboard').style.display = 'block';
            
            document.getElementById('display-name').innerText = "@" + userDitemukan;
            document.getElementById('display-role').innerText = "LEVEL " + getTofLevel(dataUser.xp);
            document.getElementById('user-xp').innerText = dataUser.xp.toLocaleString();
            
            // Tarik saldo dompet individu secara live dari blockchain untuk dashboard
            const saldoIndividu = await ambilSaldoTofBlockchain(mockAddress);
            document.getElementById('user-tof').innerText = saldoIndividu.toLocaleString('id-ID') + " TOF";
            
            const userImg = document.getElementById('user-img');
            const profileIcon = document.getElementById('profile-icon');
            if (dataUser.img) {
                userImg.src = dataUser.img;
                userImg.style.display = 'block';
                profileIcon.style.display = 'none';
            }
            
            document.getElementById('btn-post').disabled = false;
            document.getElementById('main-post-area').disabled = false;
            document.getElementById('post-status-msg').innerText = "Status: Terhubung via Dompet @" + userDitemukan;

        } else {
            // KONDISI 2: DOMPET BELUM TERDAFTAR -> BUKA FORM WARGA BARU AUTOMATIC
            document.getElementById('slot-daftar-otomatis').style.display = 'block';
            document.getElementById('btn-connect-wallet').innerText = "🔗 WALLET CONNECTED (BELUM TERVERIFIKASI)";
            document.getElementById('btn-connect-wallet').style.background = "#222";
            document.getElementById('btn-connect-wallet').style.color = "#666";
            document.getElementById('btn-connect-wallet').disabled = true;
        }

    } catch (error) {
        console.error("Gagal memproses otentikasi dompet:", error);
    }
}

/**
 * Logika Pendaftaran Slot Identitas Warga Baru
 */
function eksekusiDaftarWargaBaru() {
    const inputUsername = document.getElementById('reg-username').value.trim().toUpperCase();
    const inputNamaAsli = document.getElementById('reg-nama-asli').value.trim();

    if (!inputUsername || !inputNamaAsli) {
        alert("Username Samaran dan Nama Asli tidak boleh kosong, Mas Manto!");
        return;
    }

    if (databaseWarga[inputUsername]) {
        alert("Username sudah dikunci oleh warga lain! Silahkan cari nama samaran lain.");
        return;
    }

    const dataWargaBaru = {
        "real_name": inputNamaAsli,
        "wallet_address": currentWalletAddress,
        "xp": 100,
        "power": 50.00,
        "last_seen": new Date().toISOString().replace('T', ' ').substring(0, 19),
        "img": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh06rcvsBU6UxuqhKN0f8vVmqlkBTuiZknd6v15tvECk34hoPpAQbzfLAYYbmedMmTKtQfTrHCvVa8WwU7COPDQ3LP93575pdzdQFQmCFKqR5w7WcO6usJ-OQf7UhwETdp3ZpY8AOC10GZN5aAS9OMdeVZl00FbddJ0QRkR6OVIScCYQn2CPERz5h3qMK8/s320/WhatsApp%20Image%202026-05-14%20at%2023.14.49.jpeg",
        "desc": "Baru bergabung di ekosistem ToFarmer.",
        "last_note": "Web3 Self-Registered"
    };

    console.log("=== SALIN DATA INI KE FILE USERS.JSON LAPTOP ===");
    console.log(`"${inputUsername}": ${JSON.stringify(dataWargaBaru, null, 4)}`);
    alert("Registrasi catatan sukses! Silahkan buka console browser.");

    localStorage.setItem('tof_session_wallet', currentWalletAddress);
    location.reload();
}

/**
 * Cek apakah user sudah login sebelumnya (Berbasis Session Wallet)
 */
function checkLoginSession() {
    const savedWallet = localStorage.getItem('tof_session_wallet');
    if (savedWallet && Object.keys(databaseWarga).length > 0) {
        // Amankan proses auto-login dengan penyeragaman huruf kecil & pembersihan spasi
        let searchWallet = savedWallet.trim().toLowerCase();
        const daftarUsername = Object.keys(databaseWarga);
        let sessionDitemukan = false;
        
        for (let username of daftarUsername) {
            let dbAddress = databaseWarga[username].wallet_address;
            if (dbAddress && dbAddress.trim().toLowerCase() === searchWallet) {
                currentWalletAddress = savedWallet.trim();
                const dataUser = databaseWarga[username];

                document.getElementById('login-form').style.display = 'none';
                document.getElementById('user-dashboard').style.display = 'block';
                
                document.getElementById('display-name').innerText = "@" + username;
                document.getElementById('display-role').innerText = "LEVEL " + getTofLevel(dataUser.xp);
                document.getElementById('user-xp').innerText = dataUser.xp.toLocaleString();
                
                // Panggil robot pembaca untuk dashboard personal secara asinkronus
                ambilSaldoTofBlockchain(savedWallet).then(saldo => {
                    const elemTof = document.getElementById('user-tof');
                    if (elemTof) elemTof.innerText = saldo.toLocaleString('id-ID') + " TOF";
                });
                
                if (dataUser.img) {
                    document.getElementById('user-img').src = dataUser.img;
                    document.getElementById('user-img').style.display = 'block';
                    document.getElementById('profile-icon').style.display = 'none';
                }
                
                document.getElementById('btn-post').disabled = false;
                document.getElementById('main-post-area').disabled = false;
                document.getElementById('post-status-msg').innerText = "Status: Online via Wallet";
                sessionDitemukan = true;
                break;
            }
        }
        
        if (!sessionDitemukan) {
            localStorage.removeItem('tof_session_wallet');
        }
    }
}

// 3. Fungsi untuk Logout (Hapus Session Wallet)
function logout() {
    localStorage.removeItem('tof_session_wallet');
    location.reload();
}

// 4. Robot Penjemput Mading Dinamis (Fungsi Baru yang Mengalirkan Teks JSON Mas)
async function loadMadingEkosistem() {
    try {
        let response = await fetch('/data/mading.json');
        if (!response.ok) {
            response = await fetch('/lab-tofarmer/data/mading.json');
        }
        if (!response.ok) throw new Error('Berkas mading.json buntu');

        const daftarMading = await response.json();
        const madingCard = document.getElementById('kotak-mading-ekosistem');

        if (madingCard) {
            madingCard.innerHTML = '<h4 style="font-size: 0.7rem; color: #ff00ff; letter-spacing: 1px; margin-bottom: 15px; position: sticky; top: -15px; background: #1c1c21; padding-top: 15px; padding-bottom: 8px; z-index: 5;">MADING EKOSISTEM</h4>';
            
            if (daftarMading.length === 0) {
                madingCard.innerHTML += '<p style="font-size: 0.8rem; color: #666; text-align: center;">Belum ada arsip mading.</p>';
                return;
            }

            daftarMading.forEach(artikel => {
                const artikelBox = document.createElement('div');
                artikelBox.style.marginBottom = "15px";
                artikelBox.style.borderBottom = "1px solid rgba(255, 0, 255, 0.1)";
                artikelBox.style.paddingBottom = "12px";

                artikelBox.innerHTML = `
                    <b style="color: #00f2ff; font-size: 0.85rem; display: block; margin-bottom: 4px;">${artikel.judul}</b>
                    <span style="color: #555; font-size: 0.65rem; display: block; margin-bottom: 6px; font-family: monospace;">📅 ${artikel.tanggal}</span>
                    <p style="font-size: 0.8rem; color: #d1d1d1; line-height: 1.4; margin: 0; white-space: pre-wrap;">${artikel.isi}</p>
                `;
                madingCard.appendChild(artikelBox);
            });
        }
    } catch (error) {
        console.error("Gagal sinkronisasi data mading:", error);
    }
}

/**
 * 📡 ROBOT WEB3: KETUK PINTU NODE ALGORAND UNTUK AMBIL SALDO ASLI
 * Jaminan Gratisan dari Jaringan Algonode Cloud Publik (Mainnet)
 */
async function ambilSaldoTofBlockchain(walletAddress) {
    if (!walletAddress || walletAddress.trim() === "") return 0;
    
    // ID Unik Token TOF Mas Manto di Algorand
    const ASSET_ID_TOF = "LEHLXDEBBCSFHEFBW7AKLBRUMW42T6EK7Z4D33J72UWWD7ZFANKA"; 
    const NODE_URL = "https://mainnet-api.algonode.cloud"; 
    
    try {
        const response = await fetch(`${NODE_URL}/v2/accounts/${walletAddress.trim()}`);
        if (!response.ok) return 0;
        
        const accountInfo = await response.json();
        
        // Cari token TOF di dalam daftar aset yang dimiliki dompet tersebut
        if (accountInfo['assets'] && accountInfo['assets'].length > 0) {
            // Karena ID Token berbentuk string, kita konversi atau samakan tipe datanya saat penyisiran
            const tokenTof = accountInfo['assets'].find(ast => String(ast['asset-id']) === String(ASSET_ID_TOF));
            
            if (tokenTof) {
                // Mengambil nilai kuantitas token asli
                let saldoMentah = tokenTof['amount'];
                return saldoMentah; 
            }
        }
        return 0;
    } catch (error) {
        console.error(`Gagal melacak saldo blockchain untuk ${walletAddress}:`, error);
        return 0;
    }
}

// JALANKAN FUNGSI OTOMATIS SAAT WEB DIBUKA
document.addEventListener('DOMContentLoaded', () => {
    updateEkosistemStats();
    loadMadingEkosistem();
});