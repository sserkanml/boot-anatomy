import type { BootStep } from '../types';
import { RAIL_COLORS } from './constants';

/**
 * What happens between RESET# going high and the CPU actually fetching its
 * first instruction.
 *
 * Most of this is internal state rather than anything spatial, so the console
 * panel carries the register values and the verification output while the
 * scene shows the few things that really do travel: the reset release across
 * the die, the fan-out to the other cores, and the long trip out to the SPI
 * flash for that first fetch.
 */
export const CPU_SEQUENCE_STEPS: BootStep[] = [
  {
    id: 'cpu-reset-tree',
    phase: 'firmware',
    title: { en: 'The Reset Tree Unwinds', tr: 'Reset Ağacı Kademeli Çözülüyor' },
    signal: { en: 'PLL lock', tr: 'PLL lock' },
    description: {
      en: 'RESET# going high does not switch the die on all at once. Separate reset trees serve separate clock domains — core, uncore, the ring or mesh interconnect, the memory controller — and they are released in a defined order. Release them together and a region whose PLL has not locked yet would clock its flip-flops from an unstable signal, risking metastability: a flip-flop that cannot decide whether it holds a 0 or a 1. So the reset logic waits for each PLL to raise its lock flag first.',
      tr: 'RESET#’in yükselmesi çipi bir anda açmaz. Ayrı clock domain’lerine — core, uncore, ring/mesh interconnect, bellek denetleyicisi — ayrı reset ağaçları hizmet eder ve bunlar tanımlı bir sırayla bırakılır. Hepsi birlikte bırakılsa, PLL’i henüz kilitlenmemiş bir bölge flip-flop’larını kararsız bir clock ile tetikler ve metastabilite riski doğar: bir flip-flop’un 0 mı 1 mi tuttuğuna karar verememesi. Bu yüzden reset mantığı önce her PLL’in lock bayrağını kaldırmasını bekler.',
    },
    duration: 5600,
    view: 'cpu',
    screen: 'off',
    highlight: ['cpu', 'cpuPll'],
    console: [
      '[CPU] RESET# deasserted',
      '[CPU] PLL core   ... lock',
      '[CPU] PLL uncore ... lock',
      '[CPU] reset domains released in order',
    ],
    signals: [
      {
        route: ['cpuPll', 'cpuBsp'],
        color: RAIL_COLORS.data,
        label: 'PLL lock',
        particles: 10,
        spread: 0.5,
      },
      {
        route: ['cpuPll', 'cpuAp'],
        color: RAIL_COLORS.data,
        particles: 8,
        delay: 0.35,
        spread: 0.45,
      },
    ],
  },
  {
    id: 'cpu-arch-state',
    phase: 'firmware',
    title: { en: 'Architectural Reset State', tr: 'Mimari Reset Durumu' },
    signal: 'CS:IP → 0xFFFFFFF0',
    description: {
      en: 'The silicon now forces a fixed register state with no software involved. CR0.PE is 0, so the CPU starts in real mode; CR0.PG is 0, so paging is off and every address is physical. EFLAGS is cleared, interrupts disabled. CS is F000h — but its hidden base is not the usual selector×16. It is forced to FFFF0000h, an exception unique to reset that no instruction can reproduce later. With IP at FFF0h the first fetch lands at 0xFFFFFFF0, sixteen bytes below the top of the address space. Unchanged since the 8086 in 1978.',
      tr: 'Silikon artık hiçbir yazılım müdahalesi olmadan sabit bir register durumunu zorlar. CR0.PE 0’dır, yani CPU real mode’da başlar; CR0.PG 0’dır, yani paging kapalıdır ve her adres fizikseldir. EFLAGS temizlenir, kesmeler kapalıdır. CS F000h’dir — ama gizli tabanı her zamanki selector×16 değildir. FFFF0000h’a zorlanır; bu, yalnızca reset anına özgü, hiçbir komutun sonradan yeniden üretemeyeceği bir istisnadır. IP FFF0h olunca ilk fetch 0xFFFFFFF0’a, adres uzayının tepesinin on altı byte altına düşer. 1978’deki 8086’dan beri değişmedi.',
    },
    duration: 6000,
    view: 'cpu',
    screen: 'off',
    highlight: ['cpu', 'cpuBsp'],
    console: [
      'CR0.PE   = 0        (real mode)',
      'CR0.PG   = 0        (paging off)',
      'EFLAGS   = 00000002h',
      'CS       = F000h',
      'CS.base  = FFFF0000h  <- reset-only',
      'IP       = FFF0h',
      '=> first fetch @ 0xFFFFFFF0',
    ],
    signals: [],
  },
  {
    id: 'cpu-bsp',
    phase: 'firmware',
    title: { en: 'BSP / AP Arbitration', tr: 'BSP / AP Arbitrasyonu' },
    signal: 'wait-for-SIPI',
    description: {
      en: 'The cores do not all head for the reset vector — that would be chaos. Very early in the reset microflow a hardware arbitration picks one, typically the lowest Local APIC ID, and marks it the Bootstrap Processor in the IA32_APIC_BASE MSR. The losing cores, the Application Processors, never fetch anything: microcode parks them in wait-for-SIPI, completely idle, until the BSP wakes them much later with an INIT-SIPI-SIPI sequence. So the earliest firmware code runs single-threaded, even on a sixteen-core part.',
      tr: 'Çekirdeklerin hepsi reset vector’e gitmez — bu kaos olurdu. Reset mikro-akışının çok erken bir noktasında donanımsal bir arbitrasyon birini seçer, tipik olarak en düşük Local APIC ID’ye sahip olanı, ve onu IA32_APIC_BASE MSR’ında Bootstrap Processor olarak işaretler. Kaybeden çekirdekler, yani Application Processor’lar, hiçbir şey fetch etmez: mikrokod onları wait-for-SIPI durumunda tamamen atıl park eder ve BSP çok sonra bir INIT-SIPI-SIPI dizisiyle onları uyandırana kadar orada kalırlar. Yani en erken firmware kodu, on altı çekirdekli bir işlemcide bile tek thread çalışır.',
    },
    duration: 5800,
    view: 'cpu',
    screen: 'off',
    highlight: ['cpuBsp', 'cpuAp'],
    console: [
      '[CPU] APIC ID 0 -> BSP',
      '[CPU] APIC ID 1..15 -> wait-for-SIPI',
      '[CPU] 1 of 16 threads running',
    ],
    signals: [
      {
        route: ['cpuBsp', 'cpuAp'],
        color: RAIL_COLORS.logic,
        label: 'parked',
        particles: 8,
        spread: 0.5,
      },
    ],
  },
  {
    id: 'cpu-microcode',
    phase: 'firmware',
    title: { en: 'The Microcode Update Loads', tr: 'Mikrokod Güncellemesi Yükleniyor' },
    signal: { en: 'FIT · RSA · patch RAM', tr: 'FIT · RSA · patch RAM' },
    description: {
      en: 'Complex x86 instructions are not fixed gate logic; they run through an interpreter layer called microcode. The factory version is burned into ROM, but the vendor expects a patch on top of it. The CPU reads the FIT table at a fixed offset in the flash to find the update, matches its CPUID signature and platform ID against the running part, then verifies an RSA signature against a public key embedded in the silicon. Only then is it loaded into patch RAM. This is precisely why Spectre and Meltdown could be mitigated by a "BIOS update".',
      tr: 'Karmaşık x86 komutları sabit kapı mantığı değildir; mikrokod denen bir yorumlayıcı katmandan geçerler. Fabrika sürümü ROM’a yakılmıştır ama üretici bunun üzerine bir yama bekler. CPU, güncellemeyi bulmak için flash’ta sabit bir offset’teki FIT tablosunu okur, güncellemenin CPUID imzasını ve platform ID’sini çalışan işlemciyle eşleştirir, ardından silikona gömülü bir public key ile RSA imzasını doğrular. Ancak bundan sonra patch RAM’e yüklenir. Spectre ve Meltdown’ın bir “BIOS güncellemesiyle” kapatılabilmesinin sebebi tam olarak budur.',
    },
    duration: 6200,
    view: 'cpu',
    screen: 'off',
    highlight: ['spiFlash', 'chipset', 'cpu', 'cpuUcode'],
    console: [
      '[FIT] microcode entry @ 0xFFFFFC00',
      '[UCODE] CPUID sig 000906EA  match',
      '[UCODE] platform ID 0x22    match',
      '[UCODE] RSA-2048 signature  verified',
      '[UCODE] rev 0x00 -> 0xF4    patch RAM loaded',
    ],
    signals: [
      {
        route: ['spiFlash', 'chipset'],
        color: RAIL_COLORS.firmware,
        particles: 10,
        spread: 0.35,
      },
      {
        route: ['chipset', 'cpuUcode'],
        color: RAIL_COLORS.firmware,
        label: 'microcode patch',
        particles: 10,
        delay: 0.3,
        spread: 0.4,
      },
    ],
  },
  {
    id: 'cpu-verified-boot',
    phase: 'firmware',
    title: {
      en: 'Verified Boot Pre-Check — Boot Guard / PSP',
      tr: 'Doğrulanmış Önyükleme Ön-Kontrolü — Boot Guard / PSP',
    },
    signal: { en: 'platform dependent', tr: 'platforma göre değişir' },
    description: {
      en: 'On many modern platforms nothing at the reset vector is trusted until a hardware root of trust has checked it. Intel Boot Guard has the CPU load a signed ACM into isolated on-die SRAM — usable long before DRAM exists — and verify it against a key hash fused into the part at the factory; the ACM then verifies the firmware that follows. AMD does the equivalent from a separate ARM-based PSP that runs before the x86 cores are fully out of reset. Whether this step happens at all depends on the board\'s fuse configuration.',
      tr: 'Birçok modern platformda, reset vector’deki hiçbir koda donanımsal bir güven kökü onu denetlemeden güvenilmez. Intel Boot Guard’da CPU, imzalı bir ACM’yi izole on-die SRAM’e — DRAM var olmadan çok önce kullanılabilen belleğe — yükler ve fabrikada yongaya yakılmış bir anahtar hash’ine göre doğrular; ACM de ardından gelen firmware’i doğrular. AMD aynı işi, x86 çekirdekleri henüz resetten tam çıkmadan çalışan ayrı bir ARM tabanlı PSP ile yapar. Bu adımın hiç gerçekleşip gerçekleşmediği kartın fuse yapılandırmasına bağlıdır.',
    },
    duration: 6000,
    view: 'cpu',
    screen: 'off',
    highlight: ['spiFlash', 'cpu', 'cpuBsp'],
    console: [
      '[ACM] loading into on-die SRAM',
      '[ACM] key hash vs fused OEM key  match',
      '[ACM] measuring IBB (bootblock)',
      '[ACM] verdict: verified — continue',
    ],
    signals: [
      {
        route: ['spiFlash', 'cpuBsp'],
        color: RAIL_COLORS.PWR_OK,
        label: 'ACM verify',
        particles: 10,
        spread: 0.55,
      },
    ],
  },
  {
    id: 'cpu-first-fetch',
    phase: 'firmware',
    title: { en: 'The First Fetch — Out to Flash', tr: 'İlk Fetch — Flash’a Doğru' },
    signal: '0xFFFFFFF0',
    description: {
      en: 'The BSP finally issues a real read at 0xFFFFFFF0. Nothing is cached yet, so the request leaves the CPU over DMI and reaches the PCH, whose address decoder has a hardwired rule: the very top of the address space is mapped to the SPI flash regardless of any runtime configuration, so the reset vector is always reachable. The PCH turns the request into an actual SPI read command, clocks the answer back bit by bit, and presents it to the CPU as if it came from memory. It is far slower than DRAM, which is why the code at that address is a handful of bytes — just a jump.',
      tr: 'BSP nihayet 0xFFFFFFF0’dan gerçek bir okuma yapar. Henüz hiçbir şey cache’lenmemiştir, bu yüzden istek CPU’dan DMI üzerinden çıkıp PCH’ye ulaşır. PCH’nin adres çözücüsünde donanımsal ve sabit bir kural vardır: adres uzayının en tepesi, hiçbir çalışma zamanı ayarına bakılmaksızın SPI flash’a haritalanmıştır; böylece reset vector her zaman erişilebilirdir. PCH isteği gerçek bir SPI okuma komutuna çevirir, cevabı bit bit geri alır ve CPU’ya sanki bellekten geliyormuş gibi sunar. Bu, DRAM’den çok daha yavaştır; o adresteki kodun yalnızca birkaç byte — sadece bir jump — olmasının sebebi budur.',
    },
    duration: 6200,
    view: 'cpu',
    screen: 'off',
    highlight: ['cpu', 'cpuBsp', 'chipset', 'spiFlash'],
    console: [
      '[BSP] fetch 0xFFFFFFF0 ... cache miss',
      '[DMI] request -> PCH',
      '[PCH] top-of-memory window -> SPI',
      '[SPI] read cmd 0x03 @ 0x7FFFF0',
      '[BSP] EA 5B E0 00 F0   jmp far',
    ],
    signals: [
      {
        route: ['cpuBsp', 'chipset'],
        color: RAIL_COLORS.data,
        label: 'DMI',
        particles: 10,
        spread: 0.3,
      },
      {
        route: ['chipset', 'spiFlash'],
        color: RAIL_COLORS.data,
        label: 'SPI read',
        particles: 10,
        delay: 0.25,
        spread: 0.3,
      },
      {
        route: ['spiFlash', 'chipset', 'cpuBsp'],
        color: RAIL_COLORS.firmware,
        label: 'first instruction',
        particles: 12,
        delay: 0.55,
        spread: 0.42,
        persist: true,
      },
    ],
  },
];
