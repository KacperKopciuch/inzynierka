document.addEventListener('DOMContentLoaded', function() {
    const maintenanceBtn = document.getElementById('maintenance-btn');
    const dynamicContent = document.getElementById('dynamic-content');

    maintenanceBtn.addEventListener('click', function() {
        dynamicContent.innerHTML = `
            <h3>Utrzymanie Sprzętu</h3>
            <button id="add-device-btn">Dodaj urządzenie</button>
            <button id="view-devices-btn">Wyświetl urządzenia</button>
            <button id="inventory-btn">Stan magazynowy części zamiennych</button>
            <button id="schedule-maintenance-btn">Planowanie przeglądów i konserwacji</button>
            <div id="device-form-container"></div>
            <div id="devices-list-container"></div>
            <div id="parts-management-container"></div>
            <div id="maintenance-planning-container"></div>
        `;

        document.getElementById('add-device-btn').addEventListener('click', showAddDeviceForm);
        document.getElementById('view-devices-btn').addEventListener('click', showDevicesList);
        document.getElementById('inventory-btn').addEventListener('click', loadSparePartsManagement);
        document.getElementById('schedule-maintenance-btn').addEventListener('click', loadMaintenanceManagement);
    });
});

function showAddDeviceForm() {
    const formContainer = document.getElementById('device-form-container');
    formContainer.innerHTML = `
        <h4>Dodaj nowe urządzenie</h4>
        <form id="add-device-form">
            <input type="text" name="device_id" placeholder="ID Urządzenia" required>
            <input type="text" name="name" placeholder="Nazwa Urządzenia" required>
            <textarea name="description" placeholder="Opis"></textarea>
            <button type="submit">Zapisz urządzenie</button>
        </form><br>
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
            showDevicesList();
        })
        .catch(error => console.error('Error:', error));
    });
}

function showDevicesList() {
    fetch('/api/devices')
    .then(response => response.json())
    .then(devices => {
        const listContainer = document.getElementById('devices-list-container');
        listContainer.innerHTML = '<h4>Zarejestrowane Urządzenia:</h4>';
        devices.forEach(device => {
            listContainer.innerHTML += `<p>ID: ${device.device_id}, Nazwa: ${device.name}, Opis: ${device.description}</p>
            `;
        });
    })
    .catch(error => console.error('Error:', error));
}

function loadSparePartsManagement() {
    const partsManagementContainer = document.getElementById('parts-management-container');
    partsManagementContainer.innerHTML = `
        <br>
        <h3>Stan Magazynowy Części Zamiennych</h3>
        <button id="add-part-btn">Dodaj część zamienną</button>
        <button id="view-parts-btn">Wyświetl części zamienne</button>
        <div id="part-form-container"></div>
        <div id="parts-list-container"></div><br>
    `;

    document.getElementById('add-part-btn').addEventListener('click', showAddPartForm);
    document.getElementById('view-parts-btn').addEventListener('click', showPartsList);
}

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
            showPartsList();
        })
        .catch(error => console.error('Error:', error));
    });
}

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

function loadMaintenanceList() {
    const maintenanceListContainer = document.getElementById('maintenance-list-container');

    fetch('/api/maintenance')
    .then(response => response.json())
    .then(maintenances => {
        maintenanceListContainer.innerHTML = '<h4>Zaplanowane przeglądy/konserwacje:</h4>';
        maintenances.forEach(maintenance => {
            const maintenanceItem = document.createElement('div');
            maintenanceItem.className = 'maintenance-item';
            maintenanceListContainer.innerHTML += `
                <div>
                    <p>ID Urządzenia: ${maintenance.device_id}</p>
                    <p>Data przeglądu/konserwacji: ${maintenance.scheduled_date}</p>
                    <p>Opis: ${maintenance.description}</p>
                </div>
            `;
            maintenanceListContainer.appendChild(maintenanceItem);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Nie udało się załadować listy przeglądów/konserwacji');
    });
}

function loadMaintenanceManagement() {
    const maintenanceManagementContainer = document.createElement('div');
    maintenanceManagementContainer.id = 'maintenance-management-container';
    maintenanceManagementContainer.innerHTML = `
        <h3>Planowanie przeglądów i konserwacji</h3>
        <button id="add-maintenance-btn">Zaplanuj przegląd/konserwację</button>
        <div id="maintenance-form-container"></div>
        <div id="maintenance-list-container"></div>
    `;

    const dynamicContent = document.getElementById('dynamic-content');
    dynamicContent.appendChild(maintenanceManagementContainer);


    document.getElementById('add-maintenance-btn').addEventListener('click', function() {
        const maintenanceFormContainer = document.getElementById('maintenance-form-container');
        maintenanceFormContainer.innerHTML = `
            <form id="add-maintenance-form">
                <input type="text" name="device_id" placeholder="ID Urządzenia" required>
                <input type="date" name="scheduled_date" placeholder="Data przeglądu" required>
                <textarea name="description" placeholder="Opis"></textarea>
                <button type="submit">Zaplanuj</button>
            </form>
        `;

        document.getElementById('add-maintenance-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const maintenanceData = {
                device_id: formData.get('device_id'),
                scheduled_date: formData.get('scheduled_date'),
                description: formData.get('description')
            };

            fetch('/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(maintenanceData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadMaintenanceList();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Nie udało się zaplanować przeglądu/konserwacji');
            });
        });
    });

    loadMaintenanceList();
}
