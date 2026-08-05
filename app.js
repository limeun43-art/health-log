/**
 * 얌얌 & 퐁당 & 오운완 (Health Log) - Core JavaScript Application
 * Features:
 * 1. Water Tracker (8 glasses)
 * 2. Food Tracker (4 Meal Cards: 아침/점심/저녁/간식 & Presets)
 * 3. Exercise Tracker (4 Timelines: 아침/점심/저녁/야간 & Dumbbell 0.5/1/3kg presets)
 * 4. Segmented View Tabs [일간 | 주간 | 월간 달력] & Monthly Calendar
 * 5. Triple Goal (Water + Food + Exercise) '참 잘했어요 💮' Stamp & Celebration
 * 6. Node.js REST API Backend Sync & Hybrid Caching
 */

document.addEventListener('DOMContentLoaded', () => {
  // === CONSTANTS & STATE ===
  const STORAGE_KEY = 'health_log_v1';
  const TARGET_WATER_GLASSES = 8; // Target goal: 8 glasses (2.0 Liters)
  const GLASS_VOLUME_LITERS = 0.25; // 1 glass = 250ml
  let targetCalories = loadTargetCalories();

  function loadTargetCalories() {
    try {
      const saved = localStorage.getItem('target_calories_v1');
      return saved ? parseInt(saved) : 2000;
    } catch (e) {
      return 2000;
    }
  }

  function saveTargetCalories(kcal) {
    try {
      targetCalories = kcal;
      localStorage.setItem('target_calories_v1', kcal);
      renderUI();
    } catch (e) {
      console.error(e);
    }
  }

  // REST API Base URL
  const API_BASE = window.location.origin.includes('8080')
    ? 'http://localhost:3000/api'
    : '/api';

  // Representative Menu Preset Dictionary
  const CUISINE_PRESETS = {
    '한식': [
      { name: '김치찌개', cal: 250, icon: '🍲' },
      { name: '비빔밥', cal: 550, icon: '🥢' },
      { name: '불고기', cal: 400, icon: '🥩' },
      { name: '된장찌개', cal: 200, icon: '🥘' },
      { name: '삼겹살', cal: 600, icon: '🥓' },
      { name: '떡볶이', cal: 350, icon: '🍡' }
    ],
    '양식': [
      { name: '봉골레 파스타', cal: 450, icon: '🍝' },
      { name: '피자', cal: 500, icon: '🍕' },
      { name: '돈가스', cal: 600, icon: '🥩' },
      { name: '햄버거', cal: 520, icon: '🍔' },
      { name: '스테이크', cal: 650, icon: '🥩' },
      { name: '시저 샐러드', cal: 200, icon: '🥗' }
    ],
    '중식': [
      { name: '짜장면', cal: 700, icon: '🍜' },
      { name: '짬뽕', cal: 650, icon: '🌶️' },
      { name: '탕수육', cal: 750, icon: '🍖' },
      { name: '마라탕', cal: 600, icon: '🥘' },
      { name: '볶음밥', cal: 650, icon: '🍚' },
      { name: '딤섬', cal: 350, icon: '🥟' }
    ],
    '일식': [
      { name: '초밥', cal: 400, icon: '🍣' },
      { name: '라멘', cal: 550, icon: '🍜' },
      { name: '돈카츠', cal: 700, icon: '🥩' },
      { name: '우동', cal: 420, icon: '🍤' },
      { name: '타코야끼', cal: 320, icon: '🐙' },
      { name: '오니기리', cal: 180, icon: '🍙' }
    ],
    '분식/디저트': [
      { name: '사과', cal: 95, icon: '🍎' },
      { name: '아메리카노', cal: 10, icon: '☕' },
      { name: '샌드위치', cal: 350, icon: '🥪' },
      { name: '조각케이크', cal: 320, icon: '🍰' },
      { name: '우유', cal: 130, icon: '🥛' },
      { name: '와플', cal: 300, icon: '🧇' }
    ]
  };

  const FOOD_SEARCH_DATABASE = [
    { name: '김', cal: 15, display: '김 (15kcal / 1봉)' },
    { name: '조미김', cal: 15, display: '조미김 (15kcal / 1봉)' },
    { name: '과자', cal: 200, display: '과자 (200kcal / 1봉)' },
    { name: '볶음밥', cal: 450, display: '볶음밥 (450kcal / 1공기)' },
    { name: '삶은 계란', cal: 80, display: '삶은 계란 (80kcal / 1개)' },
    { name: '골드키위', cal: 55, display: '골드키위 (55kcal / 1개)' },
    { name: '바나나', cal: 90, display: '바나나 (90kcal / 1개)' },
    { name: '복숭아', cal: 50, display: '복숭아 (50kcal / 1개)' },
    { name: '오이', cal: 15, display: '오이 (15kcal / 1개)' },
    { name: '햇반', cal: 310, display: '햇반 (310kcal / 1개)' },
    { name: '식빵', cal: 120, display: '식빵 (120kcal / 1장)' },
    { name: '사과', cal: 95, display: '사과 (95kcal / 1개)' },
    { name: '고구마', cal: 130, display: '고구마 (130kcal / 1개)' },
    { name: '우유', cal: 130, display: '우유 (130kcal / 1잔)' },
    { name: '닭가슴살', cal: 120, display: '닭가슴살 (120kcal / 100g)' },
    { name: '닭가슴살 샐러드', cal: 250, display: '닭가슴살 샐러드 (250kcal)' },
    { name: '달걀프라이', cal: 120, display: '달걀프라이 (120kcal / 1개)' },
    { name: '방울토마토', cal: 16, display: '방울토마토 (16kcal / 100g)' },
    { name: '흰쌀밥', cal: 300, display: '흰쌀밥 (300kcal / 1공기)' },
    { name: '잡곡밥', cal: 280, display: '잡곡밥 (280kcal / 1공기)' },
    { name: '삼각김밥', cal: 200, display: '삼각김밥 (200kcal / 1개)' },
    { name: '신라면', cal: 500, display: '신라면 (500kcal / 1봉지)' },
    { name: '아메리카노', cal: 10, display: '아메리카노 (10kcal / 1잔)' },
    { name: '카페라떼', cal: 150, display: '카페라떼 (150kcal / 1잔)' },
    { name: '그릭요거트', cal: 90, display: '그릭요거트 (90kcal / 100g)' },
    { name: '아몬드', cal: 60, display: '아몬드 (60kcal / 10알)' },
    { name: '두부', cal: 80, display: '두부 (80kcal / 100g)' },
    { name: '단호박', cal: 70, display: '단호박 (70kcal / 100g)' },
    { name: '소고기 등심', cal: 240, display: '소고기 등심 (240kcal / 100g)' },
    { name: '돼지고기 삼겹살', cal: 330, display: '돼지고기 삼겹살 (330kcal / 100g)' },
    { name: '연어 구이', cal: 170, display: '연어 구이 (170kcal / 100g)' },
    { name: '참치캔', cal: 120, display: '참치캔 (120kcal / 1캔)' },
    { name: '배추김치', cal: 15, display: '배추김치 (15kcal / 100g)' },
    { name: '미역국', cal: 80, display: '미역국 (80kcal / 1대접)' },
    { name: '된장찌개', cal: 120, display: '된장찌개 (120kcal / 1대접)' },
    { name: '김치찌개', cal: 150, display: '김치찌개 (150kcal / 1대접)' },
    { name: '제육볶음', cal: 300, display: '제육볶음 (300kcal / 100g)' },
    { name: '피자', cal: 250, display: '피자 (250kcal / 1조각)' },
    { name: '치킨', cal: 290, display: '치킨 (290kcal / 1조각)' },
    { name: '떡볶이', cal: 350, display: '떡볶이 (350kcal / 1인분)' },
    { name: '짜장면', cal: 700, display: '짜장면 (700kcal / 1그릇)' },
    { name: '짬뽕', cal: 520, display: '짬뽕 (520kcal / 1그릇)' },
    { name: '돈카츠', cal: 600, display: '돈카츠 (600kcal / 1인분)' },
    { name: '우동', cal: 350, display: '우동 (350kcal / 1그릇)' },
    { name: '라멘', cal: 500, display: '라멘 (500kcal / 1그릇)' }
  ];

  const EXERCISE_SEARCH_DATABASE = [
    { name: '런닝', rate: 8.0, cat: '유산소', display: '🏃 런닝 (분당 8.0kcal)' },
    { name: '필라테스', rate: 4.5, cat: '스트레칭', display: '🧘 필라테스 (분당 4.5kcal)' },
    { name: '요가', rate: 3.0, cat: '스트레칭', display: '🧘 요가 (분당 3.0kcal)' },
    { name: '자전거', rate: 6.0, cat: '유산소', display: '🚴 자전거 (분당 6.0kcal)' },
    { name: '수영', rate: 8.0, cat: '유산소', display: '🏊 수영 (분당 8.0kcal)' },
    { name: '웨이트 트레이닝', rate: 5.0, cat: '근력', display: '🏋️‍♂️ 웨이트 트레이닝 (분당 5.0kcal)' },
    { name: '걷기', rate: 3.5, cat: '유산소', display: '🚶 걷기 (분당 3.5kcal)' },
    { name: '스쿼트', rate: 6.0, cat: '근력', display: '🦵 스쿼트 (분당 6.0kcal)' },
    { name: '계단 오르기', rate: 7.0, cat: '유산소', display: '🪜 계단 오르기 (분당 7.0kcal)' },
    { name: '줄넘기', rate: 10.0, cat: '유산소', display: '🪢 줄넘기 (분당 10.0kcal)' },
    { name: '플랭크', rate: 4.0, cat: '근력', display: '🧘 플랭크 (분당 4.0kcal)' },
    { name: '스트레칭', rate: 2.5, cat: '스트레칭', display: '🧘 스트레칭 (분당 2.5kcal)' },
    { name: '조깅', rate: 7.0, cat: '유산소', display: '🏃 조깅 (분당 7.0kcal)' },
    { name: '배드민턴', rate: 5.0, cat: '유산소', display: '🏸 배드민턴 (분당 5.0kcal)' },
    { name: '등산', rate: 7.5, cat: '유산소', display: '⛰️ 등산 (분당 7.5kcal)' },
    { name: '댄스', rate: 5.5, cat: '유산소', display: '💃 댄스 (분당 5.5kcal)' },
    { name: '줌바', rate: 8.0, cat: '유산소', display: '🕺 줌바 (분당 8.0kcal)' },
    { name: '사이클링', rate: 6.5, cat: '유산소', display: '🚴 사이클링 (분당 6.5kcal)' },
    { name: '턱걸이', rate: 7.5, cat: '근력', display: '💪 턱걸이 (분당 7.5kcal)' },
    { name: '푸쉬업', rate: 5.5, cat: '근력', display: '💪 푸쉬업 (분당 5.5kcal)' }
  ];

  let currentDate = getTodayDateString();
  let searchQuery = '';
  let activeCuisineCategory = '한식';
  let activeTargetMeal = '아침';
  let activeTargetExTime = '아침';
  let activeViewMode = 'daily';
  let appData = loadDataFromStorage();

  // === DOM ELEMENTS ===
  // Date Nav Elements
  const datePicker = document.getElementById('date-picker');
  const dateText = document.getElementById('date-text');
  const prevDateBtn = document.getElementById('prev-date-btn');
  const nextDateBtn = document.getElementById('next-date-btn');
  const todayBtn = document.getElementById('today-btn');

  // Water Tracker Elements
  const waterCurrentCountEl = document.getElementById('water-current-count');
  const waterTargetCountEl = document.getElementById('water-target-count');
  const waterPlusBtn = document.getElementById('water-plus-btn');
  const waterMinusBtn = document.getElementById('water-minus-btn');
  const waterPercentageEl = document.getElementById('water-percentage');
  const waterLitersEl = document.getElementById('water-liters');
  const waterProgressFill = document.getElementById('water-progress-fill');
  const waterGlassesGrid = document.getElementById('water-glasses-grid');
  const waterGoalBanner = document.getElementById('water-goal-banner');
  const waterBottleIcon = document.getElementById('water-bottle-icon');

  // Easy Menu Selector Elements
  const catBigBtns = document.querySelectorAll('.cuisine-btn');
  const currentCatLabel = document.getElementById('preset-cat-title');
  const menuCardsGrid = document.getElementById('preset-menu-cards-grid');

  // Calorie Goal Progress Elements
  const totalCaloriesEl = document.getElementById('total-calories');
  const targetCaloriesText = document.getElementById('target-calories-text');
  const calPercentBadge = document.getElementById('cal-percent-badge');
  const calorieProgressFill = document.getElementById('calorie-progress-fill');

  // Food Tracker & Modal Elements
  const foodForm = document.getElementById('food-form');
  const foodNameInput = document.getElementById('food-name-input');
  const foodCalorieInput = document.getElementById('food-calorie-input');
  const foodInputModal = document.getElementById('food-input-modal');
  const closeFoodModalBtn = document.getElementById('close-food-modal-btn');
  const modalMealIcon = document.getElementById('modal-meal-icon');
  const modalTitleText = document.getElementById('modal-title-text');
  const addMealFoodBtns = document.querySelectorAll('.add-meal-food-btn');

  // Exercise Tracker Elements
  const totalExerciseBurnEl = document.getElementById('total-exercise-burn');
  const exerciseForm = document.getElementById('exercise-form');
  const exNameInput = document.getElementById('ex-name-input');
  const exDurationInput = document.getElementById('ex-duration-input');
  const exCalorieInput = document.getElementById('ex-calorie-input');
  const exerciseInputModal = document.getElementById('exercise-input-modal');
  const closeExModalBtn = document.getElementById('close-ex-modal-btn');
  const modalExIcon = document.getElementById('modal-ex-icon');
  const modalExTitleText = document.getElementById('modal-ex-title-text');
  const addExBtns = document.querySelectorAll('.add-ex-btn');
  const exPresetBtns = document.querySelectorAll('.ex-preset-btn');
  const dumbbellWeightGroup = document.getElementById('dumbbell-weight-group');

  // View Mode & Calendar Elements
  const viewSegTabs = document.querySelectorAll('.view-seg-tab');
  const mainContent = document.querySelector('.main-content');
  const weeklyViewContainer = document.getElementById('weekly-view-container');
  const monthlyViewContainer = document.getElementById('monthly-view-container');
  const calendarDaysGrid = document.getElementById('calendar-days-grid');
  const calendarMonthTitle = document.getElementById('calendar-month-title');
  const weeklyBodyContent = document.getElementById('weekly-body-content');

  // Footer & Stamp Elements
  const footerWaterPercent = document.getElementById('footer-water-percent');
  const footerMealCount = document.getElementById('footer-meal-count');
  const footerTotalCal = document.getElementById('footer-total-cal');
  const footerExerciseBurn = document.getElementById('footer-exercise-burn');
  const footerStampStatus = document.getElementById('footer-stamp-status');

  // Celebration Modals Elements
  const celebrationModal = document.getElementById('celebration-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');

  const tripleStampModal = document.getElementById('triple-stamp-modal');
  const closeStampModalBtn = document.getElementById('close-stamp-modal-btn');
  const stampModalConfirmBtn = document.getElementById('stamp-modal-confirm-btn');

  const openStatsBtn = document.getElementById('open-stats-btn');
  const statsModal = document.getElementById('stats-modal');
  const closeStatsModalBtn = document.getElementById('close-stats-modal-btn');
  const statTotalDaysEl = document.getElementById('stat-total-days');
  const statAvgWaterEl = document.getElementById('stat-avg-water');
  const statAvgCalEl = document.getElementById('stat-avg-cal');
  const statAvgExBurnEl = document.getElementById('stat-avg-ex-burn');
  const trendBarsContainer = document.getElementById('trend-bars-container');
  const statTopFoodsEl = document.getElementById('stat-top-foods');
  const statHistoryListEl = document.getElementById('stat-history-list');

  // === DATA STORAGE & FIREBASE CONFIG ===
  const firebaseConfig = {
    apiKey: "AIzaSyBvo44RFIPYi7AIvw-wMmZ9JXTd31ZZjsY",
    authDomain: "lim-coding-lab.firebaseapp.com",
    projectId: "lim-coding-lab",
    storageBucket: "lim-coding-lab.firebasestorage.app",
    messagingSenderId: "159095038942",
    appId: "1:159095038942:web:4985d820501682e281734f"
  };

  let firestoreDb = null;
  try {
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      firestoreDb = firebase.firestore();
      console.log("🔥 Firebase Cloud Firestore successfully initialized!");
    } else {
      console.warn("Firebase SDK not loaded yet.");
    }
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }

  function loadDataFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Failed to parse local storage data:', e);
      return {};
    }
  }

  async function syncBackendData() {
    const syncBadge = document.getElementById('cloud-sync-badge');
    const syncText = document.getElementById('cloud-sync-text');

    // 1. Load locally immediately
    appData = loadDataFromStorage();
    renderUI();

    // 2. Fetch from Firebase Firestore to sync newer logs
    if (!firestoreDb) {
      if (syncBadge && syncText) {
        syncBadge.style.background = '#FEF3C7';
        syncBadge.style.color = '#D97706';
        syncBadge.innerHTML = '<i class="fa-solid fa-cloud-slash"></i> <span id="cloud-sync-text">오프라인 모드 (로컬 저장)</span>';
      }
      return;
    }
    try {
      const querySnapshot = await firestoreDb.collection('health_logs').get();
      let hasUpdates = false;
      querySnapshot.forEach((doc) => {
        const dateStr = doc.id;
        const cloudDayData = doc.data();
        
        if (!appData[dateStr]) {
          appData[dateStr] = cloudDayData;
          hasUpdates = true;
        } else {
          // Merge local and cloud data to prevent overwriting
          appData[dateStr] = {
            water: Math.max(appData[dateStr].water || 0, cloudDayData.water || 0),
            celebrated: appData[dateStr].celebrated || cloudDayData.celebrated || false,
            foods: mergeListById(appData[dateStr].foods || [], cloudDayData.foods || []),
            exercises: mergeListById(appData[dateStr].exercises || [], cloudDayData.exercises || []),
            tripleStampCelebrated: appData[dateStr].tripleStampCelebrated || cloudDayData.tripleStampCelebrated || false
          };
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        renderUI();
      }

      // Update badge to success
      if (syncBadge && syncText) {
        syncBadge.style.background = '#ECFDF5';
        syncBadge.style.color = '#059669';
        syncBadge.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> <span id="cloud-sync-text">클라우드 백업 완료</span>';
      }
    } catch (e) {
      console.log('Firebase sync offline or permissions issue. Using local storage.', e);
      if (syncBadge && syncText) {
        syncBadge.style.background = '#FEF3C7';
        syncBadge.style.color = '#D97706';
        syncBadge.innerHTML = '<i class="fa-solid fa-cloud-slash"></i> <span id="cloud-sync-text">백업 보류 (로컬 보관 중)</span>';
      }
    }
  }

  function mergeListById(localList, cloudList) {
    const map = {};
    localList.forEach(item => { if (item.id) map[item.id] = item; });
    cloudList.forEach(item => { if (item.id) map[item.id] = item; });
    return Object.values(map);
  }

  function saveDataToStorage() {
    const syncBadge = document.getElementById('cloud-sync-badge');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      const dayData = getDayData(currentDate);

      // Save to Firebase Firestore
      if (firestoreDb) {
        if (syncBadge) {
          syncBadge.style.background = '#EFF6FF';
          syncBadge.style.color = '#2563EB';
          syncBadge.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> <span id="cloud-sync-text">백업 중...</span>';
        }
        firestoreDb.collection('health_logs').doc(currentDate).set(dayData)
          .then(() => {
            console.log(`Cloud storage sync success for date: ${currentDate}`);
            if (syncBadge) {
              syncBadge.style.background = '#ECFDF5';
              syncBadge.style.color = '#059669';
              syncBadge.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> <span id="cloud-sync-text">클라우드 백업 완료</span>';
            }
          })
          .catch(err => {
            console.error('Cloud storage sync failed:', err);
            if (syncBadge) {
              syncBadge.style.background = '#FEF3C7';
              syncBadge.style.color = '#D97706';
              syncBadge.innerHTML = '<i class="fa-solid fa-cloud-slash"></i> <span id="cloud-sync-text">백업 보류 (로컬 보관 중)</span>';
            }
          });
      }
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }

  function getDayData(dateStr) {
    if (!appData[dateStr]) {
      appData[dateStr] = {
        water: 0,
        celebrated: false,
        foods: [],
        exercises: [],
        tripleStampCelebrated: false
      };
    }
    if (!appData[dateStr].exercises) appData[dateStr].exercises = [];
    if (appData[dateStr].tripleStampCelebrated === undefined) appData[dateStr].tripleStampCelebrated = false;
    return appData[dateStr];
  }

  // === DATE HELPER FUNCTIONS ===
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatKoreanDate(dateStr) {
    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = weekdays[dateObj.getDay()];
    return `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일 (${dayName})`;
  }

  function changeDateByDays(offset) {
    const parts = currentDate.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    dateObj.setDate(dateObj.getDate() + offset);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    currentDate = `${year}-${month}-${day}`;

    datePicker.value = currentDate;
    updateDateDisplay();
    renderUI();
  }

  function updateDateDisplay() {
    dateText.textContent = formatKoreanDate(currentDate);
    const todayStr = getTodayDateString();
    todayBtn.style.opacity = currentDate === todayStr ? '0.5' : '1';
  }

  // === EASY REPRESENTATIVE MENU RENDERER ===
  function renderMenuCards(cuisine) {
    if (!menuCardsGrid) return;
    menuCardsGrid.innerHTML = '';
    let flagEmoji = '🇰🇷';
    if (cuisine === '양식') flagEmoji = '🍝';
    if (cuisine === '중식') flagEmoji = '🇨🇳';
    if (cuisine === '일식') flagEmoji = '🍣';
    if (cuisine === '분식/디저트') flagEmoji = '🍰';

    if (currentCatLabel) {
      currentCatLabel.innerHTML = `<strong>${flagEmoji} ${cuisine} 대표 메뉴</strong> <small>(클릭하면 바로 추가!)</small>`;
    }

    const menuList = CUISINE_PRESETS[cuisine] || [];

    menuList.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-item-btn';
      btn.innerHTML = `
        <span class="menu-item-name">${item.icon} ${item.name}</span>
        <span class="menu-item-cal">${item.cal} kcal</span>
      `;

      btn.addEventListener('click', () => {
        foodNameInput.value = item.name;
        foodCalorieInput.value = item.cal;

        const radio = document.querySelector(`input[name="cuisineType"][value="${cuisine}"]`);
        if (radio) radio.checked = true;

        btn.classList.add('selected-flash');
        setTimeout(() => btn.classList.remove('selected-flash'), 600);

        openFoodModal(activeTargetMeal);
        foodNameInput.focus();
      });

      menuCardsGrid.appendChild(btn);
    });
  }

  // === WATER TRACKER RENDER & LOGIC ===
  function render8CupsGrid() {
    waterGlassesGrid.innerHTML = '';
    for (let i = 1; i <= TARGET_WATER_GLASSES; i++) {
      const cupDiv = document.createElement('div');
      cupDiv.className = 'cup-item';
      cupDiv.dataset.cupNum = i;
      cupDiv.innerHTML = `
        <i class="fa-solid fa-glass-water cup-icon"></i>
        <span class="cup-label">${i}잔</span>
      `;
      cupDiv.addEventListener('click', () => setWaterGlassesTo(i));
      waterGlassesGrid.appendChild(cupDiv);
    }
  }

  function updateWaterUI() {
    const dayData = getDayData(currentDate);
    const count = dayData.water || 0;
    
    waterCurrentCountEl.textContent = count;

    const percent = Math.round((count / TARGET_WATER_GLASSES) * 100);
    const liters = (count * GLASS_VOLUME_LITERS).toFixed(1);
    const targetLiters = (TARGET_WATER_GLASSES * GLASS_VOLUME_LITERS).toFixed(1);

    waterPercentageEl.textContent = `${percent}%`;
    waterLitersEl.textContent = `${liters} / ${targetLiters} L`;
    waterProgressFill.style.width = `${Math.min(percent, 100)}%`;

    const cups = waterGlassesGrid.querySelectorAll('.cup-item');
    cups.forEach((cup, idx) => {
      const cupNum = idx + 1;
      if (cupNum <= count) {
        cup.classList.add('filled');
      } else {
        cup.classList.remove('filled');
      }
    });

    if (count >= TARGET_WATER_GLASSES) {
      waterGoalBanner.classList.remove('hidden');
      if (!dayData.celebrated) {
        dayData.celebrated = true;
        saveDataToStorage();
        triggerCelebration();
      }
    } else {
      waterGoalBanner.classList.add('hidden');
      dayData.celebrated = false;
    }

    footerWaterPercent.textContent = `${percent}%`;
  }

  function addWater(amount) {
    const dayData = getDayData(currentDate);
    const prevCount = dayData.water || 0;
    const newCount = Math.max(0, prevCount + amount);

    dayData.water = newCount;
    saveDataToStorage();

    waterBottleIcon.classList.add('bounce');
    setTimeout(() => waterBottleIcon.classList.remove('bounce'), 500);

    updateWaterUI();
    checkTripleGoal(dayData);
  }

  function setWaterGlassesTo(cupNum) {
    const dayData = getDayData(currentDate);
    if (dayData.water === cupNum) {
      dayData.water = cupNum - 1;
    } else {
      dayData.water = cupNum;
    }
    saveDataToStorage();

    waterBottleIcon.classList.add('bounce');
    setTimeout(() => waterBottleIcon.classList.remove('bounce'), 500);

    updateWaterUI();
    checkTripleGoal(dayData);
  }

  function triggerCelebration() {
    celebrationModal.classList.remove('hidden');

    if (window.confetti) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38B6FF', '#FF6584', '#2ED573', '#FFA502', '#A55EEA']
      });
    }
  }

  // === FOOD MODAL HANDLERS ===
  function openFoodModal(mealType) {
    activeTargetMeal = mealType || '아침';
    
    const radio = document.querySelector(`input[name="mealType"][value="${activeTargetMeal}"]`);
    if (radio) radio.checked = true;

    let mealIcon = '🍳';
    if (activeTargetMeal === '점심') mealIcon = '🍱';
    if (activeTargetMeal === '저녁') mealIcon = '🍲';
    if (activeTargetMeal === '간식') mealIcon = '🍩';

    if (modalMealIcon) modalMealIcon.textContent = mealIcon;
    if (modalTitleText) modalTitleText.textContent = `${activeTargetMeal} 음식 추가하기`;

    document.querySelectorAll('.meal-card-item').forEach(card => {
      if (card.dataset.meal === activeTargetMeal) {
        card.classList.add('active-target');
      } else {
        card.classList.remove('active-target');
      }
    });

    foodInputModal.classList.remove('hidden');
    foodNameInput.focus();
  }

  function closeFoodModal() {
    foodInputModal.classList.add('hidden');
  }

  // === 4 MEAL CARDS & CALORIE PROGRESS RENDER & LOGIC ===
  function updateFoodUI() {
    const dayData = getDayData(currentDate);
    const foods = dayData.foods || [];

    const totalCal = foods.reduce((sum, item) => sum + (parseInt(item.calories) || 0), 0);
    totalCaloriesEl.textContent = totalCal.toLocaleString();
    if (targetCaloriesText) targetCaloriesText.textContent = targetCalories.toLocaleString();

    const calPercent = Math.round((totalCal / targetCalories) * 100);
    if (calPercentBadge) calPercentBadge.textContent = `${calPercent}%`;
    if (calorieProgressFill) calorieProgressFill.style.width = `${Math.min(calPercent, 100)}%`;

    footerMealCount.textContent = `${foods.length}개`;
    footerTotalCal.textContent = `${totalCal.toLocaleString()} kcal`;

    const mealTypes = ['아침', '점심', '저녁', '간식'];

    mealTypes.forEach(meal => {
      const listEl = document.getElementById(`meal-list-${meal}`);
      const emptyEl = document.getElementById(`meal-empty-${meal}`);
      const subtotalEl = document.getElementById(`subtotal-${meal}`);

      if (!listEl) return;

      const mealFoods = foods.filter(item => (item.mealType || '아침') === meal);
      const subtotalCal = mealFoods.reduce((sum, item) => sum + (parseInt(item.calories) || 0), 0);

      if (subtotalEl) subtotalEl.textContent = `${subtotalCal.toLocaleString()} kcal`;

      listEl.innerHTML = '';

      if (mealFoods.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
      } else {
        if (emptyEl) emptyEl.classList.add('hidden');

        mealFoods.forEach(food => {
          const li = document.createElement('li');
          li.className = 'meal-food-item';
          const calText = food.calories ? `${food.calories} kcal` : '0 kcal';

          li.innerHTML = `
            <div class="meal-food-info">
              <span class="meal-food-name">${escapeHTML(food.name)}</span>
              <span class="meal-food-cal">${calText}</span>
            </div>
            <button class="delete-food-btn" title="삭제하기" data-food-id="${food.id}">
              <i class="fa-solid fa-trash-can"></i> 삭제
            </button>
          `;

          li.querySelector('.delete-food-btn').addEventListener('click', () => {
            deleteFoodItem(food.id);
          });

          listEl.appendChild(li);
        });
      }
    });

    checkTripleGoal(dayData);
  }

  function addFoodItem(mealType, cuisineType, name, calories) {
    const dayData = getDayData(currentDate);
    
    let finalCal = parseInt(calories);
    if (!calories || isNaN(finalCal) || finalCal === 0) {
      const foodName = name.trim().toLowerCase();
      
      // 1. Exact match in search database
      let matched = FOOD_SEARCH_DATABASE.find(item => item.name.toLowerCase() === foodName);
      
      // 2. Fuzzy match in search database
      if (!matched) {
        matched = FOOD_SEARCH_DATABASE.find(item => 
          foodName.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(foodName)
        );
      }

      // 3. Match in cuisine presets
      if (!matched && typeof CUISINE_PRESETS !== 'undefined') {
        Object.values(CUISINE_PRESETS).flat().forEach(item => {
          if (item.name.toLowerCase() === foodName || foodName.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(foodName)) {
            matched = item;
          }
        });
      }

      if (matched) {
        finalCal = matched.cal;
      } else {
        // 4. Keyword Fallback Heuristics
        if (foodName.includes('김')) finalCal = 15;
        else if (foodName.includes('과자') || foodName.includes('스낵') || foodName.includes('칩')) finalCal = 200;
        else if (foodName.includes('밥')) finalCal = 300;
        else if (foodName.includes('찌개') || foodName.includes('국')) finalCal = 150;
        else if (foodName.includes('볶음밥')) finalCal = 450;
        else if (foodName.includes('면') || foodName.includes('우동') || foodName.includes('라면')) finalCal = 500;
        else if (foodName.includes('고기') || foodName.includes('구이') || foodName.includes('삼겹살')) finalCal = 400;
        else if (foodName.includes('샐러드')) finalCal = 150;
        else if (foodName.includes('음료') || foodName.includes('주스')) finalCal = 100;
        else if (foodName.includes('커피')) finalCal = 10;
        else finalCal = 150; // default baseline fallback
      }
    }

    const newItem = {
      id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      mealType: mealType,
      cuisineType: cuisineType || '한식',
      name: name.trim(),
      calories: finalCal,
      createdAt: new Date().toISOString()
    };

    dayData.foods.push(newItem);
    saveDataToStorage();

    foodNameInput.value = '';
    foodCalorieInput.value = '';
    closeFoodModal();

    updateFoodUI();
  }

  function deleteFoodItem(id) {
    const dayData = getDayData(currentDate);
    dayData.foods = dayData.foods.filter(item => item.id !== id);
    saveDataToStorage();
    updateFoodUI();
  }

  // === EXERCISE ENGINE & CALCULATOR ===
  function calcExerciseCalories(category, weight, durationMin) {
    const mins = parseFloat(durationMin) || 15;
    const name = exNameInput ? exNameInput.value.trim().toLowerCase() : '';

    // Check if name matches any entry in our search database
    const matchedEx = EXERCISE_SEARCH_DATABASE.find(item => 
      name.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(name)
    );
    if (matchedEx && name !== '') {
      return Math.round(matchedEx.rate * mins);
    }

    let rate = 3.3;
    if (category === '근력') {
      if (weight === '0.5kg') rate = 2.33; // 15분 -> ~35kcal
      else if (weight === '1kg') rate = 3.33; // 15분 -> ~50kcal
      else if (weight === '3kg') rate = 5.33; // 15분 -> ~80kcal
      else rate = 4.0; // 맨몸/기타 -> ~60kcal
    } else if (category === '유산소') {
      rate = 5.5; // ~82kcal / 15분
    } else if (category === '스트레칭') {
      rate = 2.67; // ~40kcal / 15분
    } else {
      rate = 3.5;
    }

    return Math.round(rate * mins);
  }

  function autoUpdateCalorieCalculation() {
    const catEl = document.querySelector('input[name="exCategory"]:checked');
    const weightEl = document.querySelector('input[name="exWeight"]:checked');

    const cat = catEl ? catEl.value : '근력';
    const weight = weightEl ? weightEl.value : '1kg';
    const duration = exDurationInput ? exDurationInput.value : 15;

    if (cat === '근력') {
      if (dumbbellWeightGroup) dumbbellWeightGroup.classList.remove('hidden');
    } else {
      if (dumbbellWeightGroup) dumbbellWeightGroup.classList.add('hidden');
    }

    const calculatedKcal = calcExerciseCalories(cat, weight, duration);
    if (exCalorieInput) exCalorieInput.value = calculatedKcal;
  }

  // === AUTOCOMPLETE & SEARCH ENGINE ===
  function setupAutocomplete() {
    const foodSearchDropdown = document.getElementById('food-search-dropdown');
    const exSearchDropdown = document.getElementById('ex-search-dropdown');

    // 1. Food Autocomplete
    if (foodNameInput && foodSearchDropdown) {
      foodNameInput.addEventListener('input', () => {
        const val = foodNameInput.value.trim().toLowerCase();
        if (!val) {
          foodSearchDropdown.innerHTML = '';
          foodSearchDropdown.classList.add('hidden');
          return;
        }

        const matches = FOOD_SEARCH_DATABASE.filter(item => 
          item.name.toLowerCase().includes(val)
        );

        if (matches.length === 0) {
          foodSearchDropdown.innerHTML = '';
          foodSearchDropdown.classList.add('hidden');
          return;
        }

        foodSearchDropdown.innerHTML = matches.map(item => `
          <div class="search-result-item" data-name="${item.name}" data-cal="${item.cal}">
            <span class="item-name">${item.name}</span>
            <span class="item-kcal">${item.cal} kcal</span>
          </div>
        `).join('');

        foodSearchDropdown.classList.remove('hidden');

        // Click handler for items
        foodSearchDropdown.querySelectorAll('.search-result-item').forEach(el => {
          el.addEventListener('click', () => {
            foodNameInput.value = el.dataset.name;
            if (foodCalorieInput) foodCalorieInput.value = el.dataset.cal;
            foodSearchDropdown.innerHTML = '';
            foodSearchDropdown.classList.add('hidden');
          });
        });
      });

      // Close dropdown on click outside
      document.addEventListener('click', (e) => {
        if (!foodNameInput.contains(e.target) && !foodSearchDropdown.contains(e.target)) {
          foodSearchDropdown.classList.add('hidden');
        }
      });
    }

    // 2. Exercise Autocomplete
    if (exNameInput && exSearchDropdown) {
      exNameInput.addEventListener('input', () => {
        const val = exNameInput.value.trim().toLowerCase();
        if (!val) {
          exSearchDropdown.innerHTML = '';
          exSearchDropdown.classList.add('hidden');
          return;
        }

        const matches = EXERCISE_SEARCH_DATABASE.filter(item => 
          item.name.toLowerCase().includes(val)
        );

        if (matches.length === 0) {
          exSearchDropdown.innerHTML = '';
          exSearchDropdown.classList.add('hidden');
          return;
        }

        exSearchDropdown.innerHTML = matches.map(item => `
          <div class="search-result-item" data-name="${item.name}" data-rate="${item.rate}" data-cat="${item.cat}">
            <span class="item-name">${item.name}</span>
            <span class="item-kcal">${item.rate} kcal/분</span>
          </div>
        `).join('');

        exSearchDropdown.classList.remove('hidden');

        // Click handler for items
        exSearchDropdown.querySelectorAll('.search-result-item').forEach(el => {
          el.addEventListener('click', () => {
            exNameInput.value = el.dataset.name;
            
            // Set category radio
            const cat = el.dataset.cat;
            const catRadio = document.querySelector(`input[name="exCategory"][value="${cat}"]`);
            if (catRadio) catRadio.checked = true;

            exSearchDropdown.innerHTML = '';
            exSearchDropdown.classList.add('hidden');

            autoUpdateCalorieCalculation();
          });
        });
      });

      // Close dropdown on click outside
      document.addEventListener('click', (e) => {
        if (!exNameInput.contains(e.target) && !exSearchDropdown.contains(e.target)) {
          exSearchDropdown.classList.add('hidden');
        }
      });
    }

    // 3. Recommended Tag Clicks
    document.querySelectorAll('.recommended-tags .rec-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        // Check if inside food modal or exercise modal
        const isFoodModal = btn.closest('#food-input-modal');
        if (isFoodModal) {
          if (foodNameInput) foodNameInput.value = name;
          if (foodCalorieInput) foodCalorieInput.value = btn.dataset.cal;
        } else {
          if (exNameInput) exNameInput.value = name;
          const cat = btn.dataset.cat;
          const catRadio = document.querySelector(`input[name="exCategory"][value="${cat}"]`);
          if (catRadio) catRadio.checked = true;
          autoUpdateCalorieCalculation();
        }
      });
    });
  }


  function openExerciseModal(timeOfDay) {
    activeTargetExTime = timeOfDay || '아침';
    const radio = document.querySelector(`input[name="exTimeOfDay"][value="${activeTargetExTime}"]`);
    if (radio) radio.checked = true;

    let icon = '🌅';
    if (activeTargetExTime === '점심') icon = '☀️';
    if (activeTargetExTime === '저녁') icon = '🌙';
    if (activeTargetExTime === '야간') icon = '🌃';

    if (modalExIcon) modalExIcon.textContent = icon;
    if (modalExTitleText) modalExTitleText.textContent = `${activeTargetExTime} 운동 추가하기`;

    autoUpdateCalorieCalculation();
    exerciseInputModal.classList.remove('hidden');
    exNameInput.focus();
  }

  function closeExerciseModal() {
    exerciseInputModal.classList.add('hidden');
  }

  function updateExerciseUI() {
    const dayData = getDayData(currentDate);
    const exercises = dayData.exercises || [];

    const totalBurn = exercises.reduce((sum, item) => sum + (parseInt(item.calories) || 0), 0);
    if (totalExerciseBurnEl) totalExerciseBurnEl.textContent = totalBurn.toLocaleString();
    if (footerExerciseBurn) footerExerciseBurn.textContent = `${totalBurn.toLocaleString()} kcal`;

    const exTimes = ['아침', '점심', '저녁', '야간'];

    exTimes.forEach(time => {
      const listEl = document.getElementById(`ex-list-${time}`);
      const emptyEl = document.getElementById(`ex-empty-${time}`);
      const subtotalEl = document.getElementById(`ex-subtotal-${time}`);

      if (!listEl) return;

      const timeExercises = exercises.filter(item => (item.timeOfDay || '아침') === time);
      const subtotalBurn = timeExercises.reduce((sum, item) => sum + (parseInt(item.calories) || 0), 0);

      if (subtotalEl) subtotalEl.textContent = `${subtotalBurn.toLocaleString()} kcal`;

      listEl.innerHTML = '';

      if (timeExercises.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
      } else {
        if (emptyEl) emptyEl.classList.add('hidden');

        timeExercises.forEach(ex => {
          const li = document.createElement('li');
          li.className = 'meal-food-item exercise-item';

          const weightBadge = (ex.weight && ex.weight !== '없음') ? `<span class="weight-chip" style="padding:2px 8px; font-size:0.75rem;">${ex.weight}</span>` : '';

          li.innerHTML = `
            <div class="meal-food-info">
              ${weightBadge}
              <span class="meal-food-name">${escapeHTML(ex.name)}</span>
              <span class="meal-food-cal" style="color:#FF793F; border-color:#FFDEC9; background:#FFF5F0;">${ex.calories} kcal (${ex.duration}분)</span>
            </div>
            <button class="delete-food-btn" title="삭제하기" data-ex-id="${ex.id}">
              <i class="fa-solid fa-trash-can"></i> 삭제
            </button>
          `;

          li.querySelector('.delete-food-btn').addEventListener('click', () => {
            deleteExerciseItem(ex.id);
          });

          listEl.appendChild(li);
        });
      }
    });

    checkTripleGoal(dayData);
  }

  function addExerciseItem(timeOfDay, category, weight, name, duration, calories) {
    const dayData = getDayData(currentDate);
    const newItem = {
      id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timeOfDay: timeOfDay || '아침',
      category: category || '근력',
      weight: weight || '1kg',
      name: name.trim(),
      duration: duration ? parseInt(duration) : 15,
      calories: calories ? parseInt(calories) : 50,
      createdAt: new Date().toISOString()
    };

    dayData.exercises.push(newItem);
    saveDataToStorage();

    exNameInput.value = '';
    closeExerciseModal();

    updateExerciseUI();
  }

  function deleteExerciseItem(id) {
    const dayData = getDayData(currentDate);
    dayData.exercises = dayData.exercises.filter(item => item.id !== id);
    saveDataToStorage();
    updateExerciseUI();
  }

  // === TRIPLE GOAL STAMP SYSTEM ===
  function checkTripleGoal(dayData) {
    const waterOk = (dayData.water || 0) >= TARGET_WATER_GLASSES;
    const foodOk = (dayData.foods || []).length > 0;
    const exOk = (dayData.exercises || []).length > 0;

    const isTripleDone = waterOk && foodOk && exOk;

    if (footerStampStatus) {
      footerStampStatus.textContent = isTripleDone ? '완료 💮' : '도전 중!';
      footerStampStatus.style.color = isTripleDone ? '#FF4757' : '#2D3436';
    }

    if (isTripleDone && !dayData.tripleStampCelebrated) {
      dayData.tripleStampCelebrated = true;
      saveDataToStorage();
      triggerTripleStampCelebration();
    }
  }

  function triggerTripleStampCelebration() {
    if (tripleStampModal) tripleStampModal.classList.remove('hidden');

    if (window.confetti) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FF4757', '#FF793F', '#2ED573', '#38B6FF', '#FFA502']
      });
    }
  }

  // === VIEW MODE SEGMENTED TABS & CALENDAR ===
  function changeMonth(offsetMonths) {
    const parts = currentDate.split('-');
    const yearInput = parseInt(parts[0]);
    const monthInput = parseInt(parts[1]) - 1;
    const dayInput = parseInt(parts[2]);

    const dateObj = new Date(yearInput, monthInput, 1);
    dateObj.setMonth(dateObj.getMonth() + offsetMonths);

    const targetYear = dateObj.getFullYear();
    const targetMonth = dateObj.getMonth();

    const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(dayInput, maxDaysInTargetMonth);

    const yearStr = targetYear;
    const monthStr = String(targetMonth + 1).padStart(2, '0');
    const dayStr = String(targetDay).padStart(2, '0');

    currentDate = `${yearStr}-${monthStr}-${dayStr}`;
    if (datePicker) datePicker.value = currentDate;
    updateDateDisplay();
    renderUI();
  }

  function switchViewMode(mode) {
    activeViewMode = mode;
    viewSegTabs.forEach(tab => {
      if (tab.dataset.view === mode) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    if (mode === 'daily') {
      mainContent.classList.remove('hidden');
      weeklyViewContainer.classList.add('hidden');
      monthlyViewContainer.classList.add('hidden');
    } else if (mode === 'weekly') {
      mainContent.classList.add('hidden');
      weeklyViewContainer.classList.remove('hidden');
      monthlyViewContainer.classList.add('hidden');
      renderWeeklySummary();
    } else if (mode === 'monthly') {
      mainContent.classList.add('hidden');
      weeklyViewContainer.classList.add('hidden');
      monthlyViewContainer.classList.remove('hidden');
      renderMonthlyCalendar(currentDate);
    }
  }

  function renderMonthlyCalendar(dateStr) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;

    if (calendarMonthTitle) {
      calendarMonthTitle.textContent = `${year}년 ${month + 1}월 달력 & '참 잘했어요 💮' 스탬프`;
    }

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    if (!calendarDaysGrid) return;
    calendarDaysGrid.innerHTML = '';

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-cell other-month';
      calendarDaysGrid.appendChild(emptyCell);
    }

    const todayStr = getTodayDateString();

    for (let dayNum = 1; dayNum <= lastDate; dayNum++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayData = appData[dStr] || { water: 0, foods: [], exercises: [] };

      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      if (dStr === todayStr) cell.classList.add('today-cell');

      const waterCount = dayData.water || 0;
      const foodCount = (dayData.foods || []).length;
      const exCount = (dayData.exercises || []).length;
      const foodCal = (dayData.foods || []).reduce((sum, f) => sum + (parseInt(f.calories) || 0), 0);
      const exBurn = (dayData.exercises || []).reduce((sum, e) => sum + (parseInt(e.calories) || 0), 0);

      const isTripleDone = (waterCount >= TARGET_WATER_GLASSES) && (foodCount > 0) && (exCount > 0);

      cell.innerHTML = `
        <span class="cell-day-num">${dayNum}</span>
        <div class="cell-icons-row" style="display: flex; flex-direction: column; gap: 2px; font-size: 0.65rem; align-items: stretch; line-height: 1.1; width: 100%;">
          ${waterCount > 0 ? `<span style="background: #E0F2FE; color: #0369A1; padding: 1px 3px; border-radius: 4px; display: block; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="물 ${waterCount}잔">💧${waterCount}잔</span>` : ''}
          ${foodCal > 0 ? `<span style="background: #FCE7F3; color: #BE185D; padding: 1px 3px; border-radius: 4px; display: block; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="식단 ${foodCal}kcal">🍲${foodCal} kcal</span>` : ''}
          ${exBurn > 0 ? `<span style="background: #FFEDD5; color: #C2410C; padding: 1px 3px; border-radius: 4px; display: block; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="운동 ${exBurn}kcal">💪${exBurn} kcal</span>` : ''}
        </div>
        <div class="cell-stamp-wrapper">
          ${isTripleDone ? `<span class="calendar-stamp-badge" title="삼총사 달성 스탬프!">💮</span>` : ''}
        </div>
      `;

      cell.addEventListener('click', () => {
        currentDate = dStr;
        datePicker.value = currentDate;
        updateDateDisplay();
        renderUI();
        switchViewMode('daily');
      });

      calendarDaysGrid.appendChild(cell);
    }
  }

  function renderWeeklySummary() {
    if (!weeklyBodyContent) return;
    const todayObj = new Date(currentDate);
    let html = '<div class="stats-summary-grid">';

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayData = appData[dStr] || { water: 0, foods: [], exercises: [] };

      const water = dayData.water || 0;
      const foodCal = (dayData.foods || []).reduce((sum, f) => sum + (parseInt(f.calories) || 0), 0);
      const exBurn = (dayData.exercises || []).reduce((sum, e) => sum + (parseInt(e.calories) || 0), 0);
      const isStamp = (water >= 8) && ((dayData.foods || []).length > 0) && ((dayData.exercises || []).length > 0);

      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const dateLabel = `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;

      html += `
        <div class="stat-summary-card" style="background:#FFF; border:1.5px solid #EEF2F7; cursor:pointer;" onclick="selectHistoryDate('${dStr}')">
          <div style="width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <strong>📅 ${dateLabel}</strong>
              ${isStamp ? '<span style="font-size:1.3rem;">💮</span>' : ''}
            </div>
            <div style="font-size:0.83rem; color:var(--text-sub); display:flex; flex-direction:column; gap:3px;">
              <span>💧 물: <strong>${water}잔 / 8잔</strong></span>
              <span>🍲 식단: <strong>${foodCal} kcal</strong> (${(dayData.foods||[]).length}개)</span>
              <span>💪 운동: <strong>${exBurn} kcal</strong> (${(dayData.exercises||[]).length}개)</span>
            </div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    weeklyBodyContent.innerHTML = html;
  }

  window.selectHistoryDate = function(dStr) {
    currentDate = dStr;
    datePicker.value = currentDate;
    updateDateDisplay();
    renderUI();
    switchViewMode('daily');
  };

  // === GOAL CALORIES SETTING MODAL ===
  const goalModal = document.getElementById('goal-modal');
  const openGoalBtn = document.getElementById('open-goal-btn');
  const calorieGoalTrigger = document.getElementById('calorie-goal-trigger');
  const closeGoalModalBtn = document.getElementById('close-goal-modal-btn');
  const goalForm = document.getElementById('goal-form');
  const goalHeightInput = document.getElementById('goal-height-input');
  const goalWeightInput = document.getElementById('goal-weight-input');
  const goalAgeInput = document.getElementById('goal-age-input');
  const goalActivitySelect = document.getElementById('goal-activity-select');
  const calculatedCaloriesText = document.getElementById('calculated-calories-text');

  function openGoalModal() {
    try {
      const gender = localStorage.getItem('goal_gender') || 'female';
      const height = localStorage.getItem('goal_height') || '160';
      const weight = localStorage.getItem('goal_weight') || '55';
      const age = localStorage.getItem('goal_age') || '25';
      const activity = localStorage.getItem('goal_activity') || '1.375';

      const genderRadio = document.querySelector(`input[name="goalGender"][value="${gender}"]`);
      if (genderRadio) genderRadio.checked = true;
      if (goalHeightInput) goalHeightInput.value = height;
      if (goalWeightInput) goalWeightInput.value = weight;
      if (goalAgeInput) goalAgeInput.value = age;
      if (goalActivitySelect) goalActivitySelect.value = activity;
    } catch(e) {}

    updateCalculatedCalories();
    if (goalModal) goalModal.classList.remove('hidden');
  }

  function closeGoalModal() {
    if (goalModal) goalModal.classList.add('hidden');
  }

  function updateCalculatedCalories() {
    const genderEl = document.querySelector('input[name="goalGender"]:checked');
    const gender = genderEl ? genderEl.value : 'female';
    const height = parseFloat(goalHeightInput.value) || 160;
    const weight = parseFloat(goalWeightInput.value) || 55;
    const age = parseInt(goalAgeInput.value) || 25;
    const activity = parseFloat(goalActivitySelect.value) || 1.375;

    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    const tdee = Math.round(bmr * activity);
    if (calculatedCaloriesText) calculatedCaloriesText.textContent = tdee.toLocaleString();
    return tdee;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function renderUI() {
    updateWaterUI();
    updateFoodUI();
    updateExerciseUI();
    if (activeViewMode === 'monthly') renderMonthlyCalendar(currentDate);
    if (activeViewMode === 'weekly') renderWeeklySummary();
  }

  // === STATS MODAL HANDLERS ===
  async function openStatsModal() {
    const statsData = computeLocalStats();
    renderStatsUI(statsData);
    if (statsModal) statsModal.classList.remove('hidden');
  }

  function computeLocalStats() {
    const dates = Object.keys(appData).sort();
    const totalDays = dates.length;
    if (totalDays === 0) {
      return { totalDays: 0, avgWater: 0, avgCalories: 0, avgExerciseBurn: 0, topFoods: [], recent7Days: [] };
    }

    let totalWater = 0;
    let totalCal = 0;
    let totalExBurn = 0;
    const foodMap = {};

    dates.forEach(d => {
      const day = appData[d];
      totalWater += (day.water || 0);
      (day.foods || []).forEach(f => {
        totalCal += (parseInt(f.calories) || 0);
        const name = (f.name || '').trim();
        if (name) foodMap[name] = (foodMap[name] || 0) + 1;
      });
      (day.exercises || []).forEach(ex => {
        totalExBurn += (parseInt(ex.calories) || 0);
      });
    });

    const topFoods = Object.entries(foodMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const today = new Date();
    const recent7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dateObj = new Date(today);
      dateObj.setDate(dateObj.getDate() - i);
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayData = appData[dateStr] || { water: 0, foods: [], exercises: [] };
      const water = dayData.water || 0;
      const calories = (dayData.foods || []).reduce((sum, f) => sum + (parseInt(f.calories) || 0), 0);
      const exBurn = (dayData.exercises || []).reduce((sum, e) => sum + (parseInt(e.calories) || 0), 0);
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${weekdays[dateObj.getDay()]})`;
      recent7Days.push({ dateStr, label, water, calories, exBurn });
    }

    return {
      totalDays,
      avgWater: (totalWater / totalDays).toFixed(1),
      avgCalories: Math.round(totalCal / totalDays),
      avgExerciseBurn: Math.round(totalExBurn / totalDays),
      topFoods,
      recent7Days
    };
  }

  function renderStatsUI(stats) {
    if (statTotalDaysEl) statTotalDaysEl.textContent = stats.totalDays;
    if (statAvgWaterEl) statAvgWaterEl.textContent = `${stats.avgWater}잔`;
    if (statAvgCalEl) statAvgCalEl.textContent = `${stats.avgCalories.toLocaleString()} kcal`;
    if (statAvgExBurnEl) statAvgExBurnEl.textContent = `${stats.avgExerciseBurn.toLocaleString()} kcal`;

    if (trendBarsContainer && Array.isArray(stats.recent7Days)) {
      trendBarsContainer.innerHTML = '';
      stats.recent7Days.forEach(item => {
        const col = document.createElement('div');
        col.className = 'trend-col-item';

        const waterHeightPct = Math.min(100, Math.round((item.water / TARGET_WATER_GLASSES) * 100));
        const calHeightPct = Math.min(100, Math.round((item.calories / targetCalories) * 100));
        const exHeightPct = Math.min(100, Math.round((item.exBurn / 500) * 100)); // assume baseline target 500 kcal

        col.innerHTML = `
          <div class="trend-bars-pair" style="display: flex; align-items: flex-end; gap: 3px; height: 120px;">
            <div class="trend-bar-water" style="height: ${Math.max(4, waterHeightPct)}%; width: 7px; background: #60A5FA; border-radius: 4px;" title="물: ${item.water}잔"></div>
            <div class="trend-bar-cal" style="height: ${Math.max(4, calHeightPct)}%; width: 7px; background: #F472B6; border-radius: 4px;" title="식단: ${item.calories} kcal"></div>
            <div class="trend-bar-ex" style="height: ${Math.max(4, exHeightPct)}%; width: 7px; background: #FB923C; border-radius: 4px;" title="운동 소모: ${item.exBurn} kcal"></div>
          </div>
          <span class="trend-col-label" style="font-size:0.72rem; margin-top:4px;">${item.label}</span>
        `;
        trendBarsContainer.appendChild(col);
      });
    }

    if (statTopFoodsEl) {
      statTopFoodsEl.innerHTML = '';
      if (stats.topFoods && stats.topFoods.length > 0) {
        stats.topFoods.forEach(food => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${escapeHTML(food.name)}</strong> - <span class="top-food-count">${food.count}회 섭취</span>`;
          statTopFoodsEl.appendChild(li);
        });
      } else {
        statTopFoodsEl.innerHTML = '<li style="list-style:none; color: var(--text-sub);">기록된 음식이 없어요</li>';
      }
    }

    if (statHistoryListEl) {
      statHistoryListEl.innerHTML = '';
      const dates = Object.keys(appData).sort().reverse();
      if (dates.length > 0) {
        dates.forEach(dStr => {
          const day = appData[dStr];
          const cal = (day.foods || []).reduce((sum, f) => sum + (parseInt(f.calories) || 0), 0);
          const exBurn = (day.exercises || []).reduce((sum, e) => sum + (parseInt(e.calories) || 0), 0);

          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'history-date-btn';
          btn.innerHTML = `
            <span>📅 ${formatKoreanDate(dStr)}</span>
            <span>💧 ${day.water || 0}잔 | 🍲 ${cal} kcal | 💪 ${exBurn} kcal</span>
          `;

          btn.addEventListener('click', () => {
            currentDate = dStr;
            datePicker.value = currentDate;
            updateDateDisplay();
            renderUI();
            statsModal.classList.add('hidden');
          });

          li.appendChild(btn);
          statHistoryListEl.appendChild(li);
        });
      } else {
        statHistoryListEl.innerHTML = '<li style="color: var(--text-sub);">저장된 과거 기록이 없어요</li>';
      }
    }
  }

  // === EVENT LISTENERS ATTACHMENT ===
  function attachEventListeners() {
    setupAutocomplete();

    // Date Controls
    if (prevDateBtn) prevDateBtn.addEventListener('click', () => changeDateByDays(-1));
    if (nextDateBtn) nextDateBtn.addEventListener('click', () => changeDateByDays(1));
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        currentDate = getTodayDateString();
        if (datePicker) datePicker.value = currentDate;
        updateDateDisplay();
        renderUI();
      });
    }

    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          currentDate = e.target.value;
          updateDateDisplay();
          renderUI();
        }
      });
    }

    // Water Controls
    if (waterPlusBtn) waterPlusBtn.addEventListener('click', () => addWater(1));
    if (waterMinusBtn) waterMinusBtn.addEventListener('click', () => addWater(-1));

    // Cuisine Category Buttons
    catBigBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBigBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCuisineCategory = btn.dataset.cat || btn.dataset.cuisine;
        renderMenuCards(activeCuisineCategory);
      });
    });

    // 2-Card Search Shortcut Banner Listeners
    const openFoodSearchCardBtn = document.getElementById('open-food-search-card-btn');
    if (openFoodSearchCardBtn) {
      openFoodSearchCardBtn.addEventListener('click', () => {
        openFoodModal(activeTargetMeal);
      });
    }

    const openExSearchCardBtn = document.getElementById('open-ex-search-card-btn');
    if (openExSearchCardBtn) {
      openExSearchCardBtn.addEventListener('click', () => {
        openExerciseModal(activeTargetExTime);
      });
    }

    // Modal Preset Chip Click Listeners
    document.querySelectorAll('.modal-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (foodNameInput) foodNameInput.value = chip.dataset.name || '';
        if (foodCalorieInput) foodCalorieInput.value = chip.dataset.cal || '0';
        if (foodNameInput) foodNameInput.focus();
      });
    });

    document.querySelectorAll('.modal-ex-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (exNameInput) exNameInput.value = chip.dataset.name || '';
        if (exDurationInput) exDurationInput.value = chip.dataset.min || '15';
        if (exCalorieInput) exCalorieInput.value = chip.dataset.cal || '50';

        const catRadio = document.querySelector(`input[name="exCategory"][value="${chip.dataset.cat}"]`);
        if (catRadio) catRadio.checked = true;

        const weightRadio = document.querySelector(`input[name="exWeight"][value="${chip.dataset.weight}"]`);
        if (weightRadio) weightRadio.checked = true;

        if (exNameInput) exNameInput.focus();
      });
    });

    // Food Card Buttons
    addMealFoodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        openFoodModal(btn.dataset.meal);
      });
    });

    const modalMealRadios = document.querySelectorAll('input[name="mealType"]');
    modalMealRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        activeTargetMeal = e.target.value;
        let mealIcon = '🍳';
        if (activeTargetMeal === '점심') mealIcon = '🍱';
        if (activeTargetMeal === '저녁') mealIcon = '🍲';
        if (activeTargetMeal === '간식') mealIcon = '🍩';
        if (modalMealIcon) modalMealIcon.textContent = mealIcon;
        if (modalTitleText) modalTitleText.textContent = `${activeTargetMeal} 음식 추가하기`;
      });
    });

    if (closeFoodModalBtn) closeFoodModalBtn.addEventListener('click', closeFoodModal);
    if (foodInputModal) {
      foodInputModal.addEventListener('click', (e) => {
        if (e.target === foodInputModal) closeFoodModal();
      });
    }

    if (foodForm) {
      foodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mealTypeEl = document.querySelector('input[name="mealType"]:checked');
        const cuisineTypeEl = document.querySelector('input[name="cuisineType"]:checked');
        
        const mealType = mealTypeEl ? mealTypeEl.value : activeTargetMeal;
        const cuisineType = cuisineTypeEl ? cuisineTypeEl.value : activeCuisineCategory;
        const name = foodNameInput.value;
        const calories = foodCalorieInput.value;

        if (name.trim()) {
          addFoodItem(mealType, cuisineType, name, calories);
        }
      });
    }

    // Exercise Event Listeners
    addExBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        openExerciseModal(btn.dataset.exTime);
      });
    });

    exPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        exNameInput.value = btn.dataset.name;
        exDurationInput.value = btn.dataset.min;
        exCalorieInput.value = btn.dataset.cal;

        const catRadio = document.querySelector(`input[name="exCategory"][value="${btn.dataset.cat}"]`);
        if (catRadio) catRadio.checked = true;

        const weightRadio = document.querySelector(`input[name="exWeight"][value="${btn.dataset.weight}"]`);
        if (weightRadio) weightRadio.checked = true;

        openExerciseModal(activeTargetExTime);
      });
    });

    if (exNameInput) exNameInput.addEventListener('input', autoUpdateCalorieCalculation);
    if (exDurationInput) exDurationInput.addEventListener('input', autoUpdateCalorieCalculation);
    document.querySelectorAll('input[name="exCategory"]').forEach(r => r.addEventListener('change', autoUpdateCalorieCalculation));
    document.querySelectorAll('input[name="exWeight"]').forEach(r => r.addEventListener('change', autoUpdateCalorieCalculation));

    if (closeExModalBtn) closeExModalBtn.addEventListener('click', closeExerciseModal);
    if (exerciseInputModal) {
      exerciseInputModal.addEventListener('click', (e) => {
        if (e.target === exerciseInputModal) closeExerciseModal();
      });
    }

    if (exerciseForm) {
      exerciseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const timeEl = document.querySelector('input[name="exTimeOfDay"]:checked');
        const catEl = document.querySelector('input[name="exCategory"]:checked');
        const weightEl = document.querySelector('input[name="exWeight"]:checked');

        const timeOfDay = timeEl ? timeEl.value : activeTargetExTime;
        const category = catEl ? catEl.value : '근력';
        const weight = weightEl ? weightEl.value : '1kg';
        const name = exNameInput.value;
        const duration = exDurationInput.value;
        const calories = exCalorieInput.value;

        if (name.trim()) {
          addExerciseItem(timeOfDay, category, weight, name, duration, calories);
        }
      });
    }

    // View Segmented Tabs Event Listeners
    viewSegTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchViewMode(tab.dataset.view);
      });
    });

    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Triple Stamp Modal Close
    if (closeStampModalBtn) closeStampModalBtn.addEventListener('click', () => tripleStampModal.classList.add('hidden'));
    if (stampModalConfirmBtn) {
      stampModalConfirmBtn.addEventListener('click', () => {
        tripleStampModal.classList.add('hidden');
        switchViewMode('monthly');
      });
    }
    if (tripleStampModal) {
      tripleStampModal.addEventListener('click', (e) => {
        if (e.target === tripleStampModal) tripleStampModal.classList.add('hidden');
      });
    }

    // Water Celebration Modal Close
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => celebrationModal.classList.add('hidden'));
    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', () => celebrationModal.classList.add('hidden'));
    if (celebrationModal) {
      celebrationModal.addEventListener('click', (e) => {
        if (e.target === celebrationModal) celebrationModal.classList.add('hidden');
      });
    }

    // Stats Modal Trigger
    if (openStatsBtn) openStatsBtn.addEventListener('click', openStatsModal);
    if (closeStatsModalBtn) closeStatsModalBtn.addEventListener('click', () => statsModal.classList.add('hidden'));
    if (statsModal) {
      statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) statsModal.classList.add('hidden');
      });
    }

    // Backup & Restore Modal Trigger
    const backupModal = document.getElementById('backup-modal');
    const openBackupBtn = document.getElementById('open-backup-btn');
    const closeBackupModalBtn = document.getElementById('close-backup-modal-btn');
    const exportBackupBtn = document.getElementById('export-backup-btn');
    const importBackupBtn = document.getElementById('import-backup-btn');
    const importFileInput = document.getElementById('import-file-input');

    if (openBackupBtn) openBackupBtn.addEventListener('click', () => backupModal.classList.remove('hidden'));
    if (closeBackupModalBtn) closeBackupModalBtn.addEventListener('click', () => backupModal.classList.add('hidden'));
    if (backupModal) {
      backupModal.addEventListener('click', (e) => {
        if (e.target === backupModal) backupModal.classList.add('hidden');
      });
    }

    // Export Backup File (Download as JSON)
    if (exportBackupBtn) {
      exportBackupBtn.addEventListener('click', () => {
        try {
          const dataStr = JSON.stringify(appData, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          
          const exportFileDefaultName = `yamyam_health_log_backup_${new Date().toISOString().split('T')[0]}.json`;
          
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        } catch (e) {
          alert('백업 파일 생성을 실패했습니다: ' + e.message);
        }
      });
    }

    // Import Backup File (Upload JSON & Restore)
    if (importBackupBtn && importFileInput) {
      importBackupBtn.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const importedData = JSON.parse(event.target.result);
            
            if (typeof importedData !== 'object' || importedData === null) {
              throw new Error('올바르지 않은 백업 파일 형식입니다.');
            }

            if (confirm('선택한 백업 파일로 기존 데이터를 전부 덮어쓰시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
              appData = importedData;
              
              // Save locally
              localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
              
              // Upload all imported dates to Cloud Firestore
              if (firestoreDb) {
                const batch = firestoreDb.batch();
                Object.entries(appData).forEach(([dateStr, dayData]) => {
                  const docRef = firestoreDb.collection('health_logs').doc(dateStr);
                  batch.set(docRef, dayData);
                });
                batch.commit()
                  .then(() => console.log('All imported database records backed up to cloud.'))
                  .catch(err => console.error('Cloud batch restore failed:', err));
              }

              renderUI();
              backupModal.classList.add('hidden');
              alert('백업 파일로부터 모든 기록이 성공적으로 복구되었습니다! 🎉');
            }
          } catch (err) {
            alert('파일을 불러오는 도중 오류가 발생했습니다: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Goal Setting Modal Listeners
    if (openGoalBtn) openGoalBtn.addEventListener('click', openGoalModal);
    if (calorieGoalTrigger) calorieGoalTrigger.addEventListener('click', openGoalModal);
    if (closeGoalModalBtn) closeGoalModalBtn.addEventListener('click', closeGoalModal);
    if (goalModal) {
      goalModal.addEventListener('click', (e) => {
        if (e.target === goalModal) closeGoalModal();
      });
    }

    // Dynamic BMR & TDEE calculation updates on input change
    if (goalHeightInput) goalHeightInput.addEventListener('input', updateCalculatedCalories);
    if (goalWeightInput) goalWeightInput.addEventListener('input', updateCalculatedCalories);
    if (goalAgeInput) goalAgeInput.addEventListener('input', updateCalculatedCalories);
    if (goalActivitySelect) goalActivitySelect.addEventListener('change', updateCalculatedCalories);
    document.querySelectorAll('input[name="goalGender"]').forEach(r => {
      r.addEventListener('change', updateCalculatedCalories);
    });

    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const calculatedKcal = updateCalculatedCalories();
        saveTargetCalories(calculatedKcal);

        try {
          const genderEl = document.querySelector('input[name="goalGender"]:checked');
          if (genderEl) localStorage.setItem('goal_gender', genderEl.value);
          localStorage.setItem('goal_height', goalHeightInput.value);
          localStorage.setItem('goal_weight', goalWeightInput.value);
          localStorage.setItem('goal_age', goalAgeInput.value);
          localStorage.setItem('goal_activity', goalActivitySelect.value);
        } catch(err) {}

        closeGoalModal();
        alert(`일일 칼로리 목표가 ${calculatedKcal.toLocaleString()} kcal로 설정되었습니다! 🎯`);
      });
    }
    // Reset Data Button Trigger
    const resetDataBtn = document.getElementById('reset-data-btn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('정말 모든 기록을 초기화하시겠습니까?\n저장된 물, 식단, 운동 데이터가 새롭게 리셋됩니다.')) {
          localStorage.removeItem(STORAGE_KEY);
          appData = {};
          fetch(`${API_BASE}/reset`, { method: 'POST' }).catch(() => {});
          renderUI();
          alert('모든 기록이 깨끗하게 초기화되었습니다! ✨');
        }
      });
    }
  }

  // INITIALIZATION
  function init() {
    if (waterTargetCountEl) waterTargetCountEl.textContent = TARGET_WATER_GLASSES;
    if (targetCaloriesText) targetCaloriesText.textContent = targetCalories.toLocaleString();
    if (datePicker) datePicker.value = currentDate;
    updateDateDisplay();
    render8CupsGrid();
    if (menuCardsGrid) renderMenuCards(activeCuisineCategory);
    attachEventListeners();
    renderUI();
    switchViewMode('daily');
  }

  // RUN APP
  init();
  syncBackendData();
});
