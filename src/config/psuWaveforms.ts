import type { Localized } from '../i18n';
import type { Trace } from '../ui/waveforms';

/**
 * The same ten stages as the walkthrough, told through the shape of the signal
 * instead of through the components. Each stage shows what the energy actually
 * looks like at that point, and the stages where something is being *fixed*
 * show the before and after side by side.
 */

export interface WavePanel {
  /** Drives the card color: neutral, a problem being shown, or the fix. */
  variant: 'neutral' | 'bad' | 'good';
  label: Localized;
  caption: Localized;
  traces: Trace[];
}

export interface WaveStage {
  /** Matches the PSU stage id, so the two views stay recognisably the same chain. */
  id: string;
  title: Localized;
  body: Localized;
  panels: WavePanel[];
}

export const PSU_WAVEFORMS: WaveStage[] = [
  {
    id: 'ac-emi',
    title: { en: '1 · AC Input & EMI Filter', tr: '1 · AC Girişi ve EMI Filtresi' },
    body: {
      en: 'What arrives is a 50 Hz sine. What leaves the supply back toward the grid would, without a filter, be that sine with the unit\'s own switching hash riding on it. The EMI filter\'s job is to make sure the second picture never reaches the wall.',
      tr: 'Gelen şey 50 Hz’lik bir sinüstür. Filtre olmasa şebekeye geri dönen şey, üzerine cihazın kendi switching gürültüsü binmiş o sinüs olurdu. EMI filtresinin işi, ikinci resmin duvara hiç ulaşmamasını sağlamaktır.',
    },
    panels: [
      {
        variant: 'bad',
        label: { en: 'Without the filter', tr: 'Filtre olmadan' },
        caption: {
          en: 'switching hash rides back out onto the mains',
          tr: 'switching gürültüsü şebekeye geri sızıyor',
        },
        traces: [{ spec: { kind: 'sine', cycles: 4, noise: 0.14 }, tone: 'accent' }],
      },
      {
        variant: 'good',
        label: { en: 'With the filter', tr: 'Filtre ile' },
        caption: { en: 'clean 230 V · 50 Hz sine', tr: 'temiz 230 V · 50 Hz sinüs' },
        traces: [{ spec: { kind: 'sine', cycles: 4 }, tone: 'accent' }],
      },
    ],
  },
  {
    id: 'rectifier',
    title: {
      en: '2 · Bridge Rectifier & Bulk Capacitors',
      tr: '2 · Köprü Doğrultucu ve Bulk Kondansatörler',
    },
    body: {
      en: 'The bridge folds the negative half of the sine upward, giving humps that are always positive but far from steady. The bulk capacitors then charge to each peak and discharge slowly between them, filling the valleys. What is left of the valleys is ripple.',
      tr: 'Köprü, sinüsün negatif yarısını yukarı katlar; hep pozitif ama kararlı olmaktan uzak tümsekler çıkar. Bulk kondansatörler ardından her tepeye kadar dolar ve aralarda yavaşça boşalarak vadileri doldurur. Vadilerden geriye kalan şey ripple’dır.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: 'After the bridge', tr: 'Köprüden sonra' },
        caption: { en: 'pulsating DC — always positive, never steady', tr: 'pulsating DC — hep pozitif, hiç kararlı değil' },
        traces: [{ spec: { kind: 'rectified', cycles: 4 }, tone: 'accent' }],
      },
      {
        variant: 'good',
        label: { en: 'After the bulk capacitors', tr: 'Bulk kondansatörlerden sonra' },
        caption: { en: 'peaks held, valleys filled — what remains is ripple', tr: 'tepeler tutuluyor, vadiler doluyor — kalan şey ripple' },
        traces: [{ spec: { kind: 'rippleDc', cycles: 4, decay: 0.011 }, tone: 'accent' }],
      },
    ],
  },
  {
    id: 'pfc',
    title: { en: '3 · Active Power Factor Correction', tr: '3 · Active Power Factor Correction' },
    body: {
      en: 'Here the subject is current, not voltage. A rectifier feeding a capacitor only conducts while the line is above what the capacitor already holds — so current arrives as short, violent spikes at the top of each half cycle. Active PFC reshapes that draw to follow the voltage waveform.',
      tr: 'Burada mesele gerilim değil, akım. Kondansatör besleyen bir doğrultucu yalnızca hat, kondansatörün halihazırda tuttuğu değerin üstündeyken iletir — bu yüzden akım her yarım çevrimin tepesinde kısa ve sert darbeler hâlinde gelir. Active PFC bu çekişi gerilim dalga şeklini takip edecek biçimde yeniden şekillendirir.',
    },
    panels: [
      {
        variant: 'bad',
        label: { en: 'Without PFC', tr: 'PFC olmadan' },
        caption: { en: 'current is drawn only at the peaks', tr: 'akım sadece tepelerde çekiliyor' },
        traces: [{ spec: { kind: 'spikes', cycles: 4, sharpness: 18 }, tone: 'accent' }],
      },
      {
        variant: 'good',
        label: { en: 'With Active PFC', tr: 'Active PFC ile' },
        caption: { en: 'current follows the voltage smoothly', tr: 'akım gerilimi düzgünce takip ediyor' },
        traces: [{ spec: { kind: 'rectified', cycles: 4 }, tone: 'accent' }],
      },
    ],
  },
  {
    id: 'switching',
    title: { en: '4 · Primary Switching Stage', tr: '4 · Birincil Switching Katmanı' },
    body: {
      en: 'The MOSFETs chop the ~400 V rail into a high-frequency square wave. Nothing is being regulated by the shape itself yet — the shape exists so the transformer that follows can be small. Note the timebase: these are microseconds, where everything before was milliseconds.',
      tr: 'MOSFET’ler ~400 V rail’i yüksek frekanslı bir kare dalgaya böler. Bu noktada şeklin kendisi henüz bir şey regüle etmiyor — şekil, ardından gelen transformatörün küçük olabilmesi için var. Zaman eksenine dikkat: burası mikrosaniyeler, öncesindeki her şey milisaniyelerdi.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: '~400 V DC chopped at 50–150 kHz', tr: '~400 V DC, 50–150 kHz’de kesiliyor' },
        caption: { en: 'the DC becomes high-frequency AC on purpose', tr: 'DC bilerek yüksek frekanslı AC’ye çevriliyor' },
        traces: [{ spec: { kind: 'square', cycles: 13, duty: 0.46 }, tone: 'accent' }],
      },
    ],
  },
  {
    id: 'transformer',
    title: { en: '5 · Transformer & Galvanic Isolation', tr: '5 · Transformatör ve Galvanik İzolasyon' },
    body: {
      en: 'The shape survives the crossing; the amplitude does not. The turns ratio scales roughly 400 V down to the low tens of volts, and the barrier means the two traces below share no conductor — only a magnetic field.',
      tr: 'Şekil karşıya geçmeyi atlatır, genlik atlatamaz. Sarım oranı kabaca 400 V’u onlu volt seviyelerine indirir ve bariyer, aşağıdaki iki eğrinin hiçbir iletkeni paylaşmadığı anlamına gelir — yalnızca bir manyetik alan.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: 'Primary side', tr: 'Birincil taraf' },
        caption: { en: 'full amplitude, mains-referenced', tr: 'tam genlik, şebeke referanslı' },
        traces: [{ spec: { kind: 'square', cycles: 13, duty: 0.46, amplitude: 0.85 }, tone: 'muted' }],
      },
      {
        variant: 'good',
        label: { en: 'Secondary side', tr: 'İkincil taraf' },
        caption: { en: 'same shape, stepped down, now isolated', tr: 'aynı şekil, düşürülmüş, artık yalıtılmış' },
        traces: [{ spec: { kind: 'square', cycles: 13, duty: 0.46, amplitude: 0.3 }, tone: 'accent' }],
      },
    ],
  },
  {
    id: 'secondary',
    title: {
      en: '6 · Secondary Rectification & Filtering',
      tr: '6 · İkincil Doğrultma ve Filtreleme',
    },
    body: {
      en: 'Rectifying the switching waveform leaves a train of positive blocks — the right average value, but nothing a computer could run on. The LC filter integrates them into a flat rail, and the residue it cannot remove is the ripple the ATX spec puts a ceiling on.',
      tr: 'Switching dalgasını doğrultmak geriye bir dizi pozitif blok bırakır — ortalama değeri doğrudur ama hiçbir bilgisayarın üzerinde çalışabileceği bir şey değildir. LC filtre bunları düz bir rail’e entegre eder; gideremediği kalıntı da ATX spesifikasyonunun tavan koyduğu ripple’dır.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: 'After rectification', tr: 'Doğrultmadan sonra' },
        caption: { en: 'positive blocks, right average, unusable as is', tr: 'pozitif bloklar, doğru ortalama, bu hâliyle kullanılamaz' },
        traces: [{ spec: { kind: 'choppedDc', cycles: 13, duty: 0.46 }, tone: 'accent' }],
      },
      {
        variant: 'good',
        label: { en: 'After the LC filter', tr: 'LC filtreden sonra' },
        caption: { en: '+12 V — ripple under 120 mV peak-to-peak', tr: '+12 V — ripple 120 mV tepeden tepeye altında' },
        traces: [{ spec: { kind: 'flat', level: 0.5, ripple: 0.05 }, tone: 'v12' }],
      },
    ],
  },
  {
    id: 'standby',
    title: {
      en: '7 · Standby Converter',
      tr: '7 · Standby Dönüştürücü',
    },
    body: {
      en: 'This is the picture while the machine is "off". The main rails sit flat at zero because the switching stage is not running at all — and +5VSB is up regardless, because its own little flyback never stopped. Everything the EC does while waiting for the power button happens on that one line.',
      tr: 'Bu, makine “kapalı”yken görülen resim. Ana rail’ler sıfırda düz durur çünkü switching katmanı hiç çalışmıyordur — +5VSB ise buna rağmen ayaktadır, çünkü kendi küçük flyback’i hiç durmamıştır. EC’nin power button’ı beklerken yaptığı her şey o tek hat üzerinde olur.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: 'System in S5 (soft off)', tr: 'Sistem S5’te (soft off)' },
        caption: {
          en: 'main rails at zero, standby alive the whole time',
          tr: 'ana rail’ler sıfırda, standby sürekli canlı',
        },
        traces: [
          { spec: { kind: 'flat', level: 0.45, ripple: 0.02 }, tone: 'standby', name: '+5VSB' },
          { spec: { kind: 'flat', level: -0.55, ripple: 0 }, tone: 'muted', name: '+12V' },
        ],
      },
    ],
  },
  {
    id: 'feedback',
    title: { en: '8 · Feedback Loop & Regulation', tr: '8 · Geri Besleme Döngüsü ve Regülasyon' },
    body: {
      en: 'The output voltage is held steady by changing how long the switch stays on each cycle. A light load needs a narrow pulse, a heavy one a wide pulse — the frequency barely moves, the width does all the work. This is the loop closing thousands of times a second.',
      tr: 'Çıkış gerilimi, anahtarın her çevrimde ne kadar açık kaldığı değiştirilerek sabit tutulur. Hafif yük dar bir darbe, ağır yük geniş bir darbe ister — frekans neredeyse hiç oynamaz, bütün işi genişlik yapar. Bu, saniyede binlerce kez kapanan döngüdür.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: 'Light load — narrow duty cycle', tr: 'Hafif yük — dar duty cycle' },
        caption: { en: 'less energy transferred per cycle', tr: 'çevrim başına daha az enerji aktarılıyor' },
        traces: [{ spec: { kind: 'square', cycles: 13, duty: 0.22 }, tone: 'muted' }],
      },
      {
        variant: 'good',
        label: { en: 'Heavy load — wide duty cycle', tr: 'Ağır yük — geniş duty cycle' },
        caption: { en: 'same frequency, more energy per cycle', tr: 'aynı frekans, çevrim başına daha çok enerji' },
        traces: [{ spec: { kind: 'square', cycles: 13, duty: 0.72 }, tone: 'accent' }],
      },
    ],
  },
  {
    id: 'supervisor',
    title: { en: '9 · Supervisory IC & PWR_OK', tr: '9 · Supervisory IC ve PWR_OK' },
    body: {
      en: 'This is the timing diagram the whole boot chain hangs on. The rails ramp up over a few hundred milliseconds; the supervisory IC watches them, and only once they are all inside tolerance does it raise PWR_OK. That gap between the rails arriving and the signal going high is the delay the chipset is waiting out before it releases the CPU from reset.',
      tr: 'Tüm boot zincirinin asıldığı zamanlama diyagramı budur. Rail’ler birkaç yüz milisaniyede yükselir; supervisory IC onları izler ve ancak hepsi tolerans içine girdiğinde PWR_OK’i yükseltir. Rail’lerin gelişi ile sinyalin yükselmesi arasındaki o boşluk, chipset’in CPU’yu reset’ten çıkarmadan önce beklediği gecikmedir.',
    },
    panels: [
      {
        variant: 'good',
        label: { en: 'Power-up sequence', tr: 'Açılış sırası' },
        caption: {
          en: 'rails settle first, PWR_OK follows 100–500 ms later',
          tr: 'önce rail’ler oturur, PWR_OK 100–500 ms sonra gelir',
        },
        traces: [
          { spec: { kind: 'ramp', start: 0.08, rise: 0.2, level: 0.62 }, tone: 'v12', name: '+12V' },
          { spec: { kind: 'ramp', start: 0.11, rise: 0.2, level: 0.34 }, tone: 'v5', name: '+5V' },
          { spec: { kind: 'ramp', start: 0.14, rise: 0.2, level: 0.06 }, tone: 'v33', name: '+3.3V' },
          { spec: { kind: 'step', at: 0.58, level: -0.3 }, tone: 'ok', name: 'PWR_OK' },
        ],
      },
    ],
  },
  {
    id: 'outputs',
    title: { en: '10 · Output Connectors', tr: '10 · Çıkış Konektörleri' },
    body: {
      en: 'What finally leaves the connectors is three flat lines with a small, bounded amount of ripple on each. Everything the supply did — rectifying, boosting, chopping, isolating, rectifying again, filtering, and watching itself the whole time — was in service of making these three lines boring.',
      tr: 'Konektörlerden nihayet çıkan şey, her birinin üzerinde küçük ve sınırlı miktarda ripple bulunan üç düz hattır. Beslemenin yaptığı her şey — doğrultmak, yükseltmek, kesip biçmek, yalıtmak, tekrar doğrultmak, filtrelemek ve bu süre boyunca kendini izlemek — bu üç hattı sıkıcı kılmak içindi.',
    },
    panels: [
      {
        variant: 'good',
        label: { en: 'The rails as the motherboard sees them', tr: 'Anakartın gördüğü hâliyle rail’ler' },
        caption: {
          en: '+12V ±120 mV · +5V and +3.3V ±50 mV',
          tr: '+12V ±120 mV · +5V ve +3.3V ±50 mV',
        },
        traces: [
          { spec: { kind: 'flat', level: 0.6, ripple: 0.05, rippleCycles: 24 }, tone: 'v12', name: '+12V' },
          { spec: { kind: 'flat', level: 0.2, ripple: 0.03, rippleCycles: 31 }, tone: 'v5', name: '+5V' },
          { spec: { kind: 'flat', level: -0.15, ripple: 0.03, rippleCycles: 19 }, tone: 'v33', name: '+3.3V' },
          { spec: { kind: 'flat', level: -0.5, ripple: 0.02, rippleCycles: 27 }, tone: 'standby', name: '+5VSB' },
        ],
      },
    ],
  },
];
