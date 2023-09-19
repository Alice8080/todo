import { formDate, addItem, addToStorage, addItems, removeFirstOrLast, select } from './functions.js';

// Установка сегодняшней даты в качестве даты дела по умолчанию
const dateControl = document.querySelector('input[type="date"]');
const date = new Date();
export const today = date.toISOString().split('T')[0];
export const tomorrow = new Date(date.setUTCDate(date.getUTCDate() + 1)).toISOString().split('T')[0];
dateControl.value = today;

// Обработка введенных в форму данных
const form = document.getElementById('todo-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const title = formData.get('title');
    const description = formData.get('description');
    const date = formDate(formData.get('date'));
    const time = formData.get('time');
    const status = 'in-progress';
    const id = new Date().getTime();
    const data = [title, description, date, time, status, id];
    addItem(...data); // Добавить дело в список на странице
    addToStorage(...data); // Добавить дело в список в localStorage
    form.reset(); 
    dateControl.value = today;
});

// Если в хранилище есть записи, добавить их на страницу при загрузке
addItems();

// Удаление первого или последнего элемента
const removeButtons = document.querySelectorAll('.todo__remove');
removeButtons.forEach((btn) => {
    btn.addEventListener('click', removeFirstOrLast);
});

// Выделение четных и нечетных элементов
const selectButtons = document.querySelectorAll('.todo__select');
selectButtons.forEach((btn) => {
    btn.addEventListener('click', select);
});