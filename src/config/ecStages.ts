import type { Localized } from '../i18n';
import type { ModalStage } from '../types';

/**
 * What happens inside the Embedded Controller between someone pressing the
 * power button and PS_ON# being pulled low.
 *
 * This is the step the board-level chain compresses into a single beat: the EC
 * is the only thing awake at that moment, and every one of these eight steps
 * runs on standby power alone.
 */
export const EC_STAGES: ModalStage[] = [
  {
    id: 'standby',
    title: { en: 'Standby Power Is Live', tr: 'Standby Güç Aktif' },
    badge: '+5VSB',
    description: {
      en: 'While the PSU is plugged in, the +5VSB (and on many boards +3.3VSB) rail feeds the EC without interruption. The EC is never off — it is running firmware, holding state and watching pins the entire time the machine appears dead.',
      tr: 'PSU fişte olduğu sürece +5VSB (birçok kartta ayrıca +3.3VSB) rail’i EC’yi kesintisiz besler. EC hiçbir zaman kapalı değildir — makine ölü görünürken bile firmware çalıştırır, durum tutar ve pinleri izler.',
    },
    nodes: ['vsb', 'core'],
    edges: ['e-vsb-core'],
  },
  {
    id: 'press',
    title: { en: 'The Button Is Pressed', tr: 'Power Butonuna Basılır' },
    badge: 'PWRBTN#',
    description: {
      en: 'The momentary switch on the case briefly shorts two wires together. That closure reaches the board through the front panel header — it carries no power, only the fact that someone touched it.',
      tr: 'Kasadaki momentary switch iki teli kısa süreliğine birbirine değdirir. Bu kapanma karta front panel header üzerinden ulaşır — hiçbir güç taşımaz, yalnızca birinin ona dokunduğu bilgisini taşır.',
    },
    nodes: ['btn'],
    edges: ['e-btn-gpio'],
  },
  {
    id: 'interrupt',
    title: { en: 'GPIO Interrupt Fires', tr: 'GPIO Interrupt Tetiklenir' },
    badge: 'IRQ',
    description: {
      en: 'The GPIO pin the switch is wired to is configured as an interrupt source. The edge raises a hardware interrupt rather than requiring the firmware to poll — which is what lets the EC sit in a low-power loop and still react instantly.',
      tr: 'Switch’in bağlı olduğu GPIO pini interrupt kaynağı olarak yapılandırılmıştır. Kenar, firmware’in sürekli yoklama yapmasını gerektirmek yerine donanımsal bir interrupt üretir — EC’nin düşük güçlü bir döngüde beklerken yine de anında tepki verebilmesini sağlayan şey budur.',
    },
    nodes: ['gpio', 'core'],
    edges: ['e-gpio-core'],
  },
  {
    id: 'debounce',
    title: { en: 'Debounce', tr: 'Debounce — Titreşim Filtreleme' },
    badge: { en: '10–50 ms', tr: '10–50 ms' },
    description: {
      en: 'Mechanical contacts bounce: for a few milliseconds after they touch, they open and close repeatedly. Taken at face value that would read as several presses. The firmware waits a short window and re-reads the pin, accepting the press only if it is still held.',
      tr: 'Mekanik kontaklar seker: değdikten sonraki birkaç milisaniye boyunca defalarca açılıp kapanırlar. Olduğu gibi alınırsa bu birkaç ayrı basış gibi okunurdu. Firmware kısa bir süre bekleyip pini tekrar okur ve basışı yalnızca hâlâ basılı duruyorsa kabul eder.',
    },
    nodes: ['gpio', 'core'],
    edges: ['e-gpio-core'],
  },
  {
    id: 'duration',
    title: { en: 'Press Duration Is Measured', tr: 'Basma Süresi Ölçülür' },
    badge: { en: 'short / long', tr: 'kısa / uzun' },
    description: {
      en: 'A short press (under about four seconds) is a request, passed up to the operating system to handle politely. A press held past four seconds is the hardware override — the EC cuts power itself without asking anyone, which is why it still works when the OS has hung.',
      tr: 'Kısa basış (yaklaşık dört saniyenin altı) bir istektir; işletim sistemine nazikçe ele alması için iletilir. Dört saniyeyi aşan basış ise donanımsal geçersiz kılmadır — EC kimseye sormadan gücü kendisi keser; işletim sistemi kilitlendiğinde hâlâ çalışmasının sebebi budur.',
    },
    nodes: ['core'],
  },
  {
    id: 'acpi-state',
    title: { en: 'Current ACPI State Is Checked', tr: 'Mevcut ACPI Durumu Kontrol Edilir' },
    badge: 'S0 / S3 / S5',
    description: {
      en: 'The same button means different things depending on where the system is. From S5 it means power on; from S0 it means signal the OS to shut down; from S3 it means wake. The EC keeps that state itself, and reports it to the OS over the ACPI operation region once there is an OS to talk to.',
      tr: 'Aynı düğme, sistemin bulunduğu yere göre farklı anlamlara gelir. S5’ten “aç” demektir; S0’dan işletim sistemine “kapan” sinyali vermek demektir; S3’ten uyandırmak demektir. EC bu durumu kendisi tutar ve konuşacak bir işletim sistemi olduğunda ACPI operation region üzerinden ona bildirir.',
    },
    nodes: ['core', 'espi', 'acpi'],
    edges: ['e-espi-core', 'e-espi-acpi'],
  },
  {
    id: 'decide',
    title: { en: 'The Firmware Decides', tr: 'Firmware Karar Verir' },
    badge: { en: 'EC firmware', tr: 'EC firmware' },
    description: {
      en: 'The logic making this call lives in the EC\'s own SPI flash — a separate chip from the one holding UEFI, updated separately, running its own code out of its own SRAM. From S5 with a valid short press, the decision is to assert PS_ON#.',
      tr: 'Bu kararı veren mantık EC’nin kendi SPI flash’ında yaşar — UEFI’yi tutan yongadan ayrı, ayrı güncellenen, kendi SRAM’inden kendi kodunu çalıştıran bir çip. S5’teyken geçerli bir kısa basış varsa karar, PS_ON#’ı aktif etmektir.',
    },
    nodes: ['core', 'flash', 'sram'],
    edges: ['e-flash-core', 'e-sram-core'],
  },
  {
    id: 'assert',
    title: { en: 'PS_ON# Is Pulled Low', tr: 'PS_ON# Toprağa Çekilir' },
    badge: 'PS_ON# → LOW',
    description: {
      en: 'The EC drives the PS_ON# line — idling at 3.3–5 V through a pull-up on the PSU side — down to ground. On many designs it does this through the PCH rather than directly. Grounding that one pin on the 24-pin connector is the entire request: it starts the main switching converter, and everything else follows.',
      tr: 'EC, PSU tarafındaki bir pull-up üzerinden 3.3–5 V’ta duran PS_ON# hattını toprağa çeker. Birçok tasarımda bunu doğrudan değil PCH üzerinden yapar. 24-pin konektördeki o tek pini toprağa çekmek isteğin tamamıdır: ana switching converter’ı başlatır ve geri kalan her şey onu izler.',
    },
    nodes: ['pson'],
    edges: ['e-core-pson', 'e-pson-out'],
    note: {
      en: 'From here the PSU takes over — this is exactly where the "EC tells the PSU to wake up" step of the boot chain hands off.',
      tr: 'Buradan sonrasını PSU devralır — boot zincirindeki “EC, PSU’ya uyanma emri verir” adımının devrettiği nokta tam olarak burasıdır.',
    },
  },
];

/** The hardware blocks that make up an EC, shown in the components tab. */
export interface EcComponent {
  /** Block name — technical, never translated. */
  name: string;
  spec: Localized;
  description: Localized;
  /** Matching `data-node` id in the diagram, when the block appears there. */
  node?: string;
}

export const EC_COMPONENTS: EcComponent[] = [
  {
    name: 'Core',
    node: 'core',
    spec: { en: '8-bit 8051 derivative or 32-bit ARM Cortex-M', tr: '8-bit 8051 türevi ya da 32-bit ARM Cortex-M' },
    description: {
      en: 'A deliberately modest processor running at a few MHz to a few hundred MHz. It is chosen for how little power it draws rather than how fast it is, because it never gets to stop.',
      tr: 'Birkaç MHz ile birkaç yüz MHz arasında çalışan, bilerek mütevazı tutulmuş bir işlemci. Hızından çok ne kadar az güç çektiği için seçilir, çünkü hiçbir zaman durma şansı yoktur.',
    },
  },
  {
    name: 'SRAM',
    node: 'sram',
    spec: { en: 'a few KB to tens of KB', tr: 'birkaç KB ile onlarca KB arası' },
    description: {
      en: 'The EC\'s working memory, holding firmware runtime state: the current power state, timers, sensor readings, the fan curve it is following.',
      tr: 'EC’nin çalışma belleği; firmware’in çalışma zamanı durumunu tutar: mevcut güç durumu, sayaçlar, sensör okumaları, takip ettiği fan eğrisi.',
    },
  },
  {
    name: 'SPI NOR Flash',
    node: 'flash',
    spec: { en: '128 KB – 1 MB, separate from the BIOS flash', tr: '128 KB – 1 MB, BIOS flash’ından ayrı' },
    description: {
      en: 'Holds the EC\'s own firmware on its own chip, distinct from the SPI flash carrying UEFI. It is updated on its own schedule — which is why an EC update and a BIOS update are two different operations.',
      tr: 'EC’nin kendi firmware’ini, UEFI’yi taşıyan SPI flash’tan ayrı kendi yongasında tutar. Kendi takvimiyle güncellenir — EC güncellemesi ile BIOS güncellemesinin iki ayrı işlem olmasının sebebi budur.',
    },
  },
  {
    name: 'GPIO',
    node: 'gpio',
    spec: { en: 'dozens of general-purpose pins', tr: 'düzinelerce genel amaçlı pin' },
    description: {
      en: 'The power button, lid switch, fan tacho inputs and status LEDs all land here. Any pin can be configured as an interrupt source, which is how a press wakes the firmware instantly.',
      tr: 'Power butonu, lid switch, fan tako girişleri ve durum LED’leri hep buraya iner. Herhangi bir pin interrupt kaynağı olarak yapılandırılabilir; bir basışın firmware’i anında uyandırması bu sayededir.',
    },
  },
  {
    name: 'ADC',
    node: 'adc',
    spec: { en: 'analog-to-digital channels', tr: 'analog-dijital kanallar' },
    description: {
      en: 'Converts the analog voltage from thermal sensors into numbers the firmware can compare against thresholds.',
      tr: 'Termal sensörlerden gelen analog gerilimi, firmware’in eşiklerle karşılaştırabileceği sayılara çevirir.',
    },
  },
  {
    name: 'PWM',
    node: 'pwm',
    spec: { en: 'fan control outputs', tr: 'fan kontrol çıkışları' },
    description: {
      en: 'Chops the voltage going to the fans with a variable duty cycle, which is what sets their speed. The fan curve is EC firmware, not an OS driver — the fans work before the OS exists.',
      tr: 'Fanlara giden gerilimi değişken bir duty cycle ile kesip biçer; hızlarını belirleyen budur. Fan eğrisi bir işletim sistemi sürücüsü değil EC firmware’idir — fanlar işletim sistemi var olmadan önce de çalışır.',
    },
  },
  {
    name: 'I2C / SMBus',
    node: 'i2c',
    spec: { en: 'low-speed peripheral buses', tr: 'düşük hızlı çevre birimi yolları' },
    description: {
      en: 'Talks to the battery gauge, some sensors and RGB controllers. SMBus is the variant the battery and power management devices speak.',
      tr: 'Batarya gauge çipi, bazı sensörler ve RGB kontrolcüleriyle konuşur. SMBus, batarya ve güç yönetimi cihazlarının konuştuğu türevdir.',
    },
  },
  {
    name: 'Keyboard matrix scanner',
    node: 'kbd',
    spec: { en: 'laptops', tr: 'laptoplarda' },
    description: {
      en: 'Scans the key matrix independently of the CPU. It is why the keyboard backlight and Fn-key shortcuts respond in firmware setup, and why a laptop can wake on a keypress.',
      tr: 'Tuş matrisini CPU’ya danışmadan tarar. Klavye aydınlatmasının ve Fn kısayollarının firmware kurulumunda çalışmasının, bir laptop’un tuşa basılınca uyanabilmesinin sebebi budur.',
    },
  },
  {
    name: 'Watchdog timer',
    node: 'wdt',
    spec: { en: 'firmware liveness guard', tr: 'firmware canlılık koruması' },
    description: {
      en: 'A counter the firmware must keep resetting. If the EC firmware ever hangs, the counter expires and forces a reset — the failsafe for the one component that has no supervisor above it.',
      tr: 'Firmware’in sürekli sıfırlaması gereken bir sayaç. EC firmware’i kilitlenirse sayaç dolar ve reset’i zorlar — üzerinde bir denetleyicisi olmayan tek bileşen için son güvenlik ağı.',
    },
  },
  {
    name: 'LPC / eSPI',
    node: 'espi',
    spec: { en: 'the bus to the PCH', tr: 'PCH’ye giden yol' },
    description: {
      en: 'How the EC and the chipset exchange register reads, writes and interrupts. Older boards use LPC; modern ones use eSPI, which carries the same traffic over fewer, faster pins.',
      tr: 'EC ile chipset’in register okuma, yazma ve interrupt alışverişini yaptığı yol. Eski kartlar LPC, modern kartlar ise aynı trafiği daha az ve daha hızlı pin üzerinden taşıyan eSPI kullanır.',
    },
  },
  {
    name: 'ACPI operation region',
    node: 'acpi',
    spec: { en: 'classically I/O ports 0x62 / 0x66', tr: 'klasik olarak 0x62 / 0x66 I/O portları' },
    description: {
      en: 'The window the operating system reads the EC through, declared in the DSDT table. The EC raises an SCI to say something changed, and the OS runs the matching _Q## query method to find out what.',
      tr: 'İşletim sisteminin EC’yi okuduğu pencere; DSDT tablosunda tanımlanır. EC bir şeyin değiştiğini söylemek için SCI yükseltir, işletim sistemi de neyin değiştiğini öğrenmek için eşleşen _Q## query metodunu çalıştırır.',
    },
  },
];
