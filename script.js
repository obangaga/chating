// ===================== BAGIAN 1: DATABASE KARYAWAN =====================
// 30 KARYAWAN DENGAN PASSWORD UNIK
const DATABASE_KARYAWAN = {
  // Management
  "Budi Santoso": { password: "budi2024", jabatan: "Manager" },
  "Sari Dewi": { password: "sari2024", jabatan: "Asst. Manager" },
  "Ahmad Wijaya": { password: "ahmad2024", jabatan: "Supervisor" },
  
  // Tim Sales
  "Rina Permata": { password: "rina2024", jabatan: "Sales" },
  "Agus Prabowo": { password: "agus2024", jabatan: "Sales" },
  "Maya Sari": { password: "maya2024", jabatan: "Sales" },
  "Dedi Kurniawan": { password: "dedi2024", jabatan: "Sales" },
  "Lina Hartati": { password: "lina2024", jabatan: "Sales" },
  
  // Tim Admin
  "Rizki Ramadhan": { password: "rizki2024", jabatan: "Admin" },
  "Dewi Lestari": { password: "dewi2024", jabatan: "Admin" },
  "Fajar Nugroho": { password: "fajar2024", jabatan: "Admin" },
  "Nina Permatasari": { password: "nina2024", jabatan: "Admin" },
  
  // Tim Finance
  "Hendra Setiawan": { password: "hendra2024", jabatan: "Finance" },
  "Yuni Anggraeni": { password: "yuni2024", jabatan: "Finance" },
  "Bambang Sudrajat": { password: "bambang2024", jabatan: "Finance" },
  
  // Tim IT
  "Ryan Fernando": { password: "ryan2024", jabatan: "IT Support" },
  "Dina Marlina": { password: "dina2024", jabatan: "IT Support" },
  "Joko Susilo": { password: "joko2024", jabatan: "Developer" },
  
  // Tim Operasional
  "Siti Nurhaliza": { password: "siti2024", jabatan: "Operational" },
  "Rudi Hartono": { password: "rudi2024", jabatan: "Operational" },
  "Mila Kurnia": { password: "mila2024", jabatan: "Operational" },
  "Eko Prasetyo": { password: "eko2024", jabatan: "Operational" },
  "Tina Wulandari": { password: "tina2024", jabatan: "Operational" },
  
  // Tim Marketing
  "Rama Aditya": { password: "rama2024", jabatan: "Marketing" },
  "Citra Kirana": { password: "citra2024", jabatan: "Marketing" },
  "Andi Saputra": { password: "andi2024", jabatan: "Marketing" },
  
  // Tim HRD
  "Linda Suryani": { password: "linda2024", jabatan: "HRD" },
  "Firman Syah": { password: "firman2024", jabatan: "HRD" },
  
  // Tim Gudang
  "Wawan Kurniawan": { password: "wawan2024", jabatan: "Warehouse" },
  "Rini Astuti": { password: "rini2024", jabatan: "Warehouse" },
  "Surya Dharma": { password: "surya2024", jabatan: "Warehouse" },
  
  // Owner
  "Oban Ganteng": { password: "obanmaster", jabatan: "Owner" }
};

// Supabase Configuration
const SUPABASE_URL = 'https://vkiwybsmthajokhjchhq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZraXd5YnNtdGhham9raGpjaGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDg3MzgsImV4cCI6MjA4MTI4NDczOH0.kv5AssAozL9p7Y5fCkZPpaN49LklvY17CyHUbByC-jg';

// ===================== BAGIAN 2: VARIABEL GLOBAL =====================
let supabase = null;
let chatUser = null;
let chatMessages = [];
let isRealtimeSubscribed = false;
let currentKaryawan = null;
let autoLogoutInterval = null;

// ===================== BAGIAN 3: SISTEM LOGIN KARYAWAN =====================

// Tampilkan daftar karyawan di form login
function displayKaryawanList() {
  const listContainer = document.getElementById('karyawanList');
  if (!listContainer) return;
  
  let html = '';
  Object.keys(DATABASE_KARYAWAN).forEach((nama, index) => {
    const karyawan = DATABASE_KARYAWAN[nama];
    html += `<div class="karyawan-item">${index + 1}. ${nama} - ${karyawan.jabatan}</div>`;
  });
  
  listContainer.innerHTML = html;
}

// Handle login karyawan
function handleLogin() {
  const nama = document.getElementById('namaInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const errorMsg = document.getElementById('loginError');
  
  // Validasi input
  if (!nama || !password) {
    errorMsg.textContent = "Nama dan password harus diisi!";
    errorMsg.style.display = "block";
    return;
  }
  
  // Cek apakah karyawan ada di database
  if (DATABASE_KARYAWAN[nama]) {
    // Cek password
    if (DATABASE_KARYAWAN[nama].password === password) {
      // Login sukses
      errorMsg.style.display = "none";
      currentKaryawan = {
        nama: nama,
        jabatan: DATABASE_KARYAWAN[nama].jabatan,
        loginTime: new Date().toISOString()
      };
      
      // Simpan ke localStorage
      localStorage.setItem('obanKaryawan', JSON.stringify(currentKaryawan));
      localStorage.setItem('obanAuthenticated', 'true');
      
      // Tampilkan dashboard
      showDashboard();
      
      // Setup chat dengan nama karyawan
      setupChatForKaryawan(nama);
      
    } else {
      errorMsg.textContent = "Password salah!";
      errorMsg.style.display = "block";
    }
  } else {
    errorMsg.textContent = "Nama karyawan tidak terdaftar!";
    errorMsg.style.display = "block";
  }
}

// Tampilkan dashboard setelah login sukses
function showDashboard() {
  // Sembunyikan login overlay
  document.getElementById('loginOverlay').style.display = 'none';
  
  // Tampilkan semua elemen dashboard
  document.getElementById('mainHeader').style.display = 'block';
  document.getElementById('runningText').style.display = 'block';
  document.getElementById('mainContent').style.display = 'grid';
  document.getElementById('floatingPhoto').style.display = 'block';
  document.getElementById('floatingFooter').style.display = 'block';
  
  // Update nama user di header
  document.getElementById('loggedInUser').textContent = currentKaryawan.nama;
  
  // Update nama di chat
  document.getElementById('currentUsername').textContent = currentKaryawan.nama;
  
  // Setup auto logout schedule
  setupAutoLogoutSchedule();
  displayLogoutScheduleInfo();
  
  // Animasi typewriter
  setTimeout(() => {
    initGlowTypewriter();
  }, 500);
}

// ===================== BAGIAN 3A: AUTO LOGOUT SYSTEM =====================

// Setup jadwal logout otomatis
function setupAutoLogoutSchedule() {
  // Hapus interval sebelumnya jika ada
  if (autoLogoutInterval) {
    clearInterval(autoLogoutInterval);
  }
  
  // Cek setiap 1 menit
  autoLogoutInterval = setInterval(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Jam logout yang ditentukan: 07:00, 14:00, 21:00
    const logoutTimes = [7, 14, 21];
    
    // Cek apakah sekarang jam tepat untuk logout
    if (logoutTimes.includes(currentHour) && currentMinute === 0) {
      // Cek apakah user sedang login
      if (currentKaryawan && localStorage.getItem('obanAuthenticated') === 'true') {
        console.log(`🕐 Auto logout triggered at ${currentHour}:00`);
        performAutoLogout();
      }
    }
    
    // Update countdown ke logout berikutnya
    updateNextLogoutCountdown();
    
  }, 60000); // Cek setiap 1 menit
  
  // Jalankan sekali saat pertama login
  updateNextLogoutCountdown();
}

// Fungsi untuk melakukan logout otomatis
function performAutoLogout() {
  const namaKaryawan = currentKaryawan ? currentKaryawan.nama : 'User';
  const currentHour = new Date().getHours();
  
  // Kirim notifikasi ke chat sebelum logout
  if (supabase) {
    sendAutoLogoutMessage(namaKaryawan, currentHour);
  }
  
  // Tampilkan notifikasi ke user
  alert(`🕐 WAKTU LOGOUT OTOMATIS\n\nSesi telah berakhir pukul ${currentHour}:00\nSilakan login kembali untuk melanjutkan.`);
  
  // Lakukan logout
  forceLogout();
}

// Logout paksa tanpa konfirmasi
function forceLogout() {
  // Hentikan auto logout interval
  if (autoLogoutInterval) {
    clearInterval(autoLogoutInterval);
    autoLogoutInterval = null;
  }
  
  // Hapus info jadwal logout
  const infoElement = document.getElementById('logoutScheduleInfo');
  if (infoElement) {
    infoElement.style.display = 'none';
  }
  
  // Kirim pesan logout ke chat
  if (supabase && currentKaryawan) {
    sendLogoutMessage(currentKaryawan.nama);
  }
  
  // Clear semua data
  localStorage.removeItem('obanKaryawan');
  localStorage.removeItem('obanAuthenticated');
  localStorage.removeItem('obanChatUsername');
  
  // Reset form login
  document.getElementById('namaInput').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('loginError').style.display = 'none';
  
  // Sembunyikan dashboard
  document.getElementById('mainHeader').style.display = 'none';
  document.getElementById('runningText').style.display = 'none';
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('floatingPhoto').style.display = 'none';
  document.getElementById('floatingFooter').style.display = 'none';
  
  // Tampilkan login screen
  document.getElementById('loginOverlay').style.display = 'flex';
  
  // Reset variabel
  currentKaryawan = null;
  chatUser = null;
  chatMessages = [];
}

// Kirim pesan auto logout ke chat
async function sendAutoLogoutMessage(nama, hour) {
  try {
    await supabase
      .from('chat_messages')
      .insert([
        { 
          username: 'System', 
          message: `🕐 ${nama} telah logout otomatis (jadwal jam ${hour}:00)`,
          room: 'karyawan'
        }
      ]);
  } catch (error) {
    console.error('Error sending auto logout message:', error);
  }
}

// Hitung dan tampilkan countdown ke logout berikutnya
function updateNextLogoutCountdown() {
  if (!currentKaryawan) return;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const logoutTimes = [7, 14, 21];
  
  // Cari jam logout berikutnya
  let nextLogoutHour = null;
  for (const hour of logoutTimes.sort((a, b) => a - b)) {
    if (hour > currentHour || (hour === currentHour && 0 > currentMinute)) {
      nextLogoutHour = hour;
      break;
    }
  }
  
  // Jika tidak ada di hari ini, ambil jam pertama besok
  if (!nextLogoutHour) {
    nextLogoutHour = logoutTimes[0];
  }
  
  // Hitung selisih waktu
  const nextLogoutTime = new Date(now);
  nextLogoutTime.setHours(nextLogoutHour, 0, 0, 0);
  
  // Jika jam berikutnya sudah lewat, tambah 1 hari
  if (nextLogoutTime <= now) {
    nextLogoutTime.setDate(nextLogoutTime.getDate() + 1);
  }
  
  const diffMs = nextLogoutTime - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // Update UI
  const countdownElement = document.getElementById('logoutCountdown');
  if (countdownElement) {
    const timeNames = {7: "Pagi (07:00)", 14: "Siang (14:00)", 21: "Malam (21:00)"};
    countdownElement.innerHTML = `Next: ${timeNames[nextLogoutHour]}<br>${diffHours}j ${diffMinutes}m lagi`;
  }
}

// Fungsi untuk menampilkan info jadwal logout di UI
function displayLogoutScheduleInfo() {
  const infoElement = document.getElementById('logoutScheduleInfo');
  
  if (infoElement && currentKaryawan) {
    infoElement.style.display = 'block';
    infoElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px; color: #FF9800;">⏰ Jadwal Logout Otomatis:</div>
      <div style="font-size: 0.85em;">
        <div>• 07:00 (Pagi)</div>
        <div>• 14:00 (Siang)</div>
        <div>• 21:00 (Malam)</div>
      </div>
      <div style="margin-top: 8px; font-size: 0.8em; color: #00e0c6; border-top: 1px solid rgba(255,152,0,0.3); padding-top: 5px;">
        <div id="logoutCountdown">Menghitung...</div>
      </div>
    `;
  }
}

// Setup chat dengan nama karyawan
function setupChatForKaryawan(nama) {
  chatUser = nama;
  localStorage.setItem('obanChatUsername', nama);
  
  updateUserStatus();
  updateConnectionStatus();
  
  // Initialize chat
  if (supabase) {
    loadMessagesFromSupabase();
    setupRealtimeListener();
  } else {
    loadMessagesFromLocal();
  }
  
  // Kirim pesan selamat datang ke chat
  setTimeout(() => {
    if (supabase) {
      sendWelcomeMessage(nama);
    } else {
      addSystemMessageLocal(`👋 Selamat datang ${nama} di chat karyawan!`);
    }
  }, 1000);
}

// Kirim pesan selamat datang ke Supabase
async function sendWelcomeMessage(nama) {
  try {
    await supabase
      .from('chat_messages')
      .insert([
        { 
          username: 'System', 
          message: `👋 ${nama} telah bergabung di chat!`,
          room: 'karyawan'
        }
      ]);
  } catch (error) {
    console.error('Error sending welcome:', error);
  }
}

// Logout system manual
function handleLogout() {
  if (confirm("Yakin mau logout dari dashboard?")) {
    // Hentikan auto logout interval
    if (autoLogoutInterval) {
      clearInterval(autoLogoutInterval);
      autoLogoutInterval = null;
    }
    
    // Hapus info jadwal logout
    const infoElement = document.getElementById('logoutScheduleInfo');
    if (infoElement) {
      infoElement.style.display = 'none';
    }
    
    // Kirim pesan logout ke chat
    if (supabase && currentKaryawan) {
      sendLogoutMessage(currentKaryawan.nama);
    }
    
    // Clear semua data
    localStorage.removeItem('obanKaryawan');
    localStorage.removeItem('obanAuthenticated');
    localStorage.removeItem('obanChatUsername');
    
    // Reset form login
    document.getElementById('namaInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').style.display = 'none';
    
    // Sembunyikan dashboard
    document.getElementById('mainHeader').style.display = 'none';
    document.getElementById('runningText').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('floatingPhoto').style.display = 'none';
    document.getElementById('floatingFooter').style.display = 'none';
    
    // Tampilkan login screen
    document.getElementById('loginOverlay').style.display = 'flex';
    
    // Reset variabel
    currentKaryawan = null;
    chatUser = null;
    chatMessages = [];
  }
}

// Kirim pesan logout ke chat
async function sendLogoutMessage(nama) {
  try {
    await supabase
      .from('chat_messages')
      .insert([
        { 
          username: 'System', 
          message: `👋 ${nama} telah logout dari sistem.`,
          room: 'karyawan'
        }
      ]);
  } catch (error) {
    console.error('Error sending logout message:', error);
  }
}

// Cek status login saat halaman dimuat
function checkLoginStatus() {
  const savedKaryawan = localStorage.getItem('obanKaryawan');
  const isLoggedIn = localStorage.getItem('obanAuthenticated');
  
  if (savedKaryawan && isLoggedIn === 'true') {
    try {
      currentKaryawan = JSON.parse(savedKaryawan);
      showDashboard();
      setupChatForKaryawan(currentKaryawan.nama);
    } catch (error) {
      console.error('Error parsing karyawan data:', error);
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('loginOverlay').style.display = 'flex';
  displayKaryawanList();
}

// ===================== BAGIAN 4: SISTEM LOADING =====================

function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const progressBar = document.getElementById('loadingProgress');
  
  if (progressBar) progressBar.style.width = '0%';
  
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function updateLoadingProgress(progress, stats) {
  const progressBar = document.getElementById('loadingProgress');
  const loadingStats = document.getElementById('loadingStats');
  
  if (progressBar) progressBar.style.width = progress + '%';
  
  if (stats && loadingStats) {
    loadingStats.innerHTML = `
      <div><div style="color: #00e0c6;">${stats.transactions || 0}</div><div>Transaksi</div></div>
      <div><div style="color: #4CAF50;">${stats.lines || 0}</div><div>Baris Data</div></div>
      <div><div style="color: #FFD700;">${Math.min(progress, 100)}%</div><div>Progress</div></div>
    `;
  }
}

// ===================== BAGIAN 5: PEMROSESAN DATA =====================

async function formatData() {
  if (!currentKaryawan) {
    alert("Silakan login terlebih dahulu!");
    return;
  }

  const rawData = document.getElementById("rawData").value;
  if (!rawData.trim()) {
    alert("Masukkan data terlebih dahulu!");
    return;
  }

  try {
    showLoading();
    updateLoadingProgress(10, { lines: 0, transactions: 0 });
    
    const transactions = await parseRawDataWithProgress(rawData);
    
    updateLoadingProgress(60, { 
      lines: rawData.split(/\r?\n/).length, 
      transactions: transactions.length 
    });
    
    if (transactions.length === 0) {
      hideLoading();
      alert("Tidak ada transaksi yang berhasil diparsing!");
      return;
    }

    const statistics = calculateStatistics(transactions);
    
    updateLoadingProgress(80, { 
      lines: rawData.split(/\r?\n/).length, 
      transactions: transactions.length 
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateLoadingProgress(100, { 
      lines: rawData.split(/\r?\n/).length, 
      transactions: transactions.length 
    });
    
    displayStatisticsInResult(statistics, transactions);
    
    setTimeout(() => {
      hideLoading();
    }, 300);
    
  } catch (error) {
    hideLoading();
    alert("Error memproses data: " + error.message);
    console.error(error);
  }
}

async function parseRawDataWithProgress(rawData) {
  const lines = rawData.split(/\r?\n/);
  const transactions = [];
  let currentTransaction = null;
  
  const batchSize = Math.max(1, Math.floor(lines.length / 10));
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (isTransactionHeader(line)) {
      if (currentTransaction) transactions.push(currentTransaction);
      currentTransaction = parseTransactionHeader(line);
      continue;
    }

    if (isTotalLine(line) && currentTransaction) {
      const totalMatch = extractGrandTotal(line);
      if (totalMatch) currentTransaction.grandTotal = totalMatch;
    }
    
    if (i % batchSize === 0) {
      const progress = Math.min(50, Math.floor((i / lines.length) * 50));
      updateLoadingProgress(10 + progress, { 
        lines: lines.length, 
        transactions: transactions.length 
      });
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  if (currentTransaction) transactions.push(currentTransaction);
  return transactions.filter((t) => t.grandTotal > 0);
}

function isTransactionHeader(line) {
  return /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?/.test(line) && /TJ\d+/.test(line);
}

function parseTransactionHeader(line) {
  const parts = line.split(/\t| {2,}/);
  return {
    timestamp: parts[0]?.trim() || "",
    transactionId: parts[1]?.trim() || "",
    grandTotal: 0,
  };
}

function isTotalLine(line) {
  return /Total\+PPN\+Ongkir/i.test(line);
}

function extractGrandTotal(line) {
  const regex = /Total\+PPN\+Ongkir\s*[:\t ]+\s*([\d.,]+)/i;
  const match = line.match(regex);
  if (match && match[1]) {
    const clean = match[1].replace(/[^\d]/g, "");
    return parseInt(clean) || 0;
  }
  const fallback = line.match(/([\d.,]+)\s*$/);
  if (fallback && fallback[1]) {
    const clean = fallback[1].replace(/[^\d]/g, "");
    return parseInt(clean) || 0;
  }
  return 0;
}

function formatCurrency(amount) {
  return amount.toLocaleString("id-ID");
}

function calculateStatistics(transactions) {
  const totalAmount = transactions.reduce((a, t) => a + t.grandTotal, 0);
  return {
    totalTransactions: transactions.length,
    totalAmount,
  };
}

function displayStatisticsInResult(stats, transactions) {
  const resultDiv = document.getElementById("formattedResult");
  
  const copyText = `HASIL PERHITUNGAN TRANSAKSI
Diproses oleh: ${currentKaryawan.nama}
Waktu: ${new Date().toLocaleString()}
===============================
Total Nilai: Rp ${formatCurrency(stats.totalAmount)}
Total Transaksi: ${stats.totalTransactions}
===============================`;
  
  if (resultDiv) {
    resultDiv.dataset.copyText = copyText;
    
    resultDiv.innerHTML = `
      <div class="single-card-container">
        <div class="single-card">
          <div class="card-title">MANTAP ${currentKaryawan.nama.split(' ')[0]}!</div>
          <div class="card-value">Rp ${formatCurrency(stats.totalAmount)}</div>
          <div class="card-subtitle">${stats.totalTransactions} Transaksi</div>
          <div style="color: #888; font-size: 0.8em; margin-top: 10px;">
            Diproses oleh: ${currentKaryawan.nama}
          </div>
        </div>
      </div>
    `;
  }
}

function clearData() {
  const rawData = document.getElementById("rawData");
  const resultDiv = document.getElementById("formattedResult");
  
  if (rawData) rawData.value = "";
  if (resultDiv) resultDiv.innerHTML = "Durung ana Hasile...";
}

function copyToClipboard() {
  const resultDiv = document.getElementById("formattedResult");
  const textToCopy = resultDiv?.dataset.copyText || resultDiv?.innerText || "";
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("Hasil berhasil disalin ke clipboard!");
  }).catch(err => {
    alert("Gagal menyalin: " + err);
  });
}

function downloadAsText() {
  const resultDiv = document.getElementById("formattedResult");
  const textToDownload = resultDiv?.dataset.copyText || resultDiv?.innerText || "";
  
  if (!textToDownload || textToDownload === "Durung ana Hasile...") {
    alert("Belum ada hasil yang bisa di-download!");
    return;
  }

  const blob = new Blob([textToDownload], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hasil-${currentKaryawan.nama.replace(/\s+/g, '-')}-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===================== BAGIAN 6: SISTEM CHAT KARYAWAN =====================

async function loadMessagesFromSupabase() {
  try {
    if (!supabase) throw new Error('Supabase not initialized');
    
    showChatLoading(true);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (error) throw error;
    
    chatMessages = (data || []).map(msg => ({
      id: msg.id,
      username: msg.username,
      message: msg.message,
      time: new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', minute: '2-digit' 
      }),
      date: new Date(msg.created_at).toLocaleDateString(),
      type: msg.username === 'System' ? 'system' : 'user',
      created_at: msg.created_at
    }));
    
    displayMessages();
    updateMessageCount();
    showChatLoading(false);
    
  } catch (error) {
    console.error('❌ Error loading from Supabase:', error);
    showChatLoading(false);
    loadMessagesFromLocal();
    addSystemMessageLocal('⚠️ Gagal load chat dari cloud, pakai data lokal');
  }
}

function loadMessagesFromLocal() {
  try {
    const saved = localStorage.getItem('obanChatMessages');
    if (saved) {
      chatMessages = JSON.parse(saved);
    } else {
      chatMessages = getDefaultMessages();
    }
    
    displayMessages();
    updateMessageCount();
    
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    chatMessages = getDefaultMessages();
    displayMessages();
  }
}

function getDefaultMessages() {
  return [
    { 
      id: 1, 
      username: 'System', 
      message: '💬 Selamat datang di Chat Room Karyawan!', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      type: 'system'
    },
    { 
      id: 2, 
      username: 'System', 
      message: '👥 Gunakan chat ini untuk komunikasi tim', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      type: 'system'
    }
  ];
}

function setupRealtimeListener() {
  if (!supabase || isRealtimeSubscribed) return;
  
  try {
    supabase
      .channel('oban-chat-karyawan')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages' 
        }, 
        (payload) => {
          const newMsg = payload.new;
          const msgTime = new Date(newMsg.created_at);
          const now = new Date();
          const timeDiff = Math.abs(now - msgTime);
          
          if (timeDiff < 3000) return;
          
          const formattedMsg = {
            id: newMsg.id,
            username: newMsg.username,
            message: newMsg.message,
            time: msgTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: msgTime.toLocaleDateString(),
            type: newMsg.username === 'System' ? 'system' : 'user',
            created_at: newMsg.created_at
          };
          
          const exists = chatMessages.some(m => 
            m.id === newMsg.id || 
            (m.username === newMsg.username && 
             m.message === newMsg.message && 
             Math.abs(new Date(m.created_at || 0) - msgTime) < 1000)
          );
          
          if (!exists) {
            chatMessages.push(formattedMsg);
            saveMessagesToLocal();
            displayMessages();
            updateMessageCount();
          }
        }
      )
      .subscribe((status) => {
        isRealtimeSubscribed = true;
        updateConnectionStatus();
      });
      
  } catch (error) {
    console.error('❌ Error setting up realtime:', error);
  }
}

async function sendMessage() {
  if (!currentKaryawan) {
    alert("Silakan login terlebih dahulu!");
    return;
  }
  
  const input = document.getElementById('chatInput');
  const message = input?.value.trim() || "";
  
  if (!message) {
    alert('Masukkan pesan dulu ya!');
    return;
  }
  
  if (message.length > 500) {
    alert('Pesan terlalu panjang (max 500 karakter)');
    return;
  }
  
  if (input) input.disabled = true;
  
  try {
    const localMsg = {
      id: Date.now(),
      username: currentKaryawan.nama,
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      type: 'user',
      created_at: new Date().toISOString(),
      pending: true
    };
    
    chatMessages.push(localMsg);
    displayMessages();
    updateMessageCount();
    
    if (input) input.value = '';
    
    if (supabase) {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          { 
            username: currentKaryawan.nama, 
            message: message,
            room: 'karyawan'
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      const msgIndex = chatMessages.findIndex(m => m.pending && m.message === message);
      if (msgIndex !== -1) {
        chatMessages[msgIndex].id = data.id;
        chatMessages[msgIndex].pending = false;
        chatMessages[msgIndex].created_at = data.created_at;
      }
      
    } else {
      addSystemMessageLocal('⚠️ Mode offline - Chat hanya disimpan lokal');
    }
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    addSystemMessageLocal('❌ Gagal mengirim ke server. Mode offline.');
    saveMessagesToLocal();
    
  } finally {
    if (input) {
      input.disabled = false;
      input.focus();
    }
  }
}

// FUNGSI CLEAR CHAT DENGAN KONFIRMASI
async function clearChat() {
  if (!confirm("⚠️  Yakin mau hapus SEMUA chat?\n\nIni akan menghapus dari CLOUD dan lokal!")) {
    return;
  }
  
  const verification = prompt("Ketik 'HAPUS' (huruf besar) untuk konfirmasi:");
  if (verification !== 'HAPUS') {
    alert('Penghapusan dibatalkan.');
    return;
  }
  
  try {
    if (supabase) {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .neq('id', 0);
      
      if (error) throw error;
    }
    
    chatMessages = [];
    localStorage.removeItem('obanChatMessages');
    
    displayMessages();
    updateMessageCount();
    
    addSystemMessageLocal('🧹 Semua chat telah dihapus');
    
  } catch (error) {
    console.error('Error clearing chat:', error);
    alert('Gagal menghapus dari cloud.');
  }
}

function saveMessagesToLocal() {
  try {
    const toSave = chatMessages.slice(-200).map(msg => ({
      ...msg,
      pending: undefined
    }));
    
    localStorage.setItem('obanChatMessages', JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function addSystemMessageLocal(message) {
  const systemMsg = {
    id: Date.now(),
    username: 'System',
    message: message,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString(),
    type: 'system'
  };
  
  chatMessages.push(systemMsg);
  displayMessages();
  updateMessageCount();
  saveMessagesToLocal();
}

function showChatLoading(show) {
  const chatContainer = document.getElementById('chatMessages');
  if (!chatContainer) return;
  
  if (show) {
    chatContainer.innerHTML = `
      <div style="color: #888; text-align: center; padding: 40px;">
        <div style="width: 40px; height: 40px; margin: 0 auto 15px; border: 3px solid #333; border-top-color: #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        🔄 Loading chat dari cloud...
      </div>
    `;
  }
}

function displayMessages() {
  const chatContainer = document.getElementById('chatMessages');
  if (!chatContainer) return;
  
  chatContainer.innerHTML = '';
  
  if (chatMessages.length === 0) {
    chatContainer.innerHTML = `
      <div style="color: #888; text-align: center; padding: 20px;">
        💬 Belum ada chat. Mulai percakapan!
      </div>
    `;
    return;
  }
  
  const recentMessages = chatMessages.slice(-50);
  
  recentMessages.forEach(msg => {
    const isCurrentUser = msg.username === currentKaryawan?.nama;
    const isSystem = msg.type === 'system';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSystem ? 'system' : (isCurrentUser ? 'own' : 'other')}`;
    
    const timeStr = msg.date === new Date().toLocaleDateString() ? 
                   `Hari ini ${msg.time}` : 
                   `${msg.date} ${msg.time}`;
    
    messageDiv.innerHTML = `
      ${!isSystem ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div style="font-weight: bold; color: ${isCurrentUser ? '#fff' : '#00e0c6'};">${msg.username}</div>
          <div style="font-size: 0.7em; color: ${isCurrentUser ? '#c8e6c9' : '#888'};">${msg.time}</div>
        </div>
      ` : ''}
      <div style="color: ${isSystem ? '#FF9800' : (isCurrentUser ? '#fff' : '#ddd')};">${msg.message}</div>
      ${isSystem ? `<div style="font-size: 0.7em; color: #888; margin-top: 5px;">${timeStr}</div>` : ''}
    `;
    
    chatContainer.appendChild(messageDiv);
  });
  
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updateMessageCount() {
  const countElement = document.getElementById('messageCount');
  if (countElement) {
    countElement.textContent = chatMessages.length;
  }
}

function updateUserStatus() {
  const usernameElement = document.getElementById('currentUsername');
  
  if (usernameElement && currentKaryawan) {
    usernameElement.textContent = currentKaryawan.nama;
    usernameElement.style.color = '#00e0c6';
  }
}

function updateConnectionStatus() {
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  
  if (!statusIcon || !statusText) return;
  
  if (supabase && isRealtimeSubscribed) {
    statusIcon.textContent = '☁️';
    statusIcon.style.color = '#4CAF50';
    statusText.textContent = 'Connected to Cloud';
    statusText.style.color = '#4CAF50';
  } else if (supabase) {
    statusIcon.textContent = '⚠️';
    statusIcon.style.color = '#FF9800';
    statusText.textContent = 'Connecting...';
    statusText.style.color = '#FF9800';
  } else {
    statusIcon.textContent = '💾';
    statusIcon.style.color = '#888';
    statusText.textContent = 'Local Mode Only';
    statusText.style.color = '#888';
  }
}

function updateOnlineUsers() {
  const onlineCount = document.getElementById('onlineUsers');
  if (onlineCount) {
    const randomCount = Math.floor(Math.random() * 9) + 2;
    onlineCount.textContent = randomCount;
    setTimeout(updateOnlineUsers, 30000);
  }
}

function exportChat() {
  if (chatMessages.length === 0) {
    alert('Belum ada chat untuk di-export!');
    return;
  }
  
  let exportText = `💬 Chat Karyawan - ${new Date().toLocaleDateString()}\n`;
  exportText += '='.repeat(50) + '\n\n';
  
  chatMessages.forEach(msg => {
    const timestamp = msg.created_at ? 
      new Date(msg.created_at).toLocaleString() : 
      `${msg.date} ${msg.time}`;
    
    exportText += `[${timestamp}] ${msg.username}: ${msg.message}\n`;
  });
  
  const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-karyawan-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert(`✅ Chat berhasil di-export (${chatMessages.length} pesan)`);
}

function refreshChat() {
  if (supabase) {
    loadMessagesFromSupabase();
  } else {
    loadMessagesFromLocal();
  }
}

// ===================== BAGIAN 7: UI & UTILITAS =====================

function initGlowTypewriter() {
  const title = document.getElementById('typewriterTitle');
  const subtitle = document.getElementById('typewriterSubtitle');
  
  if (title) {
    title.style.animation = 'fadeIn 1s ease-out';
  }
  if (subtitle) {
    subtitle.style.animation = 'fadeIn 1.5s ease-out';
  }
}

// ===================== BAGIAN 8: INISIALISASI APLIKASI =====================

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Supabase
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase connected');
  } catch (error) {
    console.error('❌ Supabase error:', error);
    supabase = null;
  }
  
  // Check login status
  checkLoginStatus();
  
  // Setup event listeners
  const passwordInput = document.getElementById("passwordInput");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleLogin();
    });
  }
  
  const namaInput = document.getElementById("namaInput");
  if (namaInput) {
    namaInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleLogin();
    });
  }
  
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
  }
});
