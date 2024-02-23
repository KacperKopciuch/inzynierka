document.addEventListener('DOMContentLoaded', function() {
    var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/css_docmanagement.css'; // Ustaw ścieżkę do Twojego pliku CSS
        document.head.appendChild(link);
    document.getElementById('view-docs-button').addEventListener('click', function() {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <!-- Lista dokumentów -->
            <div id="documents-list"></div>
        `;
        fetchAndDisplayDocuments(); // Funkcja do pobierania i wyświetlania listy dokumentów
    });
});

function fetchAndDisplayDocuments() {
    fetch('/api/get-documents')
        .then(response => response.json())
        .then(documents => {
            const documentsList = document.getElementById('documents-list');
            documentsList.innerHTML = ''; // Wyczyść istniejącą zawartość

            // Iteracja po dokumentach i tworzenie elementów
            documents.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.className = 'document-item';
                docElement.innerHTML = `
                    <h4>${doc.title}</h4>
                    <p>${doc.description}</p>
                    <a href="${doc.file_url}" target="_blank">Otwórz dokument</a>
                `;
                documentsList.appendChild(docElement);

            });
        });
}