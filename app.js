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
  const TARGET_CALORIES = 2000; // Target goal: 2000 kcal

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
  const trendBarsContainer = document.getElementById('trend-bars-container');
  const statTopFoodsEl = document.getElementById('stat-top-foods');
  const statHistoryListEl = document.getElementById('stat-history-list');

  // === DATA STORAGE HELPERS ===
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
    try {
      const res = await fetch(`${API_BASE}/logs`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          appData = { ...appData, ...json.data };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
          renderUI();
        }
      }
    } catch (e) {
      console.log('Backend API server offline, using local storage.');
    }
  }

  function saveDataToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      const dayData = getDayData(currentDate);
      fetch(`${API_BASE}/logs/${currentDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dayData)
      }).catch(err => console.log('Backend sync offline'));
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
    if (targetCaloriesText) targetCaloriesText.textContent = TARGET_CALORIES.toLocaleString();

    const calPercent = Math.round((totalCal / TARGET_CALORIES) * 100);
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
    const newItem = {
      id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      mealType: mealType,
      cuisineType: cuisineType || '한식',
      name: name.trim(),
      calories: calories ? parseInt(calories) : 0,
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

      const isTripleDone = (waterCount >= TARGET_WATER_GLASSES) && (foodCount > 0) && (exCount > 0);

      cell.innerHTML = `
        <span class="cell-day-num">${dayNum}</span>
        <div class="cell-icons-row">
          ${waterCount > 0 ? `<span title="물 ${waterCount}잔">💧${waterCount}</span>` : ''}
          ${foodCount > 0 ? `<span title="식단 ${foodCount}개">🍲${foodCount}</span>` : ''}
          ${exCount > 0 ? `<span title="운동 ${exCount}개">💪${exCount}</span>` : ''}
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
    let statsData = null;
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) statsData = json.data;
      }
    } catch (e) {
      console.log('Backend stats API offline, compiling local stats');
    }

    if (!statsData) {
      statsData = computeLocalStats();
    }

    renderStatsUI(statsData);
    if (statsModal) statsModal.classList.remove('hidden');
  }

  function computeLocalStats() {
    const dates = Object.keys(appData).sort();
    const totalDays = dates.length;
    if (totalDays === 0) {
      return { totalDays: 0, avgWater: 0, avgCalories: 0, topFoods: [], recent7Days: [] };
    }

    let totalWater = 0;
    let totalCal = 0;
    const foodMap = {};

    dates.forEach(d => {
      const day = appData[d];
      totalWater += (day.water || 0);
      (day.foods || []).forEach(f => {
        totalCal += (parseInt(f.calories) || 0);
        const name = (f.name || '').trim();
        if (name) foodMap[name] = (foodMap[name] || 0) + 1;
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
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${weekdays[dateObj.getDay()]})`;
      recent7Days.push({ dateStr, label, water, calories });
    }

    return {
      totalDays,
      avgWater: (totalWater / totalDays).toFixed(1),
      avgCalories: Math.round(totalCal / totalDays),
      topFoods,
      recent7Days
    };
  }

  function renderStatsUI(stats) {
    if (statTotalDaysEl) statTotalDaysEl.textContent = stats.totalDays;
    if (statAvgWaterEl) statAvgWaterEl.textContent = `${stats.avgWater}잔`;
    if (statAvgCalEl) statAvgCalEl.textContent = `${stats.avgCalories.toLocaleString()} kcal`;

    if (trendBarsContainer && Array.isArray(stats.recent7Days)) {
      trendBarsContainer.innerHTML = '';
      stats.recent7Days.forEach(item => {
        const col = document.createElement('div');
        col.className = 'trend-col-item';

        const waterHeightPct = Math.min(100, Math.round((item.water / TARGET_WATER_GLASSES) * 100));
        const calHeightPct = Math.min(100, Math.round((item.calories / TARGET_CALORIES) * 100));

        col.innerHTML = `
          <div class="trend-bars-pair">
            <div class="trend-bar-water" style="height: ${Math.max(4, waterHeightPct)}%;" title="${item.water}잔"></div>
            <div class="trend-bar-cal" style="height: ${Math.max(4, calHeightPct)}%;" title="${item.calories} kcal"></div>
          </div>
          <span class="trend-col-label">${item.label}</span>
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

          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'history-date-btn';
          btn.innerHTML = `
            <span>📅 ${formatKoreanDate(dStr)}</span>
            <span>💧 ${day.water || 0}잔 | 🍲 ${cal} kcal</span>
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
    if (targetCaloriesText) targetCaloriesText.textContent = TARGET_CALORIES.toLocaleString();
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
