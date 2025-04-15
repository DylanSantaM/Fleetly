import os
from app import create_app, db

def init_database():
    # Delete existing database if it exists
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.db')
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print("Removed existing database")
        except PermissionError:
            print("Error: Could not remove existing database. Make sure it's not in use.")
            return False

    # Create new database
    app = create_app()
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")
        return True

if __name__ == '__main__':
    init_database()