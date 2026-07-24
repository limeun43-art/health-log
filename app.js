/**
 * 얌얌 & 퐁당 (Health Log) - Core JavaScript Application
 * Easy Category & Representative Menu Selection System (한식, 양식, 중식, 일식, 분식/디저트)
 */

document.addEventListener('DOMContentLoaded', () => {
  // === CONSTANTS & STATE ===
  const STORAGE_KEY = 'health_log_v1';
  const TARGET_WATER_GLASSES = 8; // Target goal: 8 glasses (2.0 Liters)
  const GLASS_VOLUME_LITERS = 0.25; // 1 glass = 250ml

  // Representative Menu Preset Dictionary (한식, 양식, 중식, 일식, 분식/디저트)
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
  let currentFilter = '전체';
  let searchQuery = '';
  let activeCuisineCategory = '한식';
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
  const catBigBtns = document.querySelectorAll('.cat-big-btn');
  const currentCatLabel = document.getElementById('current-cat-label');
  const menuCardsGrid = document.getElementById('menu-cards-grid');

  // Food Tracker Elements
  const foodForm = document.getElementById('food-form');
  const foodNameInput = document.getElementById('food-name-input');
  const foodCalorieInput = document.getElementById('food-calorie-input');
  const totalCaloriesEl = document.getElementById('total-calories');
  const foodListEl = document.getElementById('food-list');
  const foodEmptyState = document.getElementById('food-empty-state');
  const emptyStateTitle = document.getElementById('empty-state-title');
  const emptyStateSub = document.getElementById('empty-state-sub');
  const filterTabs = document.querySelectorAll('.filter-tab');
  
  // Search Bar Elements
  const foodSearchInput = document.getElementById('food-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  // Summary Footer Elements
  const footerWaterPercent = document.getElementById('footer-water-percent');
  const footerMealCount = document.getElementById('footer-meal-count');
  const footerTotalCal = document.getElementById('footer-total-cal');

  // Modal Elements
  const celebrationModal = document.getElementById('celebration-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');

  // === INITIALIZATION ===
  function init() {
    waterTargetCountEl.textContent = TARGET_WATER_GLASSES;
    datePicker.value = currentDate;
    updateDateDisplay();
    render8CupsGrid();
    renderMenuCards(activeCuisineCategory);
    renderUI();
    attachEventListeners();
  }

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

  function saveDataToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }

  function getDayData(dateStr) {
    if (!appData[dateStr]) {
      appData[dateStr] = {
        water: 0,
        celebrated: false,
        foods: []
      };
    }
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
    menuCardsGrid.innerHTML = '';
    
    let flagEmoji = '🇰🇷';
    if (cuisine === '양식') flagEmoji = '🍝';
    if (cuisine === '중식') flagEmoji = '🇨🇳';
    if (cuisine === '일식') flagEmoji = '🍣';
    if (cuisine === '분식/디저트') flagEmoji = '🍰';

    currentCatLabel.textContent = `${flagEmoji} ${cuisine} 대표 메뉴 (클릭하면 자동 입력!)`;

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
        // Auto Populate Food Name & Calorie!
        foodNameInput.value = item.name;
        foodCalorieInput.value = item.cal;

        // Auto Select Cuisine Radio Button
        const radio = document.querySelector(`input[name="cuisineType"][value="${cuisine}"]`);
        if (radio) radio.checked = true;

        // Visual Click Feedback
        btn.classList.add('selected-flash');
        setTimeout(() => btn.classList.remove('selected-flash'), 600);

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

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    }
  }

  // === FOOD TRACKER & SEARCH RENDER & LOGIC ===
  function updateFoodUI() {
    const dayData = getDayData(currentDate);
    const foods = dayData.foods || [];

    const totalCal = foods.reduce((sum, item) => sum + (parseInt(item.calories) || 0), 0);
    totalCaloriesEl.textContent = totalCal.toLocaleString();

    footerMealCount.textContent = `${foods.length}개`;
    footerTotalCal.textContent = `${totalCal.toLocaleString()} kcal`;

    const query = searchQuery.trim().toLowerCase();
    
    const filteredFoods = foods.filter(item => {
      const meal = item.mealType || '아침';
      const cuisine = item.cuisineType || '한식';
      const name = item.name || '';

      let matchesTab = false;
      if (currentFilter === '전체') {
        matchesTab = true;
      } else if (['아침', '점심', '저녁', '간식'].includes(currentFilter)) {
        matchesTab = (meal === currentFilter);
      } else {
        matchesTab = (cuisine === currentFilter);
      }

      let matchesSearch = true;
      if (query) {
        matchesSearch = name.toLowerCase().includes(query) ||
                        cuisine.toLowerCase().includes(query) ||
                        meal.toLowerCase().includes(query);
      }

      return matchesTab && matchesSearch;
    });

    foodListEl.innerHTML = '';

    if (filteredFoods.length === 0) {
      foodEmptyState.classList.remove('hidden');
      if (query) {
        emptyStateTitle.textContent = `'${searchQuery}' 검색 결과가 없어요!`;
        emptyStateSub.textContent = `한식, 양식, 중식, 일식 또는 음식이름으로 검색해보세요 🔍`;
      } else {
        emptyStateTitle.textContent = `아직 입력된 음식 기록이 없어요!`;
        emptyStateSub.textContent = `상단의 메뉴 버튼을 눌러 바로 기록해보세요 😋`;
      }
    } else {
      foodEmptyState.classList.add('hidden');
      
      filteredFoods.forEach(food => {
        const li = document.createElement('li');
        li.className = 'food-item-card';

        let mealTagClass = 'tag-breakfast';
        if (food.mealType === '점심') mealTagClass = 'tag-lunch';
        if (food.mealType === '저녁') mealTagClass = 'tag-dinner';
        if (food.mealType === '간식') mealTagClass = 'tag-snack';

        const cuisine = food.cuisineType || '한식';
        let cuisineTagClass = 'tag-korean';
        let cuisineFlag = '🇰🇷';
        if (cuisine === '양식') { cuisineTagClass = 'tag-western'; cuisineFlag = '🍝'; }
        if (cuisine === '중식') { cuisineTagClass = 'tag-chinese'; cuisineFlag = '🇨🇳'; }
        if (cuisine === '일식') { cuisineTagClass = 'tag-japanese'; cuisineFlag = '🍣'; }
        if (cuisine === '분식/디저트') { cuisineTagClass = 'tag-snack-dessert'; cuisineFlag = '🍰'; }

        const calText = food.calories ? `${food.calories} kcal` : '칼로리 미입력';

        li.innerHTML = `
          <div class="food-info-left">
            <span class="meal-tag-badge ${mealTagClass}">${food.mealType}</span>
            <span class="cuisine-tag-badge ${cuisineTagClass}">${cuisineFlag} ${cuisine}</span>
            <div class="food-details">
              <span class="food-title">${escapeHTML(food.name)}</span>
              <span class="food-cal">${calText}</span>
            </div>
          </div>
          <button class="delete-food-btn" title="삭제하기" data-food-id="${food.id}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        `;

        li.querySelector('.delete-food-btn').addEventListener('click', () => {
          deleteFoodItem(food.id);
        });

        foodListEl.appendChild(li);
      });
    }
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

    updateFoodUI();
  }

  function deleteFoodItem(id) {
    const dayData = getDayData(currentDate);
    dayData.foods = dayData.foods.filter(item => item.id !== id);
    saveDataToStorage();
    updateFoodUI();
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
  }

  // === EVENT LISTENERS ===
  function attachEventListeners() {
    // Date Controls
    prevDateBtn.addEventListener('click', () => changeDateByDays(-1));
    nextDateBtn.addEventListener('click', () => changeDateByDays(1));
    todayBtn.addEventListener('click', () => {
      currentDate = getTodayDateString();
      datePicker.value = currentDate;
      updateDateDisplay();
      renderUI();
    });

    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        updateDateDisplay();
        renderUI();
      }
    });

    // Water Controls
    waterPlusBtn.addEventListener('click', () => addWater(1));
    waterMinusBtn.addEventListener('click', () => addWater(-1));

    // Big Category Selector Buttons (한식, 양식, 중식, 일식, 분식/디저트)
    catBigBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBigBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCuisineCategory = btn.dataset.cuisine;
        renderMenuCards(activeCuisineCategory);
      });
    });

    // Food Form Submit
    foodForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const mealTypeEl = document.querySelector('input[name="mealType"]:checked');
      const cuisineTypeEl = document.querySelector('input[name="cuisineType"]:checked');
      
      const mealType = mealTypeEl ? mealTypeEl.value : '아침';
      const cuisineType = cuisineTypeEl ? cuisineTypeEl.value : activeCuisineCategory;
      const name = foodNameInput.value;
      const calories = foodCalorieInput.value;

      if (name.trim()) {
        addFoodItem(mealType, cuisineType, name, calories);
      }
    });

    // Search Input Listener
    foodSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.trim()) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
      updateFoodUI();
    });

    clearSearchBtn.addEventListener('click', () => {
      foodSearchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      updateFoodUI();
    });

    // Meal & Cuisine Filter Tabs
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        updateFoodUI();
      });
    });

    // Modal Close
    closeModalBtn.addEventListener('click', () => {
      celebrationModal.classList.add('hidden');
    });
    modalConfirmBtn.addEventListener('click', () => {
      celebrationModal.classList.add('hidden');
    });
    celebrationModal.addEventListener('click', (e) => {
      if (e.target === celebrationModal) {
        celebrationModal.classList.add('hidden');
      }
    });
  }

  // Run App
  init();
});
