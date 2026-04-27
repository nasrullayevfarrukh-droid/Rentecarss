(function () {
  const Data = window.RentacarData;
  if (!Data) return;

  const BRAND_NAME = "Rentacarss.az";
  const PHONE_NUMBER = "+994998891919";
  const WHATSAPP_NUMBER = "994998891919";
  const DEFAULT_THEME = "light";
  const DEFAULT_LOCALE = "az";
  const THEME_KEY = "rentacar-theme-v1";
  const LOCALE_KEY = "rentacar-locale-v1";
  const PUBLIC_SYNC_CHANNEL = "rentacar-public-sync-v1";
  const PUBLIC_SYNC_STORAGE_KEY = "rentacar-public-sync-event-v1";
  const PUBLIC_REFRESH_INTERVAL = 10000;
  const LOCALE_CODES = ["az", "ru", "en"];
  const LOCALE_META = {
    az: { html: "az", og: "az_AZ", intl: "az-AZ" },
    ru: { html: "ru", og: "ru_RU", intl: "ru-RU" },
    en: { html: "en", og: "en_US", intl: "en-US" },
  };
  const AVAILABILITY_COPY = {
    az: {
      available: "Aktiv",
      rented: "İcarədə",
      unavailable: "Mövcud deyil",
      unknown: "Yoxlanılır",
      unitSingle: "ədəd",
      unitPlural: "ədəd",
    },
    ru: {
      available: "Свободен",
      rented: "В аренде",
      unavailable: "Недоступен",
      unknown: "Проверяется",
      unitSingle: "шт.",
      unitPlural: "шт.",
    },
    en: {
      available: "Available",
      rented: "Rented",
      unavailable: "Unavailable",
      unknown: "Checking",
      unitSingle: "unit",
      unitPlural: "units",
    },
  };
  const CATEGORY_LABELS = {
    az: { economy: "Ekonom", comfort: "Komfort", sedan: "Komfort", suv: "SUV", premium: "Premium", sport: "Sport", minivan: "Minivan", model: "Model" },
    ru: { economy: "Эконом", comfort: "Комфорт", sedan: "Комфорт", suv: "SUV", premium: "Премиум", sport: "Спорт", minivan: "Минивэн", model: "Модель" },
    en: { economy: "Economy", comfort: "Comfort", sedan: "Comfort", suv: "SUV", premium: "Premium", sport: "Sport", minivan: "Minivan", model: "Model" },
  };
  const LOCALES = {
    az: {
      meta: {
        home: { title: BRAND_NAME, socialTitle: `${BRAND_NAME} | Bakıda avtomobil icarəsi`, description: "Rentacarss.az Bakıda gündəlik və həftəlik avtomobil icarəsi xidməti təqdim edir." },
        fleet: { title: `${BRAND_NAME} | Avtomobillər`, description: "Rentacarss.az avtomobil kataloqu və gündəlik icarə modelləri." },
        about: { title: `${BRAND_NAME} | Haqqımızda`, description: "Rentacarss.az haqqında məlumat və xidmət prinsipləri." },
        contact: { title: `${BRAND_NAME} | Əlaqə`, description: "Rentacarss.az əlaqə və rezervasiya səhifəsi." },
        car: { title: `${BRAND_NAME} | Avtomobil`, description: "Rentacarss.az avtomobil detail səhifəsi." },
        carMissing: { title: `${BRAND_NAME} | Avtomobil tapılmadı` },
      },
      common: {
        tagline: "Bakıda avtomobil icarəsi",
        address: "Fətəli Xan Xoyski 132, Nəriman Nərimanov metrosunun yaxınlığı",
        footer: "Gündəlik və həftəlik avtomobil icarəsi üçün aydın qiymətlər, rahat seçim və sürətli əlaqə təqdim olunur.",
        whatsapp: "WhatsApp",
        instagram: "Instagram",
        city: "Bakı",
      },
      nav: { menu: "Menyu", home: "Ana səhifə", fleet: "Avtomobillər", about: "Haqqımızda", contact: "Əlaqə", reserve: "Rezervasiya et" },
      footer: { pages: "Səhifələr" },
      admin: { account: "Admin hesabı", subtitle: "Daxili idarəetmə keçidi", open: "Paneli aç", cars: "Avtomobillər", media: "Media", settings: "Ayarlar" },
      controls: { theme: { dark: "Qaranlıq rejimə keç", light: "Açıq rejimə keç" }, language: "Dil seçimi" },
      units: { models: "model", seats: "nəfər", perDay: "AZN / gün", perMonth: "AZN / ay", onRequest: "Sorğu üzrə", info: "Məlumat" },
      card: {
        summaryFallback: "Ətraflı məlumat üçün kartı aç.",
        featured: "Seçilən",
        imagePending: "Şəkil əlavə olunacaq",
        fuelMissing: "Yanacaq qeyd olunmayıb",
        transmissionMissing: "Transmissiya qeyd olunmayıb",
        details: "Ətraflı bax",
        reserve: "Rezervasiya et",
      },
      home: {
        panel: {
          badge: "Birbaşa əlaqə",
          title: "Rezervasiya üçün qısa məlumat kifayətdir",
          text: "Modeli və tarixləri seç, qalan detalı telefon və ya WhatsApp üzərindən dəqiqləşdir.",
          labels: ["Telefon", "Ünvan", "Əlaqə kanalları"],
          values: ["+994 99 889 19 19", "Fətəli Xan Xoyski 132, Nəriman Nərimanov metrosunun yaxınlığı", "Telefon, WhatsApp və sayt üzərindən müraciət"],
          actions: ["WhatsApp aç", "Forma ilə göndər"],
          note: "Saytda rezervasiya forması var. Server aktiv olmadıqda müraciət avtomatik olaraq WhatsApp-a yönləndirilir.",
        },
        benefits: {
          badge: "Üstünlüklər",
          title: "Sürətli qərar üçün əsas detallar ön plandadır",
          text: "Ana səhifədə seçim etməyə təsir edən əsas məqamlar birbaşa görünür və istifadəçini boş addımlara salmır.",
          cards: [
            ["Şəffaf qiymət", "Günlük qiymət və əsas məlumatlar avtomobil kartında dərhal görünür."],
            ["Sürətli təsdiq", "Forma, telefon və WhatsApp eyni aydın əlaqə axınında birləşir."],
            ["Çevik təhvil", "Nərimanov, mərkəz və uyğun nöqtələr üzrə təhvil detalları tez dəqiqləşdirilir."],
          ],
        },
        fleetIntro: {
          badge: "Hazır park",
          title: "Gündəlik və həftəlik icarə üçün seçilmiş modellər",
          text: "Hər model üçün qiymət, əsas məlumat və rezervasiya keçidi bir yerdə göstərilir. Maşının üzərinə toxunaraq ayrıca səhifədə daha geniş məlumat görə bilərsən.",
        },
        steps: {
          badge: "Necə işləyir",
          title: "3 addımda rahat rezervasiya",
          text: "İstifadəçi saytda itmədən birbaşa uyğun avtomobilə və müraciətə keçir.",
          cards: [
            ["Model seç", "Parkdan uyğun maşını və qiyməti bir neçə saniyədə müqayisə et."],
            ["Tarixi yaz", "Götürmə vaxtını və təhvil yerini qısa formada daxil et."],
            ["Təsdiqlə", "Komanda qalan detalları telefon və ya WhatsApp ilə dəqiqləşdirir."],
          ],
        },
        liveFleet: "Canlı park seçimi",
      },
      fleet: {
        badge: "Avtomobil kataloqu",
        title: "Bütün modellər bir səhifədə",
        text: "Kateqoriyanı seç və model üzrə axtarış et. Uyğun avtomobili açaraq ayrıca səhifədə qiymət və qısa təsviri görə bilərsən.",
        filterLabel: "Kateqoriyalar",
        filterOptions: ["Hamısı", "Ekonom", "Komfort", "SUV", "Premium", "Sport", "Minivan"],
        search: "Model və ya marka axtar",
        empty: "Seçilən filtrə uyğun model tapılmadı. Kateqoriyanı dəyiş və ya axtarışı təmizlə.",
        loading: "Avtomobillər backend-dən yüklənir...",
        noCars: "Hazırda aktiv avtomobil tapılmadı.",
        noneVisible: "Hazırda görünəcək maşın tapılmadı.",
      },
      about: {
        badge: "Haqqımızda",
        title: "Bakıda rahat və aydın avtomobil icarəsi",
        text: "Rentacarss.az gündəlik və həftəlik icarə üçün seçilmiş modelləri bir yerdə təqdim edir. Məqsədimiz qiyməti, əsas məlumatı və müraciət yolunu istifadəçi üçün sadə saxlamaqdır.",
        metrics: [{ label: "Canlı park seçimi" }, { value: "Nərimanov", label: "Mərkəzi yerləşmə nöqtəsi" }, { value: "WhatsApp", label: "Sürətli əlaqə və cavab" }],
        whyTitle: "Niyə Rentacarss.az?",
        whyText: [
          "Sayt daxilində ən vacib məlumatlar birbaşa görünür: model, qiymət, qısa təsvir və rezervasiya keçidi. İstifadəçi əvvəlcə uyğun avtomobili seçir, daha sonra tarix və əlaqə məlumatını göndərir.",
          "Biz uzun və qarışıq axın yerinə aydın görünüş, düzgün mətnlər və operativ əlaqə prinsipi ilə işləyirik. Bu yanaşma həm telefonda, həm də kompüterdə rahat istifadə üçün qurulub.",
        ],
        principlesTitle: "Xidmət prinsipləri",
        principles: ["Görünən və aydın günlük qiymətlər", "Maşın səhifələrində qısa və başa düşülən məlumat", "Telefon, WhatsApp və forma ilə rahat müraciət"],
        contactTitle: "Əlaqə və yerləşmə",
        contactItems: ["Fətəli Xan Xoyski 132, Nəriman Nərimanov metrosunun yaxınlığı", "+994 99 889 19 19", "WhatsApp", "Instagram"],
      },
      contact: {
        badge: "Əlaqə və rezervasiya",
        title: "Tarixi, saatı və əsas məlumatı yazıb rezervasiya göndər",
        text: "Formanı dolduraraq rezervasiya sorğusu göndərə və ya birbaşa WhatsApp üzərindən əlaqə saxlaya bilərsən. Server aktiv olmadıqda müraciət avtomatik olaraq WhatsApp-a yönləndirilir.",
        infoTitle: "Əlaqə məlumatları",
        infoItems: ["+994 99 889 19 19", "WhatsApp", "Instagram", "Fətəli Xan Xoyski 132, Nəriman Nərimanov metrosunun yaxınlığı"],
        flowTitle: "Rezervasiya necə işləyir?",
        flowItems: [
          "Əvvəlcə avtomobil, götürmə tarixi və saatı seçilir.",
          "Daha sonra əlaqə məlumatı və sürücülük vəsiqəsinin seriya nömrəsi daxil edilir.",
          "Təsdiq və təhvil detalları telefon və ya WhatsApp üzərindən dəqiqləşdirilir.",
        ],
        formTitle: "Rezervasiya formu",
        fieldLabels: ["Ad və soyad", "Sürücülük vəsiqəsinin seriya nömrəsi", "Telefon", "Avtomobil", "Götürmə tarixi", "Götürmə saatı", "Qaytarma tarixi", "Təhvil yeri", "Qeyd"],
        placeholders: ["Ad və soyad", "Məsələn: AA1234567", "+994 99 889 19 19", "Nərimanov və ya başqa ünvan", "Əlavə istəklərinizi yaza bilərsiniz"],
        submit: "Rezervasiya göndər",
        feedback: {
          selectCar: "Əvvəlcə avtomobil seçin.",
          sending: "Göndərilir...",
          success: "Rezervasiya uğurla qəbul olundu.",
          fallback: "Server hazır olmadıqda müraciət WhatsApp-a yönləndirildi.",
        },
      },
      car: {
        loadingBadge: "Yüklənir...",
        loadingTitle: "Avtomobil məlumatı yüklənir",
        loadingText: "Maşın məlumatları backend-dən yüklənir.",
        notFoundBadge: "Məlumat tapılmadı",
        notFoundTitle: "Bu maşın artıq aktiv deyil",
        notFoundText: "Maşın arxivləşdirilib və ya link dəyişib. Aktiv modellərə baxmaq üçün park səhifəsinə keçin.",
        notFoundPrimary: "Parka bax",
        notFoundSecondary: "Əlaqə saxla",
        aboutTitle: "Model haqqında",
        specLabels: ["Gündəlik", "Aylıq", "Oturacaq", "Ötürücü", "Yanacaq", "Şəhər"],
        specMissing: "Qeyd olunmayıb",
        featuredEyebrow: "Seçilən model",
        featureFallback: "Əlavə xüsusiyyətlər admin paneldən əlavə olunur.",
        galleryTitle: "Qalereya",
        backToFleet: "Bütün avtomobillərə qayıt",
      },
      messages: { carsError: "Maşın məlumatları yüklənə bilmədi.", selectCar: "Avtomobil seçin", noActiveCars: "Hazırda aktiv maşın yoxdur" },
      reservation: {
        intro: "Salam, rezervasiya etmək istəyirəm.",
        labels: ["Ad və soyad", "Telefon", "Avtomobil", "Götürmə tarixi", "Götürmə saatı", "Qaytarma tarixi", "Təhvil yeri", "Sürücülük vəsiqəsi", "Qeyd"],
      },
    },
    ru: {
      meta: {
        home: { title: BRAND_NAME, socialTitle: `${BRAND_NAME} | Аренда авто в Баку`, description: "Rentacarss.az предлагает посуточную и недельную аренду автомобилей в Баку." },
        fleet: { title: `${BRAND_NAME} | Автомобили`, description: "Каталог автомобилей Rentacarss.az с актуальными моделями для аренды." },
        about: { title: `${BRAND_NAME} | О нас`, description: "Информация о Rentacarss.az и принципах сервиса." },
        contact: { title: `${BRAND_NAME} | Контакты`, description: "Страница контактов и бронирования Rentacarss.az." },
        car: { title: `${BRAND_NAME} | Автомобиль`, description: "Страница автомобиля Rentacarss.az." },
        carMissing: { title: `${BRAND_NAME} | Автомобиль не найден` },
      },
      common: {
        tagline: "Прокат автомобилей в Баку",
        address: "Фатали Хан Хойски 132, рядом со станцией метро Нариман Нариманов",
        footer: "Прозрачные цены, удобный выбор и быстрый контакт для посуточной и недельной аренды автомобилей.",
        whatsapp: "WhatsApp",
        instagram: "Instagram",
        city: "Баку",
      },
      nav: { menu: "Меню", home: "Главная", fleet: "Автомобили", about: "О нас", contact: "Контакты", reserve: "Забронировать" },
      footer: { pages: "Страницы" },
      admin: { account: "Аккаунт администратора", subtitle: "Внутренний доступ к панели", open: "Открыть панель", cars: "Автомобили", media: "Медиа", settings: "Настройки" },
      controls: { theme: { dark: "Включить тёмную тему", light: "Включить светлую тему" }, language: "Выбор языка" },
      units: { models: "моделей", seats: "мест", perDay: "AZN / день", perMonth: "AZN / месяц", onRequest: "По запросу", info: "Информация" },
      card: {
        summaryFallback: "Откройте карточку, чтобы увидеть детали.",
        featured: "Рекомендуем",
        imagePending: "Изображение будет добавлено",
        fuelMissing: "Топливо не указано",
        transmissionMissing: "Коробка передач не указана",
        details: "Подробнее",
        reserve: "Забронировать",
      },
      home: {
        panel: {
          badge: "Прямой контакт",
          title: "Для бронирования достаточно короткой информации",
          text: "Выберите модель и даты, а остальные детали уточним по телефону или в WhatsApp.",
          labels: ["Телефон", "Адрес", "Каналы связи"],
          values: ["+994 99 889 19 19", "Фатали Хан Хойски 132, рядом со станцией метро Нариман Нариманов", "Телефон, WhatsApp и заявка через сайт"],
          actions: ["Открыть WhatsApp", "Отправить через форму"],
          note: "На сайте есть форма бронирования. Если сервер недоступен, заявка автоматически перенаправляется в WhatsApp.",
        },
        benefits: {
          badge: "Преимущества",
          title: "Главные детали для быстрого выбора всегда на виду",
          text: "На главной странице сразу видны ключевые моменты, влияющие на выбор, без лишних шагов для пользователя.",
          cards: [
            ["Прозрачная цена", "Суточная цена и основные данные сразу видны в карточке автомобиля."],
            ["Быстрое подтверждение", "Форма, телефон и WhatsApp объединены в один понятный канал связи."],
            ["Гибкая выдача", "Детали передачи авто быстро уточняются по Нариманову, центру и другим удобным точкам."],
          ],
        },
        fleetIntro: {
          badge: "Доступный парк",
          title: "Подобранные модели для посуточной и недельной аренды",
          text: "Цена, основные данные и переход к бронированию собраны в одном месте. Нажмите на автомобиль, чтобы открыть отдельную страницу с подробностями.",
        },
        steps: {
          badge: "Как это работает",
          title: "Бронирование в 3 шага",
          text: "Пользователь быстро переходит к нужному автомобилю и заявке без лишних действий.",
          cards: [
            ["Выберите модель", "За несколько секунд сравните подходящие машины и цены в парке."],
            ["Укажите дату", "Кратко заполните дату получения и место выдачи."],
            ["Подтвердите", "Команда уточнит оставшиеся детали по телефону или в WhatsApp."],
          ],
        },
        liveFleet: "Актуальный парк",
      },
      fleet: {
        badge: "Каталог автомобилей",
        title: "Все модели на одной странице",
        text: "Выберите категорию и выполните поиск по модели. Откройте нужный автомобиль, чтобы увидеть цену и краткое описание на отдельной странице.",
        filterLabel: "Категории",
        filterOptions: ["Все", "Эконом", "Комфорт", "SUV", "Премиум", "Спорт", "Минивэн"],
        search: "Поиск по модели или бренду",
        empty: "По выбранному фильтру ничего не найдено. Измените категорию или очистите поиск.",
        loading: "Автомобили загружаются из backend...",
        noCars: "Сейчас нет активных автомобилей.",
        noneVisible: "Сейчас нет автомобилей для показа.",
      },
      about: {
        badge: "О нас",
        title: "Понятная аренда авто в Баку",
        text: "Rentacarss.az собирает в одном месте отобранные модели для посуточной и недельной аренды. Наша цель — сделать цену, ключевую информацию и способ обращения максимально простыми.",
        metrics: [{ label: "Актуальный парк" }, { value: "Нариманов", label: "Центральная точка выдачи" }, { value: "WhatsApp", label: "Быстрая связь и ответ" }],
        whyTitle: "Почему Rentacarss.az?",
        whyText: [
          "Самая важная информация видна сразу: модель, цена, краткое описание и переход к бронированию.",
          "Мы используем ясную структуру, точные тексты и быструю связь вместо длинного и запутанного сценария.",
        ],
        principlesTitle: "Принципы сервиса",
        principles: ["Понятные суточные цены", "Короткая и ясная информация на страницах автомобилей", "Удобное обращение по телефону, в WhatsApp и через форму"],
        contactTitle: "Контакты и расположение",
        contactItems: ["Фатали Хан Хойски 132, рядом со станцией метро Нариман Нариманов", "+994 99 889 19 19", "WhatsApp", "Instagram"],
      },
      contact: {
        badge: "Контакты и бронирование",
        title: "Укажите дату, время и основные данные, затем отправьте заявку",
        text: "Заполните форму, чтобы отправить заявку на бронирование, или свяжитесь напрямую через WhatsApp. Если сервер недоступен, заявка автоматически уходит в WhatsApp.",
        infoTitle: "Контактная информация",
        infoItems: ["+994 99 889 19 19", "WhatsApp", "Instagram", "Фатали Хан Хойски 132, рядом со станцией метро Нариман Нариманов"],
        flowTitle: "Как работает бронирование?",
        flowItems: [
          "Сначала выбираются автомобиль, дата и время получения.",
          "Затем вводятся контактные данные и серия водительского удостоверения.",
          "Подтверждение и детали выдачи уточняются по телефону или в WhatsApp.",
        ],
        formTitle: "Форма бронирования",
        fieldLabels: ["Имя и фамилия", "Серия водительского удостоверения", "Телефон", "Автомобиль", "Дата получения", "Время получения", "Дата возврата", "Место выдачи", "Комментарий"],
        placeholders: ["Имя и фамилия", "Например: AA1234567", "+994 99 889 19 19", "Нариманов или другой адрес", "Здесь можно указать дополнительные пожелания"],
        submit: "Отправить бронирование",
        feedback: {
          selectCar: "Сначала выберите автомобиль.",
          sending: "Отправка...",
          success: "Бронирование успешно принято.",
          fallback: "Когда сервер недоступен, заявка перенаправляется в WhatsApp.",
        },
      },
      car: {
        loadingBadge: "Загрузка...",
        loadingTitle: "Загружается информация об автомобиле",
        loadingText: "Данные автомобиля загружаются из backend.",
        notFoundBadge: "Информация не найдена",
        notFoundTitle: "Этот автомобиль больше не активен",
        notFoundText: "Автомобиль архивирован или ссылка изменилась. Перейдите в каталог, чтобы посмотреть активные модели.",
        notFoundPrimary: "Открыть каталог",
        notFoundSecondary: "Связаться",
        aboutTitle: "О модели",
        specLabels: ["Посуточно", "Помесячно", "Места", "Коробка", "Топливо", "Город"],
        specMissing: "Не указано",
        featuredEyebrow: "Рекомендуемая модель",
        featureFallback: "Дополнительные особенности добавляются через админ-панель.",
        galleryTitle: "Галерея",
        backToFleet: "Назад ко всем автомобилям",
      },
      messages: { carsError: "Не удалось загрузить данные автомобилей.", selectCar: "Выберите автомобиль", noActiveCars: "Сейчас нет активных автомобилей" },
      reservation: {
        intro: "Здравствуйте, хочу забронировать автомобиль.",
        labels: ["Имя и фамилия", "Телефон", "Автомобиль", "Дата получения", "Время получения", "Дата возврата", "Место выдачи", "Водительское удостоверение", "Комментарий"],
      },
    },
    en: {
      meta: {
        home: { title: BRAND_NAME, socialTitle: `${BRAND_NAME} | Car rental in Baku`, description: "Rentacarss.az offers daily and weekly car rental in Baku." },
        fleet: { title: `${BRAND_NAME} | Cars`, description: "Rentacarss.az car catalog with live rental models." },
        about: { title: `${BRAND_NAME} | About`, description: "About Rentacarss.az and how the service works." },
        contact: { title: `${BRAND_NAME} | Contact`, description: "Rentacarss.az contact and reservation page." },
        car: { title: `${BRAND_NAME} | Car`, description: "Rentacarss.az car detail page." },
        carMissing: { title: `${BRAND_NAME} | Car not found` },
      },
      common: {
        tagline: "Car rental in Baku",
        address: "Fatali Khan Khoyski 132, near Nariman Narimanov metro station",
        footer: "Clear pricing, easy selection, and fast contact for daily and weekly car rentals.",
        whatsapp: "WhatsApp",
        instagram: "Instagram",
        city: "Baku",
      },
      nav: { menu: "Menu", home: "Home", fleet: "Cars", about: "About", contact: "Contact", reserve: "Book now" },
      footer: { pages: "Pages" },
      admin: { account: "Admin account", subtitle: "Internal management access", open: "Open panel", cars: "Cars", media: "Media", settings: "Settings" },
      controls: { theme: { dark: "Switch to dark mode", light: "Switch to light mode" }, language: "Language switcher" },
      units: { models: "models", seats: "seats", perDay: "AZN / day", perMonth: "AZN / month", onRequest: "On request", info: "Info" },
      card: {
        summaryFallback: "Open the card to view more details.",
        featured: "Featured",
        imagePending: "Image will be added soon",
        fuelMissing: "Fuel type not specified",
        transmissionMissing: "Transmission not specified",
        details: "View details",
        reserve: "Book now",
      },
      home: {
        panel: {
          badge: "Direct contact",
          title: "A short form is enough to start a reservation",
          text: "Choose the model and dates, then confirm the remaining details by phone or WhatsApp.",
          labels: ["Phone", "Address", "Contact channels"],
          values: ["+994 99 889 19 19", "Fatali Khan Khoyski 132, near Nariman Narimanov metro station", "Phone, WhatsApp, and website request flow"],
          actions: ["Open WhatsApp", "Send via form"],
          note: "The site includes a reservation form. If the server is unavailable, the request automatically falls back to WhatsApp.",
        },
        benefits: {
          badge: "Advantages",
          title: "Key details stay in focus for faster decisions",
          text: "The homepage surfaces the most important points right away, so visitors do not waste time on extra steps.",
          cards: [
            ["Clear pricing", "Daily price and core details are visible immediately on each car card."],
            ["Fast confirmation", "Form, phone, and WhatsApp work together in one clear contact flow."],
            ["Flexible handover", "Handover details are confirmed quickly for Narimanov, the center, and other convenient pickup points."],
          ],
        },
        fleetIntro: {
          badge: "Available fleet",
          title: "Selected models for daily and weekly rental",
          text: "Pricing, key details, and the reservation shortcut are shown together. Open a car to see more on its own page.",
        },
        steps: {
          badge: "How it works",
          title: "Reservation in 3 steps",
          text: "Visitors move directly to the right car and contact flow without getting lost in the site.",
          cards: [
            ["Choose a model", "Compare suitable cars and pricing from the fleet in a few seconds."],
            ["Set the date", "Enter the pickup time and delivery point in a short form."],
            ["Confirm it", "The team finalizes the remaining details by phone or WhatsApp."],
          ],
        },
        liveFleet: "Live fleet selection",
      },
      fleet: {
        badge: "Car catalog",
        title: "All models on one page",
        text: "Pick a category and search by model. Open the right car to see pricing and a short description on its own page.",
        filterLabel: "Categories",
        filterOptions: ["All", "Economy", "Comfort", "SUV", "Premium", "Sport", "Minivan"],
        search: "Search by model or brand",
        empty: "No cars match the selected filter. Change the category or clear the search.",
        loading: "Cars are loading from the backend...",
        noCars: "There are no active cars right now.",
        noneVisible: "There are no cars to show right now.",
      },
      about: {
        badge: "About",
        title: "Simple car rental in Baku",
        text: "Rentacarss.az brings selected daily and weekly rental models together in one place. Our goal is to keep pricing, core details, and the contact flow simple.",
        metrics: [{ label: "Live fleet selection" }, { value: "Narimanov", label: "Central handover point" }, { value: "WhatsApp", label: "Fast contact and reply" }],
        whyTitle: "Why Rentacarss.az?",
        whyText: [
          "The most important information is visible immediately: model, price, short description, and the reservation shortcut.",
          "We use a clear structure, accurate copy, and fast communication instead of a long and confusing flow.",
        ],
        principlesTitle: "Service principles",
        principles: ["Visible daily pricing", "Short and easy-to-read details on car pages", "Convenient contact by phone, WhatsApp, and form"],
        contactTitle: "Contact and location",
        contactItems: ["Fatali Khan Khoyski 132, near Nariman Narimanov metro station", "+994 99 889 19 19", "WhatsApp", "Instagram"],
      },
      contact: {
        badge: "Contact and reservation",
        title: "Enter the date, time, and core details, then send the reservation",
        text: "Fill out the form to send a reservation request or contact us directly on WhatsApp. If the server is unavailable, the request automatically falls back to WhatsApp.",
        infoTitle: "Contact details",
        infoItems: ["+994 99 889 19 19", "WhatsApp", "Instagram", "Fatali Khan Khoyski 132, near Nariman Narimanov metro station"],
        flowTitle: "How does reservation work?",
        flowItems: [
          "First, choose the car, pickup date, and pickup time.",
          "Then enter your contact details and driving licence serial number.",
          "Confirmation and handover details are finalized by phone or WhatsApp.",
        ],
        formTitle: "Reservation form",
        fieldLabels: ["Full name", "Driving licence serial number", "Phone", "Car", "Pickup date", "Pickup time", "Dropoff date", "Pickup location", "Note"],
        placeholders: ["Full name", "For example: AA1234567", "+994 99 889 19 19", "Narimanov or another address", "You can write any extra requests here"],
        submit: "Send reservation",
        feedback: {
          selectCar: "Select a car first.",
          sending: "Sending...",
          success: "Reservation was received successfully.",
          fallback: "When the server is unavailable, the request is redirected to WhatsApp.",
        },
      },
      car: {
        loadingBadge: "Loading...",
        loadingTitle: "Car details are loading",
        loadingText: "Car data is loading from the backend.",
        notFoundBadge: "Not found",
        notFoundTitle: "This car is no longer active",
        notFoundText: "The car was archived or the link changed. Open the fleet page to see active models.",
        notFoundPrimary: "Browse fleet",
        notFoundSecondary: "Contact us",
        aboutTitle: "About the model",
        specLabels: ["Daily", "Monthly", "Seats", "Transmission", "Fuel", "City"],
        specMissing: "Not specified",
        featuredEyebrow: "Featured model",
        featureFallback: "Additional features are added from the admin panel.",
        galleryTitle: "Gallery",
        backToFleet: "Back to all cars",
      },
      messages: { carsError: "Car data could not be loaded.", selectCar: "Select a car", noActiveCars: "There are no active cars right now" },
      reservation: {
        intro: "Hello, I would like to reserve a car.",
        labels: ["Full name", "Phone", "Car", "Pickup date", "Pickup time", "Dropoff date", "Pickup location", "Driving licence", "Note"],
      },
    },
  };

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const isLocaleCode = (value) => LOCALE_CODES.includes(String(value || "").toLowerCase());
  const page = () => document.body.dataset.page || "home";

  let currentLocale = DEFAULT_LOCALE;
  let publicCars = [];
  let publicCarReservations = [];
  let carsLoadFailed = false;
  let homeHero = Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO);
  let homeCta = Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA);
  let homeSpotlight = Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT);
  let publicSyncChannel = null;
  let refreshPromise = null;
  let refreshTimer = null;
  let appBooted = false;
  let carDetailCountdownTimer = null;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[match]));

  const getAvailabilityCopy = () => AVAILABILITY_COPY[currentLocale] || AVAILABILITY_COPY.az;
  const SCHEDULE_STATUS_LABELS = {
    available: "Müsait",
    reserved: "Rezerve",
    rented: "Kirada",
    expired: "Süresi doldu",
  };

  const formatReservationDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatRemainingTime = (milliseconds) => {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return "Süresi doldu";
    const totalMinutes = Math.max(1, Math.floor(milliseconds / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days} gün ${hours} saat kaldı`;
    if (hours > 0) return `${hours} saat ${minutes} dakika kaldı`;
    return `${minutes} dakika kaldı`;
  };

  const getCarAvailabilitySummary = (car) => Data.buildCarReservationSummary(car, publicCarReservations, Date.now());

  const resolveAvailabilityState = (carOrState) => {
    const rawState = typeof carOrState === "object" && carOrState !== null
      ? (carOrState.currentStatus || carOrState.availabilityStatus)
      : carOrState;
    const clean = String(rawState || "").trim().toLowerCase();
    if (clean === "unavailable") return "expired";
    if (["available", "reserved", "rented", "expired"].includes(clean)) return clean;
    return "available";
  };

  const getAvailabilityLabel = (carOrState) => {
    const state = resolveAvailabilityState(carOrState);
    if (currentLocale === "az") {
      if (state === "available") return "Aktivdir";
      if (state === "rented") return "İcarədədir";
      if (state === "unavailable") return "Arxivdə";
    }
    return getAvailabilityCopy()[state] || getAvailabilityCopy().unknown;
  };

  const getAvailabilityBadgeText = (car) => {
    const state = resolveAvailabilityState(car);
    if (state === "unavailable") return getAvailabilityLabel(state);
    return getAvailabilityLabel(state);
  };

  const getAvailabilityBadgeDisplayText = (car) => {
    const state = resolveAvailabilityState(car);
    if (state === "available") {
      if (currentLocale === "az") return "Aktiv";
      return getAvailabilityCopy().available || "Available";
    }
    if (state === "rented") {
      const days = Number(car && car.rentalDays);
      if (Number.isFinite(days) && days > 0) {
        const cleanDays = Math.trunc(days);
        if (currentLocale === "az") return `${cleanDays} gün icarədə`;
        if (currentLocale === "ru") return `${cleanDays} дн. в аренде`;
        return `${cleanDays} days rented`;
      }
      if (currentLocale === "az") return "İcarədə";
      return getAvailabilityCopy().rented || "Rented";
    }
    if (currentLocale === "az") return "Arxiv";
    return getAvailabilityCopy().unavailable || "Unavailable";
  };

  const getScheduleAvailabilityLabel = (summaryOrCar) => {
    const state = resolveAvailabilityState(summaryOrCar);
    return SCHEDULE_STATUS_LABELS[state] || SCHEDULE_STATUS_LABELS.available;
  };

  const getScheduleAvailabilityBadgeText = (summaryOrCar) => getScheduleAvailabilityLabel(summaryOrCar);

  const getUpcomingReservationText = (summary) => (
    summary && summary.currentStatus === "available" && summary.upcomingReservation
      ? `Yaklaşan rezervasyon: ${formatReservationDateTime(summary.upcomingReservation.startDateTime)}`
      : ""
  );

  const getReservationActionCopy = (key) => {
    const dictionary = {
      az: {
        rented: "İcarədədir",
        whatsapp: "WhatsApp ilə soruş",
        unavailable: "Rezervasiya bağlıdır",
        unavailableForm: "Bu maşın hazırda rezervasiya üçün aktiv deyil.",
      },
      ru: {
        rented: "В аренде",
        whatsapp: "Спросить в WhatsApp",
        unavailable: "Бронирование недоступно",
        unavailableForm: "Этот автомобиль сейчас недоступен для бронирования.",
      },
      en: {
        rented: "Rented",
        whatsapp: "Ask on WhatsApp",
        unavailable: "Reservation unavailable",
        unavailableForm: "This car is currently unavailable for reservation.",
      },
    };
    return (dictionary[currentLocale] && dictionary[currentLocale][key]) || dictionary.az[key] || "";
  };

  const isCarArchived = (car) => String(car && car.status || "").trim().toLowerCase() === "archived";
  const isCarReservable = (car) => !isCarArchived(car) && getCarAvailabilitySummary(car).currentStatus === "available";

  const formatCityLabel = (value) => {
    const clean = String(value || "").trim();
    if (!clean) return localeCopy("common.city", "Bakı");
    if (clean.toLowerCase() === "baku") return localeCopy("common.city", "Bakı");
    return clean;
  };

  const localeCopy = (key, fallback = "") => {
    const walk = (source) => String(key || "").split(".").reduce((acc, segment) => (
      acc && Object.prototype.hasOwnProperty.call(acc, segment) ? acc[segment] : undefined
    ), source);
    return walk(LOCALES[currentLocale]) ?? walk(LOCALES[DEFAULT_LOCALE]) ?? fallback;
  };

  const getSavedTheme = () => localStorage.getItem(THEME_KEY) === "dark" ? "dark" : DEFAULT_THEME;
  const getSavedLocale = () => isLocaleCode(localStorage.getItem(LOCALE_KEY)) ? localStorage.getItem(LOCALE_KEY) : DEFAULT_LOCALE;
  const formatNumber = (value) => new Intl.NumberFormat(LOCALE_META[currentLocale].intl, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
  const formatModelCount = (count) => `${count} ${localeCopy("units.models", "model")}`;
  const formatSeatCount = (count) => `${count || "-"} ${localeCopy("units.seats", "seats")}`;
  const formatPrice = (value) => `${formatNumber(value)} ${localeCopy("units.perDay", "AZN / day")}`;
  const formatMonthlyPrice = (value) => value || value === 0 ? `${formatNumber(value)} ${localeCopy("units.perMonth", "AZN / month")}` : localeCopy("units.onRequest", "On request");
  const getCategoryLabel = (category) => (CATEGORY_LABELS[currentLocale] || CATEGORY_LABELS[DEFAULT_LOCALE])[String(category || "").toLowerCase()] || CATEGORY_LABELS[currentLocale].model;
  const excerpt = (value, limit = 120) => {
    const text = String(value || "").trim();
    if (text.length <= limit) return text;
    return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
  };
  const getCarSummary = (car) => car.summary || excerpt(car.description, 110) || localeCopy("card.summaryFallback", "Open the card to view more.");
  const createEmptyMessage = (message) => `<div class="section-message">${escapeHtml(message)}</div>`;
  const buildCarLink = (slug) => `/cars/${encodeURIComponent(slug)}`;
  const getCarBySlug = (slug) => publicCars.find((car) => car.slug === slug) || null;
  const buildWhatsappUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  const getRequestedCarSlug = () => {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get("slug") || params.get("car");
    if (querySlug) return querySlug;
    const bodySlug = document.body.dataset.car || "";
    if (bodySlug) return bodySlug;
    const match = window.location.pathname.match(/\/cars\/([^/?#]+)/i);
    return match && match[1] ? decodeURIComponent(match[1]).replace(/\.html$/i, "") : "";
  };

  const setFeedback = (node, message = "", tone = "") => {
    if (!node) return;
    node.textContent = message;
    node.classList.remove("is-success", "is-error");
    if (tone) node.classList.add(tone);
  };

  const setTheme = (theme, { persist = true } = {}) => {
    const nextTheme = theme === "dark" ? "dark" : DEFAULT_THEME;
    document.body.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    if (persist) localStorage.setItem(THEME_KEY, nextTheme);
    qsa("[data-theme-toggle]").forEach((button) => {
      button.dataset.themeMode = nextTheme;
      button.setAttribute("aria-pressed", String(nextTheme === "dark"));
      const label = nextTheme === "dark" ? localeCopy("controls.theme.light", "Switch to light mode") : localeCopy("controls.theme.dark", "Switch to dark mode");
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });
    const themeMeta = qs('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", nextTheme === "dark" ? "#161217" : "#ff6436");
  };

  const buildThemeToggleMarkup = (extraClass = "") => `
    <button type="button" class="theme-toggle${extraClass ? ` ${extraClass}` : ""}" data-theme-toggle data-theme-mode="light" aria-pressed="false">
      <span class="theme-toggle__glyph" aria-hidden="true">
        <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"></circle><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"></path></svg>
        <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.45 15.24A8.15 8.15 0 0 1 8.76 6.55a.75.75 0 0 0-1.12-.8A9.65 9.65 0 1 0 18.25 16.36a.75.75 0 0 0-.8-1.12Z"></path></svg>
      </span>
    </button>
  `;

  const buildLanguageSwitcherMarkup = (extraClass = "") => `
    <div class="lang-switcher${extraClass ? ` ${extraClass}` : ""}" data-lang-switcher role="group">
      ${LOCALE_CODES.map((code) => `<button type="button" data-locale-option="${code}" aria-pressed="false">${code.toUpperCase()}</button>`).join("")}
    </div>
  `;

  const injectSiteUtilities = () => {
    qsa(".header-tools").forEach((tools) => {
      if (qs("[data-site-utilities]", tools)) return;
      const wrap = document.createElement("div");
      wrap.className = "site-utilities";
      wrap.setAttribute("data-site-utilities", "");
      wrap.innerHTML = `${buildLanguageSwitcherMarkup()}${buildThemeToggleMarkup()}`;
      const adminDropdown = qs("[data-admin-menu]", tools);
      if (adminDropdown) tools.insertBefore(wrap, adminDropdown);
      else tools.prepend(wrap);
    });
    qsa("[data-menu]").forEach((menu) => {
      if (qs("[data-site-utilities-mobile]", menu)) return;
      const wrap = document.createElement("div");
      wrap.className = "site-utilities site-utilities--mobile";
      wrap.setAttribute("data-site-utilities-mobile", "");
      wrap.innerHTML = `${buildLanguageSwitcherMarkup("lang-switcher--mobile")}${buildThemeToggleMarkup("theme-toggle--mobile")}`;
      menu.appendChild(wrap);
    });
    qsa("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const theme = document.body.dataset.theme === "dark" ? "dark" : DEFAULT_THEME;
        setTheme(theme === "dark" ? "light" : "dark");
      });
    });
    qsa("[data-locale-option]").forEach((button) => {
      button.addEventListener("click", () => setLocale(button.dataset.localeOption || DEFAULT_LOCALE));
    });
  };

  const updateLanguageControls = () => {
    qsa("[data-lang-switcher]").forEach((switcher) => switcher.setAttribute("aria-label", localeCopy("controls.language", "Language switcher")));
    qsa("[data-locale-option]").forEach((button) => {
      const active = button.dataset.localeOption === currentLocale;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("title", button.textContent);
    });
  };

  const updateBranding = () => {
    qsa(".brand-text strong").forEach((node) => { node.textContent = BRAND_NAME; });
    qsa(".brand-text small").forEach((node) => { node.textContent = localeCopy("common.tagline", "Car rental in Baku"); });
    qsa(".brand-mark img").forEach((node) => { node.alt = `${BRAND_NAME} logo`; });
    qsa(".admin-access-menu__head strong").forEach((node) => { node.textContent = `${BRAND_NAME} Admin`; });
  };

  const setNodesText = (nodes, values) => {
    nodes.forEach((node, index) => {
      if (node && values[index] !== undefined) node.textContent = values[index];
    });
  };

  const applyMetaTranslations = () => {
    const meta = localeCopy(`meta.${page()}`);
    if (!meta) return;
    document.documentElement.lang = LOCALE_META[currentLocale].html;
    document.body.dataset.locale = currentLocale;
    document.title = meta.title || BRAND_NAME;
    const description = qs('meta[name="description"]');
    if (description && meta.description) description.setAttribute("content", meta.description);
    const ogLocale = qs('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", LOCALE_META[currentLocale].og);
    const ogTitle = qs('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", meta.socialTitle || meta.title);
    const ogDescription = qs('meta[property="og:description"]');
    if (ogDescription && meta.description) ogDescription.setAttribute("content", meta.description);
  };

  const applySharedTranslations = () => {
    qsa(".site-topbar__inner span").forEach((node) => { node.textContent = localeCopy("common.address"); });
    qsa("[data-menu-toggle]").forEach((button) => button.setAttribute("aria-label", localeCopy("nav.menu")));
    qsa(".menu-toggle__label").forEach((node) => { node.textContent = localeCopy("nav.menu"); });
    qsa(".main-nav").forEach((nav) => {
      setNodesText(qsa("a:not(.main-nav__cta)", nav), [localeCopy("nav.home"), localeCopy("nav.fleet"), localeCopy("nav.about"), localeCopy("nav.contact")]);
      const cta = qs(".main-nav__cta", nav);
      if (cta) cta.textContent = localeCopy("nav.reserve");
    });
    qsa(".header-cta").forEach((node) => { node.textContent = localeCopy("nav.reserve"); });
    qsa(".site-footer .footer-brand p").forEach((node) => { node.textContent = localeCopy("common.footer"); });
    const footerColumns = qsa(".site-footer .footer-column");
    if (footerColumns[0]) {
      const title = qs("h3", footerColumns[0]);
      if (title) title.textContent = localeCopy("footer.pages");
      setNodesText(qsa("a", footerColumns[0]), [localeCopy("nav.home"), localeCopy("nav.fleet"), localeCopy("nav.about"), localeCopy("nav.contact")]);
    }
    if (footerColumns[1]) {
      const title = qs("h3", footerColumns[1]);
      if (title) title.textContent = localeCopy("nav.contact");
      setNodesText(qsa("a, span", footerColumns[1]), ["+994 99 889 19 19", localeCopy("common.whatsapp"), localeCopy("common.instagram"), localeCopy("common.address")]);
    }
    qsa(".admin-access").forEach((button) => {
      button.setAttribute("aria-label", localeCopy("admin.account"));
      button.setAttribute("title", localeCopy("admin.account"));
    });
    qsa(".admin-access-menu__head span").forEach((node) => { node.textContent = localeCopy("admin.subtitle"); });
    qsa(".admin-access-menu").forEach((menu) => {
      setNodesText(qsa("a", menu), [localeCopy("admin.open"), localeCopy("admin.cars"), localeCopy("admin.media"), localeCopy("admin.settings")]);
    });
    updateBranding();
    updateLanguageControls();
  };

  const applyHomeStaticTranslations = () => {
    if (page() !== "home") return;
    const heroPanel = localeCopy("home.panel");
    const benefits = localeCopy("home.benefits");
    const fleetIntro = localeCopy("home.fleetIntro");
    const steps = localeCopy("home.steps");
    if (heroPanel) {
      const panel = qs(".hero-panel");
      if (panel) {
        setNodesText([qs(".eyebrow", panel), qs("h2", panel), qs(".hero-panel__head p", panel)], [heroPanel.badge, heroPanel.title, heroPanel.text]);
        setNodesText(qsa(".detail-row__label", panel), heroPanel.labels);
        setNodesText(qsa(".detail-row strong", panel), heroPanel.values);
        setNodesText(qsa(".hero-panel__actions .button", panel), heroPanel.actions);
        const note = qs(".hero-panel__note", panel);
        if (note) note.textContent = heroPanel.note;
      }
    }
    if (benefits) {
      setNodesText([qs("[data-home-benefits-head] .eyebrow"), qs("[data-home-benefits-head] h2"), qs("[data-home-benefits-head] p")], [benefits.badge, benefits.title, benefits.text]);
      qsa(".insight-card").forEach((card, index) => setNodesText([qs("h3", card), qs("p", card)], benefits.cards[index] || []));
    }
    if (fleetIntro) setNodesText([qs(".fleet-section .section-heading .eyebrow"), qs(".fleet-section .section-heading h2"), qs(".fleet-section .section-heading p")], [fleetIntro.badge, fleetIntro.title, fleetIntro.text]);
    if (steps) {
      setNodesText([qs("[data-home-steps-head] .eyebrow"), qs("[data-home-steps-head] h2"), qs("[data-home-steps-head] p")], [steps.badge, steps.title, steps.text]);
      qsa(".journey-card").forEach((card, index) => setNodesText([qs("h3", card), qs("p", card)], steps.cards[index] || []));
    }
  };

  const applyFleetStaticTranslations = () => {
    if (page() !== "fleet") return;
    const fleet = localeCopy("fleet");
    if (!fleet) return;
    setNodesText([qs(".page-hero .eyebrow"), qs(".page-hero h1"), qs(".page-hero p")], [fleet.badge, fleet.title, fleet.text]);
    const filterLabel = qs(".filter-panel__label");
    if (filterLabel) filterLabel.textContent = fleet.filterLabel;
    setNodesText(qsa(".filter-chip"), fleet.filterOptions || []);
    const search = qs("[data-car-search]");
    if (search) search.setAttribute("placeholder", fleet.search);
    const empty = qs("[data-car-empty]");
    if (empty) empty.textContent = fleet.empty;
    const loading = qs(".fleet-grid--catalog .section-message");
    if (loading && !publicCars.length && !carsLoadFailed) loading.textContent = fleet.loading;
  };

  const applyAboutStaticTranslations = () => {
    if (page() !== "about") return;
    const about = localeCopy("about");
    if (!about) return;
    setNodesText([qs(".page-hero .eyebrow"), qs(".page-hero h1"), qs(".page-hero p")], [about.badge, about.title, about.text]);
    const cards = qsa(".contact-layout--wide .content-card");
    if (cards[0]) {
      const paragraphs = qsa("p", cards[0]);
      const title = qs("h3", cards[0]);
      if (title) title.textContent = about.whyTitle;
      setNodesText(paragraphs, about.whyText || []);
    }
    const stack = qsa(".contact-stack .content-card");
    if (stack[0]) {
      const title = qs("h3", stack[0]);
      if (title) title.textContent = about.principlesTitle;
      setNodesText(qsa(".contact-points span", stack[0]), about.principles || []);
    }
    if (stack[1]) {
      const title = qs("h3", stack[1]);
      if (title) title.textContent = about.contactTitle;
      setNodesText(qsa(".contact-points span, .contact-points a", stack[1]), about.contactItems || []);
    }
  };

  const applyContactStaticTranslations = () => {
    if (page() !== "contact") return;
    const contact = localeCopy("contact");
    if (!contact) return;
    setNodesText([qs(".page-hero .eyebrow"), qs(".page-hero h1"), qs(".page-hero p")], [contact.badge, contact.title, contact.text]);
    const infoCards = qsa(".contact-layout--wide > .contact-stack:first-child .content-card");
    if (infoCards[0]) {
      const title = qs("h3", infoCards[0]);
      if (title) title.textContent = contact.infoTitle;
      setNodesText(qsa(".contact-points a, .contact-points span", infoCards[0]), contact.infoItems || []);
    }
    if (infoCards[1]) {
      const title = qs("h3", infoCards[1]);
      if (title) title.textContent = contact.flowTitle;
      setNodesText(qsa(".contact-points span", infoCards[1]), contact.flowItems || []);
    }
    const formCard = qs(".form-card");
    if (formCard) {
      const title = qs("h2", formCard);
      if (title) title.textContent = contact.formTitle;
      setNodesText(qsa(".field > span", formCard), contact.fieldLabels || []);
      const placeholderMap = [
        ['input[name="fullName"]', contact.placeholders?.[0]],
        ['input[name="driverLicenseSerial"]', contact.placeholders?.[1]],
        ['input[name="phone"]', contact.placeholders?.[2]],
        ['input[name="pickupLocation"]', contact.placeholders?.[3]],
        ['textarea[name="note"]', contact.placeholders?.[4]],
      ];
      placeholderMap.forEach(([selector, value]) => {
        const node = qs(selector, formCard);
        if (node && value) node.setAttribute("placeholder", value);
      });
      const submit = qs('button[type="submit"]', formCard);
      if (submit && !submit.disabled) submit.textContent = contact.submit;
    }
  };

  const applyCarLoadingTranslations = () => {
    if (!["car", "car-detail"].includes(page())) return;
    const car = localeCopy("car");
    if (!car) return;
    setNodesText([qs(".vehicle-summary .eyebrow"), qs(".vehicle-summary h1"), qs(".vehicle-summary p")], [car.loadingBadge, car.loadingTitle, car.loadingText]);
    const aboutTitle = qs("[data-car-description-title]");
    if (aboutTitle) aboutTitle.textContent = car.aboutTitle;
    setNodesText(qsa(".spec-chip span"), car.specLabels || []);
    setNodesText(qsa(".vehicle-cta-group .button"), [localeCopy("nav.reserve"), car.backToFleet]);
  };

  const applyStaticTranslations = () => {
    applyMetaTranslations();
    applySharedTranslations();
    applyHomeStaticTranslations();
    applyFleetStaticTranslations();
    applyAboutStaticTranslations();
    applyContactStaticTranslations();
    applyCarLoadingTranslations();
  };

  const getLocalizedContentVariant = (content, type) => {
    if (!content || currentLocale === "az") return content;

    const fallbackSource = ({
      hero: Data.DEFAULT_HOME_HERO,
      spotlight: Data.DEFAULT_HOME_SPOTLIGHT,
      cta: Data.DEFAULT_HOME_CTA,
    })[type] || {};

    const fallbackLocale = fallbackSource.translations && fallbackSource.translations[currentLocale]
      ? fallbackSource.translations[currentLocale]
      : {};

    const localeVariant = content.translations && content.translations[currentLocale]
      ? content.translations[currentLocale]
      : {};

    const mergeCards = (baseCards, localeCards, fallbackCards) => (Array.isArray(baseCards) ? baseCards : []).map((item, index) => ({
      ...item,
      ...(fallbackCards && fallbackCards[index] ? fallbackCards[index] : {}),
      ...(localeCards && localeCards[index] ? localeCards[index] : {}),
    }));

    if (type === "hero") {
      return {
        ...content,
        badge: localeVariant.badge || fallbackLocale.badge || content.badge,
        title: localeVariant.title || fallbackLocale.title || content.title,
        text: localeVariant.text || fallbackLocale.text || content.text,
        primaryButtonLabel: localeVariant.primaryButtonLabel || fallbackLocale.primaryButtonLabel || content.primaryButtonLabel,
        secondaryButtonLabel: localeVariant.secondaryButtonLabel || fallbackLocale.secondaryButtonLabel || content.secondaryButtonLabel,
        trustItems: mergeCards(content.trustItems, localeVariant.trustItems, fallbackLocale.trustItems),
      };
    }

    if (type === "spotlight") {
      return {
        ...content,
        badge: localeVariant.badge || fallbackLocale.badge || content.badge,
        title: localeVariant.title || fallbackLocale.title || content.title,
        text: localeVariant.text || fallbackLocale.text || content.text,
        primaryButtonLabel: localeVariant.primaryButtonLabel || fallbackLocale.primaryButtonLabel || content.primaryButtonLabel,
        secondaryButtonLabel: localeVariant.secondaryButtonLabel || fallbackLocale.secondaryButtonLabel || content.secondaryButtonLabel,
        cards: mergeCards(content.cards, localeVariant.cards, fallbackLocale.cards),
      };
    }

    if (type === "cta") {
      return {
        ...content,
        badge: localeVariant.badge || fallbackLocale.badge || content.badge,
        title: localeVariant.title || fallbackLocale.title || content.title,
        text: localeVariant.text || fallbackLocale.text || content.text,
        metaItems: (localeVariant.metaItems && localeVariant.metaItems.length ? localeVariant.metaItems : (fallbackLocale.metaItems || content.metaItems)),
        primaryButtonLabel: localeVariant.primaryButtonLabel || fallbackLocale.primaryButtonLabel || content.primaryButtonLabel,
        secondaryButtonLabel: localeVariant.secondaryButtonLabel || fallbackLocale.secondaryButtonLabel || content.secondaryButtonLabel,
      };
    }

    return content;
  };

  const setLocale = (locale, { persist = true, rerender = true } = {}) => {
    currentLocale = isLocaleCode(locale) ? String(locale).toLowerCase() : DEFAULT_LOCALE;
    if (persist) localStorage.setItem(LOCALE_KEY, currentLocale);
    applyStaticTranslations();
    setTheme(getSavedTheme(), { persist: false });
    if (rerender) renderLocalizedContent();
  };

  const injectWhatsappButton = () => {
    if (qs(".whatsapp-float")) return;
    const link = document.createElement("a");
    link.className = "whatsapp-float";
    link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("aria-label", "WhatsApp");
    link.innerHTML = '<span class="whatsapp-float__icon" aria-hidden="true"><svg viewBox="0 0 32 32" role="img" focusable="false"><path d="M27.2 4.8A13.7 13.7 0 0 0 5.9 21.6L3.8 28l6.6-2.1a13.8 13.8 0 1 0 16.8-21.1ZM16 27a11.3 11.3 0 0 1-5.7-1.5l-.4-.2-3.9 1.2 1.3-3.8-.3-.4A11.2 11.2 0 1 1 16 27Zm6.2-8.4-.8-.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2l-.9 1.1c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6.4-.5c.1-.2.1-.4 0-.6l-.3-.8c-.1-.3-.7-1.8-1-2.5-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.1 1.1-1.1 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.8 5 .8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.7-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.2-.6-.4Z" fill="currentColor"/></svg></span>';
    document.body.appendChild(link);
  };

  const initMenu = () => {
    const button = qs("[data-menu-toggle]");
    const menu = qs("[data-menu]");
    if (!button || !menu || button.dataset.bound === "true") return;
    const setOpen = (open) => {
      button.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    qsa("a", menu).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("click", (event) => {
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(event.target) || button.contains(event.target)) return;
      setOpen(false);
    });
    button.dataset.bound = "true";
  };

  const initAdminMenu = () => {
    qsa("[data-admin-menu]").forEach((root) => {
      const toggle = qs("[data-admin-menu-toggle]", root);
      const panel = qs("[data-admin-menu-panel]", root);
      if (!toggle || !panel || root.dataset.bound === "true") return;
      const setOpen = (open) => {
        root.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        panel.hidden = !open;
      };
      setOpen(false);
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const nextOpen = panel.hidden;
        qsa("[data-admin-menu]").forEach((item) => {
          if (item === root) return;
          const itemToggle = qs("[data-admin-menu-toggle]", item);
          const itemPanel = qs("[data-admin-menu-panel]", item);
          if (itemToggle) itemToggle.setAttribute("aria-expanded", "false");
          if (itemPanel) itemPanel.hidden = true;
          item.classList.remove("is-open");
        });
        setOpen(nextOpen);
      });
      root.dataset.bound = "true";
    });
    document.addEventListener("click", (event) => {
      qsa("[data-admin-menu].is-open").forEach((root) => {
        if (root.contains(event.target)) return;
        const toggle = qs("[data-admin-menu-toggle]", root);
        const panel = qs("[data-admin-menu-panel]", root);
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        if (panel) panel.hidden = true;
        root.classList.remove("is-open");
      });
    });
  };

  const syncDateFields = () => {
    const today = new Date().toISOString().split("T")[0];
    qsa('input[type="date"]').forEach((input) => { input.min = today; });
    qsa('[name="pickupDate"]').forEach((pickup) => {
      if (pickup.dataset.bound === "true") return;
      pickup.addEventListener("change", () => {
        const form = pickup.closest("form");
        const dropoff = form ? qs('[name="dropoffDate"]', form) : null;
        if (!dropoff) return;
        dropoff.min = pickup.value || today;
        if (dropoff.value && pickup.value && dropoff.value < pickup.value) dropoff.value = pickup.value;
      });
      pickup.dataset.bound = "true";
    });
  };

  const buildCarCard = (car) => {
    const availabilitySummary = getCarAvailabilitySummary(car);
    const availabilityState = resolveAvailabilityState(availabilitySummary);
    const availabilityBadgeText = getScheduleAvailabilityBadgeText(availabilitySummary);
    const upcomingReservationText = getUpcomingReservationText(availabilitySummary);
    const reservable = isCarReservable(car);
    const actionLabel = reservable
      ? localeCopy("card.reserve")
      : (["reserved", "rented"].includes(availabilityState)
        ? availabilityBadgeText
        : getReservationActionCopy("unavailable"));
    const searchTerms = [
      car.title,
      car.brand,
      car.model,
      car.category,
      car.transmission,
      car.fuelType,
      car.city,
      car.year,
      getCarSummary(car),
    ].join(" ").toLowerCase();
    const imageStyle = car.coverImageUrl
      ? `style="background-image: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(17,19,24,0.2)), url('${escapeHtml(car.coverImageUrl)}');"`
      : "";
    return `
      <article class="fleet-card card fleet-card--${escapeHtml(availabilityState)}${availabilityState === "unavailable" ? " is-unavailable" : ""}" data-car-card data-category="${escapeHtml(car.category)}" data-search="${escapeHtml(searchTerms)}">
        <a class="vehicle-card-link" href="${buildCarLink(car.slug)}">
          <div class="fleet-card__media">
            <span class="fleet-card__availability fleet-card__availability--${escapeHtml(availabilityState)}">${escapeHtml(availabilityBadgeText)}</span>
            <div class="fleet-card__image" ${imageStyle}>
              ${car.coverImageUrl ? "" : `<span class="fleet-card__placeholder">${escapeHtml(localeCopy("card.imagePending"))}</span>`}
            </div>
          </div>
          <div class="fleet-card__body">
            <div class="fleet-card__meta">
              <strong>${escapeHtml(car.title)}</strong>
              <span>${escapeHtml(formatPrice(car.dailyPrice))}</span>
            </div>
            ${upcomingReservationText ? `<div class="fleet-card__notice">${escapeHtml(upcomingReservationText)}</div>` : ""}
            <ul class="fleet-card__specs">
              <li>${escapeHtml(formatSeatCount(car.seats))}</li>
              <li>${escapeHtml(car.fuelType || localeCopy("card.fuelMissing"))}</li>
              <li>${escapeHtml(car.transmission || localeCopy("card.transmissionMissing"))}</li>
            </ul>
            <p>${escapeHtml(getCarSummary(car))}</p>
            <div class="fleet-card__footer">
              <span>${escapeHtml(localeCopy("card.details"))}</span>
              <span class="fleet-card__cta">${escapeHtml(actionLabel)}</span>
            </div>
          </div>
        </a>
      </article>
    `;
  };

  const renderGrid = (grid, cars, emptyNode, emptyMessage) => {
    if (!grid) return;
    if (!cars.length) {
      grid.innerHTML = createEmptyMessage(emptyMessage);
      if (emptyNode) emptyNode.classList.add("is-visible");
      return;
    }
    if (emptyNode) emptyNode.classList.remove("is-visible");
    grid.innerHTML = cars.map(buildCarCard).join("");
  };

  const initFleetFiltering = () => {
    const grid = qs('body[data-page="fleet"] .fleet-grid--catalog');
    const buttons = qsa("[data-filter-btn]");
    const search = qs("[data-car-search]");
    const empty = qs("[data-car-empty]");
    const panelToggle = qs("[data-filter-toggle]");
    const panel = qs("[data-filter-panel]");
    if (!grid || !buttons.length) return;

    if (grid.dataset.filterInit !== "true") {
      if (panelToggle && panel) {
        const setOpen = (open) => {
          panel.classList.toggle("is-open", open);
          panelToggle.setAttribute("aria-expanded", String(open));
        };
        setOpen(false);
        panelToggle.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
        buttons.forEach((button) => button.addEventListener("click", () => {
          if (window.innerWidth <= 980) setOpen(false);
        }));
      }

      let activeFilter = "all";
      let activeQuery = "";
      const applyFilters = () => {
        let visible = 0;
        qsa("[data-car-card]", grid).forEach((card) => {
          const category = String(card.dataset.category || "");
          const haystack = String(card.dataset.search || "").toLowerCase();
          const show = (activeFilter === "all" || category === activeFilter) && (!activeQuery || haystack.includes(activeQuery));
          card.hidden = !show;
          if (show) visible += 1;
        });
        if (empty) empty.classList.toggle("is-visible", visible === 0);
      };

      buttons.forEach((button) => button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        applyFilters();
      }));
      if (search) search.addEventListener("input", (event) => {
        activeQuery = event.target.value.trim().toLowerCase();
        applyFilters();
      });
      grid.dataset.filterInit = "true";
      grid._applyFleetFilters = applyFilters; // eslint-disable-line no-underscore-dangle
    }

    if (typeof grid._applyFleetFilters === "function") grid._applyFleetFilters(); // eslint-disable-line no-underscore-dangle
  };

  const initRevealAnimations = () => {
    const targets = qsa(".hero-copy, .hero-panel, .section-heading, .fleet-card, .insight-card, .journey-card, .service-feature, .cta-banner, .content-card, .form-card, .metric-card, .vehicle-actions, .vehicle-summary");
    if (!targets.length || !("IntersectionObserver" in window)) return;
    targets.forEach((node, index) => {
      node.classList.add("reveal");
      node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((node) => observer.observe(node));
  };

  const renderHomeHero = () => {
    const section = qs("[data-home-hero]");
    if (!section) return;
    const localizedHero = getLocalizedContentVariant(homeHero, "hero");
    const primary = qs("[data-home-hero-primary]", section);
    const secondary = qs("[data-home-hero-secondary]", section);
    if (qs("[data-home-hero-badge]", section)) qs("[data-home-hero-badge]", section).textContent = localizedHero.badge;
    if (qs("[data-home-hero-title]", section)) qs("[data-home-hero-title]", section).textContent = localizedHero.title;
    if (qs("[data-home-hero-text]", section)) qs("[data-home-hero-text]", section).textContent = localizedHero.text;
    if (primary) {
      primary.textContent = localizedHero.primaryButtonLabel;
      primary.setAttribute("href", localizedHero.primaryButtonLink || "./pages/fleet.html");
    }
    if (secondary) {
      secondary.textContent = localizedHero.secondaryButtonLabel;
      secondary.setAttribute("href", localizedHero.secondaryButtonLink || "./pages/contact.html");
    }
    qsa("[data-home-hero-trust-item]", section).forEach((item, index) => {
      const data = localizedHero.trustItems[index] || { value: "", label: "" };
      const value = qs("strong", item);
      const label = qs("span", item);
      if (value) value.textContent = data.value;
      if (label) label.textContent = data.label;
    });
  };

  const renderHomeSpotlight = () => {
    const section = qs("[data-home-spotlight]");
    if (!section) return;
    const localizedSpotlight = getLocalizedContentVariant(homeSpotlight, "spotlight");
    section.hidden = !homeSpotlight.visible;
    if (section.hidden) return;
    if (qs("[data-home-spotlight-badge]", section)) qs("[data-home-spotlight-badge]", section).textContent = localizedSpotlight.badge;
    if (qs("[data-home-spotlight-title]", section)) qs("[data-home-spotlight-title]", section).textContent = localizedSpotlight.title;
    if (qs("[data-home-spotlight-text]", section)) qs("[data-home-spotlight-text]", section).textContent = localizedSpotlight.text;
    const image = qs("[data-home-spotlight-image]", section);
    if (image) {
      image.src = homeSpotlight.imageUrl || Data.DEFAULT_HOME_SPOTLIGHT.imageUrl;
      image.alt = localizedSpotlight.title || BRAND_NAME;
    }
    const cards = qs("[data-home-spotlight-cards]", section);
    if (cards) {
      cards.innerHTML = localizedSpotlight.cards.map((item, index) => `
        <article class="service-feature__card">
          <span class="service-feature__card-index">${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `).join("");
    }
    const primary = qs("[data-home-spotlight-primary]", section);
    const secondary = qs("[data-home-spotlight-secondary]", section);
    if (primary) {
      primary.textContent = localizedSpotlight.primaryButtonLabel;
      primary.setAttribute("href", homeSpotlight.primaryButtonLink || "./pages/contact.html#rezervasiya");
    }
    if (secondary) {
      secondary.textContent = localizedSpotlight.secondaryButtonLabel;
      secondary.setAttribute("href", homeSpotlight.secondaryButtonLink || "./pages/about.html");
    }
  };

  const renderHomeCta = () => {
    const section = qs("[data-home-cta]");
    if (!section) return;
    const localizedCta = getLocalizedContentVariant(homeCta, "cta");
    if (qs("[data-home-cta-badge]", section)) qs("[data-home-cta-badge]", section).textContent = localizedCta.badge;
    if (qs("[data-home-cta-title]", section)) qs("[data-home-cta-title]", section).textContent = localizedCta.title;
    if (qs("[data-home-cta-text]", section)) qs("[data-home-cta-text]", section).textContent = localizedCta.text;
    const meta = qs("[data-home-cta-meta]", section);
    if (meta) meta.innerHTML = localizedCta.metaItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    const primary = qs("[data-home-cta-primary]", section);
    const secondary = qs("[data-home-cta-secondary]", section);
    if (primary) {
      primary.textContent = localizedCta.primaryButtonLabel;
      primary.setAttribute("href", homeCta.primaryButtonLink || `https://wa.me/${WHATSAPP_NUMBER}`);
    }
    if (secondary) {
      secondary.textContent = localizedCta.secondaryButtonLabel;
      secondary.setAttribute("href", homeCta.secondaryButtonLink || `tel:${PHONE_NUMBER.replace(/\s+/g, "")}`);
    }
  };

  const renderHomePage = () => {
    if (page() !== "home") return;
    renderHomeHero();
    renderHomeSpotlight();
    renderHomeCta();
    const grid = qs(".fleet-section .fleet-grid--catalog");
    const empty = qs(".fleet-section .fleet-empty");
    if (carsLoadFailed) {
      renderGrid(grid, [], empty, localeCopy("messages.carsError"));
      return;
    }
    renderGrid(grid, publicCars, empty, localeCopy("fleet.noneVisible"));
    const trust = qsa("[data-home-hero-trust-item]");
    if (trust[1]) {
      const value = qs("strong", trust[1]);
      const label = qs("span", trust[1]);
      if (value) value.textContent = formatModelCount(publicCars.length);
      if (label) label.textContent = localeCopy("home.liveFleet");
    }
  };

  const renderFleetPage = () => {
    if (page() !== "fleet") return;
    const grid = qs(".fleet-grid--catalog");
    const empty = qs("[data-car-empty]");
    renderGrid(grid, carsLoadFailed ? [] : publicCars, empty, carsLoadFailed ? localeCopy("messages.carsError") : localeCopy("fleet.noCars"));
    if (!carsLoadFailed) initFleetFiltering();
  };

  const populateCarSelects = () => {
    const reservableCars = publicCars.filter(isCarReservable);
    qsa("[data-car-select]").forEach((select) => {
      const requestedSlug = getRequestedCarSlug();
      select.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = reservableCars.length ? localeCopy("messages.selectCar") : localeCopy("messages.noActiveCars");
      select.appendChild(placeholder);
      reservableCars.forEach((car) => {
        const option = document.createElement("option");
        option.value = car.slug;
        option.textContent = `${car.title} • ${formatPrice(car.dailyPrice)}`;
        select.appendChild(option);
      });
      if (requestedSlug && reservableCars.some((car) => car.slug === requestedSlug)) select.value = requestedSlug;
      select.disabled = reservableCars.length === 0;
    });
  };

  const buildReservationMessage = (payload) => {
    const car = getCarBySlug(payload.carSlug);
    return [
      localeCopy("reservation.intro"),
      `${localeCopy("reservation.labels.0")}: ${payload.fullName || "-"}`,
      `${localeCopy("reservation.labels.1")}: ${payload.phone || "-"}`,
      `${localeCopy("reservation.labels.2")}: ${car ? car.title : (payload.carSlug || "-")}`,
      `${localeCopy("reservation.labels.3")}: ${payload.pickupDate || "-"}`,
      `${localeCopy("reservation.labels.4")}: ${payload.pickupTime || "-"}`,
      `${localeCopy("reservation.labels.5")}: ${payload.dropoffDate || "-"}`,
      `${localeCopy("reservation.labels.6")}: ${payload.pickupLocation || "-"}`,
      `${localeCopy("reservation.labels.7")}: ${payload.driverLicenseSerial || "-"}`,
      `${localeCopy("reservation.labels.8")}: ${payload.note || "-"}`,
    ].join("\n");
  };

  const submitReservation = async (event) => {
    const form = event.currentTarget;
    const feedback = qs("[data-reservation-feedback]");
    const submitButton = qs('button[type="submit"]', form);
    const originalLabel = submitButton ? submitButton.textContent : "";
    const payload = Object.fromEntries(new FormData(form).entries());
    const selectedCar = getCarBySlug(payload.carSlug);
    const startedAt = Number(payload.startedAt || 0);
    const filledTooFast = startedAt && (Date.now() - startedAt) < 1500;

    if (payload.website) {
      setFeedback(feedback, localeCopy("contact.feedback.success"), "is-success");
      form.reset();
      populateCarSelects();
      syncDateFields();
      const startedField = qs('[name="startedAt"]', form);
      if (startedField) startedField.value = String(Date.now());
      return;
    }

    if (!payload.carSlug) {
      setFeedback(feedback, localeCopy("contact.feedback.selectCar"), "is-error");
      return;
    }
    if (!selectedCar || !isCarReservable(selectedCar)) {
      setFeedback(feedback, getReservationActionCopy("unavailableForm"), "is-error");
      return;
    }
    if (filledTooFast) {
      setFeedback(feedback, "Formanı tam doldurub yenidən göndərin.", "is-error");
      return;
    }
    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = localeCopy("contact.feedback.sending");
      }
      setFeedback(feedback, "");
      await Data.createReservationLead(payload);
      setFeedback(feedback, localeCopy("contact.feedback.success"), "is-success");
      form.reset();
      populateCarSelects();
      syncDateFields();
      const startedField = qs('[name="startedAt"]', form);
      if (startedField) startedField.value = String(Date.now());
      window.setTimeout(() => {
        window.location.href = buildWhatsappUrl(buildReservationMessage(payload));
      }, 250);
    } catch {
      setFeedback(feedback, localeCopy("contact.feedback.fallback"), "is-success");
      window.setTimeout(() => {
        window.location.href = buildWhatsappUrl(buildReservationMessage(payload));
      }, 250);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel || localeCopy("contact.submit");
      }
    }
  };

  const initContactPage = () => {
    populateCarSelects();
    const form = qs("[data-reservation-form]");
    if (!form || form.dataset.bound === "true") return;
    const startedField = qs('[name="startedAt"]', form);
    if (startedField) startedField.value = String(Date.now());
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitReservation(event);
    });
    form.dataset.bound = "true";
  };

  const renderAboutMetrics = () => {
    if (page() !== "about") return;
    const metrics = qsa(".metric-card");
    const copy = localeCopy("about.metrics", []);
    metrics.forEach((card, index) => {
      const value = qs("strong", card);
      const label = qs("span", card);
      if (!copy[index]) return;
      if (index === 0) {
        if (value) value.textContent = formatModelCount(publicCars.length);
        if (label) label.textContent = copy[index].label;
        return;
      }
      if (value) value.textContent = copy[index].value;
      if (label) label.textContent = copy[index].label;
    });
  };

  const getCarMediaImages = (car) => {
    const seen = new Set();
    return [car.coverImageUrl, ...(Array.isArray(car.galleryImages) ? car.galleryImages : [])]
      .map((value) => String(value || "").trim())
      .filter((url) => {
        if (!url || seen.has(url)) return false;
        seen.add(url);
        return true;
      });
  };

  const setVehicleVisual = (node, car, images = []) => {
    if (!node) return;
    node.setAttribute("data-model", car.title);
    const availabilitySummary = getCarAvailabilitySummary(car);
    const availabilityState = resolveAvailabilityState(availabilitySummary);
    const badgeMarkup = `<span class="vehicle-status vehicle-status--${escapeHtml(availabilityState)}">${escapeHtml(getScheduleAvailabilityBadgeText(availabilitySummary))}</span>`;
    node.style.backgroundImage = "none";
    if (!images.length) {
      node.innerHTML = `
        <div class="vehicle-visual__stage">
          ${badgeMarkup}
          <span class="vehicle-visual__empty">${escapeHtml(localeCopy("card.imagePending"))}</span>
        </div>
      `;
      return { setImage: () => {} };
    }

    node.innerHTML = `
      <div class="vehicle-visual__stage">
        ${badgeMarkup}
        <button class="vehicle-visual__nav vehicle-visual__nav--prev" type="button" data-vehicle-nav="prev" aria-label="Previous image"${images.length > 1 ? "" : " hidden"}>&lsaquo;</button>
        <img class="vehicle-visual__image" data-vehicle-stage-image src="${escapeHtml(images[0])}" alt="${escapeHtml(car.title)}" loading="eager" />
        <button class="vehicle-visual__nav vehicle-visual__nav--next" type="button" data-vehicle-nav="next" aria-label="Next image"${images.length > 1 ? "" : " hidden"}>&rsaquo;</button>
        <div class="vehicle-visual__overlay">
          <span class="vehicle-visual__caption">${escapeHtml(car.title)}</span>
          <span class="vehicle-visual__count" data-vehicle-count>${String(1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}</span>
        </div>
      </div>
      ${images.length > 1 ? `
        <div class="vehicle-visual__thumbs">
          ${images.map((url, index) => `
            <button class="vehicle-visual__thumb${index === 0 ? " is-active" : ""}" type="button" data-vehicle-thumb="${index}" aria-label="${escapeHtml(`${car.title} ${index + 1}`)}">
              <img src="${escapeHtml(url)}" alt="${escapeHtml(`${car.title} ${index + 1}`)}" loading="lazy" />
            </button>
          `).join("")}
        </div>
      ` : ""}
    `;

    const stageImage = qs("[data-vehicle-stage-image]", node);
    const countNode = qs("[data-vehicle-count]", node);
    const thumbButtons = qsa("[data-vehicle-thumb]", node);
    const navPrev = qs('[data-vehicle-nav="prev"]', node);
    const navNext = qs('[data-vehicle-nav="next"]', node);
    let activeIndex = 0;

    const syncSelections = () => {
      thumbButtons.forEach((button) => {
        button.classList.toggle("is-active", Number(button.dataset.vehicleThumb) === activeIndex);
      });
    };

    const setImage = (nextIndex) => {
      if (!stageImage || !images.length) return;
      activeIndex = (nextIndex + images.length) % images.length;
      stageImage.style.opacity = "0.62";
      stageImage.src = images[activeIndex];
      stageImage.alt = `${car.title} ${activeIndex + 1}`;
      const restoreOpacity = () => { stageImage.style.opacity = "1"; };
      if (stageImage.complete) requestAnimationFrame(restoreOpacity);
      else stageImage.addEventListener("load", restoreOpacity, { once: true });
      if (countNode) countNode.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
      syncSelections();
    };

    thumbButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setImage(Number(button.dataset.vehicleThumb));
      });
    });
    if (navPrev) navPrev.addEventListener("click", () => setImage(activeIndex - 1));
    if (navNext) navNext.addEventListener("click", () => setImage(activeIndex + 1));

    return { setImage };
  };

  const renderVehicleRentalState = (node, car) => {
    if (!node) return;
    const summary = getCarAvailabilitySummary(car);
    const currentStatus = resolveAvailabilityState(summary);

    if (carDetailCountdownTimer) {
      window.clearInterval(carDetailCountdownTimer);
      carDetailCountdownTimer = null;
    }

    const renderSnapshot = () => {
      const liveSummary = getCarAvailabilitySummary(car);
      const liveStatus = resolveAvailabilityState(liveSummary);

      if (liveStatus === "rented" && liveSummary.activeReservation) {
        node.hidden = false;
        node.innerHTML = `
          <div class="vehicle-rental-state__head">
            <strong>Kiralama takvimi</strong>
            <span class="vehicle-rental-state__badge vehicle-rental-state__badge--rented">Kirada</span>
          </div>
          <div class="vehicle-rental-state__grid">
            <div><span>Kiralama başlangıcı</span><strong>${escapeHtml(formatReservationDateTime(liveSummary.activeReservation.startDateTime))}</strong></div>
            <div><span>Kiralama bitişi</span><strong>${escapeHtml(formatReservationDateTime(liveSummary.activeReservation.endDateTime))}</strong></div>
            <div class="vehicle-rental-state__full"><span>Kalan süre</span><strong>${escapeHtml(formatRemainingTime(liveSummary.remainingMs))}</strong></div>
          </div>
        `;
        return;
      }

      if (liveStatus === "reserved" && liveSummary.activeReservation) {
        node.hidden = false;
        node.innerHTML = `
          <div class="vehicle-rental-state__head">
            <strong>Rezervasyon takvimi</strong>
            <span class="vehicle-rental-state__badge vehicle-rental-state__badge--reserved">Rezerve</span>
          </div>
          <div class="vehicle-rental-state__grid">
            <div><span>Rezervasyon başlangıcı</span><strong>${escapeHtml(formatReservationDateTime(liveSummary.activeReservation.startDateTime))}</strong></div>
            <div><span>Rezervasyon bitişi</span><strong>${escapeHtml(formatReservationDateTime(liveSummary.activeReservation.endDateTime))}</strong></div>
          </div>
        `;
        return;
      }

      if (liveSummary.upcomingReservation) {
        node.hidden = false;
        node.innerHTML = `
          <div class="vehicle-rental-state__head">
            <strong>Yaklaşan rezervasyon</strong>
            <span class="vehicle-rental-state__badge vehicle-rental-state__badge--available">Müsait</span>
          </div>
          <div class="vehicle-rental-state__grid">
            <div class="vehicle-rental-state__full"><span>Başlangıç</span><strong>${escapeHtml(formatReservationDateTime(liveSummary.upcomingReservation.startDateTime))}</strong></div>
          </div>
        `;
        return;
      }

      if (liveStatus === "expired" && liveSummary.latestExpiredReservation) {
        node.hidden = false;
        node.innerHTML = `
          <div class="vehicle-rental-state__head">
            <strong>Son durum</strong>
            <span class="vehicle-rental-state__badge vehicle-rental-state__badge--expired">Süresi doldu</span>
          </div>
          <div class="vehicle-rental-state__grid">
            <div class="vehicle-rental-state__full"><span>Bitiş</span><strong>${escapeHtml(formatReservationDateTime(liveSummary.latestExpiredReservation.endDateTime))}</strong></div>
          </div>
        `;
        return;
      }

      node.hidden = true;
      node.innerHTML = "";
    };

    renderSnapshot();

    if (currentStatus === "rented") {
      carDetailCountdownTimer = window.setInterval(renderSnapshot, 60000);
    }
  };

  const renderCarDetail = async () => {
    if (!["car", "car-detail"].includes(page())) return;
    const slug = getRequestedCarSlug();
    if (!slug) return;
    if (carDetailCountdownTimer) {
      window.clearInterval(carDetailCountdownTimer);
      carDetailCountdownTimer = null;
    }
    const car = getCarBySlug(slug) || await Data.getPublishedCarBySlug(slug);
    const main = qs("main");
    const carCopy = localeCopy("car");

    if (!car) {
      document.title = localeCopy("meta.carMissing.title", `${BRAND_NAME} | Car not found`);
      if (main) {
        main.innerHTML = `
          <div class="container page-stack">
            <section class="page-hero card">
              <span class="eyebrow">${escapeHtml(carCopy.notFoundBadge)}</span>
              <h1>${escapeHtml(carCopy.notFoundTitle)}</h1>
              <p>${escapeHtml(carCopy.notFoundText)}</p>
              <div class="hero-actions">
                <a class="button button--primary" href="/pages/fleet.html">${escapeHtml(carCopy.notFoundPrimary)}</a>
                <a class="button button--secondary" href="/pages/contact.html">${escapeHtml(carCopy.notFoundSecondary)}</a>
              </div>
            </section>
          </div>
        `;
      }
      return;
    }

    document.title = `${BRAND_NAME} | ${car.title}`;
    const meta = qs('meta[name="description"]');
    if (meta) meta.setAttribute("content", getCarSummary(car));

    const eyebrow = qs(".vehicle-summary .eyebrow");
    const title = qs(".vehicle-summary h1");
    const price = qs(".vehicle-price");
    const summary = qs(".vehicle-summary p");
    const visual = qs(".vehicle-visual");
    const descriptionTitle = qs("[data-car-description-title]") || qs(".vehicle-layout .content-card h3");
    const description = qs("[data-car-description]") || qs(".vehicle-layout .content-card p");
    const features = qs("[data-car-features]");
    const rentalState = qs("[data-car-rental-state]");
    const images = getCarMediaImages(car);
    const availabilitySummary = getCarAvailabilitySummary(car);
    const availabilityState = resolveAvailabilityState(availabilitySummary);

    if (eyebrow) eyebrow.textContent = car.featured ? carCopy.featuredEyebrow : getCategoryLabel(car.category);
    if (title) title.textContent = car.year ? `${car.title} ${car.year}` : car.title;
    if (price) price.textContent = formatPrice(car.dailyPrice);
    if (summary) summary.textContent = getCarSummary(car);
    if (descriptionTitle) descriptionTitle.textContent = carCopy.aboutTitle;
    if (description) description.textContent = car.description || getCarSummary(car);
    setVehicleVisual(visual, car, images);
    renderVehicleRentalState(rentalState, car);

    const chipValues = [
      [carCopy.specLabels[0], formatPrice(car.dailyPrice)],
      [carCopy.specLabels[1], formatMonthlyPrice(car.monthlyPrice)],
      [carCopy.specLabels[2], formatSeatCount(car.seats)],
      [carCopy.specLabels[3], car.transmission || carCopy.specMissing],
      [carCopy.specLabels[4], car.fuelType || carCopy.specMissing],
      [carCopy.specLabels[5], formatCityLabel(car.city)],
    ];
    qsa(".spec-chip").forEach((chip, index) => {
      const pair = chipValues[index] || [localeCopy("units.info", "Info"), "-"];
      const label = qs("span", chip);
      const value = qs("strong", chip);
      if (label) label.textContent = pair[0];
      if (value) value.textContent = pair[1];
    });

    const ctas = qsa(".vehicle-cta-group .button");
    if (ctas[0]) {
      const reservable = isCarReservable(car);
      ctas[0].textContent = reservable ? localeCopy("nav.reserve") : getReservationActionCopy(["rented", "reserved"].includes(availabilityState) ? "whatsapp" : "whatsapp");
      ctas[0].setAttribute(
        "href",
        reservable
          ? `/pages/contact.html?car=${encodeURIComponent(car.slug)}#rezervasiya`
          : buildWhatsappUrl([
            "Salam, bu maşın barədə məlumat almaq istəyirəm.",
            `${localeCopy("reservation.labels.2")}: ${car.title}`,
            `${localeCopy("reservation.labels.1")}: -`,
          ].join("\n"))
      );
    }
    if (ctas[1]) {
      ctas[1].textContent = carCopy.backToFleet;
      ctas[1].setAttribute("href", "/pages/fleet.html");
    }

    if (features) {
      const items = car.features.length ? car.features : [carCopy.featureFallback];
      features.innerHTML = items.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    }
  };

  const showCarsErrorState = (message) => {
    qsa(".fleet-grid--catalog").forEach((grid) => { grid.innerHTML = createEmptyMessage(message); });
    populateCarSelects();
  };

  const renderLocalizedContent = () => {
    applyStaticTranslations();
    renderHomePage();
    renderFleetPage();
    renderAboutMetrics();
    populateCarSelects();
    renderCarDetail();
  };

  const applyPublicContentSnapshot = ({ cars, reservations, hero, spotlight, cta, failed }) => {
    publicCars = Array.isArray(cars) ? cars : [];
    publicCarReservations = Array.isArray(reservations) ? reservations : [];
    homeHero = hero || Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO);
    homeSpotlight = spotlight || Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT);
    homeCta = cta || Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA);
    carsLoadFailed = Boolean(failed);
  };

  const refreshPublicContent = async ({ silent = false } = {}) => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const [cars, reservations, hero, spotlight, cta] = await Promise.all([
          Data.listPublishedCars({ force: true }),
          Data.listPublicCarReservations({ force: true }).catch(() => []),
          Data.getHomeHeroContent().catch(() => Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO)),
          Data.getHomeSpotlightContent().catch(() => Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT)),
          Data.getHomeCtaContent().catch(() => Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA)),
        ]);

        applyPublicContentSnapshot({
          cars,
          reservations,
          hero,
          spotlight,
          cta,
          failed: false,
        });
      } catch {
        applyPublicContentSnapshot({
          cars: [],
          reservations: [],
          hero: Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO),
          spotlight: Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT),
          cta: Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA),
          failed: true,
        });

        if (!silent) {
          showCarsErrorState(localeCopy("messages.carsError"));
        }
      }

      if (appBooted) {
        renderLocalizedContent();
        initContactPage();
      }
    })();

    try {
      await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  };

  const notifyRefreshIfVisible = () => {
    if (document.visibilityState !== "visible") return;
    refreshPublicContent({ silent: true });
  };

  const initPublicSync = () => {
    if ("BroadcastChannel" in window) {
      publicSyncChannel = new BroadcastChannel(PUBLIC_SYNC_CHANNEL);
      publicSyncChannel.addEventListener("message", () => {
        refreshPublicContent({ silent: true });
      });
    }

    window.addEventListener("storage", (event) => {
      if (event.key === PUBLIC_SYNC_STORAGE_KEY) {
        refreshPublicContent({ silent: true });
      }
    });

    document.addEventListener("visibilitychange", notifyRefreshIfVisible);
    window.addEventListener("focus", () => {
      refreshPublicContent({ silent: true });
    });
    window.addEventListener("pageshow", () => {
      refreshPublicContent({ silent: true });
    });

    refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshPublicContent({ silent: true });
      }
    }, PUBLIC_REFRESH_INTERVAL);
  };

  const boot = async () => {
    currentLocale = getSavedLocale();
    updateBranding();
    initMenu();
    initAdminMenu();
    injectSiteUtilities();
    setTheme(getSavedTheme(), { persist: false });
    setLocale(currentLocale, { persist: false, rerender: false });
    injectWhatsappButton();
    syncDateFields();
    initPublicSync();

    await refreshPublicContent();

    appBooted = true;
    renderLocalizedContent();
    initContactPage();
    initRevealAnimations();
  };

  document.addEventListener("DOMContentLoaded", boot);
})();
