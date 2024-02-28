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
                <form id="add-performance-indicator-form">
                    <h3>Dodaj nowy wskaźnik wydajności:</h3>
                    <input type="number" id="cycle_time" name="cycle_time" placeholder="Czas cyklu" step="any" required><br><br>
                    <input type="number" id="downtime" name="downtime" placeholder="Czas przestojów" step="any" required><br><br>
                    <input type="number" id="machine_efficiency" name="machine_efficiency" placeholder="Wydajność maszyn" step="any" required><br><br>
                    <input type="number" id="product_quality" name="product_quality" placeholder="Jakość wyrobów" step="any" required><br><br>
                    <button type="submit">Dodaj wskaźnik</button>
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
                managementContainer.appendChild(processesContainer); // Dodanie procesów pod formularze
            })
            .catch(error => console.error('Błąd:', error));

            fetchExistingProcessesAndPerformanceIndicators();
        });
    }
});

function fetchExistingProcessesAndPerformanceIndicators() {
    const managementContainer = document.getElementById('dynamic-content');

    // Wczytanie istniejących procesów
    fetch('/api/process_optimization')
        .then(response => response.json())
        .then(processes => {
            const processesContainer = document.createElement('div');
            processesContainer.id = 'processes-container';
            // Dodawanie procesów do processesContainer...
            managementContainer.appendChild(processesContainer);
        })
        .then(() => {
            // Po wczytaniu wszystkich procesów, dodajemy kontener wskaźników wydajności
            const indicatorsContainer = document.createElement('div');
            indicatorsContainer.id = 'performance-indicators-container';
            managementContainer.appendChild(indicatorsContainer);

            // Wczytywanie wskaźników wydajności
            loadPerformanceIndicators();
        })
        .catch(error => console.error('Błąd:', error));

        const form = document.getElementById('add-performance-indicator-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                cycle_time: parseFloat(form.cycle_time.value),
                downtime: parseFloat(form.downtime.value),
                machine_efficiency: parseFloat(form.machine_efficiency.value),
                product_quality: parseFloat(form.product_quality.value),
            };

            fetch('/api/performance_indicators', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                form.reset();
                // Opcjonalnie: odśwież listę wskaźników wydajności.
            })
            .catch(error => console.error('Error:', error));
        });
}

function loadPerformanceIndicators() {
    console.log("Loading performance indicators...");
    fetch('/api/performance_indicators')
        .then(response => response.json())
        .then(indicators => {
            const indicatorsContainer = document.getElementById('performance-indicators-container');
            indicators.forEach(indicator => {
                const indicatorElement = document.createElement('div');
                indicatorElement.className = 'indicator-card';
                indicatorElement.innerHTML = `
                    <h2>Wskaźnik wydajności</h2>
                    <h3>Data pomiaru: ${indicator.timestamp}</h3>
                    <p>Czas cyklu: ${indicator.cycle_time} godzin</p>
                    <p>Czas przestojów: ${indicator.downtime} godzin</p>
                    <p>Wydajność maszyn: ${indicator.machine_efficiency}%</p>
                    <p>Jakość wyrobów: ${indicator.product_quality}%</p>
                `;
                indicatorsContainer.appendChild(indicatorElement);
            });
        })
        .catch(error => console.error('Error:', error));
}
