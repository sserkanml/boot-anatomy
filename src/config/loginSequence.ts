import type { BootStep } from '../types';
import { RAIL_COLORS } from './constants';

/**
 * From graphical.target to a session belonging to a person.
 *
 * Three projects share this stretch and the paths say which is which: systemd
 * declares the goal and owns the session registry (src/…, units/…), gdm brings
 * up the screen and runs the authentication conversation (daemon/…). Verified
 * against ~/Projects/systemd (v262~devel) and ~/Projects/gdm (51.beta).
 *
 * The display manager is genuinely replaceable — sddm and lightdm sit in the
 * same slot — so the cards name gdm only where the code being cited is gdm's.
 * The shape they all share is the interesting part: a privileged daemon that
 * never touches a password itself, a greeter running as a user with no rights,
 * and a separate short-lived process that does nothing but talk to PAM.
 */
const KERNEL = RAIL_COLORS.kernel;
const DATA = RAIL_COLORS.data;
const LOGIC = RAIL_COLORS.logic;
const VIDEO = RAIL_COLORS.video;

export const LOGIN_SEQUENCE_STEPS: BootStep[] = [
  // --- systemd hands over ----------------------------------------------------
  {
    id: 'login-graphical-target',
    phase: 'os',
    title: { en: 'graphical.target — One Word of Difference', tr: 'graphical.target — Tek Kelimelik Fark' },
    signal: 'graphical.target',
    source: 'units/graphical.target',
    description: {
      en: 'This target needs the working system beneath it and will fail without it, but it only asks for the display manager — it does not insist. That single distinction is why a broken graphics driver leaves you at a text console instead of a dead machine: the strong dependency held, the weak one did not, and the system stayed up on everything below. Almost everyone has met this without knowing it had a name.',
      tr: 'Bu hedef altındaki çalışan sisteme ihtiyaç duyar ve onsuz başarısız olur, ama display manager’ı yalnızca ister — ısrar etmez. Bozuk bir grafik sürücüsünün seni ölü bir makine yerine metin konsolunda bırakmasının sebebi tam olarak bu tek ayrımdır: güçlü bağımlılık tuttu, zayıf olan tutmadı ve sistem altındaki her şeyin üzerinde ayakta kaldı. Neredeyse herkes bununla, bir adı olduğunu bilmeden karşılaşmıştır.',
    },
    duration: 5600,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['cpu', 'pcie'],
    console: [
      'graphical.target: Requires=multi-user.target',
      'graphical.target: Wants=display-manager.service',
    ],
    signals: [{ route: ['cpu', 'pcie'], color: KERNEL, particles: 9, spread: 0.5 }],
  },
  {
    id: 'login-display-manager-alias',
    phase: 'os',
    title: { en: 'A Service With No File', tr: 'Dosyası Olmayan Bir Servis' },
    signal: 'display-manager.service',
    description: {
      en: 'systemd asks for a service by a name that no package actually ships. Whichever login screen the distribution installs claims the name for itself, so the same target works unchanged whether the machine ends up with GNOME, KDE or something lighter. It is a deliberate hole in the dependency graph, left for someone else to fill.',
      tr: 'systemd, hiçbir paketin gerçekte dağıtmadığı bir adla bir servis ister. Dağıtımın kurduğu giriş ekranı hangisiyse o adı kendine mal eder; böylece makinede GNOME da olsa KDE de olsa daha hafif bir şey de olsa aynı hedef değişmeden çalışır. Bağımlılık grafiğinde, doldurulması bir başkasına bırakılmış bilinçli bir boşluktur.',
    },
    duration: 5000,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['cpu', 'm2'],
    console: ['display-manager.service -> /usr/lib/systemd/system/gdm.service'],
    signals: [{ route: ['m2', 'cpu'], color: DATA, particles: 8, spread: 0.5 }],
  },

  // --- the daemon comes up ---------------------------------------------------
  {
    id: 'login-gdm-start',
    phase: 'os',
    title: { en: 'Only root May Run This', tr: 'Bunu Yalnızca root Çalıştırabilir' },
    signal: 'gdm main()',
    source: 'daemon/main.c:211',
    description: {
      en: 'The daemon refuses to start unless it is running as root, and it checks this in its first few lines. The reason is what it will shortly be asked to do: hand a screen and a keyboard to a person it has not yet identified, then become that person. Nothing without full privilege can do the second half of that, so there is no point starting.',
      tr: 'Servis, root olarak çalışmıyorsa başlamayı reddeder ve bunu ilk birkaç satırında denetler. Sebebi, birazdan kendisinden istenecek şeydir: henüz kimliğini belirlemediği bir kişiye bir ekran ve klavye devretmek, sonra o kişi olmak. Tam ayrıcalığı olmayan hiçbir şey bunun ikinci yarısını yapamaz, dolayısıyla başlamanın anlamı yoktur.',
    },
    duration: 5200,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['cpu', 'm2'],
    console: [
      '[  OK  ] Started GNOME Display Manager.',
      'gdm[512]: GDM 51 starting, uid=0',
    ],
    signals: [{ route: ['m2', 'cpu'], color: KERNEL, particles: 9, spread: 0.5 }],
  },
  {
    id: 'login-gdm-bus',
    phase: 'os',
    title: { en: 'Claiming a Name Others Can Call', tr: 'Başkalarının Çağırabileceği Bir Adı Almak' },
    signal: 'on_name_acquired()',
    source: 'daemon/main.c:314',
    description: {
      en: 'Before doing anything visible, the daemon registers a well-known name on the message bus and waits to be told it owns it. Only then does it start creating screens. This ordering matters: a second copy of the daemon starting by accident would fail to claim the name and exit rather than fight over the hardware, and everything that wants to ask the login manager something now has an address to send to.',
      tr: 'Görünür bir şey yapmadan önce servis, mesaj veriyolunda iyi bilinen bir ad kaydeder ve o adın sahibi olduğunun söylenmesini bekler. Ancak ondan sonra ekran oluşturmaya başlar. Bu sıra önemlidir: kazara başlayan ikinci bir kopya adı alamayıp donanım için kavga etmek yerine çıkar ve giriş yöneticisine bir şey sormak isteyen her şeyin artık göndereceği bir adresi olur.',
    },
    duration: 5000,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['cpu', 'chipset'],
    console: ['gdm[512]: acquired name org.gnome.DisplayManager'],
    signals: [
      { route: ['cpu', 'chipset'], color: DATA, label: 'D-Bus name', particles: 9, spread: 0.5 },
    ],
  },
  {
    id: 'login-gdm-manager',
    phase: 'os',
    title: { en: 'The Object That Owns Everything', tr: 'Her Şeyin Sahibi Olan Nesne' },
    signal: 'gdm_manager_new()',
    source: 'daemon/gdm-manager.c:2677',
    description: {
      en: 'One long-lived object is created and everything else hangs off it: the list of screens, the sessions in progress, the connection to the bus. It is deliberately not the thing that draws anything or checks any password — it delegates both. Keeping the privileged part small and giving it no user-facing work is the design decision the whole rest of this section follows from.',
      tr: 'Uzun ömürlü tek bir nesne oluşturulur ve diğer her şey ona asılır: ekranların listesi, süren oturumlar, veriyolu bağlantısı. Bilerek, bir şey çizen ya da bir parolayı denetleyen şey değildir — ikisini de devreder. Ayrıcalıklı parçayı küçük tutmak ve ona kullanıcıya bakan hiçbir iş vermemek, bu bölümün geri kalanının tamamının kendisinden çıktığı tasarım kararıdır.',
    },
    duration: 5000,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['cpu'],
    console: ['gdm[512]: GdmManager: enabling daemon'],
    signals: [],
  },
  {
    id: 'login-display-factory',
    phase: 'os',
    title: { en: 'Asking logind Where People Can Sit', tr: 'logind’e İnsanların Nereye Oturabileceğini Sormak' },
    signal: 'gdm_local_display_factory_create_display()',
    source: 'daemon/gdm-local-display-factory.c:175',
    description: {
      en: 'A machine can have more than one screen-and-keyboard pair, and each is a separate place a different person could sit. Rather than assume, gdm asks logind which of these exist and creates one display object per station — so two people at two monitors get two independent login prompts instead of fighting over one. The factory keeps listening afterwards, which is how plugging in a second graphics card produces a second login screen without restarting anything.',
      tr: 'Bir makinede birden fazla ekran-klavye çifti olabilir ve her biri farklı bir kişinin oturabileceği ayrı bir yerdir. gdm varsaymak yerine bunlardan hangilerinin var olduğunu logind’e sorar ve istasyon başına bir display nesnesi oluşturur — böylece iki monitördeki iki kişi biri için kavga etmek yerine iki bağımsız giriş istemi alır. Fabrika sonrasında da dinlemeye devam eder; ikinci bir ekran kartı takmanın hiçbir şeyi yeniden başlatmadan ikinci bir giriş ekranı üretmesinin sebebi budur.',
    },
    duration: 5400,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['chipset', 'pcie'],
    console: ['gdm[512]: creating display for seat0', 'GdmLocalDisplay: /dev/dri/card0'],
    signals: [
      { route: ['chipset', 'pcie'], color: LOGIC, label: 'seat0', particles: 10, spread: 0.55 },
    ],
  },
  {
    id: 'login-display-prepare',
    phase: 'os',
    title: { en: 'A Screen Has Four States', tr: 'Bir Ekranın Dört Durumu Var' },
    signal: 'gdm_display_prepare()',
    source: 'daemon/gdm-display.c:301',
    description: {
      en: 'A display moves through a fixed sequence — unmanaged, prepared, managed, finished — and each transition has to complete before the next can begin. It sounds like bureaucracy but it is what makes logging out safe: tearing a screen down has as many steps as building one up, and a state machine is what stops the daemon from starting a new session on hardware the old one has not finished releasing.',
      tr: 'Bir display sabit bir diziden geçer — yönetilmeyen, hazırlanmış, yönetilen, bitmiş — ve her geçiş, bir sonrakine başlanabilmesi için tamamlanmalıdır. Bürokrasi gibi geliyor ama çıkış yapmayı güvenli kılan şey budur: bir ekranı yıkmanın, kurmak kadar çok adımı vardır ve bir durum makinesi, servisin eskisinin bırakmayı bitirmediği donanımda yeni bir oturum başlatmasını engelleyen şeydir.',
    },
    duration: 5000,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['pcie', 'cpu'],
    console: ['GdmDisplay: UNMANAGED -> PREPARED'],
    signals: [{ route: ['cpu', 'pcie'], color: LOGIC, particles: 8, spread: 0.5 }],
  },

  // --- the greeter -----------------------------------------------------------
  {
    id: 'login-launch-env',
    phase: 'os',
    title: { en: 'A Sandbox for the Login Screen', tr: 'Giriş Ekranı için Bir Kum Havuzu' },
    signal: 'gdm_create_greeter_launch_environment()',
    source: 'daemon/gdm-launch-environment.c:973',
    description: {
      en: 'The login screen is a graphical program, and graphical programs have bugs. So it is not run as root — a dedicated account exists whose only purpose is to own it, with no home worth stealing and no rights worth having. It gets its own session registered with logind, its own environment, and access to exactly the devices for its one station. A flaw in the greeter therefore compromises an account that can do nothing.',
      tr: 'Giriş ekranı bir grafik programdır ve grafik programların hataları olur. Bu yüzden root olarak çalıştırılmaz — tek amacı ona sahip olmak olan, çalınmaya değer bir ev dizini ve sahip olunmaya değer hakları bulunmayan adanmış bir hesap vardır. logind’e kayıtlı kendi oturumunu, kendi ortamını ve yalnızca kendi istasyonunun aygıtlarına erişimi alır. Dolayısıyla greeter’daki bir açık, hiçbir şey yapamayan bir hesabı ele geçirir.',
    },
    duration: 5600,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['pcie', 'cpu'],
    console: ['gdm-launch-environment: user gdm, seat seat0', 'session-type=wayland'],
    signals: [
      { route: ['cpu', 'pcie'], color: VIDEO, label: 'greeter session', particles: 10, spread: 0.55 },
    ],
  },
  {
    id: 'login-greeter-start',
    phase: 'os',
    title: { en: 'Something to Draw With', tr: 'Çizecek Bir Şey' },
    signal: 'gdm_launch_environment_start()',
    source: 'daemon/gdm-launch-environment.c:565',
    description: {
      en: 'Before anything can appear there has to be a program that owns the graphics card and decides what goes where. Modern systems start a compositor speaking the newer protocol, and fall back to the older display server if the driver cannot manage it — which is why some machines end up running two very different graphics stacks for the same job, one pretending to be the other.',
      tr: 'Bir şey belirebilmeden önce, ekran kartının sahibi olan ve neyin nereye gideceğine karar veren bir program olmalıdır. Modern sistemler yeni protokolü konuşan bir compositor başlatır ve sürücü onu kaldıramıyorsa eski display server’a düşer — bazı makinelerin aynı iş için, biri diğeri gibi davranan çok farklı iki grafik yığınıyla son bulmasının sebebi budur.',
    },
    duration: 5400,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['pcie', 'cpu'],
    console: ['gdm[512]: launching greeter session', 'gnome-shell --mode=gdm'],
    signals: [
      { route: ['cpu', 'pcie'], color: VIDEO, label: 'compositor', particles: 11, spread: 0.6 },
    ],
  },
  {
    id: 'login-first-frame',
    phase: 'os',
    title: { en: 'The First Frame Anyone Sees', tr: 'Herkesin Gördüğü İlk Kare' },
    signal: 'greeter ready',
    description: {
      en: 'The greeter draws a list of users and a password field, and sends its first frame down the cable. Everything in this project has led to this image — the moment the machine stops talking to itself and asks a person a question. Mechanically it is just another program in a cgroup with a session id, no more privileged than a text editor, which is exactly the point.',
      tr: 'Greeter bir kullanıcı listesi ve bir parola alanı çizer ve ilk karesini kablodan gönderir. Bu projedeki her şey bu görüntüye çıkmıştır — makinenin kendi kendine konuşmayı bırakıp bir insana soru sorduğu an. Mekanik olarak, bir oturum kimliğine sahip bir cgroup içindeki başka bir programdır sadece; bir metin düzenleyiciden daha ayrıcalıklı değil, ki asıl mesele de budur.',
    },
    duration: 6000,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'pcie', 'display'],
    console: ['gdm-session: greeter ready', 'first frame presented'],
    signals: [
      { route: ['cpu', 'pcie'], color: VIDEO, label: 'framebuffer', particles: 10, spread: 0.45 },
      { route: ['pcie', 'display'], color: VIDEO, label: 'DisplayPort', particles: 14, delay: 0.3, spread: 0.5, persist: true },
    ],
  },

  // --- privilege separation and PAM ------------------------------------------
  {
    id: 'login-worker-fork',
    phase: 'os',
    title: { en: 'A Separate Process for the Password', tr: 'Parola için Ayrı Bir Süreç' },
    signal: 'gdm_session_worker_job_spawn()',
    source: 'daemon/gdm-session-worker-job.c:248',
    description: {
      en: 'The daemon does not check the password itself. It forks a short-lived helper whose entire existence is one authentication conversation, and talks to it over a private channel. Two things follow. A crash or an exploit in the code handling untrusted input takes down a process that will be discarded anyway, not the manager of every screen on the machine. And that helper is the thing that will change into the user, which is a one-way trip a long-lived daemon could never take.',
      tr: 'Servis parolayı kendisi denetlemez. Tüm varlığı tek bir doğrulama konuşmasından ibaret olan kısa ömürlü bir yardımcı fork eder ve onunla özel bir kanal üzerinden konuşur. Bundan iki şey çıkar. Güvenilmeyen girdiyi işleyen koddaki bir çökme ya da açık, zaten atılacak olan bir süreci düşürür; makinedeki her ekranın yöneticisini değil. Ve o yardımcı, kullanıcıya dönüşecek olan şeydir — uzun ömürlü bir servisin asla çıkamayacağı tek yönlü bir yolculuk.',
    },
    duration: 5800,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'display'],
    console: ['gdm[512]: forked worker pid 612 for service gdm-password'],
    signals: [
      { route: ['cpu', 'cpu'], color: LOGIC, label: 'fork()', particles: 10, spread: 0.5 },
    ],
  },
  {
    id: 'login-pam-start',
    phase: 'os',
    title: { en: 'Building the Stack of Questions', tr: 'Soru Yığınını Kurmak' },
    signal: 'gdm_session_worker_initialize_pam()',
    source: 'daemon/gdm-session-worker.c:1222',
    description: {
      en: 'The worker names a service — here, the one for password logins — and a stack of plug-in modules is assembled from the text file with that name. What ends up in the stack is entirely the administrator\'s choice: the local password file, a company directory, a fingerprint reader, a hardware token. The program has no idea which; it only knows it will be asking and answering.',
      tr: 'Yardımcı bir servis adı verir — burada parolayla giriş için olanı — ve o adı taşıyan metin dosyasından bir eklenti modülü yığını derlenir. Yığında ne olacağı tamamen yöneticinin tercihidir: yerel parola dosyası, bir şirket dizini, bir parmak izi okuyucusu, bir donanım anahtarı. Programın hangisi olduğuna dair hiçbir fikri yoktur; yalnızca soracağını ve cevaplayacağını bilir.',
    },
    duration: 5400,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'm2', 'display'],
    console: ['gdm-session-worker[612]: pam_start("gdm-password")'],
    signals: [{ route: ['m2', 'cpu'], color: DATA, label: 'PAM stack', particles: 9, spread: 0.55 }],
  },
  {
    id: 'login-pam-auth',
    phase: 'os',
    title: { en: 'Are You Who You Say You Are?', tr: 'Söylediğin Kişi misin?' },
    signal: 'gdm_session_worker_authenticate_user()',
    source: 'daemon/gdm-session-worker.c:1373',
    description: {
      en: 'The first of four distinct questions, and the only one most people know about. The stack is walked and each module may accept, reject, or ask something — which is why a fingerprint prompt and a password prompt can appear from the same code without the login screen knowing the difference. The greeter is only a messenger here: it renders whatever question the stack sends up and passes the answer back.',
      tr: 'Dört ayrı sorunun ilki ve çoğu insanın bildiği tek soru. Yığın dolaşılır ve her modül kabul edebilir, reddedebilir ya da bir şey sorabilir — bir parmak izi istemi ile bir parola isteminin, giriş ekranı farkı bilmeden aynı koddan çıkabilmesinin sebebi budur. Greeter burada yalnızca bir habercidir: yığının gönderdiği soruyu çizer ve cevabı geri iletir.',
    },
    duration: 5600,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['display', 'cpu'],
    console: ['pam_unix(gdm-password:auth): authentication success; user=serkan'],
    signals: [
      { route: ['display', 'cpu'], color: DATA, label: 'credentials', particles: 12, spread: 0.55 },
    ],
  },
  {
    id: 'login-pam-account',
    phase: 'os',
    title: { en: 'Correct Password, Still Refused', tr: 'Parola Doğru, Yine de Reddedildi' },
    signal: 'gdm_session_worker_authorize_user()',
    source: 'daemon/gdm-session-worker.c:1449',
    description: {
      en: 'Proving who you are and being allowed in are separate questions, and this is the second one. An account can be expired, locked, restricted to certain hours, or forbidden on this particular machine — all with a perfectly correct password. If the check comes back saying the password itself has expired, the stack is asked to change it right here, which is why some logins turn into a password-change prompt before the desktop ever appears.',
      tr: 'Kim olduğunu kanıtlamak ile içeri alınmak ayrı sorulardır ve bu ikincisidir. Bir hesap süresi dolmuş, kilitlenmiş, belirli saatlerle sınırlanmış ya da bu makinede yasaklanmış olabilir — hepsi de kusursuz doğru bir parolayla. Denetim parolanın süresinin dolduğunu söyleyerek dönerse, yığından onu hemen burada değiştirmesi istenir; bazı girişlerin masaüstü hiç belirmeden önce parola değiştirme istemine dönüşmesinin sebebi budur.',
    },
    duration: 5400,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'm2', 'display'],
    console: ['pam_unix(gdm-password:account): account valid', 'pam_acct_mgmt: PAM_SUCCESS'],
    signals: [{ route: ['cpu', 'm2'], color: LOGIC, particles: 8, spread: 0.5 }],
  },
  {
    id: 'login-pam-cred',
    phase: 'os',
    title: { en: 'Collecting What You Are Owed', tr: 'Hak Ettiklerini Toplamak' },
    signal: 'gdm_session_worker_accredit_user()',
    source: 'daemon/gdm-session-worker.c:1704',
    description: {
      en: 'The third question is not about permission but about equipment: group memberships, network authentication tickets, keys to unlock an encrypted home directory. These are things the user is entitled to and cannot fetch for themselves, so they are established here, while the process still has the privilege to do it and before it gives that privilege away for good.',
      tr: 'Üçüncü soru izinle değil, teçhizatla ilgilidir: grup üyelikleri, ağ doğrulama biletleri, şifreli bir ev dizinini açacak anahtarlar. Bunlar kullanıcının hak ettiği ve kendisinin getiremeyeceği şeylerdir; dolayısıyla burada, süreç hâlâ bunu yapacak ayrıcalığa sahipken ve o ayrıcalığı temelli devretmeden önce kurulurlar.',
    },
    duration: 5600,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'm2', 'display'],
    console: ['pam_setcred: PAM_ESTABLISH_CRED', 'gdm-session-worker[612]: groups: wheel, audio, video'],
    signals: [{ route: ['m2', 'cpu'], color: DATA, particles: 9, spread: 0.55 }],
  },
  {
    id: 'login-pam-session',
    phase: 'os',
    title: { en: 'The Session Opens', tr: 'Oturum Açılıyor' },
    signal: 'gdm_session_worker_open_session()',
    source: 'daemon/gdm-session-worker.c:2334',
    description: {
      en: 'The fourth and last question is really an instruction: set up everything that should exist while this person is logged in. Modules mount the home directory, start a keyring, record the login in the system\'s accounting, and — the one that matters most here — call into logind to register the session. This is where the two projects meet, and everything downstream depends on it having happened.',
      tr: 'Dördüncü ve son soru aslında bir talimattır: bu kişi giriş yapmışken var olması gereken her şeyi kur. Modüller ev dizinini mount eder, bir anahtarlık başlatır, girişi sistemin kayıtlarına işler ve — burada en önemlisi — oturumu kaydetmek için logind’i çağırır. İki projenin buluştuğu yer burasıdır ve aşağıdaki her şey bunun gerçekleşmiş olmasına bağlıdır.',
    },
    duration: 5600,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'm2', 'display'],
    console: ['pam_systemd(gdm-password:session): New session 2', 'pam_open_session: PAM_SUCCESS'],
    signals: [
      { route: ['cpu', 'm2'], color: KERNEL, label: 'open_session', particles: 10, spread: 0.55 },
    ],
  },

  // --- the session -----------------------------------------------------------
  {
    id: 'login-logind-session',
    phase: 'os',
    title: { en: 'Registered as Present', tr: 'Mevcut Olarak Kaydedildi' },
    signal: 'CreateSession',
    source: 'src/login/logind-dbus.c:884',
    description: {
      en: 'logind records who logged in and at which station, and hands that user control of the graphics, sound and input devices for as long as they are there. Device access follows the session rather than the account, which is the mechanism behind something people rely on daily without noticing: someone logged in over the network cannot take the screen of the person sitting at the machine.',
      tr: 'logind kimin, hangi istasyonda giriş yaptığını kaydeder ve o kullanıcıya, orada olduğu sürece grafik, ses ve girdi aygıtlarının denetimini verir. Aygıt erişimi hesabı değil oturumu izler; insanların her gün fark etmeden güvendiği bir şeyin arkasındaki mekanizma budur: ağ üzerinden giriş yapmış biri, makinenin başında oturan kişinin ekranını alamaz.',
    },
    duration: 5400,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'pcie', 'display'],
    console: [
      'systemd-logind[401]: New session 2 of user serkan.',
      'session 2: seat0, type=wayland, class=user',
    ],
    signals: [
      { route: ['cpu', 'pcie'], color: LOGIC, particles: 9, spread: 0.5 },
    ],
  },
  {
    id: 'login-switch-or-start',
    phase: 'os',
    title: { en: 'Jump to It, Rather Than Start It', tr: 'Başlatmak Yerine Ona Atla' },
    signal: 'switch_to_compatible_user_session()',
    source: 'daemon/gdm-manager.c:581',
    description: {
      en: 'Before starting a desktop, gdm checks whether this user already has one running somewhere else — on another virtual console, left behind when they switched away. If so it does not start a second: it switches the screen to the existing one, and the user finds their windows exactly as they left them. This is the whole mechanism behind fast user switching, and it is one condition in one function.',
      tr: 'Bir masaüstü başlatmadan önce gdm, bu kullanıcının başka bir yerde çalışan bir masaüstü olup olmadığına bakar — başka bir sanal konsolda, geçiş yaptığında geride bırakılmış olabilir. Varsa ikincisini başlatmaz: ekranı mevcut olana çevirir ve kullanıcı pencerelerini tam olarak bıraktığı gibi bulur. Hızlı kullanıcı değiştirmenin arkasındaki tüm mekanizma budur ve tek bir fonksiyondaki tek bir koşuldur.',
    },
    duration: 5400,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'pcie', 'display'],
    console: ['GdmManager: start or jump to session', 'GdmManager: migrated: 0'],
    signals: [{ route: ['cpu', 'pcie'], color: LOGIC, particles: 8, spread: 0.5 }],
  },
  {
    id: 'login-user-systemd',
    phase: 'os',
    title: { en: 'A systemd of Your Own', tr: 'Sana Ait Bir systemd' },
    signal: 'user@1000.service',
    source: 'units/user@.service.in',
    description: {
      en: 'A second copy of systemd starts, running as the user and managing only their programs — the same manager, the same kind of unit files, a private scope. The greeter that asked the question is torn down, its throwaway account released, and the desktop takes the screen. The chain that began when someone pressed a button ends with the machine handing itself over to a person.',
      tr: 'systemd’nin ikinci bir kopyası başlar; kullanıcı olarak çalışır ve yalnızca onun programlarını yönetir — aynı yönetici, aynı türden unit dosyaları, özel bir kapsam. Soruyu soran greeter yıkılır, tek kullanımlık hesabı serbest bırakılır ve masaüstü ekranı devralır. Birinin bir düğmeye basmasıyla başlayan zincir, makinenin kendini bir insana devretmesiyle biter.',
    },
    duration: 6000,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'pcie', 'display', 'm2'],
    console: [
      '[  OK  ] Started User Manager for UID 1000.',
      'gdm[512]: greeter session stopped',
      '[  OK  ] Reached target Graphical Interface.',
    ],
    signals: [
      { route: ['cpu', 'm2'], color: KERNEL, particles: 9, spread: 0.45 },
      { route: ['cpu', 'pcie'], color: VIDEO, particles: 9, delay: 0, spread: 0.45 },
      { route: ['pcie', 'display'], color: VIDEO, particles: 12, delay: 0.35, spread: 0.5, persist: true },
    ],
  },
];
