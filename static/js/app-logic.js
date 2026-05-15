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

// --- 2. FUNGSI KONEKSI (OTOMATIS & MANUAL) ---
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

// --- 3. FUNGSI LOGIN TRADISIONAL (INTEGRASI DATA JSON) ---
async function prosesLogin() {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('pass').value;

    try {
        // Ambil data Buku Induk dari folder data
        const resp = await fetch('/lab-tofarmer/data/users.json');
        const allUsers = await resp.json();

        // Cari data berdasarkan Key Username
        const dataUser = allUsers[userIn];

        if (dataUser && dataUser.password === passIn) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', userIn);
            localStorage.setItem('userData', JSON.stringify(dataUser));
            
            alert("Wilujeng Sumping, " + (dataUser.real_name || userIn));
            location.reload(); 
        } else {
            alert("Username atau Password salah, Lur!");
        }
    } catch (e) {
        console.error("Gagal load database:", e);
        alert("Gagal mengambil data warga. Pastikan file JSON ada.");
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

// --- 4. FUNGSI SIMPAN PROFIL ---
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

// --- 5. FUNGSI UPDATE UI (INTEGRASI DASHBOARD) ---
function updateUI(address) {
    // A. Update Info Wallet
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

    // B. Update Dashboard Jika Login Tradisional Aktif
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const data = JSON.parse(localStorage.getItem('userData'));
        const username = localStorage.getItem('username');
        
        const loginForm = document.getElementById('login-form');
        const userDashboard = document.getElementById('user-dashboard');
        const displayName = document.getElementById('display-name');

        if(loginForm) loginForm.style.display = 'none';
        if(userDashboard) userDashboard.style.display = 'block';
        if(displayName) displayName.innerText = data.real_name || username;

        // Update Info Tambahan dari JSON ke UI (jika elemennya ada)
        const xpDisplay = document.getElementById('user-xp');
        const tofDisplay = document.getElementById('user-tof');
        const imgDisplay = document.getElementById('user-img');
        
        if(xpDisplay) xpDisplay.innerText = data.xp.toLocaleString() + " XP";
        if(tofDisplay) tofDisplay.innerText = data.tof.toLocaleString() + " TOF";
        if(imgDisplay && data.img) imgDisplay.src = data.img;
    }

    const profileForm = document.getElementById('profile-setup');
    if(profileForm && address) profileForm.style.display = 'block';

    const panduan = document.getElementById('panduan-gabung');
    if(panduan) panduan.style.display = 'none';
}

// --- 6. RITUAL AUTO-RUN SAAT REFRESH ---
window.onload = function() {
    updateEconomyData();

    // Jalankan Update UI untuk mengecek status Login & Wallet
    const savedAddress = localStorage.getItem('tof_user_address');
    updateUI(savedAddress);

    // Re-koneksi otomatis sesi Pera Wallet
    peraWallet.reconnectSession().then((accounts) => {
        if (accounts.length > 0) {
            updateUI(accounts[0]);
        }
    });
};