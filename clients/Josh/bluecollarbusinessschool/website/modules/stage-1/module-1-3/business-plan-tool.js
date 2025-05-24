/* Business Plan Tool JavaScript - Part 2 */

// Auto-save functionality
function autoSave() {
    planData = collectPlanData();
    localStorage.setItem('businessPlanData', JSON.stringify(planData));
    localStorage.setItem('businessPlanStep', currentStep.toString());
}

// Load saved data
function loadSavedData() {
    const savedData = localStorage.getItem('businessPlanData');
    const savedStep = localStorage.getItem('businessPlanStep');
    
    if (savedData) {
        planData = JSON.parse(savedData);
        populateFormFields(planData);
    }
    
    if (savedStep) {
        const step = parseInt(savedStep);
        if (step > 1) {
            // Hide current step and show saved step
            document.getElementById(`step${currentStep}`).classList.remove('active');
            currentStep = step;
            document.getElementById(`step${currentStep}`).classList.add('active');
            updateProgress();
            updateNavigation();
        }
    }
}

// Collect all plan data from form
function collectPlanData() {
    const data = {
        // Step 1: Business Overview
        businessName: document.getElementById('businessName')?.value || '',
        tradeType: document.getElementById('tradeType')?.value || '',
        otherTrade: document.getElementById('otherTrade')?.value || '',
        serviceTypes: document.getElementById('serviceTypes')?.value || '',
        
        // Step 2: Target Market
        customerTypes: Array.from(document.querySelectorAll('#step2 input[type="checkbox"]:checked')).map(cb => cb.value),
        targetIncome: document.getElementById('targetIncome')?.value || '',
        uniqueValue: document.getElementById('uniqueValue')?.value || '',
        
        // Step 3: Service Area
        primaryCity: document.getElementById('primaryCity')?.value || '',
        serviceRadius: document.getElementById('serviceRadius')?.value || '',
        additionalAreas: document.getElementById('additionalAreas')?.value || '',
        avoidAreas: document.getElementById('avoidAreas')?.value || '',
        
        // Step 4: Financial Projections
        year1Revenue: document.getElementById('year1Revenue')?.value || '',
        averageJob: document.getElementById('averageJob')?.value || '',
        monthlyExpenses: document.getElementById('monthlyExpenses')?.value || '',
        materialCostPercent: document.getElementById('materialCostPercent')?.value || '',
        
        // Step 5: Pricing Strategy
        hourlyRate: document.getElementById('hourlyRate')?.value || '',
        materialMarkup: document.getElementById('materialMarkup')?.value || '',
        emergencyRate: document.getElementById('emergencyRate')?.value || '',
        minimumCharge: document.getElementById('minimumCharge')?.value || '',
        
        // Step 6: Marketing Strategy
        marketingBudget: document.getElementById('marketingBudget')?.value || '',
        marketingChannels: Array.from(document.querySelectorAll('#step6 input[type="checkbox"]:checked')).map(cb => cb.value),
        networkingPlan: document.getElementById('networkingPlan')?.value || '',
        
        // Step 7: Growth Plan
        year2Goal: document.getElementById('year2Goal')?.value || '',
        year3Goal: document.getElementById('year3Goal')?.value || '',
        hiringPlan: document.getElementById('hiringPlan')?.value || '',
        equipmentPlan: document.getElementById('equipmentPlan')?.value || '',
        servicExpansion: document.getElementById('servicExpansion')?.value || '',
        
        // Step 8: Risk Management
        emergencyFund: document.getElementById('emergencyFund')?.value || '',
        seasonalStrategy: document.getElementById('seasonalStrategy')?.value || '',
        competitionResponse: document.getElementById('competitionResponse')?.value || '',
        businessInsurance: document.getElementById('businessInsurance')?.value || ''
    };
    
    return data;
}

// Populate form fields from saved data
function populateFormFields(data) {
    // Text inputs
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element && typeof data[key] === 'string') {
            element.value = data[key];
        }
    });
    
    // Checkboxes
    if (data.customerTypes) {
        data.customerTypes.forEach(type => {
            const checkbox = document.querySelector(`#step2 input[value="${type}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (data.marketingChannels) {
        data.marketingChannels.forEach(channel => {
            const checkbox = document.querySelector(`#step6 input[value="${channel}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Trigger updates after loading data
    setTimeout(() => {
        if (data.tradeType) {
            updateTradeGuidance(data.tradeType);
            showHideOtherTrade();
        }
        updateCustomerInsights();
        updateAreaEconomics();
        updateFinancialSummary();
        updatePricingExamples();
        updateMarketingROI();
        updateGrowthTimeline();
    }, 100);
}

// Generate the business plan
function generatePlan() {
    if (!validateStep(8)) {
        showValidationMessage();
        return;
    }
    
    planData = collectPlanData();
    const planHTML = createPlanHTML(planData);
    
    // Show the generated plan
    document.getElementById('planContent').innerHTML = planHTML;
    document.getElementById('generatedPlan').style.display = 'block';
    
    // Scroll to the plan
    document.getElementById('generatedPlan').scrollIntoView({ behavior: 'smooth' });
    
    // Save completed plan
    localStorage.setItem('completedBusinessPlan', JSON.stringify({
        data: planData,
        generatedAt: new Date().toISOString()
    }));
}

// Create HTML for the business plan
function createPlanHTML(data) {
    const tradeDisplay = data.tradeType === 'other' ? data.otherTrade : 
                        data.tradeType.charAt(0).toUpperCase() + data.tradeType.slice(1);
    
    return `
        <div class="business-plan-document">
            <div class="plan-header-section">
                <h1>${data.businessName || 'Your Business Name'}</h1>
                <h2>${tradeDisplay} Contractor Business Plan</h2>
                <p class="plan-date">Created: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="plan-section">
                <h3>🏢 Business Overview</h3>
                <div class="plan-content-grid">
                    <div class="plan-item">
                        <strong>Business Name:</strong> ${data.businessName}
                    </div>
                    <div class="plan-item">
                        <strong>Trade:</strong> ${tradeDisplay}
                    </div>
                    <div class="plan-item">
                        <strong>Services Offered:</strong><br>
                        ${data.serviceTypes || 'Not specified'}
                    </div>
                    <div class="plan-item">
                        <strong>Unique Value Proposition:</strong><br>
                        ${data.uniqueValue || 'Not specified'}
                    </div>
                </div>
            </div>
            
            <div class="plan-section">
                <h3>🎯 Target Market</h3>
                <div class="plan-content-grid">
                    <div class="plan-item">
                        <strong>Customer Types:</strong><br>
                        ${data.customerTypes.map(type => type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') || 'Not specified'}
                    </div>
                    <div class="plan-item">
                        <strong>Target Home Values:</strong><br>
                        ${data.targetIncome.replace('-', ' - $').replace('k', ',000') || 'Not specified'}
                    </div>
                </div>
            </div>
            
            <div class="plan-section">
                <h3>📍 Service Area</h3>
                <div class="plan-content-grid">
                    <div class="plan-item">
                        <strong>Primary Location:</strong> ${data.primaryCity}
                    </div>
                    <div class="plan-item">
                        <strong>Service Radius:</strong> ${data.serviceRadius} minutes
                    </div>
                    ${data.additionalAreas ? `<div class="plan-item"><strong>Additional Areas:</strong><br>${data.additionalAreas}</div>` : ''}
                </div>
            </div>
            
            <div class="plan-section">
                <h3>💰 Financial Projections</h3>
                <div class="financial-summary-table">
                    <table>
                        <tr>
                            <td><strong>Year 1 Revenue Goal:</strong></td>
                            <td>$${parseInt(data.year1Revenue || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td><strong>Average Job Value:</strong></td>
                            <td>$${parseInt(data.averageJob || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td><strong>Jobs Needed (Annual):</strong></td>
                            <td>${Math.round((data.year1Revenue || 0) / (data.averageJob || 1))}</td>
                        </tr>
                        <tr>
                            <td><strong>Monthly Fixed Expenses:</strong></td>
                            <td>$${parseInt(data.monthlyExpenses || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td><strong>Material Cost %:</strong></td>
                            <td>${data.materialCostPercent || 0}%</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <div class="plan-section">
                <h3>💵 Pricing Strategy</h3>
                <div class="plan-content-grid">
                    <div class="plan-item">
                        <strong>Hourly Rate:</strong> $${data.hourlyRate || 0}/hour
                    </div>
                    <div class="plan-item">
                        <strong>Material Markup:</strong> ${data.materialMarkup || 0}%
                    </div>
                    <div class="plan-item">
                        <strong>Emergency Rate:</strong> ${data.emergencyRate || 0}x normal
                    </div>
                    <div class="plan-item">
                        <strong>Minimum Charge:</strong> $${data.minimumCharge || 0}
                    </div>
                </div>
            </div>
            
            <div class="plan-section">
                <h3>📢 Marketing Strategy</h3>
                <div class="plan-content-grid">
                    <div class="plan-item">
                        <strong>Monthly Marketing Budget:</strong> $${data.marketingBudget || 0}
                    </div>
                    <div class="plan-item">
                        <strong>Marketing Channels:</strong><br>
                        ${data.marketingChannels.map(channel => channel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') || 'Not specified'}
                    </div>
                    ${data.networkingPlan ? `<div class="plan-item"><strong>Networking Plan:</strong><br>${data.networkingPlan}</div>` : ''}
                </div>
            </div>
            
            <div class="plan-section">
                <h3>📈 Growth Plan</h3>
                <div class="growth-timeline-table">
                    <table>
                        <tr>
                            <td><strong>Year 2 Goal:</strong></td>
                            <td>$${parseInt(data.year2Goal || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td><strong>Year 3 Goal:</strong></td>
                            <td>$${parseInt(data.year3Goal || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td><strong>First Employee:</strong></td>
                            <td>${data.hiringPlan.replace('-', ' ') || 'Not specified'}</td>
                        </tr>
                    </table>
                </div>
                ${data.equipmentPlan ? `<p><strong>Equipment Plans:</strong> ${data.equipmentPlan}</p>` : ''}
                ${data.servicExpansion ? `<p><strong>Service Expansion:</strong> ${data.servicExpansion}</p>` : ''}
            </div>
            
            <div class="plan-section">
                <h3>⚠️ Risk Management</h3>
                <div class="plan-content-grid">
                    <div class="plan-item">
                        <strong>Emergency Fund Target:</strong> $${parseInt(data.emergencyFund || 0).toLocaleString()}
                    </div>
                    ${data.seasonalStrategy ? `<div class="plan-item"><strong>Seasonal Strategy:</strong><br>${data.seasonalStrategy}</div>` : ''}
                    ${data.competitionResponse ? `<div class="plan-item"><strong>Competition Response:</strong><br>${data.competitionResponse}</div>` : ''}
                    ${data.businessInsurance ? `<div class="plan-item"><strong>Insurance Plan:</strong><br>${data.businessInsurance}</div>` : ''}
                </div>
            </div>
            
            <div class="plan-footer">
                <p><em>This plan was created using Blue Collar Business School's Business Plan Creator.</em></p>
                <p><em>Plan created: ${new Date().toLocaleDateString()} • Review and update quarterly</em></p>
            </div>
        </div>
    `;
}

// Download plan as PDF (simplified version)
function downloadPlan() {
    const planContent = document.getElementById('planContent').innerHTML;
    const businessName = planData.businessName || 'Business';
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${businessName} Business Plan</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .business-plan-document { max-width: 800px; margin: 0 auto; }
                .plan-header-section { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .plan-section { margin-bottom: 25px; page-break-inside: avoid; }
                .plan-section h3 { color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
                .plan-content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
                .plan-item { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 8px; border-bottom: 1px solid #eee; }
                .plan-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                @media print { body { margin: 20px; } }
            </style>
        </head>
        <body>
            ${planContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger download
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Print plan
function printPlan() {
    const planContent = document.getElementById('planContent').innerHTML;
    const businessName = planData.businessName || 'Business';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${businessName} Business Plan</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .business-plan-document { max-width: 800px; margin: 0 auto; }
                .plan-section { margin-bottom: 25px; }
                h1, h2, h3 { color: #2c3e50; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 8px; border-bottom: 1px solid #eee; }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            ${planContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Edit plan (go back to form)
function editPlan() {
    document.getElementById('generatedPlan').style.display = 'none';
    document.querySelector('.plan-creator').scrollIntoView({ behavior: 'smooth' });
}

// Clear all data (reset form)
function clearPlan() {
    if (confirm('Are you sure you want to clear all data and start over?')) {
        localStorage.removeItem('businessPlanData');
        localStorage.removeItem('businessPlanStep');
        location.reload();
    }
}

// Export data as JSON
function exportData() {
    const data = collectPlanData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.businessName || 'Business'}-Plan-Data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                populateFormFields(data);
                alert('Business plan data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Add export/import buttons
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const toolHeader = document.querySelector('.tool-header');
        if (toolHeader) {
            const utilityButtons = document.createElement('div');
            utilityButtons.innerHTML = `
                <div class="utility-buttons" style="margin-top: 1rem; text-align: center;">
                    <button class="btn btn-outline" onclick="exportData()" style="margin: 0 0.5rem;">💾 Export Data</button>
                    <label class="btn btn-outline" style="margin: 0 0.5rem; cursor: pointer;">
                        📁 Import Data
                        <input type="file" accept=".json" onchange="importData(event)" style="display: none;">
                    </label>
                    <button class="btn btn-outline" onclick="clearPlan()" style="margin: 0 0.5rem;">🗑️ Clear All</button>
                </div>
            `;
            toolHeader.appendChild(utilityButtons);
        }
    }, 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                autoSave();
                alert('Progress saved!');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentStep > 1) changeStep(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentStep < totalSteps) changeStep(1);
                break;
        }
    }
});

// Page visibility change handler (save when leaving page)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        autoSave();
    }
});

// Before unload handler
window.addEventListener('beforeunload', function() {
    autoSave();
});