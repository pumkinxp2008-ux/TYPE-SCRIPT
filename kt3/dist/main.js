"use strict";
// класс одной книги
class Book {
    constructor(title, author) {
        this.title = title;
        this.author = author;
        this.id = ++Book.count; // уникальный id, растёт автоматически
        this.createdAt = Date.now();
    }
    // возвращает строку для отображения
    info() {
        return `${this.title} — ${this.author}`;
    }
}
Book.count = 0; // общий счётчик всех книг
// хранилище книг
class BookStore {
    constructor() {
        this.books = [];
    }
    add(book) {
        this.books.push(book);
    }
    list() {
        return this.books;
    }
    size() {
        return this.books.length;
    }
    // проверка на дубль по названию и автору
    exists(title, author) {
        return this.books.some(b => b.title.toLowerCase() === title.toLowerCase() &&
            b.author.toLowerCase() === author.toLowerCase());
    }
}
// класс приложения — работа с dom, события, валидация
class BookApp {
    constructor(store) {
        this.store = store;
        this.titleEl = this.must("#titleInput");
        this.authorEl = this.must("#authorInput");
        this.addBtnEl = this.must("#addBtn");
        this.counterEl = this.must("#counter");
        this.cardsEl = this.must("#cards");
        this.errorEl = this.must("#error");
        this.addBtnEl.addEventListener("click", () => this.onAdd());
        // добавление по enter в поле автора
        this.authorEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter")
                this.onAdd();
        });
        this.render();
    }
    // находит элемент или бросает ошибку
    must(selector) {
        const el = document.querySelector(selector);
        if (!el)
            throw new Error(`Элемент не найден: ${selector}`);
        return el;
    }
    // убирает лишние пробелы
    normalize(s) {
        return s.trim().replace(/\s+/g, " ");
    }
    setError(msg) {
        this.errorEl.textContent = msg;
    }
    onAdd() {
        const title = this.normalize(this.titleEl.value);
        const author = this.normalize(this.authorEl.value);
        // валидация
        if (!title || !author)
            return this.setError("Название и автор не могут быть пустыми");
        if (this.store.exists(title, author))
            return this.setError("Такая книга уже есть в списке");
        this.setError("");
        this.store.add(new Book(title, author));
        this.titleEl.value = this.authorEl.value = ""; // очищаем поля
        this.titleEl.focus();
        this.render();
    }
    // перерисовывает счётчик и карточки
    render() {
        this.counterEl.textContent = String(this.store.size());
        this.cardsEl.innerHTML = "";
        for (const book of this.store.list()) {
            const card = document.createElement("div");
            const title = document.createElement("div");
            const author = document.createElement("div");
            const hint = document.createElement("div");
            card.className = "card";
            title.className = "card-title";
            hint.className = "card-hint";
            title.textContent = book.title;
            author.textContent = book.author;
            hint.textContent = `ID: ${book.id}`;
            card.append(title, author, hint);
            this.cardsEl.append(card);
        }
    }
}
new BookApp(new BookStore());
