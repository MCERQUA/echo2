/* Financial Projections Calculator JavaScript */

// Trade-specific data for calculations
const tradeDefaults = {
    electrical: {
        avgJobSize: 350,
        revenueRange: { min: 60000, max: 80000, typical: 70000 },
        materialCost: 25,
        seasonality: 'steady'
    },
    plumbing: {
        avgJobSize: 400,
        revenueRange: { min: 65000, max: 85000, typical: 75000 },
        materialCost: 30,
        seasonality: 'moderate'
    },
    hvac: {
        avgJobSize: 450,
        revenueRange: { min: 70000, max: 90000, typical: 80000 },
        materialCost: 35,
        seasonality: 'high'
    },
    roofing: {
        avgJobSize: 1200,
        revenueRange: { min: 80000, max: 120000, typical: 100000 },
        materialCost: 40,
        seasonality: 'high'
    },
    general: {
        avgJobSize: 800,
        revenueRange: { min: 70000, max: 100000, typical: 85000 },
        materialCost: 35,
        seasonality: 'moderate'
    },
    flooring: {
        avgJobSize: 600,
        revenueRange: { min: 55000, max: 75000, typical: 65000 },
        materialCost: 45,
        seasonality: 'moderate'
    },
    painting: {
        avgJobSize: 500,
        revenueRange: { min: 50000, max: 70000, typical: 60000 },
        materialCost: 25,
        seasonality: 'moderate'
    },
    landscaping: {
        avgJobSize: 300,
        revenueRange: { min: 45000, max: 65000, typical: 55000 },
        materialCost: 30,
        seasonality: 'high'
    }
};

// Location multipliers
const locationMultipliers = {
    urban: { cost: 1.3, revenue: 1.4 },
    suburban: { cost: 1.0, revenue: 1.0 },
    rural: { cost: 0.8, revenue: 0.7 }
};

// Experience multipliers
const experienceMultipliers = {
    new: { efficiency: 0.7, pricing: 0.8 },
    some: { efficiency: 0.9, pricing: 0.95 },
    experienced: { efficiency: 1.1, pricing: 1.1 }
};

let calculationResults = {};

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    loadSavedInputs();
    
    // Add event listeners for auto-calculation
    const inputs = ['tradeType', 'location', 'experienceLevel', 'targetRevenue', 'averageJobSize'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateDefaults);
        }
    });
});

// Initialize calculator with defaults
function initializeCalculator() {
    const resultsDiv = document.getElementById('calculatorResults');
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }
}

// Update defaults based on trade selection
function updateDefaults() {
    const trade = document.getElementById('tradeType').value;
    const location = document.getElementById('location').value;
    const experience = document.getElementById('experienceLevel').value;
    
    if (!trade || !tradeDefaults[trade]) return;
    
    const tradeData = tradeDefaults[trade];
    const locationMult = locationMultipliers[location] || locationMultipliers.suburban;
    const expMult = experienceMultipliers[experience] || experienceMultipliers.some;
    
    // Update average job size if not manually set
    const avgJobInput = document.getElementById('averageJobSize');
    if (avgJobInput && !avgJobInput.value) {
        const adjustedJobSize = Math.round(tradeData.avgJobSize * locationMult.revenue * expMult.pricing);
        avgJobInput.value = adjustedJobSize;
    }
    
    // Update target revenue if not manually set
    const revenueInput = document.getElementById('targetRevenue');
    if (revenueInput && !revenueInput.value) {
        const adjustedRevenue = Math.round(tradeData.revenueRange.typical * locationMult.revenue * expMult.efficiency);
        revenueInput.value = adjustedRevenue;
    }
    
    // Update material cost percentage
    const materialCostSelect = document.getElementById('materialCostPercent');
    if (materialCostSelect) {
        materialCostSelect.value = tradeData.materialCost.toString();
    }
}

// Calculate financial projections
function calculateProjections() {
    if (!validateInputs()) {
        alert('Please fill in all required fields before calculating.');
        return;
    }
    
    const inputs = collectInputs();
    calculationResults = performCalculations(inputs);
    
    displayResults(calculationResults);
    
    // Show results section
    const resultsDiv = document.getElementById('calculatorResults');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Save inputs for future use
    saveInputs(inputs);
}

// Validate required inputs
function validateInputs() {
    const required = ['tradeType', 'targetRevenue', 'averageJobSize'];
    return required.every(id => {
        const element = document.getElementById(id);
        return element && element.value;
    });
}

// Collect all input values
function collectInputs() {
    return {
        tradeType: document.getElementById('tradeType').value,
        location: document.getElementById('location').value,
        experienceLevel: document.getElementById('experienceLevel').value,
        targetRevenue: parseFloat(document.getElementById('targetRevenue').value) || 0,
        averageJobSize: parseFloat(document.getElementById('averageJobSize').value) || 0,
        jobsPerMonth: parseFloat(document.getElementById('jobsPerMonth').value) || 0,
        vehicleCosts: parseFloat(document.getElementById('vehicleCosts').value) || 800,
        insuranceCosts: parseFloat(document.getElementById('insuranceCosts').value) || 1500,
        licensingCosts: parseFloat(document.getElementById('licensingCosts').value) || 300,
        marketingCosts: parseFloat(document.getElementById('marketingCosts').value) || 600,
        toolsCosts: parseFloat(document.getElementById('toolsCosts').value) || 400,
        otherCosts: parseFloat(document.getElementById('otherCosts').value) || 300,
        materialCostPercent: parseFloat(document.getElementById('materialCostPercent').value) || 30,
        fuelCostPercent: parseFloat(document.getElementById('fuelCostPercent').value) || 10,
        workingCapitalWeeks: parseFloat(document.getElementById('workingCapitalWeeks').value) || 8,
        seasonalBuffer: parseFloat(document.getElementById('seasonalBuffer').value) || 3
    };
}

// Perform all calculations
function performCalculations(inputs) {
    const scenarios = ['conservative', 'realistic', 'optimistic'];
    const results = {};
    
    scenarios.forEach(scenario => {
        results[scenario] = calculateScenario(inputs, scenario);
    });
    
    return results;
}

// Calculate specific scenario
function calculateScenario(inputs, scenario) {
    let multiplier;
    switch(scenario) {
        case 'conservative': multiplier = 0.75; break;
        case 'realistic': multiplier = 1.0; break;
        case 'optimistic': multiplier = 1.25; break;
        default: multiplier = 1.0;
    }
    
    const revenue = inputs.targetRevenue * multiplier;
    const jobsNeeded = Math.ceil(revenue / inputs.averageJobSize);
    const jobsPerMonth = Math.ceil(jobsNeeded / 12);
    
    // Calculate expenses
    const monthlyFixed = inputs.vehicleCosts + inputs.insuranceCosts + inputs.licensingCosts + 
                        inputs.marketingCosts + inputs.toolsCosts + inputs.otherCosts;
    const annualFixed = monthlyFixed * 12;
    
    const materialCosts = revenue * (inputs.materialCostPercent / 100);
    const fuelCosts = revenue * (inputs.fuelCostPercent / 100);
    const totalVariableCosts = materialCosts + fuelCosts;
    
    const totalExpenses = annualFixed + totalVariableCosts;
    const grossProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    
    // Working capital calculation
    const weeklyRevenue = revenue / 52;
    const workingCapitalNeeded = weeklyRevenue * inputs.workingCapitalWeeks;
    const seasonalBufferNeeded = monthlyFixed * inputs.seasonalBuffer;
    const totalCapitalNeeded = workingCapitalNeeded + seasonalBufferNeeded;
    
    // Break-even calculation
    const fixedCostsPerJob = annualFixed / jobsNeeded;
    const variableCostsPerJob = (inputs.averageJobSize * (inputs.materialCostPercent + inputs.fuelCostPercent)) / 100;
    const breakEvenJobSize = fixedCostsPerJob + variableCostsPerJob;
    
    return {
        scenario,
        revenue,
        jobsNeeded,
        jobsPerMonth,
        monthlyFixed,
        annualFixed,
        materialCosts,
        fuelCosts,
        totalVariableCosts,
        totalExpenses,
        grossProfit,
        profitMargin,
        workingCapitalNeeded,
        seasonalBufferNeeded,
        totalCapitalNeeded,
        breakEvenJobSize,
        hourlyEquivalent: grossProfit / 2080 // 40 hours/week * 52 weeks
    };
}

// Display calculation results
function displayResults(results) {
    Object.keys(results).forEach(scenario => {
        displayScenarioResults(scenario, results[scenario]);
    });
    
    displayCashFlowChart(results.realistic);
    displayBreakEvenAnalysis(results);
    displayFinancialRatios(results.realistic);
    displayRecommendations(results);
    displayActionItems(results);
}

// Display results for specific scenario
function displayScenarioResults(scenario, data) {
    const resultsDiv = document.getElementById(`${scenario}Results`);
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="scenario-summary">
            <div class="summary-grid">
                <div class="summary-item">
                    <h4>Annual Revenue</h4>
                    <p class="value">$${Math.round(data.revenue).toLocaleString()}</p>
                </div>
                <div class="summary-item">
                    <h4>Gross Profit</h4>
                    <p class="value ${data.grossProfit > 0 ? 'positive' : 'negative'}">
                        $${Math.round(data.grossProfit).toLocaleString()}
                    </p>
                    <small>(${Math.round(data.profitMargin)}% margin)</small>
                </div>
                <div class="summary-item">
                    <h4>Jobs Needed</h4>
                    <p class="value">${data.jobsNeeded} annually</p>
                    <small>(${data.jobsPerMonth} per month)</small>
                </div>
                <div class="summary-item">
                    <h4>Hourly Equivalent</h4>
                    <p class="value">$${Math.round(data.hourlyEquivalent)}/hour</p>
                    <small>Based on 40 hrs/week</small>
                </div>
            </div>
        </div>
        
        <div class="detailed-breakdown">
            <h4>Expense Breakdown</h4>
            <div class="expense-table">
                <div class="expense-row">
                    <span>Fixed Costs (Annual)</span>
                    <span>$${Math.round(data.annualFixed).toLocaleString()}</span>
                </div>
                <div class="expense-row">
                    <span>Material Costs</span>
                    <span>$${Math.round(data.materialCosts).toLocaleString()}</span>
                </div>
                <div class="expense-row">
                    <span>Fuel/Travel Costs</span>
                    <span>$${Math.round(data.fuelCosts).toLocaleString()}</span>
                </div>
                <div class="expense-row total">
                    <span><strong>Total Expenses</strong></span>
                    <span><strong>$${Math.round(data.totalExpenses).toLocaleString()}</strong></span>
                </div>
            </div>
        </div>
        
        <div class="capital-requirements">
            <h4>Capital Requirements</h4>
            <div class="capital-grid">
                <div class="capital-item">
                    <span>Working Capital</span>
                    <span>$${Math.round(data.workingCapitalNeeded).toLocaleString()}</span>
                </div>
                <div class="capital-item">
                    <span>Seasonal Buffer</span>
                    <span>$${Math.round(data.seasonalBufferNeeded).toLocaleString()}</span>
                </div>
                <div class="capital-item total">
                    <span><strong>Total Capital Needed</strong></span>
                    <span><strong>$${Math.round(data.totalCapitalNeeded).toLocaleString()}</strong></span>
                </div>
            </div>
        </div>
    `;
}

// Display cash flow chart
function displayCashFlowChart(data) {
    const chartDiv = document.getElementById('cashFlowChart');
    if (!chartDiv) return;
    
    const monthlyRevenue = data.revenue / 12;
    const monthlyExpenses = data.totalExpenses / 12;
    const monthlyCashFlow = monthlyRevenue - monthlyExpenses;
    
    // Create simple bar chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let chartHTML = '<div class="simple-chart">';
    months.forEach((month, index) => {
        const cumulativeCashFlow = monthlyCashFlow * (index + 1);
        const barHeight = Math.max(Math.abs(cumulativeCashFlow) / (data.revenue / 4), 10);
        const isPositive = cumulativeCashFlow >= 0;
        
        chartHTML += `
            <div class="chart-bar" style="height: ${barHeight}px; background: ${isPositive ? '#27ae60' : '#e74c3c'};">
                <div class="bar-label">${month}</div>
                <div class="bar-value">$${Math.round(cumulativeCashFlow / 1000)}K</div>
            </div>
        `;
    });
    chartHTML += '</div>';
    
    chartDiv.innerHTML = chartHTML + `
        <div class="chart-summary">
            <p><strong>Monthly Cash Flow:</strong> $${Math.round(monthlyCashFlow).toLocaleString()}</p>
            <p><strong>Break-even Month:</strong> ${monthlyCashFlow > 0 ? 'Month 1' : 'Negative cash flow - review expenses'}</p>
        </div>
    `;
}

// Display break-even analysis
function displayBreakEvenAnalysis(results) {
    const breakEvenDiv = document.getElementById('breakEvenResults');
    if (!breakEvenDiv) return;
    
    const realistic = results.realistic;
    
    breakEvenDiv.innerHTML = `
        <div class="break-even-grid">
            <div class="break-even-item">
                <h4>Break-even Job Size</h4>
                <p class="value">$${Math.round(realistic.breakEvenJobSize)}</p>
                <small>Minimum job size to cover costs</small>
            </div>
            <div class="break-even-item">
                <h4>Break-even Jobs/Month</h4>
                <p class="value">${Math.ceil(realistic.monthlyFixed / (realistic.revenue / realistic.jobsNeeded - realistic.breakEvenJobSize))}</p>
                <small>Jobs needed to cover fixed costs</small>
            </div>
            <div class="break-even-item">
                <h4>Safety Margin</h4>
                <p class="value">${Math.round(((realistic.revenue / realistic.jobsNeeded) / realistic.breakEvenJobSize - 1) * 100)}%</p>
                <small>Buffer above break-even</small>
            </div>
        </div>
    `;
}

// Display financial ratios
function displayFinancialRatios(data) {
    const ratiosDiv = document.getElementById('financialRatios');
    if (!ratiosDiv) return;
    
    const fixedCostRatio = (data.annualFixed / data.revenue) * 100;
    const variableCostRatio = (data.totalVariableCosts / data.revenue) * 100;
    const capitalTurnover = data.revenue / data.totalCapitalNeeded;
    
    ratiosDiv.innerHTML = `
        <div class="ratios-grid">
            <div class="ratio-item">
                <h4>Fixed Cost Ratio</h4>
                <p class="value">${Math.round(fixedCostRatio)}%</p>
                <small class="${fixedCostRatio < 40 ? 'good' : fixedCostRatio < 60 ? 'warning' : 'danger'}">
                    ${fixedCostRatio < 40 ? 'Good' : fixedCostRatio < 60 ? 'Acceptable' : 'High'}
                </small>
            </div>
            <div class="ratio-item">
                <h4>Variable Cost Ratio</h4>
                <p class="value">${Math.round(variableCostRatio)}%</p>
                <small class="${variableCostRatio < 50 ? 'good' : variableCostRatio < 70 ? 'warning' : 'danger'}">
                    ${variableCostRatio < 50 ? 'Good' : variableCostRatio < 70 ? 'Acceptable' : 'High'}
                </small>
            </div>
            <div class="ratio-item">
                <h4>Capital Turnover</h4>
                <p class="value">${Math.round(capitalTurnover * 10) / 10}x</p>
                <small class="${capitalTurnover > 2 ? 'good' : capitalTurnover > 1 ? 'warning' : 'danger'}">
                    ${capitalTurnover > 2 ? 'Efficient' : capitalTurnover > 1 ? 'Acceptable' : 'Low'}
                </small>
            </div>
            <div class="ratio-item">
                <h4>Profit Margin</h4>
                <p class="value">${Math.round(data.profitMargin)}%</p>
                <small class="${data.profitMargin > 20 ? 'good' : data.profitMargin > 10 ? 'warning' : 'danger'}">
                    ${data.profitMargin > 20 ? 'Excellent' : data.profitMargin > 10 ? 'Good' : 'Needs Work'}
                </small>
            </div>
        </div>
    `;
}

// Display recommendations
function displayRecommendations(results) {
    const recommendationsDiv = document.getElementById('recommendationsContent');
    if (!recommendationsDiv) return;
    
    const realistic = results.realistic;
    const recommendations = [];
    
    if (realistic.profitMargin < 15) {
        recommendations.push('💰 Increase pricing or reduce costs - profit margin is below industry standard');
    }
    
    if (realistic.jobsPerMonth > 25) {
        recommendations.push('👥 Consider hiring help - 25+ jobs per month is difficult to handle alone');
    }
    
    if (realistic.totalCapitalNeeded > realistic.revenue * 0.5) {
        recommendations.push('💳 Secure adequate financing - working capital requirements are high');
    }
    
    if (realistic.hourlyEquivalent < 30) {
        recommendations.push('⏰ Focus on efficiency - your hourly equivalent is below target rates');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('✅ Your projections look solid! Focus on execution and tracking actual vs projected performance.');
    }
    
    recommendationsDiv.innerHTML = `
        <div class="recommendations-list">
            ${recommendations.map(rec => `<div class="recommendation-item">${rec}</div>`).join('')}
        </div>
    `;
}

// Display action items
function displayActionItems(results) {
    const actionItemsDiv = document.getElementById('actionItems');
    if (!actionItemsDiv) return;
    
    const realistic = results.realistic;
    
    actionItemsDiv.innerHTML = `
        <div class="action-list">
            <div class="action-item">
                <strong>Secure Working Capital:</strong> Get access to $${Math.round(realistic.totalCapitalNeeded).toLocaleString()} before starting
            </div>
            <div class="action-item">
                <strong>Track Performance:</strong> Monitor actual vs projected numbers monthly
            </div>
            <div class="action-item">
                <strong>Build Cash Reserves:</strong> Save ${Math.round(realistic.profitMargin * 0.3)}% of profit for future expansion
            </div>
            <div class="action-item">
                <strong>Review Quarterly:</strong> Adjust projections based on actual performance
            </div>
        </div>
    `;
}

// Show specific scenario
function showScenario(scenario) {
    // Hide all scenarios
    document.querySelectorAll('.scenario-results').forEach(div => {
        div.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.scenario-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected scenario
    const selectedDiv = document.getElementById(`${scenario}Results`);
    if (selectedDiv) selectedDiv.style.display = 'block';
    
    // Add active class to selected tab
    event.target.classList.add('active');
}

// Save calculation inputs
function saveInputs(inputs) {
    localStorage.setItem('financialCalculatorInputs', JSON.stringify(inputs));
}

// Load saved inputs
function loadSavedInputs() {
    const saved = localStorage.getItem('financialCalculatorInputs');
    if (saved) {
        const inputs = JSON.parse(saved);
        Object.keys(inputs).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = inputs[key];
            }
        });
    }
}

// Save calculation results
function saveCalculation() {
    if (!calculationResults || Object.keys(calculationResults).length === 0) {
        alert('Please run calculations first before saving.');
        return;
    }
    
    const saveData = {
        inputs: collectInputs(),
        results: calculationResults,
        savedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Financial-Projections-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Calculation results saved successfully!');
}

// Reset calculator
function resetCalculator() {
    if (confirm('Are you sure you want to reset all inputs?')) {
        document.querySelectorAll('input, select').forEach(element => {
            if (element.type === 'number' || element.type === 'text') {
                element.value = '';
            } else if (element.type === 'select-one') {
                element.selectedIndex = 0;
            }
        });
        
        document.getElementById('calculatorResults').style.display = 'none';
        localStorage.removeItem('financialCalculatorInputs');
    }
}