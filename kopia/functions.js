export function createTableRows(data) {
    const tableBody = document.querySelector("#schedule-table tbody");
    if (!tableBody) return;

    data.forEach(rowData => {
        let row = document.createElement('tr');
        row.onclick = () => toggleRowSelection(row);
        row.innerHTML = `
            <td contenteditable="true">${rowData.employee_name}</td>
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

let isSelectingEnabled = false;

export function toggleCell(cell) {
    if (isSelectingEnabled) {
        cell.classList.toggle('selected');
    }
}

export function enableSelecting() {
    isSelectingEnabled = true;
}

export function addRow() {
    const tableBody = document.querySelector("#schedule-table tbody");
    let row = document.createElement('tr');
    row.innerHTML = `
        <td contenteditable="true">Nowy Pracownik</td>
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
    let data = []; // Tutaj będziesz przechowywać dane z tabeli

    // Iterowanie po wierszach tabeli i zbieranie danych
    for (let row of table.rows) {
        // Pomiń pierwszy wiersz, który zawiera nagłówki
        if (row === table.rows[0]) continue;

        // Zbieranie danych pracownika i stanowiska
        let employeeName = row.cells[0].innerText;
        let position = row.cells[1].innerText;

        // Zbieranie danych o zmianach
        let shiftData = Array.from(row.cells).slice(2).map(cell => cell.classList.contains('selected') ? 'selected' : '');

        // Tworzenie obiektu z danymi wiersza
        let rowData = {
            employee_name: employeeName,
            position: position,
            shift_data: shiftData
        };

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
            createTableRows(data);
            updateTableHeaders();
        })
        .catch(error => console.error('Error:', error));
}

export function toggleRowSelection(row) {
    row.classList.toggle('selected-row');
}
export function deleteSelectedRows() {
    const selectedRows = document.querySelectorAll('.selected-row');
    const idsToDelete = Array.from(selectedRows).map(row => row.dataset.id);

    // Wykonaj żądanie do serwera, aby usunąć zaznaczone wiersze
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
        // Opcjonalnie: odśwież tabelę
    })
    .catch(error => console.error('Error:', error));
}

