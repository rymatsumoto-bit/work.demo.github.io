// ===== SUPABASE CONFIGURATION =====

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://kdwxugydvjdoaxwjhqqk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkd3h1Z3lkdmpkb2F4d2pocXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzE4NDAsImV4cCI6MjA4MDQ0Nzg0MH0.MfPhBS6SV1wKL8QXu_Bo5iP1rVyrsS4XaqAm69NQMKA";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===== SAMPLE DATA (Remove when using real Supabase data) =====
//const sampleHoldings = [
//    { security: 'AAPL', quantity: 1000, current_price: 180.50, cost_basis: 150.00, interest_rate: 12.5, credit_rating: 8.5, maturity_years: 2 },
//    { security: 'MSFT', quantity: 800, current_price: 380.25, cost_basis: 320.00, interest_rate: 15.2, credit_rating: 9.0, maturity_years: 5 },
//    { security: 'GOOGL', quantity: 500, current_price: 140.80, cost_basis: 120.00, interest_rate: 14.8, credit_rating: 8.8, maturity_years: 3 },
//    { security: 'AMZN', quantity: 600, current_price: 165.30, cost_basis: 140.00, interest_rate: 13.9, credit_rating: 8.2, maturity_years: 7 },
//    { security: 'TSLA', quantity: 400, current_price: 245.60, cost_basis: 200.00, interest_rate: 16.1, credit_rating: 7.5, maturity_years: 4 },
//    { security: 'META', quantity: 700, current_price: 425.90, cost_basis: 350.00, interest_rate: 14.3, credit_rating: 8.6, maturity_years: 1 },
//    { security: 'NVDA', quantity: 300, current_price: 495.20, cost_basis: 400.00, interest_rate: 15.7, credit_rating: 8.9, maturity_years: 10 },
//    { security: 'JPM', quantity: 900, current_price: 155.40, cost_basis: 130.00, interest_rate: 11.8, credit_rating: 9.2, maturity_years: 6 },
//    { security: 'BAC', quantity: 1200, current_price: 32.70, cost_basis: 28.00, interest_rate: 10.5, credit_rating: 8.7, maturity_years: 8 },
//    { security: 'WFC', quantity: 850, current_price: 48.90, cost_basis: 42.00, interest_rate: 11.2, credit_rating: 8.4, maturity_years: 3 }
//];

// ===== NAVIGATION FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            console.log('Navigating to:', this.textContent);
        });
    });

    // Load dashboard data
    loadDashboardData();
});

// ===== DATA LOADING FUNCTION =====
async function loadDashboardData() {
    try {
        // Option 1: Load from Supabase (uncomment when ready)
        //const { data: holdings, error } = await supabase
        //    .from('fixed_income_portfolio')
        //    .select('*');
        //if (error) throw error;

         // Parallel fetching: Both tables start loading at the same time
        const [holdingsResponse, creditRatingResponse] = await Promise.all([
            supabase.from('fixed_income_portfolio').select('*'),
            supabase.from('parm_credit_rating').select('*')
        ]);

        // Destructure data and check for errors for both requests
        const { data: holdings, error: holdingsError } = holdingsResponse;
        const { data: creditRatings, error: creditError } = creditRatingResponse;

        if (holdingsError) throw holdingsError;
        if (creditError) throw creditError;

        // Option 2: Use sample data (remove when using real data)
        // const holdings = sampleHoldings;

        // Calculate statistics
        const stats = calculateStatistics(holdings);
        
        // Update dashboard
        updateDashboard(stats);
        
        // Populate holdings table
        populateHoldingsTable(holdings);
        
        // Create charts
        createPerformanceChart();
        createAllocationChart(holdings);
        createMaturityChart(holdings);
        createCreditScatterChart(holdings, creditRatings);

        // Initialize table sorting
        initializeTableSorting();

    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ===== STATISTICS CALCULATION =====
function calculateStatistics(holdings) {
    const totalMarketValue = holdings.reduce((sum, h) => sum + h.market_value_usd, 0);
    // const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.cost_basis), 0);
    const weightedInterestRate = holdings.reduce((sum, h) => sum + h.coupon * h.market_value_usd, 0);
    const totalHoldings = holdings.length;
    
    // Calculate 12-month forecast (simplified)
    const avgInterestRate = weightedInterestRate / totalMarketValue;
    const annualReturn = totalMarketValue * (avgInterestRate / 100);
    
    return {
        totalNav: formatCurrency(totalMarketValue),
        avgRate: avgInterestRate.toFixed(1),
        holdingsCount: totalHoldings,
        cashflowForecast: formatCurrency(annualReturn),
        benchmarkDiff: 2.4 // This would come from your benchmark data
    };
}

// ===== UPDATE DASHBOARD =====
function updateDashboard(stats) {
    document.getElementById('totalNav').textContent = stats.totalNav;
    document.getElementById('totalHoldings').textContent = stats.holdingsCount + ' holdings';
    document.getElementById('avgRate').textContent = '+' + stats.avgRate + '%';
    document.getElementById('cashflowForecast').textContent = stats.cashflowForecast;
    document.getElementById('benchmark').textContent = '↑ ' + stats.benchmarkDiff + '% vs benchmark';
}

// ===== POPULATE HOLDINGS TABLE =====
function populateHoldingsTable(holdings) {
    currentHoldings = holdings; // Store for sorting
    const tbody = document.getElementById('holdingsTableBody');
    tbody.innerHTML = '';

    holdings.forEach(holding => {
        const value = holding.notional;
        const returnPct = ((holding.price/holding.cost_basis-1) * 100).toFixed(2);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${holding.ISIN}</td>
            <td>${holding.market_value_usd.toLocaleString()}</td>
            <td>${holding.notional.toLocaleString()}</td>
            <td>${holding.notional_ccy.toLocaleString()}</td>
            <td>${holding.price.toFixed(2)}</td>
            <td style="color: ${returnPct >= 0 ? '#6bc9a8' : '#ff6b6b'}">${returnPct}%</td>
        `;
        tbody.appendChild(row);
    });
}

// ===== CREATE PERFORMANCE CHART =====
function createPerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'NAV (M)',
                data: [95.2, 96.8, 97.5, 98.9, 99.7, 100.3, 100.8, 101.1, 101.4, 101.6, 101.7, 101.9],
                borderColor: '#6bc9a8',
                backgroundColor: 'rgba(107, 201, 168, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#7a9fb0', font: { size: 12 } }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#7a9fb0' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: { color: '#7a9fb0' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
}

// ===== CREATE ALLOCATION BAR CHART =====
function createAllocationChart(holdings) {
    const ctx = document.getElementById('allocationChart').getContext('2d');
    
    // Calculate allocation by security
    const allocations = holdings.slice(0, 11).map(h => ({
        label: h.gics_sector,
        value: h.market_value_usd
    }));

    allocations.sort((a, b) => b.value - a.value);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allocations.map(a => a.label),
            datasets: [{
                label: 'Value ($)',
                data: allocations.map(a => a.value),
                backgroundColor: '#6bc9a8',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: '#7a9fb0',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    ticks: { color: '#7a9fb0' },
                    grid: { display: false }
                }
            }
        }
    });
}


// ===== CREATE MATURITY EXPOSURE COLUMN CHART =====
function createMaturityChart(holdings) {
    const ctx = document.getElementById('maturityChart').getContext('2d');
    
    // Group holdings by maturity ranges
    const maturityRanges = {
        '0-2 years': 0,
        '3-5 years': 0,
        '6-8 years': 0,
        '9+ years': 0
    };

    holdings.forEach(h => {
        const value = h.market_value_usd;
        if (h.years_to_maturity <= 2) {
            maturityRanges['0-2 years'] += value;
        } else if (h.years_to_maturity <= 5) {
            maturityRanges['3-5 years'] += value;
        } else if (h.years_to_maturity <= 8) {
            maturityRanges['6-8 years'] += value;
        } else {
            maturityRanges['9+ years'] += value;
        }
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(maturityRanges),
            datasets: [{
                label: 'Exposure ($)',
                data: Object.values(maturityRanges),
                backgroundColor: [
                    '#6bc9a8',
                    '#5a9fb8',
                    '#8bb4c9',
                    '#7a9fb0'
                ],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: '#7a9fb0',
                        callback: function(value) {
                            return '$'+ (value / 1000000).toFixed(1) + 'M';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: { color: '#7a9fb0' },
                    grid: { display: false }
                }
            }
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function formatCurrency(value) {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toFixed(2);
}

// ===== CREATE CREDIT RATING vs INTEREST SCATTER PLOT =====
function createCreditScatterChart(holdings, creditRatings) {
    const ctx = document.getElementById('creditScatterChart').getContext('2d');

    // Defineing label mapping
    const ratingMap = {};
    creditRatings.forEach(r => {
        ratingMap[r.credit_rating_score] = r.sandp;
    });

    // Prepare scatter data
    const scatterData = holdings.map(h => ({
        x: h.credit_rating_score,
        y: h.coupon,
        label: h.issuer
    }));

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Holdings',
                data: scatterData,
                backgroundColor: '#6bc9a8',
                borderColor: '#5a9fb8',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#7a9fb0', font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            const ratingText = ratingMap[point.x] || point.x;
                            return `${point.label}: Rating ${point.x}, Interest ${point.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Interest Rate (%)',
                        color: '#7a9fb0'
                    },
                    ticks: { color: '#7a9fb0' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Credit Rating',
                        color: '#7a9fb0'
                    },
                    ticks: { color: '#7a9fb0' , stepsize: 1, callback: function(value) { return ratingMap[value] || value; },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    min: 7,
                    max: 10
                }
                }
            }
        }
    });
}

// ===== TABLE SORTING FUNCTIONALITY =====
let currentHoldings = [];
let sortState = { column: null, direction: 'asc' };

function initializeTableSorting() {
    const headers = document.querySelectorAll('.holdings-table th.sortable');
    
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const column = this.getAttribute('data-column');
            sortTable(column);
        });
    });
}

function sortTable(column) {
    // Toggle sort direction
    if (sortState.column === column) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.column = column;
        sortState.direction = 'asc';
    }

    // Sort the holdings array
    currentHoldings.sort((a, b) => {
        let aVal, bVal;

        switch(column) {
            case 'security':
                aVal = a.security;
                bVal = b.security;
                break;
            case 'market_value':
                aVal = a.market_value_usd;
                bVal = b.market_value_usd;
                break;
            case 'notional':
                aVal = a.notional;
                bVal = b.notional;
                break;
            case 'notional_ccy':
                aVal = a.notional_ccy;
                bVal = b.notional_ccy;
                break;
            case 'price':
                aVal = a.price;
                bVal = b.price;
                break;
            case 'return':
                aVal = a.price/a.cost_basis-1;
                bVal = b.price/b.cost_basis-1;
                break;
        }

        if (typeof aVal === 'string') {
            return sortState.direction === 'asc' 
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        } else {
            return sortState.direction === 'asc' 
                ? aVal - bVal
                : bVal - aVal;
        }
    });

    // Update table headers
    document.querySelectorAll('.holdings-table th.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });
    const activeHeader = document.querySelector(`th[data-column="${column}"]`);
    activeHeader.classList.add(sortState.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');

    // Re-render table
    populateHoldingsTable(currentHoldings);
};
