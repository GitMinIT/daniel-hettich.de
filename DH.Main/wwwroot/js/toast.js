'use strict'

export class Toast {
    static show(message, type = 'default', duration = 3000) {
        const toast = $('<div></div>').appendTo('body');

        const baseStyles = {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            borderRadius: '8px',
            zIndex: 10000,
            display: 'none',
            fontSize: '14px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Schatten hinzufügen
        };

        const typeStyles = {
            default: {
                backgroundColor: 'rgba(0, 100, 0, 0.75)',
                color: 'white',
            },
            information: {
                backgroundColor: 'rgba(0, 123, 255, 0.75)', // Blau
                color: 'white',
            },
            error: {
                backgroundColor: 'rgba(220, 53, 69, 0.75)', // Rot
                color: 'white',
            }
        };

        toast.css({ ...baseStyles, ...typeStyles[type] }).text(message).fadeIn(400).delay(duration).fadeOut(400, function () {
            $(this).remove();
        });
    }
}
