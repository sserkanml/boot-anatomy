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
  lookInsidePsu: { en: 'Look inside the PSU →', tr: 'PSU’nun içine bak →' },

  psuEyebrow: { en: 'Inside the PSU', tr: 'PSU’nun İçi' },
  psuTitle: {
    en: 'From the wall socket to the DC rails',
    tr: 'Duvar prizinden DC rail’lerine',
  },
  backToBoard: { en: '‹ Back to board', tr: '‹ Karta dön' },
  blockDiagram: { en: 'Block diagram', tr: 'Blok şeması' },
  psuStages: { en: 'PSU stages', tr: 'PSU aşamaları' },

  modalEyebrow: { en: 'Power Supply Unit', tr: 'Power Supply Unit' },
  tabDiagram: { en: 'Block diagram', tr: 'Blok şeması' },
  tabWaveforms: { en: 'Waveforms', tr: 'Dalga Şekilleri' },
  tabComponents: { en: 'Components', tr: 'Bileşenler' },

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
  ecLookInside: { en: 'Inside the EC →', tr: 'EC’nin içine bak →' },

  psuPowerUpEyebrow: { en: 'PSU Power-Up Sequence', tr: 'PSU Açılış Sırası' },
  psuPowerUpTitle: {
    en: 'From PS_ON# to PWR_OK',
    tr: 'PS_ON#’tan PWR_OK’e',
  },
  psuPowerUpLookInside: {
    en: 'How the PSU powers up →',
    tr: 'PSU nasıl açılıyor →',
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
  sceneFailedBody: {
    en: 'Your browser may not have WebGL enabled. Check that hardware acceleration is on and reload the page.',
    tr: 'Tarayıcında WebGL kapalı olabilir. Donanım hızlandırmasının açık olduğunu kontrol edip sayfayı yenile.',
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
