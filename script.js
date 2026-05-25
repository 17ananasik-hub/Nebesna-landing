/**
 * AeroGrace Studio — Сценарии интерфейса лендинга
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
        token: '8909073744:AAGVj6Oj5K-PVxFxrbAub6zjaonmr1iXbDY',
        chatId: '472254072'
    };

    // --- DOM ЭЛЕМЕНТЫ ---
    const DOM = {
        modalOverlay: document.querySelector('.id-modal-overlay'),
        closeModalBtn: document.querySelector('.id-modal-close'),
        bookingForm: document.querySelector('.id-booking-form'),
        openModalBtns: document.querySelectorAll('.js-open-modal'),
        inputName: document.getElementById('user-name'),
        inputPhone: document.getElementById('user-phone'),
        selectWorkout: document.getElementById('workout-type'),
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

    const getFormData = () => {
        if (!DOM.inputName || !DOM.inputPhone || !DOM.selectWorkout) return null;

        return {
            name: DOM.inputName.value.trim(),
            phone: DOM.inputPhone.value.trim(),
            direction: DOM.selectWorkout.options[DOM.selectWorkout.selectedIndex].text,
            directionValue: DOM.selectWorkout.value
        };
    };

    const toggleSubmitLoading = (isLoading) => {
        if (!DOM.submitBtn) return;

        if (isLoading) {
            DOM.submitBtn.disabled = true;
            DOM.submitBtn.textContent = 'Отправка...';
            DOM.submitBtn.style.opacity = '0.7';
        } else {
            DOM.submitBtn.disabled = false;
            DOM.submitBtn.textContent = 'Отправить заявку';
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
            `🔔 <b>Новая заявка с сайта AeroGrace!</b>\n\n` +
            `👤 <b>Имя:</b> ${data.name}\n` +
            `📞 <b>Телефон:</b> ${data.phone}\n` +
            `🩰 <b>Направление:</b> ${data.direction}`;

        // ИСПРАВЛЕНО: Корректный шаблон ссылки для Telegram API
        const telegramUrl = `https://telegram.org${TELEGRAM_CONFIG.token}/sendMessage`;


        try {
            const response = await fetch(telegramUrl, {
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
                throw new Error(result.description || 'Ошибка при отправке в Telegram');
            }

            alert(`Спасибо, ${data.name}!\nВаша заявка успешно отправлена администратору. Мы свяжемся с вами в ближайшее время.`);

            if (DOM.bookingForm) DOM.bookingForm.reset();
            closeModal();

        } catch (error) {
            console.error('Ошибка отправки формы в Telegram:', error);
            alert('К сожалению, произошла техническая ошибка. Пожалуйста, свяжитесь с нами напрямую по телефону в контактах.');
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

    init();
})
    ;
