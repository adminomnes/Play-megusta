export const toast = {
    show(message, type = 'success') {
        const container = document.getElementById('toast-container') || this._createContainer();
        const notification = document.createElement('div');
        notification.className = `toast-item ${type}`;
        notification.innerHTML = `
            <div class="toast-content">${message}</div>
            <div class="toast-progress"></div>
        `;
        container.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    },

    _createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}
