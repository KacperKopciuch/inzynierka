console.log("External script loaded");
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#production-planning-form form');

    if (form) {
        form.addEventListener('submit', function(event) {
            console.log("Form submit event captured");
            event.preventDefault();
            const formData = new FormData(form);

            fetch('/api/submit-production-plan', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert(data.message);
            })
            .catch(error => {
                console.error('Error:', error);
            });

            form.reset();
        });
    } else {
        console.log("Form not found");
    }
});
