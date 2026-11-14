document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function switchTab(tabId) {
    document.querySelectorAll('section[id^="tab-"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.style.color = 'var(--gray)';
        el.style.borderBottom = 'none';
    });

    document.getElementById(`tab-${tabId}`).style.display = 'block';
    const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    activeBtn.style.color = 'var(--dark)';
    activeBtn.style.borderBottom = '3px solid var(--yellow)';

    if (tabId === 'schedule') loadSchedule();
    if (tabId === 'attendance') loadAttendance();
    if (tabId === 'families') loadFamilies();
    if (tabId === 'finance') loadFinance();
}

async function loadSchedule() {
    try {
        const lessons = await masterRequest('/master/lessons');
        const tbody = document.getElementById('schedule-list');
        if (!lessons || lessons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Нет созданных занятий</td></tr>';
            return;
        }
        tbody.innerHTML = lessons.map(l => `
            <tr>
                <td>${formatDate(l.starts_at)}</td>
                <td>${l.title}</td>
                <td>${l.booked_count} / ${l.capacity}</td>
                <td><button type="button" class="btn" style="padding: 6px 12px; font-size: 13px;">Изменить</button></td>
            </tr>
        `).join('');
    } catch (e) { showToast(e.message, 'error'); }
}

async function createLesson(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('lesson-title').value,
        starts_at: document.getElementById('lesson-date').value,
        capacity: parseInt(document.getElementById('lesson-capacity').value)
    };
    try {
        await masterRequest('/master/lessons', { method: 'POST', body: JSON.stringify(data) });
        closeModal('modal-create-lesson');
        showToast('Занятие создано');
        loadSchedule();
    } catch (err) { showToast(err.message, 'error'); }
}

async function loadAttendance() {
    document.getElementById('attendance-list').innerHTML = '<tr><td colspan="4" style="text-align:center;">В разработке</td></tr>';
}

async function loadFamilies() {
    try {
        const families = await masterRequest('/master/families');
        const tbody = document.getElementById('families-list');
        if (!families || families.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Нет созданных семей</td></tr>';
            return;
        }
        
        // Кнопка теперь просто ведет в Swagger, не вызывая перезагрузку страницы
        tbody.innerHTML = families.map(f => `
            <tr>
                <td>${f.name}</td>
                <td>Есть</td> 
                <td>
                    <a href="http://127.0.0.1:8000/docs#/Мастер/create_family_link_api_master_families__family_id__link_post" target="_blank" class="btn" style="padding: 6px 12px; font-size: 13px; text-decoration: none; display: inline-block;">Получить ссылку</a>
                </td>
            </tr>
        `).join('');
    } catch (e) { showToast(e.message, 'error'); }
}

async function createFamily(e) {
    e.preventDefault();
    try {
        const familyData = {
            name: document.getElementById('family-name').value,
            phone: document.getElementById('family-phone').value
        };
        const familyRes = await masterRequest('/master/families', { method: 'POST', body: JSON.stringify(familyData) });
        const childData = {
            first_name: document.getElementById('child-name').value,
            last_name: document.getElementById('child-lastname').value,
            birth_date: document.getElementById('child-birthdate').value
        };
        await masterRequest(`/master/families/${familyRes.id}/children`, { method: 'POST', body: JSON.stringify(childData) });
        closeModal('modal-create-family');
        showToast('Семья создана');
        loadFamilies();
    } catch (err) { showToast(err.message, 'error'); }
}

async function loadFinance() {
    document.getElementById('finance-list').innerHTML = '<tr><td colspan="4" style="text-align:center;">В разработке</td></tr>';
}