document.addEventListener('DOMContentLoaded', function () {
    // Initialize the carousel
    const bookingCarousel = document.getElementById('bookingCarousel');
    const carousel = new bootstrap.Carousel(bookingCarousel, {
        interval: false,
        wrap: false
    });

    // Get all navigation elements
    const dateContinueBtn = document.querySelector('#dateSlide .next-btn');
    const vehicleContinueBtn = document.getElementById('vehicleContinueBtn');
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

        // Handle passenger selection for car
        document.querySelectorAll('#carSelection .dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('passengerDropdown').textContent = this.textContent;
            });
        });
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

    // CAROUSEL NAVIGATION =========================================
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
                
                if (activeSlide.id === 'dateSlide') {
                    if (!validateDates()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
                else if (activeSlide.id === 'vehicleSlide') {
                    if (!validateVehicleSelection()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
                
                // Explicitly trigger the slide change
                carousel.next();
            });
        });

        // Handle previous button clicks
        prevBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                carousel.prev();
            });
        });

        // Update indicators as user progresses
        bookingCarousel.addEventListener('slid.bs.carousel', function(e) {
            const currentIndex = e.to;
            indicators.forEach((indicator, index) => {
                indicator.disabled = index > currentIndex;
                indicator.classList.toggle('disabled-indicator', index > currentIndex);
            });
        });
    }

    // AVAILABILITY CHECK ==========================================
    function setupAvailabilityCheck() {
        const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');
        const priceDisplay = document.getElementById('priceDisplay');
        const emailInputContainer = document.getElementById('emailInputContainer');
        const paymentFormContainer = document.getElementById('paymentFormContainer');
        const confirmBookingBtn = document.getElementById('confirmBookingBtn');

        if (checkAvailabilityBtn) {
            checkAvailabilityBtn.addEventListener('click', function() {
                // Validate all required fields
                const startDate = document.getElementById('startDate').value;
                const vehicleType = document.querySelector('#dropdownMenuButton').textContent.trim();
                const fromLocation = document.getElementById('fromLocation').value;
                const toLocation = document.getElementById('toLocation').value;

                // Basic validation
                if (!startDate) {
                    alert('Please select a start date');
                    return;
                }

                if (vehicleType === 'Select bus/car/train') {
                    alert('Please select a vehicle type');
                    return;
                }

                if (!fromLocation || !toLocation) {
                    alert('Please select both departure and destination locations');
                    return;
                }

                if (fromLocation === toLocation) {
                    alert('Departure and destination cannot be the same');
                    return;
                }

                // Vehicle-specific validation
                if (vehicleType === 'car') {
                    const passengerCount = document.getElementById('passengerDropdown').textContent;
                    if (passengerCount === 'Number of Passengers') {
                        alert('Please select number of passengers');
                        return;
                    }
                } else if (vehicleType === 'bus' || vehicleType === 'train') {
                    const modelDropdown = document.getElementById(`${vehicleType}ModelDropdown`);
                    if (!modelDropdown || !modelDropdown.value) {
                        alert(`Please select a ${vehicleType} model`);
                        return;
                    }

                    const selectedSeat = document.querySelector(`#${vehicleType}Accordion .seat-btn.selected`);
                    if (!selectedSeat) {
                        alert(`Please select a seat for the ${vehicleType}`);
                        return;
                    }
                }

                // Calculate price
                const price = calculatePrice(vehicleType, fromLocation, toLocation);

                // Display results
                if (priceDisplay) {
                    priceDisplay.style.display = 'block';
                    document.getElementById('priceBreakdown').innerHTML = `
                        <p>Vehicle: ${vehicleType}</p>
                        <p>From: ${fromLocation}</p>
                        <p>To: ${toLocation}</p>
                        <p>Date: ${startDate}</p>
                    `;
                    document.getElementById('totalPrice').textContent = `Total: KES ${price.toFixed(2)}`;
                }

                // Show additional form elements
                if (emailInputContainer) emailInputContainer.style.display = 'block';
                if (paymentFormContainer) paymentFormContainer.style.display = 'block';
                if (confirmBookingBtn) confirmBookingBtn.style.display = 'block';
            });
        }
    }

    // PRICE CALCULATION ===========================================
    function calculatePrice(vehicleType, fromLocation, toLocation) {
        // Mock locations and prices
        const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi', 'Kakamega', 'Nyeri'];
        const prices = {
            car: [0, 5000, 3500, 2000, 4000, 1500, 3800, 5500, 4200, 1800],
            bus: [0, 3000, 2000, 1500, 2500, 1000, 2300, 3500, 2700, 1200],
            train: [0, 4000, 2500, 1800, 3000, 1300, 2800, 4200, 3200, 1500]
        };

        const fromIndex = locations.indexOf(fromLocation);
        const toIndex = locations.indexOf(toLocation);

        if (fromIndex === -1 || toIndex === -1) return 0;

        // Get base price
        let price = Math.abs(prices[vehicleType.toLowerCase()][toIndex] - prices[vehicleType.toLowerCase()][fromIndex]);

        // Adjust for car passengers
        if (vehicleType === 'car') {
            const passengerCount = parseInt(document.getElementById('passengerDropdown').textContent) || 1;
            price *= passengerCount;
        }

        return price;
    }

    // BOOKING CONFIRMATION ========================================
    function setupBookingConfirmation() {
        const confirmBookingBtn = document.getElementById('confirmBookingBtn');
        const resendEmailBtn = document.getElementById('resendEmailBtn');

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

        if (resendEmailBtn) {
            resendEmailBtn.addEventListener('click', function() {
                alert('Confirmation email resent!');
            });
        }
    }

    // MAIN INITIALIZATION =========================================
    setupDatepickers();
    setupVehicleSelection();
    setupSeatSelection();
    setupCarouselNavigation();
    setupAvailabilityCheck();
    setupBookingConfirmation();
});