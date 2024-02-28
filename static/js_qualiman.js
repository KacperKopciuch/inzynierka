document.addEventListener("DOMContentLoaded", function() {
    // Definicja funkcji do ładowania treści zarządzania jakością
    function loadQualityManagementContent() {
        const managementContainer = document.getElementById('dynamic-content');
        managementContainer.innerHTML = ''; // Wyczyszczenie zawartości

        const header = document.createElement('h2');
        header.textContent = 'Zarządzanie jakością';
        managementContainer.appendChild(header);

        const kpisContainer = document.createElement('div');
        kpisContainer.id = 'kpis-container';
        managementContainer.appendChild(kpisContainer);

        // Sekcja raportów
        const reportsSection = document.createElement('div');
        reportsSection.className = 'reports-section';
        reportsSection.innerHTML = `
            <h3>Raporty z kontroli jakości</h3>
            <button id="download-internal-audit">Pobierz raport z audytu wewnętrznego</button>
            <button id="download-external-audit">Pobierz raport z audytu zewnętrznego</button>
        `;
        managementContainer.appendChild(reportsSection);

        // Sekcja dokumentacji
        const documentationSection = document.createElement('div');
        documentationSection.className = 'documentation-section';
        documentationSection.innerHTML = `
            <h3>Dokumentacja jakościowa</h3>
            <ul>
                <li><a href="#">Procedura kontroli jakości</a></li>
                <li><a href="#">Instrukcja pracy</a></li>
            </ul>
        `;
        managementContainer.appendChild(documentationSection);

        // Sekcja harmonogramu audytów
        const auditsScheduleSection = document.createElement('div');
        auditsScheduleSection.className = 'audits-schedule-section list-style-none';
        auditsScheduleSection.id = 'audits-schedule-section';
        auditsScheduleSection.classList.add('list-style-none')
        auditsScheduleSection.innerHTML = `
            <h3>Harmonogram audytów</h3>
            <p>Nadchodzące audyty: <span id="upcoming-audits"></span></p>
        `;
        managementContainer.appendChild(auditsScheduleSection);

        loadAuditsSchedule();

        // Sekcja raportów
        const qualityReportsSection = document.createElement('div');
        qualityReportsSection.className = 'quality-reports-section';
        qualityReportsSection.id = 'quality-reports-section';
        qualityReportsSection.innerHTML = `
            <h3>Raporty</h3>
        `;
        managementContainer.appendChild(qualityReportsSection);

        loadQualityReports()


        fetch('/api/kpis')
        .then(response => response.json())
        .then(kpis => {
            kpis.forEach(kpi => {
                const card = document.createElement('div');
                card.className = 'kpi-card';
                card.innerHTML = `
                    <h3>${kpi.name}</h3>
                    <p>Wartość aktualna: ${kpi.value}</p>
                    <p>Trend: ${kpi.trend}</p>
                    <p>Ostatnia aktualizacja: ${kpi.last_updated}</p>
                `;
                kpisContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Błąd:', error));
    }

    const qualityManagementTab = document.getElementById('quality-management-tab');
    if (qualityManagementTab) {
        qualityManagementTab.addEventListener('click', loadQualityManagementContent);
    }

    function loadAuditsSchedule() {
        console.log("Loading audits schedule..."); // Debug
        fetch('/api/audits')
            .then(response => {
                console.log("Audits response received"); // Debug
                return response.json();
            })
            .then(audits => {
                console.log("Audits data:", audits); // Debug
                const auditsScheduleSection = document.getElementById('audits-schedule-section');
                const list = document.createElement('ul');
                audits.forEach(audit => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `${audit.date} - <strong>${audit.type}</strong> Audit: ${audit.subject}`;
                    list.appendChild(listItem);
                });
                auditsScheduleSection.appendChild(list);
            })
            .catch(error => {
                console.error('Błąd:', error); // Debug
            });
    }

    function loadQualityReports() {
        const reportsSection = document.getElementById('quality-reports-section');
        if (!reportsSection) return;

        fetch('/api/quality-reports')
            .then(response => response.json())
            .then(reports => {
                const list = document.createElement('ul');
                reports.forEach(report => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `/api/quality-reports/${report.id}`;
                    link.textContent = `${report.report_type} - ${report.report_date}`;
                    link.setAttribute('download', true);
                    listItem.appendChild(link);
                    list.appendChild(listItem);
                });
                reportsSection.appendChild(list);
            })
            .catch(error => console.error('Error:', error));
    }
});
