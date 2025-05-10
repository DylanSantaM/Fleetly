from flask import Blueprint, render_template, request, jsonify
from .models import db, Booking
from datetime import datetime
from werkzeug.exceptions import BadRequest
from flask_login import login_required, current_user
import os
from flask import current_app
from flask_mail import Message

main = Blueprint('main', __name__)

nearbyLocations = ['Thika', 'Nakuru', 'Nyeri']
farLocations = ['Mombasa', 'Kisumu', 'Eldoret', 'Kitale', 'Malindi', 'Kakamega']

@main.route('/check-seats')
def check_seats():
    model = request.args.get('model')
    date = datetime.strptime(request.args.get('date'), '%Y-%m-%d')
    vehicle_type = request.args.get('vehicleType')

    # Filter bookings by model, vehicle_type, and start_date only
    bookings = Booking.query.filter_by(
        model=model,
        vehicle_type=vehicle_type,
        start_date=date
    ).all()

    booked_seats = [booking.seat_number for booking in bookings]
    return jsonify(booked_seats)

@main.route('/')
@main.route('/index')
def index():
    # Remove the train companies query since we don't need it
    return render_template('index.html')

@main.route('/book', methods=['POST'])
def book():
    print("Database path:", current_app.config['SQLALCHEMY_DATABASE_URI'])
    print("Received booking request")
    try:
        if not request.is_json:
            print("Not JSON request")
            return jsonify({'success': False, 'message': 'Invalid content type'}), 400
            
        data = request.get_json()
        print("Received data:", data)
        
        try:
            # Convert dates
            start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
            end_date = datetime.strptime(data['endDate'], '%Y-%m-%d')
            
            # Ensure totalPrice is a valid number
            total_price = float(data['totalPrice']) if data['totalPrice'] is not None else 0.0
            
            # Create booking with explicit type conversion
            booking = Booking(
                vehicle_type=str(data['vehicleType']),
                passengers=int(data['passengers']) if data.get('passengers') else None,
                seat_number=str(data['seatNumber']) if data.get('seatNumber') else None,
                location=str(data['location']),
                destination=str(data['destination']),
                start_date=start_date,
                end_date=end_date,
                total_price=total_price,
                model=data.get('model'),
                email=data.get('email')
            )
            
            print("Created booking object:", vars(booking))
            
            db.session.add(booking)
            db.session.commit()
            print("Booking saved successfully")

            # --- Send confirmation email ---
            from flask_mail import Mail
            mail = Mail(current_app)
            recipient_email = booking.email
            admin_emails = []
            admins_config = current_app.config.get('ADMINS')
            if admins_config:
                # Support both comma-separated string and list
                if isinstance(admins_config, str):
                    admin_emails = [email.strip() for email in admins_config.split(',') if email.strip()]
                elif isinstance(admins_config, list):
                    admin_emails = admins_config

            recipients = []
            if recipient_email:
                recipients.append(recipient_email)
            recipients.extend(admin_emails)

            if recipients:
                try:
                    msg = Message(
                        subject="Your Booking Confirmation - Fleetly",
                        sender=current_app.config['MAIL_USERNAME'],
                        recipients=recipients,
                        body=f"""Dear {booking.email},

Thank you for booking your trip with Fleetly! We are pleased to confirm your reservation and acknowledge that your payment has been received.

Here are your booking details:
--------------------------------------------------
Vehicle Type: {booking.vehicle_type.title()}
Model: {booking.model if booking.model else 'N/A'}
Location (Departure): {booking.location}
Destination: {booking.destination}
Start Date: {booking.start_date.strftime('%Y-%m-%d')}
End Date: {booking.end_date.strftime('%Y-%m-%d')}
Seat Number: {booking.seat_number if booking.seat_number else 'N/A'}
Number of Passengers: {booking.passengers if booking.passengers else 'N/A'}
Total Price Paid: ${booking.total_price:.2f}
--------------------------------------------------

If you have any questions or need to make changes to your booking, please reply to this email or contact our support team.

We wish you a pleasant journey!

Best regards,
Fleetly Team
support@fleetly.com
"""
                    )
                    with current_app.app_context():
                        mail.send(msg)
                    print(f"Confirmation email sent to: {', '.join(recipients)}")
                except Exception as mail_error:
                    print(f"Failed to send confirmation email: {mail_error}")

            return jsonify({'success': True, 'message': 'Booking saved successfully!'})

        except ValueError as ve:
            print("Value Error:", str(ve))
            return jsonify({'success': False, 'message': f'Invalid data format: {str(ve)}'}), 400
            
        except Exception as db_error:
            db.session.rollback()
            print("Database error:", str(db_error))
            return jsonify({'success': False, 'message': f'Database error: {str(db_error)}'}), 500
            
    except Exception as e:
        print("Error processing booking:", str(e))
        return jsonify({'success': False, 'message': str(e)}), 500

@main.route('/about')
def about():
    return render_template('about.html')


# REMOVE these lines from the global/module scope!
# db.session.commit()
# saved = Booking.query.order_by(Booking.id.desc()).first()
# print("Most recent booking:", vars(saved) if saved else "None")


@main.route('/resend-confirmation', methods=['POST'])
def resend_confirmation():
    data = request.get_json()
    booking_id = data.get('booking_id')
    email = data.get('email')
    if not booking_id or not email:
        return jsonify({'success': False, 'message': 'Missing booking ID or email'}), 400

    booking = Booking.query.get(booking_id)
    if not booking or booking.email != email:
        return jsonify({'success': False, 'message': 'Booking not found'}), 404

    try:
        from flask_mail import Mail
        mail = Mail(current_app)
        msg = Message(
            subject="Your Booking Confirmation - Fleetly",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email],
            body=f"""Dear {booking.email},

Thank you for booking your trip with Fleetly! We are pleased to confirm your reservation and acknowledge that your payment has been received.

Here are your booking details:
--------------------------------------------------
Vehicle Type: {booking.vehicle_type.title()}
Model: {booking.model if booking.model else 'N/A'}
Location (Departure): {booking.location}
Destination: {booking.destination}
Start Date: {booking.start_date.strftime('%Y-%m-%d')}
End Date: {booking.end_date.strftime('%Y-%m-%d')}
Seat Number: {booking.seat_number if booking.seat_number else 'N/A'}
Number of Passengers: {booking.passengers if booking.passengers else 'N/A'}
Total Price Paid: ${booking.total_price:.2f}
--------------------------------------------------

If you have any questions or need to make changes to your booking, please reply to this email or contact our support team.

We wish you a pleasant journey!

Best regards,
Fleetly Team
support@fleetly.com
"""
        )
        with current_app.app_context():
            mail.send(msg)
        return jsonify({'success': True, 'message': 'Confirmation email resent!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500