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
    enableSelecting,
    fetchAndDisplayOrders,
    editQuantity,
    deleteOrder
} from './functions.js';

window.toggleCell = toggleCell;
window.editQuantity = editQuantity;
window.deleteOrder = deleteOrder;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_table_data')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            createTableRows(data);
            fetchEmployees();
        })
        .catch(error => console.error('Error:', error));

    const deleteRowButton = document.getElementById('delete-row-button');
    if (deleteRowButton) {
        deleteRowButton.addEventListener('click', deleteSelectedRows);
    }
});

document.getElementById('planning-button').addEventListener('click', function() {
    fetch('/api/production-planning')
        .then(response => response.text())
        .then(html => {
            document.getElementById('dynamic-content').innerHTML = html;
            initializeFormHandler();
            fetchAndDisplayOrders();
        })
        .catch(error => console.error('Error:', error));
});

function initializeFormHandler() {
    const form = document.querySelector('#production-planning-form form');
    if (form) {
        form.addEventListener('submit', function(event) {
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
        });
    } else {
        console.error("Form not found after fetching production planning");
    }
}

document.getElementById('logout-button').addEventListener('click', function() {
    fetch('/logout', {
        method: 'POST'
    }).then(response => {
        window.location.href = '/login';
    }).catch(error => console.error('Error:', error));
});

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
                background-color: #007bff;
                color: white;
            }
            .selected-row {
                background-color: #add8e6;
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

    updateTableHeaders();
    addEventListeners();
    fetchAndFillTable();

    document.getElementById('add-row-button').addEventListener('click', addRow);
    document.getElementById('save-data-button').addEventListener('click', saveTableData);
    document.getElementById('select-row-button').addEventListener('click', enableSelecting);
    document.getElementById('delete-row-button').addEventListener('click', deleteSelectedRows);
});

