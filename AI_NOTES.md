# AI_NOTES.md — Лабораторная работа №5

## Что сделано

Разработан React SPA для гостевого просмотра каталога деревянных конструкций (тема ЮРДИС).
Дизайн воспроизведён точно по шаблонам и CSS исходного Go-проекта (`/WEB/templates/`, `/WEB/resources/styles/styles.css`).

**Три страницы:**
- **Главная** (`/`) — тёмный hero-экран с заголовком и кнопкой перехода к каталогу
- **Каталог конструкций** (`/constructions`) — сетка карточек 3×N, фильтры, иконка корзины
- **Детали конструкции** (`/construction/:id`) — видео в блоке `product-media-wrap` (как в шаблоне)

**Компоненты:**
- `Header` — точная копия `header-bar` из оригинала: чёрный фон, SVG-логотипы ЮРДИС, навигационные ссылки
- `BreadCrumbs` — самописная хлебная крошка (без сторонних компонентов)
- `ConstructionCard` — горизонтальный макет как в оригинале: `.card-link` (row), `.card-actions` с кнопкой «Подробнее»
- `ConstructionsList` — трёхколоночная сетка через CSS Grid (`.cards-grid`)
- Поиск по названию встроен в `Header` на странице каталога (как `search-form` в `mainpage.html`)

**Ассеты:**
- `src/assets/yurdis-logo.svg` — скопирован из `/WEB/resources/img/YURDIS_logo.svg`
- `src/assets/yurdis-logo-text.svg` — скопирован из `/WEB/resources/img/YURDIS_logo_text.svg`
- `src/assets/cart_icon.png` — иконка корзины (из WEB)
- `src/assets/constructions/default_image.jpg` — изображение по умолчанию при пустом `image_url` (`src={image_url || defaultImage}`)

**Данные:**
- Mock-массив из 8 конструкций в `src/modules/mock.ts` (без бэкенда), локальные фото/видео в `src/assets/constructions/`
- Интерфейс `Construction`: `id`, `title`, `use_life`, `description`, `image_url`, `video_url`, `is_delete`

## Почему

- Дизайн взят из шаблонов оригинального проекта, а не из примера (`test5`), как и просил пользователь
- CSS-переменные (`--accent`, `--accent-light`, `--text-grey`) идентичны оригинальному `styles.css`
- Структура карточки (`.construction-card` → `.card-link` → `.card-actions`) воспроизводит оригинальный HTML
- Фильтрация только по названию — как в оригинальном `mainpage.html` (поле `query`)
- Без Redux, без Context — данные передаются через props и `useMemo` (фильтрация в компоненте страницы)

## Риски и ограничения

- Дефолтное изображение: пустой `image_url` в mock → `default_image.jpg` через `||`
- Иконка корзины всегда неактивна (`.cart-inactive`) — счётчик 0, без функционала

## Как проверить

1. Установить зависимости (один раз):
   ```
   npm install
   ```

2. Запустить dev-сервер:
   ```
   npm run dev
   ```

3. Открыть http://localhost:3000

4. Проверить:
   - Главная: тёмный экран с SVG-логотипом ЮРДИС в хедере, золотистая кнопка «Каталог конструкций»
   - `/constructions`: чёрный хедер с логотипами, хлебные крошки, фильтры, сетка 3 карточки в ряд
   - Каждая карточка: горизонтальный макет — фото слева, название и срок справа, кнопка «Подробнее»
   - Иконка корзины фиксированная снизу справа (неактивная)
   - Клик на карточку → `/construction/:id` с детальным описанием
   - Поиск работает по названию (подстрока без учёта регистра)
   - Хлебные крошки: `Главная / Конструкции / <Название>` на детальной странице
   - Navbar: подсвечивает активный пункт золотистым цветом

## Структура проекта

```
src/
├── App.tsx                              # BrowserRouter + Routes
├── Routes.tsx                           # Константы маршрутов и меток
├── main.tsx                             # Точка входа
├── index.css                            # CSS-переменные (точно как в оригинале)
├── modules/
│   ├── constructionsApi.ts              # Интерфейс Construction
│   └── mock.ts                          # 8 mock-конструкций
├── assets/
│   ├── yurdis-logo.svg                  # Логотип (из WEB/resources/img/)
│   ├── yurdis-logo-text.svg             # Текст логотипа (из WEB/resources/img/)
│   ├── cart_icon.png
│   ├── constructions/                   # Фото, видео, default_image.jpg
│   └── ...
├── components/
│   ├── Header/                          # Чёрный header-bar с ЮРДИС-логотипами и nav
│   ├── BreadCrumbs/                     # Самописные хлебные крошки
│   ├── ConstructionCard/                # Карточка: card-link (row) + card-actions
│   ├── ConstructionsList/               # cards-grid (CSS Grid 3 columns)
│   └── HeaderApp/                       # header-bar_app на странице детали
└── pages/
    ├── HomePage/                        # Hero-экран в стиле ЮРДИС
    ├── ConstructionsPage/               # Каталог + корзина
    └── ConstructionPage/                # Детали конструкции
```
