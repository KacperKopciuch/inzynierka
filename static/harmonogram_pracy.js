document.getElementById('show-schedule').addEventListener('click', function() {
    fetchAndDisplayUserSchedule(); // Wywołanie nowej funkcji do ładowania harmonogramu
});

function fetchAndDisplayUserSchedule() {
    fetch('/api/schedule')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.length) {
                throw new Error('Nie otrzymano danych harmonogramu.');
            }

            // Rozpoczęcie tworzenia tabeli
            let contentHtml = '<table class="schedule-table">';

            // Nagłówki dla dni
            contentHtml += '<tr><th>Stanowisko</th>';
            for (let i = 0; i < 7; i++) { // Dla każdego dnia tygodnia
                contentHtml += `<th colspan="3">Dzień ${i + 1}</th>`;
            }
            contentHtml += '</tr><tr><td></td>'; // Puste pole dla stanowiska w drugim wierszu nagłówków

            // Dodajemy nagłówki zmian w drugim wierszu
            for (let i = 0; i < 7; i++) {
                contentHtml += '<td>Zmiana 1</td><td>Zmiana 2</td><td>Zmiana 3</td>';
            }
            contentHtml += '</tr>';

            // Wiersze dla stanowisk i zmian
            data.forEach(schedule => {
                console.log('Oryginalne shift_data:', schedule.shift_data);
                contentHtml += `<tr><td>${schedule.position}</td>`;

                let shifts;
                // Sprawdź, czy shift_data jest typu string i próbuj ją przetworzyć
                if (typeof schedule.shift_data === 'string') {
                    try {
                        // Próbuj zparsować JSON
                        shifts = JSON.parse(schedule.shift_data.replace(/'/g, '"'));
                        console.log('Zparsowane shift_data:', shifts);
                    } catch (error) {
                        console.error('Parsing error:', error);
                        shifts = []; // Ustaw pustą tablicę w przypadku błędu
                    }
                } else {
                    shifts = schedule.shift_data; // Jeśli shift_data jest już tablicą
                    console.log('Nieparsowane shift_data (już tablica?):', shifts);
                }

                console.log(shifts[0]); // Log pierwszego elementu przed trim()
                // Iteracja po zmianach i dodanie odpowiednich klas
                shifts.forEach((shift, index) => {
                    console.log("Wartość shift:", shift);
                    let trimmedShift;
                    if (index === 0) {
                        // Usunięcie zbędnych nawiasów kwadratowych i cudzysłowów oraz białych znaków przed i po wartości
                        trimmedShift = shift.trim().replace(/^\["|"$/g, '');
                    } else if (index === shifts.length - 1) {
                        // Usunięcie zbędnych cudzysłowów i białych znaków przed i po wartości
                        trimmedShift = shift.trim().replace(/^"|"|\]$/g, '');
                    } else {
                        // Usunięcie zbędnych cudzysłowów i białych znaków przed i po wartości
                        trimmedShift = shift.trim().replace(/^"|"$/g, '');
                    }
                    // Porównanie po usunięciu zbędnych znaków
                    let className = trimmedShift === 'selected' ? 'selected' : '';
                    contentHtml += `<td class="${className}">${className ? '✓' : ''}</td>`;
                });



                console.log(shifts[0].trim()); // Log pierwszego elementu po trim()

                contentHtml += '</tr>'; // Zamykamy wiersz dla stanowiska
            });

            contentHtml += '</table>';
            document.getElementById('dynamic-content').innerHTML = contentHtml;
        })
        .catch(error => console.error('Error:', error));
}


