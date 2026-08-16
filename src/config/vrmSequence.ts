import type { BootStep } from '../types';
import { RAIL_COLORS } from './constants';

/**
 * What the motherboard does once PWR_OK arrives: turning one +12V rail into the
 * several the CPU actually needs, in the order the CPU vendor demands, and only
 * then letting it out of reset.
 *
 * Unlike the PSU and EC walkthroughs this one needs no new geometry — every
 * actor is already on the board. The story is carried entirely by where the
 * signals go and in what order.
 */
export const VRM_SEQUENCE_STEPS: BootStep[] = [
  {
    id: 'vrm-handoff',
    phase: 'power',
    title: { en: 'PWR_OK Reaches the PCH', tr: 'PWR_OK PCH’ye Ulaşıyor' },
    signal: 'PWR_OK',
    description: {
      en: 'With PWR_OK asserted the PSU\'s job is finished and the board takes over. The signal usually goes straight to the PCH, though on many designs it passes through the EC first. Either way it becomes an input to the chipset\'s own power state machine — and from here there is no longer one source of power but dozens of separate rails.',
      tr: 'PWR_OK verildiğinde PSU’nun işi biter ve kart devralır. Sinyal genellikle doğrudan PCH’ye gider, ancak birçok tasarımda önce EC üzerinden geçer. Her hâlükârda chipset’in kendi güç durum makinesine bir girdi olur — ve buradan sonra tek bir güç kaynağı değil, onlarca ayrı rail vardır.',
    },
    duration: 5200,
    view: 'vrm',
    screen: 'off',
    highlight: ['atx24', 'superio', 'chipset'],
    signals: [
      {
        route: ['atx24', 'superio'],
        color: RAIL_COLORS.PWR_OK,
        particles: 8,
        spread: 0.45,
      },
      {
        route: ['superio', 'chipset'],
        color: RAIL_COLORS.PWR_OK,
        label: 'PWR_OK',
        particles: 10,
        delay: 0.4,
        spread: 0.45,
      },
    ],
  },
  {
    id: 'vrm-why',
    phase: 'power',
    title: { en: 'Why a VRM Exists', tr: 'VRM Neden Var' },
    signal: { en: '12 V → ~1 V', tr: '12 V → ~1 V' },
    description: {
      en: 'The +12V arriving from the PSU is nowhere near what a CPU core runs on — that is typically 0.8 V to 1.4 V, the voltage called Vcore. Bridging that gap is the VRM: fundamentally the same buck converter the PSU uses to derive +5V and +3.3V, just far larger and far more aggressive.',
      tr: 'PSU’dan gelen +12V, bir CPU çekirdeğinin çalıştığı gerilime hiç yakın değildir — o tipik olarak 0.8 V ile 1.4 V arasıdır ve Vcore diye anılır. Bu uçurumu kapatan şey VRM’dir: temelde PSU’nun +5V ve +3.3V türetmek için kullandığı buck converter’ın ta kendisi, yalnızca çok daha büyük ve çok daha agresif olanı.',
    },
    duration: 5200,
    view: 'vrm',
    screen: 'off',
    highlight: ['eps12v', 'vrm'],
    signals: [
      {
        route: ['eps12v', 'vrm'],
        color: RAIL_COLORS['+12V'],
        label: '+12V (EPS)',
        particles: 12,
        persist: true,
        thickness: 1.3,
      },
    ],
  },
  {
    id: 'vrm-phases',
    phase: 'power',
    title: { en: 'Multi-Phase — Splitting 200 Amps', tr: 'Multi-Phase — 200 Amperi Bölmek' },
    signal: { en: '6–20 phases', tr: '6–20 faz' },
    description: {
      en: 'A high-end CPU can pull more than 200 A. No single buck converter handles that, so the VRM runs 6 to 20 phases in parallel, each with its own inductor and MOSFET pair, switching slightly out of step with the others. Splitting the load spreads the heat and, just as importantly, lets the VRM react far faster to a sudden change in demand.',
      tr: 'Üst segment bir CPU 200 A’in üzerinde akım çekebilir. Bunu tek bir buck converter kaldıramaz; bu yüzden VRM, her biri kendi bobini ve MOSFET çiftine sahip 6 ila 20 fazı paralel çalıştırır ve fazlar birbirinden hafifçe kaymış şekilde anahtarlar. Yükü bölmek hem ısıyı dağıtır hem de — en az onun kadar önemlisi — VRM’in ani talep değişimine çok daha hızlı tepki vermesini sağlar.',
    },
    duration: 5400,
    view: 'vrm',
    screen: 'off',
    highlight: ['vrm', 'vcore', 'cpu'],
    signals: [
      {
        route: ['vrm', 'vcore'],
        color: RAIL_COLORS.vcore,
        label: 'Vcore',
        particles: 16,
        persist: true,
        thickness: 1.3,
      },
    ],
  },
  {
    id: 'vrm-rails',
    phase: 'power',
    title: { en: 'Not One Voltage, Several', tr: 'Tek Gerilim Değil, Birkaç Tane' },
    signal: 'Vcore · VCCSA · VCCIO · VDDQ',
    description: {
      en: 'The CPU does not take a single supply. Vcore feeds the cores, VCCSA the system agent, VCCIO the I/O ring, VDDQ the memory interface and the DIMMs. Each is a separate regulator with its own target voltage, and each has to be brought up on its own.',
      tr: 'CPU tek bir besleme almaz. Vcore çekirdekleri, VCCSA sistem ajanını, VCCIO I/O halkasını, VDDQ ise bellek arayüzünü ve DIMM’leri besler. Her biri kendi hedef gerilimine sahip ayrı bir regülatördür ve her biri ayrı ayrı ayağa kaldırılmak zorundadır.',
    },
    duration: 5600,
    view: 'vrm',
    screen: 'off',
    highlight: ['vrm', 'vcore', 'vccsa', 'vccio', 'vddq', 'ram'],
    signals: [
      {
        route: ['vrm', 'vcore'],
        color: RAIL_COLORS.vcore,
        particles: 8,
        persist: true,
        spread: 0.3,
      },
      {
        route: ['vrm', 'vccio'],
        color: RAIL_COLORS['+3.3V'],
        label: 'VCCIO',
        particles: 7,
        persist: true,
        delay: 0.2,
        spread: 0.3,
      },
      {
        route: ['vrm', 'vccsa'],
        color: RAIL_COLORS['+5V'],
        label: 'VCCSA',
        particles: 7,
        persist: true,
        delay: 0.4,
        spread: 0.3,
      },
      {
        route: ['vrm', 'vddq'],
        color: RAIL_COLORS['+12V'],
        label: 'VDDQ',
        particles: 7,
        persist: true,
        delay: 0.6,
        spread: 0.3,
      },
    ],
  },
  {
    id: 'vrm-order',
    phase: 'power',
    title: { en: 'Order Matters — Latch-Up', tr: 'Sıra Önemli — Latch-Up' },
    signal: { en: 'sequencing', tr: 'sequencing' },
    description: {
      en: 'The order these rails come up in, and the delays between them, are specified exactly in the CPU vendor\'s datasheet. Getting it wrong is not a performance problem: if the I/O voltage arrives outside its permitted margin relative to the core voltage, parasitic structures inside the silicon can trigger latch-up — a self-sustaining short that permanently destroys the chip.',
      tr: 'Bu rail’lerin hangi sırayla ve aralarında hangi gecikmelerle geldiği, CPU üreticisinin datasheet’inde kesin olarak tanımlıdır. Yanlış yapmak bir performans sorunu değildir: I/O gerilimi çekirdek gerilimine göre izin verilen marjın dışında gelirse, silikonun içindeki parazitik yapılar latch-up’ı tetikleyebilir — yongayı kalıcı olarak yok eden, kendi kendini besleyen bir kısa devre.',
    },
    duration: 5600,
    view: 'vrm',
    screen: 'off',
    highlight: ['sequencer', 'vrm'],
    signals: [
      {
        route: ['sequencer', 'vrm'],
        color: RAIL_COLORS.data,
        label: 'enable, in order',
        particles: 10,
        spread: 0.5,
      },
    ],
  },
  {
    id: 'vrm-pwrgd',
    phase: 'power',
    title: { en: 'Every Rail Reports Back', tr: 'Her Rail Geri Bildirim Veriyor' },
    signal: 'PWRGD',
    description: {
      en: 'Exactly as the PSU produced one PWR_OK for itself, each regulator produces its own PWRGD once its output has reached target and settled. These are separate signals from separate chips, saying separate things — this rail is ready, that one is ready.',
      tr: 'PSU’nun kendisi için tek bir PWR_OK üretmesi gibi, her regülatör de çıkışı hedefe ulaşıp oturduğunda kendi PWRGD’sini üretir. Bunlar ayrı yongalardan gelen ayrı sinyallerdir ve ayrı şeyler söylerler — bu rail hazır, şu rail hazır.',
    },
    duration: 5200,
    view: 'vrm',
    screen: 'off',
    highlight: ['vcore', 'vccsa', 'vccio', 'vddq', 'sequencer'],
    signals: [
      {
        route: ['vcore', 'sequencer'],
        color: RAIL_COLORS.PWR_OK,
        particles: 6,
        spread: 0.35,
      },
      {
        route: ['vccio', 'sequencer'],
        color: RAIL_COLORS.PWR_OK,
        particles: 6,
        delay: 0.2,
        spread: 0.35,
      },
      {
        route: ['vccsa', 'sequencer'],
        color: RAIL_COLORS.PWR_OK,
        particles: 6,
        delay: 0.35,
        spread: 0.35,
      },
      {
        route: ['vddq', 'sequencer'],
        color: RAIL_COLORS.PWR_OK,
        label: 'PWRGD',
        particles: 6,
        delay: 0.5,
        spread: 0.35,
      },
    ],
  },
  {
    id: 'vrm-gate',
    phase: 'power',
    title: { en: 'All-Good, Gated', tr: 'Hepsi İyi — Kapı Açılıyor' },
    signal: { en: 'aggregated', tr: 'birleştirilmiş' },
    description: {
      en: 'The individual PWRGD lines are combined — through a logic gate on some boards, inside the sequencer on others — into a single verdict. Nothing moves until every one of them agrees. It is the same pattern the PSU used one level down, applied again at board level.',
      tr: 'Tek tek PWRGD hatları birleştirilir — bazı kartlarda bir mantık kapısı üzerinden, bazılarında sequencer’ın içinde — ve tek bir karara dönüşür. Hepsi birden onaylamadan hiçbir şey ilerlemez. Bu, PSU’nun bir kat aşağıda kullandığı kalıbın kart seviyesinde tekrarıdır.',
    },
    duration: 5000,
    view: 'vrm',
    screen: 'off',
    highlight: ['sequencer', 'chipset'],
    signals: [
      {
        route: ['sequencer', 'chipset'],
        color: RAIL_COLORS.PWR_OK,
        label: 'all rails good',
        particles: 10,
        spread: 0.5,
      },
    ],
  },
  {
    id: 'vrm-reset',
    phase: 'power',
    title: { en: 'CPU RESET# Is Released', tr: 'CPU RESET# Bırakılıyor' },
    signal: 'RESET# → HIGH',
    description: {
      en: 'With the verdict in, the sequencer or the PCH takes the last step and releases the CPU\'s RESET# pin. Active low again: holding it down meant "stay in reset", so letting it rise is the release. The moment it goes high the CPU is electrically ready — it finishes its internal reset sequence and fetches its first instruction.',
      tr: 'Karar geldiğinde sequencer ya da PCH son adımı atar ve CPU’nun RESET# pinini bırakır. Yine active-low: hattı aşağıda tutmak “reset’te kal” demekti, bırakmak ise serbest bırakmaktır. Yükseldiği anda CPU elektriksel olarak hazırdır — kendi dahili reset sekansını tamamlar ve ilk komutunu çeker.',
    },
    duration: 5400,
    view: 'vrm',
    screen: 'off',
    highlight: ['chipset', 'cpu'],
    signals: [
      {
        route: ['chipset', 'cpu'],
        color: RAIL_COLORS['PS_ON#'],
        label: 'RESET# released',
        particles: 14,
        persist: true,
        thickness: 1.2,
      },
    ],
  },
];
