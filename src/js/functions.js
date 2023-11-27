import { today, tomorrow } from './main.js';
import { getList, deleteFromStorage, addToStorage, changeStatus, getItem, updateStorageItem } from './localStorage.js';

// Добавление записей из хранилища
export function addItems() {
    const list = getList();
    if (list) {
        const items = Object.entries(list);
        for (const [id, value] of items) {
            const { title, description, date, time, status, deadline, creation } = JSON.parse(value);
            addItem(title, description, date, time, status, id, deadline, creation);
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
        return formDateLocale(date);
    };
};

// Форматирование даты
export function formDateLocale(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

// Добавление нового элемента в список  
export function addItem(title, description, date, time, status, id, isUpdate = false) {
    date = formDate(date);
    const item = document.createElement("li");
    const dateString = `${date}${time ? `, ${time}` : ''}`;
    const info = status === 'completed' ? 'Дело выполнено' : dateString;
    item.classList.add('todo__item', 'item', status);
    item.setAttribute('id', id);
    item.innerHTML = `
        <div class="item__text">
            <h4>${title}</h4>
            ${description ? `<p>${description}</p>` : ''}
        </div>
        <div class="item__details">
            <div class="item__time">
            ${info}
        </div>        
        <div class="item__buttons">
            <button class="item__update" title="Изменить">
                <iconify-icon icon="solar:pen-2-outline" width="25" height="25"></iconify-icon>
            </button>
            <button class="item__delete" title="Удалить">
                <iconify-icon icon="material-symbols:close" width="25" height="25"></iconify-icon>
            </button>
            <button class="item__complete" title="Дело выполнено" ${status == 'completed' ? 'disabled' : ''}>
                <iconify-icon icon="material-symbols:check" width="25" height="25"></iconify-icon>
            </button>
        </div>
        </div>  
    `;
    const ul = document.querySelector(`.todo__items`);
    if (isUpdate && document.getElementById(id)) {
        ul.replaceChild(item, document.getElementById(id));
    } else {
        ul.appendChild(item);
    }
    const complete = item.querySelector('.item__complete');
    complete.addEventListener('click', (e) => { toCompleted(e, item) });
    const deleteBnt = item.querySelector('.item__delete');
    deleteBnt.addEventListener('click', () => { deleteFromList(item) });
    const updateBtn = item.querySelector('.item__update');
    updateBtn.addEventListener('click', () => { update(item) });
    togglePlaceholder();
};

function update(element) {
    const id = element.getAttribute('id');
    const item = getItem(id);
    const updateForm = document.getElementById('todo-form-update');
    document.getElementById('title-update').value = item.title;
    document.getElementById('description-update').value = item.description;
    document.getElementById('date-update').value = item.date;
    document.getElementById('time-update').value = item.time;
    updateForm.style.display = 'block';
    updateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(updateForm);
        const title = formData.get('title');
        const description = formData.get('description');
        const date = formData.get('date');
        const time = formData.get('time');
        const deadlineTime = time ? time : '23:59:59'; // Если время не указано, то дело нужно завершить до конца указанной даты
        const deadline = new Date(`${date} ${deadlineTime}`);
        const status = 'in-progress';
        const data = [title, description, date, time, status, id, deadline.getTime(), id, true];
        addItem(...data); // Обновить дело в списке на странице
        const storageData = { title, description, date, time, status, deadline: deadline.getTime(), creation: id };
        updateStorageItem(id, storageData); // Обновить дело в списке в localStorage
        updateForm.reset();
        updateForm.style.display = 'none';
    });
}

// Перемещение текущего дела в конец списка завершенных
function toCompleted(e, item) {
    e.currentTarget.setAttribute('disabled', '');
    const newStatus = 'completed';
    const id = item.getAttribute('id');
    item.classList.add(newStatus);
    item.querySelector('.item__time').textContent = 'Дело выполнено';

    // Смена статуса элемента в хранилище
    changeStatus(id, newStatus);
};

// Удалить элемент со страницы и из хранилища
function deleteFromList(item) {
    const id = item.getAttribute('id');
    const parent = item.parentElement;
    parent.removeChild(item);
    deleteFromStorage(id);
    togglePlaceholder();
};

// Добавить или убрать сообщение о том, что записей пока нет
function togglePlaceholder() {
    const inProgress = document.getElementById('in-progress');
    const isEmpty = !inProgress.querySelectorAll('.item').length;
    const placeholder = document.getElementById('placeholder');
    if (isEmpty) {
        inProgress.innerHTML = '<li id="placeholder" class="todo__placeholder">У вас пока нет дел</li>';
    } else if (placeholder) {
        placeholder.parentNode.removeChild(placeholder);
    }
};

export function sort(parameter) { // Сортировка списка дел по параметру
    const data = getList();
    if (!data) return;

    const items = document.querySelector('.todo__items');
    items.innerHTML = '';

    const sorted = Object.entries(data).map(item => [item[0], JSON.parse(item[1])]);
    sorted.sort((a, b) => a[1][parameter] - b[1][parameter]);

    for (let [id, item] of sorted) {
        const { title, description, date, time, status, deadline, creation } = item;
        const data = [title, description, date, time, status, id];
        addItem(...data); // Добавить дело в список на странице
        addToStorage(...data, deadline, creation); // Добавить дело в список в localStorage
    }
}

export function showNotification() {
    const deadlineItems = [];
    const list = getList();
    const items = Object.entries(list).map(item => [item[0], JSON.parse(item[1])]);
    for (let [id, item] of items) {
        const now = new Date().getTime();
        if (item.deadline - now < 3600000 && item.status === 'in-progress') { // Если дедлайн истекает менее, чем через час
            deadlineItems.push(item.title);
        }
    }
    if (deadlineItems.length > 0) {
        alert(`У вас есть дела, срок выполнения которых истекает через час: ${deadlineItems.join(', ')}`);
    }
}