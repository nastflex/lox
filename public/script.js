document.addEventListener('DOMContentLoaded', () => {
    const handleFormSubmit = (form, url, redirectUrl) => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            fetch(url, {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = redirectUrl || (data.role === 'admin' ? 'admin_panel.html' : 'claims.html');
                } else {
                    document.getElementById('errorMessage').innerText = data.message;
                }
            });
        });
    };

    const loginForm = document.getElementById('loginForm');
    if (loginForm) handleFormSubmit(loginForm, '/login');

    const registerForm = document.getElementById('registerForm');
    if (registerForm) handleFormSubmit(registerForm, '/register', 'index.html');

    const claimForm = document.getElementById('claimForm');
    if (claimForm) handleFormSubmit(claimForm, '/new_claim', 'claims.html');

    const loadClaims = (url, containerId, renderClaim) => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById(containerId);
                data.claims.forEach(renderClaim(container));
            });
    };

    if (window.location.pathname === '/claims.html') {
        loadClaims('/claims', 'claimsList', container => claim => {
            container.innerHTML += `
                <p>Номер автомобиля: ${claim.car_number}</p>
                <p>Описание: ${claim.description}</p>
                <p>Статус: ${claim.status}</p>
            `;
        });
    }

    if (window.location.pathname === '/admin_panel.html') {
        loadClaims('/admin/claims', 'adminClaimsList', container => claim => {
            const claimItem = document.createElement('div');
            claimItem.classList.add('claim-item');
            claimItem.setAttribute('data-id', claim.id);
            claimItem.innerHTML = `
                <p>ФИО: ${claim.user_name}</p>
                <p>Номер автомобиля: ${claim.car_number}</p>
                <p>Описание: ${claim.description}</p>
                <p>Статус: ${claim.status}</p>
                <button onclick="updateClaimStatus(${claim.id}, 'confirmed')">Подтвердить</button>
                <button onclick="updateClaimStatus(${claim.id}, 'rejected')">Отклонить</button>
            `;
            container.appendChild(claimItem);
        });
    }
});

const updateClaimStatus = (id, status) => {
    console.log(`Updating claim ${id} to status ${status}`); // Debug output
    fetch('/admin/update_claim', {
        method: 'POST',
        body: JSON.stringify({ id, status }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const claimItem = document.querySelector(`.claim-item[data-id="${id}"]`);
            if (claimItem) {
                claimItem.innerHTML += `<p>Статус обновлен на: ${status}</p>`;
                setTimeout(() => claimItem.remove(), 3000);
            }
        } else {
            console.error('Failed to update claim status', data);
        }
    })
    .catch(err => {
        console.error('Error updating claim status', err);
    });
};
