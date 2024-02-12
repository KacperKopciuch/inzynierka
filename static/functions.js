export function createTableRows(data) {
    const tableBody = document.querySelector("#schedule-table tbody");
    if (!tableBody) return;

    data.forEach(rowData => {
        let row = document.createElement('tr');
        row.onclick = () => toggleRowSelection(row);

        let select = "";
        employees.forEach((element)=>{
            select += `<option value="${element.id}" ${element.id == rowData.employee.id ? "selected": ""}>id.${element.id} ${element.username}</option>`;
        });
        row.innerHTML = `
            <td contenteditable="true">
                <form>
                    <select name="employees" id="employees">
                        <option value="">--Please choose an option--</option>
                        ${select}
                    </select>
                    ${rowData.employee.id} ${rowData.employee.name}
                </form>
            </td>
            <td contenteditable="true">${rowData.position}</td>
        `;


        rowData.shift_data.forEach(shift => {
            // Tworzenie komórki
            let cell = document.createElement('td');
            cell.contentEditable = "true";
            cell.className = shift === 'selected' ? 'selected' : '';
            cell.addEventListener('click', function() {
                toggleCell(cell);
            });

            // Dodanie komórki do wiersza
            row.appendChild(cell);
        });

        // Dodanie wiersza do ciała tabeli
        tableBody.appendChild(row);
    });
}

export function getWeekDates() {
    let current = new Date(); // Bieżąca data
    let weekStart = new Date(current.setDate(current.getDate() - current.getDay() + 1)); // Ustawienie na poniedziałek
    let dates = [];

    for (let i = 0; i < 7; i++) {
        let day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        dates.push(day.toLocaleDateString());
    }

    return dates;
}

export function updateTableHeaders() {
    let dates = getWeekDates();
    for (let i = 1; i <= 7; i++) {
        document.getElementById(`date-${i}`).innerText = dates[i - 1];
    }
}

export function toggleCell(cell) {
    cell.classList.toggle('selected');
}

export function addRow() {
    const tableBody = document.querySelector("#schedule-table tbody");
    let row = document.createElement('tr');

    let select
    employees.forEach((element)=>{
        select += `<option value="${element.id}">id.${element.id} ${element.username}</option>`;
    })

    row.innerHTML = `
        <td contenteditable="true">
        <form>
            <select name="employees" id="employees">
                <option value="">--Please choose an option--</option>
                ${select}
            </select>
        </form></td>

        <td contenteditable="true">Nowe Stanowisko</td>
    `;
    for (let j = 0; j < 7; j++) { // Dla każdego dnia tygodnia
        row.innerHTML += `
            <td contenteditable="true" onclick="toggleCell(this)"></td>
            <td contenteditable="true" onclick="toggleCell(this)"></td>
            <td contenteditable="true" onclick="toggleCell(this)"></td>
        `;
    }
    tableBody.appendChild(row);
}

export function saveTableData() {
    let table = document.getElementById('schedule-table');
    let data = []; // Przechowuje dane z tabeli

    // Iterowanie po wierszach tabeli i zbieranie danych (zaczynając od pierwszego wiersza danych, a nie nagłówka)
    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        console.log(row)
        // Pomiń wiersze, które są puste (na przykład wiersze z pustymi komórkami pracownika i stanowiska)
        if (row.cells[0].innerText.trim() === '' && row.cells[1].innerText.trim() === '') {
            continue;
        }
        console.log(row)

        let selectElement = row.cells[0].querySelector("select");
        let selectedValue = selectElement ? selectElement.value : null;

        let rowData = {
        employee_id: selectedValue,
        position: row.cells[1].innerText,
        shift_data: Array.from(row.cells).slice(2).map(cell => cell.classList.contains('selected') ? 'selected' : '')
    };

        console.log(rowData)
        data.push(rowData);
    }

    // Wyślij dane na serwer
    fetch('/save_table', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

export function generateTableHeader() {
    let headerRow1 = '<tr><th>Pracownik</th><th>Stanowisko</th>';
    let headerRow2 = '<tr><th></th><th></th>';

    for (let i = 1; i <= 7; i++) {
        headerRow1 += `<th id="date-${i}" colspan="3">Data ${i}</th>`;
        headerRow2 += '<th>Zmiana 1</th><th>Zmiana 2</th><th>Zmiana 3</th>';
    }

    headerRow1 += '</tr>';
    headerRow2 += '</tr>';

    return `<thead>${headerRow1}${headerRow2}</thead>`;
}

export function addEventListeners() {
    const addButton = document.getElementById('add-row-button');
    const saveButton = document.getElementById('save-data-button');

    if(addButton) {
        addButton.addEventListener('click', addRow);
    }
    if(saveButton) {
        saveButton.addEventListener('click', saveTableData);
    }
}

export function fetchAndFillTable() {
    fetch('/get_table_data')
        .then(response => response.json())
        .then(data => {
        console.log(data)
            createTableRows(data);
            updateTableHeaders();
        })
        .catch(error => console.error('Error:', error));
}

export function deleteSelectedRows() {
    const selectedRows = document.querySelectorAll('.selected-row');
    const idsToDelete = Array.from(selectedRows).map(row => row.dataset.id);

    // Tu możesz dodać kod do wysłania żądania do serwera, aby usunąć wiersze z bazy danych
    // Przykład:
    fetch('/delete_rows', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: idsToDelete }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Opcjonalnie: odśwież tabelę lub usuń wiersze z front-endu
    })
    .catch(error => console.error('Error:', error));

    // Usuń zaznaczone wiersze z front-endu
    selectedRows.forEach(row => row.remove());
}

let isSelectingEnabled = false;

export function toggleRowSelection(row) {
    if (isSelectingEnabled) {
        row.classList.toggle('selected-row');
    }
}

export function enableSelecting() {
    isSelectingEnabled = !isSelectingEnabled;
    document.getElementById('select-row-button').innerText = isSelectingEnabled ? 'Zakończ wybieranie' : 'Wybierz wiersz';
}

let employees

export function fetchEmployees() {
    fetch('/fetch_employees')
        .then(response => response.json())
        .then(data => {
        employees = data
        console.log(employees)
        })
        .catch(error => console.error('Error:', error));
}

export function fetchAndDisplayOrders() {
    fetch('/api/get-orders')
    .then(response => response.json())
    .then(orders => {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            const percentage = (order.completed_quantity / order.quantity) * 100;
            orderElement.innerHTML = `
                <div class="order-details">
                    <p>Produkt ID: <span class="order-detail">${order.product_id}</span></p>
                    <p>Ilość: <span class="order-detail">${order.quantity}</span></p>
                    <p>Termin: <span class="order-detail">${order.deadline}</span></p>
                    <p>Ilość wykonana: <span class="order-detail" id="completed-quantity-${order.id}">${order.completed_quantity}</span></p>
                    <button onclick="editQuantity(${order.id})">Edytuj ilość</button>
                    <button onclick="deleteOrder(${order.id})">Usuń zamówienie</button>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%;"></div>
                    <div class="progress-percentage">${percentage.toFixed(2)}%</div>
                </div>
            `;
            ordersList.appendChild(orderElement);
        });
    });
}

export function editQuantity(orderId) {
    const newQuantity = prompt("Podaj nową ilość wykonaną:");
    if (newQuantity !== null) {
        fetch(`/api/edit-order/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({completed_quantity: newQuantity})
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById(`completed-quantity-${orderId}`).textContent = newQuantity;
            alert(data.message);
        })
        .catch(error => console.error('Error:', error));
    }
}

export function deleteOrder(orderId) {
    fetch(`/api/delete-order/${orderId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        // Opcjonalnie: odśwież listę zamówień po usunięciu
        fetchAndDisplayOrders();
    })
    .catch(error => console.error('Error:', error));
}
