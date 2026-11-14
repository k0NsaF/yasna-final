const API_URL = "http://localhost:8000/api";
const USE_MOCK = false;

async function apiRequest(path, options = {}) {
    const response = await fetch(API_URL + path, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Ошибка запроса");
    return data;
}

async function masterRequest(path, options = {}) {
    const token = localStorage.getItem("master_token");
    return apiRequest(path, {
        ...options,
        headers: { ...options.headers, "Authorization": `Bearer ${token}` }
    });
}

async function familyRequest(path, options = {}) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || localStorage.getItem("family_token");
    
    // Сохраняем токен, если он пришел в ссылке
    if (urlParams.get('token')) {
        localStorage.setItem("family_token", urlParams.get('token'));
    }

    return apiRequest(path, {
        ...options,
        headers: { 
            ...options.headers, 
            "Authorization": token ? `Bearer ${token}` : "" 
        }
    });
}

async function uploadReceipt(formData) {
    const token = localStorage.getItem("master_token");
    const response = await fetch(API_URL + "/master/receipts", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });
    if (!response.ok) throw new Error("Ошибка загрузки чека");
    return response.json();
}