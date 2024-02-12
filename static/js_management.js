// Import funkcji z zewnętrznego pliku JavaScript
import {
    createTableRows,
    getWeekDates,
    updateTableHeaders,
    toggleCell,
    fetchEmployees,
    addRow,
    saveTableData,
    generateTableHeader,
    addEventListeners,
    fetchAndFillTable,
    deleteSelectedRows,
    toggleRowSelection,
    enableSelecting
} from './functions.js';

// Przypisanie globalne funkcji do obiektu window
window.toggleCell = toggleCell;

// Główny blok kodu uruchamiany po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_table_data')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            createTableRows(data);
            fetchEmployees();
        })
        .catch(error => console.error('Error:', error));

    // Przypisanie zdarzenia do przycisku usuwania wierszy
    const deleteRowButton = document.getElementById('delete-row-button');
    if (deleteRowButton) {
        deleteRowButton.addEventListener('click', deleteSelectedRows);
    }
});

// Dodanie zdarzenia do przycisku planowania
document.getElementById('planning-button').addEventListener('click', function() {
    fetch('/api/production-planning')
        .then(response => response.text())
        .then(data => {
            document.getElementById('dynamic-content').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});

// Dodanie zdarzenia do przycisku wylogowania
document.getElementById('logout-button').addEventListener('click', function() {
    fetch('/logout', {
        method: 'POST'
    }).then(response => {
        window.location.href = '/login'; // Przekierowanie do strony logowania
    }).catch(error => console.error('Error:', error));
});

// Zarządzanie personelem i manipulacja zawartością dynamiczną
document.getElementById('manage-personnel').addEventListener('click', function() {
    var container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <style>
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .editable, .selected, .selected-row {
                background-color: #fff;
            }
            .selected {
                background-color: #007bff; /* Niebieski kolor */
                color: white; /* Biały tekst dla lepszej czytelności */
            }
            .selected-row {
                background-color: #add8e6; /* Jasnoniebieski kolor dla zaznaczonych wierszy */
            }
        </style>
        <table id="schedule-table">
            ${generateTableHeader()}
            <tbody>
            </tbody>
        </table>
        <button id="add-row-button">Dodaj wiersz</button>
        <button id="save-data-button">Zapisz</button>
        <button id="select-row-button">Wybierz wiersz</button>
        <button id="delete-row-button">Usuń wiersz</button>
    `;

    // Aktualizacja nagłówków i dodanie obsługi zdarzeń
    updateTableHeaders();
    addEventListeners();
    fetchAndFillTable();

    // Dodanie zdarzeń dla nowych przycisków
    document.getElementById('add-row-button').addEventListener('click', addRow);
    document.getElementById('save-data-button').addEventListener('click', saveTableData);
    document.getElementById('select-row-button').addEventListener('click', enableSelecting);
    document.getElementById('delete-row-button').addEventListener('click', deleteSelectedRows);
});
