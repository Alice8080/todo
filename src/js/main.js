import { addItem, addItems, sort, showNotification } from './functions.js';
import { addToStorage } from './localStorage.js';

// Установка сегодняшней даты в качестве даты дела по умолчанию
const dateControl = document.querySelector('input[type="date"]');
const date = new Date();
export const today = date.toISOString().split('T')[0];
export const tomorrow = new Date(date.setUTCDate(date.getUTCDate() + 1)).toISOString().split('T')[0];
dateControl.value = today;
dateControl.min = today;

// Обработка введенных в форму данных
const form = document.getElementById('todo-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const title = formData.get('title');
    const description = formData.get('description');
    const date = formData.get('date');
    const time = formData.get('time');
    const deadlineTime = time ? time : '23:59:59'; // Если время не указано, то дело нужно завершить до конца указанной даты
    const deadline = new Date(`${date} ${deadlineTime}`);
    const status = 'in-progress';
    const id = new Date().getTime();
    const data = [title, description, date, time, status, id, deadline.getTime(), id];
    addItem(...data); // Добавить дело в список на странице
    addToStorage(...data); // Добавить дело в список в localStorage
    form.reset();
    dateControl.value = today;
});

// Сортировка по времени создания и дате выполнения
const sortTimeBtn = document.getElementById('sort-time');
const sortDeadlineBtn = document.getElementById('sort-deadline');
sortTimeBtn.addEventListener('click', () => {
    sort('time');
});
sortDeadlineBtn.addEventListener('click', () => {
    sort('deadline');
});

addItems(); // Если в хранилище есть записи, добавить их на страницу при загрузке
showNotification(); // Показать уведомление о делах, чей срок выполнения уже близко