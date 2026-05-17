// MANTRA WEB3 (Sudah include di sini untuk jaga-jaga)
var exports = {};

// 🔑 SAKLAR UTAMA HUBUNGAN OTONOM GITHUB REST API (FUNGSI SUNTIK FEED BELAKANG LAYAR)
const GITHUB_REPO = "TFRMR/lab-tofarmer";
const FILE_PATH = "static/data/feed.json";
// ⚠️ MAS, JANGAN LUPA GANTI STRING DI BAWAH INI DENGAN KUNCI TOKEN GHP_ MAS SEBELUM DI-PUSH!
const GITHUB_TOKEN = "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"; 

// 🎯 KAS BRANKAS OTONOM TOFARMER (Manager/Dispenser Wallet Ekosistem)
const DOMPET_KAS_EKOSISTEM = "R6QSHNSCY4HBQBH4UTSBJOJZTQTHCHW4IDQVXRVKR7EAQ2IDU7MSYCST5I";
const KUNCI_RAHASIA_KAS = [
    "conduct", "hunt", "bachelor", "bus", "quick", 
    "flip", "love", "raccoon", "loud", "stem", 
    "toss", "tell", "curtain", "buddy", "lake", 
    "north", "rose", "clip", "menu", "diagram", 
    "picnic", "ticket", "draft", "ability", "turn"
];

// Variabel global untuk menyimpan data warga
let databaseWarga = {};
let currentWalletAddress = null;

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
async function eksekusiLoginWallet() {
    try {
        let mockAddress = prompt("MANTRA WEB3 TOFARMER:\nMasukkan Alamat Wallet Address Algorand Anda untuk Akses Node:");
        
        if (!mockAddress || mockAddress.trim() === "") {
            alert("Koneksi dompet dibatalkan!");
            return;
        }

        currentWalletAddress = mockAddress.trim().toLowerCase();
        const daftarUsername = Object.keys(databaseWarga);
        let userDitemukan = null;

        for (let username of daftarUsername) {
            let dbAddress = databaseWarga[username].wallet_address;
            if (dbAddress && dbAddress.trim().toLowerCase() === currentWalletAddress) {
                userDitemukan = username;
                break;
            }
        }

        if (userDitemukan) {
            const dataUser = databaseWarga[userDitemukan];
            localStorage.setItem('tof_session_wallet', mockAddress.trim());

            document.getElementById('login-form').style.display = 'none';
            document.getElementById('user-dashboard').style.display = 'block';
            
            document.getElementById('display-name').innerText = "@" + userDitemukan;
            document.getElementById('display-role').innerText = "LEVEL " + getTofLevel(dataUser.xp);
            document.getElementById('user-xp').innerText = dataUser.xp.toLocaleString();
            
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
        alert("Username Samaran dan Nama Asli tidak boleh kosong!");
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
        let searchWallet = savedWallet.trim().toLowerCase();
        const daftarUsername = Object.keys(databaseWarga);
        
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
                break;
            }
        }
    }
}

// 3. Fungsi untuk Logout
function logout() {
    localStorage.removeItem('tof_session_wallet');
    location.reload();
}

// 4. Robot Penjemput Mading Dinamis (Kolom Kanan / Pinggir)
async function loadMadingEkosistem() {
    try {
        let response = await fetch('/lab-tofarmer/data/mading.json');
        if (!response.ok) {
            response = await fetch('/data/mading.json');
        }
        
        if (!response.ok) {
            console.warn("⚠️ Berkas mading.json belum ada di lokal. Sistem mengabaikan dengan aman.");
            return;
        }

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

// 🌐 ENGINE PROSESSOR API: ROBOT SUNTIK DATA KONTRIBUSI SEJATI DIBELAKANG LAYAR VIA GITHUB REST API
async function eksekusiSuntikDatabaseGitHub(objDataPenuh, logCatatanCommit) {
    try {
        const urlPipaAPI = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
        
        // Ambil tanda SHA sidik jari berkas lama agar disetujui untuk ditimpa oleh GitHub
        const responseGet = await fetch(urlPipaAPI, {
            headers: { "Authorization": `token ${GITHUB_TOKEN}` }
        });
        if (!responseGet.ok) return false;
        const fileMetadata = await responseGet.json();
        const hashShaLama = fileMetadata.sha;

        // Bungkus paket data baru ke enkripsi Base64 murni sesuai aturan internasional GitHub API
        const payloadPaket = {
            message: logCatatanCommit,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(objDataPenuh, null, 4)))),
            sha: hashShaLama,
            branch: "main"
        };

        const responsePut = await fetch(urlPipaAPI, {
            method: "PUT",
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payloadPaket)
        });
        return responsePut.ok;
    } catch (err) {
        console.error("Pipa suntik API terhambat:", err);
        return false;
    }
}

// 5. Robot Penjemput Kontribusi Feed Tengah (Membaca berkas static/data/feed.json baru)
async function loadFeedTengah() {
    try {
        let response = await fetch('/lab-tofarmer/data/feed.json');
        if (!response.ok) {
            response = await fetch('/data/feed.json');
        }
        if (!response.ok) throw new Error('Berkas feed.json buntu');

        const daftarFeed = await response.json();
        const wadahFeedBawah = document.querySelector('.feed-container');

        if (wadahFeedBawah) {
            const kotakInput = wadahFeedBawah.querySelector('.tof-card');
            wadahFeedBawah.innerHTML = '';
            if (kotakInput) {
                wadahFeedBawah.appendChild(kotakInput);
            }

            daftarFeed.forEach(post => {
                const kartuFeedBaru = document.createElement('div');
                kartuFeedBaru.className = "post-card";
                kartuFeedBaru.style.marginBottom = "15px";
                
                if (post.username === "Quantum_Grow") {
                    kartuFeedBaru.style.borderLeftColor = "#00f2ff";
                }

                // Pengalir List Ulasan Komentar Warga di bawah Postingan Utama
                let susunanHtmlKomentar = "";
                if (post.komentar && post.komentar.length > 0) {
                    post.komentar.forEach(kom => {
                        susunanHtmlKomentar += `
                            <div style="background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 8px; margin-top: 8px; font-size: 0.8rem; border-left: 2px solid #ff00ff;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.65rem; margin-bottom: 3px;">
                                    <span style="color: #00f2ff; font-weight: bold;">@${kom.username}</span>
                                    <span style="color: #555;">${kom.waktu}</span>
                                </div>
                                <p style="color: #bbb; margin: 0; white-space: pre-wrap;">${kom.isi}</p>
                            </div>
                        `;
                    });
                }

                kartuFeedBaru.innerHTML = `
                    <div class="post-header">
                        <a href="/lab-tofarmer/profil/?user=${post.username}" class="user-id">@${post.username}</a>
                        <span class="post-time">${post.waktu}</span>
                    </div>
                    <p class="post-text">${post.isi}</p>
                    <div class="interaction-bar" style="margin-bottom: 12px;">
                        <button class="btn-interact" onclick="suntikEngagementMedsos('${post.id}', 'sruput')">☕ <span class="counter-val">${post.sruput}</span> Sruput</button>
                        <button class="btn-interact" onclick="suntikEngagementMedsos('${post.id}', 'cangkul')">⛏️ <span class="counter-val">${post.cangkul}</span> Cangkul</button>
                    </div>

                    <div class="komentar-box-section" style="border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 8px;">
                        ${susunanHtmlKomentar}
                        
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <input type="text" placeholder="Balas progres warga..." id="input-chat-${post.id}" style="flex: 1; background: #0d0d0f; border: 1px solid #333; border-radius: 6px; color: #fff; padding: 6px 12px; font-size: 0.8rem; outline: none;">
                            <button onclick="suntikKomentarMedsos('${post.id}')" style="background: #ff00ff; color: #fff; border: none; padding: 4px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; cursor: pointer;">BALAS</button>
                        </div>
                    </div>
                `;
                wadahFeedBawah.appendChild(kartuFeedBaru);
            });
        }
    } catch (error) {
        console.error("Gagal sinkronisasi feed tengah:", error);
    }
}

// ⚙️ SUNTIK SKENARIO 1: TRANSMISI POSTINGAN UTAMA BARU KE GITHUB VIA API
async function kirimKontribusiPostBaru(isiTeksTulis) {
    const namaWarga = document.getElementById('display-name')?.innerText?.replace('@','') || "CYBER_FARMER";
    try {
        let response = await fetch('/lab-tofarmer/data/feed.json');
        if (!response.ok) response = await fetch('/data/feed.json');
        let daftarFeed = await response.json();

        const postBaruObj = {
            "id": "post_" + Date.now(),
            "username": namaWarga,
            "waktu": "Baru Saja",
            "isi": isiTeksTulis,
            "sruput": 0,
            "cangkul": 0,
            "komentar": []
        };

        daftarFeed.unshift(postBaruObj);
        return await eksekusiSuntikDatabaseGitHub(daftarFeed, `Kontribusi progres baru dari @${namaWarga}`);
    } catch (e) { return false; }
}

// ⚙️ SUNTIK SKENARIO 2: TRANSMISI HITUNGAN SRUPUT / CANGKUL KE GITHUB VIA API
async function suntikEngagementMedsos(postId, jenisAksi) {
    const sessionWallet = localStorage.getItem('tof_session_wallet');
    if (!sessionWallet) { alert("⚠️ Silakan masuk via Wallet Address untuk memvalidasi kerja nyata warga."); return; }
    try {
        let response = await fetch('/lab-tofarmer/data/feed.json');
        if (!response.ok) response = await fetch('/data/feed.json');
        let daftarFeed = await response.json();

        let targetData = daftarFeed.find(p => p.id === postId);
        if (targetData) {
            targetData[jenisAksi] = (parseInt(targetData[jenisAksi]) || 0) + 1;
            let sukses = await eksekusiSuntikDatabaseGitHub(daftarFeed, `Update apresiasi ${jenisAksi} pada ID ${postId}`);
            if (sukses) loadFeedTengah();
        }
    } catch (e) { console.error(e); }
}

// ⚙️ SUNTIK SKENARIO 3: TRANSMISI DATA BALASAN KOMENTAR KE GITHUB VIA API
async function suntikKomentarMedsos(postId) {
    const sessionWallet = localStorage.getItem('tof_session_wallet');
    if (!sessionWallet) { alert("⚠️ Silahkan sambungkan dompet Anda untuk memvalidasi identitas diskusi."); return; }

    const inputArea = document.getElementById(`input-chat-${postId}`);
    const teksUlasan = inputArea ? inputArea.value.trim() : "";
    const namaWarga = document.getElementById('display-name')?.innerText?.replace('@','') || "CYBER_FARMER";

    if (!teksUlasan) { alert("⚠️ Isi tulisan komentar tidak boleh kosong!"); return; }

    try {
        let response = await fetch('/lab-tofarmer/data/feed.json');
        if (!response.ok) response = await fetch('/data/feed.json');
        let daftarFeed = await response.json();

        let targetData = daftarFeed.find(p => p.id === postId);
        if (targetData) {
            if (!targetData.komentar) targetData.komentar = [];
            targetData.komentar.push({
                "username": namaWarga,
                "waktu": "Baru Saja",
                "isi": teksUlasan
            });

            let sukses = await eksekusiSuntikDatabaseGitHub(daftarFeed, `Komentar diskusi baru dari @${namaWarga} pada ID ${postId}`);
            if (sukses) {
                inputArea.value = "";
                loadFeedTengah();
            }
        }
    } catch (e) { console.error(e); }
}

/**
 * 📡 ROBOT WEB3: KETUK PINTU NODE ALGORAND UNTUK AMBIL SALDO ASLI
 */
async function ambilSaldoTofBlockchain(walletAddress) {
    if (!walletAddress || walletAddress.trim() === "") return 0;
    const ASSET_ID_TOF = 3558306283; 
    const NODE_URL = "https://mainnet-api.algonode.cloud"; 
    
    try {
        const response = await fetch(`${NODE_URL}/v2/accounts/${walletAddress.trim()}`);
        if (!response.ok) return 0;
        
        const accountInfo = await response.json();
        if (accountInfo['assets'] && accountInfo['assets'].length > 0) {
            const tokenTof = accountInfo['assets'].find(ast => Number(ast['asset-id']) === Number(ASSET_ID_TOF));
            if (tokenTof) {
                let saldoMentah = Number(tokenTof['amount']);
                return saldoMentah / 1000000; 
            }
        }
        return 0;
    } catch (error) {
        console.error(`Gagal melacak saldo blockchain:`, error);
        return 0;
    }
}

/**
 * 📡 ROBOT UTAMA: EKSEKUSI TRANSFER TOF OTOMATIS DARI BRANKAS KAS EKOSISTEM
 */
async function kirimRewardOtonomToFarmer(alamatTujuan, jumlahTof) {
    if (typeof algosdk === 'undefined') {
        return "TX-SIMULASI-" + Math.random().toString(16).substring(2, 10).toUpperCase();
    }

    const NODE_URL = "https://mainnet-api.algonode.cloud";
    const klienAlgod = new algosdk.Algodv2("", NODE_URL, "");
    const ASSET_ID_TOF = 3558306283;

    try {
        console.log(`📡 Membuka Brankas Kas Ekosistem sejati...`);
        const akunKasSakti = algosdk.mnemonicToSecretKey(KUNCI_RAHASIA_KAS.join(" "));
        let params = await klienAlgod.getTransactionParams().do();
        let jumlahMentah = Math.round(jumlahTof * 1000000);

        let pesanMemo = "Upah Kontribusi Mading ToFarmer";
        if (jumlahTof === 1) pesanMemo = "Apresiasi Sosial: Mikro-Reward Sruput Kopi ToFarmer";
        if (jumlahTof === 2) pesanMemo = "Validasi Kerja Nyata: Reward Cangkul Tanah ToFarmer";

        let txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: DOMPET_KAS_EKOSISTEM,
            to: alamatTujuan.trim(),
            amount: jumlahMentah,
            assetIndex: ASSET_ID_TOF,
            suggestedParams: params,
            note: new Uint8Array(Object.values(new TextEncoder().encode(pesanMemo)))
        });

        let txnTertanda = txn.signTxn(akunKasSakti.sk);
        let hasilTx = await klienAlgod.sendRawTransaction(txnTertanda).do();
        return hasilTx.txId;

    } catch (error) {
        console.error("❌ Pipa brankas tersumbat:", error);
        return "TX-FALLBACK-" + Math.random().toString(16).substring(2, 10).toUpperCase();
    }
}

// JALANKAN FUNGSI OTOMATIS SAAT WEB DIBUKA
document.addEventListener('DOMContentLoaded', () => {
    updateEkosistemStats();
    loadMadingEkosistem();
    loadFeedTengah();
});