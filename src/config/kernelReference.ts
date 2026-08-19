import type { FaqEntry } from './psuReference';

/**
 * The glossary behind the Kernel section.
 *
 * The kernel chain is written for someone who is not a kernel developer, which
 * means the cards can only afford to define a term once, in passing. This is
 * where the full answer lives. Ordered roughly as the terms are first met on
 * the timeline rather than alphabetically — a reader who got stuck on a card
 * finds the neighbouring entries useful too.
 *
 * As everywhere else, `term` is never localized: these are the names people
 * actually use, in both languages. Every href was checked to return 200.
 */
export const KERNEL_FAQ: FaqEntry[] = [
  {
    term: 'long mode',
    question: {
      en: 'What is long mode, and why does the kernel check for it first?',
      tr: 'Long mode nedir ve kernel neden önce onu kontrol eder?',
    },
    answer: {
      en: 'Long mode is the 64-bit operating mode of an x86 processor. It is not the mode the machine starts in — a PC still powers on behaving like a chip from 1978 and has to be walked forward through the generations. A 64-bit kernel obviously cannot run without it, so the decompressor asks the CPU before unpacking anything: getting a clear message beats faulting halfway through with a blank screen.',
      tr: 'Long mode, bir x86 işlemcisinin 64-bit çalışma kipidir. Makinenin başladığı kip değildir — bir PC hâlâ 1978’deki bir yonga gibi davranarak açılır ve kuşaklar boyunca ileri yürütülmesi gerekir. 64-bit bir kernel bu kip olmadan açıkça çalışamaz, bu yüzden açıcı hiçbir şeyi paketinden çıkarmadan önce CPU’ya sorar: net bir mesaj almak, yarı yolda boş ekranla fault vermekten iyidir.',
    },
    href: 'https://en.wikipedia.org/wiki/Long_mode',
  },
  {
    term: 'protected mode',
    question: {
      en: 'What does protected mode protect, exactly?',
      tr: 'Protected mode tam olarak neyi korur?',
    },
    answer: {
      en: 'It is the 32-bit mode that sits between the ancient 16-bit startup mode and 64-bit long mode. What it protects is memory: for the first time the processor can enforce that one program may not read or write another\'s memory, and that ordinary code may not execute privileged instructions. GRUB hands the kernel over in this mode, with memory translation switched off.',
      tr: 'Eski 16-bit başlangıç kipi ile 64-bit long mode arasında duran 32-bit kiptir. Koruduğu şey bellektir: işlemci ilk kez bir programın bir başkasının belleğini okuyup yazamayacağını ve sıradan kodun ayrıcalıklı talimatları çalıştıramayacağını zorlayabilir. GRUB kernel’i bu kipte, adres çevirisi kapalı olarak devreder.',
    },
    href: 'https://en.wikipedia.org/wiki/Protected_mode',
  },
  {
    term: 'page table',
    question: {
      en: 'What is a page table?',
      tr: 'Page table nedir?',
    },
    answer: {
      en: 'A tree of tables in memory that translates the addresses a program uses into the addresses the RAM chips actually have. It is what lets every process believe it has the machine to itself, and what makes it possible to give a process memory that is not physically contiguous — or not currently in RAM at all. The processor walks this tree on every memory access that is not already cached.',
      tr: 'Bir programın kullandığı adresleri, RAM yongalarının gerçekten sahip olduğu adreslere çeviren, bellekte duran bir tablo ağacı. Her sürecin makinenin tamamı kendisininmiş gibi davranmasını sağlayan şey budur; bir sürece fiziksel olarak bitişik olmayan — hatta o an hiç RAM’de olmayan — bellek verebilmeyi mümkün kılan da. İşlemci, önbelleğe alınmamış her bellek erişiminde bu ağacı yürür.',
    },
    href: 'https://en.wikipedia.org/wiki/Page_table',
  },
  {
    term: 'identity mapping',
    question: {
      en: 'Why build a page table that maps addresses to themselves?',
      tr: 'Neden adresleri kendilerine eşleyen bir page table kurulur?',
    },
    answer: {
      en: 'Because the processor refuses to enter 64-bit mode unless address translation is already switched on, but the kernel is not yet ready to remap anything. So it builds the simplest possible table: address 0x1000 maps to 0x1000, and so on. Translation is technically running and the CPU is satisfied, while in practice nothing has moved. It is scaffolding, discarded as soon as real tables exist.',
      tr: 'Çünkü işlemci, adres çevirisi zaten açık değilse 64-bit moda geçmeyi reddeder; ama kernel henüz hiçbir şeyi yeniden haritalamaya hazır değildir. Bu yüzden mümkün olan en basit tabloyu kurar: 0x1000 adresi 0x1000’e eşlenir, ve böyle sürer. Teknik olarak çeviri çalışmaktadır ve CPU tatmin olmuştur, pratikte ise hiçbir şey yer değiştirmemiştir. Bir iskeledir, gerçek tablolar oluşur oluşmaz atılır.',
    },
    href: 'https://en.wikipedia.org/wiki/Virtual_address_space',
  },
  {
    term: 'KASLR',
    question: {
      en: 'Why does the kernel randomize where it loads itself?',
      tr: 'Kernel kendini neden rastgele bir yere yükler?',
    },
    answer: {
      en: 'Most exploits need to know the address of something — a function to jump to, a structure to overwrite. If that address is different on every boot, an attack tuned on one machine fails on the next, and a wrong guess usually crashes the attempt instead of succeeding quietly. KASLR is the kernel-side version of the same trick userspace programs have used for years; the cost is a small offset calculation, the benefit is that a whole class of attacks becomes guesswork.',
      tr: 'Çoğu exploit bir şeyin adresini bilmeye ihtiyaç duyar — atlanacak bir fonksiyon, üzerine yazılacak bir yapı. O adres her boot’ta farklıysa, bir makinede ayarlanmış saldırı diğerinde başarısız olur ve yanlış tahmin genellikle sessizce başarmak yerine denemeyi çökertir. KASLR, userspace programlarının yıllardır kullandığı aynı numaranın kernel tarafındaki sürümüdür; maliyeti küçük bir offset hesabı, faydası ise koca bir saldırı sınıfının tahmin işine dönüşmesidir.',
    },
    href: 'https://en.wikipedia.org/wiki/Address_space_layout_randomization',
  },
  {
    term: 'ELF',
    question: {
      en: 'What is an ELF file?',
      tr: 'ELF dosyası nedir?',
    },
    answer: {
      en: 'The standard container format for programs on Linux — and for the kernel itself. It is not the code alone but a description of it: which byte ranges are executable code, which are read-only data, which need to be zeroed, and what address each expects to live at. A loader reads that description to place the pieces correctly, which is exactly what the decompressor does with the unpacked kernel.',
      tr: 'Linux’ta programlar — ve kernel’in kendisi — için standart kap biçimi. Yalnızca kod değil, kodun tarifidir: hangi bayt aralıkları çalıştırılabilir kod, hangileri salt okunur veri, hangilerinin sıfırlanması gerekiyor ve her biri hangi adreste yaşamayı bekliyor. Bir yükleyici parçaları doğru yerleştirmek için bu tarifi okur — açıcının paketinden çıkardığı kernel’e yaptığı da tam olarak budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Executable_and_Linkable_Format',
  },
  {
    term: 'relocation',
    question: {
      en: 'What is a relocation, and why does randomizing the address require thousands of them?',
      tr: 'Relocation nedir ve adresi rastgeleleştirmek neden binlercesini gerektirir?',
    },
    answer: {
      en: 'Compiled code is full of absolute addresses — a call to a function, a pointer to a table. Those were written assuming the program loads at one particular address. Move it, and every one of them is wrong by exactly the amount it moved. A relocation is a recorded note saying "this location holds an address, adjust it", and the loader walks the whole list adding the offset before the first instruction runs.',
      tr: 'Derlenmiş kod mutlak adreslerle doludur — bir fonksiyona çağrı, bir tabloya pointer. Bunlar programın belirli bir adrese yükleneceği varsayılarak yazılmıştır. Programı taşı, hepsi tam olarak taşındığı kadar yanlış olur. Relocation, “burası bir adres tutuyor, düzelt” diyen kayıtlı bir nottur; yükleyici ilk talimat çalışmadan önce tüm listeyi yürüyüp offset’i ekler.',
    },
    href: 'https://en.wikipedia.org/wiki/Relocation_(computing)',
  },
  {
    term: '.bss',
    question: {
      en: 'Why does uninitialised memory need to be explicitly cleared?',
      tr: 'İlklenmemiş bellek neden açıkça temizlenmek zorunda?',
    },
    answer: {
      en: 'A variable declared without a starting value is promised to be zero by the C language, but storing megabytes of zeros in the kernel file would be a waste of disk and load time. So the file only records how much space to reserve, in a section named .bss, and the promise is kept at runtime by someone zeroing that region. Until that runs, those variables hold whatever the previous occupant of that memory left there.',
      tr: 'Başlangıç değeri olmadan tanımlanan bir değişkenin sıfır olacağı C dili tarafından vaat edilir; ama kernel dosyasında megabaytlarca sıfır saklamak disk ve yükleme zamanı israfı olurdu. Bu yüzden dosya yalnızca ne kadar yer ayrılacağını .bss adlı bir bölümde kaydeder ve vaat, çalışma anında birinin o bölgeyi sıfırlamasıyla tutulur. O çalışana kadar bu değişkenler, o belleğin önceki sakininden kalanı tutar.',
    },
    href: 'https://en.wikipedia.org/wiki/.bss',
  },
  {
    term: 'zero page / boot_params',
    question: {
      en: 'What is the zero page and who fills it in?',
      tr: 'Zero page nedir ve onu kim doldurur?',
    },
    answer: {
      en: 'A fixed 4 KB structure that a bootloader fills in and the kernel reads — the entire contract between them. It carries the memory map, the kernel command line, the video mode, the location of the initramfs. GRUB writes it, the kernel copies it into a variable called boot_params and then owns it. Almost everything the kernel initially knows about the machine came through this one structure.',
      tr: 'Bir bootloader’ın doldurduğu ve kernel’in okuduğu sabit 4 KB’lık yapı — aralarındaki sözleşmenin tamamı. Memory map’i, kernel komut satırını, video modunu, initramfs’in konumunu taşır. GRUB onu yazar, kernel boot_params adlı bir değişkene kopyalar ve sahiplenir. Kernel’in makine hakkında başlangıçta bildiği neredeyse her şey bu tek yapıdan gelmiştir.',
    },
    href: 'https://en.wikipedia.org/wiki/Linux_startup_process',
  },
  {
    term: 'E820',
    question: {
      en: 'What is the E820 map and why can the kernel not just ask the firmware?',
      tr: 'E820 haritası nedir ve kernel neden firmware’e doğrudan soramaz?',
    },
    answer: {
      en: 'E820 is a list of physical address ranges, each tagged usable, reserved, ACPI data, or defective — the definitive answer to "what memory does this machine have". The name comes from the old BIOS call that returned it, and that call only works in 16-bit real mode, which a modern boot skips entirely. So the bootloader makes the call while it still can and writes the result into the zero page. The kernel reads the answer secondhand, and every allocation it ever makes is bounded by that list.',
      tr: 'E820, her biri kullanılabilir, ayrılmış, ACPI verisi ya da bozuk olarak etiketlenmiş fiziksel adres aralıklarının listesidir — “bu makinede hangi bellek var” sorusunun kesin cevabı. İsim, onu döndüren eski BIOS çağrısından gelir ve o çağrı yalnızca 16-bit real mode’da çalışır; modern bir boot ise real mode’u tamamen atlar. Bu yüzden bootloader çağrıyı hâlâ yapabilirken yapar ve sonucu zero page’e yazar. Kernel cevabı ikinci elden okur ve yaptığı her ayırma bu listeyle sınırlıdır.',
    },
    href: 'https://en.wikipedia.org/wiki/E820',
  },
  {
    term: 'MMU',
    question: {
      en: 'What is the MMU?',
      tr: 'MMU nedir?',
    },
    answer: {
      en: 'The memory management unit is the part of the processor that walks the page tables and turns a program\'s address into a physical one, on every single access. It is also what raises a fault when an access is not allowed — which is how the kernel finds out that a program touched memory it should not have, and how demand paging works at all.',
      tr: 'Memory management unit, işlemcinin page table’ları yürüyüp bir programın adresini fiziksel bir adrese çeviren parçasıdır; hem de her tek erişimde. Bir erişime izin verilmediğinde fault üreten de odur — kernel’in bir programın dokunmaması gereken belleğe dokunduğunu böyle öğrenir ve demand paging genel olarak böyle çalışır.',
    },
    href: 'https://en.wikipedia.org/wiki/Memory_management_unit',
  },
  {
    term: 'buddy allocator',
    question: {
      en: 'How does the buddy allocator work?',
      tr: 'Buddy allocator nasıl çalışır?',
    },
    answer: {
      en: 'It keeps free memory in blocks whose sizes are powers of two. Asked for memory, it finds the smallest adequate block and splits it in half repeatedly until the size fits; the halves are called buddies. When a block is freed, it checks whether its buddy is also free and merges them back, repeatedly. This keeps fragmentation under control with very little bookkeeping, which is why it sits at the base of Linux memory management.',
      tr: 'Boş belleği, boyutları ikinin kuvvetleri olan bloklarda tutar. Bellek istendiğinde yeterli olan en küçük bloğu bulur ve boyut uyana dek tekrar tekrar ikiye böler; yarımlara buddy denir. Bir blok serbest bırakıldığında, buddy’sinin de boş olup olmadığına bakar ve tekrar tekrar birleştirir. Bu, çok az kayıt tutarak parçalanmayı kontrol altında tutar; Linux bellek yönetiminin temelinde olmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Buddy_memory_allocation',
  },
  {
    term: 'slab / SLUB',
    question: {
      en: 'If the buddy allocator exists, what is the slab allocator for?',
      tr: 'Buddy allocator varken slab allocator ne işe yarar?',
    },
    answer: {
      en: 'The buddy allocator deals in pages — 4 KB at a time. Most kernel structures are far smaller, and allocating a page for a 96-byte object would waste almost all of it. The slab allocator takes pages from the buddy allocator and carves them into same-sized objects, keeping pools of ready-made ones. SLUB is the implementation Linux uses today. This is what actually answers a kmalloc call.',
      tr: 'Buddy allocator sayfalarla iş görür — seferinde 4 KB. Kernel yapılarının çoğu bundan çok daha küçüktür ve 96 baytlık bir nesne için bir sayfa ayırmak neredeyse tamamını israf ederdi. Slab allocator, buddy allocator’dan sayfa alıp onları aynı boyutlu nesnelere böler ve hazır nesne havuzları tutar. SLUB, Linux’un bugün kullandığı uygulamadır. Bir kmalloc çağrısına gerçekte cevap veren budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Slab_allocation',
  },
  {
    term: 'per-CPU variables',
    question: {
      en: 'Why give every core its own copy of a variable?',
      tr: 'Neden her çekirdeğe bir değişkenin kendi kopyası verilir?',
    },
    answer: {
      en: 'Because sharing one is expensive in a way that is invisible in the source code. When two cores write the same variable, the cache line holding it has to bounce between their caches, and each bounce costs hundreds of cycles. Give each core a private copy and the traffic disappears entirely. The trade is that reading the total means summing sixteen numbers — usually a fine price for statistics nobody reads on the hot path.',
      tr: 'Çünkü paylaşmak, kaynak kodda görünmeyen bir biçimde pahalıdır. İki çekirdek aynı değişkene yazdığında, onu tutan cache line onların önbellekleri arasında zıplamak zorunda kalır ve her zıplama yüzlerce çevrime mal olur. Her çekirdeğe özel bir kopya ver, trafik tamamen kaybolur. Bedeli, toplamı okumanın on altı sayıyı toplamak anlamına gelmesidir — sıcak yolda kimsenin okumadığı istatistikler için genellikle uygun bir fiyat.',
    },
    href: 'https://en.wikipedia.org/wiki/Thread-local_storage',
  },
  {
    term: 'cache line',
    question: {
      en: 'What is a cache line and why does it matter here?',
      tr: 'Cache line nedir ve burada neden önemli?',
    },
    answer: {
      en: 'Processors do not fetch single bytes from memory; they fetch fixed-size chunks, typically 64 bytes, called cache lines. This has a surprising consequence: two variables that merely sit next to each other behave as one for the purposes of sharing, so two cores updating two unrelated counters can still fight over the same line. Kernel structures are often deliberately padded to keep hot fields on separate lines.',
      tr: 'İşlemciler bellekten tek bayt çekmez; cache line denen, tipik olarak 64 baytlık sabit boyutlu parçalar çeker. Bunun şaşırtıcı bir sonucu vardır: yalnızca yan yana duran iki değişken, paylaşım açısından tek bir şeymiş gibi davranır — yani ilgisiz iki sayacı güncelleyen iki çekirdek yine de aynı satır için kavga edebilir. Kernel yapıları, sıcak alanları ayrı satırlarda tutmak için sıklıkla bilerek doldurulur.',
    },
    href: 'https://en.wikipedia.org/wiki/CPU_cache',
  },
  {
    term: 'GDT',
    question: {
      en: 'What is the Global Descriptor Table?',
      tr: 'Global Descriptor Table nedir?',
    },
    answer: {
      en: 'A table describing regions of memory and the privilege needed to touch them — a leftover from the segmented memory model of early x86. Modern 64-bit Linux uses flat segments covering everything and does its real protection with page tables instead, but the processor still insists the table exist and be loaded. The kernel builds its own early on because the bootloader\'s copy sits in memory about to be reused.',
      tr: 'Bellek bölgelerini ve onlara dokunmak için gereken ayrıcalığı tarif eden bir tablo — erken x86’nın segment tabanlı bellek modelinden kalma. Modern 64-bit Linux her şeyi kapsayan düz segmentler kullanır ve gerçek korumayı bunun yerine page table’larla yapar; ama işlemci hâlâ tablonun var olmasında ve yüklenmesinde ısrar eder. Kernel kendi kopyasını erkenden kurar, çünkü bootloader’ınki birazdan yeniden kullanılacak bellekte durmaktadır.',
    },
    href: 'https://en.wikipedia.org/wiki/Global_Descriptor_Table',
  },
  {
    term: 'IDT',
    question: {
      en: 'What is the Interrupt Descriptor Table?',
      tr: 'Interrupt Descriptor Table nedir?',
    },
    answer: {
      en: 'A table with one entry per interrupt or fault number, each holding the address of the code to run when it occurs. Divide by zero is entry 0, a page fault is entry 14, and so on up through the hardware interrupts. The kernel installs a minimal version early — just enough that an early fault prints something instead of rebooting the machine silently — and the real one later.',
      tr: 'Her kesme ya da fault numarası için bir girdi tutan, her girdide o durum oluştuğunda çalışacak kodun adresi olan bir tablo. Sıfıra bölme 0 numaralı girdi, page fault 14 numaralı girdidir ve donanım kesmelerine kadar böyle sürer. Kernel erkenden asgari bir sürüm kurar — erken bir fault’un makineyi sessizce yeniden başlatmak yerine bir şeyler basmasına yetecek kadar — gerçeğini ise daha sonra.',
    },
    href: 'https://en.wikipedia.org/wiki/Interrupt_descriptor_table',
  },
  {
    term: 'IRQ',
    question: {
      en: 'What is an IRQ?',
      tr: 'IRQ nedir?',
    },
    answer: {
      en: 'A hardware interrupt request — a device telling the processor to stop what it is doing and pay attention. A key was pressed, a disk read finished, a timer expired. Without interrupts the kernel would have to poll every device constantly; with them, the machine can be idle and still respond in microseconds. The kernel runs with interrupts switched off through most of early boot because there is nothing yet capable of handling one.',
      tr: 'Bir donanım kesme talebi — bir aygıtın işlemciye yaptığı şeyi bırakıp ilgilenmesini söylemesi. Bir tuşa basıldı, bir disk okuması bitti, bir zamanlayıcı doldu. Kesmeler olmasa kernel her aygıtı sürekli yoklamak zorunda kalırdı; onlarla birlikte makine boşta durabilir ve yine de mikrosaniyeler içinde cevap verebilir. Kernel erken boot’un çoğunda kesmeler kapalı çalışır, çünkü henüz birini karşılayabilecek hiçbir şey yoktur.',
    },
    href: 'https://en.wikipedia.org/wiki/Interrupt_request',
  },
  {
    term: 'trap / exception',
    question: {
      en: 'What is the difference between an interrupt and a trap?',
      tr: 'Interrupt ile trap arasındaki fark nedir?',
    },
    answer: {
      en: 'An interrupt comes from outside the processor and is unrelated to the instruction being executed — a device wants attention. A trap or exception is raised by the instruction itself: it divided by zero, it touched an unmapped address, it was not a valid instruction. Both end up in the same table, but the second kind is synchronous, reproducible, and usually a bug. Page faults are the exception to that, being a normal and constant part of how memory works.',
      tr: 'Interrupt işlemcinin dışından gelir ve çalışan talimatla ilgisizdir — bir aygıt ilgi ister. Trap ya da exception ise talimatın kendisi tarafından üretilir: sıfıra böldü, haritalanmamış bir adrese dokundu, geçerli bir talimat değildi. İkisi de aynı tabloda son bulur, ama ikinci tür eşzamanlıdır, tekrarlanabilirdir ve genellikle bir hatadır. Page fault bunun istisnasıdır; belleğin çalışma biçiminin normal ve sürekli bir parçasıdır.',
    },
    href: 'https://en.wikipedia.org/wiki/Interrupt',
  },
  {
    term: 'scheduler',
    question: {
      en: 'What does the scheduler actually decide?',
      tr: 'Scheduler tam olarak neye karar verir?',
    },
    answer: {
      en: 'Which task runs on which core, and for how long before it is interrupted and someone else gets a turn. On a machine with sixteen cores and four hundred runnable tasks this decision is made thousands of times a second, and it has to be both fair and fast — the scheduler runs so often that the time spent deciding is itself a real cost. It has to exist before the kernel can create a second thread of execution.',
      tr: 'Hangi görevin hangi çekirdekte ve kesilip sıranın bir başkasına geçmesinden önce ne kadar süre çalışacağı. On altı çekirdekli ve dört yüz çalışabilir görevli bir makinede bu karar saniyede binlerce kez verilir ve hem adil hem hızlı olmalıdır — scheduler o kadar sık çalışır ki karar vermeye harcanan zaman başlı başına gerçek bir maliyettir. Kernel ikinci bir yürütme akışı yaratabilmeden önce var olmak zorundadır.',
    },
    href: 'https://en.wikipedia.org/wiki/Scheduling_(computing)',
  },
  {
    term: 'preemption',
    question: {
      en: 'What does it mean that Linux is preemptive?',
      tr: 'Linux’un preemptive olması ne demek?',
    },
    answer: {
      en: 'That the kernel can take the processor away from a running task without the task cooperating. The alternative — waiting for each task to give up the CPU voluntarily — means one badly written program can freeze the machine. Preemption requires a timer interrupt to create the opportunity, which is why the tick has to be running before the scheduler is genuinely in charge.',
      tr: 'Kernel’in, çalışan bir görevden işlemciyi o görev iş birliği yapmadan alabilmesi. Alternatifi — her görevin CPU’yu gönüllü olarak bırakmasını beklemek — kötü yazılmış tek bir programın makineyi dondurabilmesi demektir. Preemption, fırsatı yaratacak bir timer interrupt gerektirir; tick’in, scheduler gerçekten iş başına geçmeden önce çalışıyor olmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Preemption_(computing)',
  },
  {
    term: 'RCU',
    question: {
      en: 'How can readers safely read data that is being changed, without a lock?',
      tr: 'Okuyucular bir kilit olmadan değişmekte olan veriyi nasıl güvenle okuyabilir?',
    },
    answer: {
      en: 'Read-copy-update never modifies data in place. A writer makes a private copy, changes it, then swaps a single pointer — an operation the processor performs atomically. Readers that started before the swap keep using the old version, which is still perfectly valid; readers that start after see the new one. The old copy is only freed once every core has passed through a point where it certainly holds no reference to it. Readers pay almost nothing, which is why RCU is everywhere in the kernel.',
      tr: 'Read-copy-update veriyi asla yerinde değiştirmez. Yazan özel bir kopya çıkarır, onu değiştirir, sonra tek bir pointer’ı takas eder — işlemcinin atomik olarak yaptığı bir işlem. Takastan önce başlayan okuyucular eski sürümü kullanmaya devam eder ki o sürüm hâlâ tamamen geçerlidir; sonra başlayanlar yenisini görür. Eski kopya, ancak her çekirdek ona kesinlikle referans tutmadığı bir noktadan geçtikten sonra serbest bırakılır. Okuyucular neredeyse hiçbir bedel ödemez; RCU’nun kernel’in her yerinde olmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Read-copy-update',
  },
  {
    term: 'spinlock',
    question: {
      en: 'What is a spinlock and when is busy-waiting the right answer?',
      tr: 'Spinlock nedir ve meşgul bekleme ne zaman doğru cevaptır?',
    },
    answer: {
      en: 'A lock where a core that cannot get in simply loops, checking again, burning cycles until it succeeds. That sounds wasteful, and for a long wait it is — but putting a task to sleep and waking it costs thousands of cycles itself. If the lock is held for less time than that, spinning is genuinely cheaper. Kernel code also spins in places where sleeping is not permitted at all, such as inside an interrupt handler.',
      tr: 'Giremeyen çekirdeğin basitçe döngüye girip tekrar kontrol ettiği, başarana kadar çevrim yaktığı bir kilit. Bu israf gibi geliyor ve uzun bir bekleme için öyle — ama bir görevi uyutup uyandırmak da başlı başına binlerce çevrime mal olur. Kilit bundan daha kısa süre tutuluyorsa, dönmek gerçekten daha ucuzdur. Kernel kodu ayrıca uyumanın hiç izinli olmadığı yerlerde de döner, örneğin bir kesme handler’ının içinde.',
    },
    href: 'https://en.wikipedia.org/wiki/Spinlock',
  },
  {
    term: 'jiffies',
    question: {
      en: 'What are jiffies?',
      tr: 'Jiffies nedir?',
    },
    answer: {
      en: 'A counter of how many timer ticks have occurred since boot. It is the kernel\'s coarse clock — cheap to read, but only as precise as the tick rate, typically 1 to 4 milliseconds. Anything needing better resolution uses a hardware counter instead. The name is old British slang for "a moment", and it predates Linux.',
      tr: 'Boot’tan bu yana kaç timer tick geçtiğini sayan sayaç. Kernel’in kaba saatidir — okuması ucuzdur, ama yalnızca tick hızı kadar hassastır; tipik olarak 1 ila 4 milisaniye. Daha iyi çözünürlük isteyen her şey bunun yerine bir donanım sayacı kullanır. İsim, “bir an” anlamına gelen eski bir İngiliz argosudur ve Linux’tan öncedir.',
    },
    href: 'https://en.wikipedia.org/wiki/Jiffy_(time)',
  },
  {
    term: 'TSC',
    question: {
      en: 'What is the Time Stamp Counter?',
      tr: 'Time Stamp Counter nedir?',
    },
    answer: {
      en: 'A counter inside the processor that increments continuously and can be read in a handful of cycles, making it the fastest source of elapsed time available. It used to be unreliable — it counted actual clock cycles, so it drifted when the CPU changed frequency and differed between cores. Modern chips provide an invariant version that ticks at a constant rate regardless, which is why Linux now selects it as the primary clock source on most machines.',
      tr: 'İşlemcinin içinde sürekli artan ve birkaç çevrimde okunabilen, dolayısıyla mevcut en hızlı geçen-zaman kaynağı olan bir sayaç. Eskiden güvenilmezdi — gerçek saat çevrimlerini sayıyordu, bu yüzden CPU frekans değiştirdiğinde kayıyor ve çekirdekler arasında farklılaşıyordu. Modern yongalar, ne olursa olsun sabit hızda ilerleyen değişmez bir sürüm sunar; Linux’un çoğu makinede onu birincil saat kaynağı olarak seçmesinin sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Time_Stamp_Counter',
  },
  {
    term: 'BogoMIPS',
    question: {
      en: 'What does the BogoMIPS number mean?',
      tr: 'BogoMIPS sayısı ne anlama gelir?',
    },
    answer: {
      en: 'How many iterations of an empty delay loop the processor completes in a known interval. Some drivers need to wait a precise few microseconds for hardware to settle, and this calibrates the loop used to do it. The "Bogo" is short for bogus and was chosen deliberately to warn people it is not a performance measure — a warning that has been ignored in benchmark arguments for thirty years.',
      tr: 'İşlemcinin bilinen bir aralıkta boş bir gecikme döngüsünün kaç yinelemesini tamamladığı. Bazı sürücülerin donanımın oturması için tam olarak birkaç mikrosaniye beklemesi gerekir ve bu, bunu yapmak için kullanılan döngüyü kalibre eder. “Bogo”, sahte anlamına gelen bogus’un kısaltmasıdır ve insanları bunun bir performans ölçüsü olmadığı konusunda uyarmak için bilerek seçilmiştir — otuz yıldır benchmark tartışmalarında görmezden gelinen bir uyarı.',
    },
    href: 'https://en.wikipedia.org/wiki/BogoMips',
  },
  {
    term: 'APIC / IO-APIC',
    question: {
      en: 'What routes an interrupt to the right core?',
      tr: 'Bir kesmeyi doğru çekirdeğe ne yönlendirir?',
    },
    answer: {
      en: 'The Advanced Programmable Interrupt Controller. Each core has a local APIC built into it; a separate IO-APIC on the chipset collects interrupts from devices and delivers them to whichever local APIC should handle them. This is also the mechanism by which one core sends a signal to another — which is precisely how the boot processor wakes the sleeping cores during SMP bringup.',
      tr: 'Advanced Programmable Interrupt Controller. Her çekirdeğin içinde yerleşik bir local APIC vardır; chipset üzerindeki ayrı bir IO-APIC ise aygıtlardan kesmeleri toplar ve onları hangi local APIC işleyecekse ona iletir. Bu aynı zamanda bir çekirdeğin bir diğerine sinyal gönderme mekanizmasıdır — boot işlemcisinin SMP bringup sırasında uyuyan çekirdekleri tam olarak böyle uyandırır.',
    },
    href: 'https://en.wikipedia.org/wiki/Advanced_Programmable_Interrupt_Controller',
  },
  {
    term: 'SMP',
    question: {
      en: 'What does symmetric multiprocessing mean?',
      tr: 'Symmetric multiprocessing ne demek?',
    },
    answer: {
      en: 'That every core is equal: any of them can run any task, and all of them see the same memory. The alternative would be dedicating some cores to specific jobs, which is simpler but wastes capacity. Symmetry is what makes the scheduler\'s job meaningful — it can place work anywhere — and it is also what forces the kernel to protect every shared structure, since any two cores may touch the same thing at the same instant.',
      tr: 'Her çekirdeğin eşit olması: herhangi biri herhangi bir görevi çalıştırabilir ve hepsi aynı belleği görür. Alternatifi bazı çekirdekleri belirli işlere adamak olurdu; bu daha basittir ama kapasiteyi israf eder. Simetri, scheduler’ın işini anlamlı kılan şeydir — işi herhangi bir yere koyabilir — ve aynı zamanda kernel’i her paylaşılan yapıyı korumaya zorlayan şeydir, çünkü herhangi iki çekirdek aynı anda aynı şeye dokunabilir.',
    },
    href: 'https://en.wikipedia.org/wiki/Symmetric_multiprocessing',
  },
  {
    term: 'BSP / AP',
    question: {
      en: 'Why does only one core run the boot?',
      tr: 'Boot’u neden yalnızca bir çekirdek çalıştırır?',
    },
    answer: {
      en: 'Because almost none of early boot is safe to do twice. The firmware elects one core as the bootstrap processor — the BSP — and parks every other core, the application processors, in a halted state where they wait for a signal. The BSP builds the entire system single-threaded, and only once the scheduler and memory management are ready does it wake the others. They then join at the same code path it passed through long before.',
      tr: 'Çünkü erken boot’un neredeyse hiçbir parçası iki kez yapılmaya elverişli değildir. Firmware bir çekirdeği bootstrap processor — BSP — olarak seçer ve diğer her çekirdeği, application processor’ları, bir sinyal bekledikleri durmuş bir durumda park eder. BSP tüm sistemi tek iş parçacıklı olarak kurar ve ancak scheduler ile bellek yönetimi hazır olduğunda diğerlerini uyandırır. Onlar da BSP’nin çok önce geçtiği aynı kod yolundan katılır.',
    },
    href: 'https://en.wikipedia.org/wiki/Multiprocessing',
  },
  {
    term: 'NUMA',
    question: {
      en: 'What is NUMA?',
      tr: 'NUMA nedir?',
    },
    answer: {
      en: 'On a large machine, memory is physically attached to particular processor sockets. A core can reach any of it, but reaching memory attached to another socket takes noticeably longer — non-uniform memory access. The kernel therefore tracks which memory belongs to which node and tries to allocate for a task on the node where it runs. On a single-socket desktop there is one node and none of this matters.',
      tr: 'Büyük bir makinede bellek fiziksel olarak belirli işlemci soketlerine bağlıdır. Bir çekirdek hepsine erişebilir, ama başka bir sokete bağlı belleğe erişmek gözle görülür biçimde daha uzun sürer — non-uniform memory access. Bu yüzden kernel hangi belleğin hangi node’a ait olduğunu takip eder ve bir görev için, çalıştığı node üzerinde ayırmaya çalışır. Tek soketli bir masaüstünde tek bir node vardır ve bunların hiçbiri önemli değildir.',
    },
    href: 'https://en.wikipedia.org/wiki/Non-uniform_memory_access',
  },
  {
    term: 'ACPI',
    question: {
      en: 'What does ACPI tell the kernel?',
      tr: 'ACPI kernel’e ne söyler?',
    },
    answer: {
      en: 'How this particular board is put together — how many CPU cores exist, where the interrupt controllers live, which sleep states the hardware supports, what happens when the lid closes. None of this is discoverable by probing; only the firmware knows it, and it leaves the answers in a set of tables in memory. It is also the mechanism behind the power button: the EC raises an ACPI event and the kernel decides what it means.',
      tr: 'Bu kartın nasıl bir araya getirildiğini — kaç CPU çekirdeği olduğunu, kesme denetleyicilerinin nerede yaşadığını, donanımın hangi uyku durumlarını desteklediğini, kapak kapandığında ne olacağını. Bunların hiçbiri yoklayarak keşfedilemez; yalnızca firmware bilir ve cevapları bellekteki bir tablo kümesinde bırakır. Güç düğmesinin arkasındaki mekanizma da budur: EC bir ACPI olayı üretir ve kernel bunun ne anlama geldiğine karar verir.',
    },
    href: 'https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface',
  },
  {
    term: 'VFS',
    question: {
      en: 'What is the virtual filesystem layer?',
      tr: 'Virtual filesystem katmanı nedir?',
    },
    answer: {
      en: 'The layer that defines what a file and a directory are, independently of any actual filesystem. Because of it, open() works identically whether the file is on ext4, on a network share, inside a compressed archive, or generated on the fly by /proc. Filesystem drivers implement an interface the VFS defines; the rest of the kernel only ever talks to the VFS.',
      tr: 'Bir dosyanın ve bir dizinin ne olduğunu, herhangi bir gerçek dosya sisteminden bağımsız olarak tanımlayan katman. Onun sayesinde open(), dosya ext4’te olsun, bir ağ paylaşımında olsun, sıkıştırılmış bir arşivin içinde olsun ya da /proc tarafından anlık üretiliyor olsun, birebir aynı çalışır. Dosya sistemi sürücüleri VFS’in tanımladığı bir arayüzü uygular; kernel’in geri kalanı yalnızca VFS ile konuşur.',
    },
    href: 'https://en.wikipedia.org/wiki/Virtual_file_system',
  },
  {
    term: 'inode',
    question: {
      en: 'What is an inode?',
      tr: 'Inode nedir?',
    },
    answer: {
      en: 'The record of everything about a file except its name and its contents — size, owner, permissions, timestamps, and where the data blocks are. Names live in directories and point at inodes, which is why one file can have several names (hard links) and why renaming a file does not touch its data. The VFS keeps recently used inodes cached in memory, which is one of the structures set up before any disk is touched.',
      tr: 'Bir dosya hakkında adı ve içeriği dışındaki her şeyin kaydı — boyut, sahip, izinler, zaman damgaları ve veri bloklarının nerede olduğu. İsimler dizinlerde yaşar ve inode’ları işaret eder; bir dosyanın birden çok adı olabilmesinin (hard link) ve bir dosyayı yeniden adlandırmanın verisine dokunmamasının sebebi budur. VFS, yakın zamanda kullanılan inode’ları bellekte önbellekte tutar — bu, hiçbir diske dokunulmadan önce kurulan yapılardan biridir.',
    },
    href: 'https://en.wikipedia.org/wiki/Inode',
  },
  {
    term: 'initramfs',
    question: {
      en: 'Why does Linux need a temporary root filesystem in RAM?',
      tr: 'Linux neden RAM’de geçici bir root filesystem’e ihtiyaç duyar?',
    },
    answer: {
      en: 'Because of a circular dependency: to mount the root filesystem the kernel needs a driver — for the NVMe controller, for the RAID array, for the LUKS encryption on top — and those drivers live as files on the root filesystem it cannot yet mount. The initramfs breaks the loop. GRUB loads it into memory alongside the kernel, it contains exactly the tools needed to reach the real root, and once that is mounted it is discarded and the memory reclaimed.',
      tr: 'Dairesel bir bağımlılık yüzünden: root filesystem’i mount etmek için kernel’in bir sürücüye ihtiyacı vardır — NVMe denetleyicisi için, RAID dizisi için, üstündeki LUKS şifrelemesi için — ve o sürücüler henüz mount edemediği root filesystem’de dosya olarak yaşar. initramfs bu döngüyü kırar. GRUB onu kernel’in yanında belleğe yükler, içinde gerçek köke ulaşmak için gereken araçlar tam olarak bulunur ve o mount edildiğinde atılıp belleği geri alınır.',
    },
    href: 'https://en.wikipedia.org/wiki/Initial_ramdisk',
  },
  {
    term: 'initcall',
    question: {
      en: 'How do thousands of drivers get started in the right order?',
      tr: 'Binlerce sürücü doğru sırayla nasıl başlatılır?',
    },
    answer: {
      en: 'Each driver registers a startup function at compile time by placing a pointer into a special section of the kernel binary. Those sections are grouped into levels — roughly core, then architecture, then subsystems, then devices, then late extras — and the kernel walks them level by level. Ordering by level rather than by explicit dependencies keeps it simple: a disk driver runs after the bus layer because it was placed in a later group, not because anyone wrote down that it depends on it.',
      tr: 'Her sürücü, kernel ikilisinin özel bir bölümüne pointer koyarak derleme anında bir başlatma fonksiyonu kaydeder. Bu bölümler seviyelere ayrılır — kabaca çekirdek, sonra mimari, sonra alt sistemler, sonra aygıtlar, sonra geç eklentiler — ve kernel onları seviye seviye yürür. Açık bağımlılıklar yerine seviyeye göre sıralamak işi basit tutar: bir disk sürücüsü veriyolu katmanından sonra çalışır çünkü daha geç bir gruba konmuştur, birisi ona bağımlı olduğunu yazdığı için değil.',
    },
    href: 'https://en.wikipedia.org/wiki/Booting',
  },
  {
    term: 'sysfs',
    question: {
      en: 'What is the device model, and what is /sys?',
      tr: 'Device model nedir ve /sys nedir?',
    },
    answer: {
      en: 'The kernel keeps an internal tree of every device, bus and driver in the machine, along with how they connect. sysfs exposes that tree as files under /sys, which is how userspace discovers what hardware exists and adjusts it — brightness, CPU governors, which driver is bound to which device. It is built during driver initialisation, which is why /sys is populated long before the real root filesystem is mounted.',
      tr: 'Kernel, makinedeki her aygıtın, veriyolunun ve sürücünün ve bunların nasıl bağlandığının dahili bir ağacını tutar. sysfs bu ağacı /sys altında dosyalar olarak açar; userspace hangi donanımın var olduğunu böyle keşfeder ve ayarlar — parlaklık, CPU governor’ları, hangi sürücünün hangi aygıta bağlı olduğu. Sürücü başlatma sırasında kurulur; /sys’in gerçek root filesystem mount edilmeden çok önce dolmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Sysfs',
  },
  {
    term: 'kthread',
    question: {
      en: 'What is a kernel thread?',
      tr: 'Kernel thread nedir?',
    },
    answer: {
      en: 'A thread that runs entirely inside the kernel and never touches userspace — it has no program, no address space of its own, and cannot be executed by a user. The kernel uses them for work that must happen in the background: writing dirty pages to disk, reclaiming memory, servicing RCU callbacks. They appear in ps with names in square brackets, and all of them descend from PID 2.',
      tr: 'Tamamen kernel içinde çalışan ve userspace’e hiç dokunmayan bir thread — programı yoktur, kendine ait adres uzayı yoktur ve bir kullanıcı tarafından çalıştırılamaz. Kernel bunları arka planda olması gereken işler için kullanır: kirli sayfaları diske yazmak, bellek geri kazanmak, RCU callback’lerine hizmet etmek. ps çıktısında köşeli parantez içindeki isimlerle görünürler ve hepsi PID 2’den türer.',
    },
    href: 'https://en.wikipedia.org/wiki/Thread_(computing)',
  },
  {
    term: 'PID 0 / 1 / 2',
    question: {
      en: 'Why do the first three process IDs matter?',
      tr: 'İlk üç process ID neden önemli?',
    },
    answer: {
      en: 'PID 1 is the ancestor of every userspace process and inherits any process whose parent dies; if it exits, the kernel panics. PID 2 is kthreadd, the parent of every kernel thread. PID 0 is the idle task — what runs when a core has nothing to do, and also, oddly, the thread that performed the entire boot. All three are created within a few lines of each other, and the order is forced: PID 1 must be created before the kernel-thread machinery it will later want to use.',
      tr: 'PID 1 her userspace sürecinin atasıdır ve ebeveyni ölen her süreci devralır; çıkarsa kernel panic verir. PID 2 kthreadd’dir, her kernel thread’in ebeveyni. PID 0 ise idle task’tır — bir çekirdeğin yapacak işi olmadığında çalışan şey ve tuhaf biçimde, tüm boot’u gerçekleştirmiş olan thread. Üçü de birkaç satır arayla yaratılır ve sıra zorunludur: PID 1, sonradan kullanmak isteyeceği kernel thread mekanizmasından önce yaratılmalıdır.',
    },
    href: 'https://en.wikipedia.org/wiki/Process_identifier',
  },
  {
    term: 'ring 0 / ring 3',
    question: {
      en: 'What are protection rings?',
      tr: 'Protection ring nedir?',
    },
    answer: {
      en: 'Privilege levels enforced by the processor itself. Ring 0 can execute any instruction and touch any memory — that is where the kernel runs. Ring 3 cannot change page tables, talk to hardware directly, or disable interrupts — that is where every program runs. x86 defines four rings but Linux uses only these two. Crossing between them is not a jump but a controlled transition through a fixed entry point, which is what makes the boundary meaningful.',
      tr: 'İşlemcinin kendisi tarafından zorlanan ayrıcalık seviyeleri. Ring 0 herhangi bir talimatı çalıştırabilir ve herhangi bir belleğe dokunabilir — kernel orada çalışır. Ring 3 page table’ları değiştiremez, donanımla doğrudan konuşamaz ya da kesmeleri kapatamaz — her program orada çalışır. x86 dört ring tanımlar ama Linux yalnızca bu ikisini kullanır. Aralarında geçmek bir jump değil, sabit bir giriş noktasından kontrollü bir geçiştir; sınırı anlamlı kılan da budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Protection_ring',
  },
  {
    term: 'syscall',
    question: {
      en: 'What actually happens during a system call?',
      tr: 'Bir system call sırasında gerçekte ne olur?',
    },
    answer: {
      en: 'A program cannot call a kernel function directly — that would defeat the whole point of the privilege boundary. Instead it executes a special instruction that transfers control to one fixed kernel entry point while raising the privilege level, with a number in a register saying which service is wanted. The kernel does the work and returns. Starting the first userspace process reuses this exact machinery: the kernel sets up the registers and takes the return half of the path, without there ever having been a call.',
      tr: 'Bir program kernel fonksiyonunu doğrudan çağıramaz — bu, ayrıcalık sınırının tüm anlamını yok ederdi. Bunun yerine, ayrıcalık seviyesini yükseltirken kontrolü tek bir sabit kernel giriş noktasına aktaran özel bir talimat çalıştırır; bir register’da hangi hizmetin istendiğini söyleyen bir numara bulunur. Kernel işi yapar ve döner. İlk userspace sürecini başlatmak tam olarak bu mekanizmayı yeniden kullanır: kernel register’ları kurar ve yolun dönüş yarısını alır — ortada hiç bir çağrı olmamış olmasına rağmen.',
    },
    href: 'https://en.wikipedia.org/wiki/System_call',
  },
  {
    term: 'microcode',
    question: {
      en: 'Why does the kernel load microcode during boot?',
      tr: 'Kernel boot sırasında neden microcode yükler?',
    },
    answer: {
      en: 'Because a modern x86 instruction is not implemented directly in silicon but by a small program inside the processor. That program can be patched, which is how hardware bugs — including Spectre and Meltdown mitigations — get fixed without replacing the chip. The firmware applies one version at power-on; the kernel usually has a newer one and applies it as early as it possibly can, before any decision depends on the buggy behaviour.',
      tr: 'Çünkü modern bir x86 talimatı doğrudan silikonda değil, işlemcinin içindeki küçük bir program tarafından uygulanır. O program yamalanabilir; donanım hatalarının — Spectre ve Meltdown önlemleri dahil — yonga değiştirilmeden düzeltilmesi böyle olur. Firmware güç geldiğinde bir sürüm uygular; kernel genellikle daha yenisine sahiptir ve hatalı davranışa bağlı herhangi bir karar verilmeden önce, mümkün olan en erken anda uygular.',
    },
    href: 'https://en.wikipedia.org/wiki/Microcode',
  },
  {
    term: 'framebuffer',
    question: {
      en: 'How does the kernel put text on screen before the graphics driver loads?',
      tr: 'Kernel, grafik sürücüsü yüklenmeden ekrana nasıl yazı basar?',
    },
    answer: {
      en: 'GRUB set up a display mode and recorded, in the zero page, the address of a region of memory whose contents the graphics hardware scans out as pixels. Writing a byte there changes a pixel — no driver involved. That is enough for the kernel to draw text throughout early boot. Much later the real graphics driver takes over and replaces the whole arrangement, which is the brief flicker you see mid-boot.',
      tr: 'GRUB bir ekran modu kurdu ve zero page’e, içeriğini grafik donanımının piksel olarak taradığı bir bellek bölgesinin adresini kaydetti. Oraya bir bayt yazmak bir pikseli değiştirir — arada sürücü yoktur. Bu, kernel’in erken boot boyunca yazı çizmesine yeter. Çok sonra gerçek grafik sürücüsü devralıp tüm düzeni değiştirir; boot’un ortasında gördüğün kısa titreme budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Framebuffer',
  },
  {
    term: 'NVMe',
    question: {
      en: 'Why does an NVMe drive need its own driver rather than looking like a disk?',
      tr: 'NVMe sürücü neden bir disk gibi görünmek yerine kendi sürücüsüne ihtiyaç duyar?',
    },
    answer: {
      en: 'Because it is not pretending to be a spinning disk. SATA inherited an interface designed around one queue and a mechanical arm; NVMe was designed for flash sitting directly on PCIe, with thousands of queues that different CPU cores can drive independently. The boot log line showing several queues per controller is that design being set up — and it is why the kernel must probe PCI before it can find the drive at all.',
      tr: 'Çünkü dönen bir disk numarası yapmıyor. SATA, tek bir kuyruk ve mekanik bir kol etrafında tasarlanmış bir arayüzü miras aldı; NVMe ise doğrudan PCIe üzerinde duran flash için, farklı CPU çekirdeklerinin bağımsız sürebileceği binlerce kuyrukla tasarlandı. Boot günlüğünde denetleyici başına birkaç kuyruk gösteren satır, bu tasarımın kurulmasıdır — ve kernel’in sürücüyü bulabilmesi için önce PCI’yı taraması gerekmesinin sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/NVM_Express',
  },
  {
    term: 'ext4',
    question: {
      en: 'What does the root filesystem being ext4 actually mean here?',
      tr: 'Root filesystem’in ext4 olması burada ne anlama gelir?',
    },
    answer: {
      en: 'It names the on-disk format the driver has to understand to turn blocks into files. It matters to the boot chain only in one way: the driver for it must be present before the root can be mounted. If it is compiled into the kernel, mounting works directly; if it is a module, it has to come from the initramfs. That single choice is the difference between a machine that boots and one that stops with "unable to mount root fs".',
      tr: 'Sürücünün blokları dosyalara çevirebilmek için anlaması gereken disk üzerindeki biçimi adlandırır. Boot zincirini yalnızca tek bir açıdan ilgilendirir: kök mount edilmeden önce onun sürücüsünün mevcut olması gerekir. Kernel’e derlenmişse mount doğrudan çalışır; bir modülse initramfs’ten gelmelidir. Bu tek tercih, boot eden bir makine ile “unable to mount root fs” diyerek duran bir makine arasındaki farktır.',
    },
    href: 'https://en.wikipedia.org/wiki/Ext4',
  },
  {
    term: 'dynamic linker',
    question: {
      en: 'Why is the first userspace instruction not part of the program that was started?',
      tr: 'Userspace’teki ilk talimat neden başlatılan programın parçası değil?',
    },
    answer: {
      en: 'Because almost every binary on Linux is incomplete when it arrives. The code for printf, malloc and thousands of other functions lives in shared libraries, so that one copy on disk serves every program instead of each carrying its own. Something has to find those libraries and wire them up before the program can run, and that something is the dynamic linker — recorded inside the binary itself, and given control first.',
      tr: 'Çünkü Linux’taki neredeyse her ikili, geldiğinde eksiktir. printf, malloc ve binlerce başka fonksiyonun kodu paylaşılan kütüphanelerde yaşar; böylece diskteki tek bir kopya, her programın kendi kopyasını taşıması yerine hepsine hizmet eder. Program çalışabilmeden önce birinin o kütüphaneleri bulup bağlaması gerekir ve o biri dynamic linker’dır — ikilinin içine kaydedilmiştir ve kontrolü ilk o alır.',
    },
    href: 'https://en.wikipedia.org/wiki/Dynamic_linker',
  },
  {
    term: 'kernel module',
    question: {
      en: 'Why are most drivers not built into the kernel?',
      tr: 'Çoğu sürücü neden kernel’in içine derlenmez?',
    },
    answer: {
      en: 'Because a kernel containing every driver Linux supports would be hundreds of megabytes, and on any one machine almost all of it would be dead weight. Modules let a driver be loaded only when the hardware that needs it is found. The cost is the boot-time chicken-and-egg problem: the module for the root disk cannot be read from the root disk, which is the entire reason the initramfs exists.',
      tr: 'Çünkü Linux’un desteklediği her sürücüyü içeren bir kernel yüzlerce megabayt olurdu ve herhangi bir makinede neredeyse tamamı ölü ağırlık olurdu. Modüller, bir sürücünün yalnızca ona ihtiyaç duyan donanım bulunduğunda yüklenmesini sağlar. Bedeli boot anındaki yumurta-tavuk sorunudur: kök diskin modülü kök diskten okunamaz — initramfs’in var olmasının tek sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Loadable_kernel_module',
  },
  {
    term: 'udev',
    question: {
      en: 'The kernel already found the devices — what is left for udev to do?',
      tr: 'Kernel aygıtları zaten buldu — udev’e ne kalıyor?',
    },
    answer: {
      en: 'Naming and policy, which the kernel deliberately refuses to decide. It reports that a device exists and emits an event; userspace decides what it should be called, what permissions it gets, which driver should own it, and whether to run something when it appears. udev applies those rules and creates the entries under /dev. Until it runs there is nothing to open, however ready the hardware is.',
      tr: 'İsimlendirme ve politika — kernel’in bilerek karar vermeyi reddettiği şeyler. Bir aygıtın var olduğunu bildirir ve bir olay yayar; ne ad taşıyacağına, hangi izinleri alacağına, hangi sürücünün ona sahip olacağına ve göründüğünde bir şey çalıştırılıp çalıştırılmayacağına userspace karar verir. udev bu kuralları uygular ve /dev altındaki girdileri oluşturur. O çalışana kadar, donanım ne kadar hazır olursa olsun, açılacak bir şey yoktur.',
    },
    href: 'https://en.wikipedia.org/wiki/Udev',
  },
  {
    term: 'LUKS / dm-crypt',
    question: {
      en: 'Why does the disk password prompt appear before the system starts?',
      tr: 'Disk parolası neden sistem başlamadan önce sorulur?',
    },
    answer: {
      en: 'Because nothing on an encrypted root can be read until the key is supplied, and the only thing running early enough to ask a person is the small system in RAM. LUKS is the on-disk format holding the encrypted key material; dm-crypt is the kernel layer that creates a virtual device decrypting every block read through it. After that the filesystem driver sees ordinary plaintext and never knows the difference.',
      tr: 'Çünkü şifreli bir kökteki hiçbir şey anahtar verilene kadar okunamaz ve bir insana soracak kadar erken çalışan tek şey RAM’deki küçük sistemdir. LUKS, şifrelenmiş anahtar malzemesini tutan disk üzerindeki biçimdir; dm-crypt ise üzerinden okunan her bloğu deşifre eden sanal bir aygıt oluşturan kernel katmanıdır. Ondan sonra dosya sistemi sürücüsü sıradan düz metin görür ve farkı hiç bilmez.',
    },
    href: 'https://en.wikipedia.org/wiki/Linux_Unified_Key_Setup',
  },
  {
    term: 'LVM',
    question: {
      en: 'What is a logical volume, and why does it need assembling at boot?',
      tr: 'Logical volume nedir ve neden boot’ta kurulması gerekir?',
    },
    answer: {
      en: 'A layer that pools several physical disks or partitions and carves flexible volumes out of the total, so a filesystem can be grown later or moved between drives without repartitioning. That arrangement does not physically exist — it is described in metadata written on each member disk. Something has to read that metadata and present the resulting volume as a device before anything can be mounted from it.',
      tr: 'Birden çok fiziksel diski ya da bölümü havuzlayan ve toplamdan esnek birimler oyan bir katman; böylece bir dosya sistemi sonradan büyütülebilir ya da yeniden bölümlemeye gerek kalmadan sürücüler arasında taşınabilir. Bu düzen fiziksel olarak var değildir — her üye diske yazılmış metadata’da tarif edilir. Üzerinden bir şey mount edilebilmeden önce birinin o metadata’yı okuyup ortaya çıkan birimi bir aygıt olarak sunması gerekir.',
    },
    href: 'https://en.wikipedia.org/wiki/Logical_Volume_Manager_(Linux)',
  },
  {
    term: 'switch_root / pivot_root',
    question: {
      en: 'How can a running system change its own root filesystem?',
      tr: 'Çalışan bir sistem kendi root filesystem’ini nasıl değiştirebilir?',
    },
    answer: {
      en: 'Very carefully, and in one step. A process cannot exist with no root, so there is no safe moment in which the old one is detached and the new one is not yet attached — the kernel call therefore does both at once. It is not the same as chroot, which only narrows what a process can see while leaving the original root mounted. Here the old root is genuinely discarded, and the RAM it occupied is handed back.',
      tr: 'Çok dikkatli biçimde ve tek adımda. Bir süreç köksüz var olamaz, dolayısıyla eskisinin ayrıldığı ve yenisinin henüz bağlanmadığı güvenli bir an yoktur — bu yüzden kernel çağrısı ikisini aynı anda yapar. Bu, yalnızca bir sürecin görebildiğini daraltan ve orijinal kökü mount edilmiş bırakan chroot ile aynı şey değildir. Burada eski kök gerçekten atılır ve kapladığı RAM geri verilir.',
    },
    href: 'https://en.wikipedia.org/wiki/Chroot',
  },
];
