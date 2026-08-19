import type { FaqEntry } from './psuReference';

/**
 * The glossary behind the systemd and login sections.
 *
 * Kept separate from the kernel glossary rather than merged into it: the two
 * halves of the boot use almost disjoint vocabularies, and a single list of
 * sixty-odd terms is worse to scan than two focused ones. Ordered as the terms
 * are first met on the timeline.
 *
 * As everywhere else, term is never localized. Every href was checked to
 * return 200.
 */
export const SYSTEMD_FAQ: FaqEntry[] = [
  {
    term: 'daemon',
    question: {
      en: 'What makes a program a daemon?',
      tr: 'Bir programı daemon yapan nedir?',
    },
    answer: {
      en: 'That it runs in the background with no terminal attached, waiting to do something rather than being told to do it now. Nobody starts a daemon and waits for it to finish — it is expected to still be running tomorrow. Almost everything systemd starts is one, and the name is a very old joke about a helpful background spirit rather than anything sinister.',
      tr: 'Arka planda, bağlı bir terminal olmadan, kendisine şimdi yap denmesi yerine bir şey yapmayı bekleyerek çalışması. Kimse bir daemon başlatıp bitmesini beklemez — yarın da çalışıyor olması beklenir. systemd’nin başlattığı neredeyse her şey birer daemon’dur ve isim, uğursuz bir şeye değil, yardımsever bir arka plan ruhuna dair çok eski bir şakaya dayanır.',
    },
    href: 'https://en.wikipedia.org/wiki/Daemon_(computing)',
  },
  {
    term: 'unit',
    question: {
      en: 'What is a unit?',
      tr: 'Unit nedir?',
    },
    answer: {
      en: 'The single thing systemd manages. A service is a unit, but so is a mounted filesystem, a listening socket, a timer, a device and a group of processes. Giving all of them one shape is what lets a service declare that it needs a filesystem without either of them knowing what the other is — they are both just units with a name and a state.',
      tr: 'systemd’nin yönettiği tek şey. Bir servis bir unit’tir, ama mount edilmiş bir dosya sistemi, dinleyen bir soket, bir zamanlayıcı, bir aygıt ve bir süreç grubu da öyledir. Hepsine tek bir şekil vermek, bir servisin bir dosya sistemine ihtiyacı olduğunu, ikisi de diğerinin ne olduğunu bilmeden bildirebilmesini sağlar — her ikisi de yalnızca adı ve durumu olan birer unit’tir.',
    },
    href: 'https://en.wikipedia.org/wiki/Systemd',
  },
  {
    term: 'unit file',
    question: {
      en: 'Where does systemd learn what a service is?',
      tr: 'systemd bir servisin ne olduğunu nereden öğrenir?',
    },
    answer: {
      en: 'From a short text file — a name, a command to run, and a few lines saying what has to happen before and after. It is declarative: it describes a desired state rather than the steps to reach it, which is the whole difference from the shell scripts it replaced. A script has to handle every case itself; a unit file states its needs and lets the manager work out the order.',
      tr: 'Kısa bir metin dosyasından — bir ad, çalıştırılacak bir komut ve öncesinde ile sonrasında ne olması gerektiğini söyleyen birkaç satır. Bildirimseldir: ona ulaşmak için gereken adımları değil, istenen bir durumu tarif eder; yerini aldığı kabuk betiklerinden tüm farkı budur. Bir betik her durumu kendisi ele almak zorundadır; bir unit dosyası ihtiyaçlarını bildirir ve sırayı yöneticiye bırakır.',
    },
    href: 'https://en.wikipedia.org/wiki/Systemd',
  },
  {
    term: 'target',
    question: {
      en: 'What does a target actually start?',
      tr: 'Bir target gerçekte neyi başlatır?',
    },
    answer: {
      en: 'Nothing. It is a name that becomes true once everything grouped under it has finished, so that other units can wait for one word instead of listing dozens. It replaces the older idea of numbered runlevels, and improves on it in one way that matters: several targets can be reached at once, because they are nodes in a graph rather than rungs on a ladder.',
      tr: 'Hiçbir şeyi. Altında gruplanan her şey bittiğinde doğru hâle gelen bir isimdir; böylece diğer unit’ler onlarcasını listelemek yerine tek bir kelimeyi bekleyebilir. Numaralı runlevel’ların eski fikrinin yerini alır ve önemli bir noktada onu geliştirir: birden çok hedefe aynı anda ulaşılabilir, çünkü bunlar bir merdivenin basamakları değil, bir grafiğin düğümleridir.',
    },
    href: 'https://en.wikipedia.org/wiki/Runlevel',
  },
  {
    term: 'Wants vs Requires',
    question: {
      en: 'What is the difference between Wants and Requires?',
      tr: 'Wants ile Requires arasındaki fark nedir?',
    },
    answer: {
      en: 'How much a failure matters. Requires means that if the dependency fails, this unit fails too. Wants means try to start it, but carry on regardless. It is the single most consequential distinction in a unit file: graphical.target requires the working system beneath it but only wants the login screen, which is exactly why a broken graphics driver drops you to a text console instead of stopping the machine.',
      tr: 'Bir başarısızlığın ne kadar önemli olduğu. Requires, bağımlılık başarısız olursa bu unit’in de başarısız olması demektir. Wants ise onu başlatmayı dene, ama ne olursa olsun devam et demektir. Bir unit dosyasındaki en sonuç doğuran ayrımdır: graphical.target altındaki çalışan sistemi requires eder ama giriş ekranını yalnızca wants eder — bozuk bir grafik sürücüsünün makineyi durdurmak yerine seni metin konsoluna düşürmesinin sebebi tam olarak budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Systemd',
  },
  {
    term: 'generator',
    question: {
      en: 'Why do some units exist in no file you can find?',
      tr: 'Neden bazı unit’ler bulabileceğin hiçbir dosyada yok?',
    },
    answer: {
      en: 'Because a small program wrote them at boot. systemd only understands units, but a machine is full of older configuration — the filesystem table, kernel command-line options, partition layouts. Generators translate those into units at startup and drop the results in a runtime directory that is wiped on every reboot. The unit is real and running; it simply has no permanent file behind it.',
      tr: 'Çünkü onları boot sırasında küçük bir program yazdı. systemd yalnızca unit anlar, ama bir makine eski yapılandırmayla doludur — dosya sistemi tablosu, kernel komut satırı seçenekleri, bölüm düzenleri. Generator’lar bunları başlangıçta unit’lere çevirir ve sonuçları her yeniden başlatmada silinen bir çalışma dizinine bırakır. Unit gerçektir ve çalışmaktadır; yalnızca arkasında kalıcı bir dosya yoktur.',
    },
    href: 'https://en.wikipedia.org/wiki/Systemd',
  },
  {
    term: 'cgroup',
    question: {
      en: 'What is a control group?',
      tr: 'Control group nedir?',
    },
    answer: {
      en: 'A kernel-tracked set of processes that can be measured and limited as one. Two things follow from it, and both are why systemd depends on it. Limits apply to the whole group, so a service can be capped in memory or CPU no matter how many processes it spawns. And membership is inherited and inescapable, so systemd always knows exactly which processes belong to a service — including any that forked away hoping not to.',
      tr: 'Tek bir bütün olarak ölçülüp sınırlanabilen, kernel tarafından takip edilen bir süreç kümesi. Bundan iki şey çıkar ve systemd’nin ona bağlı olmasının sebebi ikisidir. Sınırlar tüm gruba uygulanır, dolayısıyla bir servis kaç süreç doğurursa doğursun bellek ya da CPU olarak sınırlanabilir. Ve üyelik miras alınır ve kaçılamaz, dolayısıyla systemd bir servise hangi süreçlerin ait olduğunu her zaman tam olarak bilir — kaçmayı umarak fork etmiş olanlar dahil.',
    },
    href: 'https://en.wikipedia.org/wiki/Cgroups',
  },
  {
    term: 'slice',
    question: {
      en: 'What is a slice, if a cgroup already exists?',
      tr: 'Cgroup zaten varken slice nedir?',
    },
    answer: {
      en: 'A branch of the cgroup tree, given a name so that limits can be applied to a whole category at once. System services live under one, user sessions under another. Cap the user branch and no runaway program in anybody\'s desktop can starve the services keeping the machine alive — a distinction that used to require careful per-process tuning and now requires one line.',
      tr: 'Cgroup ağacının bir dalı; sınırların bütün bir kategoriye aynı anda uygulanabilmesi için bir ad verilmiştir. Sistem servisleri birinin altında, kullanıcı oturumları bir diğerinin altında yaşar. Kullanıcı dalını sınırla, kimsenin masaüstündeki kaçak bir program makineyi ayakta tutan servisleri aç bırakamasın — eskiden süreç başına dikkatli ayar gerektiren, artık tek satır gerektiren bir ayrım.',
    },
    href: 'https://en.wikipedia.org/wiki/Cgroups',
  },
  {
    term: 'socket activation',
    question: {
      en: 'How can a service be contacted before it has started?',
      tr: 'Bir servise başlamadan önce nasıl ulaşılabilir?',
    },
    answer: {
      en: 'Because systemd opens the listening socket itself and leaves the service unstarted behind it. A client connects, the request sits in the kernel queue, and the service is launched on that first connection — by which time the socket already holds the waiting request, so nothing is lost and the client never sees the delay. Since every service is reachable the moment its socket exists, almost nothing has to be ordered after anything else. The idea is decades old; systemd made it the default rather than the exception.',
      tr: 'Çünkü systemd dinleme soketini kendisi açar ve arkasındaki servisi başlatmadan bırakır. Bir istemci bağlanır, istek kernel kuyruğunda bekler ve servis o ilk bağlantıda başlatılır — o ana kadar soket bekleyen isteği zaten tutmaktadır, dolayısıyla hiçbir şey kaybolmaz ve istemci gecikmeyi hiç görmez. Her servise soketi var olduğu anda ulaşılabildiği için, neredeyse hiçbir şeyin bir başkasından sonraya sıralanması gerekmez. Fikir onlarca yıllıktır; systemd onu istisna olmaktan çıkarıp varsayılan yaptı.',
    },
    href: 'https://en.wikipedia.org/wiki/Inetd',
  },
  {
    term: 'epoll',
    question: {
      en: 'How does one process wait on thousands of things at once?',
      tr: 'Tek bir süreç aynı anda binlerce şeyi nasıl bekler?',
    },
    answer: {
      en: 'By asking the kernel to watch them and report only what became ready. The naive alternatives both fail at scale: a thread per source costs memory and switching, and checking each source in turn costs time proportional to how many there are. This mechanism costs time proportional to how many actually fired. systemd converts signals, timers and process exits into things it can wait on this way, so its whole life is one loop around a single wait.',
      tr: 'Kernel’den onları izlemesini ve yalnızca hazır hâle gelenleri bildirmesini isteyerek. Naif alternatiflerin ikisi de ölçekte çöker: kaynak başına bir thread bellek ve geçiş maliyeti getirir, her kaynağı sırayla yoklamak ise kaç tane olduğuyla orantılı zaman harcar. Bu mekanizma gerçekte kaç tanesinin tetiklendiğiyle orantılı zaman harcar. systemd sinyalleri, zamanlayıcıları ve süreç çıkışlarını bu şekilde bekleyebileceği şeylere çevirir; böylece tüm ömrü tek bir beklemenin etrafındaki bir döngüdür.',
    },
    href: 'https://en.wikipedia.org/wiki/Epoll',
  },
  {
    term: 'D-Bus',
    question: {
      en: 'What is the message bus for?',
      tr: 'Mesaj veriyolu ne işe yarar?',
    },
    answer: {
      en: 'Letting programs call each other by name. Without it, every pair of cooperating programs would invent its own socket and protocol. With it, a program registers a well-known name, others send it structured requests, and a broker routes them — so a desktop can ask the login manager to lock the screen without either knowing where the other lives. Most of what a modern Linux desktop does between processes goes through it.',
      tr: 'Programların birbirini adla çağırabilmesi. O olmadan, iş birliği yapan her program çifti kendi soketini ve protokolünü icat ederdi. Onunla birlikte bir program iyi bilinen bir ad kaydeder, diğerleri ona yapılandırılmış istekler gönderir ve bir aracı bunları yönlendirir — böylece bir masaüstü, giriş yöneticisinden ekranı kilitlemesini, ikisi de diğerinin nerede yaşadığını bilmeden isteyebilir. Modern bir Linux masaüstünün süreçler arasında yaptığı şeyin çoğu buradan geçer.',
    },
    href: 'https://en.wikipedia.org/wiki/D-Bus',
  },
  {
    term: 'journal',
    question: {
      en: 'How does the journal differ from a log file?',
      tr: 'Journal bir log dosyasından nasıl farklı?',
    },
    answer: {
      en: 'A log file is lines of text, and finding anything in it means matching patterns. The journal stores structured records instead — each entry carries which unit produced it, which process, at what boot, at what priority — so a query can ask for one service since the last reboot without any pattern matching at all. It also collects from the kernel buffer, so messages printed before it existed still appear in order.',
      tr: 'Bir log dosyası metin satırlarıdır ve içinde bir şey bulmak desen eşleştirmek demektir. Journal ise yapılandırılmış kayıtlar saklar — her girdi hangi unit’in, hangi sürecin, hangi boot’ta, hangi öncelikte ürettiğini taşır — böylece bir sorgu hiç desen eşleştirmeden, son yeniden başlatmadan bu yana tek bir servisi isteyebilir. Ayrıca kernel tamponundan da toplar, dolayısıyla kendisi var olmadan önce basılan mesajlar da sırayla görünür.',
    },
    href: 'https://en.wikipedia.org/wiki/Systemd',
  },
  {
    term: 'SELinux',
    question: {
      en: 'What does mandatory access control add to normal permissions?',
      tr: 'Zorunlu erişim denetimi normal izinlerin üzerine ne katar?',
    },
    answer: {
      en: 'A rule the owner of a file cannot waive. Ordinary Unix permissions are discretionary: whoever owns a file may open it up to anyone, and root can do anything at all. A mandatory policy sits above that and states what each program is allowed to touch regardless of ownership — so a compromised web server confined by policy still cannot read the password file, even running as root.',
      tr: 'Bir dosyanın sahibinin feragat edemeyeceği bir kural. Sıradan Unix izinleri isteğe bağlıdır: bir dosyanın sahibi onu herkese açabilir ve root her şeyi yapabilir. Zorunlu bir politika bunun üstünde durur ve her programın sahiplikten bağımsız olarak neye dokunabileceğini bildirir — böylece politikayla kısıtlanmış, ele geçirilmiş bir web sunucusu root olarak çalışsa bile parola dosyasını okuyamaz.',
    },
    href: 'https://en.wikipedia.org/wiki/Security-Enhanced_Linux',
  },
  {
    term: 'logind',
    question: {
      en: 'What does logind keep track of?',
      tr: 'logind neyi takip eder?',
    },
    answer: {
      en: 'Who is logged in, from where, and what that entitles them to. It registers each login as a session, ties sessions to physical stations, and hands out access to the graphics, sound and input devices accordingly. That last part is the interesting one: device access follows the session rather than the user account, which is why someone logged in over the network cannot grab the screen of the person sitting at the machine.',
      tr: 'Kimin, nereden giriş yaptığını ve bunun ona neyi hak ettirdiğini. Her girişi bir oturum olarak kaydeder, oturumları fiziksel istasyonlara bağlar ve buna göre grafik, ses ve girdi aygıtlarına erişim dağıtır. İlginç olan son kısımdır: aygıt erişimi kullanıcı hesabını değil oturumu izler — ağ üzerinden giriş yapmış birinin, makinenin başında oturan kişinin ekranını ele geçirememesinin sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Systemd',
  },
  {
    term: 'seat',
    question: {
      en: 'What is a seat?',
      tr: 'Seat nedir?',
    },
    answer: {
      en: 'One physical place a person can sit: a screen, a keyboard and a mouse, grouped as a unit. Most machines have exactly one, but nothing stops a single computer from driving two or three independent stations, each with its own login screen and its own session. The concept exists so that device access can be granted per station rather than per machine, which is what keeps two users at one computer out of each other\'s hardware.',
      tr: 'Bir kişinin oturabileceği tek bir fiziksel yer: bir ekran, bir klavye ve bir fare, tek bir birim olarak gruplanmış. Çoğu makinede tam olarak bir tane vardır, ama tek bir bilgisayarın her biri kendi giriş ekranına ve kendi oturumuna sahip iki üç bağımsız istasyonu sürmesine hiçbir engel yoktur. Kavram, aygıt erişiminin makine başına değil istasyon başına verilebilmesi için vardır — tek bir bilgisayardaki iki kullanıcıyı birbirlerinin donanımından uzak tutan da budur.',
    },
    href: 'https://en.wikipedia.org/wiki/Multiseat_configuration',
  },
  {
    term: 'session',
    question: {
      en: 'What is a login session, technically?',
      tr: 'Teknik olarak bir login session nedir?',
    },
    answer: {
      en: 'A registered claim that a particular user is present, with everything started on their behalf grouped under it. It is what makes logging out mean something: end the session and every process inside it is cleaned up, rather than leaving orphans behind. It also carries the device access granted to that user, which is released the moment the session ends.',
      tr: 'Belirli bir kullanıcının mevcut olduğuna dair kayıtlı bir iddia; onun adına başlatılan her şey altında gruplanır. Çıkış yapmanın bir anlam ifade etmesini sağlayan budur: oturumu bitir, içindeki her süreç temizlensin — arkada yetim bırakmak yerine. Ayrıca o kullanıcıya verilen aygıt erişimini de taşır ve bu erişim oturum biter bitmez geri alınır.',
    },
    href: 'https://en.wikipedia.org/wiki/Login_session',
  },
  {
    term: 'PAM',
    question: {
      en: 'Why does no program check passwords itself?',
      tr: 'Neden hiçbir program parolayı kendisi denetlemez?',
    },
    answer: {
      en: 'Because then every one of them would have to be rewritten whenever the rules changed. Instead the check is delegated to a stack of small plug-in modules described in a text file — one reads the local password database, another might talk to a company directory, another to a fingerprint reader, and each can accept, reject, or ask a further question. Adding two-factor authentication to a machine therefore edits configuration and recompiles nothing.',
      tr: 'Çünkü o zaman kurallar her değiştiğinde hepsinin yeniden yazılması gerekirdi. Bunun yerine denetim, bir metin dosyasında tarif edilen küçük eklenti modüllerinden oluşan bir yığına devredilir — biri yerel parola veritabanını okur, bir diğeri bir şirket dizinine, bir başkası parmak izi okuyucusuna konuşabilir ve her biri kabul edebilir, reddedebilir ya da başka bir soru sorabilir. Dolayısıyla bir makineye iki aşamalı doğrulama eklemek yapılandırmayı düzenler, hiçbir şeyi yeniden derlemez.',
    },
    href: 'https://en.wikipedia.org/wiki/Linux_PAM',
  },
  {
    term: 'display manager',
    question: {
      en: 'What does a display manager do beyond drawing a password box?',
      tr: 'Bir display manager parola kutusu çizmenin ötesinde ne yapar?',
    },
    answer: {
      en: 'It owns the login screen as a long-lived privileged service, which is more work than it sounds. It has to start a display server before anyone has authenticated, run that greeter as an unprivileged user so a bug in it cannot compromise the machine, run the authentication conversation, and then start a completely different session as the real user. It also has to do all of that again on every logout.',
      tr: 'Giriş ekranını uzun ömürlü, ayrıcalıklı bir servis olarak sahiplenir ve bu kulağa geldiğinden fazla iştir. Kimse doğrulanmadan önce bir display server başlatmalı, o greeter’ı ayrıcalıksız bir kullanıcı olarak çalıştırmalı ki içindeki bir hata makineyi ele geçiremesin, doğrulama konuşmasını yürütmeli ve ardından gerçek kullanıcı olarak tamamen farklı bir oturum başlatmalıdır. Ayrıca her çıkışta bunların hepsini yeniden yapmalıdır.',
    },
    href: 'https://en.wikipedia.org/wiki/X_display_manager',
  },
  {
    term: 'Wayland',
    question: {
      en: 'What changed between X and Wayland?',
      tr: 'X ile Wayland arasında ne değişti?',
    },
    answer: {
      en: 'Who is in charge of the screen. Under the older system a display server sat between applications and the hardware, and any client could read any other window — a design from an era when that was a feature. Wayland folds the server into the compositor and gives each application only its own buffer, so a program cannot see or capture another\'s content without being granted it. Simpler, and much harder to spy through.',
      tr: 'Ekranın kimin denetiminde olduğu. Eski sistemde uygulamalarla donanım arasında bir display server dururdu ve herhangi bir istemci başka herhangi bir pencereyi okuyabilirdi — bunun bir özellik sayıldığı bir dönemin tasarımı. Wayland sunucuyu compositor’ın içine katlar ve her uygulamaya yalnızca kendi tamponunu verir; böylece bir program, izin verilmeden bir diğerinin içeriğini göremez ya da yakalayamaz. Daha basit ve içinden gözetlemesi çok daha zor.',
    },
    href: 'https://en.wikipedia.org/wiki/Wayland_(protocol)',
  },
  {
    term: 'X server',
    question: {
      en: 'Why is the older graphics stack still around?',
      tr: 'Eski grafik yığını neden hâlâ ortalıkta?',
    },
    answer: {
      en: 'Because forty years of applications were written against it, and because some drivers still work better under it. Systems that default to the newer protocol keep it as a fallback, and also run a compatibility layer so old applications keep working unchanged. That is why a modern desktop can end up with two display stacks on the same machine, one of them pretending to be the other.',
      tr: 'Çünkü kırk yıllık uygulamalar ona göre yazıldı ve bazı sürücüler hâlâ onun altında daha iyi çalışıyor. Varsayılan olarak yeni protokolü kullanan sistemler onu yedek olarak tutar ve ayrıca eski uygulamalar değişmeden çalışmaya devam etsin diye bir uyumluluk katmanı çalıştırır. Modern bir masaüstünün aynı makinede, biri diğeri gibi davranan iki grafik yığınıyla son bulmasının sebebi budur.',
    },
    href: 'https://en.wikipedia.org/wiki/X_Window_System',
  },
  {
    term: 'loopback',
    question: {
      en: 'Why does the boot configure a network interface that goes nowhere?',
      tr: 'Boot neden hiçbir yere gitmeyen bir ağ arayüzü yapılandırır?',
    },
    answer: {
      en: 'Because a great deal of local communication is written as network code. A program talking to a database on the same machine, or to the message bus, often does it by connecting to an address that loops straight back into the same host without touching any hardware. Configure it late and everything that assumed it works fails in confusing ways, so systemd brings it up among the very first things it does.',
      tr: 'Çünkü yerel iletişimin büyük bir kısmı ağ kodu olarak yazılmıştır. Aynı makinedeki bir veritabanıyla ya da mesaj veriyoluyla konuşan bir program, bunu genellikle hiçbir donanıma dokunmadan doğrudan aynı makineye geri dönen bir adrese bağlanarak yapar. Geç yapılandırırsan, çalıştığını varsayan her şey kafa karıştırıcı biçimlerde başarısız olur; bu yüzden systemd onu yaptığı ilk şeyler arasında ayağa kaldırır.',
    },
    href: 'https://en.wikipedia.org/wiki/Localhost',
  },
  {
    term: 'kernel filesystems',
    question: {
      en: 'What are /proc and /sys, if they hold no files?',
      tr: 'Hiç dosya tutmuyorlarsa /proc ve /sys nedir?',
    },
    answer: {
      en: 'Windows into the kernel dressed as directories. Nothing under them is stored anywhere — reading one runs kernel code and returns the answer as text, and writing one changes a setting. It is a deliberate choice: because they look like files, every tool that already knew how to read a file can inspect the running kernel without learning anything new.',
      tr: 'Dizin kılığına girmiş, kernel’e açılan pencereler. Altlarındaki hiçbir şey bir yerde saklanmaz — birini okumak kernel kodu çalıştırır ve cevabı metin olarak döndürür, birine yazmak bir ayarı değiştirir. Bu bilinçli bir tercihtir: dosya gibi göründükleri için, bir dosyayı okumayı zaten bilen her araç, yeni bir şey öğrenmeden çalışan kernel’i inceleyebilir.',
    },
    href: 'https://en.wikipedia.org/wiki/Unix_filesystem',
  },
];
