import type { Localized } from '../i18n';

/**
 * The internals of the power supply, as a chain of stages from the wall socket
 * to the DC rails. Shared by the 3D walkthrough inside the unit and the block
 * diagram dialog, so the prose lives in exactly one place.
 *
 * `nodes` and `edges` reference element ids in the SVG built by
 * `src/ui/psuDiagram.ts`; keep the two files in sync when adding a stage.
 */
export interface PsuStage {
  id: string;
  /** Heading in the detail panel and label in the stage list. */
  title: Localized;
  /** Short state of the energy at this point, rendered as a badge. */
  badge: Localized;
  description: Localized;
  /** SVG node ids highlighted while this stage is active. */
  nodes: string[];
  /** SVG edge ids animated while this stage is active. */
  edges?: string[];
  /** Cross-reference back to the boot chain, when there is one. */
  bootNote?: Localized;
}

export const PSU_STAGES: PsuStage[] = [
  {
    id: 'ac-emi',
    title: { en: 'AC Input & EMI Filter', tr: 'AC Girişi ve EMI Filtresi' },
    badge: { en: '230 V AC', tr: '230 V AC' },
    description: {
      en: "Mains AC arrives from the wall socket and passes straight into a filter stage built from common-mode chokes and capacitors. It stops the supply's own switching noise from leaking back out into the grid, and grid noise from getting in. Many units also put an NTC inrush limiter here, to soften the surge of current that flows while the bulk capacitors charge on the very first power-up.",
      tr: 'Şebeke AC’si duvar prizinden gelir ve doğrudan common-mode choke’lar ile kondansatörlerden kurulu bir filtre katmanına girer. Bu katman hem PSU’nun kendi switching gürültüsünün şebekeye geri sızmasını, hem de şebeke gürültüsünün içeri girmesini engeller. Birçok üründe burada ayrıca bir NTC inrush limiter bulunur; ilk enerjilendirmede bulk kondansatörler dolarken akan ani akım darbesini yumuşatır.',
    },
    nodes: ['ac', 'emi'],
    edges: ['e-ac-emi'],
  },
  {
    id: 'rectifier',
    title: { en: 'Bridge Rectifier & Bulk Capacitors', tr: 'Köprü Doğrultucu ve Bulk Kondansatörler' },
    badge: { en: 'pulsating DC', tr: 'pulsating DC' },
    description: {
      en: 'Four diodes fold the AC sine wave into pulsating DC — still rippling, but now always positive. That raw DC is banked in the bulk capacitors: the large cylindrical cans that dominate the inside of the unit, typically rated somewhere in the 200–450 V range.',
      tr: 'Dört diyot AC sinüs dalgasını katlayarak pulsating DC’ye çevirir — hâlâ dalgalıdır ama artık hep pozitiftir. Bu ham DC, bulk kondansatörlerde biriktirilir: cihazın içine hâkim olan, tipik olarak 200–450 V aralığında derecelendirilmiş büyük silindirik kutular.',
    },
    nodes: ['rectifier'],
    edges: ['e-emi-rect'],
  },
  {
    id: 'pfc',
    title: { en: 'Active Power Factor Correction', tr: 'Active Power Factor Correction' },
    badge: { en: '≈400 V DC', tr: '≈400 V DC' },
    description: {
      en: 'A small boost converter shapes the current waveform to follow the voltage waveform, pulling the power factor toward 1 so the current drawn from the grid is clean. It also regulates the bulk rail to a steady 380–400 V DC, which is what absorbs the difference between a 110 V and a 230 V supply — the reason modern units are universal input with no voltage selector switch.',
      tr: 'Küçük bir boost converter, akım dalga şeklini gerilim dalga şeklini takip edecek biçimde şekillendirir ve power factor’ü 1’e yaklaştırır; böylece şebekeden çekilen akım temiz olur. Aynı devre bulk rail’i sabit 380–400 V DC’ye regüle eder ve 110 V ile 230 V arasındaki farkı burada soğurur — modern cihazların universal input olmasının ve gerilim seçici anahtar taşımamasının sebebi budur.',
    },
    nodes: ['pfc'],
    edges: ['e-rect-pfc'],
  },
  {
    id: 'switching',
    title: { en: 'Primary Switching Stage', tr: 'Birincil Switching Katmanı' },
    badge: { en: '50–150 kHz', tr: '50–150 kHz' },
    description: {
      en: 'This is where the "switched-mode" part actually happens. MOSFETs chop the ~400 V DC at high frequency — a half-bridge, or an LLC resonant converter in newer and more efficient designs. The DC becomes a high-frequency AC waveform purely so the transformer that follows can be small: core size scales inversely with frequency, so a tiny transformer does the job a huge 50 Hz one would otherwise need to.',
      tr: '“Switched-mode” kısmı asıl burada gerçekleşir. MOSFET’ler ~400 V DC’yi yüksek frekansta kesip biçer — half-bridge topolojisi ya da daha yeni ve verimli tasarımlarda LLC resonant converter. DC’nin yüksek frekanslı bir AC dalgasına dönüştürülmesinin tek sebebi, ardından gelen transformatörün küçük olabilmesidir: çekirdek boyutu frekansla ters orantılıdır, yani devasa bir 50 Hz trafonun işini minik bir trafo görür.',
    },
    nodes: ['switching'],
    edges: ['e-pfc-sw'],
    bootNote: {
      en: 'PS_ON# is the signal that switches this stage on.',
      tr: 'Bu katmanı devreye sokan sinyal PS_ON#’dır.',
    },
  },
  {
    id: 'transformer',
    title: { en: 'Transformer & Galvanic Isolation', tr: 'Transformatör ve Galvanik İzolasyon' },
    badge: { en: 'isolation barrier', tr: 'izolasyon bariyeri' },
    description: {
      en: 'The high-frequency waveform crosses a ferrite transformer that does two jobs at once. It steps the voltage down toward the levels that will become 12 V, 5 V and 3.3 V — and it galvanically isolates the output side from the mains side. There is no electrical path across it, only magnetic coupling. Without that, every metal surface in the case would be sitting at mains potential.',
      tr: 'Yüksek frekanslı dalga, aynı anda iki iş yapan bir ferrit transformatörden geçer. Gerilimi 12 V, 5 V ve 3.3 V olacak seviyelere düşürür — ve çıkış tarafını şebeke tarafından galvanik olarak yalıtır. Üzerinden geçen hiçbir elektriksel yol yoktur, yalnızca manyetik kuplaj vardır. Bu olmasa kasadaki her metal yüzey şebeke potansiyelinde olurdu.',
    },
    nodes: ['transformer', 'barrier'],
    edges: ['e-sw-tr'],
  },
  {
    id: 'secondary',
    title: { en: 'Secondary Rectification & Filtering', tr: 'İkincil Doğrultma ve Filtreleme' },
    badge: { en: '+12V / +5V / +3.3V', tr: '+12V / +5V / +3.3V' },
    description: {
      en: 'On the far side of the barrier, Schottky diodes — or synchronous rectification using MOSFETs in higher-efficiency units — turn the low-voltage HF AC back into DC, and LC filters smooth it into clean rails. In modern designs only +12 V comes off the transformer directly; +5 V and +3.3 V are derived from it by buck converters. Older units wound all three rails separately, a design known as group regulation.',
      tr: 'Bariyerin öte yanında Schottky diyotlar — ya da yüksek verimli cihazlarda MOSFET kullanan synchronous rectification — düşük gerilimli yüksek frekanslı AC’yi tekrar DC’ye çevirir, LC filtreler de bunu temiz rail’lere düzleştirir. Modern tasarımlarda transformatörden doğrudan yalnızca +12 V alınır; +5 V ve +3.3 V ondan buck converter’larla türetilir. Eski cihazlar üç rail’i de ayrı ayrı sarardı; bu tasarıma group regulation denir.',
    },
    nodes: ['secondary', 'filter'],
    edges: ['e-tr-sec', 'e-sec-filt'],
  },
  {
    id: 'standby',
    title: {
      en: 'Standby Converter — Separate, Small, Always On',
      tr: 'Standby Dönüştürücü — Ayrı, Küçük, Hep Açık',
    },
    badge: { en: '+5VSB', tr: '+5VSB' },
    description: {
      en: "The +5VSB rail comes from a completely separate miniature copy of the whole circuit: a small flyback converter with its own transformer, its own MOSFET and its own controller. It runs the entire time the unit is plugged in, even with the PFC and main switching stage shut down. It only has to feed the board's sleep-mode logic — the EC/PCH, Wake-on-LAN, the real-time clock — so a couple of amps is plenty. This is why you can see two transformers inside a PSU: the large main one, and a tiny standby one beside it.",
      tr: '+5VSB rail’i, devrenin tamamının bağımsız ve minyatür bir kopyasından gelir: kendi transformatörü, kendi MOSFET’i ve kendi kontrolcüsü olan küçük bir flyback converter. Cihaz fişe takılı olduğu sürece, PFC ve ana switching katmanı kapalıyken bile çalışır. Yalnızca kartın uyku modu mantığını beslemesi gerekir — EC/PCH, Wake-on-LAN, real-time clock — bu yüzden birkaç amper fazlasıyla yeter. Bir PSU’nun içinde iki transformatör görmenin sebebi budur: büyük olan ana trafo, yanındaki minik olan ise standby trafosu.',
    },
    nodes: ['standby'],
    edges: ['e-rect-sb', 'e-sb-out'],
    bootNote: {
      en: 'This is the rail that keeps the EC awake in S5, listening for the power button.',
      tr: 'S5’te EC’yi ayakta tutup power button’ı dinlemesini sağlayan rail budur.',
    },
  },
  {
    id: 'feedback',
    title: { en: 'Feedback Loop & Regulation', tr: 'Geri Besleme Döngüsü ve Regülasyon' },
    badge: { en: 'optocoupler', tr: 'optocoupler' },
    description: {
      en: 'To hold the outputs steady, a feedback signal travels from the secondary side back to the primary through an optocoupler — critical here, because that information has to cross the isolation barrier on light rather than copper. The primary-side PWM controller trims its switching frequency or duty cycle in response, so the rails hold their voltage even when the CPU suddenly slams into a high-power state.',
      tr: 'Çıkışları sabit tutmak için ikincil taraftan birincil tarafa bir geri besleme sinyali gider ve bunu bir optocoupler üzerinden yapar — burada kritik olan, bu bilginin izolasyon bariyerini bakır üzerinden değil ışık üzerinden geçmek zorunda olmasıdır. Birincil taraftaki PWM kontrolcüsü buna göre switching frekansını ya da duty cycle’ı ayarlar; böylece CPU ansızın yüksek güç çekmeye başlasa bile rail’ler gerilimini korur.',
    },
    nodes: ['opto', 'switching'],
    edges: ['e-fb'],
  },
  {
    id: 'supervisor',
    title: {
      en: 'Supervisory IC — Where PWR_OK Comes From',
      tr: 'Supervisory IC — PWR_OK’in Kaynağı',
    },
    badge: { en: 'PWR_OK', tr: 'PWR_OK' },
    description: {
      en: 'A separate supervisory IC watches every rail continuously and shuts the unit down the moment a threshold is crossed: OVP for overvoltage, UVP for undervoltage, OCP for overcurrent, OTP for overtemperature, SCP for a short circuit. That same chip produces PWR_OK, raising it only once every rail has passed its checks and settled.',
      tr: 'Ayrı bir supervisory IC her rail’i sürekli izler ve bir eşik aşıldığı anda cihazı kapatır: aşırı gerilim için OVP, düşük gerilim için UVP, aşırı akım için OCP, aşırı sıcaklık için OTP, kısa devre için SCP. Aynı yonga PWR_OK’i de üretir ve bu sinyali ancak tüm rail’ler denetimlerden geçip oturduktan sonra yükseltir.',
    },
    nodes: ['supervisor'],
    edges: ['e-sup-mon1', 'e-sup-mon2', 'e-sup-out'],
    bootNote: {
      en: 'This is the signal the chipset waits for before releasing the CPU from reset.',
      tr: 'Chipset’in CPU’yu reset’ten çıkarmadan önce beklediği sinyal budur.',
    },
  },
  {
    id: 'outputs',
    title: { en: 'Output Connectors', tr: 'Çıkış Konektörleri' },
    badge: { en: 'to the motherboard', tr: 'anakarta doğru' },
    description: {
      en: 'The regulated rails fan out to the 24-pin main connector and the auxiliary ones: EPS 4/8-pin for the CPU, PCIe 6/8-pin for the graphics card, plus SATA and Molex. In high-power systems the CPU and GPU get their own dedicated +12 V runs, because carrying that much current through the 24-pin connector alone is not practical.',
      tr: 'Regüle edilmiş rail’ler 24-pin ana konektöre ve yardımcı konektörlere dağılır: CPU için EPS 4/8-pin, ekran kartı için PCIe 6/8-pin, ayrıca SATA ve Molex. Yüksek güçlü sistemlerde CPU ve GPU kendi ayrılmış +12 V hatlarını alır, çünkü bu kadar akımı tek başına 24-pin konektör üzerinden taşımak pratik değildir.',
    },
    nodes: ['outputs'],
    edges: ['e-filt-out'],
  },
];
