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
  pinoutIntro: {
    en: 'Pin numbering follows the ATX specification, viewed from the wire entry side of the connector. Wire colors are the industry convention — individually sleeved cables often ignore them entirely, so never identify a rail by color alone.',
    tr: 'Pin numaralandırması ATX spesifikasyonuna göredir ve konektöre kabloların girdiği taraftan bakılarak verilmiştir. Kablo renkleri sektör konvansiyonudur — kılıflı (sleeved) kablolarda bu renklere çoğu zaman uyulmaz, o yüzden bir rail’i asla yalnızca renginden teşhis etme.',
  },

  logIn: { en: 'Log In', tr: 'Oturum Aç' },
};
