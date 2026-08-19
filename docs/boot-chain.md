# Boot Anatomy — The Complete Chain

Every step the project walks through, in order: 190 of them, from a machine sitting unplugged to a login prompt waiting for a person.

The chain is flat — a section heading is a step in its own right, and the steps indented under it play in sequence like any other. Where a step corresponds to a real function or entry symbol in a real source tree, the path is given. Steps that describe a region inside a function deliberately carry none, because a line number would claim more precision than the explanation holds.

Source paths point into four trees: GRUB, coreboot, the Linux kernel (7.2.0-rc6), systemd (v262~devel) and gdm (51.beta).

## Contents

1. [PSU — Plugged In, Standby Up](#1-psu--plugged-in-standby-up) — 11 steps
12. [The Button Is Pressed](#12-the-button-is-pressed)
13. [The EC Tells the PSU to Wake Up](#13-the-ec-tells-the-psu-to-wake-up) — 9 steps
22. [The Main Rails Come Up](#22-the-main-rails-come-up) — 10 steps
32. [PWR_OK — The Voltages Are Stable](#32-pwrok--the-voltages-are-stable) — 9 steps
41. [Firmware Takes Over](#41-firmware-takes-over) — 7 steps
48. [coreboot — The Firmware Itself](#48-coreboot--the-firmware-itself) — 15 steps
63. [Bootloader — Handover From Disk](#63-bootloader--handover-from-disk) — 19 steps
82. [Kernel Init](#82-kernel-init) — 49 steps
131. [initramfs — Reaching the Real Disk](#131-initramfs--reaching-the-real-disk) — 10 steps
141. [systemd — PID 1](#141-systemd--pid-1) — 30 steps
171. [Display Manager — The Login Screen](#171-display-manager--the-login-screen) — 20 steps

---

## 1. PSU — Plugged In, Standby Up

**Standby** · `+5VSB`

As long as the machine is plugged in, a small standby converter inside the PSU keeps producing the +5VSB rail. It enters the board on pin 9 of the 24-pin connector and feeds the Super I/O / EC. The system looks "off" (ACPI S5), but the circuit listening for the power button is very much alive.

### 2. AC Input & EMI Filter

**Inside the PSU** · `230 V AC`

Mains AC arrives from the wall socket and passes straight into a filter stage built from common-mode chokes and capacitors. It stops the supply's own switching noise from leaking back out into the grid, and grid noise from getting in. Many units also put an NTC inrush limiter here, to soften the surge of current that flows while the bulk capacitors charge on the very first power-up.

### 3. Bridge Rectifier & Bulk Capacitors

**Inside the PSU** · `pulsating DC`

Four diodes fold the AC sine wave into pulsating DC — still rippling, but now always positive. That raw DC is banked in the bulk capacitors: the large cylindrical cans that dominate the inside of the unit, typically rated somewhere in the 200–450 V range.

### 4. Active Power Factor Correction

**Inside the PSU** · `≈400 V DC`

A small boost converter shapes the current waveform to follow the voltage waveform, pulling the power factor toward 1 so the current drawn from the grid is clean. It also regulates the bulk rail to a steady 380–400 V DC, which is what absorbs the difference between a 110 V and a 230 V supply — the reason modern units are universal input with no voltage selector switch.

### 5. Primary Switching Stage

**Inside the PSU** · `50–150 kHz`

This is where the "switched-mode" part actually happens. MOSFETs chop the ~400 V DC at high frequency — a half-bridge, or an LLC resonant converter in newer and more efficient designs. The DC becomes a high-frequency AC waveform purely so the transformer that follows can be small: core size scales inversely with frequency, so a tiny transformer does the job a huge 50 Hz one would otherwise need to. PS_ON# is the signal that switches this stage on.

### 6. Transformer & Galvanic Isolation

**Inside the PSU** · `isolation barrier`

The high-frequency waveform crosses a ferrite transformer that does two jobs at once. It steps the voltage down toward the levels that will become 12 V, 5 V and 3.3 V — and it galvanically isolates the output side from the mains side. Energy crosses as magnetic field, not as current: the only conductive link is a pair of deliberately tiny Y-capacitors placed there to give switching noise a path home. Without that isolation, every metal surface in the case would be sitting at mains potential.

### 7. Secondary Rectification & Filtering

**Inside the PSU** · `+12V / +5V / +3.3V`

On the far side of the barrier, Schottky diodes — or synchronous rectification using MOSFETs in higher-efficiency units — turn the low-voltage HF AC back into DC, and LC filters smooth it into clean rails. In modern designs only +12 V comes off the transformer directly; +5 V and +3.3 V are derived from it by buck converters. Older units wound all three rails separately, a design known as group regulation.

### 8. Standby Converter — Separate, Small, Always On

**Inside the PSU** · `+5VSB`

The +5VSB rail comes from a completely separate miniature copy of the whole circuit: a small flyback converter with its own transformer, its own MOSFET and its own controller. It runs the entire time the unit is plugged in, even with the PFC and main switching stage shut down. It only has to feed the board's sleep-mode logic — the EC/PCH, Wake-on-LAN, the real-time clock — so a couple of amps is plenty. This is why you can see two transformers inside a PSU: the large main one, and a tiny standby one beside it. This is the rail that keeps the EC awake in S5, listening for the power button.

### 9. Feedback Loop & Regulation

**Inside the PSU** · `optocoupler`

To hold the outputs steady, a feedback signal travels from the secondary side back to the primary through an optocoupler — critical here, because that information has to cross the isolation barrier on light rather than copper. The primary-side PWM controller trims its switching frequency or duty cycle in response, so the rails hold their voltage even when the CPU suddenly slams into a high-power state.

### 10. Supervisory IC — Where PWR_OK Comes From

**Inside the PSU** · `PWR_OK`

A separate supervisory IC watches every rail continuously and shuts the unit down the moment a threshold is crossed: OVP for overvoltage, UVP for undervoltage, OCP for overcurrent, OTP for overtemperature, SCP for a short circuit. That same chip produces PWR_OK, raising it only once every rail has passed its checks and settled. This is the signal the chipset waits for before releasing the CPU from reset.

### 11. Output Connectors

**Inside the PSU** · `to the motherboard`

The regulated rails fan out to the 24-pin main connector and the auxiliary ones: EPS 4/8-pin for the CPU, PCIe 6/8-pin for the graphics card, plus SATA and Molex. In high-power systems the CPU and GPU get their own dedicated +12 V runs, because carrying that much current through the 24-pin connector alone is not practical.

---

## 12. The Button Is Pressed

**Power Chain** · `PWRBTN#`

The button on the case switches no power at all; it is just a spring-loaded contact that briefly ties the PWRBTN# line on the F_PANEL header to ground. That falling edge reaches the Super I/O / EC, which is still awake on +5VSB, as an interrupt.

```
[EC] PWRBTN# asserted (active low)
[EC] debounce 32ms ... ok
```

---

## 13. The EC Tells the PSU to Wake Up

**Power Chain** · `PS_ON#`

Following the ACPI rules, the EC accepts the press as valid and pulls the green PS_ON# line on pin 16 of the 24-pin connector LOW. It is an active-low signal: grounding the line is what starts the PSU's main switching converter.

```
[EC] S5 -> S0 transition requested
[EC] PS_ON# -> LOW
```

### 14. Standby Power Is Live

**Power Chain** · `+5VSB`

While the PSU is plugged in, the +5VSB (and on many boards +3.3VSB) rail feeds the EC without interruption. The EC is never off — it is running firmware, holding state and watching pins the entire time the machine appears dead.

### 15. The Button Is Pressed

**Power Chain** · `PWRBTN#`

The momentary switch on the case briefly shorts two wires together. That closure reaches the board through the front panel header — it carries no power, only the fact that someone touched it.

### 16. GPIO Interrupt Fires

**Power Chain** · `IRQ`

The GPIO pin the switch is wired to is configured as an interrupt source. The edge raises a hardware interrupt rather than requiring the firmware to poll — which is what lets the EC sit in a low-power loop and still react instantly.

### 17. Debounce

**Power Chain** · `10–50 ms`

Mechanical contacts bounce: for a few milliseconds after they touch, they open and close repeatedly. Taken at face value that would read as several presses. The firmware waits a short window and re-reads the pin, accepting the press only if it is still held.

### 18. Press Duration Is Measured

**Power Chain** · `short / long`

A short press (under about four seconds) is a request, passed up to the operating system to handle politely. A press held past four seconds is the hardware override — the EC cuts power itself without asking anyone, which is why it still works when the OS has hung.

### 19. Current ACPI State Is Checked

**Power Chain** · `S0 / S3 / S5`

The same button means different things depending on where the system is. From S5 it means power on; from S0 it means signal the OS to shut down; from S3 it means wake. The EC keeps that state itself, and reports it to the OS over the ACPI operation region once there is an OS to talk to.

### 20. The Firmware Decides

**Power Chain** · `EC firmware`

The logic making this call lives in the EC's own SPI flash — a separate chip from the one holding UEFI, updated separately, running its own code out of its own SRAM. From S5 with a valid short press, the decision is to assert PS_ON#.

### 21. PS_ON# Is Pulled Low

**Power Chain** · `PS_ON# → LOW`

The EC drives the PS_ON# line — idling at 3.3–5 V through a pull-up on the PSU side — down to ground. On many designs it does this through the PCH rather than directly. Grounding that one pin on the 24-pin connector is the entire request: it starts the main switching converter, and everything else follows. From here the PSU takes over — this is exactly where the "EC tells the PSU to wake up" step of the boot chain hands off.

---

## 22. The Main Rails Come Up

**Power Chain** · `+12V / +5V / +3.3V`

The PSU's main converter kicks in and three rails spread across the board. +12V travels through the EPS connector to the VRM, which switches it down to the ~1V core voltage (Vcore) the CPU needs. +3.3V and +5V feed consumers such as the RAM, the chipset and the M.2 drive.

```
[PSU] main converter ON
[PSU] +12V  ramp ... 11.98V
[PSU] +5V   ramp ... 5.02V
[PSU] +3.3V ramp ... 3.31V
```

### 23. The Comparator Sees It

**Power Chain** · `PS_ON# → LOW`

A small comparator circuit inside the supply watches the PS_ON# pin continuously. It runs on standby power, which is the only reason it can watch anything while the main converter is dead. When the line falls below its threshold, it produces an enable signal.

### 24. The PFC and PWM Controllers Wake

**Power Chain** · `enable`

Until this moment both controllers were entirely off — not idling, off. Only the standby circuit was running. The enable signal starts them, and from here the supply begins consuming real power from the wall.

### 25. Soft-Start

**Power Chain** · `duty cycle ramp`

The PWM controller does not begin at full duty cycle. It ramps the duty cycle up from zero over a few milliseconds. The reasoning is the same as the NTC limiter on the AC side: a sudden surge of energy would stress the MOSFETs, the transformer and the output capacitors all at once. Ramping spreads that stress out.

### 26. PFC Brings the Bulk Rail to Target

**Power Chain** · `~300 V → 390 V`

The rectifier alone leaves roughly 300 V on the bulk capacitors. The PFC stage boosts that to its regulated target of 380–400 V and holds it there. The main switching stage needs a stable input before its output can mean anything.

### 27. Switching Starts, the Transformer Energises

**Power Chain** · `rise time`

The MOSFETs begin switching, a high-frequency square wave appears across the transformer primary, and the secondary side rectifies and filters what comes through. The output rails start climbing from zero — over a few milliseconds to a few tens of milliseconds, not instantly.

### 28. The Feedback Loop Takes Hold

**Power Chain** · `rising → held`

As the rails approach their targets, the feedback path through the optocoupler becomes active and the controller starts trimming duty cycle to hold them there. The rails stop merely rising and start being regulated — those are two different states, and only the second one is usable.

### 29. The Supervisor Compares Every Rail

**Power Chain** · `typically ±5%`

Now the supervisory IC has something to judge. It checks each rail against its own tolerance window, usually ±5%. It is not looking for "the rails exist" — it is looking for "the rails are at the right level", which is a stricter question and the one that matters.

### 30. The Deliberate Delay

**Power Chain** · `100–500 ms`

Even once every rail is inside tolerance, the supervisor waits longer — typically 100 to 500 ms per the ATX specification. This margin exists so a transient oscillation that happens to look stable for an instant cannot be mistaken for a settled rail. The delay is not sloppiness; it is the whole point.

### 31. PWR_OK Rises

**Power Chain** · `PWR_OK → HIGH`

The wait expires and the supervisory IC finally drives PWR_OK to the motherboard. This is the approval the board has been sitting on: it is what permits the chipset to release the CPU from reset. Everything from step 1 to here happens in milliseconds — but nothing about it is instant, and the boot chain cannot move until it finishes.

---

## 32. PWR_OK — The Voltages Are Stable

**Power Chain** · `PWR_OK`

Between 100 and 500 ms after the rails settle inside tolerance, the PSU raises PWR_OK (Power Good) on pin 8. Until that signal arrives the chipset refuses to release the reset line: the CPU is held in reset so it cannot start executing instructions on noisy, unsettled voltage.

```
[PSU] PWR_OK -> HIGH (after 214ms)
[PCH] deasserting CPU RESET#
```

### 33. PWR_OK Reaches the PCH

**Power Chain** · `PWR_OK`

With PWR_OK asserted the PSU's job is finished and the board takes over. The signal usually goes straight to the PCH, though on many designs it passes through the EC first. Either way it becomes an input to the chipset's own power state machine — and from here there is no longer one source of power but dozens of separate rails.

### 34. Why a VRM Exists

**Power Chain** · `12 V → ~1 V`

The +12V arriving from the PSU is nowhere near what a CPU core runs on — that is typically 0.8 V to 1.4 V, the voltage called Vcore. Bridging that gap is the VRM: fundamentally the same buck converter the PSU uses to derive +5V and +3.3V, just far larger and far more aggressive.

### 35. Multi-Phase — Splitting 200 Amps

**Power Chain** · `6–20 phases`

A high-end CPU can pull more than 200 A. No single buck converter handles that, so the VRM runs 6 to 20 phases in parallel, each with its own inductor and MOSFET pair, switching slightly out of step with the others. Splitting the load spreads the heat and, just as importantly, lets the VRM react far faster to a sudden change in demand.

### 36. Not One Voltage, Several

**Power Chain** · `Vcore · VCCSA · VCCIO · VDDQ`

The CPU does not take a single supply. Vcore feeds the cores, VCCSA the system agent, VCCIO the I/O ring, VDDQ the memory interface and the DIMMs. Each is a separate regulator with its own target voltage, and each has to be brought up on its own.

### 37. Order Matters — Latch-Up

**Power Chain** · `sequencing`

The order these rails come up in, and the delays between them, are specified exactly in the CPU vendor's datasheet. Getting it wrong is not a performance problem: if the I/O voltage arrives outside its permitted margin relative to the core voltage, parasitic structures inside the silicon can trigger latch-up — a self-sustaining short that permanently destroys the chip.

### 38. Every Rail Reports Back

**Power Chain** · `PWRGD`

Exactly as the PSU produced one PWR_OK for itself, each regulator produces its own PWRGD once its output has reached target and settled. These are separate signals from separate chips, saying separate things — this rail is ready, that one is ready.

### 39. All-Good, Gated

**Power Chain** · `aggregated`

The individual PWRGD lines are combined — through a logic gate on some boards, inside the sequencer on others — into a single verdict. Nothing moves until every one of them agrees. It is the same pattern the PSU used one level down, applied again at board level.

### 40. CPU RESET# Is Released

**Power Chain** · `RESET# → HIGH`

With the verdict in, the sequencer or the PCH takes the last step and releases the CPU's RESET# pin. Active low again: holding it down meant "stay in reset", so letting it rise is the release. The moment it goes high the CPU is electrically ready — it finishes its internal reset sequence and fetches its first instruction.

---

## 41. Firmware Takes Over

**Firmware** · `reset vector 0xFFFFFFF0`

The moment reset lifts, the CPU starts executing firmware from the reset vector. UEFI first trains the memory controller, then enumerates the PCIe and NVMe devices and builds the ACPI tables it will hand over to the operating system.

```
UEFI firmware v2.90 (x64)
CPU: 8 cores / 16 threads @ 3.80GHz
Memory training ......... 32768 MB OK
NVMe0: Samsung SSD 990 PRO 1TB
PCIe: 1 device(s) enumerated
ACPI tables published
```

### 42. The Reset Tree Unwinds

**Firmware** · `PLL lock`

RESET# going high does not switch the die on all at once. Separate reset trees serve separate clock domains — core, uncore, the ring or mesh interconnect, the memory controller — and they are released in a defined order. Release them together and a region whose PLL has not locked yet would clock its flip-flops from an unstable signal, risking metastability: a flip-flop that cannot decide whether it holds a 0 or a 1. So the reset logic waits for each PLL to raise its lock flag first.

```
[CPU] RESET# deasserted
[CPU] PLL core   ... lock
[CPU] PLL uncore ... lock
[CPU] reset domains released in order
```

### 43. Architectural Reset State

**Firmware** · `CS:IP → 0xFFFFFFF0`

The silicon now forces a fixed register state with no software involved. CR0.PE is 0, so the CPU starts in real mode; CR0.PG is 0, so paging is off and every address is physical. EFLAGS is cleared, interrupts disabled. CS is F000h — but its hidden base is not the usual selector×16. It is forced to FFFF0000h, an exception unique to reset that no instruction can reproduce later. With IP at FFF0h the first fetch lands at 0xFFFFFFF0, sixteen bytes below the top of the address space. Unchanged since the 8086 in 1978.

```
CR0.PE   = 0        (real mode)
CR0.PG   = 0        (paging off)
EFLAGS   = 00000002h
CS       = F000h
CS.base  = FFFF0000h  <- reset-only
IP       = FFF0h
=> first fetch @ 0xFFFFFFF0
```

### 44. BSP / AP Arbitration

**Firmware** · `wait-for-SIPI`

The cores do not all head for the reset vector — that would be chaos. Very early in the reset microflow a hardware arbitration picks one, typically the lowest Local APIC ID, and marks it the Bootstrap Processor in the IA32_APIC_BASE MSR. The losing cores, the Application Processors, never fetch anything: microcode parks them in wait-for-SIPI, completely idle, until the BSP wakes them much later with an INIT-SIPI-SIPI sequence. So the earliest firmware code runs single-threaded, even on a sixteen-core part.

```
[CPU] APIC ID 0 -> BSP
[CPU] APIC ID 1..15 -> wait-for-SIPI
[CPU] 1 of 16 threads running
```

### 45. The Microcode Update Loads

**Firmware** · `FIT · RSA · patch RAM`

Complex x86 instructions are not fixed gate logic; they run through an interpreter layer called microcode. The factory version is burned into ROM, but the vendor expects a patch on top of it. The CPU reads the FIT table at a fixed offset in the flash to find the update, matches its CPUID signature and platform ID against the running part, then verifies an RSA signature against a public key embedded in the silicon. Only then is it loaded into patch RAM. This is precisely why Spectre and Meltdown could be mitigated by a "BIOS update".

```
[FIT] microcode entry @ 0xFFFFFC00
[UCODE] CPUID sig 000906EA  match
[UCODE] platform ID 0x22    match
[UCODE] RSA-2048 signature  verified
[UCODE] rev 0x00 -> 0xF4    patch RAM loaded
```

### 46. Verified Boot Pre-Check — Boot Guard / PSP

**Firmware** · `platform dependent`

On many modern platforms nothing at the reset vector is trusted until a hardware root of trust has checked it. Intel Boot Guard has the CPU load a signed ACM into isolated on-die SRAM — usable long before DRAM exists — and verify it against a key hash fused into the part at the factory; the ACM then verifies the firmware that follows. AMD does the equivalent from a separate ARM-based PSP that runs before the x86 cores are fully out of reset. Whether this step happens at all depends on the board's fuse configuration.

```
[ACM] loading into on-die SRAM
[ACM] key hash vs fused OEM key  match
[ACM] measuring IBB (bootblock)
[ACM] verdict: verified — continue
```

### 47. The First Fetch — Out to Flash

**Firmware** · `0xFFFFFFF0`

The BSP finally issues a real read at 0xFFFFFFF0. Nothing is cached yet, so the request leaves the CPU over DMI and reaches the PCH, whose address decoder has a hardwired rule: the very top of the address space is mapped to the SPI flash regardless of any runtime configuration, so the reset vector is always reachable. The PCH turns the request into an actual SPI read command, clocks the answer back bit by bit, and presents it to the CPU as if it came from memory. It is far slower than DRAM, which is why the code at that address is a handful of bytes — just a jump.

```
[BSP] fetch 0xFFFFFFF0 ... cache miss
[DMI] request -> PCH
[PCH] top-of-memory window -> SPI
[SPI] read cmd 0x03 @ 0x7FFFF0
[BSP] EA 5B E0 00 F0   jmp far
```

---

## 48. coreboot — The Firmware Itself

**Firmware** · `_start → payload`

The firmware at the reset vector on this machine is coreboot rather than a vendor UEFI. It runs in stages sized to the memory that exists at the time: a bootblock with no RAM at all, a romstage that trains the DRAM, and a ramstage that brings up every device and builds the ACPI tables. Its last act is to jump to a payload — here, GRUB.

```
coreboot-4.22 bootblock starting...
CBFS: found "fallback/romstage"
FSP-M: memory training ... ok
BS_WRITE_TABLES: ACPI, SMBIOS
Jumping to boot code at 0x00100000
```

### 49. _start — The 16 Bytes at the Top

**Firmware** · `entry16.S:158`

The linker script places _start at exactly 0xFFFFFFF0, which is where the CPU is already pointing. There are only sixteen bytes left before the address space ends, so this code does one thing: a far jump to the real bootblock. The reset vector is not a door, it is a signpost.

```
0xFFFFFFF0: jmp _start16bit
[coreboot] bootblock entry
```

### 50. _start16bit — Into Protected Mode

**Firmware** · `entry16.S:42`

Still in 16-bit real mode. First cli, because there is no valid IDT yet and an interrupt now would be fatal. The BIST result the CPU left in EAX is stashed for later diagnostics, the TLB is flushed in case anything survived an S3 resume, and a minimal flat GDT is loaded. Then one bit — CR0.PE — flips the CPU into protected mode.

```
cli
BIST result = 0x00000000  (passed)
invlpg / TLB flushed
lgdt  -> flat GDT
CR0.PE = 1  -> protected mode
```

### 51. bootblock_protected_mode_entry

**Firmware** · `entry32.S:29`

Now 32-bit. DS, ES, SS, FS and GS are all pointed at flat segments, making segmentation a formality. CR4 gets its SSE bits set — not for performance but for survival: GCC emits SSE instructions inside things like memcpy, and without OSFXSR that code would fault on an invalid opcode. The TSC is read for the first timestamp, the one that answers "when did the bootblock start".

```
ds/es/ss/fs/gs -> flat
CR4.OSFXSR = 1  (SSE enabled)
timestamp: 1  bootblock start
```

### 52. Cache-as-RAM — Memory Before Memory

**Firmware** · `SOC_CAR_INIT_DONE`

C code needs a stack, and DRAM does not exist yet. So the CPU turns its own cache into RAM. The MTRRs are cleared of anything left over, a region is marked write-back cacheable, and the cache is put into no-eviction mode so nothing can ever be flushed out to a memory that is not there. ESP is set inside that region — and from this instant, C functions can be called.

```
POST 0x21  SOC_SET_UP_CAR_MTRRS
MTRR: CAR region write-back
cache: no-eviction mode
esp -> CAR  (stack ready)
POST 0x22  SOC_CAR_INIT_DONE
```

### 53. bootblock_c_entry — First C Function

**Firmware** · `assembly → C`

With a stack in place, assembly finally calls into C. The UART is brought up first so there is somewhere to print before CBMEM console exists, and the SPI controller is initialised because the next step has to read from flash. Everything here stays deliberately small — CAR is only a few tens of kilobytes.

```
coreboot-4.22 bootblock starting...
UART 0x3f8 initialised @ 115200
SPI controller ready
```

### 54. run_romstage() — Loading From CBFS

**Firmware** · `prog_loaders.c:18`

CBFS is coreboot's filesystem on the flash: a simple index that finds a named blob and hands it back. romstage is located, decompressed with LZMA if it was stored compressed, and executed through prog_run(). On some platforms romstage is linked into the bootblock instead and simply called.

```
CBFS: found "fallback/romstage"
CBFS: decompressing LZMA 48 KiB
Jumping to romstage.
```

### 55. romstage_main() — RAM Training

**Firmware** · `MEM_PREINIT_PREP`

The big one. SPD data is read from each DIMM over SMBus, the memory controller is configured, and write, read and command training run until the timings actually work at speed — usually inside an FSP-M or AGESA blob. At the end of this step the machine has real, usable DRAM for the first time in its life.

```
POST 0x34  MEM_PREINIT_PREP_START
SPD: DIMM0 8192 MB DDR4-3200
SPD: DIMM1 8192 MB DDR4-3200
FSP-M: write leveling ... ok
FSP-M: read training  ... ok
POST 0x36  MEM_PREINIT_PREP_END
```

### 56. run_ramstage() — Moving Into DRAM

**Firmware** · `RAMSTAGE_IS_PREPARED`

The delicate moment. The stack living in cache has to be migrated to a real stack in DRAM, and only then can CAR be torn down and the cache returned to behaving like a cache. Ramstage — larger than romstage, usually LZMA compressed in CBFS — is loaded into that new DRAM and run.

```
POST 0x4a  PREPARE_RAMSTAGE
stack migrated CAR -> DRAM
CAR torn down, cache back to normal
CBFS: found "fallback/ramstage"
POST 0x4b  RAMSTAGE_IS_PREPARED
```

### 57. main() — Ramstage Begins

**Firmware** · `hardwaremain.c:426`

console_init() brings up the full logging system, CBMEM console included — on a cold boot CBMEM is created from scratch, on an S3 resume the previous session's contents are validated and reused. boot_state_schedule_static_entries() then registers which functions run at which stage of the state machine that follows.

```
POST 0x80  CONSOLE_READY
CBMEM: created @ 0x7fffe000
POST 0x6f  ENTRY_HARDWAREMAIN
```

### 58. bs_walk_state_machine() — Bringing Up Devices

**Firmware** · `BS_DEV_*`

The backbone of hardware initialisation, walked one state at a time: chip-specific early init, then PCI enumeration discovering what is actually plugged in, then resources assigned to each device, then enable, then each device's own init. BS_WRITE_TABLES finally builds the ACPI, SMBIOS and coreboot tables in RAM — the data structures the payload and the OS will read to understand this machine.

```
POST 0x71  BS_DEV_ENUMERATE
PCI: 00:02.0 VGA compatible controller
PCI: 02:00.0 Non-Volatile memory controller
POST 0x72  BS_DEV_RESOURCES
POST 0x74  BS_DEV_INIT
POST 0x76  BS_WRITE_TABLES
ACPI: DSDT, FADT, MADT written
```

### 59. bs_payload_load — Fetching GRUB

**Firmware** · `BS_PAYLOAD_LOAD`

payload_load() finds the payload in CBFS and reads it into memory, decompressing if needed. On this machine that payload is GRUB — coreboot itself has no interest in filesystems or kernels, it just needs something to hand control to.

```
POST 0x77  BS_PAYLOAD_LOAD
CBFS: found "fallback/payload"
Loading segment 0x00100000 (412 KiB)
```

### 60. payload_run() — The Last Instruction

**Firmware** · `prog_loaders.c:188`

boot_successful() records that the machine got this far, which on some platforms clears a failed-boot counter feeding the fallback and recovery logic. Then prog_run() jumps to the payload entry point. This is coreboot's final instruction: not a call, a jump. There is no return.

```
POST 0x78  BS_PAYLOAD_BOOT
boot_successful()
Jumping to boot code at 0x00100000
```

### 61. grub_main() — No Longer coreboot

**Firmware** · `kern/main.c`

Control belongs entirely to GRUB now. coreboot's POST code system goes quiet and GRUB starts printing through its own console. coreboot's job is finished — kernel selection, initramfs loading and the handoff to Linux are all somebody else's problem from here.

```
Welcome to GRUB!
grub_main(): console handed over
```

### 62. SMM — The Part That Never Leaves

**Firmware** · `SMI → SMRAM`

One thing coreboot leaves behind. During ramstage it installed handlers into SMRAM, a region hidden from the operating system, running in System Management Mode — a privilege level above ring 0 that neither GRUB nor Linux can see or intercept. Certain hardware events raise an SMI: the CPU saves its entire state, runs coreboot's handler, and returns with RSM as if nothing happened.

```
SMM: installing handler into SMRAM
SMI sources: PWRBTN, thermal, legacy USB
-- later, while Linux runs --
SMI# -> state saved -> handler -> RSM
```

---

## 63. Bootloader — Handover From Disk

**Firmware** · `EFI System Partition`

The firmware loads and runs the .efi binary (GRUB or systemd-boot) from the EFI System Partition on the NVMe SSD. The bootloader draws its own menu, pulls the selected kernel image and the initramfs into RAM, then hands control to the kernel.

```
EFI stub: loading \EFI\BOOT\BOOTX64.EFI
GRUB 2.12 — booting entry "Linux"
Loading vmlinuz-6.11.0 ...
Loading initramfs-6.11.0.img ...
```

### 64. _start — Multiboot Handshake

**Operating System** · `startup.S` · `grub-core/kern/i386/coreboot/startup.S:37`

coreboot's jump lands here. GRUB's first act is to check the Multiboot magic number — the standard handshake between a firmware and a payload — confirming it really was started in an environment it understands. Then it builds its own stack: coreboot's is no longer valid, and GRUB needs ground of its own to stand on.

```
Multiboot magic 0x2BADB002  ok
GRUB stack established
```

### 65. grub_main() — GRUB in C

**Operating System** · `kern/main.c` · `grub-core/kern/main.c:304`

The real entry point of GRUB's C world. From here it proceeds entirely on its own architecture, owing nothing further to coreboot's structure.

```
grub_main() entered
```

### 66. grub_machine_init()

**Operating System** · `platform bring-up` · `grub-core/kern/i386/coreboot/init.c:94`

Platform-specific setup for the coreboot target: the VGA or framebuffer console so a menu can be drawn at all, a heap so GRUB has dynamic memory of its own, and the TSC for timing.

```
video: framebuffer 1920x1080x32
heap initialised
TSC calibrated
```

### 67. Reading the coreboot Table

**Operating System** · `cbtable.c` · `grub-core/kern/i386/coreboot/cbtable.c:29`

Back in ramstage, BS_WRITE_TABLES left a coreboot table in memory holding everything the firmware had learned — the memory map, where the CBMEM console lives, board identity. GRUB scans memory, finds it and reads it, inheriting all of that rather than rediscovering the hardware itself.

```
coreboot table found @ 0x00000500
CB_TAG_MEMORY: 5 ranges
CB_TAG_CBMEM_CONSOLE inherited
```

### 68. grub.cfg — The Menu Runs

**Operating System** · `normal mode` · `grub-core/kern/main.c:233`

grub.cfg is read and normal mode starts. From here GRUB is simply executing the commands you wrote — linux, initrd, boot — one after another.

```
loading grub.cfg
menuentry "Linux" selected
```

### 69. linux /vmlinuz — Opening the bzImage

**Operating System** · `grub_cmd_linux()` · `grub-core/loader/i386/linux.c:675`

The kernel file is opened and its header read. That header carries everything a bootloader needs to know about the kernel it is about to place: sizes, version, which features it supports.

```
open (hd0,gpt2)/vmlinuz-6.11.0
reading setup header (0x1f1)
```

### 70. Validation — Four Checks

**Operating System** · `"HdrS" · 0xaa55`

boot_flag must be 0xaa55, the ancient MBR boot-sector signature the bzImage format still carries because it descends from it. The "HdrS" magic confirms this really is a Linux kernel. The protocol version must be at least 0x0203 so the fields GRUB intends to use are understood on the other side. And BIG_KERNEL says the image is too large for the old low-memory path, so the modern protected-mode route is required.

```
boot_flag   = 0xaa55     ok
header      = "HdrS"     ok
version     = 0x020f     >= 0x0203
loadflags   = BIG_KERNEL
```

### 71. Sizes and Relocatability

**Operating System** · `real_size · prot_size`

real_size is the small 16-bit setup stub at the front of the image; prot_size is the actual compressed kernel that will be loaded in protected mode. The header also declares whether the kernel is relocatable and what alignment it demands — the flexibility that KASLR is built on.

```
real_size   = 0x4000   (16 KiB setup)
prot_size   = 0xb42000 (11.2 MiB)
relocatable = 1, align = 0x200000
```

### 72. allocate_pages() — The Relocator

**Operating System** · `grub_relocator_new` · `grub-core/loader/i386/linux.c:148`

GRUB's relocator is asked for memory at a preferred address. If the map says that region is taken or absent, it relaxes the alignment constraint step by step and tries again — which is what lets the same bootloader place a kernel across wildly different memory layouts.

```
relocator: request 0x1000000 @ align 0x200000
relocator: granted prot_mode_target = 0x1000000
```

### 73. code32_start — Fixing the Address

**Operating System** · `relocation offset`

The header is copied into GRUB's linux_params, and the kernel's real entry address is computed: prot_mode_target + lh.code32_start - BZIMAGE_ADDR. That subtraction is the whole trick — it corrects for the difference between where the kernel was linked to run and where GRUB actually put it.

```
lh.code32_start  = 0x00100000
prot_mode_target = 0x01000000
code32_start     = 0x01000000
```

### 74. Reading the Kernel Into Memory

**Operating System** · `prot_file_size`

The boot sector and setup code at the front of the file are seeked past — GRUB has no use for them, it is doing the loading itself. The compressed kernel behind them is read straight into the region just reserved.

```
seek 0x4000
read 11.2 MiB -> 0x01000000
```

### 75. initrd — Loaded High on Purpose

**Operating System** · `PREFERENCE_HIGH` · `grub-core/loader/i386/linux.c:1065`

The header declares initrd_addr_max, the highest physical address at which the kernel can still find a ramdisk. GRUB asks the relocator for memory with a HIGH preference, deliberately placing the initrd as high as it can — clear of the space the kernel will need as it decompresses downward. Then ramdisk_image and ramdisk_size go into the header, which is exactly where the kernel will look.

```
initrd_addr_max = 0x7fffffff
relocator HIGH -> 0x7d200000
read initrd 42 MiB
hdr.ramdisk_image = 0x7d200000
```

### 76. boot — screen_info Handover

**Operating System** · `grub_linux_boot()` · `grub-core/loader/i386/linux.c:418`

The handover proper begins. screen_info is filled in with the current video mode — resolution, framebuffer address — so the kernel can carry on drawing where GRUB left off instead of blanking the display.

```
screen_info: 1920x1080x32 @ 0xc0000000
```

### 77. The Zero Page

**Operating System** · `boot_params`

Zero page is a historical name: in the old protocol this structure sat at physical address 0. It no longer does, but the name stuck. It is the main handover structure — header plus hardware information. A free region is found, and linux_params and the kernel command line (root=, console=, all of it) are copied there.

```
real_mode_target = 0x00090000
copy linux_params (4 KiB)
cmdline: root=/dev/nvme0n1p2 rw quiet
```

### 78. The E820 Memory Map

**Operating System** · `e820_entries`

E820 is the standard map the firmware hands the operating system: which physical ranges are usable RAM, which are reserved, which hold ACPI data. Without it the kernel would have no idea which memory it may safely touch — and writing into a range that belongs to hardware takes the machine down. GRUB fills it in from what coreboot told it.

```
e820: 0x000000000-0x00009fbff usable
e820: 0x000100000-0x07f5fffff usable
e820: 0x07f600000-0x07f7fffff ACPI data
e820: 0x0fed00000-0x0fed00fff reserved
e820_entries = 9
```

### 79. The Registers the Kernel Demands

**Operating System** · `esi = boot_params`

Linux's 32-bit entry protocol does not merely suggest a register state, it requires one. esi must hold real_mode_target — the address of boot_params — because that register is the only way the kernel learns where its configuration lives. eip is code32_start, the address computed earlier.

```
esi = 0x00090000  (boot_params)
eip = 0x01000000  (code32_start)
```

### 80. relocator32.S — Back to a Clean Machine

**Operating System** · `GDT · paging off` · `grub-core/lib/i386/relocator32.S:29`

A fresh GDT is loaded so the kernel starts from known segment definitions rather than whatever GRUB happened to be using. Then paging, PAE and long mode are all switched off: the 32-bit entry protocol expects a clean, flat, unpaged protected mode, so GRUB deliberately unwinds everything it had turned on.

```
lgdt   -> clean GDT
CR0.PG = 0
CR4.PAE = 0
EFER.LME = 0
```

### 81. 0xEA — GRUB’s Last Instruction

**Operating System** · `far jump` · `grub-core/lib/i386/relocator32.S`

Every register is loaded with the value the kernel expects, and then a raw 0xEA far jump throws the CPU at code32_start with nothing in between. This is GRUB's final instruction — one-way, exactly like coreboot's jump into GRUB was.

```
0xEA  jmp far 0x01000000
-- GRUB is done --
```

---

## 82. Kernel Init

**Operating System** · `start_kernel()`

The kernel takes over the arrangement the firmware set up: it rebuilds the memory map, wakes the sleeping CPU cores (SMP bringup), loads driver modules and mounts the real root filesystem from inside the initramfs.

```
[    0.000000] Linux version 7.2.0-rc6
[    0.412]  smp: Brought up 1 node, 16 CPUs
[    0.884]  nvme nvme0: 8/0/0 default/read/poll queues
[    1.201]  EXT4-fs (nvme0n1p2): mounted filesystem
[    1.318]  Freeing unused kernel image memory
```

### 83. startup_32 — Where GRUB Let Go

**Operating System** · `startup_32` · `arch/x86/boot/compressed/head_64.S:82`

GRUB's far jump lands here, and nothing of GRUB survives it. What arrives is not the kernel yet — it is a small program whose entire job is to unpack the kernel, wedged into the front of the same file. The CPU is in 32-bit mode with memory translation switched off, exactly as the boot protocol demanded, and %esi holds the address of the table GRUB filled in. That table is now the only thing the kernel knows about the machine.

```
jmp 0x100000  (code32_start)
esi = 0x0009c000  boot_params
```

### 84. Finding Out Where It Is

**Operating System** · `call 1f / pop %ebp`

This code has a problem most programs never face: it does not know its own address. GRUB was free to load it anywhere, so any address baked in at compile time would be wrong. The trick is three instructions long — call the very next line, then pop the return address off the stack. The CPU pushed the true running address, so the code has just asked the processor where it is. Everything from here uses offsets from that answer.

```
runtime base resolved
```

### 85. verify_cpu — Can This Chip Even Run It?

**Operating System** · `verify_cpu` · `arch/x86/kernel/verify_cpu.S:38`

Before unpacking a 64-bit kernel onto a processor, it is worth asking whether the processor is 64-bit. This routine interrogates the CPU about its own capabilities and checks for long mode, the 64-bit operating mode of x86. A failure here is not a crash but a printed message and a halt — a wrong-kernel-for-this-machine mistake is common enough that telling the user plainly beats faulting three steps later with nothing on screen.

```
CPUID: long mode  present
verify_cpu  ok
```

### 86. Is the Memory Encrypted?

**Operating System** · `sev_enable / early_tdx_detect`

On some server processors the memory controller encrypts everything written to DRAM, so that a machine's owner cannot read what a tenant is running. If that is switched on, it changes the meaning of every physical address the next steps will use, so it has to be settled before a single page table is built. AMD calls it SEV and Intel calls it TDX; both are asked here, and on an ordinary desktop both answer no.

```
SEV: not active
TDX: not detected
```

### 87. Switching On 64-bit Mode

**Operating System** · `lret → long mode`

A processor cannot enter 64-bit mode without address translation already running, and address translation needs tables in memory describing it. So this code builds a deliberately crude set: a page table that maps each address straight to itself. Nothing is hidden or moved — the map is the identity — but it exists, which is all the CPU requires. With it loaded, one instruction flips the machine into long mode.

```
identity mapping built  0-4 GiB
CR0.PG = 1
entering long mode
```

### 88. startup_64 — Four Levels or Five

**Operating System** · `configure_5level_paging()` · `arch/x86/boot/compressed/head_64.S:278`

Now running as a 64-bit program, the unpacker settles one structural question. The tables that translate addresses are a tree, and that tree is either four or five levels deep — five reaches far more memory but costs an extra lookup on every miss. Since the depth is baked into every table built afterwards, it cannot be revisited later. It is decided here, once, and the rest of the boot inherits it.

```
paging: 4-level (57-bit VA not enabled)
```

### 89. extract_kernel() — Checking GRUB's Homework

**Operating System** · `extract_kernel()` · `arch/x86/boot/compressed/misc.c:407`

The first C function in the whole sequence, and its first act is distrust. The table GRUB filled in — the zero page, a fixed 4 KB layout holding the memory map, the command line and the video mode — is scrubbed: fields that older bootloaders left as garbage are zeroed. The kernel is about to make every decision based on this table, so anything not explicitly written by a bootloader it trusts is treated as noise.

```
early console in extract_kernel
boot_params sanitized
```

### 90. choose_random_location() — Rolling the Dice

**Operating System** · `choose_random_location()` · `arch/x86/boot/compressed/kaslr.c:862`

An attacker who knows exactly where a kernel function sits in memory has most of an exploit already. So the kernel refuses to be predictable: it picks a random address to unpack itself to, drawn from whatever entropy the machine can offer this early — the timestamp counter, the RDRAND instruction if present. This is KASLR, and it is why two boots of the same machine put the same function at different addresses.

```
KASLR using RDRAND
Physical randomization: 0x2f800000
```

### 91. decompress_kernel() — Unpacking

**Operating System** · `decompress_kernel()` · `arch/x86/boot/compressed/misc.c:344`

A kernel is roughly 40 MB of code shipped as a 12 MB file, because reading less from a slow disk is worth spending CPU cycles to expand. This is where the file pays that back. Which algorithm runs was fixed when the kernel was built — gzip, zstd, lzo and others are all supported — and the unpacker simply calls whichever one was compiled in, writing the result to the address the previous step picked.

```
Decompressing Linux... 
Parsing ELF... done.
```

### 92. parse_elf() — Laying Out the Sections

**Operating System** · `parse_elf()` · `arch/x86/boot/compressed/misc.c:281`

What came out of the decompressor is an ELF file — the standard container that says which bytes are code, which are data, and where each belongs. This step reads that header and copies each section to its proper address. Then it fixes the addresses inside the code itself: because the random offset moved everything, every hard-coded pointer in the kernel is wrong by exactly that amount, and each one has to be adjusted before a single instruction runs.

```
relocations applied
Booting the kernel (entry_offset: 0x0).
```

### 93. startup_64 — The Kernel's First Instruction

**Operating System** · `startup_64` · `arch/x86/kernel/head_64.S:38`

Everything up to now was scaffolding — a helper program that unpacked a file and then jumped out of the way. This is the kernel itself, the first instruction of the thing that will still be running when the machine shuts down years from now. It inherits a 64-bit processor, a crude identity map, and the same zero page GRUB wrote. It owns nothing else yet.

```
vmlinux entry: startup_64
```

### 94. Its Own Tables, Not the Bootloader's

**Operating System** · `setup_gdt_idt`

Two tables tell an x86 processor how to behave: one describing memory regions and privilege, one listing what to run when something interrupts. Both currently belong to GRUB — sitting in memory the kernel is about to reuse for something else. So the kernel builds its own copies and points the CPU at them. It is not that GRUB's were wrong; it is that they are about to be overwritten.

```
GDT reloaded
early IDT installed
```

### 95. Page Tables It Intends to Keep

**Operating System** · `__startup_64()`

The identity map from the decompressor was a means to an end — enough to turn on 64-bit mode, nothing more. Here the kernel lays the first tables it actually intends to live in, including the mapping that puts kernel code in the upper half of every address space. That upper-half placement is why the kernel stays reachable from inside every process later, without a single table switch.

```
kernel mapped at 0xffffffff81000000
```

### 96. common_startup_64 — Shared Ground

**Operating System** · `common_startup_64` · `arch/x86/kernel/head_64.S:198`

This label exists because two very different arrivals need identical treatment. The boot processor reaches it now; every other core on the chip will reach it much later, when it is woken during SMP bringup. Both need the same control registers set, the same page tables loaded, the same stack discipline — so the code is written once and both paths converge here.

```
CR4 = 0x000406f0
cr3 = swapper_pg_dir
```

### 97. Handing Over to C

**Operating System** · `early_setup_idt`

Assembly has taken this as far as it usefully can. One more piece is needed before C code is safe to run: a table of handlers for the faults that will inevitably happen while memory is still half-configured. With that installed, a fault prints something instead of triple-faulting the machine into a silent reboot — and the kernel calls its first proper C function.

```
early exception handlers ready
```

### 98. x86_64_start_kernel() — Into C

**Operating System** · `x86_64_start_kernel()` · `arch/x86/kernel/head64.c:222`

From here the kernel is readable by anyone who knows C, which is most of why the boot is documented at all. This function is still deeply architecture-specific — it exists only on x86-64 — and its job is to finish the last few things that cannot be expressed portably, then call the function that every architecture shares.

```
x86_64_start_kernel()
```

### 99. clear_bss() — Zeroing What Was Never Written

**Operating System** · `clear_bss()` · `arch/x86/kernel/head64.c:177`

A variable declared without a starting value is not stored in the kernel file at all — writing megabytes of zeros to disk would be absurd. Instead the file records only how much space to reserve, in a region called .bss, and someone has to actually zero it at runtime. That someone is here. Until this line runs, every uninitialised variable in the kernel holds whatever the previous occupant of that memory left behind.

```
.bss cleared
```

### 100. copy_bootdata() — GRUB's Data Comes Inside

**Operating System** · `copy_bootdata()` · `arch/x86/kernel/head64.c:194`

The zero page has been sitting in memory GRUB allocated, and the kernel is about to start handing that memory out. So the whole structure is copied into a variable of the kernel's own — boot_params — along with the command line. This is the exact moment the bootloader's contribution stops being borrowed and becomes the kernel's. Everything GRUB learned about this machine now lives inside the kernel.

```
boot_params copied
Command line: BOOT_IMAGE=/vmlinuz root=/dev/nvme0n1p2 ro quiet
```

### 101. x86_64_start_reservations() — Last Stop

**Operating System** · `x86_64_start_reservations()` · `arch/x86/kernel/head64.c:294`

A short function whose only real purpose is to be the last x86-specific thing that happens before the portable kernel begins. It applies quirks for platforms known to misbehave, then makes the call that a kernel on ARM, RISC-V or PowerPC would also make from its own equivalent of this place.

```
x86_64_start_reservations()
```

### 102. setup_arch() — Everything Machine-Specific

**Operating System** · `setup_arch()` · `arch/x86/kernel/setup.c:884`

start_kernel() has barely begun and it already calls out to this — over a thousand lines of code that exists in a different form for every architecture Linux supports. Its job is to turn 'a computer' into 'this computer': find the memory, find the CPUs, find the interrupt controllers. Nothing after it can be portable until it finishes.

```
setup_arch()
```

### 103. Asking the CPU What It Is

**Operating System** · `early_cpu_init()`

The kernel now reads the processor's own identification — vendor, family, model, and the long list of features it claims to support. This matters far beyond a banner line: dozens of later decisions branch on it, and so do the mitigations for hardware bugs like Spectre and Meltdown, which are simply code paths enabled for the exact models known to be affected.

```
CPU: 13th Gen Intel(R) Core(TM) i7-13700K
Spectre V2 : Mitigation: Enhanced IBRS
```

### 104. e820__memory_setup() — Reading GRUB's Map

**Operating System** · `e820__memory_setup()` · `arch/x86/kernel/e820.c:1272`

Here the chain closes a loop. The kernel has no way to ask the firmware what memory exists — that conversation required real mode, which was skipped entirely. It reads the answer GRUB wrote into the zero page instead: E820, a list of address ranges each tagged usable, reserved, or broken. Every allocation the kernel ever makes is bounded by this list, and the list is secondhand.

```
BIOS-provided physical RAM map:
BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable
BIOS-e820: [mem 0x0000000000100000-0x00000000bffdffff] usable
```

### 105. Reading the Command Line

**Operating System** · `parse_early_param()`

The string GRUB passed down is parsed — but only partially, and on purpose. A handful of options change decisions that are about to be made in the next few lines, before the machinery for handling the rest even exists. Those are picked out now; everything else waits for a second pass later. It is a rare case where the kernel reads the same input twice because the first read has to happen too early.

```
Kernel command line: BOOT_IMAGE=/vmlinuz root=/dev/nvme0n1p2 ro quiet
```

### 106. The Allocator Before the Allocator

**Operating System** · `e820__memblock_setup()`

The kernel needs to allocate memory in order to build the system that allocates memory — a genuine chicken-and-egg problem. The answer is memblock, a deliberately primitive allocator: a plain list of reserved and free ranges, no freeing worth the name, no performance to speak of. It is thrown away once the real allocator is up, and it exists only to bootstrap it.

```
memblock: reserved[0x0] [0x1000000-0x2fffffff]
```

### 107. init_mem_mapping() — Mapping All of It

**Operating System** · `init_mem_mapping()` · `arch/x86/mm/init.c:758`

Up to now only a few megabytes have been reachable — enough for the kernel to run, nothing more. This builds the page tables covering all installed RAM, so that the sixty-fourth gigabyte is as addressable as the first. It uses memblock to allocate the tables it needs, which is precisely the bootstrapping the previous step existed for.

```
init_mem_mapping: [mem 0x00000000-0xbffdffff]
Base memory trampoline at [0x99000]
```

### 108. acpi_boot_init() — The Firmware's Inventory

**Operating System** · `acpi_boot_init()` · `arch/x86/kernel/acpi/boot.c:1643`

Only the firmware knows how this particular board is wired — how many CPU cores exist, where the interrupt controllers sit, which power states the hardware supports. It left that knowledge in a set of tables in memory, the ACPI tables, and this is where the kernel reads them. The count of cores found here is what the SMP bringup will later act on.

```
ACPI: RSDP 0x00000000000F0490 000024
ACPI: MADT: 16 CPUs detected
ACPI: IOAPIC (id[0x02] address[0xfec00000])
```

### 109. start_kernel() — The Portable Kernel Begins

**Operating System** · `start_kernel()` · `init/main.c:972`

The same function runs here on every machine Linux supports, from a phone to a mainframe. Its very first act is to switch interrupts off, and they stay off for the next couple of hundred lines: the subsystems that would handle an interrupt do not exist yet, so an interrupt arriving now would have nowhere to go.

```
start_kernel()
local_irq_disable()
```

### 110. The First dmesg Line

**Operating System** · `linux_banner`

The kernel prints its version, the compiler that built it, and the build date. Nobody sees it yet — the console driver will not exist for another two hundred lines — so it goes into a memory buffer and waits. This is why dmesg can show you messages from before the screen was working: they were all recorded and replayed once there was somewhere to send them.

```
[    0.000000] Linux version 7.2.0-rc6 (gcc-14) #1 SMP PREEMPT_DYNAMIC
```

### 111. setup_per_cpu_areas() — A Copy Each

**Operating System** · `setup_per_cpu_areas()` · `arch/x86/kernel/setup_percpu.c:111`

When sixteen cores update one shared counter, they spend most of their time fighting over the cache line holding it. The kernel sidesteps this by giving each core its own private copy of such variables — per-CPU variables — so a core touches only memory no other core wants. This is one of the largest single reasons Linux scales across many cores, and it has to be set up before anything starts counting.

```
percpu: Embedded 64 pages/cpu s225280 r8192 d28672
```

### 112. mm_core_init() — Memory On Demand

**Operating System** · `mm_core_init()` · `mm/mm_init.c:2706`

Until now the kernel could not request memory — it could only mark regions as taken, using the primitive list from earlier. Here a real allocator takes over: the buddy allocator, which manages free memory by repeatedly halving blocks until one is the right size, and merging neighbours back together when they are freed. From this line onward kmalloc works, and the rest of the kernel can finally allocate like ordinary software.

```
Memory: 15873284K/16777216K available
SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=16
```

### 113. trap_init() — When Things Go Wrong

**Operating System** · `trap_init()` · `arch/x86/kernel/traps.c:1661`

A processor reacts to problems — a division by zero, a bad memory access, an illegal instruction — by looking up an entry in a table and jumping there. The early version of that table only had to survive boot. This installs the real one, with handlers that can report a fault properly, print a stack trace, and kill the offending process instead of the machine.

```
trap_init(): IDT populated
```

### 114. sched_init() — Something to Run Things

**Operating System** · `sched_init()` · `kernel/sched/core.c:8915`

Everything so far has been a single thread of execution with nothing to switch to. This builds the scheduler — the part that decides which task runs on which core and for how long — along with the run queues it manages. It also formally registers the code currently executing as a task, so that the boot itself becomes something the scheduler knows about rather than something outside its world.

```
sched_init(): 16 run queues
rcu: Preemptible hierarchical RCU implementation.
```

### 115. rcu_init() — Reading Without Locking

**Operating System** · `rcu_init()` · `kernel/rcu/tree.c:4903`

Data read constantly and written rarely — routing tables, lists of open files — would be crippled if every reader had to take a lock. RCU solves this by letting readers proceed with no lock at all: a writer builds a new version, swaps a pointer to it, and waits until every core has passed through a point where it certainly holds no old reference before freeing the old copy. Much of the kernel depends on it, so it must exist before those parts start.

```
rcu: RCU restricting CPUs from NR_CPUS=8192 to nr_cpu_ids=16
```

### 116. tick_init() — A Heartbeat

**Operating System** · `tick_init()` · `kernel/time/tick-common.c:591`

A scheduler that cannot interrupt a running task cannot take the CPU back from it. The fix is a hardware timer firing at a fixed rate — the tick — which gives the kernel a regular chance to reconsider what should be running. Everything with a deadline hangs off this: timeouts, delays, the accounting that decides a task has had its share.

```
clocksource: refined-jiffies: mask: 0xffffffff
NR_IRQS: 4352
```

### 117. timekeeping_init() — What Time Is It?

**Operating System** · `timekeeping_init()` · `kernel/time/timekeeping.c:2037`

Counting ticks tells the kernel how long it has been running; it says nothing about what day it is. This picks a hardware counter to measure elapsed time accurately — on a modern x86 chip, the one that increments with every processor cycle — and establishes the relationship between that counter and wall-clock time. Two different notions of time, and the kernel needs both.

```
tsc: Detected 3400.000 MHz processor
clocksource: tsc-early selected
```

### 118. Interrupts Come Back On

**Operating System** · `local_irq_enable()`

Two hundred lines ago the kernel switched interrupts off because nothing could have handled one. Now the tables are populated, the handlers are installed, the timer has somewhere to report to — and this single line lets the hardware speak again. From here the kernel is reactive rather than purely sequential: a device can demand attention at any moment.

```
local_irq_enable()
```

### 119. console_init() — Someone Is Watching

**Operating System** · `console_init()` · `kernel/printk/printk.c:4384`

Every message the kernel has printed since the version banner has been accumulating in a buffer with no way out. This registers the console drivers — the framebuffer GRUB set up, a serial port if one is configured — and the entire backlog is flushed at once. On a real machine this is the moment text appears, which is why the first thing you see is never the first thing that happened.

```
printk: console [tty0] enabled
[    0.000000] Linux version 7.2.0-rc6 (gcc-14) #1 SMP
[    0.041] Memory: 15873284K/16777216K available
```

### 120. calibrate_delay() — How Fast Is This?

**Operating System** · `calibrate_delay()` · `init/calibrate.c:278`

Some drivers must wait a precise number of microseconds for hardware to settle, and the simplest way is a counting loop. But a loop takes different real time on different processors, so the kernel measures how many iterations fit into a known interval. The resulting number is printed as BogoMIPS — a name chosen to warn people it is not a performance measurement, which has not stopped anyone from comparing it.

```
[    0.112] Calibrating delay loop (skipped), value calculated using timer frequency.. 6800.00 BogoMIPS (lpj=3400000)
```

### 121. vfs_caches_init() — The Idea of a File

**Operating System** · `vfs_caches_init()` · `fs/dcache.c:3510`

No disk has been touched yet, and no filesystem driver has loaded. What is built here is the layer above all of them: the VFS, which defines what a file and a directory are, so that ext4, NVMe-backed XFS and a network share can all be opened with the same call. It also creates the in-memory root, /, which currently contains nothing at all — but it exists, and something can now be mounted onto it.

```
VFS: Disk quotas dquot_6.6.0
VFS: Dentry cache hash table entries: 1048576
Mount-cache hash table entries: 32768
```

### 122. rest_init() — The Point of No Return

**Operating System** · `rest_init()` · `init/main.c:671`

The last line of start_kernel(), and it never comes back — the function is marked as one that cannot return. Everything the kernel needed to do by itself, alone and in order, is done. What remains cannot be done sequentially, so this function stops being a program and starts being three of them.

```
rest_init()
```

### 123. PID 1 Is Born — And the Order Matters

**Operating System** · `user_mode_thread(kernel_init)`

The first task is created, and it takes process ID 1 — the number every Unix reserves for the ancestor of all other processes. The comment in the source explains why it must be created first: it needs that number, but it will soon want to spawn kernel threads, and the machinery for that does not exist yet. Create it second and it either gets the wrong number or crashes the kernel. One of the clearest cases in the boot where the order is the whole design.

```
pid 1 created (kernel_init)
```

### 124. PID 2, and the Thread That Becomes Idle

**Operating System** · `kthreadd / cpu_startup_entry`

Now that PID 1 has its number, the manager of kernel threads is created as PID 2 — every internal worker thread will be its child. Then the thread that has been executing this entire boot does something quietly remarkable: it becomes the idle task, PID 0, the thing that runs when there is nothing to run. The code that started the machine ends up as the code that does nothing.

```
pid 2 created (kthreadd)
boot thread → idle task (pid 0)
```

### 125. smp_init() — Waking the Other Cores

**Operating System** · `smp_init()` · `kernel/smp.c:1025`

Every core except one has been asleep since the firmware parked it, hours of CPU time ago in machine terms. The kernel now sends each a wake-up signal, and each starts executing at the same shared label the boot processor passed through long ago — which is exactly why that label was written to be shared. Sixteen cores go from one running to sixteen, and the scheduler suddenly has somewhere to put things.

```
[    0.398] smpboot: CPU0: 13th Gen Intel(R) Core(TM) i7-13700K
[    0.412] smp: Bringing up secondary CPUs ...
[    0.487] smp: Brought up 1 node, 16 CPUs
```

### 126. do_initcalls() — Every Driver, In Order

**Operating System** · `do_initcalls()` · `init/main.c:1412`

Thousands of drivers are compiled into the kernel, and each registered a startup function at build time by placing a pointer in a special section. Those pointers are grouped into eight levels, and this walks them level by level — because a disk driver is useless before the PCI bus it hangs off has been probed. This single call is where most of the visible boot log comes from, and where most of the boot time goes.

```
[    0.612] PCI: Using ACPI for IRQ routing
[    0.884] nvme nvme0: pci function 0000:01:00.0
[    0.901] nvme nvme0: 8/0/0 default/read/poll queues
[    0.947] i915 0000:00:02.0: [drm] Found ALDERLAKE_P
```

### 127. The initramfs Is Unpacked

**Operating System** · `wait_for_initramfs()`

The archive GRUB loaded alongside the kernel is expanded into the empty root created earlier, and suddenly / has files in it — a small but complete userspace living entirely in RAM. This exists to solve a circular problem: the driver needed to read the root disk might itself live on the root disk. The initramfs carries whatever is needed to reach the real root, and nothing more.

```
[    1.021] Unpacking initramfs...
[    1.198] Freeing initrd memory: 42184K
[    1.204] /dev/console opened
```

### 128. free_initmem() — Burning the Scaffolding

**Operating System** · `free_initmem()` · `arch/x86/mm/init.c:973`

Every function used only during boot was marked at compile time and gathered into one contiguous region. None of them will ever run again — you cannot boot a machine twice — so the kernel hands that entire region back to the allocator as free memory. It is a rare piece of software that deletes a part of itself once it is done starting, and the reclaimed megabytes are the reason it bothers.

```
[    1.318] Freeing unused kernel image (initmem) memory: 2716K
[    1.322] Write protecting the kernel read-only data: 26624k
```

### 129. Looking for Something to Run

**Operating System** · `/init → /sbin/init → /bin/sh`

The kernel now needs a program to hand the machine to, and it tries candidates in a fixed order: the initramfs entry point first, then whatever init= on the command line named, then a list of traditional locations, and finally a plain shell as a last resort for a broken system. If every one fails it gives up with a message telling you exactly which option to pass — the kernel cannot continue without a first process.

```
[    1.334] Run /init as init process
```

### 130. kernel_execve() — sysretq to Userspace

**Operating System** · `kernel_execve()` · `fs/exec.c:1879`

The handover contains no jump. The ELF loader writes the program's entry point into a saved register frame on the stack — as ordinary a write as any other — and then every function returns normally back up the chain. The transfer happens because the syscall return path restores those modified registers, and one sysretq drops the CPU into ring 3. The kernel has not left; it has only stopped being the only thing running. It is one interrupt away, permanently.

```
load_elf_binary: /init
start_thread_common: regs->ip = 0x7f2c00001040
swapgs ; sysretq  → ring 3
```

---

## 131. initramfs — Reaching the Real Disk

**Operating System** · `/init`

Userspace is running, but only out of RAM. The kernel cannot mount the root filesystem without a driver, and on most machines that driver is a file on the root filesystem — so a small complete system is loaded into memory ahead of time to break the loop. It finds the hardware, unlocks the disk, mounts the real root, and then deletes itself.

```
Run /init as init process
systemd[1]: Running in initrd.
systemd[1]: Switching root.
```

### 132. ld-linux — Not systemd Yet

**Operating System** · `load_elf_interp()` · `fs/binfmt_elf.c:645`

The first instruction to run in userspace does not belong to the init program. Almost every binary on a Linux system is dynamically linked, meaning it arrives incomplete — the code for printf and malloc lives in shared libraries that have to be found and connected at runtime. So the ELF loader spots the interpreter recorded in the file, and points the entry address at that instead. The dynamic linker maps the libraries, resolves the symbols, and only then jumps to the program it was asked to start.

```
exec /init
PT_INTERP: /lib64/ld-linux-x86-64.so.2
```

### 133. /init — A Whole System in RAM

**Operating System** · `/init` · `src/core/main.c:4032`

PID 1 is now running, but the machine it is running on has no disk it can read. Everything it can see is the archive GRUB loaded into memory: a stripped-down root with a few dozen binaries, just enough to get further. What this program actually is depends on the distribution — on Fedora and openSUSE it is systemd again, running in a special initramfs mode; on Debian and Ubuntu it is a shell script running under busybox. Either way its brief is the same and it is very short.

```
Run /init as init process
systemd[1]: Detected architecture x86-64.
systemd[1]: Running in initrd.
```

### 134. udev — What Is Actually Plugged In

**Operating System** · `systemd-udevd` · `src/udev/udevd.c:28`

The kernel found the devices during driver initialisation, but it deliberately does not decide what they should be called or which driver ought to own them — that is policy, and policy belongs in userspace. udev listens for the events the kernel emits about each device, applies a set of rules, and creates the entries under /dev. Until it has run, there is no /dev/nvme0n1 to open, no matter that the driver is loaded and the hardware is ready.

```
systemd[1]: Starting Rule-based Manager for Device Events...
systemd-udevd[214]: nvme0n1: /dev/disk/by-uuid/...
```

### 135. Loading the Drivers That Were Left Out

**Operating System** · `modprobe`

A kernel with every driver compiled in would be enormous and mostly useless on any given machine, so most drivers ship as separate modules loaded on demand. But the module for the root disk cannot be loaded from the root disk. This is the circularity the initramfs exists to break: whichever modules this particular machine needs to reach its root were copied into the archive when it was built, and they are loaded here, from RAM.

```
modprobe nvme
modprobe dm_crypt
modprobe ext4
```

### 136. The Disk Asks for a Password

**Operating System** · `cryptsetup / dm-crypt` · `src/cryptsetup/cryptsetup.c:2763`

If the root filesystem is encrypted, nothing on it can be read until a key is supplied — and the only thing running that can ask a human is this small system in RAM. That is why the password prompt appears before any of the operating system proper has started. The key unlocks a header on the disk, and a virtual device is created that transparently decrypts every block read through it.

```
Please enter passphrase for disk nvme0n1p3:
cryptsetup: luks-9f3c… set up successfully
```

### 137. Assembling Volumes That Span Disks

**Operating System** · `lvm / mdadm`

A root filesystem does not have to live on one partition of one disk. It may be a logical volume carved out of a pool spanning several drives, or a RAID array that must be assembled from its members before it means anything. None of that structure exists on power-up — it is described in metadata on each disk, and something has to read that metadata and build the arrangement. That something is here, still working entirely from RAM.

```
lvm: 1 logical volume(s) in volume group "vg0" now active
```

### 138. The Real Root Is Mounted — Off to One Side

**Operating System** · `mount /sysroot` · `src/fstab-generator/fstab-generator.c:1732`

The disk is finally readable, and the real filesystem is mounted. But not at the root — it goes to a subdirectory, conventionally /sysroot, because the root is still occupied by the temporary system doing the mounting. For a moment the machine holds two complete filesystems at once: the small one running, and the real one hanging off a folder inside it, fully populated and not yet in charge.

```
EXT4-fs (dm-0): mounted filesystem with ordered data mode
systemd[1]: Reached target Initrd Root File System.
```

### 139. switch_root — Swapping the Ground Underneath

**Operating System** · `switch_root()` · `src/shared/switch-root.c:239`

Now the two filesystems trade places: the mounted disk becomes the root, and the temporary system that was the root becomes nothing at all. There is no safe intermediate state — a process cannot run with no root — so the kernel call that does it detaches the old root and attaches the new one in one operation. systemd tries that call first, and keeps a cruder fallback for the cases where the kernel refuses it: move the mount to the root and chroot into it, which works but leaves the old mounts behind. Afterwards the initramfs is deleted and its memory handed back, which is the tens of megabytes a boot log reports freed around this point.

```
systemd[1]: Switching root.
Freeing initrd memory: 42184K
```

### 140. PID 1 Replaces Itself

**Operating System** · `--switched-root --deserialize` · `src/core/main.c:2172`

The program running as PID 1 came from an archive that no longer exists. So it executes the copy on the real disk, over itself — the same process number, the same slot, new code. It cannot simply exit and be restarted, because PID 1 exiting is a kernel panic. Instead it writes down everything it knows, hands the notes to its replacement through an open file descriptor, and the replacement picks up mid-sentence. This is the last handover of the boot.

```
systemd[1]: systemd 257 running in system mode.
systemd[1]: Detected architecture x86-64.
systemd[1]: Set hostname to <workstation>.
```

---

## 141. systemd — PID 1

**Operating System** · `graphical.target`

With the root filesystem in place, the kernel runs the first user-space process: /sbin/init, which is systemd. It resolves the dependency graph between units, brings services up in parallel wherever it can, and works its way toward graphical.target.

```
[  OK  ] Reached target Basic System.
[  OK  ] Started D-Bus System Message Bus.
[  OK  ] Started Network Manager.
[  OK  ] Reached target Graphical Interface.
```

### 142. run_systemd() — Starting for Real

**Operating System** · `run_systemd()` · `src/core/main.c:3539`

The binary that just replaced itself begins here. Its main function is only a few lines — it checks whether it was invoked under another name and then calls this, which is where the actual work lives. The first thing it records is a pair of timestamps, one for how long the kernel took and one starting now, which is where the numbers in systemd-analyze come from.

```
systemd[1]: systemd 262 running in system mode.
```

### 143. Am I PID 1?

**Operating System** · `getpid_cached() == 1`

The same binary runs in two very different roles: as the system manager owning the whole machine, and as a per-user manager owning one login session. So it asks which one it is, and the answer changes almost everything that follows. As PID 1 it clears the inherited file-creation mask, because a mask set by whoever started it would silently affect the permissions of every file the system creates afterwards.

```
systemd[1]: Running in system mode.
umask(0)
```

### 144. Nowhere to Write Logs Yet

**Operating System** · `log_set_prohibit_ipc()`

systemd wants to log what it is doing, but the service that collects logs is one it has not started yet — and will not, for another few hundred lines. Worse, trying to reach it would block. So logging over the message bus is explicitly forbidden for now and everything goes to the kernel ring buffer instead, the same place kernel messages went. It is the only writable destination that certainly exists.

```
log target: kmsg
```

### 145. Loading the Security Policy

**Operating System** · `initialize_security()` · `src/core/main.c:3175`

On a system using mandatory access control, a policy decides which process may touch which file — and unlike ordinary permissions, not even root can override it. That policy has to be loaded before any service starts, because a service started without it would be running unconfined. Loading it can require systemd to re-execute itself so the new rules apply to PID 1 too.

```
systemd[1]: Successfully loaded SELinux policy in 41.2ms.
```

### 146. Is the Clock Believable?

**Operating System** · `clock_apply_epoch()`

If the battery on the board is dead the hardware clock may report a date years in the past, and a system that believes it will reject every TLS certificate it sees as not yet valid. So systemd compares the clock against the build date of its own binary — a date it knows cannot be in the future — and if the clock is earlier, it drags it forward. Not correct, but no longer absurd.

```
systemd[1]: System time before build time, advancing clock.
```

### 147. A Sane Environment

**Operating System** · `fixup_environment()` · `src/core/main.c:1702`

Every process inherits a set of environment variables from its parent, but PID 1 has no parent worth inheriting from — the kernel handed it almost nothing. So systemd fills in the basics itself: a terminal type read from the kernel command line, a home directory, a search path. It also points its own standard input, output and error at the null device, so that a stray write from any code it runs cannot land somewhere unexpected.

```
TERM=linux  HOME=/  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
```

### 148. mount_setup() — The Filesystems Nobody Configures

**Operating System** · `mount_setup()` · `src/shared/mount-setup.c:477`

A handful of filesystems are not storage at all — they are windows into the kernel. Reading a file under one of them runs kernel code and returns the answer as text. systemd mounts them itself rather than waiting for the fstab machinery, because it needs them immediately: process information, device attributes, its own runtime directory, and the control-group hierarchy it will use to keep track of every service it starts.

```
mounting /proc /sys /dev /run
cgroup2 on /sys/fs/cgroup
```

### 149. Locking a Door Behind It

**Operating System** · `lock_down_efi_variables()` · `src/core/efi-random.c:12`

The firmware left a random seed in an EFI variable for the kernel to use, and that variable is now readable through a filesystem that was just mounted. Leaving it readable would let any process with access recover entropy the system is still using. So systemd makes it immutable, closing the door on a value that has already served its purpose.

```
EFI system token locked
```

### 150. Reading Its Own Configuration

**Operating System** · `parse_configuration()` · `src/core/main.c:191`

Before it manages anything else, systemd reads the settings that govern its own behaviour: default timeouts, resource limits handed to every service, what to do when a watchdog expires. These are defaults inherited by everything it will start, so they have to be settled before the first unit is even loaded.

```
reading /etc/systemd/system.conf
```

### 151. The Note From the initramfs

**Operating System** · `--switched-root --deserialize` · `src/core/main.c:1042`

The arguments handed over during the pivot are read here, and one of them is a file descriptor number. Behind it sits everything the previous instance knew — which units it had started, which sockets it was holding open, how far it had got. This is what makes the handover seamless rather than a restart: the state is not rebuilt, it is inherited, and services already running are simply adopted.

```
systemd[1]: --switched-root --system --deserialize=27
```

### 152. Giving the Machine an Identity

**Operating System** · `initialize_runtime()` · `src/core/main.c:2656`

A machine needs a few things to be true about itself before anything can rely on them: a unique identifier that survives reboots, a hostname, and a working loopback interface so that a program can talk to another program on the same host. None of these exist yet on a first boot, so systemd generates or configures them. The loopback matters more than it sounds: the message bus everything else uses runs over it.

```
systemd[1]: Set hostname to <workstation>.
machine-id: 8f2c1e...
```

### 153. manager_new() — Something to Wait On

**Operating System** · `manager_new()` · `src/core/manager.c:922`

systemd spends its life waiting for things to happen, so the first object it builds is the thing that lets it wait on many sources at once without a thread for each: a single kernel-managed set of file descriptors it can block on. Signals, timers, process exits and socket connections are all converted into readable descriptors and dropped into it. From here on the program is a loop around that one wait.

```
manager: epoll and signalfd ready
```

### 154. Three Directories, In Order

**Operating System** · `lookup_paths_init_or_warn()` · `src/libsystemd/sd-path/path-lookup.c:726`

Descriptions of services live in three places and the order is the whole design. What the distribution ships goes in one directory, what is generated at runtime in another, and what the administrator writes in a third — and the administrator wins. That is why editing a service never means touching a file a package update will overwrite: you place your version in the directory that outranks it.

```
/etc/systemd/system      (administrator)
/run/systemd/system      (runtime)
/usr/lib/systemd/system  (distribution)
```

### 155. Turning Old Config Into Units

**Operating System** · `manager_run_environment_generators()` · `src/core/manager.c:4291`

systemd only understands units, but a machine is full of configuration written long before systemd existed. Rather than demand everyone convert, it runs a set of small programs that translate: the classic filesystem table becomes mount units, a swap line becomes a swap unit, kernel command-line options become overrides. They run before anything is loaded, and what they write lands in the runtime directory — which is why those units exist but appear in no file you can find.

```
systemd-fstab-generator: /etc/fstab -> home.mount
systemd-gpt-auto-generator: found ESP, generating boot.mount
```

### 156. Building the Dependency Graph

**Operating System** · `manager_startup()` · `src/core/manager.c:2142`

Every unit file on the machine is read and turned into a node, and every ordering line in them becomes an edge. This is the moment the boot stops being a sequence anyone wrote down and becomes a graph nobody did — assembled from thousands of separate declarations, none of which knows about the others. Nothing has started yet; systemd is still only working out what depends on what.

```
systemd[1]: Loaded 412 unit files
```

### 157. Catching Up With Reality

**Operating System** · `manager_coldplug()` · `src/core/manager.c:1858`

The graph systemd just built describes what should be true; the machine already has opinions of its own. Some filesystems are mounted, some devices exist, some services inherited from the initramfs are running. So each unit is walked and asked to look at the world and record what it actually finds, rather than assuming it starts from nothing. Skip this and systemd would try to mount a filesystem that is already mounted.

```
coldplug: 3 mounts, 1 service adopted from initrd
```

### 158. What Is This Machine For?

**Operating System** · `default.target` · `units/graphical.target`

systemd does not start services; it is given one goal and works out everything that must be true to reach it. The goal is a symbolic link, and where it points is the difference between a server and a desktop: a machine that stops at a text console, or one that carries on to a graphical login. Changing what a machine boots into is changing where that one link points.

```
default.target -> /usr/lib/systemd/system/graphical.target
```

### 159. manager_loop() — No Longer a Program

**Operating System** · `manager_loop()` · `src/core/manager.c:3595`

Everything up to this line ran top to bottom, and nothing after it does. systemd now blocks on its wait, and each thing that wakes it — a process exiting, a device appearing, a timer firing — is matched against the graph to see what has become possible. Reading the rest of this section as a sequence is a mistake the boot log encourages and the code does not support: what follows is order emerging from dependencies, not from lines.

```
systemd[1]: Startup finished in 1.412s (kernel) + 2.907s (initrd)...
```

### 160. The Rest of the Filesystems

**Operating System** · `local-fs.target` · `units/local-fs.target`

The root was mounted back in the initramfs, but a typical machine has more: a separate home, a boot partition, swap. These come from the mount units the generators produced earlier, and they are grouped under a single milestone so that anything needing a complete filesystem tree can wait for one name instead of listing every mount.

```
[  OK  ] Mounted /boot.
[  OK  ] Mounted /home.
[  OK  ] Reached target Local File Systems.
```

### 161. journald — The Logs Have Somewhere to Go

**Operating System** · `systemd-journald.service` · `units/systemd-journald.service.in`

The service that collects logs starts before almost everything else, and its unit file explicitly opts out of the default dependencies every other service gets — because those dependencies would themselves want to log. Once it is up, the messages systemd has been holding in the kernel buffer are drained into it, along with everything the kernel itself printed. This is why journalctl can show you the very first line of a boot.

```
[  OK  ] Started Journal Service.
systemd-journald[298]: Runtime Journal begun on /run/log/journal
```

### 162. udev, This Time From the Real Disk

**Operating System** · `systemd-udevd.service` · `units/systemd-udevd.service.in`

The device manager ran once already, inside the initramfs, with only the handful of rules that fit in the archive. Now it starts again with the full rule set from the real root — thousands of rules covering hardware the initramfs had no reason to know about. Everything the machine has, rather than only what was needed to find the disk, gets named and made available.

```
[  OK  ] Started Rule-based Manager for Device Events and Files.
systemd-udevd[312]: settle: 218 devices
```

### 163. Why sysctl Waits for modules-load

**Operating System** · `systemd-sysctl.service` · `units/systemd-sysctl.service.in`

Kernel tuning knobs are files, and a file only exists once the code that owns it is loaded. Setting a network parameter before the network module is in memory would fail, not because the value is wrong but because the file is not there yet. So one unit file carries a single line declaring it must run after module loading — and that one line is the entire reason the order holds. Nobody wrote a script; two units simply agree.

```
[  OK  ] Started Load Kernel Modules.
[  OK  ] Started Apply Kernel Variables.
```

### 164. Directories That Have to Be Recreated

**Operating System** · `systemd-tmpfiles-setup.service` · `units/systemd-tmpfiles-setup.service`

Some directories live in memory and therefore vanish on every reboot, yet services expect to find them with the right owner and permissions. Rather than have each service create its own, they are declared in text files and made in one pass. The random seed saved at last shutdown is also fed back to the kernel around here, so that a machine has usable entropy before anything asks for a key.

```
[  OK  ] Started Create Volatile Files and Directories.
[  OK  ] Started Load/Save Random Seed.
```

### 165. sysinit.target — The Machine Is Set Up

**Operating System** · `sysinit.target` · `units/sysinit.target`

A target starts nothing itself. It is a name that becomes true once everything grouped under it has finished, so that hundreds of other units can wait for one word instead of enumerating the lot. When this one is reached, the machine is set up but does nothing useful yet: filesystems mounted, devices named, logs flowing, kernel tuned.

```
[  OK  ] Reached target System Initialization.
```

### 166. Carving the Machine Into Slices

**Operating System** · `slices.target` · `units/slices.target`

Every process systemd starts is placed in a group the kernel tracks, and those groups form a tree. The tree matters because limits apply to a branch rather than to one process: cap the branch holding user sessions and no single runaway program can starve the system services on the neighbouring branch. It also means systemd always knows exactly which processes belong to a service, even ones that tried to escape by forking away.

```
[  OK  ] Created slice system.slice.
[  OK  ] Created slice user.slice.
```

### 167. Opening Sockets Without Starting Services

**Operating System** · `sockets.target` · `units/sockets.target`

Here systemd does something that removes most of the ordering problem entirely: it opens the listening sockets, but starts nothing behind them. A client can connect immediately and its request simply waits in the kernel queue; the service is launched on the first connection and never notices the delay. Because every service can be contacted from the moment its socket exists, almost nothing has to wait for anything else to finish starting.

```
[  OK  ] Listening on D-Bus System Message Bus Socket.
[  OK  ] Listening on Journal Socket.
[  OK  ] Reached target Basic System.
```

### 168. D-Bus and logind

**Operating System** · `systemd-logind.service` · `src/login/logind.c:1350`

Programs need a way to call each other that is not a file or a raw socket, and on Linux that is a message bus: one process routes named requests between all the others. logind is one of the first things to appear on it. Its job is to know who is logged in, at which physical screen and keyboard, and to hand out permission to touch the graphics and sound hardware accordingly — which is what makes it impossible for a remote login to grab the local display.

```
[  OK  ] Started D-Bus System Message Bus.
[  OK  ] Started User Login Management.
systemd-logind[401]: New seat seat0.
```

### 169. Deleting One File Opens the Doors

**Operating System** · `systemd-user-sessions.service` · `units/systemd-user-sessions.service.in`

Throughout the boot a single file has existed whose mere presence makes every login attempt fail — the login programs check for it and refuse. It is there on purpose, so that nobody can log into a machine whose filesystems and network are still coming up. This service does nothing but delete it, and that deletion is the moment the machine becomes usable by a person.

```
[  OK  ] Started Permit User Sessions.
removed /run/nologin
```

### 170. multi-user.target — A Working System

**Operating System** · `multi-user.target` · `units/multi-user.target`

The text consoles are running, the network is configured, remote access works, and every background service a server would need is up. On a machine without a screen this is the end of the boot — nothing further is wanted. On a desktop it is the platform the graphical layer is about to be built on, and everything after this point is optional in a way nothing before it was.

```
[  OK  ] Started Network Manager.
[  OK  ] Started OpenSSH server daemon.
[  OK  ] Started Getty on tty1.
[  OK  ] Reached target Multi-User System.
```

---

## 171. Display Manager — The Login Screen

**Operating System** · `GDM / SDDM`

graphical.target starts the display manager, which opens a Wayland or X session and draws the greeter. With the first frame sent to the graphics card, the chain that began when someone pressed the power button is complete.

```
[  OK  ] Started GNOME Display Manager.
gdm-session: greeter ready
```

### 172. graphical.target — One Word of Difference

**Operating System** · `graphical.target` · `units/graphical.target`

This target needs the working system beneath it and will fail without it, but it only asks for the display manager — it does not insist. That single distinction is why a broken graphics driver leaves you at a text console instead of a dead machine: the strong dependency held, the weak one did not, and the system stayed up on everything below. Almost everyone has met this without knowing it had a name.

```
graphical.target: Requires=multi-user.target
graphical.target: Wants=display-manager.service
```

### 173. A Service With No File

**Operating System** · `display-manager.service`

systemd asks for a service by a name that no package actually ships. Whichever login screen the distribution installs claims the name for itself, so the same target works unchanged whether the machine ends up with GNOME, KDE or something lighter. It is a deliberate hole in the dependency graph, left for someone else to fill.

```
display-manager.service -> /usr/lib/systemd/system/gdm.service
```

### 174. Only root May Run This

**Operating System** · `gdm main()` · `daemon/main.c:211`

The daemon refuses to start unless it is running as root, and it checks this in its first few lines. The reason is what it will shortly be asked to do: hand a screen and a keyboard to a person it has not yet identified, then become that person. Nothing without full privilege can do the second half of that, so there is no point starting.

```
[  OK  ] Started GNOME Display Manager.
gdm[512]: GDM 51 starting, uid=0
```

### 175. Claiming a Name Others Can Call

**Operating System** · `on_name_acquired()` · `daemon/main.c:314`

Before doing anything visible, the daemon registers a well-known name on the message bus and waits to be told it owns it. Only then does it start creating screens. This ordering matters: a second copy of the daemon starting by accident would fail to claim the name and exit rather than fight over the hardware, and everything that wants to ask the login manager something now has an address to send to.

```
gdm[512]: acquired name org.gnome.DisplayManager
```

### 176. The Object That Owns Everything

**Operating System** · `gdm_manager_new()` · `daemon/gdm-manager.c:2677`

One long-lived object is created and everything else hangs off it: the list of screens, the sessions in progress, the connection to the bus. It is deliberately not the thing that draws anything or checks any password — it delegates both. Keeping the privileged part small and giving it no user-facing work is the design decision the whole rest of this section follows from.

```
gdm[512]: GdmManager: enabling daemon
```

### 177. Asking logind Where People Can Sit

**Operating System** · `gdm_local_display_factory_create_display()` · `daemon/gdm-local-display-factory.c:175`

A machine can have more than one screen-and-keyboard pair, and each is a separate place a different person could sit. Rather than assume, gdm asks logind which of these exist and creates one display object per station — so two people at two monitors get two independent login prompts instead of fighting over one. The factory keeps listening afterwards, which is how plugging in a second graphics card produces a second login screen without restarting anything.

```
gdm[512]: creating display for seat0
GdmLocalDisplay: /dev/dri/card0
```

### 178. A Screen Has Four States

**Operating System** · `gdm_display_prepare()` · `daemon/gdm-display.c:301`

A display moves through a fixed sequence — unmanaged, prepared, managed, finished — and each transition has to complete before the next can begin. It sounds like bureaucracy but it is what makes logging out safe: tearing a screen down has as many steps as building one up, and a state machine is what stops the daemon from starting a new session on hardware the old one has not finished releasing.

```
GdmDisplay: UNMANAGED -> PREPARED
```

### 179. A Sandbox for the Login Screen

**Operating System** · `gdm_create_greeter_launch_environment()` · `daemon/gdm-launch-environment.c:973`

The login screen is a graphical program, and graphical programs have bugs. So it is not run as root — a dedicated account exists whose only purpose is to own it, with no home worth stealing and no rights worth having. It gets its own session registered with logind, its own environment, and access to exactly the devices for its one station. A flaw in the greeter therefore compromises an account that can do nothing.

```
gdm-launch-environment: user gdm, seat seat0
session-type=wayland
```

### 180. Something to Draw With

**Operating System** · `gdm_launch_environment_start()` · `daemon/gdm-launch-environment.c:565`

Before anything can appear there has to be a program that owns the graphics card and decides what goes where. Modern systems start a compositor speaking the newer protocol, and fall back to the older display server if the driver cannot manage it — which is why some machines end up running two very different graphics stacks for the same job, one pretending to be the other.

```
gdm[512]: launching greeter session
gnome-shell --mode=gdm
```

### 181. The First Frame Anyone Sees

**Operating System** · `greeter ready`

The greeter draws a list of users and a password field, and sends its first frame down the cable. Everything in this project has led to this image — the moment the machine stops talking to itself and asks a person a question. Mechanically it is just another program in a cgroup with a session id, no more privileged than a text editor, which is exactly the point.

```
gdm-session: greeter ready
first frame presented
```

### 182. A Separate Process for the Password

**Operating System** · `gdm_session_worker_job_spawn()` · `daemon/gdm-session-worker-job.c:248`

The daemon does not check the password itself. It forks a short-lived helper whose entire existence is one authentication conversation, and talks to it over a private channel. Two things follow. A crash or an exploit in the code handling untrusted input takes down a process that will be discarded anyway, not the manager of every screen on the machine. And that helper is the thing that will change into the user, which is a one-way trip a long-lived daemon could never take.

```
gdm[512]: forked worker pid 612 for service gdm-password
```

### 183. Building the Stack of Questions

**Operating System** · `gdm_session_worker_initialize_pam()` · `daemon/gdm-session-worker.c:1222`

The worker names a service — here, the one for password logins — and a stack of plug-in modules is assembled from the text file with that name. What ends up in the stack is entirely the administrator's choice: the local password file, a company directory, a fingerprint reader, a hardware token. The program has no idea which; it only knows it will be asking and answering.

```
gdm-session-worker[612]: pam_start("gdm-password")
```

### 184. Are You Who You Say You Are?

**Operating System** · `gdm_session_worker_authenticate_user()` · `daemon/gdm-session-worker.c:1373`

The first of four distinct questions, and the only one most people know about. The stack is walked and each module may accept, reject, or ask something — which is why a fingerprint prompt and a password prompt can appear from the same code without the login screen knowing the difference. The greeter is only a messenger here: it renders whatever question the stack sends up and passes the answer back.

```
pam_unix(gdm-password:auth): authentication success; user=serkan
```

### 185. Correct Password, Still Refused

**Operating System** · `gdm_session_worker_authorize_user()` · `daemon/gdm-session-worker.c:1449`

Proving who you are and being allowed in are separate questions, and this is the second one. An account can be expired, locked, restricted to certain hours, or forbidden on this particular machine — all with a perfectly correct password. If the check comes back saying the password itself has expired, the stack is asked to change it right here, which is why some logins turn into a password-change prompt before the desktop ever appears.

```
pam_unix(gdm-password:account): account valid
pam_acct_mgmt: PAM_SUCCESS
```

### 186. Collecting What You Are Owed

**Operating System** · `gdm_session_worker_accredit_user()` · `daemon/gdm-session-worker.c:1704`

The third question is not about permission but about equipment: group memberships, network authentication tickets, keys to unlock an encrypted home directory. These are things the user is entitled to and cannot fetch for themselves, so they are established here, while the process still has the privilege to do it and before it gives that privilege away for good.

```
pam_setcred: PAM_ESTABLISH_CRED
gdm-session-worker[612]: groups: wheel, audio, video
```

### 187. The Session Opens

**Operating System** · `gdm_session_worker_open_session()` · `daemon/gdm-session-worker.c:2334`

The fourth and last question is really an instruction: set up everything that should exist while this person is logged in. Modules mount the home directory, start a keyring, record the login in the system's accounting, and — the one that matters most here — call into logind to register the session. This is where the two projects meet, and everything downstream depends on it having happened.

```
pam_systemd(gdm-password:session): New session 2
pam_open_session: PAM_SUCCESS
```

### 188. Registered as Present

**Operating System** · `CreateSession` · `src/login/logind-dbus.c:884`

logind records who logged in and at which station, and hands that user control of the graphics, sound and input devices for as long as they are there. Device access follows the session rather than the account, which is the mechanism behind something people rely on daily without noticing: someone logged in over the network cannot take the screen of the person sitting at the machine.

```
systemd-logind[401]: New session 2 of user serkan.
session 2: seat0, type=wayland, class=user
```

### 189. Jump to It, Rather Than Start It

**Operating System** · `switch_to_compatible_user_session()` · `daemon/gdm-manager.c:581`

Before starting a desktop, gdm checks whether this user already has one running somewhere else — on another virtual console, left behind when they switched away. If so it does not start a second: it switches the screen to the existing one, and the user finds their windows exactly as they left them. This is the whole mechanism behind fast user switching, and it is one condition in one function.

```
GdmManager: start or jump to session
GdmManager: migrated: 0
```

### 190. A systemd of Your Own

**Operating System** · `user@1000.service` · `units/user@.service.in`

A second copy of systemd starts, running as the user and managing only their programs — the same manager, the same kind of unit files, a private scope. The greeter that asked the question is torn down, its throwaway account released, and the desktop takes the screen. The chain that began when someone pressed a button ends with the machine handing itself over to a person.

```
[  OK  ] Started User Manager for UID 1000.
gdm[512]: greeter session stopped
[  OK  ] Reached target Graphical Interface.
```
