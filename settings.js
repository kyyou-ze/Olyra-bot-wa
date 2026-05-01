const fs = require('fs')

global.namabot = "Olyra" // Ganti nama bot mu
global.namaowner = "Ryuhan" // Ubah bebas
global.author = 'Ryuhan Minamoto'
global.packname = 'Made by'
global.owner = ['6281917742392'] // UBAH NOMOR YANG MAU DI JADIKAN OWNER
// PEMISAH \\
global.sessionName = 'session'
global.prefa = ['', '!', '.', '🐦', '🐤', '🗿']
global.pmBlock = false // Mau Bot hanya bisa respon di grup, ubah jadi true

// FIX: Tambahkan global yang dibutuhkan main.js agar tidak undefined
global.anticall = false   // Set true jika ingin bot auto-block caller
global.welcome  = false   // Set true jika ingin fitur welcome aktif global
global.left     = false   // Set true jika ingin fitur left aktif global

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(`Update ${__filename}`)
	delete require.cache[file]
	require(file)
})
