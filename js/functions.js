import { today, tomorrow } from './script.js';

// Добавление записей из хранилища
export function addItems() {
    const list = localStorage.getItem('list');
    if (list) {
        const items = Object.entries(JSON.parse(list));
        for (const [id, value] of items) {
            const { title, description, date, time, status } = JSON.parse(value);
            addItem(title, description, date, time, status, id);
        }
    }
    // Если дел еще нет, добавить сообщение об этом
    togglePlaceholder();
};

// Форматирование даты
export function formDate(date) {
    if (date === today) {
        return 'Сегодня';
    } else if (date === tomorrow) {
        return 'Завтра';
    } else {
        return new Date(date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };
};

// Добавление нового элемента в localStorage
export function addToStorage(title, description, date, time, status, id) {
    const newItem = JSON.stringify({ title, description, date, time, status });
    const oldItems = localStorage.getItem('list');
    const newItems = JSON.stringify(oldItems ? { ...JSON.parse(oldItems), [id]: newItem } : { [id]: newItem });
    localStorage.setItem('list', newItems);
};

// Добавление нового элемента в список  
export function addItem(title, description, date, time, status, id) {
    const item = document.createElement("li");
    item.classList.add('todo__item', 'item');
    item.setAttribute('id', id);
    item.innerHTML = `
        <div class="item__text">
            <h4>${title}</h4>
            <p>${description}</p>
        </div>
        <div class="item__time">
            ${date} ${time ? `, ${time}` : ''}
        </div>
        <div class="item__buttons">
            <button class="item__delete" title="Удалить">
                <iconify-icon icon="material-symbols:close" width="25" height="25"></iconify-icon>
            </button>
            <button class="item__complete" title="Дело выполнено" ${status == 'completed' ? 'disabled' : ''}>
                <iconify-icon icon="material-symbols:check" width="25" height="25"></iconify-icon>
            </button>
        </div>
    `;
    const ul = document.querySelector(`.todo__items_status_${status}`);
    ul.appendChild(item);
    const complete = item.querySelector('.item__complete');
    complete.addEventListener('click', toCompleted);
    const deleteBnt = item.querySelector('.item__delete');
    deleteBnt.addEventListener('click', deleteFromList);
    selectUpdate();
    togglePlaceholder();
};

// Перемещение текущего дела в конец списка завершенных
function toCompleted(e) {
    if (e.currentTarget.disabled) return;
    const item = e.currentTarget.parentElement.parentElement;
    const newStatus = 'completed';
    const id = item.getAttribute('id');
    const newUl = document.getElementById(newStatus);
    newUl.appendChild(item);
    selectUpdate();
    togglePlaceholder();

    // Смена статуса элемента в хранилище
    const list = JSON.parse(localStorage.getItem('list'));
    list[id] = JSON.parse(list[id]);
    list[id].status = newStatus;
    list[id] = JSON.stringify(list[id]);
    localStorage.setItem('list', JSON.stringify(list));
};

// Удалить элемент со страницы и из хранилища
function deleteFromList(e) {
    if (e.currentTarget.disabled) return;
    const item = e.currentTarget.parentElement.parentElement;
    const id = item.getAttribute('id');
    const parent = item.parentElement;
    parent.removeChild(item);
    selectUpdate();
    deleteFromStorage(id);
    togglePlaceholder();
};

// Удаление элемента из хранилища
function deleteFromStorage(id) {
    const list = JSON.parse(localStorage.getItem('list'));
    delete list[id];
    localStorage.setItem('list', JSON.stringify(list));
};

// Выделение четных и нечетных элементов
const selectState = { even: false, odd: false };
export function select(e) {
    const parameter = e.target.getAttribute('id');
    const items = document.querySelectorAll('.item');
    for (let i = 0; i < items.length; i++) {
        const even = parameter == 'even' && (i + 1) % 2 == 0;
        const odd = parameter == 'odd' && (i + 1) % 2 != 0;
        if (even || odd) {
            if (items[i].classList.contains(parameter)) {
                items[i].classList.remove(parameter);
                selectState[parameter] = false;
            } else {
                items[i].classList.add(parameter);
                selectState[parameter] = true;
            }
        }
    }
};

// Сохранение четного и нечетного выделения при изменении списка
function selectUpdate() {
    const items = document.querySelectorAll('.item');
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('even');
        items[i].classList.remove('odd');
        if (selectState.even && (i + 1) % 2 == 0) {
            items[i].classList.add('even');
        }
        if (selectState.odd && (i + 1) % 2 != 0) {
            items[i].classList.add('odd');
        }
    }
};

// Удаление первого или последнего элемента, если списки не пустые
export function removeFirstOrLast(e) {
    const ul = document.querySelectorAll('.item');
    const ids = Object.keys(JSON.parse(localStorage.getItem('list')));
    const parameter = e.target.getAttribute('id');
    let id;
    if (parameter == 'first') {
        const first = ul[0];
        if (first) {
            first.parentElement.removeChild(first);
            id = ids[0];    
        }
    } else if (parameter == 'last') {
        const last = ul[ul.length - 1];
        if (last) {
            last.parentElement.removeChild(last);
            id = ids[ids.length - 1];    
        }
    }
    deleteFromStorage(id);
    togglePlaceholder();
};

// Добавить или убрать сообщение о том, что записей пока нет
function togglePlaceholder() {
    const inProgress = document.getElementById('in-progress');
    const isEmpty = !inProgress.querySelectorAll('.item').length;
    const completed = document.getElementById('completed');
    const isEmptyCompleted = !completed.querySelectorAll('.item').length;
    const placeholder = document.getElementById('placeholder');
    const placeholderCompleted = document.getElementById('placeholderCompleted');
    if (isEmpty) {
        inProgress.innerHTML = '<li id="placeholder" class="todo__placeholder">У вас пока нет дел</li>';
    } else if (placeholder) {
        placeholder.parentNode.removeChild(placeholder);
    }
    if (isEmptyCompleted) {
        completed.innerHTML = '<li id="placeholderCompleted" class="todo__placeholder">У вас пока нет выполненных дел</li>';
    } else if (placeholderCompleted) {
        placeholderCompleted.parentNode.removeChild(placeholderCompleted);
    }
};