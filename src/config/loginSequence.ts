import type { BootStep } from '../types';
import { RAIL_COLORS } from './constants';

/**
 * From graphical.target to a session belonging to a person.
 *
 * Three projects share this stretch and the paths say which is which: systemd
 * declares the goal and owns the session registry (src/…, units/…), gdm draws
 * the screen and runs the authentication conversation (daemon/…). Verified
 * against ~/Projects/systemd (v262~devel) and ~/Projects/gdm (51.beta).
 *
 * The display manager is genuinely replaceable — sddm and lightdm sit in the
 * same slot — so the cards name gdm only where the code being cited is gdm's.
 */
const KERNEL = RAIL_COLORS.kernel;
const DATA = RAIL_COLORS.data;
const LOGIC = RAIL_COLORS.logic;
const VIDEO = RAIL_COLORS.video;

export const LOGIN_SEQUENCE_STEPS: BootStep[] = [
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
  {
    id: 'login-gdm-start',
    phase: 'os',
    title: { en: 'The Login Screen Daemon Starts', tr: 'Giriş Ekranı Servisi Başlıyor' },
    signal: 'gdm main()',
    source: 'daemon/main.c:211',
    description: {
      en: 'What starts here is not the login screen itself but the thing that manages login screens — a daemon that will outlive many of them, since it has to put a fresh one up every time somebody logs out. It runs as root, because handing a screen and a keyboard to an unprivileged user is a privileged act, and it keeps that role for the whole life of the machine.',
      tr: 'Burada başlayan şey giriş ekranının kendisi değil, giriş ekranlarını yöneten şeydir — birçoğundan daha uzun yaşayacak bir servis, çünkü biri her çıkış yaptığında yenisini koymak zorundadır. root olarak çalışır, çünkü bir ekranı ve klavyeyi ayrıcalıksız bir kullanıcıya devretmek ayrıcalıklı bir eylemdir ve bu rolü makinenin tüm ömrü boyunca korur.',
    },
    duration: 5200,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['cpu', 'chipset'],
    console: ['[  OK  ] Started GNOME Display Manager.', 'gdm[512]: GdmManager: enabling daemon'],
    signals: [{ route: ['cpu', 'chipset'], color: KERNEL, particles: 9, spread: 0.5 }],
  },
  {
    id: 'login-display-factory',
    phase: 'os',
    title: { en: 'Claiming the Screen and Keyboard', tr: 'Ekranı ve Klavyeyi Sahiplenmek' },
    signal: 'gdm_local_display_factory_create_display()',
    source: 'daemon/gdm-local-display-factory.c:175',
    description: {
      en: 'A machine can have more than one screen-and-keyboard pair, and each is a separate place a different person could sit. gdm asks logind which of these exist and creates one display object per physical station, so two people at two monitors get two independent login prompts rather than fighting over one. On an ordinary desktop there is exactly one, and it is the one attached to the graphics card.',
      tr: 'Bir makinede birden fazla ekran-klavye çifti olabilir ve her biri, farklı bir kişinin oturabileceği ayrı bir yerdir. gdm bunlardan hangilerinin var olduğunu logind’e sorar ve her fiziksel istasyon için bir display nesnesi oluşturur; böylece iki monitörde iki kişi, biri için kavga etmek yerine iki bağımsız giriş istemi alır. Sıradan bir masaüstünde tam olarak bir tane vardır ve o da ekran kartına bağlı olandır.',
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
    id: 'login-compositor',
    phase: 'os',
    title: { en: 'Something to Draw With', tr: 'Çizecek Bir Şey' },
    signal: 'gdm_create_greeter_launch_environment()',
    source: 'daemon/gdm-launch-environment.c:973',
    description: {
      en: 'Before anything can appear on screen there has to be a program that owns the graphics card and decides what goes where — the display server. gdm builds a small sandbox for it: a dedicated unprivileged user, its own environment, its own session registered with logind. Modern systems default to the newer protocol and fall back to the older X server if the driver cannot manage it, which is why some machines still start two very different stacks for the same job.',
      tr: 'Ekranda bir şey belirebilmeden önce, ekran kartının sahibi olan ve neyin nereye gideceğine karar veren bir program olmalıdır — display server. gdm onun için küçük bir kum havuzu kurar: adanmış ayrıcalıksız bir kullanıcı, kendi ortamı, logind’e kaydedilmiş kendi oturumu. Modern sistemler varsayılan olarak yeni protokolü kullanır ve sürücü onu kaldıramıyorsa eski X sunucusuna düşer; bazı makinelerin aynı iş için hâlâ çok farklı iki yığın başlatmasının sebebi budur.',
    },
    duration: 5600,
    view: 'board',
    screen: 'boot',
    depth: 1,
    highlight: ['pcie', 'cpu'],
    console: ['gdm[512]: session-type=wayland', 'gdm-launch-environment: user gdm, seat seat0'],
    signals: [
      { route: ['cpu', 'pcie'], color: VIDEO, label: 'compositor', particles: 11, spread: 0.6 },
    ],
  },
  {
    id: 'login-greeter',
    phase: 'os',
    title: { en: 'The First Frame Anyone Sees', tr: 'Herkesin Gördüğü İlk Kare' },
    signal: 'gdm_launch_environment_start()',
    source: 'daemon/gdm-launch-environment.c:565',
    description: {
      en: 'The greeter starts, draws a list of users and a password field, and sends its first frame down the cable. Everything in this project has led to this image — the moment the machine stops talking to itself and asks a person a question. It is also, mechanically, just another program in a cgroup with a session ID, no more privileged than a text editor.',
      tr: 'Greeter başlar, bir kullanıcı listesi ve bir parola alanı çizer ve ilk karesini kablodan gönderir. Bu projedeki her şey bu görüntüye çıkmıştır — makinenin kendi kendine konuşmayı bırakıp bir insana soru sorduğu an. Aynı zamanda, mekanik olarak, bir oturum kimliğine sahip bir cgroup içindeki başka bir programdır sadece; bir metin düzenleyiciden daha ayrıcalıklı değil.',
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
  {
    id: 'login-pam',
    phase: 'os',
    title: { en: 'Checking Who You Are', tr: 'Kim Olduğunu Denetlemek' },
    signal: 'gdm_session_worker_authenticate_user()',
    source: 'daemon/gdm-session-worker.c:1373',
    description: {
      en: 'The password is not checked by the login screen. It is handed to a stack of small plug-in modules, each of which can accept, reject or ask another question — one reads the local password file, another might talk to a company directory, another to a fingerprint reader. Because the stack is configuration rather than code, adding two-factor authentication to a machine changes a text file and not a single program.',
      tr: 'Parolayı giriş ekranı denetlemez. Her biri kabul edebilen, reddedebilen ya da başka bir soru sorabilen küçük eklenti modüllerinden oluşan bir yığına verilir — biri yerel parola dosyasını okur, bir diğeri bir şirket dizinine, bir başkası parmak izi okuyucusuna konuşabilir. Yığın kod değil yapılandırma olduğu için, bir makineye iki aşamalı doğrulama eklemek bir metin dosyasını değiştirir, tek bir programı değil.',
    },
    duration: 5800,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'm2', 'display'],
    console: [
      'gdm-password][612]: pam_unix(gdm-password:auth): authentication success',
      'gdm-session-worker: PAM_SUCCESS',
    ],
    signals: [
      { route: ['display', 'cpu'], color: DATA, label: 'credentials', particles: 10, spread: 0.5 },
      { route: ['cpu', 'm2'], color: LOGIC, particles: 8, delay: 0.3, spread: 0.4 },
    ],
  },
  {
    id: 'login-session',
    phase: 'os',
    title: { en: 'A systemd of Your Own', tr: 'Sana Ait Bir systemd' },
    signal: 'CreateSession',
    source: 'src/login/logind-dbus.c:884',
    description: {
      en: 'Authentication succeeded, so a session is registered: logind records who logged in, at which station, and grants that user control of the graphics and audio devices for as long as they are there. Then a second copy of systemd starts, running as the user and managing only their programs — the same manager, the same unit files, a private scope. The chain that began when someone pressed a button ends with the machine handing itself over.',
      tr: 'Doğrulama başarılı oldu, dolayısıyla bir oturum kaydedilir: logind kimin, hangi istasyonda giriş yaptığını kaydeder ve o kullanıcıya, orada olduğu sürece grafik ve ses aygıtlarının denetimini verir. Ardından systemd’nin ikinci bir kopyası başlar; kullanıcı olarak çalışır ve yalnızca onun programlarını yönetir — aynı yönetici, aynı unit dosyaları, özel bir kapsam. Birinin bir düğmeye basmasıyla başlayan zincir, makinenin kendini devretmesiyle biter.',
    },
    duration: 6000,
    view: 'board',
    screen: 'login',
    depth: 1,
    highlight: ['cpu', 'pcie', 'display', 'm2'],
    console: [
      'systemd-logind[401]: New session 2 of user serkan.',
      '[  OK  ] Started User Manager for UID 1000.',
      '[  OK  ] Reached target Graphical Interface.',
    ],
    signals: [
      { route: ['cpu', 'm2'], color: KERNEL, particles: 9, spread: 0.45 },
      { route: ['cpu', 'pcie'], color: VIDEO, particles: 9, delay: 0, spread: 0.45 },
      { route: ['pcie', 'display'], color: VIDEO, particles: 12, delay: 0.35, spread: 0.5, persist: true },
    ],
  },
];
