/**
 * NebesnaStudio — Сценарии интерфейса лендинга
 * Версия: 2.1.0 (Исправленная и оптимизированная)
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- НАСТРОЙКИ И КОНСТАНТЫ ---
    const CONFIG = {
        activeClass: 'is-active',
        scrollLockStyle: 'hidden'
    };

    // --- НАСТРОЙКИ TELEGRAM ---
    const TELEGRAM_CONFIG = {
        token: '8909073744:AAEJ0m-e7n5-O3-59s3W-35wUdvbRbo_jqc',
        chatId: '786376539'
    };

    // --- DOM ЭЛЕМЕНТЫ (ИСПРАВЛЕННЫЙ ВАРЯНТ) ---
    const DOM = {
        modalOverlay: document.querySelector('.id-modal-overlay'),
        closeModalBtn: document.querySelector('.id-modal-close'),
        bookingForm: document.querySelector('.id-booking-form'),
        openModalBtns: document.querySelectorAll('.js-open-modal'),
        inputName: document.getElementById('user-name'),
        inputPhone: document.getElementById('user-phone'),
        selectWorkout: document.getElementById('workout-type'),
        selectAge: document.getElementById('workout-age'), // ИСПРАВЛЕНО: Добавлена строка сбора возраста
        submitBtn: document.querySelector('.id-booking-form .btn'),

        // Элементы мобильного меню
        burgerMenuBtn: document.querySelector('.id-burger-menu'),
        navWrapper: document.querySelector('.id-nav-wrapper'),
        navLinks: document.querySelectorAll('.nav-link'),

        // Переключатель темы
        themeToggleBtn: document.querySelector('.id-theme-toggle')
    };


    // --- МОДАЛЬНОЕ ОКНО ---

    const openModal = () => {
        if (!DOM.modalOverlay) return;
        DOM.modalOverlay.classList.add(CONFIG.activeClass);
        document.body.style.overflow = CONFIG.scrollLockStyle;
        if (DOM.inputName) DOM.inputName.focus();
    };

    const closeModal = () => {
        if (!DOM.modalOverlay) return;
        DOM.modalOverlay.classList.remove(CONFIG.activeClass);
        document.body.style.overflow = '';
    };

    const handleOverlayClick = (event) => {
        if (event.target === DOM.modalOverlay) {
            closeModal();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape' && DOM.modalOverlay?.classList.contains(CONFIG.activeClass)) {
            closeModal();
        }
    };

    // --- МОБИЛЬНОЕ БУРГЕР-МЕНЮ ---

    const toggleMenu = () => {
        DOM.burgerMenuBtn?.classList.toggle('is-active');
        DOM.navWrapper?.classList.toggle('is-active');

        if (DOM.navWrapper?.classList.contains('is-active')) {
            document.body.style.overflow = CONFIG.scrollLockStyle;
        } else {
            document.body.style.overflow = '';
        }
    };

    const closeMenu = () => {
        DOM.burgerMenuBtn?.classList.remove('is-active');
        DOM.navWrapper?.classList.remove('is-active');
        document.body.style.overflow = '';
    };

    // --- ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ---

    const initTheme = () => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    };

    const toggleTheme = () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    };

    // --- ОТПРАВКА ДАННЫХ ФОРМЫ ---
    // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ СБОРА ДАННЫХ ФОРМЫ ---
    const getFormData = () => {
        // Проверяем, что все элементы (включая возраст) успешно найдены на странице
        if (!DOM.inputName || !DOM.inputPhone || !DOM.selectWorkout || !DOM.selectAge) return null;

        return {
            name: DOM.inputName.value.trim(),
            phone: DOM.inputPhone.value.trim(),
            direction: DOM.selectWorkout.options[DOM.selectWorkout.selectedIndex].text,
            directionValue: DOM.selectWorkout.value,
            age: DOM.selectAge.options[DOM.selectAge.selectedIndex].text, // Добавлено получение текста возраста
            ageValue: DOM.selectAge.value // Добавлено получение значения возраста
        };
    };


    const toggleSubmitLoading = (isLoading) => {
        if (!DOM.submitBtn) return;

        if (isLoading) {
            DOM.submitBtn.disabled = true;
            DOM.submitBtn.textContent = 'Відправка...';
            DOM.submitBtn.style.opacity = '0.7';
        } else {
            DOM.submitBtn.disabled = false;
            DOM.submitBtn.textContent = 'Відправити заявку';
            DOM.submitBtn.style.opacity = '1';
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!TELEGRAM_CONFIG.token || !TELEGRAM_CONFIG.chatId) {
            alert('Ошибка конфигурации: Проверьте настройки Telegram чата.');
            return;
        }

        const data = getFormData();
        if (!data || !data.name || !data.phone) {
            alert('Пожалуйста, заполните все поля формы.');
            return;
        }

        toggleSubmitLoading(true);

        // Формирование строки сообщения (завершено)
        const message =
            `🔔 <b>Нова заявка с сайта NebesnaStudio!</b>\n\n` +
            `👤 <b>Ім'я:</b> ${data.name}\n` +
            `📞 <b>Телефон:</b> ${data.phone}\n` +
            `🩰 <b>Напрям:</b> ${data.direction}`;

        // ИСПРАВЛЕНО: Корректный шаблон ссылки для Telegram API
        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.token}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CONFIG.chatId,
                    parse_mode: 'HTML',
                    text: message
                })
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(result.description || 'Помилка при відправці');
            }

            alert(`Спасибо, ${data.name}!\nВашу заявку успішно надіслано адміністратору. Ми зв'яжемося з вами найближчим часом.`);

            if (DOM.bookingForm) DOM.bookingForm.reset();
            closeModal();

        } catch (error) {
            console.error('Ошибка отправки формы в Telegram:', error);
            alert('На жаль, сталася технічна помилка. Будь ласка, зв\'яжіться з нами безпосередньо у контактах.');
        } finally {
            toggleSubmitLoading(false);
        }
    };

    // --- ИНИЦИАЛИЗАЦИЯ СЛУШАТЕЛЕЙ ---
    const init = () => {
        initTheme();

        if (DOM.openModalBtns.length > 0) {
            DOM.openModalBtns.forEach(btn => btn.addEventListener('click', openModal));
        }

        DOM.closeModalBtn?.addEventListener('click', closeModal);
        DOM.modalOverlay?.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleKeyDown);
        DOM.bookingForm?.addEventListener('submit', handleFormSubmit);

        // Слушатели мобильного меню
        DOM.burgerMenuBtn?.addEventListener('click', toggleMenu);
        DOM.navLinks.forEach(link => link.addEventListener('click', closeMenu));

        // Слушатель смены темы
        DOM.themeToggleBtn?.addEventListener('click', toggleTheme);
    };
    // --- КОРРЕКТНАЯ МАСКА ДЛЯ УКРАИНСКИХ НОМЕРОВ (+380) ---
    const phoneInput = DOM.inputPhone || document.getElementById('user-phone');

    if (phoneInput) {

        // При клике (фокусе) подставляем "+380 ", если поле пустое
        phoneInput.addEventListener('focus', () => {
            if (!phoneInput.value || phoneInput.value === '+') {
                phoneInput.value = '+380 ';
            }
        });

        // Контроль ввода и форматирование
        phoneInput.addEventListener('input', (e) => {
            let input = phoneInput.value;

            // Очищаем строку, оставляя только цифры (знак плюс обработаем отдельно)
            let digits = input.replace(/\D/g, '');

            // Если пользователь удалил всё, очищаем поле полностью
            if (digits.length === 0) {
                phoneInput.value = '';
                return;
            }

            // Гарантируем, что номер всегда начинается с украинского кода 380
            // Если код затерли или ввели поверх, принудительно восстанавливаем его
            if (!digits.startsWith('380')) {
                // Если введена первая цифра номера без 380 (например, начали с девятки '9')
                if (digits.length === 1 && digits !== '3') {
                    digits = '380' + digits;
                } else if (digits.length < 3) {
                    digits = '380';
                } else {
                    digits = '380' + digits.substring(3);
                }
            }

            // Ограничиваем общую длину (380 + 9 цифр номера = 12 цифр)
            if (digits.length > 12) {
                digits = digits.substring(0, 12);
            }

            // Собираем красивую маску по кусочкам (+380 XX XXX XX XX)
            let formatted = '+380 ';

            if (digits.length > 3) {
                formatted += digits.substring(3, 5); // Код оператора (99)
            }
            if (digits.length > 5) {
                formatted += ' ' + digits.substring(5, 8); // Первая часть номера (000)
            }
            if (digits.length > 8) {
                formatted += ' ' + digits.substring(8, 10); // Вторая часть (00)
            }
            if (digits.length > 10) {
                formatted += ' ' + digits.substring(10, 12); // Третья часть (00)
            }

            phoneInput.value = formatted;
        });

        // Обработка клавиши Backspace, чтобы префикс "+380 " не залипал
        phoneInput.addEventListener('keydown', (e) => {
            const cursorPosition = phoneInput.selectionStart;

            // Если курсор находится внутри префикса "+380 ", запрещаем удаление кода страны
            if (e.key === 'Backspace' && cursorPosition <= 5) {
                // Если поле содержит только "+380 ", принудительно очищаем до конца
                if (phoneInput.value.trim() === '+380') {
                    phoneInput.value = '';
                }
                e.preventDefault();
            }
        });

        // Если пользователь ушел из поля, оставив только шаблон — стираем его
        phoneInput.addEventListener('blur', () => {
            if (phoneInput.value.trim() === '+380' || phoneInput.value === '+380 ') {
                phoneInput.value = '';
            }
        });
    }
    // --- ИНТЕРАКТИВНАЯ ГАЛЕРЕЯ (ЛАЙТБОКС) ---

    // Сюда добавьте ссылки на фотографии вашей студии, которые будут листаться
    const galleryImages = [
        'img/aerial.jpg', // Первая картинка — заставка
        'img/photo-1.jpg',
        'img/photo-2.jpg',
        'img/photo-3.jpg',
        'img/photo-4.jpg',
        'img/photo-5.jpg',
        'img/photo-6.jpg'

    ];

    let currentImgIndex = 0;

    const galleryDOM = {
        openBtn: document.querySelector('.js-open-gallery'),
        overlay: document.querySelector('.id-gallery-overlay'),
        closeBtn: document.querySelector('.id-gallery-close'),
        prevBtn: document.querySelector('.id-gallery-prev'),
        nextBtn: document.querySelector('.id-gallery-next'),
        activeImg: document.getElementById('gallery-active-img')
    };

    const updateGalleryImage = () => {
        if (galleryDOM.activeImg) {
            galleryDOM.activeImg.src = galleryImages[currentImgIndex];
        }
    };

    const openGallery = () => {
        currentImgIndex = 0; // Начинаем просмотр с первой картинки
        updateGalleryImage();
        galleryDOM.overlay?.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    };

    const closeGallery = () => {
        galleryDOM.overlay?.classList.remove('is-active');
        // Возвращаем скролл, только если обычное модальное окно тоже закрыто
        if (!DOM.modalOverlay?.classList.contains('is-active')) {
            document.body.style.overflow = '';
        }
    };

    const nextImage = () => {
        currentImgIndex = (currentImgIndex + 1) % galleryImages.length;
        updateGalleryImage();
    };

    const prevImage = () => {
        currentImgIndex = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
        updateGalleryImage();
    };

    // Привязка событий клика
    galleryDOM.openBtn?.addEventListener('click', openGallery);
    galleryDOM.closeBtn?.addEventListener('click', closeGallery);
    galleryDOM.nextBtn?.addEventListener('click', nextImage);
    galleryDOM.prevBtn?.addEventListener('click', prevImage);

    // Закрытие по клику на фон мимо картинки
    galleryDOM.overlay?.addEventListener('click', (e) => {
        if (e.target === galleryDOM.overlay) closeGallery();
    });

    // Управление галереей с клавиатуры (Стрелки и Escape)
    document.addEventListener('keydown', (e) => {
        if (!galleryDOM.overlay?.classList.contains('is-active')) return;

        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeGallery();
    });

    init();
});
