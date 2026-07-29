/**
 * 얌얌 & 퐁당 (Health Log) - Node.js Backend Server & REST API
 * Port: 3000
 * Storage File: ./data/health_logs.json
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'health_logs.json');

// Ensure data directory & JSON storage file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    '2026-07-28': {
      water: 8,
      celebrated: true,
      foods: [
        { id: 'food_init_1', mealType: '아침', cuisineType: '한식', name: '닭가슴살 샐러드', calories: 250, createdAt: new Date().toISOString() },
        { id: 'food_init_2', mealType: '점심', cuisineType: '양식', name: '봉골레 파스타', calories: 450, createdAt: new Date().toISOString() }
      ],
      exercises: [
        { id: 'ex_init_1', timeOfDay: '아침', category: '근력', weight: '1kg', name: '아령 1kg 15분', duration: 15, calories: 50, createdAt: new Date().toISOString() },
        { id: 'ex_init_2', timeOfDay: '저녁', category: '유산소', weight: '없음', name: '걷기 30분', duration: 30, calories: 100, createdAt: new Date().toISOString() }
      ]
    },
    '2026-07-27': {
      water: 8,
      celebrated: true,
      foods: [
        { id: 'food_init_3', mealType: '아침', cuisineType: '한식', name: '된장찌개와 현미밥', calories: 400, createdAt: new Date().toISOString() },
        { id: 'food_init_4', mealType: '점심', cuisineType: '일식', name: '초밥 세트', calories: 550, createdAt: new Date().toISOString() },
        { id: 'food_init_5', mealType: '저녁', cuisineType: '한식', name: '불고기 덮밥', calories: 600, createdAt: new Date().toISOString() }
      ],
      exercises: [
        { id: 'ex_init_3', timeOfDay: '점심', category: '근력', weight: '3kg', name: '아령 3kg 15분', duration: 15, calories: 80, createdAt: new Date().toISOString() }
      ]
    },
    '2026-07-26': {
      water: 7,
      celebrated: false,
      foods: [
        { id: 'food_init_6', mealType: '점심', cuisineType: '중식', name: '짜장면', calories: 700, createdAt: new Date().toISOString() },
        { id: 'food_init_7', mealType: '간식', cuisineType: '분식/디저트', name: '아메리카노 & 샌드위치', calories: 360, createdAt: new Date().toISOString() }
      ],
      exercises: []
    }
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

// Read database file helper
function readDB() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading JSON DB file:', e);
    return {};
  }
}

// Write database file helper
function writeDB(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing JSON DB file:', e);
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// Calculate Aggregated Statistics Helper
function calculateStats(db) {
  const dates = Object.keys(db).sort();
  const totalDays = dates.length;

  if (totalDays === 0) {
    return {
      totalDays: 0,
      avgWater: 0,
      avgCalories: 0,
      avgBurnCalories: 0,
      totalWaterGlasses: 0,
      totalCalories: 0,
      totalBurnCalories: 0,
      topFoods: [],
      topExercises: [],
      recent7Days: []
    };
  }

  let totalWaterGlasses = 0;
  let totalCalories = 0;
  let totalBurnCalories = 0;

  const foodCountMap = {};
  const exerciseCountMap = {};

  dates.forEach(dateStr => {
    const day = db[dateStr];
    totalWaterGlasses += (day.water || 0);

    const foods = day.foods || [];
    foods.forEach(item => {
      totalCalories += (parseInt(item.calories) || 0);
      const name = (item.name || '').trim();
      if (name) foodCountMap[name] = (foodCountMap[name] || 0) + 1;
    });

    const exercises = day.exercises || [];
    exercises.forEach(ex => {
      totalBurnCalories += (parseInt(ex.calories) || 0);
      const name = (ex.name || ex.category || '').trim();
      if (name) exerciseCountMap[name] = (exerciseCountMap[name] || 0) + 1;
    });
  });

  const topFoods = Object.entries(foodCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topExercises = Object.entries(exerciseCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const today = new Date();
  const recent7Days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayData = db[dateStr] || { water: 0, foods: [], exercises: [] };
    const water = dayData.water || 0;
    const calories = (dayData.foods || []).reduce((sum, f) => sum + (parseInt(f.calories) || 0), 0);
    const burnCalories = (dayData.exercises || []).reduce((sum, e) => sum + (parseInt(e.calories) || 0), 0);
    
    // Check triple goal
    const isTripleGoal = (water >= 8) && ((dayData.foods || []).length > 0) && ((dayData.exercises || []).length > 0);

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const label = `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;

    recent7Days.push({
      dateStr,
      label,
      water,
      calories,
      burnCalories,
      isTripleGoal
    });
  }

  return {
    totalDays,
    avgWater: (totalWaterGlasses / totalDays).toFixed(1),
    avgCalories: Math.round(totalCalories / totalDays),
    avgBurnCalories: Math.round(totalBurnCalories / totalDays),
    totalWaterGlasses,
    totalCalories,
    totalBurnCalories,
    topFoods,
    topExercises,
    recent7Days
  };
}

// HTTP Request Handler
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // GET /api/logs
  if (method === 'GET' && pathname === '/api/logs') {
    const db = readDB();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true, data: db }));
  }

  // GET /api/stats
  if (method === 'GET' && pathname === '/api/stats') {
    const db = readDB();
    const stats = calculateStats(db);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true, data: stats }));
  }

  // GET /api/logs/:date
  if (method === 'GET' && pathname.startsWith('/api/logs/')) {
    const dateStr = pathname.replace('/api/logs/', '');
    const db = readDB();
    const dayData = db[dateStr] || { water: 0, celebrated: false, foods: [], exercises: [] };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true, date: dateStr, data: dayData }));
  }

  // POST /api/reset - Clear all backend DB logs
  if (method === 'POST' && pathname === '/api/reset') {
    writeDB({});
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true, message: 'All data reset successfully' }));
  }

  // POST /api/logs/:date
  if (method === 'POST' && pathname.startsWith('/api/logs/')) {
    const dateStr = pathname.replace('/api/logs/', '');
    let body = '';

    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const db = readDB();
        
        db[dateStr] = {
          water: payload.water !== undefined ? payload.water : (db[dateStr]?.water || 0),
          celebrated: payload.celebrated !== undefined ? payload.celebrated : (db[dateStr]?.celebrated || false),
          foods: Array.isArray(payload.foods) ? payload.foods : (db[dateStr]?.foods || []),
          exercises: Array.isArray(payload.exercises) ? payload.exercises : (db[dateStr]?.exercises || [])
        };

        writeDB(db);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, date: dateStr, data: db[dateStr] }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // Static File Server
  let reqFilePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  if (!reqFilePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(reqFilePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(reqFilePath);
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 얌얌 & 퐁당 & 오운완 REST API Server running at http://localhost:${PORT}`);
  });
}

module.exports = server;
