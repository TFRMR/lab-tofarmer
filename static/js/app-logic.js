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
    // A. JALUR OTOMATIS (Mencoba buka Pera Wallet)
    try {
        const accounts = await peraWallet.connect();
        const address = accounts[0];
        handleConnectSuccess(address);
    } catch (error) {
        console.log("Otomatis dibatalkan, masuk Jalur Manual...");
        
        // B. JALUR MANUAL (Cadangan jika User ingin input manual)
        const manualAddress = prompt("Jalur Manual: Masukkan Alamat Algorand (58 Karakter):");
        if (manualAddress && manualAddress.length === 58) {
            handleConnectSuccess(manualAddress);
        } else if (manualAddress) {
            alert("Alamat tidak valid, Lur!");
        }
    }
}

// Fungsi pembantu saat koneksi berhasil
function handleConnectSuccess(address) {
    localStorage.setItem('tof_user_address', address);
    updateUI(address);
    alert("Wallet Terhubung!");
}

// --- 3. FUNGSI SIMPAN PROFIL ---
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

// --- 4. FUNGSI UPDATE UI ---
function updateUI(address) {
    if (!address) return;
    const shortAddress = address.substring(0, 6) + "..." + address.substring(52);
    
    const profileForm = document.getElementById('profile-setup');
    if(profileForm) profileForm.style.display = 'block';

    document.getElementById('display-name').innerText = localStorage.getItem('tof_user_name') || "Member Baru";
    document.getElementById('display-role').innerText = "ADDR: " + shortAddress;

    const btnConnect = document.getElementById('btn-connect');
    if(btnConnect) {
        btnConnect.innerText = "CONNECTED";
        btnConnect.style.borderColor = "#55efc4";
        btnConnect.disabled = true;
    }

    const panduan = document.getElementById('panduan-gabung');
    if(panduan) panduan.style.display = 'none';
}

// --- 5. RITUAL AUTO-RUN SAAT REFRESH ---
window.onload = function() {
    updateEconomyData();

    // Re-koneksi otomatis sesi Pera Wallet jika masih aktif
    peraWallet.reconnectSession().then((accounts) => {
        if (accounts.length > 0) {
            updateUI(accounts[0]);
        } else {
            // Jika tidak ada sesi Pera, cek memori manual
            const savedAddress = localStorage.getItem('tof_user_address');
            if (savedAddress) updateUI(savedAddress);
        }
    });
};