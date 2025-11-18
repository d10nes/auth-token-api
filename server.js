const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Пользователь (в реальном приложении это была бы база данных)
const user = {
  id: 1,
  username: 'nugyman',
  // Хешированный пароль для 'nugyman01'
  passwordHash: bcrypt.hashSync('nugyman01', 10),
  email: 'nugmanesenalin@gmail.com',
  firstName: 'Nugyman',
  lastName: 'Esenalin',
  gender: 'male',
  image: 'https://ui-avatars.com/api/?name=Nugyman+Esenalin&size=128'
};

// Хранилище refresh токенов (в реальном приложении - база данных)
const refreshTokens = new Set();

// Генерация токенов
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '60m' } // 60 минут
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' } // 7 дней
  );
  
  return { accessToken, refreshToken };
}

// Middleware для проверки access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Access token недействителен' });
    }
    
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Неверный тип токена' });
    }
    
    req.userId = decoded.userId;
    next();
  });
}

// ============================================
// ENDPOINTS
// ============================================

// POST /auth/login - Вход
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password, expiresInMins = 60 } = req.body;

    // Проверка креденшалов
    if (username !== user.username) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokens(user.id);
    refreshTokens.add(refreshToken);

    // Возвращаем данные пользователя + токены
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      image: user.image,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /auth/refresh - Обновление токена
app.post('/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token отсутствует' });
    }

    // Проверяем, что токен в нашем хранилище
    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({ message: 'Refresh token недействителен' });
    }

    // Верифицируем токен
    jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
      if (err) {
        refreshTokens.delete(refreshToken); // Удаляем невалидный токен
        return res.status(403).json({ message: 'Refresh token истёк' });
      }

      if (decoded.type !== 'refresh') {
        return res.status(403).json({ message: 'Неверный тип токена' });
      }

      // Удаляем старый refresh token
      refreshTokens.delete(refreshToken);

      // Генерируем новые токены
      const tokens = generateTokens(decoded.userId);
      refreshTokens.add(tokens.refreshToken);

      res.json(tokens);
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /auth/me - Получение профиля (защищённый)
app.get('/auth/me', authenticateToken, (req, res) => {
  try {
    // Возвращаем данные пользователя (без пароля)
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      image: user.image
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /profile - Альтернативный эндпойнт профиля (для совместимости)
app.get('/profile', authenticateToken, (req, res) => {
  try {
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      image: user.image
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /auth/logout - Выход (опционально)
app.post('/auth/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }
    
    res.json({ message: 'Выход выполнен успешно' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auth API is running' });
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Auth Token API',
    version: '1.0.0',
    endpoints: {
      login: 'POST /auth/login',
      refresh: 'POST /auth/refresh',
      profile: 'GET /auth/me',
      logout: 'POST /auth/logout',
      health: 'GET /health'
    },
    credentials: {
      username: 'nugyman',
      password: 'nugyman01'
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Auth API server running on port ${PORT}`);
  console.log(`📝 Test credentials: nugyman / nugyman01`);
});
