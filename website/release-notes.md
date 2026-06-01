# Syariah App 1.0.11

Channel: stable
Build: 12
Tanggal rilis: 2026-06-01

## Ringkasan

Rilis ini memfinalkan rebuild installer Windows dan APK Android setelah penggantian logo resmi, sekaligus memperbaiki jalur pengecekan update agar aplikasi membaca manifest rilis terbaru dari GitHub Releases.

## Perubahan Utama

- Manifest update bawaan sekarang mengarah ke `https://github.com/MasRin-CDR/Syariah-Apps/releases/latest/download/release.json`.
- Jika perangkat offline atau manifest remote gagal diakses, aplikasi tetap memakai manifest lokal sebagai fallback.
- Favicon, PWA icon, header logo, Android launcher/splash, dan Windows installer icon tetap memakai logo resmi Syariah App.
- Update Android tetap aman: aplikasi membuka URL APK resmi dan instalasi tetap melalui konfirmasi sistem Android.
- Dependency OTA Android yang tidak diperlukan tetap dihapus agar permission APK tetap minimal.
- Metadata rilis disiapkan untuk versi `1.0.11` build `12`.

## Catatan Untuk Pengguna Terpasang

- Android memakai `versionCode 12`, sehingga APK baru dikenali sebagai pembaruan dari versi sebelumnya.
- Windows menerima update melalui rilis desktop versi `1.0.11`.
- Package/application id tetap dipertahankan agar update tidak dianggap aplikasi berbeda oleh perangkat user.

## Artefak

- Windows: `dist/SyariahAppSetup.exe`
- Android: `dist/SyariahApp.apk`
- Manifest: `dist/release.json`
- Catatan rilis: `dist/release-notes.md`
