import type { Localized } from './index';

/**
 * Interface chrome. Component names (CPU, DIMM, ATX 24-pin, PSU) and console
 * output are not in here on purpose — they are never translated.
 */
export const UI: Record<string, Localized> = {
  brandTagline: {
    en: 'From power button to login screen: the order in which a desktop wakes up.',
    tr: 'Power button’dan login ekranına: bir masaüstünün uyanma sırası.',
  },

  hintOrbit: { en: 'Drag: orbit', tr: 'Sürükle: döndür' },
  hintZoom: { en: 'Scroll: zoom', tr: 'Tekerlek: yakınlaş' },
  hintPsu: { en: 'Click the PSU to look inside', tr: 'İçini görmek için PSU’ya tıkla' },

  power: { en: 'Power', tr: 'Power' },
  pause: { en: 'Pause', tr: 'Duraklat' },
  resume: { en: 'Resume', tr: 'Devam' },
  restart: { en: 'Restart', tr: 'Baştan' },
  previousStep: { en: 'Previous step', tr: 'Önceki adım' },
  nextStep: { en: 'Next step', tr: 'Sonraki adım' },
  startOver: { en: 'Start over', tr: 'Baştan al' },

  console: { en: 'console', tr: 'console' },
  bootSteps: { en: 'Boot steps', tr: 'Boot adımları' },

  psuTitle: {
    en: 'From the wall socket to the DC rails',
    tr: 'Duvar prizinden DC rail’lerine',
  },
  blockDiagram: { en: 'Block diagram', tr: 'Blok şeması' },

  modalEyebrow: { en: 'Power Supply Unit', tr: 'Power Supply Unit' },
  tabDiagram: { en: 'Block diagram', tr: 'Blok şeması' },
  tabWaveforms: { en: 'Waveforms', tr: 'Dalga Şekilleri' },
  tabComponents: { en: 'Components', tr: 'Bileşenler' },

  tabGlossary: { en: 'Glossary', tr: 'Sözlük' },

  kernelEyebrow: { en: 'Linux', tr: 'Linux' },
  kernelTitle: {
    en: 'The vocabulary of the kernel and initramfs',
    tr: 'Kernel ve initramfs’in sözcük dağarcığı',
  },
  kernelFaqIntro: {
    en: 'From startup_32 to systemd the chain names about fifty terms it cannot avoid. Each card defines one in passing; the full answer is here. Ordered as the terms first appear on the timeline, so the entries around the one you came for are usually the ones you need next.',
    tr: 'startup_32’den systemd’ye kadar zincir, kaçınamadığı elli kadar terimi anar. Her kart bunlardan birini geçerken tanımlar; tam cevap burada. Girişler, terimlerin zaman çizelgesinde ilk göründüğü sıraya göre dizilmiştir — aradığınızın çevresindekiler genellikle bir sonraki ihtiyacınız olanlardır.',
  },

  vrmWaveformIntro: {
    en: 'Almost every plot here is an argument for why a VRM is built out of four of everything rather than one. The phases exist to cancel each other out, and the only way to see that is to draw them together.',
    tr: 'Buradaki neredeyse her grafik, bir VRM’in neden her şeyden bir tane yerine dört tane ile kurulduğunun gerekçesidir. Fazlar birbirini götürmek için vardır ve bunu görmenin tek yolu onları bir arada çizmektir.',
  },
  vrmFaqIntro: {
    en: 'The terms behind the eight steps. Most questions about a VRM come down to two things: why there are four of everything, and why a circuit that can deliver two hundred amps still cannot hold the voltage perfectly still.',
    tr: 'Sekiz adımın arkasındaki terimler. Bir VRM hakkındaki soruların çoğu iki şeye iner: neden her şeyden dört tane var ve iki yüz amper verebilen bir devre neden gerilimi yine de tam sabit tutamıyor.',
  },
  vrmDetail: { en: 'Detail →', tr: 'Ayrıntı →' },

  systemdEyebrow: { en: 'systemd', tr: 'systemd' },
  systemdTitle: {
    en: 'The vocabulary of userspace',
    tr: 'Userspace’in sözcük dağarcığı',
  },
  systemdFaqIntro: {
    en: 'Once PID 1 takes over, the boot stops being a sequence of instructions and becomes a dependency graph resolved at runtime. These are the terms that half of the story is written in — from the unit file up to the session that finally belongs to a person.',
    tr: 'PID 1 devraldığı andan itibaren boot, bir talimat dizisi olmaktan çıkıp çalışma anında çözülen bir bağımlılık grafiğine dönüşür. Bunlar, hikâyenin o yarısının yazıldığı terimler — unit dosyasından, nihayet bir insana ait olan oturuma kadar.',
  },

  ecEyebrow: { en: 'Embedded Controller', tr: 'Embedded Controller' },
  ecTitle: {
    en: 'From the button press to PS_ON#',
    tr: 'Düğmeye basıştan PS_ON#’a',
  },
  ecComponentsIntro: {
    en: 'The hardware blocks an EC is built from. Nearly all of them exist to do something while the rest of the machine is off — which is the one requirement that shapes every choice here.',
    tr: 'Bir EC’nin kurulu olduğu donanım blokları. Neredeyse hepsi, makinenin geri kalanı kapalıyken bir iş yapmak için vardır — buradaki her tercihi şekillendiren tek gereklilik budur.',
  },
  ecFaqIntro: {
    en: 'The terms behind the eight steps. The EC is the least discussed chip on the board and the one most likely to be the reason a machine will not turn on.',
    tr: 'Sekiz adımın arkasındaki terimler. EC, kart üzerinde en az konuşulan ve bir makinenin açılmamasının sebebi olma ihtimali en yüksek olan yongadır.',
  },

  vrmEyebrow: { en: 'Board Power Management', tr: 'Kart Güç Yönetimi' },
  vrmTitle: {
    en: 'From PWR_OK to CPU RESET#',
    tr: 'PWR_OK’ten CPU RESET#’e',
  },

  psuPowerUpEyebrow: { en: 'PSU Power-Up Sequence', tr: 'PSU Açılış Sırası' },
  psuPowerUpTitle: {
    en: 'From PS_ON# to PWR_OK',
    tr: 'PS_ON#’tan PWR_OK’e',
  },
  tabPinout: { en: 'Pinout', tr: 'Pinout' },
  tabFaq: { en: 'FAQ', tr: 'SSS' },
  close: { en: 'Close', tr: 'Kapat' },
  escToClose: { en: 'Esc to close', tr: 'Kapatmak için Esc' },
  previous: { en: '‹ Previous', tr: '‹ Önceki' },
  next: { en: 'Next ›', tr: 'Sonraki ›' },
  openDetails: { en: 'open details', tr: 'detayları aç' },

  sceneFailed: {
    en: 'The scene could not start',
    tr: 'Sahne başlatılamadı',
  },
  sceneFailedNoWebgl: {
    en: 'This browser does not support WebGL. A current version of Chrome, Firefox, Edge or Safari will run the scene.',
    tr: 'Bu tarayıcı WebGL desteklemiyor. Güncel bir Chrome, Firefox, Edge ya da Safari sahneyi çalıştırır.',
  },
  sceneFailedGpu: {
    en: 'The browser supports WebGL but could not reach the graphics card, so the 3D scene cannot start. Chrome no longer falls back to software rendering, which is why this ends here rather than running slowly. Open chrome://gpu and look at WebGL: if it says Disabled or Software only, turn on "Use graphics acceleration when available" in Settings → System, update the graphics driver, and reload. Remote desktop sessions and virtual machines commonly hit this too. Everything the scene shows is also written out step by step at github.com/sserkanml/boot-anatomy/blob/main/docs/boot-chain.md',
    tr: 'Tarayıcı WebGL destekliyor ama ekran kartına ulaşamadı, bu yüzden 3D sahne başlayamıyor. Chrome artık yazılımsal render’a düşmüyor; yavaş çalışmak yerine burada durmasının sebebi bu. chrome://gpu adresini açıp WebGL satırına bak: Disabled ya da Software only yazıyorsa Ayarlar → Sistem altında “Kullanılabilir olduğunda donanım hızlandırmayı kullan” seçeneğini aç, ekran kartı sürücüsünü güncelle ve sayfayı yenile. Uzak masaüstü oturumları ve sanal makineler de sık sık bu duruma düşer. Sahnenin gösterdiği her şey adım adım github.com/sserkanml/boot-anatomy/blob/main/docs/boot-chain.md adresinde de yazılı.',
  },

  language: { en: 'Language', tr: 'Dil' },

  faqIntro: {
    en: 'The terms used in the walkthrough, in the order they come up. Each answer explains why the part exists rather than just what it is called.',
    tr: 'Anlatımda geçen terimler, ortaya çıkış sıralarıyla. Her cevap parçanın adını değil, neden var olduğunu açıklıyor.',
  },
  waveformIntro: {
    en: 'The same ten stages, seen as the signal rather than the components. Every trace here is generated from the equation that actually governs it, so the shapes are the real ones — including the ripple, which is a capacitor discharging while it waits for the next hump.',
    tr: 'Aynı on aşama, bileşenler yerine sinyalin kendisi olarak. Buradaki her eğri, onu gerçekten yöneten denklemden üretiliyor; yani şekiller gerçek — ripple dahil, ki o da bir kondansatörün bir sonraki tümseği beklerken boşalmasından ibarettir.',
  },
  pinoutIntro: {
    en: 'Pin numbering follows the ATX specification, viewed from the wire entry side of the connector. Wire colors are the industry convention — individually sleeved cables often ignore them entirely, so never identify a rail by color alone.',
    tr: 'Pin numaralandırması ATX spesifikasyonuna göredir ve konektöre kabloların girdiği taraftan bakılarak verilmiştir. Kablo renkleri sektör konvansiyonudur — kılıflı (sleeved) kablolarda bu renklere çoğu zaman uyulmaz, o yüzden bir rail’i asla yalnızca renginden teşhis etme.',
  },

  logIn: { en: 'Log In', tr: 'Oturum Aç' },
};
