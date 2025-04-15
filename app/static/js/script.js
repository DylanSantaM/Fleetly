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
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add selected class to clicked button
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
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

document.getElementById('checkAvailabilityBtn').addEventListener('click', function() {
    const selectedVehicle = document.querySelector('#dropdownMenuButton').textContent.trim().toLowerCase();
    const selectedLocation = document.querySelector('#locationDropdown').textContent.trim();
    const startDate = document.querySelector('#startDate').value;
    const priceBreakdown = document.getElementById('priceBreakdown');
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (!selectedVehicle || selectedVehicle === 'select bus/car/train' || 
        !selectedLocation || selectedLocation === 'Select Location' || 
        !startDate) {
        alert('Please select all required options (vehicle, location, and date)');
        return;
    }

    // Calculate booking time difference
    const bookingDate = new Date(startDate);
    const today = new Date();
    const daysDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

    // Initialize price breakdown HTML
    let breakdownHTML = '<ul class="list-unstyled">';

    // Base price calculation based on booking time
    let totalPrice = daysDifference <= 7 ? 50 : 25;
    breakdownHTML += `<li>Booking Time Fee: $${totalPrice} (${daysDifference <= 7 ? 'Last minute booking' : 'Advance booking'})</li>`;

    // Additional price based on vehicle type and distance
    const isFarLocation = farLocations.includes(selectedLocation);
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

    // Display the breakdown and total
    priceBreakdown.innerHTML = breakdownHTML;
    totalPriceElement.textContent = `Total Price: $${totalPrice}`;
});