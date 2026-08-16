import type { FaqEntry } from './psuReference';

/**
 * Glossary for the EC dialog. Same rule as the PSU one: `term` is never
 * translated, only the question and the explanation.
 */
export const EC_FAQ: FaqEntry[] = [
  {
    term: 'Embedded Controller',
    question: {
      en: 'What is the EC actually for?',
      tr: 'EC aslında ne işe yarıyor?',
    },
    answer: {
      en: 'It is the small computer that runs the computer. Anything that has to work while the main system is off, asleep or hung belongs to it: the power button, the fans, the battery, the lid switch, the keyboard on a laptop. The CPU is a guest that arrives late and leaves early; the EC is the caretaker who is always there.',
      tr: 'Bilgisayarı çalıştıran küçük bilgisayardır. Ana sistem kapalıyken, uykudayken ya da kilitliyken çalışması gereken her şey ona aittir: power butonu, fanlar, batarya, lid switch, laptop’ta klavye. CPU geç gelip erken giden bir misafirdir; EC ise hep orada olan kâhyadır.',
    },
    href: 'https://en.wikipedia.org/wiki/Microcontroller',
  },
  {
    term: '8051',
    question: {
      en: 'Why is a 1980 microcontroller still in a modern PC?',
      tr: '1980’lerden kalma bir mikrodenetleyici modern bir PC’de ne arıyor?',
    },
    answer: {
      en: 'Because the job has not changed and neither have the constraints. The EC needs to run for years on a rail measured in milliamps, respond in microseconds, and never crash. An 8051 derivative does all three, is extremely cheap, and has toolchains that have been debugged for four decades. Newer designs use an ARM Cortex-M for the same reasons, not because the 8051 stopped working.',
      tr: 'Çünkü ne iş değişti ne de kısıtlar. EC’nin yıllarca miliamperle ölçülen bir rail üzerinde çalışması, mikrosaniyeler içinde tepki vermesi ve asla çökmemesi gerekir. Bir 8051 türevi üçünü de yapar, son derece ucuzdur ve kırk yıldır hataları ayıklanmış araç zincirlerine sahiptir. Yeni tasarımlar aynı sebeplerle ARM Cortex-M kullanır; 8051 çalışmayı bıraktığı için değil.',
    },
    href: 'https://en.wikipedia.org/wiki/Intel_MCS-51',
  },
  {
    term: 'Debounce',
    question: {
      en: 'Why does a single press need filtering at all?',
      tr: 'Tek bir basış neden filtrelenmek zorunda?',
    },
    answer: {
      en: 'Two pieces of metal touching do not make one clean connection. They bounce, opening and closing several times over a few milliseconds before settling. A pin sampled fast enough sees that as a burst of presses. Waiting 10–50 ms and re-reading turns the burst back into the one press the human made.',
      tr: 'Birbirine değen iki metal parçası tek ve temiz bir bağlantı oluşturmaz. Sekerler; oturmadan önce birkaç milisaniye boyunca defalarca açılıp kapanırlar. Yeterince hızlı örneklenen bir pin bunu bir dizi basış olarak görür. 10–50 ms bekleyip tekrar okumak, bu diziyi insanın yaptığı o tek basışa geri çevirir.',
    },
    href: 'https://en.wikipedia.org/wiki/Switch',
  },
  {
    term: 'GPIO interrupt',
    question: {
      en: 'Why an interrupt instead of just checking the pin?',
      tr: 'Pini kontrol etmek yerine neden interrupt?',
    },
    answer: {
      en: 'Polling means waking up constantly to ask a question whose answer is almost always no. An interrupt lets the core sit in a low-power state until the pin actually changes, and then react in microseconds. On a rail that has to last while the machine is unplugged from nothing but the wall, that difference matters.',
      tr: 'Yoklama, cevabı neredeyse her zaman hayır olan bir soruyu sormak için sürekli uyanmak demektir. Interrupt ise çekirdeğin, pin gerçekten değişene kadar düşük güçlü bir durumda beklemesine ve sonra mikrosaniyeler içinde tepki vermesine izin verir. Makine yalnızca duvara bağlıyken beslenmesi gereken bir rail’de bu fark önemlidir.',
    },
    href: 'https://en.wikipedia.org/wiki/Interrupt',
  },
  {
    term: 'Watchdog timer',
    question: {
      en: 'Who watches the EC?',
      tr: 'EC’yi kim izliyor?',
    },
    answer: {
      en: 'Nothing above it does — so it watches itself. The firmware has to keep resetting a counter; if it ever stops, the counter reaches zero and forces a reset. Without it, an EC that hung would leave a machine that cannot be turned on or off by any means short of unplugging it.',
      tr: 'Üzerinde onu izleyen bir şey yoktur — bu yüzden kendini izler. Firmware bir sayacı sürekli sıfırlamak zorundadır; bir an durursa sayaç sıfıra iner ve reset’i zorlar. O olmasa, kilitlenmiş bir EC, fişi çekmek dışında hiçbir yolla açılıp kapatılamayan bir makine bırakırdı.',
    },
    href: 'https://en.wikipedia.org/wiki/Watchdog_timer',
  },
  {
    term: 'LPC / eSPI',
    question: {
      en: 'How do the EC and the chipset talk?',
      tr: 'EC ile chipset nasıl konuşuyor?',
    },
    answer: {
      en: 'Over a dedicated low-pin-count bus. LPC is the older one, a slimmed-down descendant of the ISA bus, carrying register access and interrupts on a handful of pins. eSPI replaced it on modern boards: fewer pins, higher speed, and it can also carry the SPI flash traffic, which is why some boards route firmware reads through the EC.',
      tr: 'Ayrılmış, az pinli bir yol üzerinden. LPC eskisidir; ISA yolunun inceltilmiş bir torunudur ve register erişimi ile interrupt’ları birkaç pin üzerinden taşır. eSPI modern kartlarda onun yerini aldı: daha az pin, daha yüksek hız, ayrıca SPI flash trafiğini de taşıyabiliyor — bazı kartların firmware okumalarını EC üzerinden yönlendirmesinin sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Low_Pin_Count',
  },
  {
    term: 'SCI / _Q## methods',
    question: {
      en: 'How does the EC tell the operating system something happened?',
      tr: 'EC işletim sistemine bir şey olduğunu nasıl söylüyor?',
    },
    answer: {
      en: 'It raises an SCI — a System Control Interrupt — which is deliberately vague: it says only that something changed. The OS then reads a query register from the EC, gets back a number, and runs the ACPI method named _Q plus that number from the DSDT table. That method, written by the board vendor, is what actually describes the event: lid closed, battery low, thermal trip.',
      tr: 'Bir SCI — System Control Interrupt — yükseltir; bu sinyal bilerek belirsizdir, yalnızca “bir şey değişti” der. İşletim sistemi ardından EC’den bir query register okur, geriye bir sayı alır ve DSDT tablosundan _Q artı o sayı adlı ACPI metodunu çalıştırır. Kart üreticisi tarafından yazılan o metot, olayı asıl tarif eden şeydir: kapak kapandı, batarya azaldı, termal eşik aşıldı.',
    },
    href: 'https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface',
  },
  {
    term: 'SMBus',
    question: {
      en: 'How does the EC know the battery percentage?',
      tr: 'EC batarya yüzdesini nereden biliyor?',
    },
    answer: {
      en: 'It asks the battery. Inside the pack is a gauge chip that counts charge in and out and models the cells\' condition; the EC reads it over SMBus, a two-wire bus derived from I2C. The percentage on screen is that chip\'s estimate relayed by the EC — which is why recalibrating a battery is a matter of correcting the gauge, not the cells.',
      tr: 'Bataryaya sorar. Paketin içinde, giren ve çıkan şarjı sayan ve hücrelerin durumunu modelleyen bir gauge çipi vardır; EC bunu I2C türevi iki telli bir yol olan SMBus üzerinden okur. Ekrandaki yüzde, EC tarafından aktarılan o çipin tahminidir — bir bataryayı kalibre etmenin hücreleri değil gauge’ı düzeltmek meselesi olmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/System_Management_Bus',
  },
  {
    term: '4-second override',
    question: {
      en: 'Why does holding the button always work?',
      tr: 'Düğmeyi basılı tutmak neden her zaman işe yarıyor?',
    },
    answer: {
      en: 'Because it deliberately bypasses software. A short press is a request the EC forwards to the OS, which can ignore it if it has hung. A press held past roughly four seconds is handled by the EC alone: it releases PS_ON# without consulting anything. It is the one path that cannot be blocked by a crash, which is exactly why it exists.',
      tr: 'Çünkü yazılımı bilerek devre dışı bırakır. Kısa basış, EC’nin işletim sistemine ilettiği bir istektir; işletim sistemi kilitlenmişse bunu görmezden gelebilir. Yaklaşık dört saniyeyi aşan basış ise yalnızca EC tarafından ele alınır: hiçbir şeye danışmadan PS_ON#’ı bırakır. Bir çökmeyle engellenemeyen tek yoldur ve var olma sebebi tam olarak budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface',
  },
  {
    term: 'EC firmware',
    question: {
      en: 'Why is EC firmware separate from the BIOS?',
      tr: 'EC firmware’i neden BIOS’tan ayrı?',
    },
    answer: {
      en: 'Different chip, different lifetime, different job. The EC must run before, during and after the firmware and the OS, so it cannot depend on their storage or their state. Keeping it on its own flash also means a failed BIOS update leaves the EC intact — the machine can still be powered on, which is often the only reason recovery is possible at all.',
      tr: 'Farklı yonga, farklı yaşam süresi, farklı iş. EC firmware’den ve işletim sisteminden önce, onlarla birlikte ve onlardan sonra çalışmak zorundadır; bu yüzden onların deposuna ya da durumuna bağlı olamaz. Kendi flash’ında tutulması ayrıca başarısız bir BIOS güncellemesinin EC’yi sağlam bırakması demektir — makine yine de açılabilir, ki kurtarmanın mümkün olmasının tek sebebi çoğu zaman budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Serial_Peripheral_Interface',
  },
];
