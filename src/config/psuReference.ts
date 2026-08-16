import type { Localized } from '../i18n';

/**
 * Reference material shown alongside the PSU block diagram: a glossary of the
 * technical terms the walkthrough uses, and the connector pinouts.
 *
 * `term` is never localized — the whole point of the glossary is that these are
 * the names people actually use, in both languages. Only the question and the
 * explanation are translated.
 *
 * Links point at English Wikipedia. Swap the hrefs if you would rather send
 * readers to the Turkish articles.
 */

export interface FaqEntry {
  /** The term being explained. Never translated. */
  term: string;
  question: Localized;
  answer: Localized;
  /** Further reading. */
  href: string;
}

export const PSU_FAQ: FaqEntry[] = [
  {
    term: 'SMPS',
    question: {
      en: 'What does a switched-mode power supply actually do differently?',
      tr: 'Switched-mode power supply tam olarak neyi farklı yapar?',
    },
    answer: {
      en: 'An old linear supply drops unwanted voltage as heat across a regulator, which wastes most of the energy. A switched-mode supply instead chops the input into high-frequency pulses, passes them through a small transformer, and rebuilds the DC on the other side. Because the switches are either fully on or fully off, they dissipate very little, which is how a modern unit reaches 90% efficiency in a box you can lift with one hand.',
      tr: 'Eski linear besleme, istenmeyen gerilimi bir regülatör üzerinde ısıya çevirerek düşürür ve enerjinin çoğunu harcar. Switched-mode besleme ise girişi yüksek frekanslı darbelere böler, küçük bir transformatörden geçirir ve öbür tarafta DC’yi yeniden kurar. Anahtarlar ya tam açık ya tam kapalı olduğu için üzerlerinde çok az kayıp olur; modern bir cihazın tek elle kaldırabileceğin bir kutuda %90 verime ulaşması bu sayededir.',
    },
    href: 'https://en.wikipedia.org/wiki/Switched-mode_power_supply',
  },
  {
    term: 'EMI filter',
    question: {
      en: 'Why does the supply need a filter before anything else?',
      tr: 'Besleme neden her şeyden önce bir filtreye ihtiyaç duyar?',
    },
    answer: {
      en: 'Switching hundreds of watts on and off 100,000 times a second generates a lot of electrical noise. Without a filter that noise would travel back down the mains cable and interfere with everything else on the circuit — and regulators would not certify the unit. The filter is a network of chokes and capacitors that presents a high impedance to that noise while passing 50 Hz mains freely.',
      tr: 'Yüzlerce watt’ı saniyede 100.000 kez açıp kapatmak ciddi miktarda elektriksel gürültü üretir. Filtre olmasa bu gürültü şebeke kablosundan geri giderek aynı hattaki her şeyi etkilerdi — ayrıca cihaz sertifikasyondan geçemezdi. Filtre, bu gürültüye yüksek empedans gösterirken 50 Hz şebekeyi serbestçe geçiren bir choke ve kondansatör ağıdır.',
    },
    href: 'https://en.wikipedia.org/wiki/Electromagnetic_interference',
  },
  {
    term: 'Common-mode choke',
    question: {
      en: 'What is a common-mode choke and why two windings?',
      tr: 'Common-mode choke nedir ve neden iki sargı?',
    },
    answer: {
      en: 'Both mains conductors are wound around the same core in the same direction. Normal load current flows out on one and back on the other, so the magnetic fields cancel and the choke barely affects it. Noise that appears on both conductors at once (common mode) does not cancel, so it sees a large inductance and is blocked. One component that ignores the signal you want and stops the one you do not.',
      tr: 'Her iki şebeke iletkeni de aynı çekirdeğe aynı yönde sarılır. Normal yük akımı birinden gidip diğerinden döndüğü için manyetik alanlar birbirini götürür ve choke bu akımı neredeyse hiç etkilemez. Her iki iletkende aynı anda beliren gürültü (common mode) ise birbirini götürmez, büyük bir endüktansla karşılaşır ve engellenir. İstediğin sinyali görmezden gelip istemediğini durduran tek bir bileşen.',
    },
    href: 'https://en.wikipedia.org/wiki/Choke_(electronics)',
  },
  {
    term: 'NTC inrush limiter',
    question: {
      en: 'Why does a supply need an inrush current limiter?',
      tr: 'Bir besleme neden inrush current limiter’a ihtiyaç duyar?',
    },
    answer: {
      en: 'At the instant you plug it in, the bulk capacitors are empty and behave almost like a short circuit — the surge can be tens of amps and would weld relay contacts or trip a breaker. An NTC thermistor starts out with high resistance when cold, limiting that first surge, then heats up within a second or two and drops to near zero so it stops wasting power.',
      tr: 'Fişi taktığın anda bulk kondansatörler boştur ve neredeyse kısa devre gibi davranır — darbe onlarca amper olabilir, röle kontaklarını kaynatabilir ya da sigortayı attırabilir. NTC termistör soğukken yüksek dirençle başlayıp bu ilk darbeyi sınırlar, sonra bir iki saniye içinde ısınıp direnci sıfıra yakın düşer ve boşuna güç harcamayı bırakır.',
    },
    href: 'https://en.wikipedia.org/wiki/Inrush_current_limiter',
  },
  {
    term: 'Bridge rectifier',
    question: {
      en: 'How do four diodes turn AC into DC?',
      tr: 'Dört diyot AC’yi nasıl DC’ye çevirir?',
    },
    answer: {
      en: 'The four diodes are arranged so that whichever way the AC swings, current is routed out of the same terminal. The negative half of the sine wave is effectively folded up to become positive. The result is not smooth DC yet — it is a series of humps at twice the mains frequency, which is what the bulk capacitors are there to fill in.',
      tr: 'Dört diyot öyle dizilir ki AC hangi yöne salınırsa salınsın akım hep aynı uçtan çıkar. Sinüs dalgasının negatif yarısı yukarı katlanarak pozitife dönüşür. Sonuç henüz düzgün DC değildir — şebeke frekansının iki katında bir dizi tümsektir ve bulk kondansatörlerin görevi bu boşlukları doldurmaktır.',
    },
    href: 'https://en.wikipedia.org/wiki/Diode_bridge',
  },
  {
    term: 'Bulk capacitor',
    question: {
      en: 'Why are the big capacitors so large, and why 400 V?',
      tr: 'Büyük kondansatörler neden bu kadar iri ve neden 400 V?',
    },
    answer: {
      en: 'They have to hold enough energy to carry the whole system through the gaps between mains peaks, and to ride out a brief power dip — the hold-up time an ATX unit must guarantee. Because they sit after the rectifier and PFC stage, they store the full rectified line voltage, which is why they are rated for 400 V or more rather than the 12 V you see at the other end.',
      tr: 'Sistemi şebeke tepeleri arasındaki boşluklarda taşıyacak ve kısa bir elektrik kesintisini atlatacak kadar enerji tutmaları gerekir — ATX cihazının garanti etmesi gereken hold-up süresi budur. Doğrultucu ve PFC katmanından sonra bulundukları için doğrultulmuş hat geriliminin tamamını depolarlar; öbür uçta gördüğün 12 V yerine 400 V veya üzeri derecelendirilmelerinin sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Electrolytic_capacitor',
  },
  {
    term: 'Power factor',
    question: {
      en: 'What is power factor and why correct it?',
      tr: 'Power factor nedir ve neden düzeltilir?',
    },
    answer: {
      en: 'A rectifier with a capacitor behind it only draws current in short spikes at the top of each mains cycle, rather than smoothly across the whole waveform. That means it pulls far more peak current than its actual power consumption justifies, stressing the wiring and the grid. Active PFC reshapes the current draw to follow the voltage waveform, so the supply behaves like a well-mannered resistive load.',
      tr: 'Arkasında kondansatör olan bir doğrultucu, akımı dalga şeklinin tamamına yayarak değil, her şebeke çevriminin tepesinde kısa darbeler hâlinde çeker. Bu da gerçek güç tüketiminin gerektirdiğinden çok daha yüksek tepe akımı çekmesi, kabloları ve şebekeyi zorlaması demektir. Active PFC, akım çekişini gerilim dalga şeklini takip edecek biçimde yeniden şekillendirir ve besleme uslu bir resistif yük gibi davranır.',
    },
    href: 'https://en.wikipedia.org/wiki/Power_factor',
  },
  {
    term: 'Boost converter',
    question: {
      en: 'How does active PFC also give universal input?',
      tr: 'Active PFC universal input’u nasıl sağlıyor?',
    },
    answer: {
      en: 'The PFC stage is a boost converter: it steps voltage up to a fixed target, around 390 V, regardless of what came in. Feed it 110 V and it boosts harder; feed it 230 V and it boosts less. Everything downstream sees the same rail either way, which is why modern supplies have no 110/230 selector switch to get wrong.',
      tr: 'PFC katmanı bir boost converter’dır: girişte ne olursa olsun gerilimi sabit bir hedefe, yaklaşık 390 V’a yükseltir. 110 V verirsen daha çok yükseltir, 230 V verirsen daha az. Sonraki her kademe iki durumda da aynı rail’i görür; modern beslemelerde yanlış konuma getirebileceğin bir 110/230 seçici anahtarın olmamasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Boost_converter',
  },
  {
    term: 'MOSFET',
    question: {
      en: 'Why MOSFETs rather than ordinary transistors?',
      tr: 'Neden sıradan transistör yerine MOSFET?',
    },
    answer: {
      en: 'MOSFETs are voltage-controlled and switch extremely fast, which matters when you are doing it 100,000 times a second — every transition is a moment where both voltage and current are non-zero, and therefore where heat is made. They also have very low resistance when fully on, so conduction losses stay small. Fast and low-loss is exactly what a switching supply needs.',
      tr: 'MOSFET’ler gerilim kontrollüdür ve son derece hızlı anahtarlar; bunu saniyede 100.000 kez yapıyorsan bu çok önemlidir — her geçiş, hem gerilimin hem akımın sıfır olmadığı, dolayısıyla ısının üretildiği bir andır. Ayrıca tam iletimdeyken dirençleri çok düşüktür, yani iletim kayıpları küçük kalır. Hızlı ve düşük kayıplı olmak, bir switching beslemenin tam da ihtiyaç duyduğu şeydir.',
    },
    href: 'https://en.wikipedia.org/wiki/MOSFET',
  },
  {
    term: 'Ferrite core',
    question: {
      en: 'Why is the transformer core ferrite instead of iron?',
      tr: 'Transformatör çekirdeği neden demir değil ferrit?',
    },
    answer: {
      en: 'Laminated iron works well at 50 Hz but becomes extremely lossy at 100 kHz, heating up rather than transferring power. Ferrite is a ceramic that keeps its magnetic properties at high frequency while barely conducting electricity, which suppresses the eddy currents that would otherwise waste the energy.',
      tr: 'Lamine demir 50 Hz’de iyi çalışır ama 100 kHz’de aşırı kayıplı hâle gelir; gücü aktarmak yerine ısınır. Ferrit ise yüksek frekansta manyetik özelliklerini koruyan, buna karşılık elektriği neredeyse hiç iletmeyen bir seramiktir; bu da enerjiyi boşa harcayacak eddy akımlarını bastırır.',
    },
    href: 'https://en.wikipedia.org/wiki/Ferrite_core',
  },
  {
    term: 'Galvanic isolation',
    question: {
      en: 'What exactly is isolated, and why does it matter?',
      tr: 'Tam olarak ne yalıtılıyor ve bu neden önemli?',
    },
    answer: {
      en: 'There is no conductive path between the mains side and the output side — energy crosses only as a magnetic field through the transformer core. That is what lets you touch the case, the connectors and the motherboard safely. It is also why a fault on the primary side does not put mains voltage on your hardware.',
      tr: 'Şebeke tarafı ile çıkış tarafı arasında iletken bir yol yoktur — enerji yalnızca transformatör çekirdeği üzerinden manyetik alan olarak geçer. Kasaya, konektörlere ve anakarta güvenle dokunabilmeni sağlayan şey budur. Birincil taraftaki bir arızanın donanımına şebeke gerilimi bindirmemesinin sebebi de aynıdır.',
    },
    href: 'https://en.wikipedia.org/wiki/Galvanic_isolation',
  },
  {
    term: 'Schottky diode',
    question: {
      en: 'Why Schottky diodes on the output side?',
      tr: 'Çıkış tarafında neden Schottky diyot?',
    },
    answer: {
      en: 'Every diode drops some voltage while conducting, and that drop times the current is heat. A standard silicon diode loses about 0.7 V; a Schottky loses roughly half that. On a 12 V rail carrying 20 A, that difference is tens of watts. Schottkys also recover from conduction faster, which matters at switching frequencies.',
      tr: 'Her diyot iletimdeyken bir miktar gerilim düşürür ve bu düşüm ile akımın çarpımı ısıdır. Standart bir silisyum diyot yaklaşık 0,7 V kaybeder; Schottky bunun kabaca yarısını. 20 A taşıyan bir 12 V rail’de bu fark onlarca watt eder. Schottky’ler ayrıca iletimden daha hızlı toparlanır, ki switching frekanslarında bu önemlidir.',
    },
    href: 'https://en.wikipedia.org/wiki/Schottky_diode',
  },
  {
    term: 'Synchronous rectification',
    question: {
      en: 'How can a MOSFET replace a rectifier diode?',
      tr: 'Bir MOSFET doğrultucu diyotun yerini nasıl alabilir?',
    },
    answer: {
      en: 'A MOSFET turned fully on is just a very low resistance, so the voltage across it can be far below even a Schottky drop. The controller switches it on precisely when the diode would have conducted. It costs complexity and demands accurate timing, but it is where a large part of the efficiency in a high-rated unit comes from.',
      tr: 'Tam iletime sokulmuş bir MOSFET yalnızca çok düşük bir dirençtir; üzerindeki gerilim bir Schottky düşümünün bile epey altında olabilir. Kontrolcü, diyotun ileteceği anda tam olarak onu iletime sokar. Karmaşıklık getirir ve hassas zamanlama ister, ama yüksek dereceli bir cihazdaki verimin büyük kısmı buradan gelir.',
    },
    href: 'https://en.wikipedia.org/wiki/Rectifier',
  },
  {
    term: 'Buck converter (DC-DC)',
    question: {
      en: 'Why derive +5V and +3.3V instead of winding them separately?',
      tr: '+5V ve +3.3V neden ayrı sarılmak yerine türetiliyor?',
    },
    answer: {
      en: 'Older units wound all three rails on the same transformer and regulated them as a group, so a heavy load on +12V would pull +5V out of spec. A DC-DC design takes only +12V off the transformer and steps it down locally with buck converters, giving each rail its own tight regulation. It is the reason modern supplies hold voltage so much better under uneven loads.',
      tr: 'Eski cihazlar üç rail’i de aynı transformatöre sarıp grup hâlinde regüle ederdi; bu yüzden +12V’taki ağır bir yük +5V’u spesifikasyon dışına itebiliyordu. DC-DC tasarımı transformatörden yalnızca +12V alır ve yerinde buck converter’larla düşürür, böylece her rail kendi sıkı regülasyonuna kavuşur. Modern beslemelerin dengesiz yükler altında gerilimi çok daha iyi korumasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Buck_converter',
  },
  {
    term: 'Flyback converter',
    question: {
      en: 'Why is the standby supply a flyback?',
      tr: 'Standby beslemesi neden flyback?',
    },
    answer: {
      en: 'A flyback stores energy in the transformer during the on-time and releases it during the off-time, so it needs very few parts — one switch, one transformer, one diode. That makes it cheap and efficient at the handful of watts +5VSB requires, and it provides isolation at the same time. Using the big main converter for standby would be wasteful and noisy.',
      tr: 'Flyback, iletim süresince enerjiyi transformatörde depolar ve kesim süresinde serbest bırakır; bu yüzden çok az parçaya ihtiyaç duyar — bir anahtar, bir transformatör, bir diyot. Bu da +5VSB’nin gerektirdiği birkaç watt için ucuz ve verimli olmasını sağlar, üstelik aynı anda izolasyon da sunar. Standby için büyük ana dönüştürücüyü kullanmak hem israf hem gürültü olurdu.',
    },
    href: 'https://en.wikipedia.org/wiki/Flyback_converter',
  },
  {
    term: 'Optocoupler',
    question: {
      en: 'Why send feedback over light?',
      tr: 'Geri besleme neden ışık üzerinden gönderiliyor?',
    },
    answer: {
      en: 'The regulator on the primary side needs to know the output voltage, but wiring the two sides together would destroy the isolation that makes the unit safe. An optocoupler puts an LED and a phototransistor in one package with an insulating gap between them, so the information crosses as light while the electrical barrier stays intact.',
      tr: 'Birincil taraftaki regülatörün çıkış gerilimini bilmesi gerekir, ama iki tarafı kabloyla birleştirmek cihazı güvenli kılan izolasyonu yok ederdi. Optocoupler, aralarında yalıtkan bir boşluk bulunan bir LED ile bir fototransistörü tek bir pakete koyar; böylece bilgi ışık olarak karşıya geçerken elektriksel bariyer bozulmadan kalır.',
    },
    href: 'https://en.wikipedia.org/wiki/Opto-isolator',
  },
  {
    term: 'PWM',
    question: {
      en: 'How does the controller actually change the output voltage?',
      tr: 'Kontrolcü çıkış gerilimini aslında nasıl değiştiriyor?',
    },
    answer: {
      en: 'It varies the duty cycle — the fraction of each switching period the MOSFET is on. Longer on-time transfers more energy per cycle and the output rises; shorter and it falls. The controller adjusts this thousands of times a second based on the feedback signal, which is why the rails barely move when the CPU suddenly demands more current.',
      tr: 'Duty cycle’ı değiştirir — yani her switching periyodunun MOSFET’in iletimde olduğu kısmını. Daha uzun iletim süresi çevrim başına daha çok enerji aktarır ve çıkış yükselir; daha kısası düşürür. Kontrolcü bunu geri besleme sinyaline göre saniyede binlerce kez ayarlar; CPU ansızın daha çok akım istediğinde rail’lerin neredeyse hiç oynamamasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Pulse-width_modulation',
  },
  {
    term: 'Ripple',
    question: {
      en: 'What is ripple and how much is acceptable?',
      tr: 'Ripple nedir ve ne kadarı kabul edilebilir?',
    },
    answer: {
      en: 'Ripple is the small AC residue left riding on a DC rail after filtering, mostly at the switching frequency. The ATX specification allows up to 120 mV peak-to-peak on +12V and 50 mV on +5V and +3.3V. Excessive ripple shows up as instability rather than an obvious failure, which makes it one of the more insidious ways a cheap supply causes trouble.',
      tr: 'Ripple, filtrelemeden sonra bir DC rail’in üzerinde kalan küçük AC artığıdır ve çoğunlukla switching frekansındadır. ATX spesifikasyonu +12V için 120 mV, +5V ve +3.3V için 50 mV tepeden tepeye değere izin verir. Aşırı ripple açık bir arıza olarak değil kararsızlık olarak kendini gösterir; ucuz bir beslemenin sorun çıkarmasının en sinsi yollarından biri olmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Ripple_(electrical)',
  },
  {
    term: 'OVP / OCP / OTP / SCP',
    question: {
      en: 'What is the supervisory IC watching for?',
      tr: 'Supervisory IC neyi gözlüyor?',
    },
    answer: {
      en: 'Overvoltage (a regulation failure about to destroy every component downstream), undervoltage, overcurrent per rail, overtemperature, and a short circuit. Any of them latches the supply off. This is the difference between a supply that dies alone and one that takes the motherboard with it.',
      tr: 'Aşırı gerilim (sonrasındaki her bileşeni yok etmek üzere olan bir regülasyon arızası), düşük gerilim, rail başına aşırı akım, aşırı sıcaklık ve kısa devre. Bunlardan herhangi biri beslemeyi kilitleyip kapatır. Tek başına ölen bir besleme ile anakartı da yanında götüren bir besleme arasındaki fark budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Switched-mode_power_supply',
  },
  {
    term: 'PWR_OK / Power Good',
    question: {
      en: 'Why does the board wait for a separate signal?',
      tr: 'Kart neden ayrı bir sinyali bekliyor?',
    },
    answer: {
      en: 'Rails take a few hundred milliseconds to rise and settle. A CPU clocked while its supply is still ramping would execute garbage. PWR_OK is the supply telling the chipset that every rail is now within tolerance, and it is what permits the chipset to release the CPU from reset. Too short a delay is a classic cause of unreliable cold boots.',
      tr: 'Rail’lerin yükselip oturması birkaç yüz milisaniye sürer. Beslemesi hâlâ rampadayken saatlenen bir CPU çöp komut işletirdi. PWR_OK, beslemenin chipset’e “artık tüm rail’ler tolerans içinde” demesidir ve chipset’in CPU’yu reset’ten çıkarmasına izin veren şeydir. Bu gecikmenin fazla kısa olması, güvenilmez soğuk açılışların klasik sebeplerindendir.',
    },
    href: 'https://en.wikipedia.org/wiki/ATX',
  },
  {
    term: 'PS_ON#',
    question: {
      en: 'Why is the power-on signal active low?',
      tr: 'Açma sinyali neden active low?',
    },
    answer: {
      en: 'The trailing # means asserted when pulled to ground. That choice is a safety default: if the wire falls off or the board loses power, the line floats high through a pull-up and the supply stays off. Shorting pin 16 to any ground pin is also why the paperclip test switches a supply on with no motherboard attached.',
      tr: 'Sondaki # işareti, sinyalin toprağa çekildiğinde aktif olduğunu belirtir. Bu bir güvenlik varsayılanıdır: kablo çıkarsa ya da kart gücünü kaybederse hat bir pull-up üzerinden yükseğe gider ve besleme kapalı kalır. 16. pini herhangi bir toprak pinine kısa devre etmek, ataç testinin anakart takılı değilken beslemeyi çalıştırmasının da sebebidir.',
    },
    href: 'https://en.wikipedia.org/wiki/ATX',
  },
  {
    term: '+5VSB',
    question: {
      en: 'What still runs while the machine is "off"?',
      tr: 'Makine “kapalı”yken neler çalışmaya devam ediyor?',
    },
    answer: {
      en: 'The standby rail feeds the embedded controller that watches the power button, the network chip when Wake-on-LAN is enabled, USB charging ports on many boards, and the logic that remembers power state. This is ACPI state S5 — soft off, not disconnected. Only unplugging the unit or flipping its rear switch truly kills it.',
      tr: 'Standby rail’i, power button’ı izleyen embedded controller’ı, Wake-on-LAN açıkken ağ yongasını, birçok kartta USB şarj portlarını ve güç durumunu hatırlayan mantığı besler. Bu ACPI’nin S5 durumudur — kapalı değil, “soft off”. Cihazı gerçekten susturan tek şey fişi çekmek ya da arkasındaki anahtarı kapatmaktır.',
    },
    href: 'https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface',
  },
  {
    term: '80 PLUS',
    question: {
      en: 'What does an 80 PLUS rating actually certify?',
      tr: '80 PLUS sertifikası aslında neyi garanti ediyor?',
    },
    answer: {
      en: 'That the unit is at least 80% efficient at 20%, 50% and 100% of its rated load, with the higher tiers (Bronze through Titanium) demanding more. It says nothing directly about ripple, protection quality or hold-up time — a certified supply can still be a poor one, which is why load-testing reviews remain worth reading.',
      tr: 'Cihazın, nominal yükünün %20, %50 ve %100’ünde en az %80 verimli olduğunu; üst kademelerin (Bronze’dan Titanium’a) daha fazlasını istediğini. Ripple, koruma kalitesi ya da hold-up süresi hakkında doğrudan hiçbir şey söylemez — sertifikalı bir besleme yine de kötü olabilir; yük testi yapan incelemeleri okumaya devam etmenin sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/80_Plus',
  },
  {
    term: 'Hold-up time',
    question: {
      en: 'Why does a brief power flicker not reboot the machine?',
      tr: 'Kısa bir elektrik dalgalanması makineyi neden yeniden başlatmıyor?',
    },
    answer: {
      en: 'The bulk capacitors keep the rails alive for a moment after mains disappears. The ATX specification requires at least 17 ms of hold-up at full load — slightly longer than one cycle of 50 Hz mains, so a dropped cycle passes unnoticed. It is also what gives a UPS time to switch over. Hold-up is one of the first things cheap units sacrifice, because it is measured in capacitance and capacitance costs money.',
      tr: 'Şebeke kesildikten sonra bulk kondansatörler rail’leri bir süre daha ayakta tutar. ATX spesifikasyonu tam yükte en az 17 ms hold-up ister — 50 Hz şebekenin bir çevriminden biraz uzun, yani kaçan bir çevrim fark edilmeden geçer. Bir UPS’in devreye girmesine zaman tanıyan da budur. Hold-up, ucuz cihazların ilk feda ettiği şeylerdendir; çünkü kapasitansla ölçülür ve kapasitans para demektir.',
    },
    href: 'https://en.wikipedia.org/wiki/Power_supply_unit_(computer)',
  },
  {
    term: 'Y-capacitor',
    question: {
      en: 'If the barrier isolates everything, why does the case tingle?',
      tr: 'Bariyer her şeyi yalıtıyorsa kasa neden karıncalanıyor?',
    },
    answer: {
      en: 'Because the isolation is not quite absolute on purpose. A pair of small Y-capacitors deliberately bridges the barrier to give switching noise a short path home instead of letting it radiate. They pass a tiny mains-frequency leakage current — legally capped, typically well under a milliamp — into the chassis. With the earth pin connected that current goes straight to ground and you feel nothing. On an ungrounded outlet it has nowhere to go, so the chassis floats at around half mains voltage and your fingertips find it. The tingle is a wiring fault, not a broken supply.',
      tr: 'Çünkü izolasyon bilerek tam mutlak değildir. Bir çift küçük Y-kondansatör, switching gürültüsüne yayılmak yerine eve dönecek kısa bir yol vermek için bariyeri kasten köprüler. Bunlar şebeke frekansında çok küçük bir kaçak akımı — yasal olarak sınırlı, tipik olarak bir miliamperin epey altında — kasaya geçirir. Toprak pini bağlıysa bu akım doğrudan toprağa gider ve hiçbir şey hissetmezsin. Topraksız bir prizde ise gidecek yeri olmaz, kasa şebeke geriliminin yaklaşık yarısında salınır ve parmak uçların bunu bulur. O karıncalanma bir tesisat arızasıdır, bozuk bir besleme değil.',
    },
    href: 'https://en.wikipedia.org/wiki/Ground_(electricity)',
  },
  {
    term: 'Protective earth (PE)',
    question: {
      en: 'What does the third mains wire actually do here?',
      tr: 'Üçüncü şebeke kablosu burada aslında ne yapıyor?',
    },
    answer: {
      en: 'It bonds the PSU housing — and through the mounting screws, the case and the motherboard tray — to earth. It carries no current in normal operation. Its two jobs are to drain the Y-capacitor leakage described above, and to give a fault current somewhere to go: if mains ever touched the chassis, the earth path would carry enough current to blow the fuse instead of leaving the case live. It is also the reference that makes shielding and EMI filtering work at all.',
      tr: 'PSU gövdesini — ve montaj vidaları üzerinden kasayı ve anakart tepsisini — toprağa bağlar. Normal çalışmada üzerinden akım geçmez. İki görevi vardır: yukarıda anlatılan Y-kondansatör kaçağını boşaltmak ve bir arıza akımına gidecek yer vermek. Şebeke bir şekilde kasaya değerse, toprak yolu sigortayı attıracak kadar akım taşır ve kasa gerilim altında kalmaz. Ayrıca ekranlamanın ve EMI filtrelemesinin çalışmasını sağlayan referans da odur.',
    },
    href: 'https://en.wikipedia.org/wiki/Ground_(electricity)',
  },
  {
    term: 'Fan control',
    question: {
      en: 'Why does the fan sometimes not spin at all?',
      tr: 'Fan neden bazen hiç dönmüyor?',
    },
    answer: {
      en: 'Most modern units run a hybrid or zero-RPM mode: below roughly 30–40% load the losses are small enough to shed passively, so the controller keeps the fan stopped and the unit is silent. Above that it follows a curve driven by internal temperature, not by load directly. The fan is also the only moving part in the box, which is why it is usually what fails first — and why a supply that has started whining is telling you something before the electronics do.',
      tr: 'Çoğu modern cihaz hybrid ya da zero-RPM modunda çalışır: kabaca %30–40 yükün altında kayıplar pasif olarak atılabilecek kadar küçüktür, bu yüzden kontrolcü fanı durdurur ve cihaz sessizdir. Bunun üstünde ise doğrudan yüke değil iç sıcaklığa bağlı bir eğriyi takip eder. Fan aynı zamanda kutudaki tek hareketli parçadır; genelde ilk bozulan şeyin o olmasının sebebi budur — ve inlemeye başlamış bir besleme, elektronik aksam bir şey söylemeden önce sana bir şey söylüyordur.',
    },
    href: 'https://en.wikipedia.org/wiki/Computer_fan',
  },
  {
    term: 'Single-rail vs multi-rail',
    question: {
      en: 'Is one big +12V rail better than several?',
      tr: 'Tek büyük bir +12V rail mi yoksa birkaç tane mi daha iyi?',
    },
    answer: {
      en: 'They are the same silicon producing the same +12V; the difference is only how OCP is applied. Multi-rail splits the output into groups with a separate current limit each, so a fault on one connector trips sooner and less energy reaches it. Single-rail applies one high limit to everything, which never blocks a legitimate load but reacts later to a fault. Multi-rail is arguably safer, single-rail is simpler to cable without accidentally overloading a group. Neither is a quality marker.',
      tr: 'İkisi de aynı +12V’u üreten aynı silikondur; fark yalnızca OCP’nin nasıl uygulandığındadır. Multi-rail çıkışı her birinin ayrı akım limiti olan gruplara böler; böylece bir konektördeki arıza daha erken tetiklenir ve oraya daha az enerji ulaşır. Single-rail ise her şeye tek bir yüksek limit uygular; meşru bir yükü asla engellemez ama arızaya daha geç tepki verir. Multi-rail tartışmalı biçimde daha güvenli, single-rail ise bir grubu yanlışlıkla aşırı yüklemeden kablolaması daha kolaydır. İkisi de kalite göstergesi değildir.',
    },
    href: 'https://en.wikipedia.org/wiki/Power_supply_unit_(computer)',
  },
  {
    term: 'Active PFC + UPS',
    question: {
      en: 'Why can a PSU refuse to run on a cheap UPS?',
      tr: 'Bir PSU ucuz bir UPS’te neden çalışmayı reddedebilir?',
    },
    answer: {
      en: 'Line-interactive UPS units often output a stepped or "simulated sine" waveform on battery. An active PFC stage is a feedback loop expecting a smooth sinusoid; those abrupt steps can make it oscillate, draw enormous current spikes, or trip its own protection — the system shuts down at exactly the moment the UPS was supposed to save it. Pairing an active PFC supply with a pure sine wave UPS avoids the whole class of problem.',
      tr: 'Line-interactive UPS’ler batarya modunda çoğu zaman basamaklı, yani “simüle sinüs” bir dalga üretir. Active PFC katmanı ise düzgün bir sinüs bekleyen bir geri besleme döngüsüdür; bu ani basamaklar onu salınıma sokabilir, devasa akım darbeleri çektirebilir ya da kendi korumasını tetikleyebilir — sistem tam da UPS’in onu kurtarması gereken anda kapanır. Active PFC’li bir beslemeyi tam sinüs (pure sine wave) bir UPS ile eşlemek bu sorun sınıfının tamamını ortadan kaldırır.',
    },
    href: 'https://en.wikipedia.org/wiki/Uninterruptible_power_supply',
  },
  {
    term: 'Capacitor aging',
    question: {
      en: 'Why do power supplies get worse with age?',
      tr: 'Beslemeler yaşlandıkça neden kötüleşir?',
    },
    answer: {
      en: 'Electrolytic capacitors dry out. Their electrolyte slowly escapes through the seal, capacitance falls and internal resistance rises, so filtering degrades and ripple climbs. The rate roughly doubles for every 10 °C, which is why the capacitors nearest the hot components go first. The symptoms are maddening precisely because they are gradual: random reboots, instability under load, a machine that misbehaves only when warm.',
      tr: 'Elektrolitik kondansatörler kurur. Elektrolitleri yalıtım contasından yavaşça kaçar, kapasitans düşer ve iç direnç yükselir; böylece filtreleme bozulur ve ripple tırmanır. Bu hız her 10 °C için kabaca ikiye katlanır; sıcak bileşenlere en yakın kondansatörlerin önce gitmesinin sebebi budur. Belirtiler tam da kademeli oldukları için çıldırtıcıdır: rastgele yeniden başlatmalar, yük altında kararsızlık, yalnızca ısındığında huysuzlaşan bir makine.',
    },
    href: 'https://en.wikipedia.org/wiki/Capacitor_plague',
  },
  {
    term: '12VHPWR / 12V-2x6',
    question: {
      en: 'What changed with the ATX 3.x graphics connector?',
      tr: 'ATX 3.x ekran kartı konektörüyle ne değişti?',
    },
    answer: {
      en: 'One connector now carries up to 600 W, where a PCIe 8-pin manages 150 W. Four sideband pins go with it: SENSE0 and SENSE1 encode how much the supply is actually willing to give (150/300/450/600 W), so the card limits itself rather than assuming. ATX 3.x also demands the supply survive transient excursions far above its rating — modern GPUs spike to twice their nominal draw for microseconds, and units that merely met the old average-power spec were tripping OCP on them. The 12V-2x6 revision shortens those sideband pins so a partly seated plug fails safe instead of arcing.',
      tr: 'PCIe 8-pin 150 W taşırken artık tek konektör 600 W’a kadar taşıyor. Yanında dört sideband pini geliyor: SENSE0 ve SENSE1, beslemenin gerçekte ne kadarını vermeye razı olduğunu kodluyor (150/300/450/600 W); böylece kart varsayımda bulunmak yerine kendini sınırlıyor. ATX 3.x ayrıca beslemenin nominal değerinin çok üstündeki anlık sıçramalara dayanmasını şart koşuyor — modern GPU’lar mikrosaniyeler boyunca nominal çekişlerinin iki katına çıkıyor ve yalnızca eski ortalama güç şartını karşılayan cihazlar bunlarda OCP’ye takılıyordu. 12V-2x6 revizyonu ise bu sideband pinlerini kısaltıyor; böylece tam oturmamış bir fiş ark yapmak yerine güvenli tarafta arızalanıyor.',
    },
    href: 'https://en.wikipedia.org/wiki/PCI_Express',
  },
];

// --- Connector pinouts ---

export type RailKey =
  | '+3.3V'
  | '+5V'
  | '+12V'
  | '-12V'
  | '+5VSB'
  | 'COM'
  | 'PWR_OK'
  | 'PS_ON#'
  | 'NC'
  | 'SENSE';

export interface RailStyle {
  /** Conventional wire color for this rail. */
  wire: Localized;
  /** Swatch color used in the UI; black wires need lifting to stay visible. */
  swatch: string;
  /** Rail name — technical, never translated. */
  label: string;
}

export const RAIL_STYLES: Record<RailKey, RailStyle> = {
  '+3.3V': { wire: { en: 'orange', tr: 'turuncu' }, swatch: '#ff9f45', label: '+3.3 V' },
  '+5V': { wire: { en: 'red', tr: 'kırmızı' }, swatch: '#ff5c5c', label: '+5 V' },
  '+12V': { wire: { en: 'yellow', tr: 'sarı' }, swatch: '#ffd166', label: '+12 V' },
  '-12V': { wire: { en: 'blue', tr: 'mavi' }, swatch: '#63b3ff', label: '-12 V' },
  '+5VSB': { wire: { en: 'purple', tr: 'mor' }, swatch: '#a77bff', label: '+5 VSB' },
  COM: { wire: { en: 'black', tr: 'siyah' }, swatch: '#5b6677', label: 'COM' },
  PWR_OK: { wire: { en: 'gray', tr: 'gri' }, swatch: '#cbd5e0', label: 'PWR_OK' },
  'PS_ON#': { wire: { en: 'green', tr: 'yeşil' }, swatch: '#3ddc84', label: 'PS_ON#' },
  NC: { wire: { en: 'none', tr: 'yok' }, swatch: '#2d3748', label: 'N/C' },
  SENSE: { wire: { en: 'brown', tr: 'kahverengi' }, swatch: '#b08968', label: 'Sense' },
};

export interface Pin {
  number: number;
  rail: RailKey;
  /**
   * Overrides the rail label on the cell. Used by sideband pins that share a
   * rail style but carry distinct signal names.
   */
  label?: string;
  /** Set for the pins the boot walkthrough actually talks about. */
  note?: Localized;
}

export interface Connector {
  id: string;
  /** Connector name — technical, never translated. */
  name: string;
  subtitle: Localized;
  /** Pins are laid out in rows of this length. */
  columns: number;
  pins: Pin[];
}

export const CONNECTORS: Connector[] = [
  {
    id: 'atx24',
    name: 'ATX 24-pin',
    subtitle: { en: 'Main motherboard connector', tr: 'Ana anakart konektörü' },
    columns: 12,
    pins: [
      { number: 1, rail: '+3.3V' },
      { number: 2, rail: '+3.3V' },
      { number: 3, rail: 'COM' },
      { number: 4, rail: '+5V' },
      { number: 5, rail: 'COM' },
      { number: 6, rail: '+5V' },
      { number: 7, rail: 'COM' },
      {
        number: 8,
        rail: 'PWR_OK',
        note: {
          en: 'Power Good — released once every rail is stable',
          tr: 'Power Good — tüm rail’ler kararlı olunca yükseltilir',
        },
      },
      {
        number: 9,
        rail: '+5VSB',
        note: {
          en: 'Standby rail — live whenever the unit is plugged in',
          tr: 'Standby rail — cihaz fişte olduğu sürece canlı',
        },
      },
      { number: 10, rail: '+12V' },
      { number: 11, rail: '+12V' },
      { number: 12, rail: '+3.3V' },
      { number: 13, rail: '+3.3V' },
      { number: 14, rail: '-12V' },
      { number: 15, rail: 'COM' },
      {
        number: 16,
        rail: 'PS_ON#',
        note: {
          en: 'Pulled low by the EC to switch the main converter on',
          tr: 'Ana dönüştürücüyü açmak için EC tarafından LOW’a çekilir',
        },
      },
      { number: 17, rail: 'COM' },
      { number: 18, rail: 'COM' },
      { number: 19, rail: 'COM' },
      {
        number: 20,
        rail: 'NC',
        note: { en: 'Was -5V before ATX 2.01', tr: 'ATX 2.01 öncesinde -5V idi' },
      },
      { number: 21, rail: '+5V' },
      { number: 22, rail: '+5V' },
      { number: 23, rail: '+5V' },
      { number: 24, rail: 'COM' },
    ],
  },
  {
    id: 'eps',
    name: 'EPS 12V 8-pin',
    subtitle: { en: 'CPU power', tr: 'CPU beslemesi' },
    columns: 4,
    pins: [
      { number: 1, rail: 'COM' },
      { number: 2, rail: 'COM' },
      { number: 3, rail: 'COM' },
      { number: 4, rail: 'COM' },
      { number: 5, rail: '+12V' },
      { number: 6, rail: '+12V' },
      { number: 7, rail: '+12V' },
      { number: 8, rail: '+12V' },
    ],
  },
  {
    id: 'pcie',
    name: 'PCIe 8-pin (6+2)',
    subtitle: { en: 'Graphics card power', tr: 'Ekran kartı beslemesi' },
    columns: 4,
    pins: [
      { number: 1, rail: '+12V' },
      { number: 2, rail: '+12V' },
      { number: 3, rail: '+12V' },
      {
        number: 4,
        rail: 'SENSE',
        note: {
          en: 'Tells the card an 8-pin is connected',
          tr: 'Karta 8-pin takılı olduğunu bildirir',
        },
      },
      { number: 5, rail: 'COM' },
      { number: 6, rail: 'COM' },
      { number: 7, rail: 'COM' },
      { number: 8, rail: 'COM' },
    ],
  },
  {
    id: '12vhpwr',
    name: '12VHPWR / 12V-2x6',
    subtitle: {
      en: 'ATX 3.x graphics power — up to 600 W',
      tr: 'ATX 3.x ekran kartı beslemesi — 600 W’a kadar',
    },
    columns: 6,
    pins: [
      { number: 1, rail: '+12V' },
      { number: 2, rail: '+12V' },
      { number: 3, rail: '+12V' },
      { number: 4, rail: '+12V' },
      { number: 5, rail: '+12V' },
      { number: 6, rail: '+12V' },
      { number: 7, rail: 'COM' },
      { number: 8, rail: 'COM' },
      { number: 9, rail: 'COM' },
      { number: 10, rail: 'COM' },
      { number: 11, rail: 'COM' },
      { number: 12, rail: 'COM' },
      {
        number: 13,
        rail: 'SENSE',
        label: 'SENSE0',
        note: {
          en: 'With SENSE1, encodes the power budget the supply permits: 150 / 300 / 450 / 600 W',
          tr: 'SENSE1 ile birlikte beslemenin izin verdiği güç bütçesini kodlar: 150 / 300 / 450 / 600 W',
        },
      },
      { number: 14, rail: 'SENSE', label: 'SENSE1' },
      {
        number: 15,
        rail: 'SENSE',
        label: 'PWR_STABLE',
        note: {
          en: 'Supply tells the card its rails are up and steady',
          tr: 'Besleme, karta rail’lerinin ayakta ve kararlı olduğunu bildirir',
        },
      },
      {
        number: 16,
        rail: 'SENSE',
        label: 'CABLE_PRESENT',
        note: {
          en: 'Shortened on 12V-2x6, so a partly seated plug fails safe instead of arcing',
          tr: '12V-2x6’da kısaltıldı; tam oturmamış fiş ark yapmak yerine güvenli tarafta arızalanır',
        },
      },
    ],
  },
  {
    id: 'sata',
    name: 'SATA power',
    subtitle: {
      en: '15-pin, three contacts per rail',
      tr: '15-pin, rail başına üç kontak',
    },
    columns: 5,
    pins: [
      { number: 1, rail: '+3.3V' },
      { number: 2, rail: 'COM' },
      { number: 3, rail: '+5V' },
      { number: 4, rail: 'COM' },
      { number: 5, rail: '+12V' },
    ],
  },
  {
    id: 'molex',
    name: 'Molex 4-pin',
    subtitle: { en: 'Legacy peripheral power', tr: 'Eski çevre birimi beslemesi' },
    columns: 4,
    pins: [
      { number: 1, rail: '+12V' },
      { number: 2, rail: 'COM' },
      { number: 3, rail: 'COM' },
      { number: 4, rail: '+5V' },
    ],
  },
];
