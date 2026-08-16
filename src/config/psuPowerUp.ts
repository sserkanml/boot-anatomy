import type { ModalStage } from '../types';

/**
 * What happens inside the PSU once PS_ON# is pulled low, told over the same
 * block diagram as the component walkthrough.
 *
 * The other PSU walkthrough answers "what is each block for". This one answers
 * "in what order do they wake up" — and the answer matters, because the whole
 * delay the motherboard sits through before PWR_OK lives in these nine steps.
 */
export const PSU_POWERUP_STAGES: ModalStage[] = [
  {
    id: 'detect',
    title: { en: 'The Comparator Sees It', tr: 'Comparator Sinyali Algılıyor' },
    badge: 'PS_ON# → LOW',
    description: {
      en: 'A small comparator circuit inside the supply watches the PS_ON# pin continuously. It runs on standby power, which is the only reason it can watch anything while the main converter is dead. When the line falls below its threshold, it produces an enable signal.',
      tr: 'Beslemenin içindeki küçük bir comparator devresi PS_ON# pinini sürekli izler. Standby güçle çalışır; ana dönüştürücü ölüyken herhangi bir şeyi izleyebilmesinin tek sebebi budur. Hat eşiğinin altına düştüğünde bir enable sinyali üretir.',
    },
    nodes: ['pson'],
    edges: ['e-pson-in'],
  },
  {
    id: 'enable',
    title: {
      en: 'The PFC and PWM Controllers Wake',
      tr: 'PFC ve PWM Kontrolcüleri Uyanıyor',
    },
    badge: { en: 'enable', tr: 'enable' },
    description: {
      en: 'Until this moment both controllers were entirely off — not idling, off. Only the standby circuit was running. The enable signal starts them, and from here the supply begins consuming real power from the wall.',
      tr: 'Bu ana kadar iki kontrolcü de tamamen kapalıydı — beklemede değil, kapalı. Yalnızca standby devresi çalışıyordu. Enable sinyali onları başlatır ve besleme buradan itibaren duvardan gerçek anlamda güç çekmeye başlar.',
    },
    nodes: ['pson', 'pfc', 'switching'],
    edges: ['e-pson-pfc', 'e-pson-sw'],
  },
  {
    id: 'soft-start',
    title: { en: 'Soft-Start', tr: 'Soft-Start — Yumuşak Başlangıç' },
    badge: { en: 'duty cycle ramp', tr: 'duty cycle rampası' },
    description: {
      en: 'The PWM controller does not begin at full duty cycle. It ramps the duty cycle up from zero over a few milliseconds. The reasoning is the same as the NTC limiter on the AC side: a sudden surge of energy would stress the MOSFETs, the transformer and the output capacitors all at once. Ramping spreads that stress out.',
      tr: 'PWM kontrolcüsü tam duty cycle ile başlamaz. Duty cycle’ı birkaç milisaniye içinde sıfırdan kademeli olarak yükseltir. Gerekçe AC tarafındaki NTC limiter ile aynıdır: ani bir enerji sıçraması MOSFET’leri, transformatörü ve çıkış kondansatörlerini aynı anda zorlardı. Rampa bu stresi yayar.',
    },
    nodes: ['switching'],
  },
  {
    id: 'bulk',
    title: {
      en: 'PFC Brings the Bulk Rail to Target',
      tr: 'PFC Bulk Rail’i Hedefe Getiriyor',
    },
    badge: { en: '~300 V → 390 V', tr: '~300 V → 390 V' },
    description: {
      en: 'The rectifier alone leaves roughly 300 V on the bulk capacitors. The PFC stage boosts that to its regulated target of 380–400 V and holds it there. The main switching stage needs a stable input before its output can mean anything.',
      tr: 'Doğrultucu tek başına bulk kondansatörlerde kabaca 300 V bırakır. PFC katmanı bunu 380–400 V’luk regüle hedefine yükseltir ve orada tutar. Ana anahtarlama katmanının çıkışının bir anlam ifade edebilmesi için önce kararlı bir giriş görmesi gerekir.',
    },
    nodes: ['rectifier', 'pfc'],
    edges: ['e-rect-pfc'],
  },
  {
    id: 'energise',
    title: {
      en: 'Switching Starts, the Transformer Energises',
      tr: 'Anahtarlama Başlıyor, Trafo Enerjileniyor',
    },
    badge: { en: 'rise time', tr: 'rise time' },
    description: {
      en: 'The MOSFETs begin switching, a high-frequency square wave appears across the transformer primary, and the secondary side rectifies and filters what comes through. The output rails start climbing from zero — over a few milliseconds to a few tens of milliseconds, not instantly.',
      tr: 'MOSFET’ler anahtarlamaya başlar, transformatörün primerinde yüksek frekanslı bir kare dalga belirir ve ikincil taraf karşıya geçeni doğrultup filtreler. Çıkış rail’leri sıfırdan tırmanmaya başlar — anında değil, birkaç milisaniye ile birkaç on milisaniye arasında.',
    },
    nodes: ['switching', 'transformer', 'secondary', 'filter'],
    edges: ['e-sw-tr', 'e-tr-sec', 'e-sec-filt'],
  },
  {
    id: 'regulate',
    title: { en: 'The Feedback Loop Takes Hold', tr: 'Geri Besleme Döngüsü Devreye Giriyor' },
    badge: { en: 'rising → held', tr: 'yükseliyor → tutuluyor' },
    description: {
      en: 'As the rails approach their targets, the feedback path through the optocoupler becomes active and the controller starts trimming duty cycle to hold them there. The rails stop merely rising and start being regulated — those are two different states, and only the second one is usable.',
      tr: 'Rail’ler hedeflerine yaklaştıkça optocoupler üzerinden geçen geri besleme yolu etkinleşir ve kontrolcü onları orada tutmak için duty cycle’ı ayarlamaya başlar. Rail’ler yalnızca yükselmeyi bırakıp regüle edilmeye geçer — bunlar iki farklı durumdur ve yalnızca ikincisi kullanılabilir.',
    },
    nodes: ['opto', 'filter', 'switching'],
    edges: ['e-fb'],
  },
  {
    id: 'compare',
    title: {
      en: 'The Supervisor Compares Every Rail',
      tr: 'Denetim Çipi Her Rail’i Karşılaştırıyor',
    },
    badge: { en: 'typically ±5%', tr: 'tipik olarak ±5%' },
    description: {
      en: 'Now the supervisory IC has something to judge. It checks each rail against its own tolerance window, usually ±5%. It is not looking for "the rails exist" — it is looking for "the rails are at the right level", which is a stricter question and the one that matters.',
      tr: 'Artık supervisory IC’nin değerlendireceği bir şey vardır. Her rail’i kendi tolerans penceresiyle, genellikle ±5% ile karşılaştırır. Aradığı şey “rail’ler var mı” değil, “rail’ler doğru seviyede mi”dir; bu daha katı bir sorudur ve önemli olan da budur.',
    },
    nodes: ['supervisor', 'filter', 'secondary'],
    edges: ['e-sup-mon1', 'e-sup-mon2'],
  },
  {
    id: 'delay',
    title: { en: 'The Deliberate Delay', tr: 'Bilinçli Gecikme' },
    badge: { en: '100–500 ms', tr: '100–500 ms' },
    description: {
      en: 'Even once every rail is inside tolerance, the supervisor waits longer — typically 100 to 500 ms per the ATX specification. This margin exists so a transient oscillation that happens to look stable for an instant cannot be mistaken for a settled rail. The delay is not sloppiness; it is the whole point.',
      tr: 'Her rail tolerans içine girdikten sonra bile denetim çipi beklemeye devam eder — ATX spesifikasyonuna göre tipik olarak 100 ila 500 ms. Bu pay, bir an için kararlı görünen geçici bir salınımın oturmuş bir rail sanılmaması için vardır. Gecikme bir özensizlik değil, işin ta kendisidir.',
    },
    nodes: ['supervisor'],
  },
  {
    id: 'assert',
    title: { en: 'PWR_OK Rises', tr: 'PWR_OK Yükseliyor' },
    badge: 'PWR_OK → HIGH',
    description: {
      en: 'The wait expires and the supervisory IC finally drives PWR_OK to the motherboard. This is the approval the board has been sitting on: it is what permits the chipset to release the CPU from reset.',
      tr: 'Bekleme süresi dolar ve supervisory IC nihayet PWR_OK’i anakarta sürer. Kartın üzerinde beklediği onay budur: chipset’in CPU’yu reset’ten çıkarmasına izin veren şeydir.',
    },
    nodes: ['supervisor', 'outputs'],
    edges: ['e-sup-out'],
    note: {
      en: 'Everything from step 1 to here happens in milliseconds — but nothing about it is instant, and the boot chain cannot move until it finishes.',
      tr: '1. adımdan buraya kadar her şey milisaniyeler içinde olur — ama hiçbiri anlık değildir ve bu bitmeden boot zinciri ilerleyemez.',
    },
  },
];
