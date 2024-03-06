function loadAnnouncements() {
    fetch('/get_announcements')
        .then(response => response.json())
        .then(announcements => {
            const list = document.getElementById('announcement-list');
            list.innerHTML = '';
            announcements.forEach(announcement => {
                const item = document.createElement('div');
                item.classList.add('announcement-item');
                item.innerHTML = `
                    <h3 class="announcement-title">${announcement.title}</h3>
                    <p>${announcement.content}</p>
                    <small>Dodane przez: ${announcement.author}, ${announcement.date}</small>
                `;
                list.appendChild(item);
            });
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('announcement-board-button').addEventListener('click', function() {
        var container = document.getElementById('dynamic-content');
        container.innerHTML = `
            <style>
                #announcement-board {
                    width: 100%;
                    background-color: #f2f2f2;
                    padding: 10px;
                    box-sizing: border-box;
                }

                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                #add-announcement-button, #search-button {
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
                }

                .search-announcement input {
                    padding: 5px;
                    margin-right: 5px;
                }

            </style>
        <div id="announcement-board">
        <div class="top-bar">
            <button id="add-announcement-button">Dodaj ogłoszenie</button>
            <div class="search-announcement">
                <input type="text" id="search-input" placeholder="Szukaj ogłoszenia">
                <button id="search-button">Szukaj</button>
            </div>
        </div>

        <div id="add-announcement-modal" style="display: none;">
            <input type="text" id="announcement-title" placeholder="Tytuł ogłoszenia"><br><br>
            <textarea id="announcement-content" placeholder="Treść ogłoszenia"></textarea><br>
            <input type="date" id="announcement-expiration-date" placeholder="Data ważności"><br><br>
            <button id="submit-announcement">Dodaj ogłoszenie</button>
        </div>

        <div id="announcement-list">
            <div class="announcement-item">
                <h3 class="announcement-title">Tytuł ogłoszenia</h3>
                <p>Treść ogłoszenia</p>
                <small>Dodane przez: Autor, Data</small>
            </div>
        </div>
    </div>
        `;

        document.getElementById('add-announcement-button').addEventListener('click', function() {
            document.getElementById('add-announcement-modal').style.display = 'block';
        });

        document.getElementById('submit-announcement').addEventListener('click', function() {
            const title = document.getElementById('announcement-title').value;
            const content = document.getElementById('announcement-content').value;

            fetch('/add_announcement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                console.log('Ogłoszenie dodane:', data);
                loadAnnouncements();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });

        loadAnnouncements();

        document.getElementById('search-button').addEventListener('click', function() {
            var searchText = document.getElementById('search-input').value.toLowerCase();
            var announcements = document.querySelectorAll('.announcement-item');

            announcements.forEach(function(announcement) {
                var title = announcement.querySelector('.announcement-title').textContent.toLowerCase();
                if (title.includes(searchText)) {
                    announcement.style.display = '';
                } else {
                    announcement.style.display = 'none';
                }
            });
        });

        document.getElementById('search-input').addEventListener('input', function() {
            if (this.value.length === 0) {
                var announcements = document.querySelectorAll('.announcement-item');
                announcements.forEach(function(announcement) {
                    announcement.style.display = '';
                });
            }
        });

    });
});
