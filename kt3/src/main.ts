// класс одной книги
class Book {
    static count = 0; // общий счётчик всех книг

    id = ++Book.count; // уникальный id, растёт автоматически
    createdAt = Date.now();

    constructor(public title: string, public author: string) {}

    // возвращает строку для отображения
    info() {
        return `${this.title} — ${this.author}`;
    }
}

// хранилище книг
class BookStore {
    private books: Book[] = [];

    add(book: Book) {
        this.books.push(book);
    }

    list() {
        return this.books;
    }

    size() {
        return this.books.length;
    }

    // проверка на дубль по названию и автору
    exists(title: string, author: string) {
        return this.books.some(
            b => b.title.toLowerCase() === title.toLowerCase() &&
                 b.author.toLowerCase() === author.toLowerCase()
        );
    }
}

// класс приложения — работа с dom, события, валидация
class BookApp {
    private titleEl  = this.must<HTMLInputElement>("#titleInput");
    private authorEl = this.must<HTMLInputElement>("#authorInput");
    private addBtnEl = this.must<HTMLButtonElement>("#addBtn");
    private counterEl = this.must<HTMLSpanElement>("#counter");
    private cardsEl  = this.must<HTMLDivElement>("#cards");
    private errorEl  = this.must<HTMLDivElement>("#error");

    constructor(private store: BookStore) {
        this.addBtnEl.addEventListener("click", () => this.onAdd());
        // добавление по enter в поле автора
        this.authorEl.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") this.onAdd();
        });
        this.render();
    }

    // находит элемент или бросает ошибку
    private must<T extends HTMLElement>(selector: string): T {
        const el = document.querySelector<T>(selector);
        if (!el) throw new Error(`Элемент не найден: ${selector}`);
        return el;
    }

    // убирает лишние пробелы
    private normalize(s: string) {
        return s.trim().replace(/\s+/g, " ");
    }

    private setError(msg: string) {
        this.errorEl.textContent = msg;
    }

    private onAdd() {
        const title  = this.normalize(this.titleEl.value);
        const author = this.normalize(this.authorEl.value);

        // валидация
        if (!title || !author) return this.setError("Название и автор не могут быть пустыми");
        if (this.store.exists(title, author)) return this.setError("Такая книга уже есть в списке");

        this.setError("");
        this.store.add(new Book(title, author));
        this.titleEl.value = this.authorEl.value = ""; // очищаем поля
        this.titleEl.focus();
        this.render();
    }

    // перерисовывает счётчик и карточки
    private render() {
        this.counterEl.textContent = String(this.store.size());
        this.cardsEl.innerHTML = "";

        for (const book of this.store.list()) {
            const card   = document.createElement("div");
            const title  = document.createElement("div");
            const author = document.createElement("div");
            const hint   = document.createElement("div");

            card.className  = "card";
            title.className = "card-title";
            hint.className  = "card-hint";

            title.textContent  = book.title;
            author.textContent = book.author;
            hint.textContent   = `ID: ${book.id}`;

            card.append(title, author, hint);
            this.cardsEl.append(card);
        }
    }
}

new BookApp(new BookStore());
