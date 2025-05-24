                        // Show thank you message
                        thankYou.classList.add('active');
                        submitBtn.style.display = 'none';
                        
                        // Clear feedback
                        feedbackCollection = {};
                        
                        // Reset all image cards
                        const cards = document.querySelectorAll('.image-card');
                        cards.forEach(card => {
                            card.className = 'image-card';
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
            
            // Event listeners
            modalClose.addEventListener('click', closeModal);
            approveBtn.addEventListener('click', () => saveFeedback('approved'));
            requestChangesBtn.addEventListener('click', () => saveFeedback('changes'));
            submitBtn.addEventListener('click', submitFeedback);
            zoomClose.addEventListener('click', closeZoom);
            
            // Close modal when clicking outside
            feedbackModal.addEventListener('click', function(e) {
                if (e.target === feedbackModal) {
                    closeModal();
                }
            });
            
            // Close zoom when clicking outside
            zoomModal.addEventListener('click', function(e) {
                if (e.target === zoomModal) {
                    closeZoom();
                }
            });
            
            // Close modals with escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    if (zoomModal.classList.contains('active')) {
                        closeZoom();
                    } else if (feedbackModal.classList.contains('active')) {
                        closeModal();
                    }
                }
            });
            
            // Initialize
            displayImages();
        });
    </script>
</body>
</html>