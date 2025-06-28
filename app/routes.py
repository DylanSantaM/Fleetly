from flask import Blueprint, render_template, request, jsonify, current_app
from datetime import datetime
from flask_login import login_required, current_user
from flask_mail import Message
from .models import db, Booking

# Create the Blueprint FIRST
main = Blueprint('main', __name__)

# Location lists
nearbyLocations = ['Thika', 'Nakuru', 'Nyeri']
farLocations = ['Mombasa', 'Kisumu', 'Eldoret', 'Kitale', 'Malindi', 'Kakamega']

@main.route('/')
@main.route('/index')
def index():
    return render_template('index.html')

@main.route('/check-seats')
def check_seats():
    try:
        model = request.args.get('model')
        date_str = request.args.get('date')
        vehicle_type = request.args.get('vehicleType')
        
        if not all([model, date_str, vehicle_type]):
            return jsonify({'error': 'Missing required parameters'}), 400

        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        bookings = Booking.query.filter(
            Booking.model == model,
            Booking.vehicle_type == vehicle_type,
            Booking.start_date == date
        ).all()

        booked_seats = [str(booking.seat_number) for booking in bookings if booking.seat_number]
        return jsonify(booked_seats)

    except Exception as e:
        current_app.logger.error(f"Error checking seats: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@main.route('/book', methods=['POST'])
@login_required
def book():
    try:
        if not request.is_json:
            return jsonify({'success': False, 'message': 'Invalid content type'}), 400
            
        data = request.get_json()
        current_app.logger.info(f"Booking data received: {data}")

        # Validate required fields
        required_fields = ['vehicleType', 'startDate', 'endDate', 'location', 'destination']
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

        try:
            # Convert and validate dates
            start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['endDate'], '%Y-%m-%d').date()
            
            if end_date < start_date:
                return jsonify({'success': False, 'message': 'End date cannot be before start date'}), 400

            # Create booking
            booking = Booking(
                user_id=current_user.id if current_user.is_authenticated else None,
                vehicle_type=data['vehicleType'],
                passengers=int(data.get('passengers', 1)),
                seat_number=data.get('seatNumber'),
                location=data['location'],
                destination=data['destination'],
                start_date=start_date,
                end_date=end_date,
                total_price=float(data.get('totalPrice', 0)),
                model=data.get('model'),
                email=data.get('email', current_user.email if current_user.is_authenticated else None)
            )

            db.session.add(booking)
            db.session.commit()

            # Send confirmation email
            try:
                mail = Mail(current_app)
                recipients = [booking.email]
                
                # Add admin emails if configured
                admins = current_app.config.get('ADMINS', [])
                if isinstance(admins, str):
                    admins = [email.strip() for email in admins.split(',') if email.strip()]
                recipients.extend(admins)
                
                msg = Message(
                    subject="Your Booking Confirmation - Fleetly",
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients,
                    body=f"""Dear {booking.email},

Thank you for booking with Fleetly! Here are your details:
--------------------------------------------------
Vehicle Type: {booking.vehicle_type.title()}
Model: {booking.model if booking.model else 'N/A'}
From: {booking.location}
To: {booking.destination}
Dates: {booking.start_date} to {booking.end_date}
Seat: {booking.seat_number if booking.seat_number else 'N/A'}
Passengers: {booking.passengers if booking.passengers else 'N/A'}
Total: ${booking.total_price:.2f}
--------------------------------------------------
Contact support@fleetly.com for any questions."""
                )
                mail.send(msg)
            except Exception as mail_error:
                current_app.logger.error(f"Failed to send email: {mail_error}")

            return jsonify({
                'success': True,
                'message': 'Booking successful!',
                'booking_id': booking.id
            })

        except ValueError as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Invalid data: {str(e)}'}), 400
            
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Booking error: {str(e)}")
        return jsonify({'success': False, 'message': 'Server error'}), 500

@main.route('/about')
def about():
    return render_template('about.html')

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
        mail = Mail(current_app)
        msg = Message(
            subject="Your Booking Confirmation - Fleetly",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email],
            body=f"""Dear {booking.email},

Your booking details:
--------------------------------------------------
Vehicle: {booking.vehicle_type}
From: {booking.location}
To: {booking.destination}
Dates: {booking.start_date} to {booking.end_date}
--------------------------------------------------
Contact support@fleetly.com for help."""
        )
        mail.send(msg)
        return jsonify({'success': True, 'message': 'Email resent!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500