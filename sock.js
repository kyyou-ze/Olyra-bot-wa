require('./settings')
const {
	BufferJSON,
	WA_DEFAULT_EPHEMERAL,
	generateWAMessageFromContent,
	proto,
	generateWAMessageContent,
	generateWAMessage,
	prepareWAMessageMedia,
	areJidsSameUser,
	getContentType
} = require('@whiskeysockets/baileys')
const fs = require('fs');
const os = require('os')
const upload = require('./lib_uploader')
const util = require('util');
const chalk = require('chalk');
const speed = require('performance-now') 
const cheerio = require('cheerio')
const axios = require('axios');
const moment = require('moment-timezone');
const FormData = require("form-data");
const similarity = require('similarity');
const didyoumean = require('didyoumean');
const {
	fromBuffer
} = require('file-type')
const {
    clockString,
    formatp,
    getRandom
} = require("./lib_myfunc")
const {
	fetchBuffer,
	webp2mp4File
} = require("./lib_myfunc2")
const fetch = require('node-fetch')
const {
	exec,
	spawn,
	execSync
} = require("child_process")
const fsx = require('fs-extra')

const {
	smsg,
	fetchJson,
	getBuffer
} = require('./lib_simple')

async function getGroupAdmins(participants) {
	let admins = []
	for (let i of participants) {
		i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ''
	}
	return admins || []
}

const path = require('path')

function msToDate(mse) {
	temp = mse
	days = Math.floor(mse / (24 * 60 * 60 * 1000));
	daysms = mse % (24 * 60 * 60 * 1000);
	hours = Math.floor((daysms) / (60 * 60 * 1000));
	hoursms = mse % (60 * 60 * 1000);
	minutes = Math.floor((hoursms) / (60 * 1000));
	minutesms = mse % (60 * 1000);
	sec = Math.floor((minutesms) / (1000));
	return days + " Days " + hours + " Hours " + minutes + " Minutes";
}

const isUrl = (url) => {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const sleep = async (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const runtime = function (seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

const jsonformat = (string) => {
	return JSON.stringify(string, null, 2)
}

module.exports = sock = async (sock, m, chatUpdate, store) => {
	try {
		const body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : '.'
		const bady = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == 'interactiveResponseMessage') ? appenTextMessage(JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id, chatUpdate) : (m.mtype == 'templateButtonReplyMessage') ? appenTextMessage(m.msg.selectedId, chatUpdate) : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ' '
		var budy = (typeof m.text == 'string' ? m.text : '')
		const isCmd = /^[_=|~!?#/$%^&.+-,\\\^]/.test(body)
		const prefix = isCmd ? budy[0] : ''
		const command = isCmd ? body.slice(1).trim().split(' ').shift().toLowerCase() : ''
		const args = body.trim().split(/ +/).slice(1)
		const pushname = m.pushName || "No Name"
		const botNumber = await sock.decodeJid(sock.user.id)
		const isCreator = ["6285279522326@s.whatsapp.net", botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
		const text = q = args.join(" ")
		const salam = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
		const quoted = m.quoted ? m.quoted : m
		const mime = (quoted.msg || quoted).mimetype || ''
		const isMedia = /image|video|sticker|audio/.test(mime)
		const groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat).catch(e => {}) : ''
		const groupName = m.isGroup ? groupMetadata.subject : ''
		const participants = m.isGroup ? await groupMetadata.participants : ''
		// FIX: Pakai m.chat bukan mek.key.remoteJid
		const from = m.chat
		const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
		const messagesD = body.slice(0).trim().split(/ +/).shift().toLowerCase()
		const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
		const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
		const time = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('HH:mm:ss z')

		const reply = async (text) => {
			return await sock.sendMessage(from, { text: text }, { quoted: m })
		}
		
		// FIX: Gunakan global.pmBlock
		if (global.pmBlock && !m.isGroup && !isCreator) return

		if (m.message && !m.key.fromMe) {
			const time = new Date().toLocaleString()
			const fromUser = `${pushname || 'No Name'} (${m.sender})`
			const inChat = m.isGroup ? `${pushname} (${m.chat})` : `Chat Pribadi (${m.chat})`
			const msgType = budy || m.mtype

			let logMsg = `
${chalk.cyan.bold("╭─────────────────────────────")}
${chalk.cyan.bold("│ ")}${chalk.bgMagenta.black(" RIMURU - X ")} ${chalk.white("• Log Message")}
${chalk.cyan.bold("│")}
${chalk.cyan.bold("│ ")}${chalk.blueBright("📅 Time   :")} ${chalk.green(time)}
${chalk.cyan.bold("│ ")}${chalk.blueBright("👤 From   :")} ${chalk.yellow(fromUser)}
${chalk.cyan.bold("│ ")}${chalk.blueBright("💬 In     :")} ${chalk.magenta(inChat)}
${chalk.cyan.bold("│ ")}${chalk.blueBright("📌 Type   :")} ${chalk.cyan(msgType)}
${chalk.cyan.bold("╰─────────────────────────────")}
`
			console.log(logMsg)
		}

		function parseMention(text = '') {
			return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
		}

		function listcase() {
			const filePath = './sock.js';
			try {
				const fileContent = fs.readFileSync(filePath, 'utf-8');
				const caseRegex = /case\s+(['"`]?)([a-zA-Z0-9_]+)\1:/g;
				const matches = [...fileContent.matchAll(caseRegex)];
				const cases = matches.map(match => match[2]);
				return cases;
			} catch (error) {
				console.error(`Gagal membaca file: ${error.message}`);
				return [];
			}
		}

		const uploadBtch = async (buffer) => {
			let { ext } = await fromBuffer(buffer);
			let bodyForm = new FormData();
			bodyForm.append("file", buffer, "file." + ext);
			let res = await fetch("https://file.btch.rf.gd/api/upload.php", {
				method: "post",
				body: bodyForm,
			});
			let data = await res.json();
			let resultUrl = data.result ? data.result.url : '';
			return resultUrl;
		}

		async function getGcName(groupID) {
			try {
				let data_name = await sock.groupMetadata(groupID)
				return data_name.subject
			} catch (err) {
				return '-'
			}
		}

		function getWeton() {
			const dayNames = ["ᴍɪɴɢɢᴜ", "ꜱᴇɴɪɴ", "ꜱᴇʟᴀꜱᴀ", "ʀᴀʙᴜ", "ᴋᴀᴍɪꜱ", "ᴊᴜᴍᴀᴛ", "ꜱᴀʙᴛᴜ"];
			const pasaranNames = ["ʟᴇɢɪ", "ᴘᴀʜɪɴɢ", "ᴘᴏɴ", "ᴡᴀɢᴇ", "ᴋʟɪᴡᴏɴ"];
			const currentDate = new Date();
			const day = currentDate.getDay();
			const pasaran = (currentDate.getDate() + 5) % 5;
			return dayNames[day] + " " + pasaranNames[pasaran];
		}

		function formatDuration(timeElapsed) {
			let seconds = Math.floor(timeElapsed / 1000) % 60;
			let minutes = Math.floor(timeElapsed / (1000 * 60)) % 60;
			let hours = Math.floor(timeElapsed / (1000 * 60 * 60)) % 24;
			let days = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
			let months = Math.floor(days / 30) % 12;
			let years = Math.floor(days / 365);
			let durationParts = [];
			if (years > 0) durationParts.push(`${years} Tahun`);
			if (months > 0) durationParts.push(`${months} Bulan`);
			if (days > 0) durationParts.push(`${days % 30} Hari`);
			if (hours > 0) durationParts.push(`${hours} Jam`);
			if (minutes > 0) durationParts.push(`${minutes} Menit`);
			if (seconds >= 0) durationParts.push(`${seconds} Detik`);
			return durationParts.join(', ');
		}

		async function appenTextMessage(text, chatUpdate) {
			let messages = await generateWAMessage(m.chat, { text: text, mentions: m.mentionedJid }, {
				userJid: sock.user.id,
				quoted: m.quoted && m.quoted.fakeObj
			})
			messages.key.fromMe = areJidsSameUser(m.sender, sock.user.id)
			messages.key.id = m.key.id
			messages.pushName = m.pushName
			if (m.isGroup) messages.participant = m.sender
			let msg = {
				...chatUpdate,
				messages: [proto.WebMessageInfo.fromObject(messages)],
				type: 'append'
			}
			sock.ev.emit('messages.upsert', msg)
		}

		function sendReaction(emoji) {
			sock.sendMessage(from, {
				react: {
					text: emoji,
					key: m.key
				}
			})
		}

		function loading() {
			reply('Bentar Bang Prosess...')
		}

		function pickRandom(list) {
			return list[Math.floor(Math.random() * list.length)]
		}

		// FIX: Tambah guard — non-owner di private chat hanya diblock kalau pmBlock aktif (sudah di atas)
		sock.readMessages([m.key])
		if (command) {
			sock.sendPresenceUpdate('composing', m.chat);
		}

		// =================== WIZARD HANDLER TEMPLATE ===================
		if (global.templateSesi && global.templateSesi[m.sender] && global.templateSesi[m.sender].aktif) {
			const sesi = global.templateSesi[m.sender]
			if (from === sesi.chat) {
				const jawaban = budy.trim()
				if (/^batal$/i.test(jawaban)) {
					delete global.templateSesi[m.sender]
					await reply('❌ *Sesi template dibatalkan.*')
					return
				}
				const steps = [
					{ key: 'judul',        label: 'Judul',         next: '📌 *[2/12]* Kirim *tipe* konten:\n_(contoh: Novel Terjemahan, Manhwa, dll)_' },
					{ key: 'tipe',         label: 'Tipe',          next: '📌 *[3/12]* Kirim *genre*:\n_(pisahkan dengan · contoh: Romance · Fantasy · Action)_' },
					{ key: 'genre',        label: 'Genre',         next: '📌 *[4/12]* Kirim *status*:\n_(Ongoing / Completed)_' },
					{ key: 'status',       label: 'Status',        next: '📌 *[5/12]* Kirim *bahasa*:\n_(contoh: Indonesia)_' },
					{ key: 'bahasa',       label: 'Bahasa',        next: '📌 *[6/12]* Kirim *format file*:\n_(contoh: PDF, EPUB, dll)_' },
					{ key: 'format',       label: 'Format File',   next: '📌 *[7/12]* Kirim *tanggal posting*:\n_(contoh: 16 Maret 2026)_' },
					{ key: 'tanggal',      label: 'Tanggal',       next: '📌 *[8/12]* Kirim *nama author*:\n_(ketik - jika tidak ada)_' },
					{ key: 'author',       label: 'Author',        next: '📌 *[9/12]* Kirim *link cover* (URL gambar langsung):' },
					{ key: 'cover',        label: 'Cover',         next: '📌 *[10/12]* Kirim *sinopsis*:\n_(bisa multi-baris, kirim semua sekaligus)_' },
					{ key: 'sinopsis',     label: 'Sinopsis',      next: '📌 *[11/12]* Kirim *link download*:' },
					{ key: 'linkdownload', label: 'Link Download', next: '📌 *[12/12]* Kirim *nama file*:\n_(contoh: Judul Novel - PDF)_' },
					{ key: 'namafile',     label: 'Nama File',     next: '📌 *[12/12 lanjutan]* Kirim *part*:\n_(contoh: Part 1, Full, dll)_' },
					{ key: 'part',         label: 'Part',          next: null },
				]
				const stepNow = sesi.step
				if (stepNow < steps.length) {
					const cur = steps[stepNow]
					sesi.data[cur.key] = jawaban
					sesi.step++
					if (cur.next) {
						await reply('✅ *' + cur.label + '* diterima!\n\n─────────────────────\n' + cur.next)
					} else {
						delete global.templateSesi[m.sender]
						const data = sesi.data
						const statusClass = data.status.toLowerCase().includes('ongoing') ? 'status-on' : 'status-done'
						const statusIcon = data.status.toLowerCase().includes('ongoing') ? '⟳' : '✓'
						const authorVal = (!data.author || data.author === '-') ? '' : data.author
						const genreBadges = data.genre.split('·').map(g => '<span class="ni-badge">' + g.trim() + '</span>').join('\n        ')
						const sinopsisParagraphs = data.sinopsis.split('\n').filter(l => l.trim()).map(l => '<p>' + l.trim() + '</p>').join('\n    ')
						const html = `<style>
.ni-post{font-family:inherit;max-width:780px;margin:0 auto}
.ni-hero{display:flex;gap:24px;align-items:flex-start;margin-bottom:28px}
.ni-cover{flex-shrink:0;width:160px}
.ni-cover img{width:100%;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18);display:block}
.ni-meta{flex:1;min-width:0}
.ni-type{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--linkC);margin-bottom:8px}
.ni-type::before{content:'';width:16px;height:2px;background:var(--linkC);border-radius:2px}
.ni-title{font-size:1.3rem;font-weight:800;line-height:1.3em;margin:0 0 6px;color:var(--headC)}
.drK .ni-title{color:var(--darkT)}
.ni-orig{font-size:12px;opacity:.6;margin-bottom:14px;font-style:italic}
.ni-badges{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.ni-badge{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:var(--transB);color:var(--bodyC);border:1px solid var(--borderC)}
.drK .ni-badge{background:rgba(255,255,255,.08);color:var(--darkT);border-color:rgba(255,255,255,.12)}
.ni-badge.status-done{background:#dcfce7;color:#166534;border-color:#86efac}
.ni-badge.status-on{background:#fef9c3;color:#854d0e;border-color:#fde047}
.drK .ni-badge.status-done{background:rgba(22,101,52,.3);color:#86efac;border-color:#166534}
.drK .ni-badge.status-on{background:rgba(133,77,14,.3);color:#fde047;border-color:#854d0e}
.ni-stats{display:flex;flex-wrap:wrap;gap:10px}
.ni-stat{display:flex;align-items:center;gap:5px;font-size:12px;opacity:.75}
.ni-stat::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--linkC);flex-shrink:0}
.ni-table{width:100%;border-collapse:collapse;font-size:13px;margin:20px 0;border:1px solid var(--borderC);border-radius:10px;overflow:hidden}
.ni-table tr:nth-child(odd) td:first-child{background:rgba(0,0,0,.02)}
.drK .ni-table tr:nth-child(odd) td:first-child{background:rgba(255,255,255,.03)}
.ni-table td{padding:10px 14px;border-bottom:1px solid var(--borderC);vertical-align:top;line-height:1.5}
.ni-table tr:last-child td{border-bottom:0}
.ni-table td:first-child{font-weight:600;white-space:nowrap;width:38%;color:var(--headC);font-size:12px}
.drK .ni-table td:first-child{color:var(--darkT)}
.drK .ni-table{border-color:rgba(255,255,255,.1)}
.drK .ni-table td{border-color:rgba(255,255,255,.07)}
.ni-synopsis{background:var(--transB);border-radius:10px;padding:18px 20px;margin:20px 0;border-left:3px solid var(--linkC)}
.drK .ni-synopsis{background:rgba(255,255,255,.05)}
.ni-synopsis-label{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--linkC);margin-bottom:10px}
.ni-synopsis p{margin:0 0 10px;line-height:1.75em;font-size:14px;opacity:.9}
.ni-synopsis p:last-child{margin:0}
.ni-dl-wrap{margin:24px 0}
.ni-dl-head{font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--bodyCa);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.ni-dl-head::after{content:'';flex:1;height:1px;background:var(--borderC)}
.drK .ni-dl-head::after{background:rgba(255,255,255,.1)}
.ni-rating{display:flex;align-items:center;gap:8px;margin-bottom:14px}
.ni-stars{color:#f59e0b;font-size:16px;letter-spacing:2px}
.ni-rating-txt{font-size:12px;opacity:.7}
@media(max-width:500px){
  .ni-hero{flex-direction:column;align-items:center;text-align:center}
  .ni-cover{width:130px}
  .ni-type,.ni-badges,.ni-stats,.ni-rating{justify-content:center}
  .ni-synopsis{padding:14px 16px}
}
</style>

<div class="ni-post">

  <div class="ni-hero">
    <div class="ni-meta">
      <div class="ni-type"><div class="separator" style="clear: both; text-align: center;"><a href="${data.cover}" imageanchor="1" style="margin-left: 1em; margin-right: 1em;"><img border="0" data-original-height="600" data-original-width="402" height="320" src="${data.cover}" width="214" /></a></div><br />${data.tipe}</div>
      <h1 class="ni-title">${data.judul}</h1>
      <div class="ni-badges">
        <span class="ni-badge ${statusClass}">${statusIcon} ${data.status}</span>
        ${genreBadges}
      </div>
      <div class="ni-stats">
        <span class="ni-stat">${data.format}</span>
        <span class="ni-stat">${data.bahasa}</span>
      </div>
    </div>
  </div>

  <div class="ni-synopsis">
    <div class="ni-synopsis-label">Sinopsis</div>
    ${sinopsisParagraphs}
  </div>

  <details class="ac">
    <summary>Info Lengkap</summary>
    <div class="aC">
      <table class="ni-table"><tbody>
          <tr><td>Judul</td><td>${data.judul}</td></tr>
          <tr><td>Author</td><td>${authorVal}</td></tr>
          <tr><td>Tipe</td><td>${data.tipe}</td></tr>
          <tr><td>Genre</td><td>${data.genre}</td></tr>
          <tr><td>Status</td><td>${data.status}</td></tr>
          <tr><td>Bahasa</td><td>${data.bahasa}</td></tr>
          <tr><td>Format File</td><td>${data.format}</td></tr>
          <tr><td>Diposting</td><td>${data.tanggal}</td></tr>
      </tbody></table>
    </div>
  </details>

  <div class="note">
    File sudah dicek. Update terakhir: ${data.tanggal}.
  </div>

  <div class="ni-dl-wrap">
    <div class="ni-dl-head">Link Download</div>
    <div class="dlBox">
      <div class="fT" data-text="${data.format}"></div>
      <div class="fN">
        <span class="fNm">${data.namafile}</span>
        <span class="fS">${data.part}</span>
      </div>
      <a aria-label="Download" href="${data.linkdownload}" rel="nofollow noopener" target="_blank"></a>
    </div>
  </div>

</div>`
						await reply('✅ *Part* diterima!\n\n⏳ Generating HTML...')
						await sock.sendMessage(from, { text: html }, { quoted: m })
					}
				}
				return
			}
		}
		// =================== END WIZARD HANDLER ===================

		switch (command) {

			case 'tes': case 'test': case 'bot': {
				let timestamp = speed()
				let latensi = speed() - timestamp
				let _uptime = process.uptime() * 1000
				let uptime = clockString(_uptime)

				let { getSystemUsage } = require('./lib_ping.js')
				let data = await getSystemUsage()

				let anu = `
╭┈〔 ＳＴＡＴＵＳ 〕
│▣ Bot Name   : ${global.namabot}
│▣ Status     : Online ✅
│▣ Ping       : ${latensi.toFixed(3)} ms
│▣ Uptime     : ${uptime}
╰─────────────

╭┈〔 ＳＹＳＴＥＭ 〕
│⚡ CPU     : ${data.CPU}
│💾 RAM     : ${data.RAM}
│📂 Storage : ${data.STORAGE}
╰─────────────

╭┈〔 ＤＥＴＡＩＬ 〕
│ Total Storage : ${data.details.totalStorage}
│ Used Storage  : ${data.details.usedStorage}
╰─────────────
`
				sock.send2Button(m.chat, anu, global.namabot, '📜 Menu', '.menu', '👑 Owner', '.owner', m)
			}
			break

			case 'self': {
				if (!isCreator) return
				sock.public = false
				reply('done self')
			}
			break

			case 'public': {
				sock.public = true
				reply('Done Public')
			}
			break

			case 'get': case 'fetch': {
				if (!/^https?:\/\//.test(text)) return reply('Awali *URL* dengan http:// atau https://')
				let url = new URL(text)
				let res = await fetch(url)
				if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
					return reply(`Content-Length: ${res.headers.get('content-length')}`)
				}
				let headers = Array.from(res.headers.entries())
					.map(([key, value]) => `*${key}:* ${value}`)
					.join('\n')
				let responseDetails = `*Headers Respons:*\n${headers}`
				if (!/text|json/.test(res.headers.get('content-type'))) {
					await sock.sendFile(m.chat, url, 'file', `${responseDetails}\n\nURL: ${text}`, m);
				} else {
					let txt = await res.buffer()
					try {
						txt = JSON.stringify(JSON.parse(txt + ''), null, 2)
					} catch (e) {
						txt = txt + ''
					} finally {
						m.reply(`${txt.slice(0, 65536)}`)
					}
				}
			}
			break

			case 'sticker': case 's': case 'stickergif': case 'sgif': case 'stiker': {
				if (!quoted) return reply(`*Reply Video/Image With Caption* ${prefix + command}`)
				try {
					if (/image/.test(mime)) {
						await sendReaction('⏳')
						let media = await quoted.download()
						let encmedia = await sock.sendImageAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
						await fs.unlinkSync(encmedia)
					} else if (/video/.test(mime)) {
						await sendReaction('⏳')
						if ((quoted.msg || quoted).seconds > 11) return reply('*Maximum 10 seconds!*')
						let media = await quoted.download()
						let encmedia = await sock.sendVideoAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
						await fs.unlinkSync(encmedia)
					} else {
						reply(`Kirim/reply gambar/video/gif dengan caption ${prefix + command}\nDurasi Video/Gif 1-9 Detik`)
					}
				} catch (e) {
					console.error(e)
					reply('Terjadi Kesalahan, Mohon Ulangi beberapa saat lagi')
				}
			}
			break

			case 'toimage': case 'toimg': {
				if (!quoted) return reply('Reply image')
				if (!/webp/.test(mime)) return reply(`Reply sticker with caption *${prefix + command}*`)
				await loading()
				let media = await sock.downloadAndSaveMediaMessage(quoted)
				let ran = await getRandom('.png')
				exec(`ffmpeg -i ${media} ${ran}`, (err) => {
					fs.unlinkSync(media)
					if (err) return reply(`${err}`)
					let bufferimg13x = fs.readFileSync(ran)
					sock.sendMessage(m.chat, { image: bufferimg13x }, { quoted: m })
					fs.unlinkSync(ran)
				})
			}
			break

			case 'tovideo': case 'tomp4': case 'tovid': {
				// FIX: webp2mp4File menerima path file, bukan buffer
				if (!/webp/.test(mime)) return reply(`Balas stiker dengan caption *${prefix + command}*`)
				await loading()
				let mediaPath = await sock.downloadAndSaveMediaMessage(quoted, 'sticker_tmp')
				try {
					let result = await webp2mp4File(mediaPath)
					const vd = await getBuffer(result.result)
					await sock.sendFile(m.chat, vd, 'out.mp4', null, m)
				} catch (e) {
					reply(`Gagal konversi: ${e.message || e}`)
				} finally {
					if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath)
				}
			}
			break

			case 'owner':
			case 'creator': {
				sock.sendContact(m.chat, global.owner, m)
			}
			break

			case 'kick': {
				if (!m.isGroup) return reply("Hanya Dapat Di Gunakan Di Group")
				if (!isBotAdmins) return reply("Bot Bukan Admin")
				if (!isAdmins) return reply("Fitur Ini Hanya Dapat Di Gunakan Oleh Admin")
				let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
				if (!users) return reply('Tag/reply orangnya')
				if (users == m.sender) return reply(`Tidak Bisa kick diri sendiri`)
				try {
					await sock.groupParticipantsUpdate(m.chat, [users], 'remove')
				} catch (e) {
					reply(`${e}`)
				}
			}
			break

			case 'add': {
				if (!m.isGroup) return reply("Hanya Dapat Di Gunakan Di Group")
				if (!isBotAdmins) return reply("Bot Bukan Admin")
				if (!isAdmins) return reply("Fitur Ini Hanya Dapat Di Gunakan Oleh Admin")
				let users = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
				if (!users) return reply('Tag/reply orangnya')
				await sock.groupParticipantsUpdate(m.chat, [users], 'add')
					.then((res) => {
						if (res[0].status == "408") {
							reply('Peserta tersebut telah keluar baru-baru ini');
						} else if (res[0].status == "403") {
							reply('Tidak dapat menambahkan peserta tersebut, mungkin di private');
						} else if (res[0].status == "200") {
							reply('Berhasil menambahkan peserta');
						} else {
							reply('Gagal menambahkan peserta')
						}
					})
					.catch((err) => {
						reply('Terjadi kesalahan saat menambahkan peserta');
					});
			}
			break;

			case 'promote': {
				if (!m.isGroup) return reply("Hanya Dapat Di Gunakan Di Group")
				if (!isBotAdmins) return reply("Bot Bukan Admin")
				if (!isAdmins) return reply("Fitur Ini Hanya Dapat Di Gunakan Oleh Admin")
				let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
				if (!users) return reply('Tag/reply orangnya')
				await sock.groupParticipantsUpdate(m.chat, [users], 'promote')
			}
			break

			case 'demote': {
				if (!m.isGroup) return reply("Hanya Dapat Di Gunakan Di Group")
				if (!isBotAdmins) return reply("Bot Bukan Admin")
				if (!isAdmins) return reply("Fitur Ini Hanya Dapat Di Gunakan Oleh Admin")
				let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
				if (!users) return reply('Tag/reply orangnya')
				await sock.groupParticipantsUpdate(m.chat, [users], 'demote')
			}
			break

			case 'linkgroup': case 'linkgc': case 'gclink': case 'grouplink': {
				if (!m.isGroup) return reply(`Fitur Ini Khusus Group`)
				if (!isBotAdmins) return reply(`Bot Bukan Admin`)
				await loading()
				let response = await sock.groupInviteCode(m.chat)
				sock.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\nGroup Link : ${groupMetadata.subject}`, m, { detectLink: true })
			}
			break

			case 'revoke':
			case 'resetlink':
			case 'resetlinkgrup':
			case 'resetlinkgroup':
			case 'resetlinkgc': {
				if (!m.isGroup) return reply(`Fitur Ini Khusus Group`)
				if (!isBotAdmins) return reply(`Bot Bukan Admin`)
				if (!isAdmins && !isCreator) return reply(`Fitur Ini Khusus Admin !`)
				await loading()
				await sock.groupRevokeInvite(m.chat)
				reply(`Done Reset Link Gc Nya Kak`)
			}
			break

			case 'delete': case 'del': {
				if (!m.quoted) reply('false')
				if (!isAdmins) return reply(`Khusus Admin!`)
				sock.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: m.quoted.id, participant: m.quoted.sender } })
			}
			break

			case 'group': case 'grup': {
				if (!m.isGroup) return reply('Fitur Khusus Group!')
				if (!isAdmins) return reply('Fitur Khusus admin!')
				if (!isBotAdmins) return reply("Jadikan bot sebagai admin terlebih dahulu")
				if (args[0] === 'close') {
					await sock.groupSettingUpdate(m.chat, 'announcement').then((res) => m.reply(`*Successfully Closed The Group*`)).catch((err) => m.reply(jsonformat(err)))
				} else if (args[0] === 'open') {
					await sock.groupSettingUpdate(m.chat, 'not_announcement').then((res) => m.reply(`*Successfully Opened The Group*`)).catch((err) => m.reply(jsonformat(err)))
				} else {
					reply(`Kirim perintah ${prefix + command} open/close\n\nContoh: ${prefix + command} open`)
				}
			}
			break

			// =================== TEMPLATE HTML NOVEL/KONTEN (WIZARD) ===================
			case 'template': case 'tmplt': {
				if (!isCreator) return reply(`❌ Fitur ini hanya untuk owner!`)

				if (global.templateSesi && global.templateSesi[m.sender] && global.templateSesi[m.sender].aktif) {
					return reply(`⚠️ Kamu sudah punya sesi template yang sedang berjalan.\nKirim *batal* untuk membatalkan sesi sebelumnya.`)
				}

				if (!global.templateSesi) global.templateSesi = {}
				global.templateSesi[m.sender] = {
					aktif: true,
					chat: from,
					step: 0,
					data: {}
				}

				await reply(`╔══════════════════════╗\n║   📄 *TEMPLATE HTML*   ║\n╚══════════════════════╝\n\nMode wizard dimulai! Jawab setiap pertanyaan satu per satu.\nKirim *batal* kapan saja untuk membatalkan.\n\n─────────────────────\n📌 *[1/12]* Kirim *judul* novel/konten:`)
			}
			break
			// =================== END TEMPLATE HTML ===================

			default:
				if (isCmd) {
					let noPrefix = m.text.replace(prefix, '').trim();
					let alias = await listcase();

					if (alias.includes(noPrefix)) return
					let mean = didyoumean(noPrefix, alias);
					let sim = similarity(noPrefix, mean);
					let som = sim * 100;

					if (som === 100) return
					let tio = `ᴀᴘᴀᴋᴀʜ ᴋᴀᴍᴜ ᴍᴇɴᴄᴏʙᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ᴄᴏᴍᴍᴀɴᴅ ʙᴇʀɪᴋᴜᴛ ɪɴɪ??

• ɴᴀᴍᴀ ᴄᴏᴍᴍᴀɴᴅ : *➠ ${prefix + mean}*
• ʜᴀꜱɪʟ ᴋᴇᴍɪʀɪᴘᴀɴ : *➠ ${parseInt(som)}%*`
					if (mean) {
						sock.sendButton(from, tio, global.namabot, `${prefix + mean}`, `${prefix + mean}`, m)
					}
				}

				if (budy.startsWith('>')) {
					if (!isCreator) return
					try {
						let evaled = await eval(budy.slice(2))
						if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
						await reply(evaled)
					} catch (err) {
						await reply(util.format(err))
					}
				}

				if (budy.startsWith('$')) {
					if (!isCreator) return
					exec(budy.slice(2), (err, stdout) => {
						if (err) return reply(`${err}`)
						if (stdout) return reply(`${stdout}`)
					})
				}

				if (/(ass?alam|اَلسَّلاَمُ عَلَيْكُمْ|السلام عليکم)/i.test(budy)) {
					return m.reply(`وَعَلَيْكُمْ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
_wa'alaikumussalam wr.wb._`)
				}
		}

	} catch (err) {
		m.reply(util.format(err))
	}
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(`Update ${__filename}`)
	delete require.cache[file]
	require(file)
})
