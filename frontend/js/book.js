let selectedLessonId = null;
let selectedChildId = null;
let childrenData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPublicSchedule();
});

async function loadPublicSchedule() {
    const container = document.getElementById('lessons-container');
    try {
        const lessons = await familyRequest('/lessons');
        
        if (!lessons || lessons.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--gray);">Пока нет доступных занятий</p>';
            return;
        }

        container.innerHTML = lessons.map(l => {
            const free = l.free_places;
            const isFull = free <= 0;
            
            return `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; opacity: ${isFull ? 0.6 : 1};">
                <div>
                    <h3 style="margin: 0 0 5px 0;">${l.title}</h3>
                    <div style="font-size: 14px; color: var(--gray); margin-bottom: 5px;">📅 ${formatDate(l.starts_at)}</div>
                    <div style="font-size: 13px;">Свободных мест: <b>${isFull ? 'Нет' : free}</b></div>
                </div>
                <button class="btn ${isFull ? 'btn-gray' : ''}" 
                        ${isFull ? 'disabled' : ''} 
                        onclick="startBooking(${l.id}, '${l.title}')">
                    ${isFull ? 'Мест нет' : 'Записаться'}
                </button>
            </div>
            `;
        }).join('');
    } catch (e) {
        container.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки: ${e.message}</p>`;
    }
}

async function startBooking(lessonId, title) {
    selectedLessonId = lessonId;
    document.getElementById('book-lesson-info').innerText = `Занятие: ${title}`;
    
    const token = localStorage.getItem("family_token");
    
    if (!token) {
        openModal('modal-public');
        return;
    }

    try {
        childrenData = await familyRequest('/family/children');
        const list = document.getElementById('book-children-list');
        
        if (!childrenData || childrenData.length === 0) {
            list.innerHTML = '<p style="color: red;">У вас нет добавленных детей.</p>';
            return;
        }

        list.innerHTML = childrenData.map(c => `
            <button class="btn ${selectedChildId === c.id ? '' : 'btn-gray'} btn-block" onclick="selectChildForBook(${c.id})">
                ${c.first_name}
            </button>
        `).join('');
        
        if (childrenData.length > 0) selectedChildId = childrenData[0].id;
        
        openModal('modal-book');
    } catch (e) { showToast(e.message, 'error'); }
}

function selectChildForBook(id) {
    selectedChildId = id;
    const buttons = document.querySelectorAll('#book-children-list button');
    buttons.forEach((btn, index) => {
        if (childrenData[index].id === id) {
            btn.classList.remove('btn-gray');
        } else {
            btn.classList.add('btn-gray');
        }
    });
}

async function confirmBooking() {
    if (!selectedChildId) return showToast('Выберите ребенка', 'error');

    try {
        await familyRequest('/family/bookings', {
            method: 'POST',
            body: JSON.stringify({ child_id: selectedChildId, lesson_id: selectedLessonId })
        });
        
        closeModal('modal-book');
        showToast('Ребенок успешно записан!');
        loadPublicSchedule();
        
    } catch (e) {
        showToast(e.message, 'error');
    }
}