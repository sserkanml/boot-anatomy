import type { BootStep, Phase } from '../types';
import { RAIL_COLORS } from './constants';

/** Phase names shown on the info panel badge. */
export const PHASE_LABELS: Record<Phase, string> = {
  standby: 'Standby',
  power: 'Power Chain',
  firmware: 'Firmware',
  os: 'Operating System',
};

/**
 * The boot chain — all of the content lives here. Adding a step is just adding
 * an object to this array; the scene, the timeline and the info panel adapt
 * automatically.
 *
 * Note: index 0 (standby) is the passive/ambient step. It is shown as soon as
 * the scene loads and loops until Power is pressed; the chain starts at index 1.
 */
export const BOOT_STEPS: BootStep[] = [
  {
    id: 'standby',
    phase: 'standby',
    title: 'Standby Power Is Already On',
    signal: '+5VSB',
    description:
      'As long as the machine is plugged in, a small standby converter inside the PSU keeps producing the +5VSB rail. It enters the board on pin 9 of the 24-pin connector and feeds the Super I/O / EC. The system looks "off" (ACPI S5), but the circuit listening for the power button is very much alive.',
    duration: 4500,
    screen: 'off',
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
    title: 'The Button Is Pressed',
    signal: 'PWRBTN#',
    description:
      'The button on the case switches no power at all; it is just a spring-loaded contact that briefly ties the PWRBTN# line on the F_PANEL header to ground. That falling edge reaches the Super I/O / EC, which is still awake on +5VSB, as an interrupt.',
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
    title: 'The EC Tells the PSU to Wake Up',
    signal: 'PS_ON#',
    description:
      'Following the ACPI rules, the EC accepts the press as valid and pulls the green PS_ON# line on pin 16 of the 24-pin connector LOW. It is an active-low signal: grounding the line is what starts the PSU\'s main switching converter.',
    duration: 4200,
    screen: 'off',
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
    title: 'The Main Rails Come Up',
    signal: '+12V / +5V / +3.3V',
    description:
      'The PSU\'s main converter kicks in and three rails spread across the board. +12V travels through the EPS connector to the VRM, which switches it down to the ~1V core voltage (Vcore) the CPU needs. +3.3V and +5V feed consumers such as the RAM, the chipset and the M.2 drive.',
    duration: 5600,
    screen: 'off',
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
    title: 'PWR_OK — The Voltages Are Stable',
    signal: 'PWR_OK',
    description:
      'Between 100 and 500 ms after the rails settle inside tolerance, the PSU raises PWR_OK (Power Good) on pin 8. Until that signal arrives the chipset refuses to release the reset line: the CPU is held in reset so it cannot start executing instructions on noisy, unsettled voltage.',
    duration: 4400,
    screen: 'off',
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
    title: 'POST — Power-On Self-Test',
    signal: 'reset vector 0xFFFFFFF0',
    description:
      'The moment reset lifts, the CPU starts executing firmware from the reset vector. UEFI first trains the memory controller, then enumerates the PCIe and NVMe devices and builds the ACPI tables it will hand over to the operating system.',
    duration: 6000,
    screen: 'post',
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
    id: 'bootloader',
    phase: 'firmware',
    title: 'Bootloader — Handover From Disk',
    signal: 'EFI System Partition',
    description:
      'The firmware loads and runs the .efi binary (GRUB or systemd-boot) from the EFI System Partition on the NVMe SSD. The bootloader draws its own menu, pulls the selected kernel image and the initramfs into RAM, then hands control to the kernel.',
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
    title: 'Kernel Init',
    signal: 'start_kernel()',
    description:
      'The kernel takes over the arrangement the firmware set up: it rebuilds the memory map, wakes the sleeping CPU cores (SMP bringup), loads driver modules and mounts the real root filesystem from inside the initramfs.',
    duration: 5000,
    screen: 'boot',
    highlight: ['cpu', 'ram', 'm2', 'pcie'],
    console: [
      '[    0.000000] Linux version 6.11.0',
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
    id: 'systemd',
    phase: 'os',
    title: 'systemd — PID 1',
    signal: 'graphical.target',
    description:
      'With the root filesystem in place, the kernel runs the first user-space process: /sbin/init, which is systemd. It resolves the dependency graph between units, brings services up in parallel wherever it can, and works its way toward graphical.target.',
    duration: 4800,
    screen: 'boot',
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
    title: 'Display Manager — The Login Screen',
    signal: 'GDM / SDDM',
    description:
      'graphical.target starts the display manager, which opens a Wayland or X session and draws the greeter. With the first frame sent to the graphics card, the chain that began when someone pressed the power button is complete.',
    duration: 5200,
    screen: 'login',
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
