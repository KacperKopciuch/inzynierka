import { createTableRows, getWeekDates, updateTableHeaders, toggleCell, addRow, saveTableData, generateTableHeader, addEventListeners, fetchAndFillTable, toggleRowSelection, deleteSelectedRows, enableSelecting } from './functions.js';

window.toggleCell = toggleCell;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_table_data')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            createTableRows(data);
        })

        .catch(error => console.error('Error:', error));

        const selectRowButton = document.getElementById('select-row-button');
        if (selectRowButton) {
            selectRowButton.addEventListener('click', enableSelecting);
        }

        const deleteRowButton = document.getElementById('delete-row-button');
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
            .editable {
                background-color: #fff;
            }
            .selected {
                background-color: #007bff; /* Niebieski kolor */
                color: white; /* Biały tekst dla lepszej czytelności */
            }
            .selected-row {
                 background-color: #add8e6; /* na przykład jasnoniebieski */
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
});
