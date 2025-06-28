// =================================================================
// INITIALIZATION
// =================================================================
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the carousel
    const bookingCarousel = document.getElementById('bookingCarousel');
    const carousel = new bootstrap.Carousel(bookingCarousel, {
        interval: false,
        wrap: false
    });

    // Get all navigation elements
    const dateContinueBtn = document.querySelector('#dateSlide .next-btn');
    const vehicleContinueBtn = document.querySelector('#vehicleSlide .next-btn');
    const indicators = document.querySelectorAll('.carousel-indicators button');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');

    // Initialize continue buttons as disabled
    if (dateContinueBtn) dateContinueBtn.disabled = true;
    if (vehicleContinueBtn) vehicleContinueBtn.disabled = true;

    // STRICT DATE VALIDATION ======================================
    function validateDates() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            if (dateContinueBtn) dateContinueBtn.disabled = true;
            return false;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end <= start) {
            if (dateContinueBtn) dateContinueBtn.disabled = true;
            alert('End date must be after start date');
            return false;
        }
        
        if (dateContinueBtn) dateContinueBtn.disabled = false;
        return true;
    }

    // Setup date pickers with validation
    function setupDatepickers() {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        let startPicker, endPicker;
    
        if (startDateInput) {
            startPicker = new tempusDominus.TempusDominus(startDateInput, {
                display: {
                    components: { clock: false, calendar: true },
                    buttons: { today: true, clear: true, close: true }
                },
                restrictions: { minDate: new Date() }
            });
    
            // Listen for date changes
            startDateInput.addEventListener('change.td', function() {
                validateDates();
                
                // Update end date picker restrictions
                if (endPicker) {
                    endPicker.updateOptions({
                        restrictions: {
                            minDate: this.value ? new Date(this.value) : new Date()
                        }
                    });
                    
                    // Reset end date if invalid
                    if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
                        endPicker.dates.setValue(null);
                        validateDates();
                    }
                }
            });
        }
    
        if (endDateInput) {
            endPicker = new tempusDominus.TempusDominus(endDateInput, {
                display: {
                    components: { clock: false, calendar: true },
                    buttons: { today: true, clear: true, close: true }
                },
                restrictions: { minDate: new Date() }
            });
            endDateInput.addEventListener('change.td', validateDates);
        }
    }

    // VEHICLE VALIDATION ==========================================
    async function validateVehicleSelection() {
        const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
        
        if (vehicleType === 'Select bus/car/train') {
            alert('Please select a vehicle type');
            return false;
        }
        
        if (vehicleType === 'car') {
            const passengerCount = document.getElementById('passengerDropdown').textContent;
            if (passengerCount === 'Number of Passengers') {
                alert('Please select number of passengers');
                return false;
            }
            return true;
        }
        else if (vehicleType === 'bus' || vehicleType === 'train') {
            const modelDropdown = document.getElementById(`${vehicleType}ModelDropdown`);
            if (!modelDropdown || !modelDropdown.value) {
                alert(`Please select a ${vehicleType} model`);
                return false;
            }
            
            // Check seat availability
            try {
                const date = document.getElementById('startDate').value;
                const response = await fetch(`/check-seats?model=${modelDropdown.value}&date=${date}&vehicleType=${vehicleType}`);
                
                if (!response.ok) {
                    throw new Error('Failed to check seat availability');
                }
                
                const bookedSeats = await response.json();
                const selectedSeat = document.querySelector(`#${vehicleType}Accordion .seat-btn.selected`);
                
                if (!selectedSeat) {
                    alert(`Please select a seat for the ${vehicleType}`);
                    return false;
                }
                
                if (bookedSeats.includes(selectedSeat.textContent.trim())) {
                    alert('This seat is already booked! Please select another seat.');
                    return false;
                }
                
                return true;
            } catch (error) {
                console.error('Seat check error:', error);
                alert('Error checking seat availability. Please try again.');
                return false;
            }
        }
        
        return false;
    }
    // ENHANCED CAROUSEL NAVIGATION ================================
    function setupCarouselNavigation() {
        // Handle next button clicks
        nextBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const activeSlide = document.querySelector('.carousel-item.active');
                
                if (activeSlide.id === 'dateSlide' && !validateDates()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                else if (activeSlide.id === 'vehicleSlide') {
                    if (!validateVehicleSelection()) {
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        // Explicitly enable navigation when validation passes
                        carousel.next();
                    }
                }
            });
        });

        // Handle carousel slide events
        bookingCarousel.addEventListener('slide.bs.carousel', function(e) {
            const currentSlide = document.querySelector('.carousel-item.active');
            const nextSlide = e.relatedTarget;
            
            if (currentSlide.id === 'vehicleSlide' && nextSlide.dataset.bsSlideTo > currentSlide.dataset.bsSlideTo) {
                if (!validateVehicleSelection()) {
                    e.preventDefault();
                }
            }
        });

        // Update indicators
        bookingCarousel.addEventListener('slid.bs.carousel', function(e) {
            const currentIndex = e.to;
            indicators.forEach((indicator, index) => {
                indicator.disabled = index > currentIndex + 1;
            });
        });
    }

    // SEAT SELECTION ==============================================
    function setupSeatSelection() {
        const seatButtons = document.querySelectorAll('.seat-btn');
        seatButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove selection from all buttons first
                seatButtons.forEach(btn => {
                    btn.classList.remove('btn-primary', 'selected');
                    btn.classList.add('btn-outline-primary');
                });
                // Select the clicked button
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-primary', 'selected');
            });
        });
    }

    // SEAT AVAILABILITY ===========================================
    async function fetchBookedSeats(vehicleType) {
        const modelDropdown = vehicleType === 'bus' 
            ? document.getElementById('busModelDropdown')
            : document.getElementById('trainModelDropdown');
        const date = document.getElementById('startDate').value;
        
        if (!modelDropdown || !modelDropdown.value || !date) return;

        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockBookedSeats = {
                'bus': { 'Classic': ['1', '5', '9'], 'Express': ['2', '6'] },
                'train': { 'Standard': ['3', '7'], 'Luxury': ['4', '8'] }
            };
            
            const bookedSeats = mockBookedSeats[vehicleType][modelDropdown.value] || [];
            
            document.querySelectorAll('.seat-btn').forEach(btn => {
                const seatNumber = btn.textContent.trim();
                const isBooked = bookedSeats.includes(seatNumber);
                
                btn.disabled = isBooked;
                btn.classList.toggle('btn-outline-primary', !isBooked);
                btn.classList.toggle('btn-danger', isBooked);
                btn.classList.toggle('selected', false);
            });
        } catch (error) {
            console.error('Error fetching seat availability:', error);
        }
    }

    // VEHICLE VALIDATION ==========================================
    function validateVehicleSelection() {
        const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
        
        if (vehicleType === 'Select bus/car/train') {
            alert('Please select a vehicle type');
            return false;
        }
        
        if (vehicleType === 'car') {
            const passengerCount = document.getElementById('passengerDropdown').textContent;
            if (passengerCount === 'Number of Passengers') {
                alert('Please select number of passengers');
                return false;
            }
        }
        else if (vehicleType === 'bus' || vehicleType === 'train') {
            const modelDropdown = vehicleType === 'bus' 
                ? document.getElementById('busModelDropdown')
                : document.getElementById('trainModelDropdown');
            
            if (!modelDropdown.value) {
                alert(`Please select a ${vehicleType} model`);
                return false;
            }
            
            const selectedSeat = document.querySelector(`#${vehicleType}Accordion .seat-btn.selected`);
            if (!selectedSeat) {
                alert(`Please select a seat for the ${vehicleType}`);
                return false;
            }
        }
        
        return true;
    }

    // VEHICLE SELECTION ===========================================
    function setupVehicleSelection() {
        const vehicleDropdown = document.getElementById('dropdownMenuButton');
        const vehicleItems = document.querySelectorAll('.dropdown-item[data-vehicle]');
        const vehicleOptions = {
            car: document.getElementById('carSelection'),
            bus: document.getElementById('busSelection'),
            train: document.getElementById('trainSelection')
        };
        const modelDropdowns = {
            bus: document.getElementById('busModelDropdown'),
            train: document.getElementById('trainModelDropdown')
        };
        const accordions = {
            bus: document.getElementById('busAccordion'),
            train: document.getElementById('trainAccordion')
        };

        // Initialize all vehicle options as hidden
        Object.values(vehicleOptions).forEach(option => {
            if (option) option.style.display = 'none';
        });

        // Handle vehicle type selection
        vehicleItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const vehicleType = this.getAttribute('data-vehicle');
                
                vehicleDropdown.textContent = this.textContent;
                
                Object.values(vehicleOptions).forEach(option => {
                    if (option) option.style.display = 'none';
                });
                
                Object.values(modelDropdowns).forEach(dropdown => {
                    if (dropdown) dropdown.value = '';
                });
                
                Object.values(accordions).forEach(accordion => {
                    if (accordion) accordion.style.display = 'none';
                });
                
                if (vehicleOptions[vehicleType]) {
                    vehicleOptions[vehicleType].style.display = 'block';
                }
                
                if (vehicleContinueBtn) vehicleContinueBtn.disabled = false;
            });
        });

        // Handle bus model selection
        if (modelDropdowns.bus) {
            modelDropdowns.bus.addEventListener('change', function() {
                accordions.bus.style.display = this.value ? 'block' : 'none';
                if (this.value) fetchBookedSeats('bus');
            });
        }

        // Handle train model selection
        if (modelDropdowns.train) {
            modelDropdowns.train.addEventListener('change', function() {
                accordions.train.style.display = this.value ? 'block' : 'none';
                if (this.value) fetchBookedSeats('train');
            });
        }
    }

    // LOCATION SELECTION ==========================================
    function setupLocationSelection() {
        // Handle location selection dropdowns
        document.querySelectorAll('#locationDropdown .dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                document.getElementById('locationDropdown').textContent = this.textContent;
            });
        });

        // Handle destination selection dropdowns
        document.querySelectorAll('#destinationDropdown .dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                document.getElementById('destinationDropdown').textContent = this.textContent;
            });
        });
    }

    // PRICING SYSTEM ==============================================
    const locations = [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 
        'Thika', 'Kitale', 'Malindi', 'Kakamega', 'Nyeri'
    ];

    const distanceMatrix = [
        [0, 483, 265, 157, 307, 45, 380, 539, 418, 150],
        [483, 0, 568, 640, 790, 528, 863, 1022, 901, 633],
        [265, 568, 0, 192, 342, 220, 555, 714, 593, 325],
        [157, 640, 192, 0, 150, 112, 447, 606, 485, 217],
        [307, 790, 342, 150, 0, 262, 597, 756, 635, 367],
        [45, 528, 220, 112, 262, 0, 335, 494, 373, 105],
        [380, 863, 555, 447, 597, 335, 0, 159, 38, 230],
        [539, 1022, 714, 606, 756, 494, 159, 0, 121, 389],
        [418, 901, 593, 485, 635, 373, 38, 121, 0, 268],
        [150, 633, 325, 217, 367, 105, 230, 389, 268, 0]
    ];

    function calculatePrice(vehicleType, fromIndex, toIndex, passengers = 1) {
        if (fromIndex === -1 || toIndex === -1) return 0;
        
        const distance = distanceMatrix[fromIndex][toIndex];
        let basePrice = 0;
        
        switch (vehicleType.toLowerCase()) {
            case 'car':
                basePrice = 5 * distance; // 5 KES per km
                return basePrice * passengers;
            case 'bus':
                basePrice = 3 * distance; // 3 KES per km
                return basePrice;
            case 'train':
                basePrice = 4 * distance; // 4 KES per km
                return basePrice;
            default:
                return 0;
        }
    }

    // AVAILABILITY CHECKING =======================================
    document.getElementById('checkAvailabilityBtn').addEventListener('click', function() {
        const startDate = document.getElementById('startDate').value;
        const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
        const fromLocation = document.getElementById('fromLocation').value;
        const toLocation = document.getElementById('toLocation').value;
        
        if (!startDate) {
            alert('Please select a start date');
            return;
        }
        
        if (vehicleType === 'Select bus/car/train') {
            alert('Please select a vehicle type');
            return;
        }
        
        if (!fromLocation || !toLocation) {
            alert('Please select both location and destination');
            return;
        }
        
        if (fromLocation === toLocation) {
            alert('Location and destination cannot be the same');
            return;
        }
        
        // Calculate price
        const fromIndex = locations.indexOf(fromLocation);
        const toIndex = locations.indexOf(toLocation);
        let passengers = 1;
        
        if (vehicleType.toLowerCase() === 'car') {
            const passengerText = document.getElementById('passengerDropdown').textContent.trim();
            if (passengerText === 'Number of Passengers') {
                alert('Please select the number of passengers');
                return;
            }
            passengers = parseInt(passengerText);
        }
        
        const price = calculatePrice(vehicleType.toLowerCase(), fromIndex, toIndex, passengers);
        
        // Display price and show booking confirmation elements
        document.getElementById('priceDisplay').textContent = `KES ${price.toFixed(2)}`;
        document.getElementById('bookingSummary').style.display = 'block';
        document.getElementById('bookingConfirmation').style.display = 'block';
        
        // Update summary details
        document.getElementById('summaryDate').textContent = startDate;
        document.getElementById('summaryVehicle').textContent = vehicleType;
        document.getElementById('summaryFrom').textContent = fromLocation;
        document.getElementById('summaryTo').textContent = toLocation;
        document.getElementById('summaryPrice').textContent = `KES ${price.toFixed(2)}`;
    });

    // BOOKING CONFIRMATION ========================================
    function setupBookingConfirmation() {
        const confirmBookingBtn = document.getElementById('confirmBookingBtn');
        const resendConfirmationBtn = document.getElementById('resendConfirmationBtn');

        if (confirmBookingBtn) {
            confirmBookingBtn.addEventListener('click', function() {
                const cardNumber = document.getElementById('cardNumber').value;
                const cardExpiry = document.getElementById('cardExpiry').value;
                const cardCVC = document.getElementById('cardCVC').value;
                const email = document.getElementById('userEmailInput').value;
                
                if (!cardNumber || !cardExpiry || !cardCVC) {
                    alert('Please fill in all card details');
                    return;
                }
                
                if (!email) {
                    alert('Please enter your email address');
                    return;
                }
                
                alert('Booking confirmed! Check your email for details.');
            });
        }

        if (resendConfirmationBtn) {
            resendConfirmationBtn.addEventListener('click', function() {
                alert('Confirmation email resent!');
            });
        }
    }

    // CAROUSEL NAVIGATION CONTROL =================================
    function setupCarouselNavigation() {
        // Disable all indicators except the first one
        indicators.forEach((indicator, index) => {
            if (index > 0) {
                indicator.disabled = true;
                indicator.classList.add('disabled-indicator');
            }
        });

        // Handle next button clicks with validation
        nextBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const activeSlide = document.querySelector('.carousel-item.active');
                
                // Strict validation for date slide
                if (activeSlide.id === 'dateSlide') {
                    if (!validateDates()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
                // Strict validation for vehicle slide
                else if (activeSlide.id === 'vehicleSlide') {
                    if (!validateVehicleSelection()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
                
                return true;
            });
        });

        // Update indicators as user progresses
        bookingCarousel.addEventListener('slid.bs.carousel', function(e) {
            const currentIndex = [...document.querySelectorAll('.carousel-item')]
                .indexOf(e.relatedTarget);
                
            indicators.forEach((indicator, index) => {
                indicator.disabled = index > currentIndex + 1;
                indicator.classList.toggle('disabled-indicator', index > currentIndex + 1);
            });
        });
    }

    // MAIN INITIALIZATION =========================================
    setupDatepickers();
    setupDropdowns();
    setupVehicleSelection();
    setupSeatSelection();
    setupLocationSelection();
    setupCarouselNavigation();
    setupBookingConfirmation();
});

// DROPDOWN HANDLING ==============================================
function setupDropdowns() {
    // Handle dropdown menu clicks
    document.querySelectorAll('.dropdown-menu a').forEach(item => {
        item.addEventListener('click', function(e) {
            const button = e.target.closest('.dropdown').querySelector('.dropdown-toggle');
            button.textContent = this.textContent;
        });
    });
    // Handle passenger selection for car
    document.querySelectorAll('#carSelection .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedText = this.textContent.trim();
            document.getElementById('passengerDropdown').textContent = selectedText;
        });
    });
}

// =================================================================
// SEAT AVAILABILITY
// =================================================================
async function fetchBookedSeats(vehicleType) {
    // Get selected model and date
    const modelDropdown = vehicleType === 'bus' 
        ? document.getElementById('busModelDropdown')
        : document.getElementById('trainModelDropdown');
    const date = document.getElementById('startDate').value;
    
    if (!modelDropdown || !modelDropdown.value || !date) return;

    // Mock API call
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockBookedSeats = {
            'bus': { 'Classic': ['1', '5', '9'], 'Express': ['2', '6'] },
            'train': { 'Standard': ['3', '7'], 'Luxury': ['4', '8'] }
        };
        
        const bookedSeats = mockBookedSeats[vehicleType][modelDropdown.value] || [];
        
        // Update seat availability UI
        document.querySelectorAll('.seat-btn').forEach(btn => {
            const seatNumber = btn.textContent.trim();
            const isBooked = bookedSeats.includes(seatNumber);
            
            btn.disabled = isBooked;
            btn.classList.toggle('btn-outline-primary', !isBooked);
            btn.classList.toggle('btn-danger', isBooked);
            btn.classList.toggle('selected', false);
        });
    } catch (error) {
        console.error('Error fetching seat availability:', error);
    }
}

// =================================================================
// CAROUSEL VALIDATION FOR VEHICLE SLIDE
// =================================================================
function validateDateSelection() {
    const startDate = document.getElementById('startDate').value;
    if (!startDate) {
        alert('Please select a start date');
        return false;
    }
    return true;
}

function validateDateSelection() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate) {
        alert('Please select a start date');
        return false;
    }
    
    if (!endDate) {
        alert('Please select an end date');
        return false;
    }
    
    // Additional check to ensure end date is after start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
        alert('End date must be after start date');
        return false;
    }
    
    return true;
}

// =================================================================
// SEAT SELECTION
// =================================================================
function setupDatepickers() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput) {
        new tempusDominus.TempusDominus(startDateInput, {
            display: {
                components: { clock: false, calendar: true },
                buttons: { today: true, clear: true, close: true }
            },
            restrictions: { minDate: new Date() }
        });
    }

    if (endDateInput) {
        new tempusDominus.TempusDominus(endDateInput, {
            display: {
                components: { clock: false, calendar: true },
                buttons: { today: true, clear: true, close: true }
            },
            restrictions: { 
                minDate: new Date(),
                // Ensure end date can't be before selected start date
                disabledDates: function(data) {
                    const startDate = document.getElementById('startDate').value;
                    if (startDate) {
                        return data.date < new Date(startDate);
                    }
                    return false;
                }
            }
        });
    }
}

// =================================================================
// PRICING SYSTEM
// =================================================================
const locations = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
];

const distanceMatrix = [
    [0, 4490, 1270, 2620, 3900, 130, 2870, 4170, 2200, 4130],
    [4490, 0, 3220, 2460, 650, 4370, 2020, 180, 2290, 540],
    [1270, 3220, 0, 1520, 2670, 1140, 1930, 3000, 1300, 3000],
    [2620, 2460, 1520, 0, 1810, 2490, 310, 2280, 390, 2480],
    [3900, 650, 2670, 1810, 0, 3780, 1370, 480, 1680, 1020],
    [130, 4370, 1140, 2490, 3780, 0, 2740, 4050, 2070, 4010],
    [2870, 2020, 1930, 310, 1370, 2740, 0, 1840, 410, 2040],
    [4170, 180, 3000, 2280, 480, 4050, 1840, 0, 2110, 720],
    [2200, 2290, 1300, 390, 1680, 2070, 410, 2110, 0, 2310],
    [4130, 540, 3000, 2480, 1020, 4010, 2040, 720, 2310, 0]
];

function calculatePrice(vehicleType, fromIndex, toIndex, passengers = 1) {
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    const distance = distanceMatrix[fromIndex][toIndex];
    let basePrice = 0;
    
    switch (vehicleType.toLowerCase()) {
        case 'car':
            basePrice = 0.5 * distance;
            return basePrice * passengers;
        case 'bus':
            basePrice = 0.3 * distance;
            return basePrice;
        case 'train':
            basePrice = 0.4 * distance;
            return basePrice;
        default:
            return 0;
    }
}

// =================================================================
// AVAILABILITY CHECKING
// =================================================================
document.getElementById('checkAvailabilityBtn').addEventListener('click', function() {
    // Validate all required fields
    const startDate = document.getElementById('startDate').value;
    const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
    const fromLocation = document.getElementById('locationDropdown').textContent.trim();
    const toLocation = document.getElementById('destinationDropdown').textContent.trim();
    
    if (!startDate) {
        alert('Please select a start date');
        return;
    }
    
    if (vehicleType === 'Select bus/car/train') {
        alert('Please select a vehicle type');
        return;
    }
    
    if (fromLocation === 'Select Location' || toLocation === 'Select Destination') {
        alert('Please select both location and destination');
        return;
    }
    
    if (fromLocation === toLocation) {
        alert('Location and destination cannot be the same');
        return;
    }
    
    // Calculate price
    const fromIndex = locations.indexOf(fromLocation);
    const toIndex = locations.indexOf(toLocation);
    let passengers = 1;
    
    if (vehicleType.toLowerCase() === 'car') {
        const passengerText = document.getElementById('passengerDropdown').textContent.trim();
        if (passengerText === 'Number of Passengers') {
            alert('Please select the number of passengers');
            return;
        }
        passengers = parseInt(passengerText);
    }
    
    const price = calculatePrice(vehicleType.toLowerCase(), fromIndex, toIndex, passengers);
    
    // Display price and show booking confirmation elements
    document.getElementById('priceDisplay').textContent = `$${price.toFixed(2)}`;
    document.getElementById('bookingSummary').style.display = 'block';
    document.getElementById('bookingConfirmation').style.display = 'block';
    
    // Update summary details
    document.getElementById('summaryDate').textContent = startDate;
    document.getElementById('summaryVehicle').textContent = vehicleType;
    document.getElementById('summaryFrom').textContent = fromLocation;
    document.getElementById('summaryTo').textContent = toLocation;
    document.getElementById('summaryPrice').textContent = `$${price.toFixed(2)}`;
});

// =================================================================
// BOOKING CONFIRMATION
// =================================================================
function setupBookingConfirmation() {
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    const resendConfirmationBtn = document.getElementById('resendConfirmationBtn');

    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', async function() {
            const cardNumber = document.getElementById('cardNumber').value;
            const cardExpiry = document.getElementById('cardExpiry').value;
            const cardCVC = document.getElementById('cardCVC').value;
            const email = document.getElementById('emailInput').value;
            
            if (!cardNumber || !cardExpiry || !cardCVC) {
                alert('Please fill in all card details');
                return;
            }
            
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            // Booking confirmation logic would go here
            alert('Booking confirmed! Check your email for details.');
        });
    }

    if (resendConfirmationBtn) {
        resendConfirmationBtn.addEventListener('click', async function() {
            alert('Confirmation email resent!');
        });
    }
}

// =================================================================
// CAROUSEL NAVIGATION
// =================================================================
function setupCarouselNavigation(bookingCarousel, indicators, continueButtons, carousel) {
     // Validate each step before moving forward
     bookingCarousel.addEventListener('slide.bs.carousel', function (e) {
        const items = Array.from(bookingCarousel.querySelectorAll('.carousel-item'));
        const currentIndex = items.findIndex(item => item.classList.contains('active'));
        const nextIndex = items.indexOf(e.relatedTarget);

        // Only validate when moving forward
        if (nextIndex > currentIndex) {
            let isValid = true;
            switch (currentIndex) {
                case 0: // Step 1: Date selection
                    isValid = validateDateSelection();
                    break;
                case 1: // Step 2: Vehicle selection
                    isValid = validateVehicleSelection();
                    break;
                case 2: // Step 3: Location selection
                    const from = document.getElementById('locationDropdown');
                    const to = document.getElementById('destinationDropdown');
                    if (from?.textContent.trim() === 'Select Location' || to?.textContent.trim() === 'Select Destination') {
                        alert('Please select both location and destination');
                        isValid = false;
                    }
                    break;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        }
    });

    // Enable next indicator when a slide becomes active
    bookingCarousel.addEventListener('slide.bs.carousel', function (e) {
        const nextIndex = e.to;
        if (indicators[nextIndex]) {
            indicators[nextIndex].disabled = false;
            indicators[nextIndex].classList.remove('disabled-indicator');
        }
    });

    // Prevent jumping ahead using indicators if disabled
    indicators.forEach((btn, index) => {
        btn.addEventListener('click', function (e) {
            if (btn.disabled) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // Add logic to prevent clicking "Continue" on the last slide
    bookingCarousel.addEventListener('slid.bs.carousel', function (e) {
        const totalSlides = bookingCarousel.querySelectorAll('.carousel-item').length;
        const currentIndex = [...bookingCarousel.querySelectorAll('.carousel-item')].indexOf(e.relatedTarget);

        continueButtons.forEach(btn => {
            if (currentIndex === totalSlides - 1) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });
    });

    // Next and previous button handling
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');

    // Next button handling
    nextBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const activeSlide = document.querySelector('.carousel-item.active');
            let isValid = true;

            // Check which slide is active and validate accordingly
            if (activeSlide.id === 'dateSlide') {
                isValid = validateDateSelection();
            } 
            else if (activeSlide.id === 'vehicleSlide') {
                isValid = validateVehicleSelection();
            }
            // Add other slide validations as needed

            // Only proceed if validation passed
            if (isValid) {
                carousel.next();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            carousel.prev();
        });
    });
}

// =================================================================
// VALIDATION HELPERS
// =================================================================
function showValidationError(elementId, message) {
    const element = document.getElementById(elementId);
    element.classList.add('is-invalid');
    
    // Create or update error message
    let errorDiv = element.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
        errorDiv = document.createElement('div');
        errorDiv.classList.add('invalid-feedback');
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    }
    errorDiv.textContent = message;
}

function clearValidationError(elementId) {
    const element = document.getElementById(elementId);
    element.classList.remove('is-invalid');
}

document.querySelector('form').addEventListener('submit', (e) => {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    if (!startDate || !endDate) {
        e.preventDefault();
        alert('Please select both start and end dates');
        return;
    }
    
    if (endDate < startDate) {
        e.preventDefault();
        document.getElementById('endDate').classList.add('is-invalid-date');
        document.querySelector('.invalid-date-feedback').style.display = 'block';
        alert('End date must be after start date');
    }
});