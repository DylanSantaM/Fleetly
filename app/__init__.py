from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
import os

db = SQLAlchemy()
csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    
    # Add secret key and CSRF protection
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    
    # Database configuration
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    csrf.init_app(app)
    
    # Import models and register blueprints
    from . import models
    from .routes import main
    app.register_blueprint(main)
    
    with app.app_context():
        db.create_all()
    
    return app
