function saveProfile() {
    const name = document.getElementById('user-name').value;
    const role = document.getElementById('user-role').value;
    
    if (name && role) {
        localStorage.setItem('tof_user_name', name);
        localStorage.setItem('tof_user_role', role);
        alert("Profil disimpan secara lokal. Tunggu verifikasi TOF dari Mastermind untuk mulai posting!");
        location.reload(); // Refresh untuk update tampilan
    } else {
        alert("Isi nama dan keahlian dulu, Lur!");
    }
}

// Fungsi Update UI yang lebih pintar
function updateUI(address) {
    const shortAddress = address.substring(0, 6) + "..." + address.substring(54);
    
    // Tampilkan form profil kalau sudah konek
    const profileForm = document.getElementById('profile-setup');
    if(profileForm) profileForm.style.display = 'block';

    // Ambil data profil dari storage
    const savedName = localStorage.getItem('tof_user_name') || "Member Baru";
    const savedRole = localStorage.getItem('tof_user_role') || "ADDR: " + shortAddress;

    // Update Text di Dashboard
    const nameDisplay = document.querySelector('h3');
    if(nameDisplay) nameDisplay.innerText = savedName;
    
    const roleDisplay = document.querySelector('.side-widget p');
    if(roleDisplay) roleDisplay.innerText = savedRole;

    // Matikan tombol post kalau belum punya TOF (Simulasi)
    const postArea = document.querySelector('.feed-container .tof-card textarea');
    if(postArea) {
        postArea.placeholder = "Hubungi Mastermind untuk verifikasi TOF agar bisa posting...";
        postArea.disabled = true;
    }
}