'use strict'

import { Toast } from './toast.js';

class Tests {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('btn-default').addEventListener('click', () => {
            this.defaultToast();
        });
        document.getElementById('btn-information').addEventListener('click', () => {
            this.informationToast();
        });
        document.getElementById('btn-error').addEventListener('click', () => {
            this.errorToast();
        });
    }

    defaultToast() {
        Toast.show('Default Toast');
    }

    informationToast() {
        Toast.show('Information Toast', 'information');
    }

    errorToast() {
        Toast.show('Error Toast', 'error');
    }
}

$(document).ready(() => {
    new Tests();
});
