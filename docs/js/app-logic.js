// --- 1. KONFIGURASI & INISIALISASI ---
const KURS_IDR = 1; 

// Inisialisasi Pera Wallet dengan Pengaman (Agar tidak mematikan script lain)
let peraWallet;
try {
    peraWallet = new PeraWalletConnect.PeraWalletConnect();
} catch (e) {
    console.warn("Pera Wallet Library belum dimuat, fitur Web3 standby.");
}

// --- 2. FUNGSI EKONOMI (TOTAL ASET) ---
function updateEconomyData() {
    const totalAsetTof = 5000000; // Bisa diupdate manual di sini
    const assetDisplay = document.getElementById('total-asset');
    if(assetDisplay) {
        assetDisplay.innerHTML = `${totalAsetTof.toLocaleString()} <span class="econ-symbol">TOF</span>`;
    }
}

// --- 3. FUNGSI LOGIN ANGGOTA (DENGAN DATA JSON) ---
async function prosesLogin() {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('pass').value;

    console.log("Memulai validasi srawung untuk:", userIn);

    try {
        const url = 'https://tfrmr.github.io/lab-tofarmer/data/users.json';
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Gagal terhubung ke database warga.");
        
        const allUsers = await resp.json();
        const dataUser = allUsers[userIn];

        if (dataUser && dataUser.password === passIn) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', userIn); 
            localStorage.setItem('userData', JSON.stringify(dataUser));
            
            alert("Wilujeng Sumping, @" + userIn);
            // Pindah ke halaman profil/titik kumpul post
            window.location.href = "/lab-tofarmer/posts/halo-tofarmer/"; 
        } else {
            alert("Username atau Password salah, Lur!");
        }
    } catch (e) {
        console.error("Login Error:", e.message);
        alert("Sistem sibuk: " + e.message);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "/lab-tofarmer/";
}

// --- 4. FUNGSI WEB3 (PERA WALLET) ---
async function connectWallet() {
    if (!peraWallet) return alert("Sistem Wallet belum siap, silakan refresh.");
    try {
        const accounts = await peraWallet.connect();
        const address = accounts[0];
        localStorage.setItem('tof_user_address', address);
        updateUI(address);
        alert("Wallet Terhubung!");
    } catch (error) {
        console.log("Masuk Jalur Manual...");
        const manualAddress = prompt("Jalur Manual: Masukkan Alamat Algorand Anda:");
        if (manualAddress && manualAddress.length === 58) {
            localStorage.setItem('tof_user_address', manualAddress);
            updateUI(manualAddress);
        }
    }
}

// --- 5. UPDATE UI (PERSISTENT & DYNAMIC CONTENT) ---
function updateUI(address) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const dataStr = localStorage.getItem('userData');

    if (isLoggedIn === 'true' && dataStr) {
        const data = JSON.parse(dataStr);
        
        // Elemen-elemen Beranda & Profil
        const loginForm = document.getElementById('login-form');
        const panduan = document.getElementById('panduan-gabung');
        const dashboard = document.getElementById('user-dashboard');
        const displayName = document.getElementById('display-name');
        
        // Sembunyikan Form Login (Agar Beranda Bersih)
        if(loginForm) loginForm.setAttribute("style", "display:none !important");
        if(panduan) panduan.setAttribute("style", "display:none !important");
        
        // Tampilkan & Isi Data Dashboard
        if(dashboard) {
            dashboard.setAttribute("style", "display:block !important");
            if(displayName) displayName.innerText = "@" + username;
            
            // Statistik dari JSON
            const xpVal = document.getElementById('user-xp');
            const tofVal = document.getElementById('user-tof');
            const userImg = document.getElementById('user-img');
            const userIcon = document.getElementById('profile-icon');
            
            if(xpVal) xpVal.innerText = data.xp.toLocaleString();
            if(tofVal) tofVal.innerText = data.tof.toLocaleString() + " TOF";
            
            // Foto Profil
            if(userImg && data.img) {
                userImg.src = data.img;
                userImg.style.display = 'block';
                if(userIcon) userIcon.style.display = 'none';
            }

            // Data Dinamis (Alamat & Hobi)
            const infoAlamat = document.getElementById('info-alamat');
            const infoHobi = document.getElementById('info-hobi');
            if(infoAlamat) infoAlamat.innerText = data.alamat || "Menoreh";
            if(infoHobi) infoHobi.innerText = data.hobi || "Grower";
        }

        // Aktifkan Fitur Posting
        const postArea = document.getElementById('main-post-area');
        const btnPost = document.getElementById('btn-post');
        const statusMsg = document.getElementById('post-status-msg');
        
        if(postArea) {
            postArea.disabled = false;
            postArea.placeholder = "Halo @" + username + ", bagikan progresmu...";
            if(btnPost) {
                btnPost.disabled = false;
                btnPost.style.background = "#00f2ff";
                btnPost.style.color = "#000";
                btnPost.style.cursor = "pointer";
            }
            if(statusMsg) {
                statusMsg.innerText = "Status: Online";
                statusMsg.style.color = "#55efc4";
            }
        }
    }

    // Status Wallet
    if (address) {
        const btnConnect = document.getElementById('btn-connect');
        if(btnConnect) {
            btnConnect.innerText = "WALLET ACTIVE";
            btnConnect.style.borderColor = "#55efc4";
            btnConnect.style.color = "#55efc4";
        }
        const displayRole = document.getElementById('display-role');
        if(displayRole) displayRole.innerText = "ADDR: " + address.substring(0,6) + "...";
    }
}

// --- 6. INTERAKSI SOSIAL ---
function sruputKopi(element) {
    let count = parseInt(element.innerText.replace(/[^0-9]/g, '')) || 0;
    count++;
    element.innerHTML = `☕ ${count} Sruput`;
    element.style.color = "#00f2ff";
    element.style.textShadow = "0 0 8px #00f2ff";
}

// --- 7. AUTO-RUN (KEPALA SISTEM) ---
window.onload = function() {
    updateEconomyData();
    
    const savedAddress = localStorage.getItem('tof_user_address');
    updateUI(savedAddress);

    if (peraWallet) {
        peraWallet.reconnectSession().then((accounts) => {
            if (accounts.length > 0) updateUI(accounts[0]);
        });
    }
};