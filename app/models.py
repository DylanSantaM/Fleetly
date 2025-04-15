from . import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'booking'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_type = db.Column(db.String(10), nullable=False)
    passengers = db.Column(db.Integer)
    seat_number = db.Column(db.String(50))
    location = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_price = db.Column(db.Float)

    def __repr__(self):
        return f'<Booking {self.id}>'