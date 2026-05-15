// --- KONFIGURASI EKONOMI ---
const KURS_IDR = 1; 

// Inisialisasi Jembatan Pera Wallet
const peraWallet = new PeraWalletConnect.PeraWalletConnect();

// --- 1. FUNGSI EKONOMI ---
function updateEconomyData() {
    const totalAsetTof = 5000000; // Contoh: 5 Juta TOF
    const totalIdr = totalAsetTof * KURS_IDR;

    const assetDisplay = document.getElementById('total-asset');
    const idrDisplay = document.getElementById('total-idr');

    if(assetDisplay) assetDisplay.innerHTML = `${totalAsetTof.toLocaleString()} <span class="econ-symbol">TOF</span>`;
    if(idrDisplay) idrDisplay.innerHTML = `Rp ${totalIdr.toLocaleString()}`;
}

// --- 2. FUNGSI KONEKSI WALLET ---
async function connectWallet() {
    try {
        const accounts = await peraWallet.connect();
        const address = accounts[0];
        handleConnectSuccess(address);
    } catch (error) {
        console.log("Otomatis dibatalkan, masuk Jalur Manual...");
        const manualAddress = prompt("Jalur Manual: Masukkan Alamat Algorand (58 Karakter):");
        if (manualAddress && manualAddress.length === 58) {
            handleConnectSuccess(manualAddress);
        } else if (manualAddress) {
            alert("Alamat tidak valid, Lur!");
        }
    }
}

function handleConnectSuccess(address) {
    localStorage.setItem('tof_user_address', address);
    updateUI(address);
    alert("Wallet Terhubung!");
}

// --- 3. FUNGSI LOGIN TRADISIONAL (USERNAME PERSISTENT) ---
async function prosesLogin() {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('pass').value;

    try {
        const resp = await fetch('https://TFRMR.github.io/lab-tofarmer/data/users.json');
        const allUsers = await resp.json();
        const dataUser = allUsers[userIn];

        if (dataUser && dataUser.password === passIn) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', userIn); 
            localStorage.setItem('userData', JSON.stringify(dataUser));
            
            alert("Wilujeng Sumping, @" + userIn);
            // Redirect ke halaman profil/dashboard dinamis
            window.location.href = "/lab-tofarmer/posts/halo-tofarmer/"; 
        } else {
            alert("Username atau Password salah, Lur!");
        }
    } catch (e) {
        console.error("Gagal load database:", e);
        alert("Gagal mengambil data warga.");
    }
}

// --- 4. FUNGSI PENDAFTARAN WARGA ---
function prosesDaftar() {
    const nama = prompt("Nama Lengkap:");
    const nick = prompt("Nickname / Username:");
    const alamat = prompt("Alamat / Domisili:");
    const hobi = prompt("Hobi / Keahlian:");
    const pass = prompt("Buat Password:");

    if (nama && nick && pass) {
        const pesan = `Halo Mastermind, saya ingin daftar ekosistem ToFarmer.%0A%0A` +
                      `Nama: ${nama}%0A` +
                      `Nickname: ${nick}%0A` +
                      `Alamat: ${alamat}%0A` +
                      `Hobi: ${hobi}%0A` +
                      `Password: ${pass}`;
        
        window.open(`https://wa.me/628XXXXXXXXX?text=${pesan}`, '_blank');
        alert("Data terformat! Silahkan kirim ke WhatsApp Mastermind untuk diaktivasi.");
    } else {
        alert("Data wajib diisi semua, Lur!");
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "/lab-tofarmer/";
}

// --- 5. FUNGSI SIMPAN PROFIL ---
function saveProfile() {
    const name = document.getElementById('user-name').value;
    const role = document.getElementById('user-role').value;
    if (name && role) {
        localStorage.setItem('tof_user_name', name);
        localStorage.setItem('tof_user_role', role);
        alert("Profil disimpan!");
        location.reload(); 
    } else {
        alert("Isi dulu Nama dan Keahlian, Lur!");
    }
}

// --- 6. FUNGSI INTERAKSI ---
function sruputKopi(element) {
    let count = parseInt(element.innerText.replace(/[^0-9]/g, ''));
    count++;
    element.innerHTML = `☕ ${count} Sruput`;
    element.style.color = "#00f2ff";
    element.style.textShadow = "0 0 8px #00f2ff";
}

// --- 7. FUNGSI UPDATE UI (DASHBOARD & PERSISTENT SESSION) ---
function updateUI(address) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const data = JSON.parse(localStorage.getItem('userData'));

    // A. Update Info Wallet (Hanya tampil di Profil setelah Login)
    if (address) {
        const shortAddress = address.substring(0, 6) + "..." + address.substring(52);
        const displayRole = document.getElementById('display-role');
        if(displayRole) displayRole.innerText = "ADDR: " + shortAddress;

        const btnConnect = document.getElementById('btn-connect');
        if(btnConnect) {
            btnConnect.innerText = "CONNECTED";
            btnConnect.style.borderColor = "#55efc4";
            btnConnect.disabled = true;
        }
    }

    // B. Logika Persistent: Force tampilan jika sudah login
    if (isLoggedIn === 'true' && data) {
        const loginForm = document.getElementById('login-form');
        const userDashboard = document.getElementById('user-dashboard');
        const displayName = document.getElementById('display-name');
        const panduan = document.getElementById('panduan-gabung');
        const profileSetup = document.getElementById('profile-setup');
        const web3Area = document.getElementById('web3-connection-area');

        // Sembunyikan elemen login secara paksa menggunakan !important via JS
        if(loginForm) loginForm.setAttribute("style", "display:none !important");
        if(panduan) panduan.setAttribute("style", "display:none !important");
        if(profileSetup) profileSetup.setAttribute("style", "display:none !important");
        
        // Tampilkan Dashboard & Data Dinamis
        if(userDashboard) {
            userDashboard.setAttribute("style", "display:block !important");
            if(displayName) displayName.innerText = "@" + username;
            if(web3Area) web3Area.style.display = "block"; // Tampilkan wallet area di profil

            // Isi statistik murni dari JSON (users.json)
            const xpDisplay = document.getElementById('user-xp');
            const tofDisplay = document.getElementById('user-tof');
            const imgDisplay = document.getElementById('user-img');
            const iconDisplay = document.getElementById('profile-icon');
            
            // Tambahan data dinamis (Alamat & Hobi jika elemennya ada)
            const infoAlamat = document.getElementById('info-alamat');
            const infoHobi = document.getElementById('info-hobi');
            if(infoAlamat) infoAlamat.innerText = data.alamat || "Menoreh";
            if(infoHobi) infoHobi.innerText = data.hobi || "Bertani Kode";
            
            if(xpDisplay) xpDisplay.innerText = data.xp.toLocaleString();
            if(tofDisplay) tofDisplay.innerText = data.tof.toLocaleString() + " TOF";
            
            if(imgDisplay && data.img) {
                imgDisplay.src = data.img;
                imgDisplay.style.display = 'block';
                if(iconDisplay) iconDisplay.style.display = 'none';
            }

            // Aktifkan akses posting
            const postArea = document.getElementById('main-post-area');
            const btnPost = document.getElementById('btn-post');
            const postMsg = document.getElementById('post-status-msg');

            if (postArea) {
                postArea.disabled = false;
                postArea.placeholder = "Halo @" + username + ", apa progresmu hari ini?";
                if(btnPost) {
                    btnPost.disabled = false;
                    btnPost.style.background = "#00f2ff";
                    btnPost.style.color = "#000";
                    btnPost.style.cursor = "pointer";
                }
                if(postMsg) {
                    postMsg.innerText = "Status: Online";
                    postMsg.style.color = "#55efc4";
                }
            }
        }
    } else {
        // Jika belum login, pastikan form login muncul & dashboard hilang
        if(document.getElementById('login-form')) document.getElementById('login-form').style.display = 'block';
        if(document.getElementById('user-dashboard')) document.getElementById('user-dashboard').style.display = 'none';
        if(document.getElementById('web3-connection-area')) document.getElementById('web3-connection-area').style.display = 'none';
    }
}

// --- 8. RITUAL AUTO-RUN SAAT REFRESH ---
window.onload = function() {
    updateEconomyData();

    // Jalankan Update UI untuk mengecek status Login & Wallet
    const savedAddress = localStorage.getItem('tof_user_address');
    updateUI(savedAddress);

    // Re-koneksi Pera Wallet jika ada sesi aktif
    peraWallet.reconnectSession().then((accounts) => {
        if (accounts.length > 0) {
            updateUI(accounts[0]);
        }
    });
};