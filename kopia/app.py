from flask import Flask, render_template, redirect, url_for, flash, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask import jsonify
from flask_cors import CORS
import bcrypt
import json


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'tajny_klucz'
folder_name = 'C:/Users/Kacper/Desktop/Praca INZ/bazadb'
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{folder_name}/users.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='production')


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    shift_data = db.Column(db.Text, nullable=False)  # JSON z danymi o zmianach


# Utwórz tabelę w bazie danych, jeśli jeszcze nie istnieje
with app.app_context():
    db.create_all()


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

# Passwd checking
        if user:
            if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                session['username'] = user.username
                session['role'] = user.role

                # Przekierowanie w zależności od roli
                if user.role == 'management':
                    return redirect(url_for('management'))
                elif user.role == 'production':
                    return redirect(url_for('production'))
                elif user.role == 'quality_control':
                    return redirect(url_for('quality_control'))
                elif user.role == 'hr':
                    return redirect(url_for('hr'))
                elif user.role == 'logistic':
                    return redirect(url_for('logistic'))
                elif user.role == 'financial':
                    return redirect(url_for('financial'))
                elif user.role == 'programmer':
                    return redirect(url_for('programmer'))
                elif user.role == 'it':
                    return redirect(url_for('it'))

                else:
                    # Domyślne przekierowanie, jeśli rola nie jest rozpoznana
                    return redirect(url_for('home'))

            else:
                flash('Invalid password', 'error')
        else:
            flash('Username does not exist', 'error')

    return render_template('login.html')


# home
@app.route('/home')
def home():
    if 'username' in session:
        return render_template('home.html', username=session['username'])
    else:
        flash('You need to login first', 'error')
        return redirect(url_for('register'))


@app.route('/management')
def management():
    if 'role' in session and session['role'] == 'management':
        schedules = Schedule.query.all()
        return render_template('management.html', schedules=schedules)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/production')
def production():
    if 'role' in session and session['role'] == 'production':
        schedules = Schedule.query.all()
        return render_template('production.html', schedules=schedules)
    else:
        flash('Access error', 'error')
        return redirect(url_for('home'))


@app.route('/quality_control')
def quality_control():
    if 'role' in session and session['role'] == 'quality_control':
        # logika strony dla kierownictwa
        return render_template('quality_control.html')
    else:
        flash('Brak dostępu', 'error')
        return redirect(url_for('home'))


@app.route('/hr')
def hr():
    if 'role' in session and session['role'] == 'hr':
        # logika strony dla kierownictwa
        return render_template('hr.html')
    else:
        flash('Brak dostępu', 'error')
        return redirect(url_for('home'))


@app.route('/logistic')
def logistic():
    if 'role' in session and session['role'] == 'logistic':
        # logika strony dla kierownictwa
        return render_template('logistic.html')
    else:
        flash('Brak dostępu', 'error')
        return redirect(url_for('home'))


@app.route('/financial')
def financial():
    if 'role' in session and session['role'] == 'financial':
        # logika strony dla kierownictwa
        return render_template('financial.html')
    else:
        flash('Brak dostępu', 'error')
        return redirect(url_for('home'))


@app.route('/programmer')
def programmer():
    if 'role' in session and session['role'] == 'programmer':
        # logika strony dla kierownictwa
        return render_template('programmer.html')
    else:
        flash('Brak dostępu', 'error')
        return redirect(url_for('home'))


@app.route('/it')
def it():
    if 'role' in session and session['role'] == 'it':
        # logika strony dla kierownictwa
        return render_template('it.html')
    else:
        flash('Brak dostępu', 'error')
        return redirect(url_for('home'))


# LogOut
@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You have been logged out', 'success')
    return redirect(url_for('register'))


@app.route('/get_table_data')
def get_table_data():
    schedules = Schedule.query.all()
    data = [{
        'employee_name': schedule.employee_name,
        'position': schedule.position,
        'shift_data': json.loads(schedule.shift_data)
    } for schedule in schedules]
    return jsonify(data)


@app.route('/save_table', methods=['POST'])
def save_table():
    try:
        data = request.json

        # Usuń istniejące wpisy (opcjonalnie, w zależności od logiki aplikacji)
        Schedule.query.delete()

        # Zapisz nowe dane w bazie danych
        for row in data:
            new_schedule = Schedule(
                employee_name=row['employee_name'],
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


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
