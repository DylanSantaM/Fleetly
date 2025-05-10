// Forms
document.addEventListener('DOMContentLoaded', function() {
    // Dropdowns
    const vehicleDropdown = document.querySelector('#dropdownMenuButton');
    const locationDropdown = document.querySelector('#locationDropdown');
    const carSelection = document.getElementById('carSelection');
    const busSelection = document.getElementById('busSelection');
    const trainSelection = document.getElementById('trainSelection');
    const seatButtons = document.querySelectorAll('.seat-btn');

    // Initialize datepickers
    $('#startDate').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        startDate: new Date()
    });
    $('#endDate').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        startDate: new Date()
    });

    // Ensure end date cannot be before start date
    $('#startDate').on('changeDate', function(e) {
        var startDate = e.date;
        // Set the minimum selectable date for endDate to the selected startDate
        $('#endDate').datepicker('setStartDate', startDate);
        // If the current endDate is before the new startDate, clear it
        var endDateVal = $('#endDate').datepicker('getDate');
        if (endDateVal && endDateVal < startDate) {
            $('#endDate').datepicker('clearDates');
        }
    });

    // Handle location selection
    document.querySelectorAll('#locationDropdown + .dropdown-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            locationDropdown.textContent = this.textContent;
        });
    });

    // --- Passenger Dropdown Handling (Car) ---
    document.querySelectorAll('#passengerDropdown + .dropdown-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#passengerDropdown').textContent = this.textContent;
        });
    });

    // Handle vehicle selection
    document.querySelectorAll('.dropdown-item[data-vehicle]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const vehicle = this.getAttribute('data-vehicle');
            vehicleDropdown.textContent = this.textContent;

            // Hide all selections
            carSelection.style.display = 'none';
            busSelection.style.display = 'none';
            trainSelection.style.display = 'none';

            // Show selected vehicle's UI
            if (vehicle === 'car') {
                carSelection.style.display = 'block';
            } else if (vehicle === 'bus') {
                busSelection.style.display = 'block';
                // Reset bus accordion state
                const busCollapse = document.getElementById('busCollapse');
                const busAccordion = new bootstrap.Collapse(busCollapse, { toggle: false });
                busAccordion.hide();
            } else if (vehicle === 'train') {
                trainSelection.style.display = 'block';
                // Reset train accordion state
                const trainCollapse = document.getElementById('trainCollapse');
                const trainAccordion = new bootstrap.Collapse(trainCollapse, { toggle: false });
                trainAccordion.hide();
            }
        });
    });

    // Handle seat selection (bus/train)
    seatButtons.forEach(button => {
        button.addEventListener('click', function() {
            seatButtons.forEach(btn => {
                btn.classList.remove('btn-primary', 'selected');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary', 'selected');
        });
    });
});

// --- Scroll Animations ---
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.slide-from-left').forEach(element => {
        observer.observe(element);
    });
});

// --- Destination Dropdown Handling ---
document.querySelectorAll('#destinationDropdown + .dropdown-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('#destinationDropdown').textContent = this.textContent;
    });
});

// --- Pricing System Setup ---
const locations = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi', 'Kakamega', 'Nyeri'
];

// Distance matrix for pricing (distance units between locations)
const distanceMatrix = {
    'Nairobi':   { 'Nairobi': 0, 'Mombasa': 8, 'Kisumu': 6, 'Nakuru': 2, 'Eldoret': 5, 'Thika': 1, 'Kitale': 7, 'Malindi': 9, 'Kakamega': 6, 'Nyeri': 2 },
    'Mombasa':   { 'Nairobi': 8, 'Mombasa': 0, 'Kisumu': 12, 'Nakuru': 10, 'Eldoret': 13, 'Thika': 9, 'Kitale': 15, 'Malindi': 2, 'Kakamega': 13, 'Nyeri': 10 },
    'Kisumu':    { 'Nairobi': 6, 'Mombasa': 12, 'Kisumu': 0, 'Nakuru': 4, 'Eldoret': 2, 'Thika': 7, 'Kitale': 3, 'Malindi': 14, 'Kakamega': 1, 'Nyeri': 7 },
    'Nakuru':    { 'Nairobi': 2, 'Mombasa': 10, 'Kisumu': 4, 'Nakuru': 0, 'Eldoret': 3, 'Thika': 3, 'Kitale': 6, 'Malindi': 12, 'Kakamega': 5, 'Nyeri': 3 },
    'Eldoret':   { 'Nairobi': 5, 'Mombasa': 13, 'Kisumu': 2, 'Nakuru': 3, 'Eldoret': 0, 'Thika': 6, 'Kitale': 2, 'Malindi': 15, 'Kakamega': 3, 'Nyeri': 6 },
    'Thika':     { 'Nairobi': 1, 'Mombasa': 9, 'Kisumu': 7, 'Nakuru': 3, 'Eldoret': 6, 'Thika': 0, 'Kitale': 8, 'Malindi': 10, 'Kakamega': 7, 'Nyeri': 2 },
    'Kitale':    { 'Nairobi': 7, 'Mombasa': 15, 'Kisumu': 3, 'Nakuru': 6, 'Eldoret': 2, 'Thika': 8, 'Kitale': 0, 'Malindi': 17, 'Kakamega': 4, 'Nyeri': 9 },
    'Malindi':   { 'Nairobi': 9, 'Mombasa': 2, 'Kisumu': 14, 'Nakuru': 12, 'Eldoret': 15, 'Thika': 10, 'Kitale': 17, 'Malindi': 0, 'Kakamega': 15, 'Nyeri': 12 },
    'Kakamega':  { 'Nairobi': 6, 'Mombasa': 13, 'Kisumu': 1, 'Nakuru': 5, 'Eldoret': 3, 'Thika': 7, 'Kitale': 4, 'Malindi': 15, 'Kakamega': 0, 'Nyeri': 8 },
    'Nyeri':     { 'Nairobi': 2, 'Mombasa': 10, 'Kisumu': 7, 'Nakuru': 3, 'Eldoret': 6, 'Thika': 2, 'Kitale': 9, 'Malindi': 12, 'Kakamega': 8, 'Nyeri': 0 }
};

// --- Price Calculation Function ---
function calculatePrice(vehicleType, location, destination, startDate) {
    const selectedVehicle = vehicleType.toLowerCase();
    const bookingDate = new Date(startDate);
    const today = new Date();
    const daysDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

    let totalPrice = daysDifference <= 7 ? 50 : 25;
    let breakdownHTML = '<ul class="list-unstyled">';
    breakdownHTML += `<li>Booking Time Fee: $${totalPrice} (${daysDifference <= 7 ? 'Last minute booking' : 'Advance booking'})</li>`;

    // Get distance between start and destination
    let distance = 0;
    if (distanceMatrix[location] && distanceMatrix[location][destination] !== undefined) {
        distance = distanceMatrix[location][destination];
    }

    // Set base rates per vehicle type per "distance unit"
    let ratePerUnit = 0;
    if (selectedVehicle.includes('car')) {
        ratePerUnit = 10;
    } else if (selectedVehicle.includes('bus')) {
        ratePerUnit = 12;
    } else if (selectedVehicle.includes('train')) {
        ratePerUnit = 15;
    }

    const transportFee = distance * ratePerUnit;
    breakdownHTML += `<li>${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} Transport Fee: $${transportFee} (Distance: ${distance} units)</li>`;

    totalPrice += transportFee;
    breakdownHTML += '</ul>';

    return { totalPrice, breakdownHTML };
}

// --- Check Availability Button ---
// Only shows price, email, payment form, and confirm button. Does NOT save booking or send email.
let bookingConfirmed = false; // Track if booking has been confirmed

document.getElementById('checkAvailabilityBtn').addEventListener('click', function() {
    const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
    const location = document.querySelector('#locationDropdown').textContent.trim();
    const destination = document.querySelector('#destinationDropdown').textContent.trim();
    const startDate = document.querySelector('#startDate').value;

    if (
        vehicleType === 'Select bus/car/train' ||
        location === 'Select Location' ||
        destination === 'Select Destination' ||
        !startDate
    ) {
        alert('Please fill in all required fields');
        return;
    }

    // Calculate price
    const priceInfo = calculatePrice(vehicleType, location, destination, startDate);

    // Show price breakdown and UI elements
    document.getElementById('priceBreakdown').innerHTML = priceInfo.breakdownHTML;
    document.getElementById('totalPrice').textContent = `Total Price: $${priceInfo.totalPrice}`;
    document.getElementById('priceDisplay').style.display = 'block';
    document.getElementById('confirmBookingBtn').style.display = 'block';
    document.getElementById('emailInputContainer').style.display = 'block';
    document.getElementById('paymentFormContainer').style.display = 'block';
    // Hide resend button on new check
    document.getElementById('resendEmailBtn').style.display = 'none';
    bookingConfirmed = false; // Reset flag on new check
    document.getElementById('confirmBookingBtn').disabled = false; // Re-enable for new booking
    // REMOVE this line:
    // document.getElementById('resendEmailBtn').style.display = 'none';
});

// --- Confirm Booking Button ---
// This is the ONLY place where booking data is sent to the backend and email is sent.
document.getElementById('confirmBookingBtn').addEventListener('click', async function() {
    if (bookingConfirmed) {
        return;
    }

    // --- Card details validation ---
    const cardNumber = document.getElementById('cardNumber')?.value.trim();
    const cardExpiry = document.getElementById('cardExpiry')?.value.trim();
    const cardCVC = document.getElementById('cardCVC')?.value.trim();

    console.log('CardNumber:', cardNumber, 'CardExpiry:', cardExpiry, 'CardCVC:', cardCVC);

    if (!cardNumber || !cardExpiry || !cardCVC) {
        alert('Please enter your card details before confirming the booking.');
        return;
    }

    const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
    const location = document.querySelector('#locationDropdown').textContent.trim();
    const destination = document.querySelector('#destinationDropdown').textContent.trim();
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;

    let model = null;
    if (vehicleType.toLowerCase() === 'bus') {
        model = document.getElementById('busModelDropdown')?.value || null;
    } else if (vehicleType.toLowerCase() === 'train') {
        model = document.getElementById('trainModelDropdown')?.value || null;
    }

    // Get email input and validate
    const email = document.getElementById('userEmailInput')?.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        document.getElementById('userEmailInput').focus();
        return;
    }

    // Calculate total price
    const { totalPrice, breakdownHTML } = calculatePrice(vehicleType, location, destination, startDate);
    document.querySelector('#priceBreakdown').innerHTML = breakdownHTML;  // Update UI with price breakdown

    // Get seat or passenger info
    let passengers = null;
    let seatNumber = null;
    if (vehicleType.toLowerCase() === 'car') {
        const passengerText = document.querySelector('#passengerDropdown').textContent.trim();
        passengers = parseInt(passengerText.split(' ')[0]) || null;
    } else {
        const selectedSeat = document.querySelector('.seat-btn.selected');
        if (selectedSeat) {
            seatNumber = selectedSeat.textContent.trim();
        }
    }

    const bookingData = {
        vehicleType: vehicleType.toLowerCase(),
        location: location,
        destination: destination,
        startDate: startDate,
        endDate: endDate,
        passengers: passengers,
        seatNumber: seatNumber,
        totalPrice: totalPrice,
        model: model,
        email: email
    };

    console.log('Sending booking data:', bookingData);

    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Booking successful! Confirmation email sent.');
            bookingConfirmed = true;
            document.getElementById('confirmBookingBtn').disabled = true; // Disable button after booking
            // REMOVE these lines:
            // document.getElementById('confirmBookingBtn').style.display = 'none';
            // document.getElementById('resendEmailBtn').style.display = 'block';
            // window._lastBookingEmail = bookingData.email;
            // window._lastBookingId = result.booking_id;
        } else {
            alert('Booking failed: ' + result.message);
        }
    } catch (error) {
        alert('Error saving booking: ' + error.message);
    }
});

// REMOVE the entire Resend Confirmation Email Button handler:
    // document.getElementById('resendEmailBtn').addEventListener('click', async function() { ... });

// --- Resend Confirmation Email Button ---
document.getElementById('resendEmailBtn').addEventListener('click', async function() {
    const email = window._lastBookingEmail;
    const bookingId = window._lastBookingId;
    if (!email || !bookingId) {
        alert('No booking found to resend email.');
        return;
    }
    try {
        const response = await fetch('/resend-confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ email, booking_id: bookingId })
        });
        const result = await response.json();
        if (result.success) {
            alert('Confirmation email resent!');
        } else {
            alert('Failed to resend email: ' + result.message);
        }
    } catch (error) {
        alert('Error resending email: ' + error.message);
    }
});

// --- Seat Availability Fetching ---
async function fetchBookedSeats(vehicleType) {
    let model = '';
    if (vehicleType === 'bus') {
        model = document.getElementById('busModelDropdown').value;
    } else if (vehicleType === 'train') {
        model = document.getElementById('trainModelDropdown').value;
    }
    const date = document.getElementById('startDate').value;
    if (!model || !date) return;

    const response = await fetch(`/check-seats?model=${encodeURIComponent(model)}&date=${encodeURIComponent(date)}&vehicleType=${encodeURIComponent(vehicleType)}`);
    const bookedSeats = await response.json();

    document.querySelectorAll('.seat-btn').forEach(btn => {
        if (bookedSeats.includes(btn.textContent.trim())) {
            btn.disabled = true;
            btn.classList.add('btn-danger');
        } else {
            btn.disabled = false;
            btn.classList.remove('btn-danger');
        }
    });
}

// --- Show seat selection only after model is selected ---
document.getElementById('busModelDropdown').addEventListener('change', function() {
    const busAccordion = document.getElementById('busAccordion');
    if (this.value) {
        busAccordion.style.display = 'block';
        fetchBookedSeats('bus');
    } else {
        busAccordion.style.display = 'none';
    }
});
document.getElementById('trainModelDropdown').addEventListener('change', function() {
    const trainAccordion = document.getElementById('trainAccordion');
    if (this.value) {
        trainAccordion.style.display = 'block';
        fetchBookedSeats('train');
    } else {
        trainAccordion.style.display = 'none';
    }
});
document.getElementById('startDate').addEventListener('change', function() {
    const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim().toLowerCase();
    if (vehicleType === 'bus') fetchBookedSeats('bus');
    if (vehicleType === 'train') fetchBookedSeats('train');
});
document.getElementById('busModelDropdown').addEventListener('change', function() {
    fetchBookedSeats('bus');
});
document.getElementById('trainModelDropdown').addEventListener('change', function() {
    fetchBookedSeats('train');
});

// --- End of script.js ---