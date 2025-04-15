from flask import Blueprint, render_template, request, jsonify
from .models import db, Booking
from datetime import datetime
from werkzeug.exceptions import BadRequest

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index')
def index():
    return render_template('index.html')

@main.route('/book', methods=['POST'])
def book():
    try:
        if not request.is_json:
            return jsonify({'success': False, 'message': 'Invalid content type'}), 400
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['vehicleType', 'location', 'destination', 'startDate', 'endDate']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400

        # Create new booking
        booking = Booking(
            vehicle_type=data['vehicleType'],
            passengers=data.get('passengers'),
            seat_number=data.get('seatNumber'),
            location=data['location'],
            destination=data['destination'],
            start_date=datetime.strptime(data['startDate'], '%Y-%m-%d'),
            end_date=datetime.strptime(data['endDate'], '%Y-%m-%d'),
            total_price=data.get('totalPrice', 0.0)
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Booking saved successfully!'})
        
    except BadRequest as e:
        return jsonify({'success': False, 'message': 'Invalid request data'}), 400
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500

@main.route('/about')
def about():
    return render_template('about.html')