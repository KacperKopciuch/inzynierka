document.getElementById('show-schedule').addEventListener('click', function() {
    fetchAndDisplayUserSchedule();
});

function fetchAndDisplayUserSchedule() {
    fetch('/api/schedule')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.length) {
                throw new Error('Nie otrzymano danych harmonogramu.');
            }

            let contentHtml = '<table class="schedule-table">';

            contentHtml += '<tr><th>Stanowisko</th>';
            for (let i = 0; i < 7; i++) {
                contentHtml += `<th colspan="3">Dzień ${i + 1}</th>`;
            }
            contentHtml += '</tr><tr><td></td>';

            for (let i = 0; i < 7; i++) {
                contentHtml += '<td>Zmiana 1</td><td>Zmiana 2</td><td>Zmiana 3</td>';
            }
            contentHtml += '</tr>';

            data.forEach(schedule => {
                console.log('Oryginalne shift_data:', schedule.shift_data);
                contentHtml += `<tr><td>${schedule.position}</td>`;

                let shifts;
                if (typeof schedule.shift_data === 'string') {
                    try {
                        shifts = JSON.parse(schedule.shift_data.replace(/'/g, '"'));
                        console.log('Zparsowane shift_data:', shifts);
                    } catch (error) {
                        console.error('Parsing error:', error);
                        shifts = [];
                    }
                } else {
                    shifts = schedule.shift_data;
                    console.log('Nieparsowane shift_data (już tablica?):', shifts);
                }

                console.log(shifts[0]);
                shifts.forEach((shift, index) => {
                    console.log("Wartość shift:", shift);
                    let trimmedShift;
                    if (index === 0) {
                        trimmedShift = shift.trim().replace(/^\["|"$/g, '');
                    } else if (index === shifts.length - 1) {
                        trimmedShift = shift.trim().replace(/^"|"|\]$/g, '');
                    } else {
                        trimmedShift = shift.trim().replace(/^"|"$/g, '');
                    }
                    let className = trimmedShift === 'selected' ? 'selected' : '';
                    contentHtml += `<td class="${className}">${className ? '✓' : ''}</td>`;
                });



                console.log(shifts[0].trim());

                contentHtml += '</tr>';
            });

            contentHtml += '</table>';
            document.getElementById('dynamic-content').innerHTML = contentHtml;
        })
        .catch(error => console.error('Error:', error));
}


