function openNewTabWithContent(htmlContent, chartScript) {
    const newWindow = window.open();
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.write('<script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>');
    newWindow.document.write('<script>' + chartScript + '<\/script>');
    newWindow.document.close();
}

function loadCostManagementContent() {
    const managementContainer = document.getElementById('dynamic-content');
    managementContainer.innerHTML = '';

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

            </div>
        </div>
        <br/><br/><br/>
        <div id="budget-comparison">
            <h2>Porównanie budżetów</h2>
            <button id="btn-comparison">Wyświetl porównanie budżetów</button>
        </div>
        <br/><br/><br/>
        <div id="efficiency-charts">
            <h2>Efektywność</h2>
            <form id="efficiency-form" action="/add_efficiency" method="post">
                <label for="machineName">Nazwa Maszyny:</label>
                <input type="text" id="machineName" name="machineName"><br><br>
                <label for="usagePercentage">Procent Wykorzystania:</label>
                <input type="number" id="usagePercentage" name="usagePercentage" step="0.01"><br><br>
                <label for="measurementDate">Data Pomiaru:</label>
                <input type="datetime-local" id="measurementDate" name="measurementDate"><br><br>
                <input type="submit" id="add-efe" value="Dodaj efektywność">
                <button id="efficiency-report-btn">Wyświetl efektywność</button>
            </form>
        </div>
        <br/><br/><br/>
        <div id="material-consumption">
            <h2>Zużycie materiałów</h2>
                <div id="chartContainer">
                    <form id="consumptionForm">
                        <label for="material_name">Materiał:</label>
                        <input type="text" id="material_name" name="material_name" required><br><br>
                        <label for="consumption_date">Data zużycia:</label>
                        <input type="date" id="consumption_date" name="consumption_date" required><br><br>
                        <label for="quantity_consumed">Zużyta ilość:</label>
                        <input type="number" id="quantity_consumed" name="quantity_consumed" step="0.01" required><br><br>
                        <label for="unit_cost">Koszt jednostkowy:</label>
                        <input type="number" id="unit_cost" name="unit_cost" step="0.01" required><br><br>
                        <button type="submit">Dodaj zużycie</button> <button id="material-consumption-btn">Wyświetl zużycie materiałów</button>
                    </form>
                </div>
        </div>
        `;

    managementContainer.innerHTML = costContent;

    const comparisonButton = document.getElementById('btn-comparison');
    if (comparisonButton) {
        comparisonButton.addEventListener('click', loadBudgetComparisonContent);
    }

    const efficiencyButton = document.getElementById('efficiency-report-btn');
    if (efficiencyButton) {
        efficiencyButton.addEventListener('click', loadEfficiencyReportContent);
    }

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
            fetchCosts();
        })
        .catch(error => console.error('Error:', error));
    });

    const efficiencyForm = document.getElementById('efficiency-form');
    efficiencyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let object = {};
        const formData = new FormData(this);
        formData.forEach((value, key) => {
            object[key] = value;
        });
        let json = JSON.stringify(object);

        fetch('/add_efficiency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            efficiencyForm.reset();
            alert(data.message);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });

    function fetchCosts() {
        fetch('/api/costs')
        .then(response => response.json())
        .then(costs => {
            const listContainer = document.getElementById('costs-list-container');
            listContainer.innerHTML = '';
            costs.forEach(cost => {
                listContainer.innerHTML += `<div class="cost-item">${cost.category}: ${cost.amount}zł, Planowany budżet: ${cost.planbudget}zł, Przedział czasowy do: ${cost.date}, Opis: ${cost.description}</div>`;
            });
        })
        .catch(error => console.error('Error:', error));
    }

    fetchCosts();

    const materialConsumptionBtn = document.getElementById('material-consumption-btn');
    if (materialConsumptionBtn) {
        materialConsumptionBtn.addEventListener('click', function() {
            console.log('Przycisk zużycia materiałów został naciśnięty');
            fetch('/getMaterialConsumption')
                .then(response => response.json())
                .then(data => {
                    const labels = data.map(item => `${item.consumption_date} (${item.material_name})`);
                    const dataQuantity = {
                        label: 'Zużyta ilość',
                        data: data.map(item => item.quantity_consumed),
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    };
                    const dataCost = {
                        label: 'Koszt jednostkowy',
                        data: data.map(item => item.unit_cost),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    };
                    generateMaterialConsumptionChart(labels, [dataQuantity, dataCost]);
                })
                .catch(error => {
                    console.error('Error:', error);
                });

                    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Raport efektywności</title>
            <style>
                canvas {
                    width: 800px;
                    height: 400px;
                }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- Link do Chart.js -->
        </head>
        <body>
            <div id="efficiency-report-container" style="width: 800px; height: 400px;">
                <h2>Raport efektywności</h2>
                <canvas id="efficiencyChart"></canvas>
            </div>
            <script>${chartScript}</script>
        </body>
        </html>
    `;
        });
    }


    const consumptionForm = document.getElementById('consumptionForm');
    consumptionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            material_name: this.material_name.value,
            consumption_date: this.consumption_date.value,
            quantity_consumed: parseFloat(this.quantity_consumed.value),
            unit_cost: parseFloat(this.unit_cost.value),
        };

        fetch('/addMaterialConsumption', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        this.reset();
    });

}

function loadBudgetComparisonContent() {
    const chartScript = `
        fetch('/api/costs')
        .then(response => response.json())
        .then(costs => {
            const labels = costs.map(cost => cost.category);
            const budgetData = costs.map(cost => cost.planbudget);
            const actualData = costs.map(cost => cost.amount);
            const backgroundColors = budgetData.map((budget, index) => actualData[index] > budget ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)');

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
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error:', error));
    `;

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Porównanie Budżetu</title>
        </head>
        <body>
            <div id="budget-comparison-container" style="width: 1200px; height: 600px;">
                <h2>Porównanie budżetów</h2>
                <canvas id="budgetComparisonChart"></canvas>
            </div>
        </body>
        </html>
    `;

    openNewTabWithContent(htmlContent, chartScript);
}

function loadEfficiencyReportContent() {
    const chartScript = `
        fetch('/api/efficiency')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('efficiencyChart').getContext('2d');
            new Chart(ctx, {
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
                    },
                    maintainAspectRatio: false
                }
            });
        })
        .catch(error => console.error('Error:', error));
    `;

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Raport efektywności</title>
            <style>
                canvas {
                    width: 800px;
                    height: 400px;
                }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- Link do Chart.js -->
        </head>
        <body>
            <div id="efficiency-report-container" style="width: 1200px; height: 600px;">
                <h2>Raport efektywności</h2>
                <canvas id="efficiencyChart"></canvas>
            </div>
            <script>${chartScript}</script>
        </body>
        </html>
    `;

    openNewTabWithContent(htmlContent);
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

function generateMaterialConsumptionChart(dataLabels, dataSets) {
    var newWindow = window.open('', '_blank');
    newWindow.document.title = "Material Consumption Chart";

    var canvas = newWindow.document.createElement('canvas');
    canvas.id = 'materialConsumptionChart';
    canvas.width = 50;
    canvas.height = 50;
    newWindow.document.body.innerHTML = '';
    newWindow.document.body.appendChild(canvas);

    var scriptTag = newWindow.document.createElement('script');
    scriptTag.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    newWindow.document.head.appendChild(scriptTag);

    scriptTag.onload = function () {
        var ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataLabels,
                datasets: dataSets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        scaleLabel: {
                            display: true,
                            labelString: material_name + ' (Ilość / Koszt)'
                        }
                    },
                    x: {
                        scaleLabel: {
                            display: true,
                            labelString: 'Data'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Analiza zużycia materiałów dla: ' + material_name
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                maintainAspectRatio: false
            }
        });
    };
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('cost-management-tab').addEventListener('click', loadCostManagementContent);
});
