document.addEventListener("DOMContentLoaded", function() {
    const processOptimizationTab = document.getElementById('process-optimization-tab');
    if (processOptimizationTab) {
        processOptimizationTab.addEventListener('click', function() {
            const managementContainer = document.getElementById('dynamic-content');
            managementContainer.innerHTML = '<h2>Optymalizacja procesów produkcyjnych</h2>';

            const formHtml = `
                <form id="add-process-form">
                    <h3>Dodaj nowy proces:</h3>
                    <input type="text" id="process_name" name="process_name" placeholder="Nazwa procesu" required><br><br>
                    <textarea id="description" name="description" placeholder="Opis" required></textarea><br><br>
                    <textarea id="improvement_suggestion" name="improvement_suggestion" placeholder="Sugestia ulepszenia" required></textarea><br><br>
                    <textarea id="impact_assessment" name="impact_assessment" placeholder="Ocena wpływu" required></textarea><br><br>
                    <button type="submit">Dodaj proces</button>
                </form>
            `;
            managementContainer.insertAdjacentHTML('afterbegin', formHtml); // Dodaj formularz na początku kontenera

            const addProcessForm = document.getElementById('add-process-form');
            if (addProcessForm) {
                addProcessForm.addEventListener('submit', function(e) {
                    e.preventDefault(); // Zapobieganie domyślnej akcji formularza

                    // Pobranie danych z formularza
                    const formData = {
                        process_name: this.process_name.value,
                        description: this.description.value,
                        improvement_suggestion: this.improvement_suggestion.value,
                        impact_assessment: this.impact_assessment.value,
                    };

                    // Wysyłanie danych do serwera
                    fetch('/api/process_optimization', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(formData),
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message); // Powiadomienie użytkownika o wyniku
                        this.reset(); // Czyszczenie formularza po pomyślnym dodaniu
                        // Opcjonalnie odśwież listę procesów
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                });
            }

            // Tutaj dodaj kod do wczytywania istniejących procesów
            fetch('/api/process_optimization')
            .then(response => response.json())
            .then(processes => {
                const processesContainer = document.createElement('div');
                processesContainer.id = 'processes-container';

                processes.forEach(process => {
                    const processCard = document.createElement('div');
                    processCard.className = 'process-card';
                    processCard.innerHTML = `
                        <h3>${process.process_name}</h3>
                        <p>${process.description}</p>
                        <p>Sugestia ulepszenia: ${process.improvement_suggestion}</p>
                        <p>Ocena wpływu: ${process.impact_assessment}</p>
                        <p>Ostatnia aktualizacja: ${process.updated_at}</p><br>
                    `;
                    processesContainer.appendChild(processCard);
                });
                managementContainer.appendChild(processesContainer); // Dodanie procesów pod formularzem
            })
            .catch(error => console.error('Błąd:', error));
        });
    }
});
