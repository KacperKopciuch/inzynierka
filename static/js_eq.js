document.addEventListener('DOMContentLoaded', function() {
    // Dodawanie obsługi kliknięcia dla przycisku "Utrzymanie sprzętu"
    const maintenanceBtn = document.getElementById('maintenance-btn');
    const dynamicContent = document.getElementById('dynamic-content');

    maintenanceBtn.addEventListener('click', function() {
        showDeviceManagement();
    });

    function showDeviceManagement() {
        // Wypełnienie dynamic-content odpowiednim HTML-em
        dynamicContent.innerHTML = `
            <h3>Utrzymanie Sprzętu</h3>
            <button id="add-device-btn">Dodaj urządzenie</button>
            <button id="view-devices-btn">Wyświetl urządzenia</button>
            <div id="device-form-container"></div>
            <div id="devices-list-container"></div>
        `;

        // Dodanie urządzenia
        document.getElementById('add-device-btn').addEventListener('click', function() {
            document.getElementById('device-form-container').innerHTML = `
                <form id="add-device-form">
                    <input type="text" name="device_id" placeholder="ID Urządzenia" required>
                    <input type="text" name="name" placeholder="Nazwa Urządzenia" required>
                    <textarea name="description" placeholder="Opis"></textarea>
                    <button type="submit">Zapisz urządzenie</button>
                </form>
            `;

            document.getElementById('add-device-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const deviceData = {
                    device_id: e.target.elements.device_id.value,
                    name: e.target.elements.name.value,
                    description: e.target.elements.description.value
                };

                fetch('/api/devices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deviceData)
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    loadDevices(); // Odświeżenie listy urządzeń
                })
                .catch(error => alert('Error:', error));
            });
        });

        // Wyświetlenie urządzeń
        document.getElementById('view-devices-btn').addEventListener('click', function() {
            loadDevices();
        });

        function loadDevices() {
            fetch('/api/devices')
            .then(response => response.json())
            .then(devices => {
                const devicesListContainer = document.getElementById('devices-list-container');
                devicesListContainer.innerHTML = '<h4>Zarejestrowane Urządzenia:</h4>';
                devices.forEach(device => {
                    devicesListContainer.innerHTML += `
                        <p>ID: ${device.device_id}, Nazwa: ${device.name}, Opis: ${device.description}</p>
                    `;
                });
            })
            .catch(error => alert('Error:', error));
        }
    }
});

function showInventoryManagement() {
    // Wypełnienie dynamic-content odpowiednim HTML-em dla stanu magazynowego
    dynamicContent.innerHTML = `
        <h3>Stan magazynowy części zamiennych</h3>
        <button id="view-inventory-btn">Wyświetl stan magazynowy</button>
        <div id="inventory-list-container"></div>
        <h3>Złóż zamówienie na część zamienną</h3>
        <form id="order-part-form">
            <input type="text" name="part_id" placeholder="ID Części" required>
            <input type="text" name="part_name" placeholder="Nazwa Części" required>
            <input type="number" name="quantity" placeholder="Ilość" required>
            <input type="date" name="order_date" placeholder="Data Realizacji" required>
            <button type="submit">Złóż zamówienie</button>
        </form>
    `;

    document.getElementById('view-inventory-btn').addEventListener('click', function() {
        loadInventory();
    });

    document.getElementById('order-part-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const orderData = {
            part_id: e.target.elements.part_id.value,
            part_name: e.target.elements.part_name.value,
            quantity: e.target.elements.quantity.value,
            order_date: e.target.elements.order_date.value
        };

        // Tutaj należy dopisać logikę do wysyłania zamówienia do backendu
        // Poniższy kod jest przykładem i może wymagać modyfikacji
        fetch('/api/order-part', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadInventory(); // Odświeżenie stanu magazynowego
        })
        .catch(error => alert('Error:', error));
    });
}

function loadInventory() {
    // Pobieranie i wyświetlanie stanu magazynowego
    // Zakładamy, że endpoint '/api/inventory' zwraca dane magazynowe
    fetch('/api/inventory')
    .then(response => response.json())
    .then(inventory => {
        const inventoryListContainer = document.getElementById('inventory-list-container');
        inventoryListContainer.innerHTML = '<h4>Aktualny stan magazynowy:</h4>';
        inventory.forEach(item => {
            inventoryListContainer.innerHTML += `
                <p>ID Części: ${item.part_id}, Nazwa: ${item.part_name}, Ilość: ${item.quantity}</p>
            `;
        });
    })
    .catch(error => alert('Error:', error));
}

// Przycisk 'Stan magazynowy części zamiennych' powinien być już zdefiniowany w HTML
const inventoryBtn = document.getElementById('inventory-btn');
inventoryBtn.addEventListener('click', showInventoryManagement);