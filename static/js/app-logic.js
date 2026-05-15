// --- KONFIGURASI EKONOMI ---
const KURS_IDR = 1; 

// Inisialisasi Pera Wallet dengan PENGAMAN agar tidak menghentikan script lain
let peraWallet;
try {
    peraWallet = new PeraWalletConnect.PeraWalletConnect();
} catch (e) {
    console.warn("Pera Wallet belum siap, tapi sistem login tetap aktif.");
}

// --- 1. FUNGSI EKONOMI ---
function updateEconomyData() {
    const totalAsetTof = 5000000; 
    const assetDisplay = document.getElementById('total-asset');
    const idrDisplay = document.getElementById('total-idr');

    if(assetDisplay) assetDisplay.innerHTML = `${totalAsetTof.toLocaleString()} <span class="econ-symbol">TOF</span>`;
    if(idrDisplay) idrDisplay.innerHTML = `Rp ${(totalAsetTof * KURS_IDR).toLocaleString()}`;
}

// --- 2. FUNGSI KONEKSI WALLET ---
async function connectWallet() {
    if (!peraWallet) return alert("Wallet Library belum termuat, Lur!");
    try {
        const accounts = await peraWallet.connect();
        handleConnectSuccess(accounts[0]);
    } catch (error) {
        const manualAddress = prompt("Jalur Manual: Masukkan Alamat Algorand:");
        if (manualAddress && manualAddress.length === 58) handleConnectSuccess(manualAddress);
    }
}

function handleConnectSuccess(address) {
    localStorage.setItem('tof_user_address', address);
    updateUI(address);
}

// --- 3. FUNGSI LOGIN (SUDAH DIPERKUAT) ---
async function prosesLogin() {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('pass').value;

    try {
        const url = 'https://tfrmr.github.io/lab-tofarmer/data/users.json';
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Database tidak ditemukan.");
        
        const allUsers = await resp.json();
        const dataUser = allUsers[userIn];

        if (dataUser && dataUser.password === passIn) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', userIn); 
            localStorage.setItem('userData', JSON.stringify(dataUser));
            
            alert("Wilujeng Sumping, @" + userIn);
            window.location.href = "/lab-tofarmer/posts/halo-tofarmer/"; 
        } else {
            alert("Username atau Password salah!");
        }
    } catch (e) {
        alert("Sistem Error: " + e.message);
    }
}

// --- 4. FUNGSI PENDAFTARAN ---
function prosesDaftar() {
    const nick = prompt("Nickname / Username:");
    const pass = prompt("Buat Password:");
    if (nick && pass) {
        const pesan = `Daftar ToFarmer%0ANick: ${nick}%0APass: ${pass}`;
        window.open(`https://wa.me/628XXXXXXXXX?text=${pesan}`, '_blank');
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "/lab-tofarmer/";
}

// --- 5. UPDATE UI (FORCE HIDE CARD LOGIN) ---
function updateUI(address) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const data = JSON.parse(localStorage.getItem('userData'));

    if (isLoggedIn === 'true' && data) {
        const loginForm = document.getElementById('login-form');
        const userDashboard = document.getElementById('user-dashboard');
        const displayName = document.getElementById('display-name');

        // Sembunyikan Form Login secara paksa
        if(loginForm) loginForm.setAttribute("style", "display:none !important");
        if(document.getElementById('panduan-gabung')) document.getElementById('panduan-gabung').style.display = 'none';
        
        if(userDashboard) {
            userDashboard.setAttribute("style", "display:block !important");
            if(displayName) displayName.innerText = "@" + username;

            // Isi statistik
            if(document.getElementById('user-xp')) document.getElementById('user-xp').innerText = data.xp.toLocaleString();
            if(document.getElementById('user-tof')) document.getElementById('user-tof').innerText = data.tof.toLocaleString() + " TOF";
            
            const imgDisplay = document.getElementById('user-img');
            if(imgDisplay && data.img) {
                imgDisplay.src = data.img;
                imgDisplay.style.display = 'block';
            }
        }
    }

    if (address && document.getElementById('btn-connect')) {
        document.getElementById('btn-connect').innerText = "CONNECTED";
    }
}

// --- 6. AUTO-RUN ---
window.onload = function() {
    updateEconomyData();
    updateUI(localStorage.getItem('tof_user_address'));

    if (peraWallet) {
        peraWallet.reconnectSession().then((accounts) => {
            if (accounts.length > 0) updateUI(accounts[0]);
        });
    }
};