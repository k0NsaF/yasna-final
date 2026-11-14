let currentChildId = null;
let childrenData = [];

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        localStorage.setItem("family_token", token);
        // Очищаем URL для безопасности
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!localStorage.getItem("family_token")) {
        alert("Доступ запрещен. Перейдите по персональной ссылке.");
        window.location.href = "index.html";
        return;
    }

    await loadFamilyData();
});

async function loadFamilyData() {
    try {
        // 1. Информация о семье
        const family = await familyRequest('/family/me');
        document.getElementById('family-title').innerText = family.name || 'Личный кабинет';
        
        // 2. Дети
        childrenData = await familyRequest('/family/children');
        renderChildrenTabs();

        // 3. Баланс
        try {
            const balance = await familyRequest('/family/subscriptions/balance');
            document.getElementById('balance-lessons').innerText = balance.remaining_lessons || 0;
            document.getElementById('balance-money').innerText = formatMoney(balance.money_balance || 0);
        } catch (e) { 
            console.log("Баланс пока не грузится", e); 
        }

        // 4. Занятия
        loadUpcomingLessons();
        
    } catch (err) {
        showToast("Ошибка загрузки данных: " + err.message, 'error');
    }
}

function renderChildrenTabs() {
    const container = document.getElementById('children-tabs');
    if (!childrenData || childrenData.length === 0) {
        container.innerHTML = '<span style="color:var(--gray)">Нет добавленных детей</span>';
        return;
    }
    
    container.innerHTML = childrenData.map(child => `
        <button class="btn ${currentChildId === child.id || (!currentChildId && childrenData[0].id === child.id) ? '' : 'btn-gray'}" 
                style="padding: 8px 16px; font-size: 14px;"
                onclick="selectChild(${child.id})">
            ${child.first_name}
        </button>
    `).join('');
    
    if (!currentChildId && childrenData.length > 0) {
        currentChildId = childrenData[0].id;
    }
}

function selectChild(id) {
    currentChildId = id;
    renderChildrenTabs();
}

async function loadUpcomingLessons() {
    try {
        const lessons = await familyRequest('/lessons');
        const container = document.getElementById('upcoming-lessons');
        
        if (!lessons || lessons.length === 0) {
            container.innerHTML = '<p style="color: var(--gray);">Нет доступных занятий</p>';
            return;
        }

        container.innerHTML = lessons.map(l => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F9FAFB; border-radius: 10px;">
                <div>
                    <div style="font-weight: bold;">${l.title}</div>
                    <div style="font-size: 13px; color: var(--gray);">${formatDate(l.starts_at)}</div>
                </div>
                <div style="font-size: 13px;">Свободно: <b>${l.free_places}</b></div>
            </div>
        `).join('');
    } catch (e) { 
        console.error("Не удалось загрузить занятия", e); 
    }
}

async function loadHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '<p style="color: var(--gray);">История загрузки чеков появится позже</p>';
}