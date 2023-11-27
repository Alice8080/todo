
export function getList() { // Получение списка дел
    return JSON.parse(localStorage.getItem('list'));
}

export function deleteFromStorage(id) { // Удаление элемента из хранилища
    const list = getList();
    delete list[id];
    localStorage.setItem('list', JSON.stringify(list));
};

// Добавление нового элемента в localStorage
export function addToStorage(title, description, date, time, status, id, deadline, creation) {
    const newItem = JSON.stringify({ title, description, date, time, status, deadline, creation });
    const oldItems = getList();
    const newItems = JSON.stringify(oldItems ? { ...oldItems, [id]: newItem } : { [id]: newItem });
    localStorage.setItem('list', newItems);
};


export function changeStatus(id, newStatus) {
    const list = getList();
    list[id] = JSON.parse(list[id]);
    list[id].status = newStatus;
    list[id] = JSON.stringify(list[id]);
    localStorage.setItem('list', JSON.stringify(list));
}

export function getItem(id) {
    const list = getList();
    const item = JSON.parse(list[id]);
    return item;
}

export function updateStorageItem(id, data) {
    const list = getList();
    list[id] = JSON.parse(list[id]);
    list[id] = JSON.stringify(data);
    localStorage.setItem('list', JSON.stringify(list));
}