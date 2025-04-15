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

    // Handle location selection
    document.querySelectorAll('#locationDropdown + .dropdown-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            locationDropdown.textContent = this.textContent;
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

    // Handle seat selection
    seatButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            seatButtons.forEach(btn => {
                btn.classList.remove('btn-primary', 'selected');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add selected class to clicked button
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary', 'selected');
        });
    });
});

// Scroll animations

document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.slide-from-left').forEach(element => {
        observer.observe(element);
    });
});

// Define locations near and far from Nairobi
const nearbyLocations = ['Thika', 'Nakuru', 'Nyeri'];
const farLocations = ['Mombasa', 'Kisumu', 'Eldoret', 'Kitale', 'Malindi', 'Kakamega'];

// Handle destination selection
document.querySelectorAll('#destinationDropdown + .dropdown-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('#destinationDropdown').textContent = this.textContent;
    });
});

// Update the booking data collection
// Booking functionality
document.getElementById('checkAvailabilityBtn').addEventListener('click', async function() {
    // Get CSRF token from meta tag
    const csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    // Gather form data
    const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim().toLowerCase();
    const location = document.querySelector('#locationDropdown').textContent.trim();
    const destination = document.querySelector('#destinationDropdown').textContent.trim();
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;
    
    // Get vehicle specific data
    let passengers = null;
    let seatNumber = null;
    
    if (vehicleType === 'car') {
        const passengerText = document.querySelector('#passengerDropdown').textContent.trim();
        passengers = parseInt(passengerText.split(' ')[0]) || null;
    } else {
        const selectedSeat = document.querySelector('.seat-btn.selected');
        if (selectedSeat) {
            seatNumber = selectedSeat.textContent.trim();
        }
    }

    // Validate inputs
    if (destination === 'Select Destination') {
        alert('Please select a destination');
        return;
    }

    if ((vehicleType === 'bus' || vehicleType === 'train') && !seatNumber) {
        alert('Please select a seat');
        return;
    }
    
    // Get total price from display
    const totalPrice = parseFloat(document.querySelector('#totalPrice').textContent.replace(/[^0-9.]/g, ''));
    
    // Prepare booking data
    const bookingData = {
        vehicleType,
        passengers,
        seatNumber,
        location,
        destination,
        startDate,
        endDate,
        totalPrice
    };

    // Log the data being sent (for debugging)
    console.log('Sending booking data:', bookingData);
    
    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Booking successful!');
        } else {
            alert('Booking failed: ' + result.message);
            window.location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving booking: ' + error.message);
    }
});

// Price calculation function
function calculatePrice(vehicleType, location, destination, startDate) {
    const selectedVehicle = vehicleType.toLowerCase();
    const bookingDate = new Date(startDate);
    const today = new Date();
    const daysDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

    // Initialize price breakdown HTML
    let breakdownHTML = '<ul class="list-unstyled">';

    // Base price calculation based on booking time
    let totalPrice = daysDifference <= 7 ? 50 : 25;
    breakdownHTML += `<li>Booking Time Fee: $${totalPrice} (${daysDifference <= 7 ? 'Last minute booking' : 'Advance booking'})</li>`;

    // Additional price based on vehicle type and distance
    const isFarLocation = farLocations.includes(destination);
    let transportFee = 0;
    
    if (selectedVehicle.includes('car')) {
        transportFee = isFarLocation ? 100 : 50;
        breakdownHTML += `<li>Car Transport Fee: $${transportFee} (${isFarLocation ? 'Far from' : 'Close to'} Nairobi)</li>`;
    } else if (selectedVehicle.includes('bus')) {
        transportFee = isFarLocation ? 125 : 75;
        breakdownHTML += `<li>Bus Transport Fee: $${transportFee} (${isFarLocation ? 'Far from' : 'Close to'} Nairobi)</li>`;
    } else if (selectedVehicle.includes('train')) {
        transportFee = isFarLocation ? 150 : 100;
        breakdownHTML += `<li>Train Transport Fee: $${transportFee} (${isFarLocation ? 'Far from' : 'Close to'} Nairobi)</li>`;
    }

    totalPrice += transportFee;
    breakdownHTML += '</ul>';

    return { totalPrice, breakdownHTML };
}

// Modify the check availability button handler
document.getElementById('checkAvailabilityBtn').addEventListener('click', function() {
    const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
    const location = document.querySelector('#locationDropdown').textContent.trim();
    const destination = document.querySelector('#destinationDropdown').textContent.trim();
    const startDate = document.querySelector('#startDate').value;

    if (!vehicleType || vehicleType === 'select bus/car/train' || 
        !location || location === 'Select Location' || 
        !destination || destination === 'Select Destination' ||
        !startDate) {
        alert('Please select all required options (vehicle, location, destination, and date)');
        return;
    }

    const { totalPrice, breakdownHTML } = calculatePrice(vehicleType, location, destination, startDate);

    // Display the breakdown and total
    document.getElementById('priceBreakdown').innerHTML = breakdownHTML;
    document.getElementById('totalPrice').textContent = `Total Price: $${totalPrice}`;
    document.getElementById('priceDisplay').style.display = 'block';

    // Show confirm button
    document.getElementById('confirmBookingBtn').style.display = 'block';
});

// Add confirm booking button handler
document.getElementById('confirmBookingBtn').addEventListener('click', async function() {
    // Get CSRF token from meta tag
    const csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    // Gather form data
    const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim().toLowerCase();
    const location = document.querySelector('#locationDropdown').textContent.trim();
    const destination = document.querySelector('#destinationDropdown').textContent.trim();
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;
    
    // Get vehicle specific data
    let passengers = null;
    let seatNumber = null;
    
    if (vehicleType === 'car') {
        const passengerText = document.querySelector('#passengerDropdown').textContent.trim();
        passengers = parseInt(passengerText.split(' ')[0]) || null;
    } else {
        const selectedSeat = document.querySelector('.seat-btn.selected');
        if (selectedSeat) {
            seatNumber = selectedSeat.textContent.trim();
        }
    }

    // Validate inputs
    if ((vehicleType === 'bus' || vehicleType === 'train') && !seatNumber) {
        alert('Please select a seat');
        return;
    }
    
    // Get total price from display
    const totalPrice = parseFloat(document.querySelector('#totalPrice').textContent.replace(/[^0-9.]/g, ''));
    
    // Prepare booking data
    const bookingData = {
        vehicleType,
        passengers,
        seatNumber,
        location,
        destination,
        startDate,
        endDate,
        totalPrice
    };

    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Booking successful! Sending an email giving you details of your booking.');
        } else {
            alert('Booking failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving booking: ' + error.message);
    }
});
