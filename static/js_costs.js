function loadCostManagementContent() {
    const managementContainer = document.getElementById('dynamic-content'); // Zakładamy, że jest to kontener na dynamiczną treść
    managementContainer.innerHTML = ''; // Czyszczenie zawartości kontenera

    // Tworzenie struktury HTML dla zarządzania kosztami
    const costContent = `
        <div id="cost-analysis-container">
            <h2>Analiza kosztów</h2>
            <form id="add-cost-form">
                <input type="text" name="category" placeholder="Kategoria" required>
                <input type="number" name="amount" placeholder="Kwota" required>
                <input type="number" name="planbudget" placeholder="Planowany budżet" required>
                <input type="date" name="date" required>
                <textarea name="description" placeholder="Opis"></textarea>
                <button type="submit">Dodaj koszt</button>
            </form>
            <div id="costs-list-container">
                <!-- Tutaj będą wyświetlane koszty -->
            </div>
        </div>
        <div id="budget-comparison">
            <button id="btn-comparison">Wyświetl porównanie budżetów</button>
        </div>
        <div id="efficiency-charts">
            <button id="efficiency-report-btn">Wyświetl efektywność</button>
        </div>
        `;

    managementContainer.innerHTML = costContent; // Dodawanie struktury HTML do kontenera


    const comparisonButton = document.getElementById('btn-comparison');
    if (comparisonButton) {
        comparisonButton.addEventListener('click', loadBudgetComparisonContent);
    }

    const efficiencyButton = document.getElementById('efficiency-report-btn');
    if (efficiencyButton) {
        efficiencyButton.addEventListener('click', loadEfficiencyReportContent);
    }

    // Dodajemy tutaj kod JavaScript odpowiedzialny za obsługę formularza i ładowanie kosztów
    const form = document.getElementById('add-cost-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const costData = {
            category: formData.get('category'),
            amount: formData.get('amount'),
            planbudget: formData.get('planbudget'),
            date: formData.get('date'),
            description: formData.get('description')
        };
        fetch('/api/costs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(costData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            form.reset();
            fetchCosts(); // Odśwież listę kosztów
        })
        .catch(error => console.error('Error:', error));
    });

    function fetchCosts() {
        fetch('/api/costs')
        .then(response => response.json())
        .then(costs => {
            const listContainer = document.getElementById('costs-list-container');
            listContainer.innerHTML = ''; // Czyszczenie listy
            costs.forEach(cost => {
                // Dodawanie każdego kosztu do listy
                listContainer.innerHTML += `<div class="cost-item">${cost.category}: ${cost.amount} zł - ${cost.planbudget} zł - ${cost.date} - ${cost.description}</div>`;
            });
        })
        .catch(error => console.error('Error:', error));
    }

    fetchCosts(); // Początkowe załadowanie listy kosztów
}




function loadBudgetComparisonContent() {
    const managementContainer = document.getElementById('dynamic-content');
    managementContainer.innerHTML = '';
    managementContainer.innerHTML += `
        <div id="budget-comparison-container">
            <h2>Porównanie budżetów</h2>
            <canvas id="budgetComparisonChart"></canvas>
        </div>
    `;

    // Fetch the cost data from the backend
    fetch('/api/costs')
        .then(response => response.json())
        .then(costs => {

            // Prepare the data for the chart
            const labels = costs.map(cost => cost.category);
            const budgetData = costs.map(cost => cost.planbudget);
            const actualData = costs.map(cost => cost.amount);

            // Calculate the difference for the background color
            const backgroundColors = budgetData.map((budget, index) => {
                return actualData[index] > budget ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)'; // red for over budget, green for under
            });

            // Generate the chart
            const canvas = document.getElementById('budgetComparisonChart');
            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Planowany Budżet',
                        data: budgetData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Rzeczywiste Wydatki',
                        data: actualData,
                        backgroundColor: backgroundColors,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {

                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error:', error));
}

function loadEfficiencyReportContent() {
    const managementContainer = document.getElementById('dynamic-content');
    managementContainer.innerHTML = '';
    managementContainer.innerHTML += `
        <div id="efficiency-report-container">
            <h2>Raport efektywności</h2>
            <canvas id="efficiencyChart"></canvas>
        </div>
    `;

    // Teraz, gdy struktura jest gotowa, możemy załadować dane i wygenerować wykres
    fetchEfficiencyData();
}

async function fetchEfficiencyData() {
    try {
        const response = await fetch('/api/efficiency');
        const data = await response.json();
        generateEfficiencyChart(data);
    } catch (error) {
        console.error('Error loading efficiency data:', error);
    }
}

function generateEfficiencyChart(data) {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    const efficiencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.machineName),
            datasets: [{
                label: 'Wykorzystanie maszyn [%]',
                data: data.map(item => item.usagePercentage),
                backgroundColor: 'rgba(75, 192, 235, 0.2)',
                borderColor: 'rgba(75, 192, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}



document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('cost-management-tab').addEventListener('click', loadCostManagementContent);
});
