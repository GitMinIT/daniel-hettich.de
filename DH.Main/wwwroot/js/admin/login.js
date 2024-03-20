'use strict';

import { Toast } from '../toast.js';

class Login {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        $('#login-form').on('submit', (e) => {
            e.preventDefault();
            this.login();
        });
    }

    login() {
        const username = $('#login-form input[name="username"]').val();
        const password = $('#login-form input[name="password"]').val();

        $.ajax({
            url: '/api/admin/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: () => {
                window.location.href = '/admin/index';
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText, status, error);
                Toast.show(xhr.responseText, 'error');
            }
        });
    }
}

$(function () {
    new Login();
});