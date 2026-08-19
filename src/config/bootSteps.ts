import type { Localized } from '../i18n';
import type { AnchorId, BootStep, Phase, SignalSpec } from '../types';
import { RAIL_COLORS } from './constants';
import { EC_SEQUENCE_STEPS } from './ecSequence';
import { PSU_POWERUP_SEQUENCE_STEPS } from './psuPowerUpSequence';
import { CPU_SEQUENCE_STEPS } from './cpuSequence';
import { COREBOOT_SEQUENCE_STEPS } from './corebootSequence';
import { GRUB_SEQUENCE_STEPS } from './grubSequence';
import { INITRAMFS_SEQUENCE_STEPS } from './initramfsSequence';
import { KERNEL_SEQUENCE_STEPS } from './kernelSequence';
import { LOGIN_SEQUENCE_STEPS } from './loginSequence';
import { SYSTEMD_SEQUENCE_STEPS } from './systemdSequence';
import { VRM_SEQUENCE_STEPS } from './vrmSequence';
import { PSU_STAGES } from './psuStages';

/** Phase names shown on the info panel badge. */
export const PHASE_LABELS: Record<Phase, Localized> = {
  psu: { en: 'Inside the PSU', tr: 'PSU’nun İçi' },
  standby: { en: 'Standby', tr: 'Standby' },
  power: { en: 'Power Chain', tr: 'Güç Zinciri' },
  firmware: { en: 'Firmware', tr: 'Firmware' },
  os: { en: 'Operating System', tr: 'İşletim Sistemi' },
};

/**
 * The 3D staging for each PSU stage: which internal components the energy
 * travels between, and which of them light up.
 *
 * Kept separate from PSU_STAGES so the prose stays in one place and is shared
 * with the block-diagram dialog, while the scene routing lives here.
 */
const PSU_STAGE_SCENE: Record<
  string,
  { signals: SignalSpec[]; highlight: AnchorId[] }
> = {
  'ac-emi': {
    highlight: ['wallSocket', 'psuInlet', 'psuEmi'],
    signals: [
      {
        route: ['wallSocket', 'psuInlet'],
        color: RAIL_COLORS.mains,
        label: '230 V AC',
        particles: 14,
        thickness: 1.2,
        spread: 0.6,
      },
      {
        route: ['psuInlet', 'psuEmi'],
        color: RAIL_COLORS.mains,
        particles: 8,
        delay: 0.45,
        spread: 0.4,
      },
    ],
  },
  rectifier: {
    highlight: ['psuEmi', 'psuRectifier'],
    signals: [
      {
        route: ['psuEmi', 'psuRectifier'],
        color: RAIL_COLORS.hvdc,
        label: 'pulsating DC',
        particles: 12,
        thickness: 1.1,
      },
    ],
  },
  pfc: {
    highlight: ['psuRectifier', 'psuPfc'],
    signals: [
      {
        route: ['psuRectifier', 'psuPfc'],
        color: RAIL_COLORS.hvdc,
        label: '≈400 V DC',
        particles: 12,
        thickness: 1.1,
      },
    ],
  },
  switching: {
    highlight: ['psuPfc', 'psuSwitching'],
    signals: [
      {
        route: ['psuPfc', 'psuSwitching'],
        color: RAIL_COLORS.hvdc,
        label: '50–150 kHz',
        particles: 18,
        thickness: 1.1,
      },
    ],
  },
  transformer: {
    highlight: ['psuSwitching', 'psuTransformer'],
    signals: [
      {
        route: ['psuSwitching', 'psuTransformer'],
        color: RAIL_COLORS.hvdc,
        particles: 16,
        thickness: 1.2,
        spread: 0.5,
      },
      {
        route: ['psuTransformer', 'psuSecondary'],
        color: RAIL_COLORS['+12V'],
        label: 'across the barrier',
        particles: 14,
        delay: 0.45,
        spread: 0.45,
        thickness: 1.2,
      },
    ],
  },
  secondary: {
    highlight: ['psuSecondary', 'psuFilter'],
    signals: [
      {
        route: ['psuSecondary', 'psuFilter'],
        color: RAIL_COLORS['+12V'],
        label: '+12V / +5V / +3.3V',
        particles: 12,
        persist: true,
        thickness: 1.1,
      },
    ],
  },
  standby: {
    highlight: ['psuRectifier', 'psuStandby', 'psuOutput'],
    signals: [
      {
        route: ['psuRectifier', 'psuStandby'],
        color: RAIL_COLORS['+5VSB'],
        particles: 8,
        persist: true,
        spread: 0.45,
      },
      {
        route: ['psuStandby', 'psuOutput'],
        color: RAIL_COLORS['+5VSB'],
        label: '+5VSB',
        particles: 10,
        persist: true,
        delay: 0.4,
        spread: 0.45,
      },
    ],
  },
  feedback: {
    highlight: ['psuFilter', 'psuSwitching'],
    signals: [
      {
        route: ['psuFilter', 'psuSwitching'],
        color: RAIL_COLORS.data,
        label: 'optocoupler',
        particles: 10,
        thickness: 0.8,
      },
    ],
  },
  supervisor: {
    highlight: ['psuFilter', 'psuSupervisor', 'psuOutput'],
    signals: [
      {
        route: ['psuFilter', 'psuSupervisor'],
        color: RAIL_COLORS.PWR_OK,
        particles: 8,
        spread: 0.45,
      },
      {
        route: ['psuSupervisor', 'psuOutput'],
        color: RAIL_COLORS.PWR_OK,
        label: 'PWR_OK',
        particles: 10,
        delay: 0.4,
        spread: 0.45,
      },
    ],
  },
  outputs: {
    highlight: ['psuFilter', 'psuOutput', 'atx24'],
    signals: [
      {
        route: ['psuFilter', 'psuOutput'],
        color: RAIL_COLORS['+12V'],
        particles: 10,
        persist: true,
        spread: 0.4,
      },
      {
        route: ['psuOutput', 'atx24'],
        color: RAIL_COLORS['+12V'],
        label: 'to the motherboard',
        particles: 14,
        persist: true,
        delay: 0.35,
        spread: 0.5,
        thickness: 1.3,
      },
    ],
  },
};

/**
 * The PSU stages as their own little chain, played inside the PSU view when the
 * unit is clicked. Deliberately *not* part of the main boot chain: the board
 * story stays at board level, and opening the PSU is a detour you take on
 * purpose. Prose comes from PSU_STAGES, routing from PSU_STAGE_SCENE.
 */
export const PSU_SEQUENCE_STEPS: BootStep[] = PSU_STAGES.map((stage) => {
  const scene = PSU_STAGE_SCENE[stage.id];
  if (!scene) throw new Error(`No 3D staging defined for PSU stage: ${stage.id}`);

  return {
    id: `psu-${stage.id}`,
    phase: 'psu',
    title: stage.title,
    signal: stage.badge,
    // The cross-reference to the boot chain reads as part of the explanation.
    description: stage.bootNote
      ? {
          en: `${stage.description.en} ${stage.bootNote.en}`,
          tr: `${stage.description.tr} ${stage.bootNote.tr}`,
        }
      : stage.description,
    duration: 5400,
    view: 'psu',
    screen: 'off',
    depth: 1,
    highlight: scene.highlight,
    signals: scene.signals,
  };
});

/**
 * The boot chain — all of the content lives here. Adding a step is just adding
 * an object to this array; the scene, the timeline and the info panel adapt
 * automatically.
 *
 * Note: index 0 (standby) is the passive/ambient step. It is shown as soon as
 * the scene loads and loops until Power is pressed; the chain starts at index 1.
 */
const SECTIONS: BootStep[] = [
  {
    id: 'psu',
    phase: 'standby',
    title: { en: 'PSU — Plugged In, Standby Up', tr: 'PSU — Fişte, Standby Hazır' },
    signal: '+5VSB',
    description: {
      en: 'As long as the machine is plugged in, a small standby converter inside the PSU keeps producing the +5VSB rail. It enters the board on pin 9 of the 24-pin connector and feeds the Super I/O / EC. The system looks "off" (ACPI S5), but the circuit listening for the power button is very much alive.',
      tr: 'Makine fişte olduğu sürece PSU içindeki küçük standby dönüştürücü +5VSB rail’ini üretmeye devam eder. Bu hat karta 24-pin konektörün 9. pininden girer ve Super I/O / EC’yi besler. Sistem “kapalı” görünür (ACPI S5), ama power button’ı dinleyen devre fazlasıyla canlıdır.',
    },
    duration: 4500,
    screen: 'off',
    schematic: true,
    // Shown nested in the timeline. These play inside the PSU view rather than
    highlight: ['psu', 'atx24', 'superio'],
    signals: [
      {
        route: ['psu', 'atx24', 'superio'],
        color: RAIL_COLORS['+5VSB'],
        label: '+5VSB',
        particles: 10,
        // Standby power must already be flowing when the scene loads.
        instant: true,
        persist: true,
        thickness: 0.8,
      },
    ],
  },
  {
    id: 'power-button',
    phase: 'power',
    title: { en: 'The Button Is Pressed', tr: 'Düğmeye Basıldı' },
    signal: 'PWRBTN#',
    description: {
      en: 'The button on the case switches no power at all; it is just a spring-loaded contact that briefly ties the PWRBTN# line on the F_PANEL header to ground. That falling edge reaches the Super I/O / EC, which is still awake on +5VSB, as an interrupt.',
      tr: 'Kasadaki düğme hiçbir gücü anahtarlamaz; yalnızca F_PANEL header’ındaki PWRBTN# hattını kısa süreliğine toprağa bağlayan yaylı bir kontaktır. Bu düşen kenar, hâlâ +5VSB ile ayakta olan Super I/O / EC’ye bir interrupt olarak ulaşır.',
    },
    duration: 4000,
    screen: 'off',
    highlight: ['powerButton', 'fpanel', 'superio'],
    console: ['[EC] PWRBTN# asserted (active low)', '[EC] debounce 32ms ... ok'],
    signals: [
      {
        route: ['powerButton', 'fpanel', 'superio'],
        color: RAIL_COLORS.logic,
        label: 'PWRBTN#',
        particles: 8,
      },
    ],
  },
  {
    id: 'ps-on',
    phase: 'power',
    title: { en: 'The EC Tells the PSU to Wake Up', tr: 'EC, PSU’ya Uyanma Emri Verir' },
    signal: 'PS_ON#',
    description: {
      en: 'Following the ACPI rules, the EC accepts the press as valid and pulls the green PS_ON# line on pin 16 of the 24-pin connector LOW. It is an active-low signal: grounding the line is what starts the PSU\'s main switching converter.',
      tr: 'EC, ACPI kurallarına uyarak basışı geçerli sayar ve 24-pin konektörün 16. pinindeki yeşil PS_ON# hattını LOW’a çeker. Active-low bir sinyaldir: hattı toprağa çekmek, PSU’nun ana switching converter’ını başlatan şeydir.',
    },
    duration: 4200,
    screen: 'off',
    schematic: true,
    // This single beat is eight steps inside the EC. They open in the EC
    highlight: ['superio', 'atx24', 'psu'],
    console: ['[EC] S5 -> S0 transition requested', '[EC] PS_ON# -> LOW'],
    signals: [
      {
        route: ['superio', 'atx24', 'psu'],
        color: RAIL_COLORS['PS_ON#'],
        label: 'PS_ON#',
        particles: 10,
      },
    ],
  },
  {
    id: 'rails',
    phase: 'power',
    title: { en: 'The Main Rails Come Up', tr: 'Ana Rail’ler Ayağa Kalkar' },
    signal: '+12V / +5V / +3.3V',
    description: {
      en: 'The PSU\'s main converter kicks in and three rails spread across the board. +12V travels through the EPS connector to the VRM, which switches it down to the ~1V core voltage (Vcore) the CPU needs. +3.3V and +5V feed consumers such as the RAM, the chipset and the M.2 drive.',
      tr: 'PSU’nun ana dönüştürücüsü devreye girer ve üç rail karta yayılır. +12V, EPS konektörü üzerinden VRM’e gider; VRM bunu CPU’nun ihtiyaç duyduğu ~1V’luk çekirdek gerilimine (Vcore) düşürür. +3.3V ve +5V ise RAM, chipset ve M.2 sürücü gibi tüketicileri besler.',
    },
    duration: 5600,
    screen: 'off',
    schematic: true,
    // Everything between PS_ON# arriving and PWR_OK leaving happens inside the
    highlight: ['psu', 'atx24', 'eps12v', 'vrm', 'cpu', 'ram', 'm2', 'chipset'],
    console: [
      '[PSU] main converter ON',
      '[PSU] +12V  ramp ... 11.98V',
      '[PSU] +5V   ramp ... 5.02V',
      '[PSU] +3.3V ramp ... 3.31V',
    ],
    signals: [
      {
        route: ['psu', 'eps12v'],
        color: RAIL_COLORS['+12V'],
        label: '+12V (EPS)',
        particles: 12,
        persist: true,
        delay: 0,
        spread: 0.35,
        thickness: 1.3,
      },
      {
        route: ['eps12v', 'vrm'],
        color: RAIL_COLORS['+12V'],
        particles: 8,
        persist: true,
        delay: 0.2,
        spread: 0.25,
        thickness: 1.1,
      },
      {
        route: ['vrm', 'cpu'],
        color: RAIL_COLORS.vcore,
        label: 'Vcore',
        particles: 8,
        persist: true,
        delay: 0.4,
        spread: 0.25,
        thickness: 1.1,
      },
      {
        route: ['psu', 'atx24'],
        color: RAIL_COLORS['+5V'],
        label: '+5V / +3.3V',
        particles: 12,
        persist: true,
        delay: 0.1,
        spread: 0.3,
        thickness: 1.3,
      },
      {
        route: ['atx24', 'chipset'],
        color: RAIL_COLORS['+3.3V'],
        particles: 7,
        persist: true,
        delay: 0.4,
        spread: 0.3,
      },
      {
        route: ['atx24', 'ram'],
        color: RAIL_COLORS['+3.3V'],
        particles: 7,
        persist: true,
        delay: 0.5,
        spread: 0.3,
      },
      {
        route: ['atx24', 'm2'],
        color: RAIL_COLORS['+3.3V'],
        particles: 7,
        persist: true,
        delay: 0.6,
        spread: 0.3,
      },
    ],
  },
  {
    id: 'pwr-ok',
    phase: 'power',
    title: { en: 'PWR_OK — The Voltages Are Stable', tr: 'PWR_OK — Gerilimler Kararlı' },
    signal: 'PWR_OK',
    description: {
      en: 'Between 100 and 500 ms after the rails settle inside tolerance, the PSU raises PWR_OK (Power Good) on pin 8. Until that signal arrives the chipset refuses to release the reset line: the CPU is held in reset so it cannot start executing instructions on noisy, unsettled voltage.',
      tr: 'Rail’ler tolerans içine oturduktan 100–500 ms sonra PSU, 8. pindeki PWR_OK (Power Good) hattını yükseltir. Bu sinyal gelene kadar chipset reset hattını bırakmayı reddeder: CPU, gürültülü ve oturmamış gerilimde komut işletmeye başlamasın diye reset’te tutulur.',
    },
    duration: 4400,
    screen: 'off',
    // Once PWR_OK lands, the board has its own power-up to do before the CPU
    highlight: ['psu', 'atx24', 'chipset', 'cpu'],
    console: ['[PSU] PWR_OK -> HIGH (after 214ms)', '[PCH] deasserting CPU RESET#'],
    signals: [
      {
        route: ['psu', 'atx24', 'chipset'],
        color: RAIL_COLORS.PWR_OK,
        label: 'PWR_OK',
        particles: 10,
        delay: 0,
        spread: 0.55,
      },
      {
        route: ['chipset', 'cpu'],
        color: RAIL_COLORS.PWR_OK,
        label: 'RESET# released',
        particles: 8,
        delay: 0.5,
        spread: 0.4,
      },
    ],
  },
  {
    id: 'post',
    phase: 'firmware',
    title: { en: 'Firmware Takes Over', tr: 'Firmware Devralıyor' },
    signal: 'reset vector 0xFFFFFFF0',
    description: {
      en: 'The moment reset lifts, the CPU starts executing firmware from the reset vector. UEFI first trains the memory controller, then enumerates the PCIe and NVMe devices and builds the ACPI tables it will hand over to the operating system.',
      tr: 'Reset kalkar kalkmaz CPU, reset vector’den firmware kodunu işletmeye başlar. UEFI önce memory controller’ı eğitir (memory training), ardından PCIe ve NVMe cihazlarını sayar ve işletim sistemine devredeceği ACPI tablolarını hazırlar.',
    },
    duration: 6000,
    screen: 'post',
    // Everything between RESET# going high and the first instruction —
    highlight: ['cpu', 'ram', 'chipset', 'm2', 'pcie'],
    console: [
      'UEFI firmware v2.90 (x64)',
      'CPU: 8 cores / 16 threads @ 3.80GHz',
      'Memory training ......... 32768 MB OK',
      'NVMe0: Samsung SSD 990 PRO 1TB',
      'PCIe: 1 device(s) enumerated',
      'ACPI tables published',
    ],
    signals: [
      {
        route: ['cpu', 'ram'],
        color: RAIL_COLORS.data,
        label: 'memory training',
        particles: 10,
        delay: 0,
        spread: 0.35,
      },
      {
        route: ['cpu', 'chipset'],
        color: RAIL_COLORS.data,
        particles: 8,
        delay: 0.25,
        spread: 0.3,
      },
      {
        route: ['chipset', 'm2'],
        color: RAIL_COLORS.data,
        label: 'NVMe enumerate',
        particles: 8,
        delay: 0.45,
        spread: 0.3,
      },
      {
        route: ['chipset', 'pcie'],
        color: RAIL_COLORS.data,
        particles: 8,
        delay: 0.6,
        spread: 0.3,
      },
    ],
  },
  {
    id: 'coreboot',
    phase: 'firmware',
    title: { en: 'coreboot — The Firmware Itself', tr: 'coreboot — Firmware’in Kendisi' },
    signal: '_start → payload',
    description: {
      en: 'The firmware at the reset vector on this machine is coreboot rather than a vendor UEFI. It runs in stages sized to the memory that exists at the time: a bootblock with no RAM at all, a romstage that trains the DRAM, and a ramstage that brings up every device and builds the ACPI tables. Its last act is to jump to a payload — here, GRUB.',
      tr: 'Bu makinede reset vector’deki firmware, üretici UEFI’si değil coreboot’tur. O anda var olan belleğe göre boyutlanmış aşamalar hâlinde çalışır: hiç RAM’i olmayan bir bootblock, DRAM’i eğiten bir romstage ve her cihazı ayağa kaldırıp ACPI tablolarını kuran bir ramstage. Son işi bir payload’a atlamaktır — burada GRUB’a.',
    },
    duration: 5800,
    screen: 'post',
    highlight: ['spiFlash', 'cpu', 'ram', 'chipset'],
    console: [
      'coreboot-4.22 bootblock starting...',
      'CBFS: found "fallback/romstage"',
      'FSP-M: memory training ... ok',
      'BS_WRITE_TABLES: ACPI, SMBIOS',
      'Jumping to boot code at 0x00100000',
    ],
    signals: [
      {
        route: ['spiFlash', 'chipset', 'cpu'],
        color: RAIL_COLORS.firmware,
        label: 'bootblock',
        particles: 10,
        spread: 0.4,
      },
      {
        route: ['cpu', 'ram'],
        color: RAIL_COLORS.kernel,
        label: 'ramstage + payload',
        particles: 10,
        delay: 0.45,
        spread: 0.45,
        persist: true,
      },
    ],
  },
  {
    id: 'bootloader',
    phase: 'firmware',
    title: { en: 'Bootloader — Handover From Disk', tr: 'Bootloader — Diskten Devralma' },
    signal: 'EFI System Partition',
    description: {
      en: 'The firmware loads and runs the .efi binary (GRUB or systemd-boot) from the EFI System Partition on the NVMe SSD. The bootloader draws its own menu, pulls the selected kernel image and the initramfs into RAM, then hands control to the kernel.',
      tr: 'Firmware, NVMe SSD üzerindeki EFI System Partition’dan .efi dosyasını (GRUB ya da systemd-boot) yükleyip çalıştırır. Bootloader kendi menüsünü çizer, seçilen kernel image’ını ve initramfs’i RAM’e alır, sonra kontrolü kernel’e devreder.',
    },
    duration: 4800,
    screen: 'boot',
    highlight: ['m2', 'chipset', 'cpu', 'ram'],
    console: [
      'EFI stub: loading \\EFI\\BOOT\\BOOTX64.EFI',
      'GRUB 2.12 — booting entry "Linux"',
      'Loading vmlinuz-6.11.0 ...',
      'Loading initramfs-6.11.0.img ...',
    ],
    signals: [
      {
        route: ['m2', 'chipset', 'cpu'],
        color: RAIL_COLORS.firmware,
        label: 'bootloader',
        particles: 12,
        delay: 0,
        spread: 0.5,
      },
      {
        route: ['cpu', 'ram'],
        color: RAIL_COLORS.firmware,
        label: 'kernel + initramfs -> RAM',
        particles: 10,
        delay: 0.45,
        spread: 0.45,
      },
    ],
  },
  {
    id: 'kernel',
    phase: 'os',
    title: { en: 'Kernel Init', tr: 'Kernel Init' },
    signal: 'start_kernel()',
    description: {
      en: 'The kernel takes over the arrangement the firmware set up: it rebuilds the memory map, wakes the sleeping CPU cores (SMP bringup), loads driver modules and mounts the real root filesystem from inside the initramfs.',
      tr: 'Kernel, firmware’in kurduğu düzeni devralır: memory map’i yeniden oluşturur, uyuyan CPU çekirdeklerini uyandırır (SMP bringup), driver modüllerini yükler ve gerçek root filesystem’i initramfs içinden mount eder.',
    },
    duration: 5000,
    screen: 'boot',
    schematic: true,
    highlight: ['cpu', 'ram', 'm2', 'pcie'],
    console: [
      '[    0.000000] Linux version 7.2.0-rc6',
      '[    0.412]  smp: Brought up 1 node, 16 CPUs',
      '[    0.884]  nvme nvme0: 8/0/0 default/read/poll queues',
      '[    1.201]  EXT4-fs (nvme0n1p2): mounted filesystem',
      '[    1.318]  Freeing unused kernel image memory',
    ],
    signals: [
      {
        route: ['cpu', 'ram'],
        color: RAIL_COLORS.kernel,
        particles: 10,
        delay: 0,
        spread: 0.4,
      },
      {
        route: ['cpu', 'm2'],
        color: RAIL_COLORS.kernel,
        label: 'rootfs mount',
        particles: 10,
        delay: 0.25,
        spread: 0.4,
      },
      {
        route: ['cpu', 'pcie'],
        color: RAIL_COLORS.kernel,
        label: 'driver probe',
        particles: 8,
        delay: 0.45,
        spread: 0.4,
      },
    ],
  },
  {
    id: 'initramfs',
    phase: 'os',
    title: { en: 'initramfs — Reaching the Real Disk', tr: 'initramfs — Gerçek Diske Ulaşmak' },
    signal: '/init',
    description: {
      en: 'Userspace is running, but only out of RAM. The kernel cannot mount the root filesystem without a driver, and on most machines that driver is a file on the root filesystem — so a small complete system is loaded into memory ahead of time to break the loop. It finds the hardware, unlocks the disk, mounts the real root, and then deletes itself.',
      tr: 'Userspace çalışıyor, ama yalnızca RAM üzerinden. Kernel, root filesystem’i bir sürücü olmadan mount edemez ve çoğu makinede o sürücü root filesystem üzerinde bir dosyadır — bu yüzden döngüyü kırmak için önceden belleğe küçük ve eksiksiz bir sistem yüklenir. Donanımı bulur, diski açar, gerçek kökü mount eder ve ardından kendini siler.',
    },
    duration: 4800,
    screen: 'boot',
    schematic: true,
    highlight: ['ram', 'm2', 'chipset'],
    console: [
      'Run /init as init process',
      'systemd[1]: Running in initrd.',
      'systemd[1]: Switching root.',
    ],
    signals: [
      {
        route: ['ram', 'm2'],
        color: RAIL_COLORS.kernel,
        label: 'initramfs',
        particles: 10,
        delay: 0,
        spread: 0.45,
      },
      {
        route: ['m2', 'cpu'],
        color: RAIL_COLORS.kernel,
        particles: 8,
        delay: 0.35,
        spread: 0.4,
      },
    ],
  },
  {
    id: 'systemd',
    phase: 'os',
    title: { en: 'systemd — PID 1', tr: 'systemd — PID 1' },
    signal: 'graphical.target',
    description: {
      en: 'With the root filesystem in place, the kernel runs the first user-space process: /sbin/init, which is systemd. It resolves the dependency graph between units, brings services up in parallel wherever it can, and works its way toward graphical.target.',
      tr: 'Root filesystem yerine oturduğunda kernel ilk kullanıcı alanı sürecini çalıştırır: /sbin/init, yani systemd. Unit’ler arasındaki bağımlılık grafiğini çözer, mümkün olan her yerde servisleri paralel ayağa kaldırır ve graphical.target’a doğru ilerler.',
    },
    duration: 4800,
    screen: 'boot',
    schematic: true,
    highlight: ['cpu', 'chipset', 'm2', 'pcie'],
    console: [
      '[  OK  ] Reached target Basic System.',
      '[  OK  ] Started D-Bus System Message Bus.',
      '[  OK  ] Started Network Manager.',
      '[  OK  ] Reached target Graphical Interface.',
    ],
    signals: [
      {
        route: ['cpu', 'chipset'],
        color: RAIL_COLORS.kernel,
        particles: 8,
        delay: 0,
        spread: 0.4,
      },
      {
        route: ['chipset', 'm2'],
        color: RAIL_COLORS.kernel,
        particles: 8,
        delay: 0.2,
        spread: 0.4,
      },
      {
        route: ['chipset', 'pcie'],
        color: RAIL_COLORS.kernel,
        particles: 8,
        delay: 0.4,
        spread: 0.4,
      },
    ],
  },
  {
    id: 'login',
    phase: 'os',
    title: { en: 'Display Manager — The Login Screen', tr: 'Display Manager — Login Ekranı' },
    signal: 'GDM / SDDM',
    description: {
      en: 'graphical.target starts the display manager, which opens a Wayland or X session and draws the greeter. With the first frame sent to the graphics card, the chain that began when someone pressed the power button is complete.',
      tr: 'graphical.target display manager’ı başlatır; o da bir Wayland ya da X oturumu açıp greeter’ı çizer. Ekran kartına gönderilen ilk kare ile birlikte, birinin power button’a basmasıyla başlayan zincir tamamlanmış olur.',
    },
    duration: 5200,
    screen: 'login',
    schematic: true,
    highlight: ['cpu', 'pcie', 'display'],
    console: ['[  OK  ] Started GNOME Display Manager.', 'gdm-session: greeter ready'],
    signals: [
      {
        route: ['cpu', 'pcie'],
        color: RAIL_COLORS.video,
        label: 'framebuffer',
        particles: 10,
        delay: 0,
        spread: 0.4,
      },
      {
        route: ['pcie', 'display'],
        color: RAIL_COLORS.video,
        label: 'DisplayPort',
        particles: 12,
        delay: 0.3,
        spread: 0.5,
        persist: true,
      },
    ],
  },
];

/** The chain starts at index 1; index 0 is the passive standby display. */
export const FIRST_ACTIVE_STEP = 1;

/**
 * The chain as it actually plays: one flat list, every stage a step of its own.
 *
 * Each section step introduces what is about to happen, and the stages that
 * belong to it follow immediately behind it carrying `depth: 1` — so the
 * timeline can indent them while the sequence just walks straight through.
 * A step's `view` is what moves the camera, which is how the run dives into
 * the PSU, the EC and the CPU without anyone having to click anything.
 */
function section(id: string): BootStep {
  const step = SECTIONS.find((candidate) => candidate.id === id);
  if (!step) throw new Error(`Unknown section: ${id}`);
  return step;
}

export const BOOT_STEPS: BootStep[] = [
  section('psu'),
  ...PSU_SEQUENCE_STEPS,
  section('power-button'),
  section('ps-on'),
  ...EC_SEQUENCE_STEPS,
  section('rails'),
  ...PSU_POWERUP_SEQUENCE_STEPS,
  section('pwr-ok'),
  ...VRM_SEQUENCE_STEPS,
  section('post'),
  ...CPU_SEQUENCE_STEPS,
  section('coreboot'),
  ...COREBOOT_SEQUENCE_STEPS,
  section('bootloader'),
  ...GRUB_SEQUENCE_STEPS,
  section('kernel'),
  ...KERNEL_SEQUENCE_STEPS,
  section('initramfs'),
  ...INITRAMFS_SEQUENCE_STEPS,
  section('systemd'),
  ...SYSTEMD_SEQUENCE_STEPS,
  section('login'),
  ...LOGIN_SEQUENCE_STEPS,
];
