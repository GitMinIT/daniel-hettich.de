'use strict';

import { Toast } from '../toast.js';

class Logout {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        $('#btn-logout').on('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    logout() {
        $.ajax({
            url: '/api/admin/logout',
            type: 'POST',
            success: () => {
                window.location.href = '/admin/login';
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText, status, error);
                Toast.show(xhr.responseText, 'error');
            }
        });
    }
}

$(function () {
    new Logout();
});