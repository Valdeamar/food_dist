window.addEventListener('DOMContentLoaded', () => {
    // Tabs
    const tabs = document.querySelectorAll('.tabheader__item'),
          tabsContent = document.querySelectorAll('.tabcontent'),
          tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
        tabs.forEach((item, i) => {
            if (target == item) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    // Timer
    
    const deadline = '2024-06-11';

    function getTimeRemaining(endtime) {
        let days, hours, minutes, seconds;
        const t = Date.parse(endtime) - Date.parse(new Date());

        if (t <= 0) {
            days = 0,
            hours = 0,
            minutes = 0,
            seconds = 0
        } else {
            days = Math.floor( (t/(1000*60*60*24)) ),
            seconds = Math.floor( (t/1000) % 60 ),
            minutes = Math.floor( (t/1000/60) % 60 ),
            hours = Math.floor( (t/(1000*60*60) % 24) );
        }

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getZero(num){
        if (num >= 0 && num < 10) { 
            return '0' + num;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {

        const timer = document.querySelector(selector),
            days = timer.querySelector("#days"),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    setClock('.timer', deadline);


    // Modal

    const modalTrigger = document.querySelectorAll('[data-modal]'),
          modal = document.querySelector('.modal'),
          modalCloseBtn = document.querySelector('[data-close]');
    const modalTimerId = setTimeout(openModal, 5000);

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden'; // чтобы нельзя было прокручивать страницу
        clearInterval(modalTimerId); // если пользователь сам открыл модальное окно, то интервал очиститься
    }

    modalTrigger.forEach(btn => { // перебераем, так как я использую querySelectorAll, и мы не можем на псевдомасив навесить обработчик событий
        btn.addEventListener('click', openModal());
            /* modal.classList.toggle('show'); */ // второй вариант
    });

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    modalCloseBtn.addEventListener('click', closeModal);
        /* modal.classList.toggle('show'); */ // второй вариант


    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // если куда кликнул пользователь = modal(область вне модальногоокна, тоесть пустая область)
            closeModal();
        } 
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === "Escape" && modal.classList.contains('show')) { // если нажать на esc
            closeModal();
        }
    });

    function showModalByScroll() {
        if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight -1) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll); // теперь модальное окно при прокрутки вниз появляеться только один раз
        } // document.documentElement.clientHeight - то что мы видим сейчас без прокрутки
    }

    window.addEventListener('scroll', showModalByScroll);

    // Использовать классы для карточек

    class MenuCard {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 27;
            this.changeToUAH();
        }

        changeToUAH() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');
            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add('menu_item');
            } else {
                this.classes.forEach(classesName => element.classList.add(classesName));
            }
            
            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `;
            this.parent.append(element);
        }
    }

    const getResource = async (url) => {   // для понимания этого кода очень важно посмотреть c 15 минуты урока 90
        const res = await fetch(url);

        if (!res.ok) {   // если рез (результат) не(!) окей, то
            throw new Error(`Could not fatch ${url}, status: ${res.status}`);  // выкидываем (throw) ошибку
        }

        return await res.json();  // await - дожидаеться окончания работы метода/промиса, и только в таком случии он его return
    };

    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({img, altimg, title, descr, price}) => { // перебераем елементы в db.json
                                            // и вызываем конструктор new MenuCard(), тоесть он будет создаваться
                                            // столько раз, сколько будет обьектов в нутри масива (db.js)
                new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
            });
    });

                // Второй вариант (если необходимо один раз что-то построить)
    /* getResource('http://localhost:3000/menu')
        .then(data => createCard(data));

        function createCard(data) {
            data.forEach(({img, altimg, title, descr, price}) => {
                const element = document.createElement('div');
                
                element.classList.add('menu_item');

                element.innerHTML = `
                    <img src=${img} alt=${altimg}>
                    <h3 class="menu__item-subtitle">${title}</h3>
                    <div class="menu__item-descr">${descr}</div>
                    <div class="menu__item-divider"></div>
                    <div class="menu__item-price">
                        <div class="menu__item-cost">Цена:</div>
                        <div class="menu__item-total"><span>${price}</span> грн/день</div>
                    </div>
                `;
                document.querySelector('.menu .container').append(element);
            });
        }; */

    // Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...'
    };

    forms.forEach(item => {
        bindPostData(item);
    });

    const postData = async (url, data) => {   // для понимания этого кода очень важно посмотреть первые 15 минут урока 90
        const res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });

        return await res.json();  // await - дожидаеться окончания работы метода/промиса, и только в таком случии он его return
    };

    function bindPostData(form) { // bindPostData - привязать какойто постинг данных
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // отменяет стандартное поведение браузера (перезагрузку страницы)

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage);

            const formData = new FormData(form);

            // способ преврощения FormData в JSON
            const json = JSON.stringify(Object.fromEntries(formData.entries())); //// сначала берем формдатейту,
            // которая брала все данные с формы. Ее сначала превращяем в масив в масивов (formData.entries()),
            // для того чтобы мы могли нормально работать с ней. После этого мы превращаем ее в класический обьект (Object.fromEntries),
            // а после этого этот класический обьект превращаем в JSON (JSON.stringify), и теперь мы берем и превращаем этот JSON на сервер =>
            // => postData('http://localhost:3000/requests', json) (строка 281)

            //пример свойства entries
            const obj ={a: 23, b: 50};
            console.log(Object.entries(obj));

            postData('http://localhost:3000/requests', json)
            /* .then(data => data.text()) */ // преврощаем ответ в текст
            .then(data => { // data - данные которые возвращаються из промиса
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove();
            }).catch(() => { // если возникнет ошибка
                showThanksModal(message.failure);
            }).finally(() => {
                form.reset();
            })

            /* request.addEventListener('load', () => {
                if (request.status === 200) {
                    console.log(request.response);
                    showThanksModal(message.success);
                    form.reset();
                    statusMessage.remove();
                } else {
                    showThanksModal(message.failure);
                }
            }); */
        });
    }

    // Красивое оповещение пользователя
    
    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide'); // скрываем конкретный контент
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
        <div class="modal__content">
            <div class="modal__close" data-close>×</div>
            <div class="modal__title">${message}</div>
        </div>
        `;

        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    /* fetch('https://jsonplaceholder.typicode.com/posts', {
        method: "POST",
        body: JSON.stringify({name: 'Alex'}),
        headers: {
            'Content-type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(json => console.log(json)); */

    fetch('http://localhost:3000/menu')
        .then(data => data.json())
        .then(res => console.log(res)); // res = result
});