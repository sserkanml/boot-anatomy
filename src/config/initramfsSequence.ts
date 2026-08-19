import type { BootStep } from '../types';
import { RAIL_COLORS } from './constants';

/**
 * The gap between the kernel's sysretq and the real system: userspace running
 * entirely out of RAM, doing the one job that cannot be done from anywhere
 * else — making the root disk reachable.
 *
 * This is the part of the boot most people never see described, because on a
 * working machine it takes a fraction of a second and prints almost nothing.
 * It is also where a machine that will not boot usually fails, which is the
 * argument for giving it its own section rather than folding it into systemd.
 *
 * Source paths point into two trees, because the work genuinely spans both:
 * ~/Projects/systemd (v262~devel) for everything userspace does, and
 * ~/Projects/linux-master (7.2.0-rc6) for the ELF loader that starts it. The
 * cards with no path at all belong to projects not checked out here — kmod for
 * module loading, LVM and mdadm for volume assembly.
 */
const KERNEL = RAIL_COLORS.kernel;
const DATA = RAIL_COLORS.data;
const LOGIC = RAIL_COLORS.logic;

export const INITRAMFS_SEQUENCE_STEPS: BootStep[] = [
  {
    id: 'initramfs-ld-linux',
    phase: 'os',
    title: { en: 'ld-linux — Not systemd Yet', tr: 'ld-linux — Henüz systemd Değil' },
    signal: 'load_elf_interp()',
    source: 'fs/binfmt_elf.c:645',
    description: {
      en: 'The first instruction to run in userspace does not belong to the init program. Almost every binary on a Linux system is dynamically linked, meaning it arrives incomplete — the code for printf and malloc lives in shared libraries that have to be found and connected at runtime. So the ELF loader spots the interpreter recorded in the file, and points the entry address at that instead. The dynamic linker maps the libraries, resolves the symbols, and only then jumps to the program it was asked to start.',
      tr: 'Userspace’te çalışan ilk talimat init programına ait değildir. Bir Linux sisteminde neredeyse her ikili dinamik linklidir, yani eksik gelir — printf ve malloc’un kodu, çalışma anında bulunup bağlanması gereken paylaşılan kütüphanelerde yaşar. Bu yüzden ELF loader dosyada kayıtlı interpreter’ı görür ve giriş adresini onun yerine ona yöneltir. Dynamic linker kütüphaneleri haritalar, sembolleri çözer ve ancak ondan sonra başlatması istenen programa atlar.',
    },
    duration: 5200,
    view: 'coreboot',
    screen: 'boot',
    depth: 1,
    highlight: ['ram', 'cpuBsp'],
    console: ['exec /init', 'PT_INTERP: /lib64/ld-linux-x86-64.so.2'],
    signals: [
      { route: ['ram', 'cpuBsp'], color: DATA, label: 'ld.so', particles: 12, spread: 0.6 },
    ],
  },
  {
    id: 'initramfs-init',
    phase: 'os',
    title: { en: '/init — A Whole System in RAM', tr: '/init — RAM’de Bütün Bir Sistem' },
    signal: '/init',
    source: 'src/core/main.c:4032',
    description: {
      en: 'PID 1 is now running, but the machine it is running on has no disk it can read. Everything it can see is the archive GRUB loaded into memory: a stripped-down root with a few dozen binaries, just enough to get further. What this program actually is depends on the distribution — on Fedora and openSUSE it is systemd again, running in a special initramfs mode; on Debian and Ubuntu it is a shell script running under busybox. Either way its brief is the same and it is very short.',
      tr: 'PID 1 artık çalışıyor, ama üzerinde çalıştığı makinenin okuyabildiği bir disk yok. Görebildiği her şey, GRUB’ın belleğe yüklediği arşiv: birkaç düzine ikiliyle soyulmuş bir kök, yalnızca daha ileri gitmeye yetecek kadar. Bu programın gerçekte ne olduğu dağıtıma bağlıdır — Fedora ve openSUSE’de yine systemd’dir, özel bir initramfs kipinde çalışır; Debian ve Ubuntu’da busybox altında koşan bir shell script’tir. Her hâlükârda görev tanımı aynıdır ve çok kısadır.',
    },
    duration: 5600,
    view: 'coreboot',
    screen: 'boot',
    depth: 1,
    highlight: ['ram', 'cpuBsp'],
    console: ['Run /init as init process', 'systemd[1]: Detected architecture x86-64.', 'systemd[1]: Running in initrd.'],
    signals: [{ route: ['cpuBsp', 'ram'], color: KERNEL, particles: 10, spread: 0.55 }],
  },
  {
    id: 'initramfs-udev',
    phase: 'os',
    title: { en: 'udev — What Is Actually Plugged In', tr: 'udev — Gerçekte Ne Takılı' },
    signal: 'systemd-udevd',
    source: 'src/udev/udevd.c:28',
    description: {
      en: 'The kernel found the devices during driver initialisation, but it deliberately does not decide what they should be called or which driver ought to own them — that is policy, and policy belongs in userspace. udev listens for the events the kernel emits about each device, applies a set of rules, and creates the entries under /dev. Until it has run, there is no /dev/nvme0n1 to open, no matter that the driver is loaded and the hardware is ready.',
      tr: 'Kernel aygıtları sürücü başlatma sırasında buldu, ama ne ad taşıyacaklarına ya da hangi sürücünün onlara sahip olacağına bilerek karar vermez — bu bir politikadır ve politika userspace’e aittir. udev, kernel’in her aygıt hakkında yaydığı olayları dinler, bir kural kümesi uygular ve /dev altındaki girdileri oluşturur. O çalışana kadar açılacak bir /dev/nvme0n1 yoktur; sürücünün yüklü, donanımın hazır olması bunu değiştirmez.',
    },
    duration: 5400,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['chipset', 'm2', 'pcie'],
    console: [
      'systemd[1]: Starting Rule-based Manager for Device Events...',
      'systemd-udevd[214]: nvme0n1: /dev/disk/by-uuid/...',
    ],
    signals: [
      { route: ['chipset', 'm2'], color: DATA, label: 'uevent', particles: 12, spread: 0.6 },
    ],
  },
  {
    id: 'initramfs-modules',
    phase: 'os',
    title: { en: 'Loading the Drivers That Were Left Out', tr: 'Dışarıda Bırakılmış Sürücüleri Yüklemek' },
    signal: 'modprobe',
    description: {
      en: 'A kernel with every driver compiled in would be enormous and mostly useless on any given machine, so most drivers ship as separate modules loaded on demand. But the module for the root disk cannot be loaded from the root disk. This is the circularity the initramfs exists to break: whichever modules this particular machine needs to reach its root were copied into the archive when it was built, and they are loaded here, from RAM.',
      tr: 'Her sürücüsü içine derlenmiş bir kernel devasa olurdu ve herhangi bir makinede çoğu işe yaramazdı; bu yüzden çoğu sürücü, istendiğinde yüklenen ayrı modüller olarak dağıtılır. Ama kök diskin modülü kök diskten yüklenemez. initramfs’in var olma sebebi olan dairesellik budur: bu makinenin köküne ulaşmak için hangi modüllere ihtiyacı varsa, arşiv üretilirken içine kopyalanmıştır ve burada, RAM’den yüklenirler.',
    },
    duration: 5000,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['ram', 'chipset', 'm2'],
    console: ['modprobe nvme', 'modprobe dm_crypt', 'modprobe ext4'],
    signals: [
      { route: ['ram', 'chipset'], color: KERNEL, label: 'modules', particles: 10, spread: 0.6 },
    ],
  },
  {
    id: 'initramfs-luks',
    phase: 'os',
    title: { en: 'The Disk Asks for a Password', tr: 'Disk Parola İstiyor' },
    signal: 'cryptsetup / dm-crypt',
    source: 'src/cryptsetup/cryptsetup.c:2763',
    description: {
      en: 'If the root filesystem is encrypted, nothing on it can be read until a key is supplied — and the only thing running that can ask a human is this small system in RAM. That is why the password prompt appears before any of the operating system proper has started. The key unlocks a header on the disk, and a virtual device is created that transparently decrypts every block read through it.',
      tr: 'Root filesystem şifreliyse, bir anahtar verilene kadar üzerindeki hiçbir şey okunamaz — ve bir insana soru sorabilecek tek çalışan şey RAM’deki bu küçük sistemdir. Parola sorusunun, işletim sisteminin kendisinden herhangi bir parça başlamadan önce belirmesinin sebebi budur. Anahtar diskteki bir başlığı açar ve üzerinden okunan her bloğu saydam biçimde deşifre eden sanal bir aygıt oluşturulur.',
    },
    duration: 5400,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['m2', 'chipset'],
    console: [
      'Please enter passphrase for disk nvme0n1p3:',
      'cryptsetup: luks-9f3c… set up successfully',
    ],
    signals: [
      { route: ['m2', 'chipset'], color: LOGIC, label: 'dm-crypt', particles: 10, spread: 0.6 },
    ],
  },
  {
    id: 'initramfs-assemble',
    phase: 'os',
    title: { en: 'Assembling Volumes That Span Disks', tr: 'Diskler Boyunca Uzanan Birimleri Kurmak' },
    signal: 'lvm / mdadm',
    description: {
      en: 'A root filesystem does not have to live on one partition of one disk. It may be a logical volume carved out of a pool spanning several drives, or a RAID array that must be assembled from its members before it means anything. None of that structure exists on power-up — it is described in metadata on each disk, and something has to read that metadata and build the arrangement. That something is here, still working entirely from RAM.',
      tr: 'Bir root filesystem tek bir diskin tek bir bölümünde yaşamak zorunda değildir. Birden çok sürücüye yayılan bir havuzdan oyulmuş bir logical volume olabilir ya da bir anlam ifade etmesi için üyelerinden kurulması gereken bir RAID dizisi. Bu yapının hiçbiri açılışta mevcut değildir — her diskteki metadata’da tarif edilir ve birinin o metadata’yı okuyup düzeni kurması gerekir. O biri burasıdır ve hâlâ tamamen RAM’den çalışmaktadır.',
    },
    duration: 5000,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['m2', 'chipset'],
    console: ['lvm: 1 logical volume(s) in volume group "vg0" now active'],
    signals: [{ route: ['chipset', 'm2'], color: LOGIC, particles: 9, spread: 0.55 }],
  },
  {
    id: 'initramfs-mount',
    phase: 'os',
    title: { en: 'The Real Root Is Mounted — Off to One Side', tr: 'Gerçek Kök Mount Ediliyor — Bir Kenara' },
    signal: 'mount /sysroot',
    source: 'src/fstab-generator/fstab-generator.c:1732',
    description: {
      en: 'The disk is finally readable, and the real filesystem is mounted. But not at the root — it goes to a subdirectory, conventionally /sysroot, because the root is still occupied by the temporary system doing the mounting. For a moment the machine holds two complete filesystems at once: the small one running, and the real one hanging off a folder inside it, fully populated and not yet in charge.',
      tr: 'Disk nihayet okunabilir durumda ve gerçek dosya sistemi mount edilir. Ama köke değil — alışıldık biçimde /sysroot olan bir alt dizine gider, çünkü kök hâlâ mount işlemini yapan geçici sistem tarafından işgal edilmektedir. Bir an için makine aynı anda iki eksiksiz dosya sistemi tutar: çalışan küçük olan ve onun içindeki bir klasöre asılı duran, tamamen dolu ama henüz iş başında olmayan gerçek olan.',
    },
    duration: 5400,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['m2', 'ram'],
    console: [
      'EXT4-fs (dm-0): mounted filesystem with ordered data mode',
      'systemd[1]: Reached target Initrd Root File System.',
    ],
    signals: [
      { route: ['m2', 'ram'], color: DATA, label: '/sysroot', particles: 12, spread: 0.65 },
    ],
  },
  {
    id: 'initramfs-switch-root',
    phase: 'os',
    title: { en: 'switch_root — Swapping the Ground Underneath', tr: 'switch_root — Ayağın Altındaki Zemini Değiştirmek' },
    signal: 'switch_root()',
    source: 'src/shared/switch-root.c:239',
    description: {
      en: 'Now the two filesystems trade places: the mounted disk becomes the root, and the temporary system that was the root becomes nothing at all. There is no safe intermediate state — a process cannot run with no root — so the kernel call that does it detaches the old root and attaches the new one in one operation. systemd tries that call first, and keeps a cruder fallback for the cases where the kernel refuses it: move the mount to the root and chroot into it, which works but leaves the old mounts behind. Afterwards the initramfs is deleted and its memory handed back, which is the tens of megabytes a boot log reports freed around this point.',
      tr: 'Şimdi iki dosya sistemi yer değiştirir: mount edilmiş disk kök olur ve kök olan geçici sistem hiçbir şey hâline gelir. Güvenli bir ara durum yoktur — bir süreç köksüz çalışamaz — bu yüzden bunu yapan kernel çağrısı eski kökü ayırıp yenisini tek bir işlemde bağlar. systemd önce o çağrıyı dener ve kernel’in onu reddettiği durumlar için daha kaba bir yedek tutar: mount’u köke taşıyıp içine chroot etmek — çalışır, ama eski mount’ları geride bırakır. Ardından initramfs silinir ve belleği geri verilir; bir boot günlüğünün bu civarda serbest bırakıldığını bildirdiği onlarca megabayt budur.',
    },
    duration: 6000,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['ram', 'm2', 'cpu'],
    console: [
      'systemd[1]: Switching root.',
      'Freeing initrd memory: 42184K',
    ],
    signals: [
      { route: ['ram', 'm2'], color: KERNEL, label: 'pivot_root', particles: 16, spread: 0.7, thickness: 1.2 },
    ],
  },
  {
    id: 'initramfs-reexec',
    phase: 'os',
    title: { en: 'PID 1 Replaces Itself', tr: 'PID 1 Kendini Değiştiriyor' },
    signal: '--switched-root --deserialize',
    source: 'src/core/main.c:2172',
    description: {
      en: 'The program running as PID 1 came from an archive that no longer exists. So it executes the copy on the real disk, over itself — the same process number, the same slot, new code. It cannot simply exit and be restarted, because PID 1 exiting is a kernel panic. Instead it writes down everything it knows, hands the notes to its replacement through an open file descriptor, and the replacement picks up mid-sentence. This is the last handover of the boot.',
      tr: 'PID 1 olarak çalışan program, artık var olmayan bir arşivden geldi. Bu yüzden gerçek diskteki kopyayı kendi üzerine çalıştırır — aynı süreç numarası, aynı yuva, yeni kod. Basitçe çıkıp yeniden başlatılamaz, çünkü PID 1’in çıkması bir kernel panic’tir. Onun yerine bildiği her şeyi yazar, notları açık bir file descriptor üzerinden yerine geçecek olana devreder ve yerine geçen cümlenin ortasından devam eder. Bu, boot’un son devridir.',
    },
    duration: 5600,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['cpu', 'm2', 'ram'],
    console: [
      'systemd[1]: systemd 257 running in system mode.',
      'systemd[1]: Detected architecture x86-64.',
      'systemd[1]: Set hostname to <workstation>.',
    ],
    signals: [
      { route: ['m2', 'cpu'], color: KERNEL, label: 'systemd', particles: 14, spread: 0.65, persist: true },
    ],
  },
];
