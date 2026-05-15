// --- KONFIGURASI EKONOMI ---
const KURS_IDR = 1; 

// Inisialisasi Jembatan Pera Wallet dengan Pengaman Tinggi
let peraWallet = null;
try {
    if (typeof PeraWalletConnect !== 'undefined') {
        peraWallet = new PeraWalletConnect.PeraWalletConnect();
    } else {
        console.warn("Library Pera Wallet belum terdeteksi.");
    }
} catch (e) {
    console.error("Gagal inisialisasi Wallet:", e);
}

// --- 1. FUNGSI EKONOMI ---
function updateEconomyData() {
    const totalAsetTof = 5000000; 
    const assetDisplay = document.getElementById('total-asset');
    const idrDisplay = document.getElementById('total-idr');
    if(assetDisplay) assetDisplay.innerHTML = `${totalAsetTof.toLocaleString()} <span class="econ-symbol">TOF</span>`;
    if(idrDisplay) idrDisplay.innerHTML = `Rp ${(totalAsetTof * KURS_IDR).toLocaleString()}`;
}

// --- 2. FUNGSI LOGIN (SAPAAN USERNAME & REDIRECT) ---
async function prosesLogin() {
    console.log("Tombol Login Diklik!"); // Untuk cek apakah fungsi terpanggil
    
    const userField = document.getElementById('user');
    const passField = document.getElementById('pass');
    
    if (!userField || !passField) {
        console.error("Elemen input tidak ditemukan!");
        return;
    }

    const userIn = userField.value;
    const passIn = passField.value;

    try {
        const url = 'https://tfrmr.github.io/lab-tofarmer/data/users.json';
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Gagal mengambil database warga.");
        
        const allUsers = await resp.json();
        const dataUser = allUsers[userIn];

        if (dataUser && dataUser.password === passIn) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', userIn); 
            localStorage.setItem('userData', JSON.stringify(dataUser));
            
            alert("Wilujeng Sumping, @" + userIn);
            window.location.href = "/lab-tofarmer/posts/halo-tofarmer/"; 
        } else {
            alert("Username/Password salah, Lur!");
        }
    } catch (e) {
        console.error("Error saat login:", e);
        alert("Sistem sibuk atau database belum update.");
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "/lab-tofarmer/";
}

// --- 3. UPDATE UI (LOGIKA PERSISTENT) ---
function updateUI(address) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const dataStr = localStorage.getItem('userData');

    if (isLoggedIn === 'true' && dataStr) {
        const data = JSON.parse(dataStr);
        const loginForm = document.getElementById('login-form');
        const userDashboard = document.getElementById('user-dashboard');
        const displayName = document.getElementById('display-name');
        const panduan = document.getElementById('panduan-gabung');

        if(loginForm) loginForm.setAttribute("style", "display:none !important");
        if(panduan) panduan.setAttribute("style", "display:none !important");
        
        if(userDashboard) {
            userDashboard.setAttribute("style", "display:block !important");
            if(displayName) displayName.innerText = "@" + username;

            // Isi Data dari JSON
            const xpDisplay = document.getElementById('user-xp');
            const tofDisplay = document.getElementById('user-tof');
            const imgDisplay = document.getElementById('user-img');
            
            if(xpDisplay) xpDisplay.innerText = data.xp.toLocaleString();
            if(tofDisplay) tofDisplay.innerText = data.tof.toLocaleString() + " TOF";
            if(imgDisplay && data.img) {
                imgDisplay.src = data.img;
                imgDisplay.style.display = 'block';
            }
        }
    }
}

// --- 4. RITUAL AUTO-RUN ---
window.onload = function() {
    updateEconomyData();
    const savedAddress = localStorage.getItem('tof_user_address');
    updateUI(savedAddress);

    if (peraWallet) {
        peraWallet.reconnectSession().then((accounts) => {
            if (accounts && accounts.length > 0) updateUI(accounts[0]);
        });
    }
};