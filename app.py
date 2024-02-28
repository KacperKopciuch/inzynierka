import os
from flask import Flask, render_template, redirect, url_for, flash, request, session
# from flask_security import SQLAlchemyUserDatastore, Security, ConfirmRegisterForm
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask import jsonify
from flask_cors import CORS
from flask_login import LoginManager, current_user
from flask_login import UserMixin
from flask_login import login_user
from flask_login import login_required
from flask_login import logout_user
from urllib.parse import urlparse
from datetime import datetime, timedelta
from config import Config
from flask import send_from_directory
import bcrypt
import json

from sqlalchemy.testing.pickleable import Order
from werkzeug.utils import secure_filename

# import logging
# from wtforms import StringField

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'tajny_klucz'
app.config.from_object(Config)


folder_name = 'C:/Users/Kacper/Desktop/Praca INZ/bazadb'
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{folder_name}/crm.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    print(f"Loading user with ID: {user_id}")
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def __init__(self, username, email, password, role):
        self.username = username
        self.email = email
        self.password = password
        self.role = role


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_user_id'), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    shift_data = db.Column(db.Text, nullable=False)  # JSON z danymi o zmianach

    # relacje
    employee = db.relationship('User', backref='schedule')


# Utwórz tabelę w bazie danych, jeśli jeszcze nie istnieje
with app.app_context():
    db.create_all()


class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship('User', backref='announcements')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expiration_date = db.Column(db.DateTime, nullable=True)


class ProductionPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    deadline = db.Column(db.Date, nullable=False)
    completed_quantity = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<ProductionPlan {self.product_id}>'


with app.app_context():
    db.create_all()


class QualityDocument(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Device(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(64), nullable=False, unique=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SparePart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    part_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)


class Maintenance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(64), nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text, nullable=True)


class Cost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    planbudget = db.Column(db.Float, nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text, nullable=True)


class MachineEfficiency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    machineName = db.Column(db.String(255), nullable=False)
    usagePercentage = db.Column(db.Float, nullable=False)
    measurementDate = db.Column(db.DateTime, nullable=False)
    notes = db.Column(db.Text)


class MaterialConsumption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    material_name = db.Column(db.String(255), nullable=False)
    consumption_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    quantity_consumed = db.Column(db.Float, nullable=False)
    unit_cost = db.Column(db.Float, nullable=False)

    def __init__(self, material_name, consumption_date, quantity_consumed, unit_cost):
        self.material_name = material_name
        self.consumption_date = consumption_date
        self.quantity_consumed = quantity_consumed
        self.unit_cost = unit_cost


class QualityKPI(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Float, nullable=False)
    trend = db.Column(db.String(10))  # przykład: 'up', 'down', 'stable'
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<QualityKPI {self.name}>'


class AuditSchedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    audit_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    audit_type = db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<Audit {self.audit_type} - {self.subject}>'


class QualityReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_type = db.Column(db.String(50))
    report_date = db.Column(db.Date, default=datetime.utcnow)
    file_path = db.Column(db.String(200))

    def __repr__(self):
        return '<QualityReport {}>'.format(self.report_type)


class ProcessOptimization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    process_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    improvement_suggestion = db.Column(db.Text, nullable=True)
    impact_assessment = db.Column(db.Text, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, process_name, description, improvement_suggestion, impact_assessment):
        self.process_name = process_name
        self.description = description
        self.improvement_suggestion = improvement_suggestion
        self.impact_assessment = impact_assessment

    def serialize(self):
        return {
            'id': self.id,
            'process_name': self.process_name,
            'description': self.description,
            'improvement_suggestion': self.improvement_suggestion,
            'impact_assessment': self.impact_assessment,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }


class PerformanceIndicator(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cycle_time = db.Column(db.Float, nullable=True)  # czas cyklu
    downtime = db.Column(db.Float, nullable=True)  # czas przestojów
    machine_efficiency = db.Column(db.Float, nullable=True)  # wydajność maszyn
    product_quality = db.Column(db.Float, nullable=True)  # jakość wyrobów
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, cycle_time, downtime, machine_efficiency, product_quality):
        self.cycle_time = cycle_time
        self.downtime = downtime
        self.machine_efficiency = machine_efficiency
        self.product_quality = product_quality

    def serialize(self):
        return {
            'id': self.id,
            'cycle_time': self.cycle_time,
            'downtime': self.downtime,
            'machine_efficiency': self.machine_efficiency,
            'product_quality': self.product_quality,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S') if self.timestamp else 'Brak danych'
        }


with app.app_context():
    db.create_all()


# class ExtendedRegisterForm(ConfirmRegisterForm):
#   password = PasswordField('Password', [Required(), Length(min=6), Regexp('...')])  # Dodaj wymagania dotyczące hasła

# Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        user_exists = User.query.filter_by(username=username).first()
        email_exists = User.query.filter_by(email=email).first()

        if password != confirm_password:
            flash('Passwords are incorrect', 'error')
            return redirect(url_for('register'))

        if user_exists or email_exists:
            flash('Username or Email already exists. Please choose a different one.', 'error')
            return redirect(url_for('register'))

        role = request.form['role']

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        new_user = User(username=username, email=email, password=hashed_password.decode('utf-8'), role=role)
        db.session.add(new_user)
        db.session.commit()

        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('register'))

    return render_template('register.html')


# LOGIN
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['login-username']
        password = request.form['login-password']

        user = User.query.filter_by(username=username).first()

        if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            login_user(user)
            next_page = request.args.get('next')

            if not next_page or urlparse(next_page).netloc != '':
                # Użyj roli użytkownika do określenia przekierowania
                return redirect(url_for(user.role))

            return redirect(next_page)
        else:
            flash('Invalid username or password', 'error')

    return render_template('login.html')


@app.route('/home')
def home():
    if 'username' in session:
        return render_template('home.html', username=session['username'])
    else:
        flash('You need to login first', 'error')
        return redirect(url_for('register'))


@app.route('/management')
@login_required
def management():
    user_id = current_user.get_id()
    if current_user.role == 'management':
        schedules = Schedule.query.all()
        return render_template('management.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/production')
@login_required
def production():
    user_id = current_user.get_id()
    if current_user.role == 'production':
        schedules = Schedule.query.all()
        return render_template('production.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/quality_control')
@login_required
def quality_control():
    user_id = current_user.get_id()
    if current_user.role == 'quality_control':
        schedules = Schedule.query.all()
        return render_template('quality_control.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/hr')
@login_required
def hr():
    user_id = current_user.get_id()
    if current_user.role == 'hr':
        schedules = Schedule.query.all()
        return render_template('hr.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/logistic')
@login_required
def logistic():
    user_id = current_user.get_id()
    if current_user.role == 'logistic':
        schedules = Schedule.query.all()
        return render_template('logistic.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/financial')
@login_required
def financial():
    user_id = current_user.get_id()
    if current_user.role == 'financial':
        schedules = Schedule.query.all()
        return render_template('financial.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/programmer')
@login_required
def programmer():
    user_id = current_user.get_id()
    if current_user.role == 'programmer':
        schedules = Schedule.query.all()
        return render_template('programmer.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/it')
@login_required
def it():
    user_id = current_user.get_id()
    if current_user.role == 'it':
        schedules = Schedule.query.all()
        return render_template('it.html', schedules=schedules, user_id=user_id)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


# LogOut
@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out', 'success')
    return redirect(url_for('login'))


@app.route('/get_table_data')
def get_table_data():
    schedules = Schedule.query.join(Schedule.employee).all()
    print(schedules)
    data = [{
        'employee': {
            'id': schedule.employee.id,
            'name': schedule.employee.username
        },
        'position': schedule.position,
        'shift_data': json.loads(schedule.shift_data)
    } for schedule in schedules]
    print(schedules)
    print(data)
    return jsonify(data)


@app.route('/save_table', methods=['POST'])
def save_table():
    try:
        data = request.json
        print(data)

        # Usuń istniejące wpisy (opcjonalnie, w zależności od logiki aplikacji)
        Schedule.query.delete()

        # Zapisz nowe dane w bazie danych
        for row in data:
            new_schedule = Schedule(
                employee_id=row['employee_id'],
                position=row['position'],
                shift_data=json.dumps(row['shift_data'])
            )
            db.session.add(new_schedule)
        db.session.commit()

        return jsonify({'status': 'success'})
    except Exception as e:
        # Logowanie błędu
        print(f"Wystąpił błąd: {e}")
        return jsonify({'error': 'Wystąpił błąd podczas zapisywania danych'}), 500


@app.route('/delete_rows', methods=['POST'])
def delete_rows():
    try:
        data = request.json
        ids_to_delete = data['ids']
        Schedule.query.filter(Schedule.id.in_(ids_to_delete)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(e)
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/get_announcements')
def get_announcements():
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify([{
        'title': ann.title,
        'content': ann.content,
        'author': ann.author.username,
        'date': ann.created_at.strftime('%Y-%m-%d %H:%M')
    } for ann in announcements])


@app.route('/add_announcement', methods=['POST'])
@login_required
def add_announcement():
    data = request.get_json()
    # Deklaracja i inicjalizacja expiration_date
    expiration_date = None
    if 'expirationDate' in data:
        expiration_date = datetime.strptime(data['expirationDate'], '%Y-%m-%d')

    new_announcement = Announcement(
        title=data['title'],
        content=data['content'],
        author_id=current_user.id,  # Zakładając, że korzystasz z Flask-Login
        expiration_date=expiration_date
    )
    db.session.add(new_announcement)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Ogłoszenie dodane'})


@app.route('/get_users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [
        {'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role}
        for user in users
    ]
    return jsonify(users_list)


@app.route('/delete_announcement/<int:announcement_id>', methods=['DELETE'])
def delete_announcement(announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    if announcement.author_id != current_user.id:
        return jsonify({'status': 'error', 'message': 'Brak uprawnień'}), 403
    db.session.delete(announcement)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Ogłoszenie usunięte'})


@app.route('/delete_expired_announcements')
def delete_expired_announcements():
    Announcement.query.filter(Announcement.expiration_date < datetime.utcnow()).delete()
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Przestarzałe ogłoszenia usunięte'})


@app.route('/secret_area')
@login_required
def secret_area():
    return 'Tylko dla zalogowanych użytkowników!'


@app.route('/fetch_employees', methods=['GET'])
def fetch_employees():
    employees = User.query.all()

    # Przetwarzamy dane o pracownikach na format JSON
    employee_data = [{"id": employee.id, "username": employee.username} for employee in employees]

    print(employees)
    print(employee_data)
    return jsonify(employee_data)


@app.route('/api/schedule', methods=['GET'])
@login_required
def get_user_schedule():
    employee_id = current_user.id  # Pobieranie ID zalogowanego użytkownika
    start_date = datetime.today()  # Przykładowa data początkowa, tutaj: dzisiejsza data
    dates = [(start_date + timedelta(days=i)).strftime('%d.%m.%Y') for i in range(7)]  # Lista dat dla 7 dni

    schedules = Schedule.query.filter_by(employee_id=employee_id).all()

    schedule_data = [
        {
            "position": schedule.position,
            "shift_data": schedule.shift_data.split(','),  # Zakładam, że shift_data jest stringiem rozdzielonym przecinkami
            "dates": dates  # Dodajemy listę dat
        } for schedule in schedules
    ]

    return jsonify(schedule_data)


@app.route('/api/production-planning')
def production_planning():
    return render_template('production_planning.html')


@app.route('/api/submit-production-plan', methods=['POST'])
def submit_production_plan():
    product_id = request.form['product-id']
    quantity = request.form['quantity']
    deadline = datetime.strptime(request.form['deadline'], '%Y-%m-%d').date()
    completed_quantity = request.form['completed-quantity']

    new_plan = ProductionPlan(product_id=product_id, quantity=int(quantity), deadline=deadline, completed_quantity=int(completed_quantity))
    db.session.add(new_plan)
    db.session.commit()

    return jsonify({'message': 'Zamówienie dodane pomyślnie'})


@app.route('/api/get-orders')
def get_orders():
    orders = ProductionPlan.query.all()
    orders_data = [{
        'id': order.id,
        'product_id': order.product_id,
        'quantity': order.quantity,
        'deadline': order.deadline.strftime('%Y-%m-%d'),
        'completed_quantity': order.completed_quantity
    } for order in orders]
    return jsonify(orders_data)


@app.route('/api/edit-order/<int:order_id>', methods=['PATCH'])
def edit_order(order_id):
    data = request.get_json()
    order = ProductionPlan.query.get(order_id)
    if order:
        order.completed_quantity = data['completed_quantity']
        db.session.commit()
        return jsonify({'message': 'Ilość wykonana została zaktualizowana.'})
    else:
        return jsonify({'error': 'Zamówienie nie znalezione'}), 404


@app.route('/api/delete-order/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = ProductionPlan.query.get(order_id)
    if order:
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Zamówienie usunięte pomyślnie'}), 200
    else:
        return jsonify({'error': 'Zamówienie nie znalezione'}), 404


@app.route('/api/upload-document', methods=['POST'])
def upload_document():
    title = request.form['title']
    description = request.form.get('description', '')
    document = request.files['document']

    if document:
        filename = secure_filename(document.filename)
        existing_doc = QualityDocument.query.filter_by(file_path=filename).first()

        if existing_doc:
            return jsonify({'error': 'Dokument o tej nazwie już istnieje.'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        document.save(filepath)

        new_document = QualityDocument(title=title, description=description, file_path=filename)
        db.session.add(new_document)
        db.session.commit()

        return jsonify({'message': 'Dokument został dodany.'}), 201

    return jsonify({'error': 'Brak pliku.'}), 400


@app.route('/api/get-documents', methods=['GET'])
def get_documents():
    documents = QualityDocument.query.all()
    documents_list = []

    for doc in documents:
        # Pełna ścieżka do pliku
        file_path = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], doc.file_path)

        # Sprawdź, czy plik istnieje
        if os.path.exists(file_path):
            doc_url = url_for('static', filename=f'quali_docs/{doc.file_path}')
            documents_list.append({
                'id': doc.id,
                'title': doc.title,
                'description': doc.description if doc.description else "",
                'file_url': doc_url,
                'created_at': doc.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

    return jsonify(documents_list)


@app.route('/api/delete-document/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    document = QualityDocument.query.get_or_404(doc_id)
    try:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], document.file_path))  # Usuń plik z serwera
        db.session.delete(document)
        db.session.commit()
        return jsonify({'message': 'Dokument został usunięty.'}), 200
    except Exception as e:
        return jsonify({'error': 'Błąd podczas usuwania dokumentu: ' + str(e)}), 500


@app.route('/api/devices', methods=['POST'])
def add_device():
    data = request.json
    new_device = Device(
        device_id=data['device_id'],
        name=data['name'],
        description=data['description']
    )
    db.session.add(new_device)
    db.session.commit()
    return jsonify({'message': 'Device added successfully', 'id': new_device.id}), 201


@app.route('/api/devices', methods=['GET'])
def get_devices():
    devices = Device.query.all()
    devices_data = [
        {'id': device.id, 'device_id': device.device_id, 'name': device.name, 'description': device.description}
        for device in devices
    ]
    return jsonify(devices_data)


@app.route('/api/spare-parts', methods=['POST'])
def add_spare_part():
    data = request.get_json()
    new_part = SparePart(
        part_id=data['part_id'],
        name=data['name'],
        quantity=data['quantity']
    )
    db.session.add(new_part)
    db.session.commit()
    return jsonify({'message': 'Spare part added successfully'}), 201


@app.route('/api/spare-parts', methods=['GET'])
def get_spare_parts():
    parts = SparePart.query.all()
    parts_data = [
        {'id': part.id, 'part_id': part.part_id, 'name': part.name, 'quantity': part.quantity}
        for part in parts
    ]
    return jsonify(parts_data)


@app.route('/api/maintenance', methods=['POST'])
def add_maintenance():
    data = request.json
    new_maintenance = Maintenance(
        device_id=data['device_id'],
        scheduled_date=datetime.strptime(data['scheduled_date'], '%Y-%m-%d'),
        description=data['description']
    )
    db.session.add(new_maintenance)
    db.session.commit()
    return jsonify({'message': 'Maintenance scheduled successfully', 'id': new_maintenance.id}), 201


# Endpoint do pobierania przeglądów/konserwacji
@app.route('/api/maintenance', methods=['GET'])
def get_maintenance():
    maintenances = Maintenance.query.all()
    maintenance_list = [{
        'device_id': maintenance.device_id,
        'scheduled_date': maintenance.scheduled_date.strftime('%Y-%m-%d'),
        'description': maintenance.description
    } for maintenance in maintenances]
    return jsonify(maintenance_list)


@app.route('/api/costs', methods=['GET'])
def get_costs():
    costs = Cost.query.all()
    return jsonify([{'id': cost.id, 'category': cost.category, 'amount': cost.amount, 'planbudget': cost.planbudget, 'date': cost.date.strftime('%Y-%m-%d'), 'description': cost.description} for cost in costs])


@app.route('/api/costs', methods=['POST'])
def add_cost():
    data = request.json
    new_cost = Cost(category=data['category'], amount=data['amount'], planbudget=data['planbudget'], description=data['description'])
    db.session.add(new_cost)
    db.session.commit()
    return jsonify({'message': 'Cost added successfully'}), 201


@app.route('/add_efficiency', methods=['POST'])
def add_efficiency():
    try:
        data = request.json
        machine_name = data['machineName']
        usage_percentage = float(data['usagePercentage'])
        measurement_date_string = data['measurementDate']
        measurement_date = datetime.strptime(measurement_date_string, '%Y-%m-%dT%H:%M')

        new_record = MachineEfficiency(machineName=machine_name, usagePercentage=usage_percentage, measurementDate=measurement_date)
        db.session.add(new_record)
        db.session.commit()

        return jsonify({'message': 'Data added successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/efficiency', methods=['GET'])
def get_efficiency_data():
    results = MachineEfficiency.query.all()
    efficiency_data = [
        {'machineName': result.machineName, 'usagePercentage': result.usagePercentage}
        for result in results
    ]
    return jsonify(efficiency_data)


@app.route('/addMaterialConsumption', methods=['POST'])
def add_material_consumption():
    try:
        data = request.json
        new_consumption = MaterialConsumption(
            material_name=data['material_name'],
            consumption_date=datetime.strptime(data['consumption_date'], '%Y-%m-%d'),
            quantity_consumed=data['quantity_consumed'],
            unit_cost=data['unit_cost']
        )
        db.session.add(new_consumption)
        db.session.commit()
        return jsonify({"message": "Material consumption data added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/getMaterialConsumption', methods=['GET'])
def get_material_consumption():
    consumption_list = MaterialConsumption.query.all()
    return jsonify([{'material_name': item.material_name, 'consumption_date': item.consumption_date.strftime('%Y-%m-%d'), 'quantity_consumed': item.quantity_consumed, 'unit_cost': item.unit_cost} for item in consumption_list])


@app.route('/api/kpis', methods=['GET'])
def get_kpis():
    kpis = QualityKPI.query.all()
    return jsonify([{
        'name': kpi.name,
        'value': kpi.value,
        'trend': kpi.trend,
        'last_updated': kpi.last_updated.strftime('%Y-%m-%d %H:%M:%S')
    } for kpi in kpis])


@app.route('/api/audits')
def get_audits():
    audits = AuditSchedule.query.all()
    return jsonify([
        {
            "date": audit.audit_date.strftime('%Y-%m-%d'),
            "type": audit.audit_type,
            "subject": audit.subject
        } for audit in audits
    ])


@app.route('/api/quality-reports')
def get_quality_reports():
    reports = QualityReport.query.all()
    return jsonify([{"id": report.id, "report_type": report.report_type, "report_date": report.report_date.strftime('%Y-%m-%d'), "file_path": report.file_path} for report in reports])


@app.route('/api/quality-reports/<int:report_id>')
def download_quality_report(report_id):
    report = QualityReport.query.get_or_404(report_id)
    return send_from_directory(directory=os.path.dirname(report.file_path), filename=os.path.basename(report.file_path), as_attachment=True)


@app.route('/api/process_optimization', methods=['GET'])
def get_process_optimization():
    processes = ProcessOptimization.query.all()
    return jsonify([process.serialize() for process in processes])


@app.route('/api/process_optimization', methods=['POST'])
def add_process_optimization():
    data = request.json
    try:

        new_process = ProcessOptimization(
            process_name=data['process_name'],
            description=data['description'],
            improvement_suggestion=data['improvement_suggestion'],
            impact_assessment=data['impact_assessment'],
        )
        db.session.add(new_process)
        db.session.commit()
        return jsonify({'message': 'Process optimization added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/performance_indicators', methods=['GET', 'POST'])
def performance_indicators():
    if request.method == 'GET':
        # Pobieranie wszystkich wskaźników z bazy danych
        indicators = PerformanceIndicator.query.all()
        return jsonify([indicator.serialize() for indicator in indicators])

    elif request.method == 'POST':
        # Dodawanie nowego wskaźnika do bazy danych
        data = request.json
        try:
            new_indicator = PerformanceIndicator(
                cycle_time=data.get('cycle_time'),
                downtime=data.get('downtime'),
                machine_efficiency=data.get('machine_efficiency'),
                product_quality=data.get('product_quality'),
                timestamp=datetime.utcnow()  # Automatycznie zapisuje aktualną datę i czas
            )
            db.session.add(new_indicator)
            db.session.commit()
            return jsonify({'message': 'New performance indicator added successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
