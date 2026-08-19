import type { WaveStage } from './psuWaveforms';

/**
 * The VRM told through the shape of the current and the voltage.
 *
 * The PSU waveforms are about turning one shape into another. These are about
 * something different: almost every plot here is an argument for why the VRM is
 * built out of four of something rather than one of it. The phases exist to
 * cancel each other, and the only way to see that is to draw them together.
 *
 * Reuses the PSU's WaveStage shape so the tab renders through the same view.
 */
export const VRM_WAVEFORMS: WaveStage[] = [
  {
    id: 'why',
    title: { en: '1 · Why Not Just Regulate It Down', tr: '1 · Neden Doğrudan Düşürmüyoruz' },
    body: {
      en: 'The CPU wants about one volt and can draw two hundred amps. Dropping 12 V to 1 V by burning the difference would turn eleven volts times that current into heat — well over a kilowatt, on the motherboard. So the VRM does not drop the voltage at all: it chops the 12 V into pulses and lets an inductor average them. The width of the pulse sets the output, and almost nothing is wasted.',
      tr: 'CPU yaklaşık bir volt ister ve iki yüz ampere kadar çekebilir. 12 V’u aradaki farkı yakarak 1 V’a düşürmek, on bir voltu o akımla çarpıp ısıya çevirmek olurdu — anakart üzerinde bir kilovatın çok üstünde. Bu yüzden VRM gerilimi hiç düşürmez: 12 V’u darbelere böler ve bir bobinin bunları ortalamasına izin verir. Darbenin genişliği çıkışı belirler ve neredeyse hiçbir şey harcanmaz.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: 'The switch node', tr: 'Anahtar düğümü' },
        caption: {
          en: 'full 12 V, on for a twelfth of the time',
          tr: 'tam 12 V, zamanın on ikide birinde açık',
        },
        traces: [{ spec: { kind: 'square', cycles: 8, duty: 0.09, amplitude: 0.8 }, tone: 'v12' }],
      },
      {
        variant: 'good',
        label: { en: 'After the inductor', tr: 'Bobinden sonra' },
        caption: { en: 'averaged to about 1 V', tr: 'yaklaşık 1 V’a ortalanmış' },
        traces: [{ spec: { kind: 'flat', level: -0.5, ripple: 0.05, rippleCycles: 8 }, tone: 'accent' }],
      },
    ],
  },
  {
    id: 'phases',
    title: { en: '2 · One Phase, and Why It Is Not Enough', tr: '2 · Tek Faz ve Neden Yetmediği' },
    body: {
      en: 'Inside one phase the current is a triangle, not a flat line: it ramps up while the switch is on and back down while it is off. That ripple has to go somewhere, and a single phase carrying the whole load would have to be enormous, would ripple hard, and would put all the heat in one spot on the board.',
      tr: 'Tek bir fazın içinde akım düz bir çizgi değil, bir üçgendir: anahtar açıkken yükselir, kapalıyken düşer. O ripple bir yere gitmek zorundadır ve tüm yükü taşıyan tek bir faz devasa olmak zorunda kalır, sert ripple yapar ve tüm ısıyı kartın tek bir noktasına yığar.',
    },
    panels: [
      {
        variant: 'bad',
        label: { en: 'A single phase carrying everything', tr: 'Her şeyi taşıyan tek faz' },
        caption: { en: 'large ripple, one hot spot', tr: 'büyük ripple, tek sıcak nokta' },
        traces: [{ spec: { kind: 'triangle', cycles: 3, amplitude: 0.62, level: 0.05, duty: 0.16 }, tone: 'phase1' }],
      },
    ],
  },
  {
    id: 'phases-sum',
    title: { en: '3 · Four Phases, 90° Apart', tr: '3 · Dört Faz, 90° Aralıklı' },
    body: {
      en: 'The controller runs four phases from one clock but starts each a quarter of a period after the last. Each carries a quarter of the current, so each can be small. And because one phase is ramping down exactly while another ramps up, their ripples partly cancel — the sum is far flatter than any of its parts. This is the entire reason a motherboard has a row of identical chokes rather than one big one.',
      tr: 'Denetleyici dört fazı tek bir saatten sürer ama her birini bir öncekinden çeyrek periyot sonra başlatır. Her biri akımın dörtte birini taşır, dolayısıyla her biri küçük olabilir. Ve bir faz tam olarak bir diğeri yükselirken düştüğü için ripple’ları kısmen birbirini götürür — toplam, parçalarının hepsinden çok daha düzdür. Bir anakartta tek büyük bobin yerine sıra sıra aynı bobinlerin olmasının tüm sebebi budur.',
    },
    panels: [
      {
        variant: 'neutral',
        label: { en: 'The four phase currents', tr: 'Dört faz akımı' },
        caption: { en: 'same shape, shifted a quarter period each', tr: 'aynı şekil, her biri çeyrek periyot kaymış' },
        traces: [
          { spec: { kind: 'triangle', cycles: 3, phase: 0, amplitude: 0.5, duty: 0.16 }, tone: 'phase1' },
          { spec: { kind: 'triangle', cycles: 3, phase: 0.25, amplitude: 0.5, duty: 0.16 }, tone: 'phase2' },
          { spec: { kind: 'triangle', cycles: 3, phase: 0.5, amplitude: 0.5, duty: 0.16 }, tone: 'phase3' },
          { spec: { kind: 'triangle', cycles: 3, phase: 0.75, amplitude: 0.5, duty: 0.16 }, tone: 'phase4' },
        ],
      },
      {
        variant: 'good',
        label: { en: 'What the CPU actually sees', tr: 'CPU’nun gerçekte gördüğü' },
        caption: {
          en: 'far smaller ripple, and four times as fast',
          tr: 'çok daha küçük ripple, üstelik dört kat hızlı',
        },
        traces: [
          { spec: { kind: 'phaseSum', cycles: 3, phases: 4, amplitude: 0.5, level: 0, duty: 0.16 }, tone: 'ok' },
        ],
      },
    ],
  },
  {
    id: 'order',
    title: { en: '4 · The Rails Come Up in Order', tr: '4 · Rail’ler Sırayla Kalkıyor' },
    body: {
      en: 'The rails are not switched on together. A chip whose I/O pins are powered before its core can push current into an unpowered die and trigger latch-up — a parasitic structure inside the silicon that turns into a short and does not stop until power is removed. So the sequencer enables each rail a fixed delay after the last, in the order the datasheet demands.',
      tr: 'Rail’ler birlikte açılmaz. G/Ç pinleri çekirdeğinden önce beslenen bir yonga, beslenmemiş bir kalıba akım sürebilir ve latch-up tetikleyebilir — silikonun içinde kısa devreye dönüşen ve güç kesilene kadar durmayan asalak bir yapı. Bu yüzden sıralayıcı her rail’i bir öncekinden sabit bir gecikme sonra, veri sayfasının şart koştuğu sırada etkinleştirir.',
    },
    panels: [
      {
        variant: 'good',
        label: { en: 'Staggered, as the datasheet demands', tr: 'Veri sayfasının istediği gibi kademeli' },
        caption: { en: 'VCCSA, then VDDQ, then VCORE', tr: 'VCCSA, sonra VDDQ, sonra VCORE' },
        traces: [
          { spec: { kind: 'ramp', start: 0.1, rise: 0.12, level: 0.62 }, tone: 'v33', name: 'VCCSA' },
          { spec: { kind: 'ramp', start: 0.28, rise: 0.12, level: 0.24 }, tone: 'v5', name: 'VDDQ' },
          { spec: { kind: 'ramp', start: 0.46, rise: 0.12, level: -0.14 }, tone: 'phase1', name: 'VCORE' },
        ],
      },
    ],
  },
  {
    id: 'reset',
    title: { en: '5 · A Load Step, and the Droop', tr: '5 · Yük Sıçraması ve Droop' },
    body: {
      en: 'When the CPU wakes several cores at once its draw can jump by a hundred amps in under a microsecond. The inductors cannot change current that fast, so the voltage dips until the loop catches up — and the capacitors under the socket exist to supply that gap. Notice it settles slightly lower than it started: that is deliberate. Allowing the voltage to sag in proportion to the load leaves more headroom for the next jump.',
      tr: 'CPU birden çok çekirdeği aynı anda uyandırdığında çekişi bir mikrosaniyeden kısa sürede yüz amper sıçrayabilir. Bobinler akımı o hızda değiştiremez, dolayısıyla döngü yetişene kadar gerilim düşer — soketin altındaki kondansatörler tam da o boşluğu beslemek için vardır. Başladığı yerden biraz daha aşağıda oturduğuna dikkat et: bu kasıtlıdır. Gerilimin yükle orantılı olarak sarkmasına izin vermek, bir sonraki sıçrama için daha fazla pay bırakır.',
    },
    panels: [
      {
        variant: 'bad',
        label: { en: 'Without enough capacitance', tr: 'Yeterli kapasite olmadan' },
        caption: { en: 'the dip goes below the CPU minimum', tr: 'düşüş CPU’nun alt sınırının altına iniyor' },
        traces: [
          { spec: { kind: 'droop', at: 0.35, depth: 0.75, recover: 0.4, level: 0.45 }, tone: 'accent' },
        ],
      },
      {
        variant: 'good',
        label: { en: 'With the plane and its caps', tr: 'Plane ve kondansatörleriyle' },
        caption: { en: 'shallow dip, then a deliberate droop', tr: 'sığ düşüş, ardından kasıtlı bir droop' },
        traces: [
          { spec: { kind: 'droop', at: 0.35, depth: 0.3, recover: 0.22, level: 0.45 }, tone: 'ok' },
        ],
      },
    ],
  },
];
