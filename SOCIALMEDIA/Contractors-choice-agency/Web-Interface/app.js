document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageGallery = document.getElementById('image-gallery');
    const reviewPanel = document.getElementById('image-review-panel');
    const selectedImage = document.getElementById('selected-image');
    const selectedImageName = document.getElementById('selected-image-name');
    const feedbackNotes = document.getElementById('feedback-notes');
    const submitAllBtn = document.getElementById('submit-all-btn');
    const approveBtn = document.getElementById('approve-btn');
    const requestChangesBtn = document.getElementById('request-changes-btn');
    const cancelReviewBtn = document.getElementById('cancel-review-btn');
    const submissionMessage = document.getElementById('submission-message');
    const submissionSummary = document.getElementById('submission-summary');
    const continueBtn = document.getElementById('continue-btn');
    const reviewProgress = document.getElementById('review-progress');
    const totalImages = document.getElementById('total-images');
    const netlifyForm = document.getElementById('netlify-form');
    const feedbackData = document.getElementById('feedback-data');
    
    // Zoom elements
    const imageZoomOverlay = document.getElementById('image-zoom-overlay');
    const zoomedImage = document.getElementById('zoomed-image');
    const closeZoom = document.getElementById('close-zoom');
    
    let currentImageData = null;
    let feedbackCollection = {}; // Store feedback for all images
    
    // Hardcoded image list with direct URLs
    const imageList = [
        {
            name: 'did-you-know-claims-denied-when-violating-policy-warranties.png',
            title: 'Did You Know Claims Denied When Violating Policy Warranties',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-claims-denied-when-violating-policy-warranties.png'
        },
        {
            name: 'did-you-know-commercial-auto-policies-exclude-heavy-vehicles.png',
            title: 'Did You Know Commercial Auto Policies Exclude Heavy Vehicles',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-commercial-auto-policies-exclude-heavy-vehicles.png'
        },
        {
            name: 'did-you-know-driving-company-vehicles-outside-business-hours-not-covered.png',
            title: 'Did You Know Driving Company Vehicles Outside Business Hours Not Covered',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-driving-company-vehicles-outside-business-hours-not-covered.png'
        },
        {
            name: 'did-you-know-general-liability-coverage-crucial-for-contractors.png',
            title: 'Did You Know General Liability Coverage Crucial For Contractors',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-general-liability-coverage-crucial-for-contractors.png'
        },
        {
            name: 'did-you-know-general-liability-policies-exclude-roofing-operations.png',
            title: 'Did You Know General Liability Policies Exclude Roofing Operations',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-general-liability-policies-exclude-roofing-operations.png'
        },
        {
            name: 'did-you-know-independent-agents-help-fight-for-your-claims.png',
            title: 'Did You Know Independent Agents Help Fight For Your Claims',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-independent-agents-help-fight-for-your-claims.png'
        },
        {
            name: 'did-you-know-workers-compensation-covers-expenses-regardless-of-fault.png',
            title: 'Did You Know Workers Compensation Covers Expenses Regardless Of Fault',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-workers-compensation-covers-expenses-regardless-of-fault.png'
        },
        {
            name: 'did-you-know-workers-compensation-requirements-vary-by-state.png',
            title: 'Did You Know Workers Compensation Requirements Vary By State',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/did-you-know-workers-compensation-requirements-vary-by-state.png'
        },
        {
            name: 'do-contractors-need-general-liability-insurance.png',
            title: 'Do Contractors Need General Liability Insurance',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/do-contractors-need-general-liability-insurance.png'
        },
        {
            name: 'does-contractors-insurance-cover-all-work-types.png',
            title: 'Does Contractors Insurance Cover All Work Types',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/does-contractors-insurance-cover-all-work-types.png'
        },
        {
            name: 'how-insurance-agents-help-with-contractor-claims.png',
            title: 'How Insurance Agents Help With Contractor Claims',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/how-insurance-agents-help-with-contractor-claims.png'
        },
        {
            name: 'how-to-choose-right-insurance-for-contracting-business.png',
            title: 'How To Choose Right Insurance For Contracting Business',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/how-to-choose-right-insurance-for-contracting-business.png'
        },
        {
            name: 'how-workers-compensation-protects-contracting-businesses.png',
            title: 'How Workers Compensation Protects Contracting Businesses',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/how-workers-compensation-protects-contracting-businesses.png'
        },
        {
            name: 'protecting-contractors-nationwide-insurance-solutions-experienced-provider.png',
            title: 'Protecting Contractors Nationwide Insurance Solutions Experienced Provider',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/protecting-contractors-nationwide-insurance-solutions-experienced-provider.png'
        },
        {
            name: 'what-claims-covered-by-contractors-insurance.png',
            title: 'What Claims Covered By Contractors Insurance',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/what-claims-covered-by-contractors-insurance.png'
        },
        {
            name: 'what-happens-when-insurance-policy-warranties-violated.png',
            title: 'What Happens When Insurance Policy Warranties Violated',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/what-happens-when-insurance-policy-warranties-violated.png'
        },
        {
            name: 'what-roofing-exclusions-mean-for-contractor-insurance.png',
            title: 'What Roofing Exclusions Mean For Contractor Insurance',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/what-roofing-exclusions-mean-for-contractor-insurance.png'
        },
        {
            name: 'when-business-vehicles-covered-by-contractor-insurance.png',
            title: 'When Business Vehicles Covered By Contractor Insurance',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/when-business-vehicles-covered-by-contractor-insurance.png'
        },
        {
            name: 'why-contractors-need-specialized-insurance-coverage.png',
            title: 'Why Contractors Need Specialized Insurance Coverage',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/why-contractors-need-specialized-insurance-coverage.png'
        },
        {
            name: 'why-contractors-need-workers-compensation-insurance.png',
            title: 'Why Contractors Need Workers Compensation Insurance',
            url: 'https://raw.githubusercontent.com/MCERQUA/ECHO2/main/SOCIALMEDIA/Contractors-choice-agency/New-Uploads/why-contractors-need-workers-compensation-insurance.png'
        }
    ];
    
    // Display images in the gallery
    function displayImages() {
        console.log('Starting to display images...');
        imageGallery.innerHTML = '<div class="loading">Loading images...</div>';
        
        try {
            if (imageList.length === 0) {
                imageGallery.innerHTML = '<div class="no-images">No images found.</div>';
                return;
            }
            
            // Clear loading message
            imageGallery.innerHTML = '';
            
            // Update total images count
            totalImages.textContent = imageList.length;
            reviewProgress.textContent = '0';
            
            console.log(`Creating ${imageList.length} image cards`);
            
            // Create image cards and add to gallery
            imageList.forEach(image => {
                const card = createImageCard(image);
                imageGallery.appendChild(card);
            });
        } catch (error) {
            console.error('Error displaying images:', error);
            imageGallery.innerHTML = `<div class="error">Error loading images: ${error.message}. Please refresh the page to try again.</div>`;
        }
    }
    
    // Create an image card element
    function createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.imageName = image.name;
        
        card.innerHTML = `
            <div class="image-container">
                <img src="${image.url}" alt="${image.title}" onerror="this.onerror=null; this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 300 200\' preserveAspectRatio=\'none\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%23f5f5f5\'%3E%3C/rect%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'sans-serif\' font-size=\'16\' fill=\'%23999\'%3EImage\n${image.title}\n(loading error)%3C/text%3E%3C/svg%3E';">
            </div>
            <div class="image-info">
                <h3 class="image-title">${image.title}</h3>
            </div>
        `;
        
        // Add event listener to the card
        card.addEventListener('click', () => selectImage(image));
        
        return card;
    }
    
    // Update the review progress counter
    function updateReviewProgress() {
        const reviewedCount = Object.keys(feedbackCollection).length;
        reviewProgress.textContent = reviewedCount;
        
        // Enable submit button if at least one image has been reviewed
        submitAllBtn.disabled = reviewedCount === 0;
    }
    
    // Show the zoomed image
    function showZoomedImage(imageSrc, alt) {
        zoomedImage.src = imageSrc;
        zoomedImage.alt = alt;
        imageZoomOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Hide the zoomed image
    function hideZoomedImage() {
        imageZoomOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    // Select an image for review
    function selectImage(image) {
        currentImageData = image;
        
        // Update the form fields
        selectedImage.src = image.url;
        selectedImage.alt = image.title;
        selectedImageName.textContent = image.title;
        
        // Check if we already have feedback for this image
        if (feedbackCollection[image.name]) {
            const feedback = feedbackCollection[image.name];
            feedbackNotes.value = feedback.notes || '';
        } else {
            feedbackNotes.value = '';
        }
        
        // Add error handler for the selected image
        selectedImage.onerror = function() {
            this.onerror = null;
            this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300\' preserveAspectRatio=\'none\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f5f5f5\'%3E%3C/rect%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'sans-serif\' font-size=\'18\' fill=\'%23999\'%3EImage\n${image.title}\n(unable to load preview)%3C/text%3E%3C/svg%3E';
        };
        
        // Show review panel
        reviewPanel.classList.remove('hidden');
        
        // Scroll to review panel
        reviewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Save feedback for the current image
    function saveFeedback(status) {
        if (!currentImageData) return;
        
        const imageName = currentImageData.name;
        let notes = feedbackNotes.value.trim();
        
        // Add default note for approved images without notes
        if (status === 'approved' && notes === '') {
            notes = 'Approved for use.';
        }
        
        // Save the feedback
        feedbackCollection[imageName] = {
            status: status,
            notes: notes,
            title: currentImageData.title
        };
        
        // Update the image card to show it's been reviewed
        const card = document.querySelector(`.image-card[data-image-name="${imageName}"]`);
        if (card) {
            card.classList.add('reviewed');
            card.classList.remove('approved', 'changes-requested');
            card.classList.add(status);
        }
        
        // Update progress counter
        updateReviewProgress();
        
        // Hide review panel
        reviewPanel.classList.add('hidden');
        currentImageData = null;
        
        // Scroll back to the gallery
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Submit all feedback to Netlify
    function submitAllFeedback() {
        if (Object.keys(feedbackCollection).length === 0) {
            alert('Please review at least one image before submitting.');
            return;
        }
        
        // Prepare data for submission
        const submissionData = {
            timestamp: new Date().toISOString(),
            totalReviewed: Object.keys(feedbackCollection).length,
            feedback: []
        };
        
        // Add each image feedback to the data
        for (const [imageName, feedback] of Object.entries(feedbackCollection)) {
            submissionData.feedback.push({
                imageName: imageName,
                title: feedback.title,
                status: feedback.status,
                notes: feedback.notes
            });
        }
        
        // Convert to JSON string and set as form value
        feedbackData.value = JSON.stringify(submissionData);
        
        // Submit the form using fetch API
        const formData = new FormData(netlifyForm);
        
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (response.ok) {
                // Show success message
                displaySubmissionSummary();
                submissionMessage.classList.remove('hidden');
                
                // Clear all feedback collection
                feedbackCollection = {};
                updateReviewProgress();
                
                // Reset all image cards
                const cards = document.querySelectorAll('.image-card');
                cards.forEach(card => {
                    card.classList.remove('reviewed', 'approved', 'changes-requested');
                });
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your feedback. Please try again.');
        });
    }
    
    // Display a summary of what was submitted
    function displaySubmissionSummary() {
        // Create HTML for the summary
        let summaryHtml = '<strong>Summary of submitted feedback:</strong><br><ul>';
        
        const approved = [];
        const changesRequested = [];
        
        // Get all feedback items
        for (const [imageName, feedback] of Object.entries(feedbackCollection)) {
            if (feedback.status === 'approved') {
                approved.push(feedback.title);
            } else {
                changesRequested.push({
                    title: feedback.title,
                    notes: feedback.notes
                });
            }
        }
        
        // Add approved items
        if (approved.length > 0) {
            summaryHtml += '<li><strong>Approved:</strong> ' + approved.join(', ') + '</li>';
        }
        
        // Add changes requested items
        if (changesRequested.length > 0) {
            summaryHtml += '<li><strong>Changes requested:</strong><ul>';
            changesRequested.forEach(item => {
                summaryHtml += `<li>${item.title}: "${item.notes}"</li>`;
            });
            summaryHtml += '</ul></li>';
        }
        
        summaryHtml += '</ul>';
        
        // Update the summary element
        submissionSummary.innerHTML = summaryHtml;
    }
    
    // Event Handlers
    approveBtn.addEventListener('click', function() {
        saveFeedback('approved');
    });
    
    requestChangesBtn.addEventListener('click', function() {
        if (feedbackNotes.value.trim() === '') {
            alert('Please provide notes about what changes are needed.');
            feedbackNotes.focus();
            return;
        }
        saveFeedback('changes-requested');
    });
    
    cancelReviewBtn.addEventListener('click', function() {
        reviewPanel.classList.add('hidden');
        currentImageData = null;
    });
    
    submitAllBtn.addEventListener('click', submitAllFeedback);
    
    continueBtn.addEventListener('click', function() {
        submissionMessage.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Image zoom functionality
    selectedImage.addEventListener('click', function() {
        showZoomedImage(this.src, this.alt);
    });
    
    closeZoom.addEventListener('click', hideZoomedImage);
    
    imageZoomOverlay.addEventListener('click', function(e) {
        if (e.target === imageZoomOverlay) {
            hideZoomedImage();
        }
    });
    
    // Close zoom with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imageZoomOverlay.classList.contains('active')) {
            hideZoomedImage();
        }
    });
    
    // Initialize the gallery
    console.log('Initializing gallery...');
    displayImages();
});