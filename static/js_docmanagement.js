document.addEventListener('DOMContentLoaded', function() {
    var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/css_docmanagement.css'; // Ustaw ścieżkę do Twojego pliku CSS
        document.head.appendChild(link);
    document.getElementById('dynamic-content').addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'upload-document-form') {
            e.preventDefault();
            const formData = new FormData(e.target);
            fetch('/api/upload-document', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                fetchAndDisplayDocuments(); // Odśwież listę dokumentów
                uploadForm.reset();
            })
            .catch(error => console.error('Error:', error));
        }
    });
});

document.getElementById('manage-docs-button').addEventListener('click', function() {
    const dynamicContent = document.getElementById('dynamic-content');
    dynamicContent.innerHTML = `
        <!-- Formularz do dodawania dokumentów -->
        <form id="upload-document-form">
            <input type="text" name="title" placeholder="Tytuł dokumentu" required>
            <textarea name="description" placeholder="Opis"></textarea>
            <input type="file" name="document" required>
            <button type="submit">Prześlij</button>
        </form>

        <!-- Lista dokumentów -->
        <div id="documents-list"></div>
    `;
    fetchAndDisplayDocuments(); // Funkcja do pobierania i wyświetlania listy dokumentów
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

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Usuń dokument';
                deleteButton.className = 'delete-button';
                deleteButton.addEventListener('click', () => deleteDocument(doc.id));
                docElement.appendChild(deleteButton);

                documentsList.appendChild(docElement);
            });
        });
}

function deleteDocument(docId) {
    if(confirm("Czy na pewno chcesz usunąć ten dokument?")) {
        fetch(`/api/delete-document/${docId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            fetchAndDisplayDocuments(); // Ponownie wczytaj listę dokumentów
        })
        .catch(error => console.error('Error:', error));
    }
}
