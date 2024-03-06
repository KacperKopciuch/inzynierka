document.addEventListener("DOMContentLoaded", function() {
    const processOptimizationTab = document.getElementById('process-optimization-tab');
    if (processOptimizationTab) {
        processOptimizationTab.addEventListener('click', function() {
            const managementContainer = document.getElementById('dynamic-content');
            managementContainer.innerHTML = '';

            const formHtml = `
                <form id="add-process-form">
                    <h3>Dodaj nowy proces:</h3>
                    <input type="text" id="process_name" name="process_name" placeholder="Nazwa procesu" required><br><br>
                    <textarea id="description" name="description" placeholder="Opis" required></textarea><br><br>
                    <textarea id="improvement_suggestion" name="improvement_suggestion" placeholder="Sugestia ulepszenia" required></textarea><br><br>
                    <textarea id="impact_assessment" name="impact_assessment" placeholder="Ocena wpływu" required></textarea><br><br>
                    <button type="submit">Dodaj proces</button>
                </form>
                <button id="show-optimization">Pokaż Optymalizację Procesów</button><br><br><br>
                <div id="optimization-container" style="display:none;"></div>

                <form id="add-performance-indicator-form">
                    <h3>Dodaj nowy wskaźnik wydajności:</h3>
                    <input type="number" id="cycle_time" name="cycle_time" placeholder="Czas cyklu" step="any" required><br><br>
                    <input type="number" id="downtime" name="downtime" placeholder="Czas przestojów" step="any" required><br><br>
                    <input type="number" id="machine_efficiency" name="machine_efficiency" placeholder="Wydajność maszyn" step="any" required><br><br>
                    <input type="number" id="product_quality" name="product_quality" placeholder="Jakość wyrobów" step="any" required><br><br>
                    <button type="submit">Dodaj wskaźnik</button>
                </form>
                <button id="show-performance">Pokaż Wskaźniki Wydajności</button><br><br><br>
                <div id="performance-indicators-container" style="display:none;"></div>
            `;
            managementContainer.insertAdjacentHTML('afterbegin', formHtml);
            setupFormListeners();
        });
    }

    function setupFormListeners() {
        const addProcessForm = document.getElementById('add-process-form');
        const addPerformanceForm = document.getElementById('add-performance-indicator-form');
        const showOptimizationButton = document.getElementById('show-optimization');
        const showPerformanceButton = document.getElementById('show-performance');

        if (addProcessForm) {
            addProcessForm.addEventListener('submit', handleProcessFormSubmit);
        }

        if (addPerformanceForm) {
            addPerformanceForm.addEventListener('submit', handlePerformanceFormSubmit);
        }

        if (showOptimizationButton) {
            showOptimizationButton.addEventListener('click', function() {
                const optimizationContainer = document.getElementById('optimization-container');
                optimizationContainer.style.display = optimizationContainer.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (showPerformanceButton) {
            showPerformanceButton.addEventListener('click', function() {
                const performanceContainer = document.getElementById('performance-indicators-container');
                performanceContainer.style.display = performanceContainer.style.display === 'none' ? 'block' : 'none';
                if (performanceContainer.style.display === 'block') {
                    loadPerformanceIndicators();
                }
            });
        }
    }


    function handleProcessFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = {
            process_name: form.process_name.value,
            description: form.description.value,
            improvement_suggestion: form.improvement_suggestion.value,
            impact_assessment: form.impact_assessment.value,
        };

        fetch('/api/process_optimization', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            form.reset();
            fetchExistingProcesses();
        })
        .catch(error => console.error('Error:', error));
    }

    function handlePerformanceFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = {
            cycle_time: parseFloat(form.cycle_time.value),
            downtime: parseFloat(form.downtime.value),
            machine_efficiency: parseFloat(form.machine_efficiency.value),
            product_quality: parseFloat(form.product_quality.value),
        };

        fetch('/api/performance_indicators', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            form.reset();
            loadPerformanceIndicators();
        })
        .catch(error => console.error('Error:', error));
    }

    function fetchExistingProcesses() {
        const optimizationContainer = document.getElementById('optimization-container');
        optimizationContainer.innerHTML = '';

        fetch('/api/process_optimization')
            .then(response => response.json())
            .then(processes => {
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
                    optimizationContainer.appendChild(processCard);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function loadPerformanceIndicators() {
        const indicatorsContainer = document.getElementById('performance-indicators-container');
        indicatorsContainer.innerHTML = '';

        fetch('/api/performance_indicators')
            .then(response => response.json())
            .then(indicators => {
                indicators.forEach(indicator => {
                    const indicatorElement = document.createElement('div');
                    indicatorElement.className = 'indicator-card';
                    indicatorElement.innerHTML = `
                        <h3>Data pomiaru: ${indicator.timestamp}</h3>
                        <p>Czas cyklu: ${indicator.cycle_time} godzin</p>
                        <p>Czas przestojów: ${indicator.downtime} godzin</p>
                        <p>Wydajność maszyn: ${indicator.machine_efficiency}%</p>
                        <p>Jakość wyrobów: ${indicator.product_quality}%</p><br>
                    `;
                    indicatorsContainer.appendChild(indicatorElement);
                });
            })
            .catch(error => console.error('Error:', error));
    }

});
