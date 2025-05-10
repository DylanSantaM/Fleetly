import os
from app import create_app, db
from app.models import Booking

app = create_app()

with app.app_context():
    # Create all database tables
    db.create_all()
    print("Database tables created successfully!")

    # Verify tables exist
    try:
        bookings = Booking.query.all()
        print(f"Found {len(bookings)} existing bookings")
    except Exception as e:
        print(f"Error checking bookings: {e}")

    from app import create_app, db
    from app.models import Booking

    app = create_app()
    with app.app_context():
        saved = Booking.query.order_by(Booking.id.desc()).first()
        print("Most recent booking:", vars(saved) if saved else "None")