# Auth Token API Server

Простой REST API для авторизации с JWT токенами.

## 👤 Пользователь

**Креденшалы:**
```
Username: nugyman
Password: nugyman01
```

**Профиль:**
- ID: 1
- Полное имя: Nugyman Esenalin
- Email: nugmanesenalin@gmail.com
- Пол: male

## 🚀 Локальный запуск

### 1. Установка зависимостей
```bash
cd server
npm install
```

### 2. Запуск сервера
```bash
npm start
```

Сервер запустится на `http://localhost:3000`

### 3. Тестирование
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nugyman","password":"nugyman01"}'
```

## 📡 API Endpoints

### POST /auth/login
Вход в систему

**Request:**
```json
{
  "username": "nugyman",
  "password": "nugyman01",
  "expiresInMins": 60
}
```

**Response:**
```json
{
  "id": 1,
  "username": "nugyman",
  "email": "nugmanesenalin@gmail.com",
  "firstName": "Nugyman",
  "lastName": "Esenalin",
  "gender": "male",
  "image": "https://ui-avatars.com/api/?name=Nugyman+Esenalin&size=128",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/refresh
Обновление токена

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me
Получение профиля (защищённый)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "nugyman",
  "email": "nugmanesenalin@gmail.com",
  "firstName": "Nugyman",
  "lastName": "Esenalin",
  "gender": "male",
  "image": "https://ui-avatars.com/api/?name=Nugyman+Esenalin&size=128"
}
```

### POST /auth/logout
Выход из системы (опционально)

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🚂 Деплой на Railway

### 1. Создайте новый проект
- Зайдите на [railway.app](https://railway.app)
- Нажмите "New Project"
- Выберите "Deploy from GitHub repo"

### 2. Подключите репозиторий
- Создайте Git репозиторий с папкой `server`
- Или загрузите файлы напрямую

### 3. Настройте переменные окружения
В Railway добавьте:
```
JWT_SECRET=your-super-secret-key-here-change-this
PORT=3000
```

### 4. Деплой
Railway автоматически:
- Обнаружит `package.json`
- Установит зависимости (`npm install`)
- Запустит сервер (`npm start`)

### 5. Получите URL
После деплоя Railway даст вам URL типа:
```
https://your-app-name.up.railway.app
```

## 🔧 Настройка Android приложения

После деплоя обновите `BASE_URL` в `NetworkModule.kt`:

```kotlin
object NetworkModule {
    private const val BASE_URL = "https://your-app-name.up.railway.app/"
    // ...
}
```

## 🔐 Безопасность

### Production настройки:

1. **Измените JWT_SECRET** в переменных окружения Railway
2. **Используйте HTTPS** (Railway предоставляет автоматически)
3. **Добавьте rate limiting** для защиты от брутфорса
4. **Используйте базу данных** вместо in-memory хранилища

### Рекомендации:
- Храните пароли в хешированном виде ✅ (уже реализовано)
- Используйте CORS ✅ (уже настроено)
- Валидируйте входные данные
- Логируйте попытки входа

## 📝 Структура проекта

```
server/
├── package.json       # Зависимости
├── server.js          # Основной сервер
└── README.md          # Эта документация
```

## 🧪 Тестирование

### Успешный вход
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nugyman","password":"nugyman01"}'
```

### Неверный пароль
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nugyman","password":"wrong"}'
```

### Получение профиля
```bash
# Сначала получите токен из login
TOKEN="your_access_token_here"

curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 Особенности

- ✅ JWT токены (access + refresh)
- ✅ Хеширование паролей (bcrypt)
- ✅ CORS настроен
- ✅ Валидация токенов
- ✅ Refresh token rotation
- ✅ Совместимость с DummyJSON API структурой
- ✅ Готов к деплою на Railway

## 📚 Технологии

- **Express.js** - веб-фреймворк
- **jsonwebtoken** - JWT токены
- **bcryptjs** - хеширование паролей
- **cors** - CORS middleware

## 🆘 Troubleshooting

### Порт уже занят
```bash
# Измените PORT в .env или используйте другой порт
PORT=3001 npm start
```

### Ошибка установки зависимостей
```bash
# Очистите кэш и переустановите
rm -rf node_modules package-lock.json
npm install
```

## 📄 Лицензия

MIT
