# Nexus (Dss)

Discord'a benzeyen fakat daha gelismis ozelliklere sahip, gercek zamanli bir topluluk/sohbet platformu.

## Ozellikler

- **Auth**: kayit, giris, JWT tabanli oturum
- **Sunucular (Guild)**: olusturma, davet kodu ile katilma, ayrilma, silme
- **Kanallar**: metin ve ses kanallari (ses kanali arayuzu hazir, WebRTC entegrasyonu icin iskelet birakildi)
- **Gercek zamanli mesajlasma**: Socket.io ile aninda mesaj, mesaj duzenleme/silme, yazma gostergesi (typing indicator)
- **Tepkiler (reactions)**: mesajlara emoji ile tepki verme
- **Roller**: Sahip / Yonetici / Uye, yetkiye gore kanal yonetimi ve moderasyon
- **Direkt mesajlar (DM)**: kullanicilar arasi ozel sohbet
- **Cevrimici durumu (presence)**: cevrimici / bosta / rahatsiz etmeyin / gorunmez
- **Profil ozellestirme**: avatar rengi, ozel durum mesaji
- **Modern arayuz**: Discord'a benzer ama daha yumusak, ozel bir tema (Tailwind CSS)

## Proje yapisi

```
server/   Node.js + Express + Socket.io + Prisma (SQLite) backend
client/   React (Vite) + Tailwind CSS frontend
```

## Kurulum

### Backend

```bash
cd server
npm install
npx prisma migrate dev --name init   # veritabanini olusturur
npm run dev                           # http://localhost:4000
```

`.env` dosyasi ornegi zaten `server/.env` icinde mevcut (SQLite dosya veritabani kullanir, ek kuruluma gerek yoktur).

### Frontend

```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

Frontend, `/api` ve `/socket.io` isteklerini otomatik olarak backend'e (4000 portu) yonlendirecek sekilde (Vite proxy) ayarlanmistir.

## Kullanim

1. `http://localhost:5173` adresine git, bir hesap olustur.
2. Sol alttaki `+` simgesine tiklayarak kendi sunucunu olustur ya da bir davet koduyla mevcut bir sunucuya katil.
3. Kanallar arasinda gezin, mesaj gonder, emoji ile tepki ver, arkadaslarina direkt mesaj at.
4. Sag ust menuden profilini (durum, avatar rengi) ozellestir.

## Canliya alma (Render.com - ucretsiz)

Telefondan veya baska bir cihazdan test edebilmek icin projeyi tek bir Render servisi olarak
yayinlayabilirsin (backend, frontend'in derlenmis halini de kendi uzerinden sunar):

1. [render.com](https://render.com) adresine git, GitHub hesabinla ucretsiz kaydol.
2. **New +** → **Blueprint** sec, bu repoyu (GitHub'a push edilmis haliyle) baglan.
3. Render, repo kokundeki `render.yaml` dosyasini otomatik okuyup ayarlari uygular (build/start
   komutlari, `JWT_SECRET` otomatik uretilir). **Apply**'a bas.
4. Ilk build birkac dakika surer. Bittiginde sana `https://nexus-chat-xxxx.onrender.com` gibi
   herkese acik bir link verir — bunu telefonundan direkt acabilirsin.

Notlar:
- Ucretsiz plan bir sure kullanilmayinca uyur; ilk istek 30-60 saniye surebilir.
- Ucretsiz plan kalici disk icermez, bu yuzden SQLite verisi her yeniden deploy'da sifirlanir
  (test icin sorun degil; kalici veri istersen Render'in Postgres eklentisine gecirilebilir).
- `render.yaml` dosyasini repo kokunde bulabilirsin; ayarlari oradan degistirebilirsin.

## Sonraki adimlar icin fikirler

- Ses/goruntulu kanallar icin gercek WebRTC entegrasyonu (mediasoup veya basit P2P)
- Mesaj arama, sabitlenmis mesajlar, thread'ler
- Rol bazli izin matrisi (kanal bazinda gorunurluk vb.)
- Dosya/gorsel yukleme arayuzunun mesaj kutusuna tam entegrasyonu (backend `/api/upload` hazir)
- Push bildirimleri
