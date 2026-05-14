// 1 TOF = 1 IDR
const KURS_IDR = 1; 

// FUNGSI UPDATE DATA EKONOMI REAL-TIME (Simulasi Nabung Receh)
function updateEconomyData() {
    // Total akumulasi aset dari dompet-dompet tim nabung receh
    // Di masa depan ini akan memanggil API Blockchain
    const totalAsetTof = 5000000; // Contoh: 5 Juta TOF
    const totalIdr = totalAsetTof * KURS_IDR;

    const assetDisplay = document.getElementById('total-asset');
    const idrDisplay = document.getElementById('total-idr');

    if(assetDisplay) assetDisplay.innerHTML = `${totalAsetTof.toLocaleString()} <span class="econ-symbol">TOF</span>`;
    if(idrDisplay) idrDisplay.innerHTML = `Rp ${totalIdr.toLocaleString()}`;
}

// 1. FUNGSI UTAMA: Memicu Koneksi Wallet
function connectWallet() {
    const address = prompt("Masukkan Alamat Wallet Algorand Anda (58 Karakter):");
    
    if (address && address.length === 58) {
        localStorage.setItem('tof_user_address', address);
        alert("Wallet Terhubung!");
        updateUI(address);
    } else if (address) {
        alert("Alamat salah! Harus 58 karakter. Cek lagi, Lur.");
    }
}

// 2. FUNGSI SIMPAN PROFIL
function saveProfile() {
    const name = document.getElementById('user-name').value;
    const role = document.getElementById('user-role').value;
    
    if (name && role) {
        localStorage.setItem('tof_user_name', name);
        localStorage.setItem('tof_user_role', role);
        alert("Profil disimpan secara lokal!");
        location.reload(); 
    } else {
        alert("Isi nama dan keahlian dulu, Lur!");
    }
}

// 3. FUNGSI UPDATE UI
function updateUI(address) {
    if (!address) return;

    const shortAddress = address.substring(0, 6) + "..." + address.substring(52);
    
    const profileForm = document.getElementById('profile-setup');
    if(profileForm) profileForm.style.display = 'block';

    const savedName = localStorage.getItem('tof_user_name') || "Member Baru";
    const nameDisplay = document.getElementById('display-name');
    if(nameDisplay) nameDisplay.innerText = savedName;
    
    const roleDisplay = document.getElementById('display-role');
    if(roleDisplay) roleDisplay.innerText = "ADDR: " + shortAddress;

    const btnConnect = document.getElementById('btn-connect');
    if(btnConnect) {
        btnConnect.innerText = "CONNECTED";
        btnConnect.style.borderColor = "#55efc4";
        btnConnect.style.color = "#55efc4";
        btnConnect.disabled = true;
    }

    const panduan = document.getElementById('panduan-gabung');
    if(panduan) panduan.style.display = 'none';
}

// 4. AUTO-RUN
window.onload = function() {
    updateEconomyData(); 
    const savedAddress = localStorage.getItem('tof_user_address');
    if (savedAddress) {
        updateUI(savedAddress);
    }
};