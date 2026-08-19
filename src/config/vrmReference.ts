import type { FaqEntry } from './psuReference';

/**
 * The glossary behind the VRM dialog.
 *
 * The PSU and the VRM are both switching converters, so a few ideas recur —
 * but the questions people actually have about a VRM are different. They are
 * mostly about why there are four of everything, and why a board that can
 * deliver two hundred amps still cannot hold the voltage steady.
 *
 * As everywhere else, term is never localized. Every href was checked to
 * return 200.
 */
export const VRM_FAQ: FaqEntry[] = [
  {
    term: 'VRM',
    question: {
      en: 'Why does the CPU need its own power supply when the PSU already made 12 V?',
      tr: 'PSU zaten 12 V ürettiyse CPU neden kendi beslemesine ihtiyaç duyar?',
    },
    answer: {
      en: 'Because the CPU needs about one volt, needs it to change within microseconds as the workload shifts, and can draw two hundred amps of it. Nothing at the far end of a cable can do that — the resistance of the wire alone would lose too much. So the conversion happens on the motherboard, inches from the socket, and it is rebuilt for every processor generation because the voltage and the response time they demand keep changing.',
      tr: 'Çünkü CPU yaklaşık bir volt ister, iş yükü değiştikçe bunun mikrosaniyeler içinde değişmesini ister ve bundan iki yüz amper çekebilir. Bir kablonun öbür ucundaki hiçbir şey bunu yapamaz — tek başına telin direnci bile fazlasını kaybettirir. Bu yüzden dönüşüm anakart üzerinde, soketin birkaç santim yanında olur ve her işlemci kuşağı için yeniden tasarlanır, çünkü istedikleri gerilim ve tepki süresi sürekli değişir.',
    },
    href: 'https://en.wikipedia.org/wiki/Voltage_regulator_module',
  },
  {
    term: 'buck converter',
    question: {
      en: 'How do you get 1 V from 12 V without burning the difference?',
      tr: '12 V’tan 1 V’u aradaki farkı yakmadan nasıl elde edersin?',
    },
    answer: {
      en: 'By not lowering the voltage at all. A switch connects the full 12 V to an inductor for a short slice of each cycle and disconnects it for the rest; the inductor and capacitor average those pulses into a steady lower voltage. Because the switch is either fully on or fully off it dissipates almost nothing, which is how the arrangement reaches ninety per cent efficiency where a resistor would reach eight.',
      tr: 'Gerilimi hiç düşürmeyerek. Bir anahtar, her çevrimin kısa bir diliminde tam 12 V’u bir bobine bağlar ve kalanında keser; bobin ve kondansatör bu darbeleri düzgün ve daha düşük bir gerilime ortalar. Anahtar ya tam açık ya tam kapalı olduğu için üzerinde neredeyse hiç kayıp olmaz; bir direncin yüzde sekize ulaştığı yerde bu düzenin yüzde doksana ulaşmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Buck_converter',
  },
  {
    term: 'PWM',
    question: {
      en: 'What is the controller actually controlling?',
      tr: 'Denetleyici gerçekte neyi denetliyor?',
    },
    answer: {
      en: 'The width of the pulse. The switching frequency stays fixed; what changes is what fraction of each cycle the switch stays on. Want more voltage, stay on longer. The controller measures the output, compares it against what the CPU asked for, and adjusts that fraction hundreds of thousands of times a second — a feedback loop tight enough that the output looks steady even though nothing about it is.',
      tr: 'Darbenin genişliğini. Anahtarlama frekansı sabit kalır; değişen şey anahtarın her çevrimin ne kadarında açık kaldığıdır. Daha fazla gerilim istiyorsan daha uzun açık kal. Denetleyici çıkışı ölçer, CPU’nun istediğiyle karşılaştırır ve bu oranı saniyede yüz binlerce kez ayarlar — çıkışın hiçbir yanı sabit olmamasına rağmen sabit görünmesini sağlayacak kadar sıkı bir geri besleme döngüsü.',
    },
    href: 'https://en.wikipedia.org/wiki/Pulse-width_modulation',
  },
  {
    term: 'duty cycle',
    question: {
      en: 'What sets the output voltage?',
      tr: 'Çıkış gerilimini ne belirler?',
    },
    answer: {
      en: 'The fraction of each cycle the switch spends on, almost exactly. Twelve volts in and one volt out means the switch is on for about a twelfth of the time. That ratio is why a VRM stepping 12 V down to 1 V works the switches so briefly and so often, and why the losses that remain are dominated by the act of switching rather than by conduction.',
      tr: 'Anahtarın her çevrimde açık geçirdiği oran, neredeyse tam olarak. Giriş on iki volt, çıkış bir volt demek, anahtarın zamanın yaklaşık on ikide birinde açık olması demektir. 12 V’u 1 V’a düşüren bir VRM’in anahtarları bu kadar kısa ve bu kadar sık çalıştırmasının sebebi bu orandır; geriye kalan kayıplara iletimin değil anahtarlama eyleminin hâkim olmasının sebebi de.',
    },
    href: 'https://en.wikipedia.org/wiki/Duty_cycle',
  },
  {
    term: 'inductor / choke',
    question: {
      en: 'What are those square blocks in a row next to the socket?',
      tr: 'Soketin yanındaki sıra sıra kare bloklar ne?',
    },
    answer: {
      en: 'Inductors, one per phase. An inductor resists a change in the current through it, which is exactly the property needed here: fed with sharp on-off pulses, it lets through a current that ramps rather than jumps. Counting them tells you how many phases the board has, which is why the count is quoted in motherboard reviews.',
      tr: 'Bobinler, faz başına bir tane. Bir bobin içinden geçen akımın değişmesine direnir ve burada gereken özellik tam olarak budur: keskin aç-kapa darbeleriyle beslendiğinde, sıçrayan değil rampa çizen bir akım geçirir. Sayılarını saymak kartın kaç fazı olduğunu söyler; anakart incelemelerinde bu sayının verilmesinin sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Inductor',
  },
  {
    term: 'multi-phase',
    question: {
      en: 'Why four phases instead of one bigger one?',
      tr: 'Neden tek büyük faz yerine dört faz?',
    },
    answer: {
      en: 'Three reasons at once. Each phase carries a quarter of the current, so each component can be small and cheap rather than large and exotic. The heat is spread across four places on the board instead of concentrated in one. And because the phases are deliberately started a quarter period apart, one is ramping down while another ramps up, so their ripples partly cancel and the output is far steadier than any single phase could manage.',
      tr: 'Aynı anda üç sebep. Her faz akımın dörtte birini taşır, dolayısıyla her bileşen büyük ve egzotik yerine küçük ve ucuz olabilir. Isı, tek bir noktada toplanmak yerine kartın dört ayrı yerine dağılır. Ve fazlar bilerek çeyrek periyot arayla başlatıldığı için biri düşerken diğeri yükselir; ripple’ları kısmen birbirini götürür ve çıkış, tek bir fazın başarabileceğinden çok daha düzgün olur.',
    },
    href: 'https://en.wikipedia.org/wiki/Buck_converter',
  },
  {
    term: 'ripple',
    question: {
      en: 'What is ripple and how much is acceptable?',
      tr: 'Ripple nedir ve ne kadarı kabul edilebilir?',
    },
    answer: {
      en: 'The small wobble left on a DC rail by the switching that produced it. It can never be zero — the converter works by chopping, and chopping leaves a residue. What matters is staying inside the window the CPU specifies, typically a few tens of millivolts on a one-volt rail. Phase interleaving and the capacitors under the socket are the two things keeping it there.',
      tr: 'Bir DC rail’in üzerinde, onu üreten anahtarlamanın bıraktığı küçük salınım. Asla sıfır olamaz — çevirici doğrayarak çalışır ve doğramak bir kalıntı bırakır. Önemli olan, CPU’nun belirttiği pencerenin içinde kalmaktır; bir voltluk bir rail’de tipik olarak birkaç on milivolt. Fazların kaydırılması ve soketin altındaki kondansatörler, onu orada tutan iki şeydir.',
    },
    href: 'https://en.wikipedia.org/wiki/Ripple_(electrical)',
  },
  {
    term: 'MOSFET',
    question: {
      en: 'What is doing the actual switching?',
      tr: 'Asıl anahtarlamayı ne yapıyor?',
    },
    answer: {
      en: 'A pair of transistors per phase: one connects the inductor to 12 V, the other connects it to ground when the first is off. They have to change state in nanoseconds and carry tens of amps while on, and the two requirements pull against each other — a transistor with very low resistance has a large gate that is slow to charge. That trade is most of what separates a cheap board from an expensive one.',
      tr: 'Faz başına bir çift transistör: biri bobini 12 V’a bağlar, diğeri ilki kapalıyken toprağa bağlar. Nanosaniyeler içinde durum değiştirmek ve açıkken onlarca amper taşımak zorundadırlar; bu iki gereklilik birbirini çeker — direnci çok düşük bir transistörün, şarj edilmesi yavaş olan büyük bir kapısı olur. Ucuz bir kartla pahalı bir kartı ayıran şeyin çoğu bu takastır.',
    },
    href: 'https://en.wikipedia.org/wiki/MOSFET',
  },
  {
    term: 'VID / SVID',
    question: {
      en: 'Who decides what voltage the CPU gets?',
      tr: 'CPU’nun hangi gerilimi alacağına kim karar verir?',
    },
    answer: {
      en: 'The CPU does, and it changes its mind constantly. Rather than being wired to a fixed voltage, it tells the controller over a small dedicated bus what it wants right now — lower when idle, higher when boosting a core. This is why the same processor draws a few watts browsing and two hundred under load, and why undervolting is a matter of asking for a different number rather than changing anything physical.',
      tr: 'CPU karar verir ve sürekli fikir değiştirir. Sabit bir gerilime kablolanmak yerine, küçük özel bir veriyolu üzerinden denetleyiciye şu anda ne istediğini söyler — boştayken daha düşük, bir çekirdeği hızlandırırken daha yüksek. Aynı işlemcinin gezinirken birkaç watt, yük altında iki yüz watt çekmesinin sebebi budur; undervolting’in fiziksel bir şeyi değiştirmek değil de farklı bir sayı istemek meselesi olmasının sebebi de.',
    },
    href: 'https://en.wikipedia.org/wiki/Voltage_regulator_module',
  },
  {
    term: 'load-line / Vdroop',
    question: {
      en: 'Why is the voltage allowed to sag under load on purpose?',
      tr: 'Gerilimin yük altında bilerek sarkmasına neden izin verilir?',
    },
    answer: {
      en: 'Because it makes the worst case better. A load can jump by a hundred amps in under a microsecond, and the voltage will dip before the loop can respond. If the regulator sat at the top of the allowed window while idle, that dip would fall out the bottom. By deliberately regulating slightly lower as the current rises, the whole allowed band is available for the transient instead of only half of it.',
      tr: 'Çünkü en kötü durumu iyileştirir. Bir yük, bir mikrosaniyeden kısa sürede yüz amper sıçrayabilir ve döngü tepki veremeden gerilim düşer. Regülatör boştayken izin verilen pencerenin tepesinde otursaydı, o düşüş alttan taşardı. Akım yükseldikçe bilerek biraz daha düşük regüle ederek, geçici olay için bandın yarısı değil tamamı kullanılabilir hâle gelir.',
    },
    href: 'https://en.wikipedia.org/wiki/Transient_response',
  },
  {
    term: 'decoupling capacitor',
    question: {
      en: 'What are the small capacitors underneath the socket for?',
      tr: 'Soketin altındaki küçük kondansatörler ne için?',
    },
    answer: {
      en: 'To supply the current the inductors cannot deliver fast enough. There is a hierarchy: large bulk capacitors handle changes over milliseconds, ceramics on the board handle microseconds, and tiny ones inside the CPU package handle nanoseconds. Each is placed as close to the load as its speed demands, because at these speeds even a centimetre of copper is an obstacle.',
      tr: 'Bobinlerin yeterince hızlı sağlayamadığı akımı vermek için. Bir hiyerarşi vardır: büyük bulk kondansatörler milisaniye ölçeğindeki değişimleri, kart üzerindeki seramikler mikrosaniyeleri, CPU paketinin içindeki minik olanlar nanosaniyeleri karşılar. Her biri hızının gerektirdiği kadar yüke yakın yerleştirilir, çünkü bu hızlarda bir santim bakır bile bir engeldir.',
    },
    href: 'https://en.wikipedia.org/wiki/Decoupling_capacitor',
  },
  {
    term: 'ESR',
    question: {
      en: 'Why do two capacitors of the same value behave differently?',
      tr: 'Aynı değerdeki iki kondansatör neden farklı davranır?',
    },
    answer: {
      en: 'Because a real capacitor has resistance in series with it, and that resistance turns the current flowing through it into heat and into a voltage error. On a rail delivering a hundred amps, a few milliohms is the difference between meeting the specification and not. It is also why capacitors are paralleled: the resistances divide, so ten small ones beat one large one even at the same total capacitance.',
      tr: 'Çünkü gerçek bir kondansatörün seri bir direnci vardır ve o direnç, içinden geçen akımı ısıya ve bir gerilim hatasına çevirir. Yüz amper veren bir rail’de birkaç miliohm, şartnameyi tutturmakla tutturamamak arasındaki farktır. Kondansatörlerin paralel bağlanmasının sebebi de budur: dirençler bölünür, dolayısıyla toplam kapasite aynı olsa bile on küçük olan, tek büyük olanı yener.',
    },
    href: 'https://en.wikipedia.org/wiki/Equivalent_series_resistance',
  },
  {
    term: 'power plane',
    question: {
      en: 'How does two hundred amps get from the VRM to the die?',
      tr: 'İki yüz amper VRM’den kalıba nasıl ulaşır?',
    },
    answer: {
      en: 'Not through traces — through entire layers of copper inside the board, dedicated to nothing else. At this current a normal trace would melt, and even a plane has enough resistance to lose a measurable fraction of a one-volt rail across a few centimetres. The socket has hundreds of pins assigned to power and ground for the same reason: no single contact could carry it.',
      tr: 'İzler üzerinden değil — kartın içinde, başka hiçbir şeye ayrılmamış bakır katmanların tamamı üzerinden. Bu akımda normal bir iz erirdi ve bir plane’in bile, bir voltluk bir rail’in ölçülebilir bir kısmını birkaç santimde kaybedecek kadar direnci vardır. Soketin yüzlerce pininin güce ve toprağa ayrılmış olmasının sebebi aynıdır: tek bir kontak bunu taşıyamazdı.',
    },
    href: 'https://en.wikipedia.org/wiki/Ground_plane',
  },
  {
    term: 'remote sense',
    question: {
      en: 'Where does the regulator measure the voltage it is regulating?',
      tr: 'Regülatör, regüle ettiği gerilimi nerede ölçer?',
    },
    answer: {
      en: 'At the CPU, not at itself. The copper between the two drops a little voltage, and that drop grows with the current — so a regulator measuring its own output would hold that steady while the voltage at the die sagged with load. Running a separate pair of sense wires to the socket means the loop corrects for the board itself, which at two hundred amps is not a rounding error.',
      tr: 'Kendisinde değil, CPU’da. İkisi arasındaki bakır bir miktar gerilim düşürür ve bu düşüş akımla büyür — dolayısıyla kendi çıkışını ölçen bir regülatör onu sabit tutarken kalıptaki gerilim yükle birlikte sarkardı. Sokete ayrı bir çift algılama teli çekmek, döngünün kartın kendisini de telafi etmesi demektir; bu da iki yüz amperde yuvarlama hatası değildir.',
    },
    href: 'https://en.wikipedia.org/wiki/Voltage_regulator_module',
  },
  {
    term: 'power sequencing',
    question: {
      en: 'Why can the rails not simply be switched on together?',
      tr: 'Rail’ler neden birlikte açılamaz?',
    },
    answer: {
      en: 'Because a chip whose I/O is powered while its core is not can be damaged by its own inputs. Current pushed into an unpowered die finds paths that were never meant to conduct, and in the worst case triggers a parasitic structure that behaves like a short circuit. The order and the delays between rails come from the processor datasheet, and the sequencer exists solely to obey them.',
      tr: 'Çünkü çekirdeği beslenmezken G/Ç’si beslenen bir yonga, kendi girdileri tarafından hasar görebilir. Beslenmemiş bir kalıba sürülen akım, hiçbir zaman iletmesi amaçlanmamış yollar bulur ve en kötü durumda kısa devre gibi davranan asalak bir yapıyı tetikler. Rail’ler arasındaki sıra ve gecikmeler işlemcinin veri sayfasından gelir ve sıralayıcı yalnızca onlara uymak için vardır.',
    },
    href: 'https://en.wikipedia.org/wiki/Latch-up',
  },
  {
    term: 'latch-up',
    question: {
      en: 'What actually happens during latch-up?',
      tr: 'Latch-up sırasında gerçekte ne olur?',
    },
    answer: {
      en: 'A structure that was never designed to exist turns on. The layers making up a normal transistor also form, unintentionally, a pair of transistors wired to feed each other — and once they trigger they hold each other on, conducting whatever the supply will give. Removing power is the only way to stop it, and if the supply can deliver enough current the chip is destroyed first.',
      tr: 'Var olması hiç tasarlanmamış bir yapı devreye girer. Normal bir transistörü oluşturan katmanlar, istemeden, birbirini besleyecek şekilde bağlanmış bir transistör çifti de oluşturur — ve bir kez tetiklendiklerinde birbirlerini açık tutar, beslemenin verdiği her şeyi iletirler. Durdurmanın tek yolu gücü kesmektir ve besleme yeterince akım verebiliyorsa yonga önce yanar.',
    },
    href: 'https://en.wikipedia.org/wiki/Latch-up',
  },
  {
    term: 'switching frequency',
    question: {
      en: 'What is the trade in switching faster?',
      tr: 'Daha hızlı anahtarlamanın takası nedir?',
    },
    answer: {
      en: 'Faster switching means smaller inductors and a quicker response to a load step, which is why it keeps rising. But each transition costs energy — the transistor spends a moment neither fully on nor fully off, dissipating heat — so doubling the frequency doubles that loss. Designers land wherever the two curves cross for the components they can afford.',
      tr: 'Daha hızlı anahtarlama daha küçük bobinler ve yük sıçramasına daha çabuk tepki demektir; sürekli yükselmesinin sebebi budur. Ama her geçiş enerjiye mal olur — transistör bir an ne tam açık ne tam kapalı kalır ve ısı yayar — dolayısıyla frekansı ikiye katlamak o kaybı da ikiye katlar. Tasarımcılar, alabildikleri bileşenler için bu iki eğrinin kesiştiği yere yerleşir.',
    },
    href: 'https://en.wikipedia.org/wiki/Switched-mode_power_supply',
  },
];
