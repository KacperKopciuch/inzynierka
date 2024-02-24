document.addEventListener('DOMContentLoaded', function() {
    const maintenanceBtn = document.getElementById('maintenance-btn'); // Id przycisku 'utrzymanie sprzętu'
    const dynamicContent = document.getElementById('dynamic-content');

    maintenanceBtn.addEventListener('click', function() {
        dynamicContent.innerHTML = `
            <h3>Utrzymanie Sprzętu</h3>
            <button id="add-device-btn">Dodaj urządzenie</button>
            <button id="view-devices-btn">Wyświetl urządzenia</button>
            <button id="inventory-btn">Stan magazynowy części zamiennych</button>
            <div id="device-form-container"></div>
            <div id="devices-list-container"></div>
            <div id="parts-management-container"></div>
        `;

        // Nasłuch na nowo dodane przyciski
        document.getElementById('add-device-btn').addEventListener('click', showAddDeviceForm);
        document.getElementById('view-devices-btn').addEventListener('click', showDevicesList);
        document.getElementById('inventory-btn').addEventListener('click', loadSparePartsManagement);
    });
});

// Funkcja wyświetlająca formularz dodawania urządzenia
function showAddDeviceForm() {
    const formContainer = document.getElementById('device-form-container');
    formContainer.innerHTML = `
        <h4>Dodaj nowe urządzenie</h4>
        <form id="add-device-form">
            <input type="text" name="device_id" placeholder="ID Urządzenia" required>
            <input type="text" name="name" placeholder="Nazwa Urządzenia" required>
            <textarea name="description" placeholder="Opis"></textarea>
            <button type="submit">Zapisz urządzenie</button>
        </form>
    `;
    const addDeviceForm = document.getElementById('add-device-form');
    addDeviceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const deviceData = {
            device_id: addDeviceForm.device_id.value,
            name: addDeviceForm.name.value,
            description: addDeviceForm.description.value
        };
        fetch('/api/devices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deviceData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            showDevicesList(); // Odśwież listę urządzeń
        })
        .catch(error => console.error('Error:', error));
    });
}

// Funkcja wyświetlająca listę urządzeń
function showDevicesList() {
    fetch('/api/devices')
    .then(response => response.json())
    .then(devices => {
        const listContainer = document.getElementById('devices-list-container');
        listContainer.innerHTML = '<h4>Zarejestrowane Urządzenia:</h4>';
        devices.forEach(device => {
            listContainer.innerHTML += `<p>ID: ${device.device_id}, Nazwa: ${device.name}, Opis: ${device.description}</p>`;
        });
    })
    .catch(error => console.error('Error:', error));
}

function loadSparePartsManagement() {
    const partsManagementContainer = document.getElementById('parts-management-container');
    partsManagementContainer.innerHTML = `
        <h3>Stan Magazynowy Części Zamiennych</h3>
        <button id="add-part-btn">Dodaj część zamienną</button>
        <button id="view-parts-btn">Wyświetl części zamienne</button>
        <div id="part-form-container"></div>
        <div id="parts-list-container"></div>
    `;

    document.getElementById('add-part-btn').addEventListener('click', showAddPartForm);
    document.getElementById('view-parts-btn').addEventListener('click', showPartsList);
}

// Funkcja wyświetlająca formularz dodawania części zamiennej
function showAddPartForm() {
    const formContainer = document.getElementById('part-form-container');
    formContainer.innerHTML = `
        <h4>Dodaj nową część zamienną</h4>
        <form id="add-part-form">
            <input type="text" name="part_id" placeholder="ID Części" required>
            <input type="text" name="name" placeholder="Nazwa Części" required>
            <input type="number" name="quantity" placeholder="Ilość" required>
            <button type="submit">Zapisz część</button>
        </form>
    `;
    const addPartForm = document.getElementById('add-part-form');
    addPartForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const partData = {
            part_id: addPartForm.part_id.value,
            name: addPartForm.name.value,
            quantity: parseInt(addPartForm.quantity.value, 10)
        };
        fetch('/api/spare-parts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(partData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            showPartsList(); // Odśwież listę części
        })
        .catch(error => console.error('Error:', error));
    });
}

// Funkcja wyświetlająca listę części zamiennych
function showPartsList() {
    fetch('/api/spare-parts')
    .then(response => response.json())
    .then(parts => {
        const listContainer = document.getElementById('parts-list-container');
        listContainer.innerHTML = '<h4>Zarejestrowane Części Zamienne:</h4>';
        parts.forEach(part => {
            listContainer.innerHTML += `<p>ID: ${part.part_id}, Nazwa: ${part.name}, Ilość: ${part.quantity}</p>`;
        });
    })
    .catch(error => console.error('Error:', error));
}
