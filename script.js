/**
 * Portfolio Insight Dashboard
 * Interactive Investment Analysis Application
 * 
 * Pure JavaScript - No frameworks
 */

// ========================================
// Global State
// ========================================
const state = {
    data: [],
    startCapital: 10000000, // 10 MNOK
    currentPortfolio: {
        stocks: 20, // % - Aksjer Global
        riskFree: 20, // % - Bank (Risikofri)
        highYield: 20, // % - High Yield
        nordicStocks: 20, // % - Nordiske aksjer
        emergingMarkets: 20 // % - Emerging Markets
    },
    newPortfolio: {
        stocks: 20, // % - Aksjer Global
        riskFree: 20, // % - Bank (Risikofri)
        highYield: 20, // % - High Yield
        nordicStocks: 20, // % - Nordiske aksjer
        emergingMarkets: 20 // % - Emerging Markets
    },
    charts: {
        overview: null,
        comparison: null,
        equity: null,
        drawdown: null,
        nurse: null,
        allocation: null,
        currentTreemap: null,
        newTreemap: null
    },
    fullscreenChart: null,
    drawdownZoom: {
        isZoomed: false,
        minX: null,
        maxX: null
    },
    selectedDrawdownPortfolio: 'current',
    selectedDrawdownView: 'percent', // 'percent' or 'kr'
    selectedPeriod: 'max', // Options: 'ytd', '12m', '3y', '5y', '10y', 'max'
    portfolioComparisonChartType: 'overview', // 'overview' or 'asset-classes'
    allocationRebalancing: false, // true = med rebalansering, false = uten rebalansering (default)
    selectedAssetClass: null // Selected asset class for filtering (null = no filter)
};

// ========================================
// CSV Data (Embedded for CORS compatibility)
// ========================================
const csvData = `Dato,Risikofri_Rente,High_Yield,Aksjer_Global,Sykepleier_Lonn
1995-01-01,100.00,100.00,100.00,220000
1995-04-01,101.25,101.80,105.20,220000
1995-07-01,102.51,103.64,112.45,220000
1995-10-01,103.78,105.50,108.30,220000
1996-01-01,105.07,107.40,115.80,228000
1996-04-01,106.37,109.32,122.50,228000
1996-07-01,107.68,111.28,128.90,228000
1996-10-01,109.01,113.27,135.20,228000
1997-01-01,110.35,115.29,142.80,237000
1997-04-01,111.71,117.35,155.30,237000
1997-07-01,113.08,119.44,168.20,237000
1997-10-01,114.47,121.57,162.50,237000
1998-01-01,115.87,123.74,175.80,246000
1998-04-01,117.29,125.94,182.30,246000
1998-07-01,118.72,128.18,170.50,246000
1998-10-01,120.17,118.50,155.80,246000
1999-01-01,121.63,122.40,168.90,256000
1999-04-01,123.11,126.50,185.60,256000
1999-07-01,124.61,130.70,195.20,256000
1999-10-01,126.12,135.10,215.80,256000
2000-01-01,127.65,139.60,238.50,267000
2000-04-01,129.19,144.30,225.30,267000
2000-07-01,130.75,149.10,210.80,267000
2000-10-01,132.33,142.50,195.60,267000
2001-01-01,133.92,136.80,185.20,278000
2001-04-01,135.53,131.50,175.80,278000
2001-07-01,137.16,126.60,165.30,278000
2001-10-01,138.80,122.10,148.90,278000
2002-01-01,140.46,118.20,142.50,290000
2002-04-01,142.14,114.80,138.20,290000
2002-07-01,143.84,111.90,125.60,290000
2002-10-01,145.56,109.50,118.30,290000
2003-01-01,147.29,112.80,115.20,302000
2003-04-01,149.05,118.50,125.80,302000
2003-07-01,150.82,124.60,138.50,302000
2003-10-01,152.61,131.20,152.80,302000
2004-01-01,154.42,138.30,165.30,315000
2004-04-01,156.25,145.80,172.50,315000
2004-07-01,158.10,153.70,178.20,315000
2004-10-01,159.97,162.10,188.60,315000
2005-01-01,161.86,171.00,198.50,329000
2005-04-01,163.77,180.40,205.80,329000
2005-07-01,165.70,190.30,215.60,329000
2005-10-01,167.66,200.80,228.30,329000
2006-01-01,169.63,211.90,245.80,343000
2006-04-01,171.63,223.50,258.60,343000
2006-07-01,173.65,235.80,268.30,343000
2006-10-01,175.69,248.60,282.50,343000
2007-01-01,177.76,262.10,298.80,358000
2007-04-01,179.84,276.20,315.60,358000
2007-07-01,181.95,290.90,328.50,358000
2007-10-01,184.08,275.80,312.30,358000
2008-01-01,186.24,260.50,285.60,374000
2008-04-01,188.42,245.80,268.30,374000
2008-07-01,190.63,215.60,242.50,374000
2008-10-01,192.86,175.30,178.60,374000
2009-01-01,195.12,158.20,155.80,391000
2009-04-01,197.40,175.60,178.50,391000
2009-07-01,199.71,195.80,205.30,391000
2009-10-01,202.04,218.50,232.80,391000
2010-01-01,204.40,242.80,258.60,408000
2010-04-01,206.78,268.50,275.30,408000
2010-07-01,209.19,295.80,268.50,408000
2010-10-01,211.62,324.60,298.60,408000
2011-01-01,214.08,355.20,318.50,426000
2011-04-01,216.57,388.60,335.80,426000
2011-07-01,219.08,378.50,305.60,426000
2011-10-01,221.62,365.80,285.30,426000
2012-01-01,224.19,378.50,315.60,445000
2012-04-01,226.79,392.80,338.50,445000
2012-07-01,229.41,408.50,355.80,445000
2012-10-01,232.06,425.60,378.50,445000
2013-01-01,234.74,445.80,412.30,465000
2013-04-01,237.45,468.50,438.60,465000
2013-07-01,240.18,492.80,465.80,465000
2013-10-01,242.95,518.60,498.50,465000
2014-01-01,245.74,545.80,525.60,486000
2014-04-01,248.56,575.50,548.30,486000
2014-07-01,251.41,608.80,565.80,486000
2014-10-01,254.29,642.50,582.50,486000
2015-01-01,257.20,678.60,598.60,508000
2015-04-01,260.14,718.50,625.30,508000
2015-07-01,263.11,762.80,598.50,508000
2015-10-01,266.11,798.60,615.80,508000
2016-01-01,269.14,825.50,585.60,531000
2016-04-01,272.20,858.80,618.50,531000
2016-07-01,275.30,895.60,645.80,531000
2016-10-01,278.42,935.80,678.30,531000
2017-01-01,281.58,978.50,715.60,555000
2017-04-01,284.77,1025.80,755.80,555000
2017-07-01,287.99,1078.50,798.50,555000
2017-10-01,291.24,1135.80,845.60,555000
2018-01-01,294.53,1198.60,895.80,580000
2018-04-01,297.85,1268.50,925.60,580000
2018-07-01,301.20,1345.80,958.50,580000
2018-10-01,304.59,1285.60,875.30,580000
2019-01-01,308.01,1365.80,915.60,606000
2019-04-01,311.47,1458.50,985.80,606000
2019-07-01,314.96,1565.80,1025.50,606000
2019-10-01,318.49,1685.60,1085.80,606000
2020-01-01,322.05,1815.80,1145.60,633000
2020-04-01,325.65,1525.60,885.30,633000
2020-07-01,329.29,1685.80,1025.50,633000
2020-10-01,332.96,1875.50,1185.80,633000
2021-01-01,336.67,2085.60,1325.60,661000
2021-04-01,340.42,2325.80,1485.80,661000
2021-07-01,344.20,2598.50,1625.60,661000
2021-10-01,348.02,2885.80,1785.30,661000
2022-01-01,351.88,3025.60,1685.80,690000
2022-04-01,355.78,2785.50,1485.60,690000
2022-07-01,359.72,2565.80,1385.30,690000
2022-10-01,363.70,2685.60,1485.80,690000
2023-01-01,367.72,2885.80,1585.60,720000
2023-04-01,371.78,3125.50,1725.80,720000
2023-07-01,375.88,3385.80,1865.50,720000
2023-10-01,380.02,3565.60,1985.30,720000
2024-01-01,384.21,3785.80,2125.60,751000
2024-04-01,388.43,3985.50,2285.80,751000
2024-07-01,392.70,4185.80,2425.60,751000
2024-10-01,397.01,4385.60,2565.30,751000
2024-12-01,400.25,4525.80,2685.50,751000`;

// ========================================
// CSV Parser
// ========================================
function parseCSV(csvString) {
    const lines = csvString.trim().split('\n');
    // Check if using semicolon separator (new format) or comma (old format)
    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separator);
        const row = {};
        
        headers.forEach((header, index) => {
            let value = values[index];
            if (!value) return; // Skip empty values
            
            value = value.trim();
            
            // Handle date parsing - support both DD.MM.YYYY and YYYY-MM-DD formats
            if (header.toLowerCase() === 'dato') {
                if (value.includes('.')) {
                    // DD.MM.YYYY format
                    const [day, month, year] = value.split('.');
                    row.date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                    // YYYY-MM-DD format
                    row.date = new Date(value);
                }
            } else if (header.toLowerCase().includes('globale aksjer')) {
                // Convert comma to dot for decimal separator, remove spaces
                const numValue = value.replace(/\s/g, '').replace(',', '.');
                row.stocks = parseFloat(numValue);
            } else if (header.toLowerCase().includes('risikofri rente')) {
                const numValue = value.replace(/\s/g, '').replace(',', '.');
                row.riskFree = parseFloat(numValue);
            } else if (header.toLowerCase().includes('high yield')) {
                const numValue = value.replace(/\s/g, '').replace(',', '.');
                row.highYield = parseFloat(numValue);
            } else if (header.toLowerCase().includes('norske aksjer')) {
                const numValue = value.replace(/\s/g, '').replace(',', '.');
                row.nordicStocks = parseFloat(numValue);
            } else if (header.toLowerCase().includes('emerging markets')) {
                const numValue = value.replace(/\s/g, '').replace(',', '.');
                row.emergingMarkets = parseFloat(numValue);
            } else if (header.toLowerCase().includes('sykepleierlønn') || header.toLowerCase().includes('sykepleier_lonn')) {
                const numValue = value.replace(/\s/g, '').replace(',', '.');
                row.nurseSalary = parseFloat(numValue);
            } else if (header.toLowerCase() === 'kpi') {
                const numValue = value.replace(/\s/g, '').replace(',', '.');
                row.kpi = parseFloat(numValue);
            }
        });
        
        // Only add row if it has a date
        if (row.date) {
            data.push(row);
        }
    }
    
    return data;
}

// ========================================
// Period Filtering
// ========================================
function getFilteredData() {
    const now = new Date();
    const data = state.data;
    
    if (data.length === 0) return [];
    
    let startDate;
    
    switch (state.selectedPeriod) {
        case 'ytd':
            // Year to date - from January 1st of current year
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case '12m':
            // Last 12 months
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        case '3y':
            // Last 3 years
            startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            break;
        case '5y':
            // Last 5 years
            startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            break;
        case '10y':
            // Last 10 years
            startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
            break;
        case 'max':
        default:
            // All data
            return data;
    }
    
    // Filter data from startDate onwards
    const filteredData = data.filter(row => row.date >= startDate);
    
    // If no data matches, return at least the last data point
    if (filteredData.length === 0) {
        return data.slice(-1);
    }
    
    return filteredData;
}

function getPeriodLabel() {
    const labels = {
        'ytd': 'YTD',
        '12m': 'Siste 12 mnd',
        '3y': 'Siste 3 år',
        '5y': 'Siste 5 år',
        '10y': 'Siste 10 år',
        'max': 'Maks (2001-2025)'
    };
    return labels[state.selectedPeriod] || labels['max'];
}

// ========================================
// Portfolio Calculations
// ========================================
function calculatePortfolioValue(data, allocation, startCapital) {
    const values = [];
    const baseValues = data[0];
    
    // Convert percentages to MNOK amounts
    const stocksAmount = (allocation.stocks / 100) * startCapital;
    const riskFreeAmount = (allocation.riskFree / 100) * startCapital;
    const highYieldAmount = (allocation.highYield / 100) * startCapital;
    const nordicStocksAmount = (allocation.nordicStocks / 100) * startCapital;
    const emergingMarketsAmount = (allocation.emergingMarkets / 100) * startCapital;
    
    let lastKnownValue = null; // Track last known portfolio value for rows with missing data
    
    data.forEach(row => {
        // Check if row has all necessary data for portfolio calculation
        const hasAllData = row.stocks !== undefined && row.riskFree !== undefined && 
                          row.highYield !== undefined && baseValues.stocks && 
                          baseValues.riskFree && baseValues.highYield;
        
        let portfolioValue;
        
        if (hasAllData) {
            // Calculate relative returns from base
            const stockReturn = row.stocks / baseValues.stocks;
            const riskFreeReturn = row.riskFree / baseValues.riskFree;
            const highYieldReturn = row.highYield / baseValues.highYield;
            // Use actual nordic stocks and emerging markets data if available, otherwise use stocks as proxy
            const nordicReturn = (row.nordicStocks && baseValues.nordicStocks) 
                ? row.nordicStocks / baseValues.nordicStocks 
                : row.stocks / baseValues.stocks;
            const emergingReturn = (row.emergingMarkets && baseValues.emergingMarkets) 
                ? row.emergingMarkets / baseValues.emergingMarkets 
                : row.stocks / baseValues.stocks;
            
            // Weighted portfolio value based on MNOK allocations
            portfolioValue = 
                stocksAmount * stockReturn +
                riskFreeAmount * riskFreeReturn +
                highYieldAmount * highYieldReturn +
                nordicStocksAmount * nordicReturn +
                emergingMarketsAmount * emergingReturn;
            
            lastKnownValue = portfolioValue; // Update last known value
        } else {
            // Use last known value if data is missing (e.g., for 2026 with only nurse salary)
            portfolioValue = lastKnownValue || startCapital;
        }
        
        values.push({
            date: row.date,
            value: portfolioValue,
            nurseSalary: row.nurseSalary
        });
    });
    
    return values;
}

function calculateReturns(portfolioValues) {
    const returns = [];
    for (let i = 1; i < portfolioValues.length; i++) {
        const periodReturn = (portfolioValues[i].value - portfolioValues[i - 1].value) / portfolioValues[i - 1].value;
        returns.push(periodReturn);
    }
    return returns;
}

function calculateVolatility(returns) {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
    // Annualize (assuming quarterly data = 4 periods per year)
    return Math.sqrt(variance * 4) * 100;
}

function calculateDrawdown(portfolioValues) {
    const drawdowns = [];
    let peak = portfolioValues[0].value;
    
    portfolioValues.forEach(pv => {
        if (pv.value > peak) {
            peak = pv.value;
        }
        const drawdown = (pv.value - peak) / peak * 100;
        drawdowns.push({
            date: pv.date,
            drawdown: drawdown,
            value: pv.value,
            peak: peak
        });
    });
    
    return drawdowns;
}

function calculateDrawdownInKr(portfolioValues) {
    const drawdowns = [];
    let peak = portfolioValues[0].value;
    
    portfolioValues.forEach(pv => {
        if (pv.value > peak) {
            peak = pv.value;
        }
        const drawdownKr = pv.value - peak; // Loss in kr (negative value)
        drawdowns.push({
            date: pv.date,
            drawdown: drawdownKr,
            value: pv.value,
            peak: peak
        });
    });
    
    return drawdowns;
}

function calculateHighWaterMark(portfolioValues) {
    const hwmValues = [];
    let highWaterMark = portfolioValues[0].value;
    
    portfolioValues.forEach(pv => {
        // Update high water mark if current value is higher
        if (pv.value > highWaterMark) {
            highWaterMark = pv.value;
        }
        // The HWM line stays at the highest value seen so far
        hwmValues.push({
            date: pv.date,
            value: highWaterMark,
            actualValue: pv.value,
            isAtPeak: pv.value >= highWaterMark
        });
    });
    
    return hwmValues;
}

// Count number of All-Time High changes (jumps) in HWM for a given period
function countATHChanges(data, portfolio, years) {
    if (!data || data.length === 0) return 0;
    
    let filteredData;
    
    if (years === null) {
        // Max period - use all data
        filteredData = data;
    } else {
        // Filter data for the specified number of years
        const now = new Date();
        const startDate = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
        filteredData = data.filter(d => d.date >= startDate);
        
        if (filteredData.length === 0) return 0;
    }
    
    // Calculate portfolio values for the filtered period
    const portfolioValues = calculatePortfolioValue(filteredData, portfolio, state.startCapital);
    
    if (portfolioValues.length === 0) return 0;
    
    // Calculate HWM for filtered period
    const hwm = calculateHighWaterMark(portfolioValues);
    
    // Count how many times HWM value increases (new ATH)
    let athCount = 0;
    let previousHWM = hwm[0].value;
    
    for (let i = 1; i < hwm.length; i++) {
        if (hwm[i].value > previousHWM) {
            athCount++;
            previousHWM = hwm[i].value;
        }
    }
    
    return athCount;
}

function findLargestDrawdowns(drawdowns, count = 5) {
    // Find drawdown periods
    const periods = [];
    let inDrawdown = false;
    let startIdx = 0;
    let maxDrawdown = 0;
    let maxDrawdownIdx = 0;
    
    for (let i = 0; i < drawdowns.length; i++) {
        if (drawdowns[i].drawdown < 0 && !inDrawdown) {
            inDrawdown = true;
            startIdx = i;
            maxDrawdown = drawdowns[i].drawdown;
            maxDrawdownIdx = i;
        } else if (drawdowns[i].drawdown < 0 && inDrawdown) {
            if (drawdowns[i].drawdown < maxDrawdown) {
                maxDrawdown = drawdowns[i].drawdown;
                maxDrawdownIdx = i;
            }
        } else if (drawdowns[i].drawdown >= 0 && inDrawdown) {
            inDrawdown = false;
            const recoveryDays = Math.round((drawdowns[i].date - drawdowns[maxDrawdownIdx].date) / (1000 * 60 * 60 * 24));
            periods.push({
                startDate: drawdowns[startIdx].date,
                endDate: drawdowns[i].date,
                maxDrawdown: maxDrawdown,
                recoveryDays: recoveryDays
            });
        }
    }
    
    // If still in drawdown at end
    if (inDrawdown) {
        periods.push({
            startDate: drawdowns[startIdx].date,
            endDate: drawdowns[drawdowns.length - 1].date,
            maxDrawdown: maxDrawdown,
            recoveryDays: null // Not recovered
        });
    }
    
    // Sort by max drawdown and return top N
    return periods
        .sort((a, b) => a.maxDrawdown - b.maxDrawdown)
        .slice(0, count);
}

function findLongestHighWaterMarkPeriods(portfolioValues, count = 5) {
    // Find periods where portfolio was below high water mark
    // Period starts from peak date and ends when we reach a new peak
    const periods = [];
    let highWaterMark = portfolioValues[0].value;
    let peakDate = portfolioValues[0].date;
    let isBelowHWM = false;
    
    for (let i = 1; i < portfolioValues.length; i++) {
        const currentValue = portfolioValues[i].value;
        const currentDate = portfolioValues[i].date;
        
        // If we reach a new high water mark
        if (currentValue > highWaterMark) {
            // If we were below HWM, record the period from peak to recovery
            if (isBelowHWM) {
                const daysBelowHWM = Math.round((currentDate - peakDate) / (1000 * 60 * 60 * 24));
                periods.push({
                    startDate: peakDate,
                    endDate: currentDate,
                    daysBelowHWM: daysBelowHWM
                });
                isBelowHWM = false;
            }
            // Update high water mark
            highWaterMark = currentValue;
            peakDate = currentDate;
        } else if (currentValue < highWaterMark) {
            // Mark that we're below HWM
            if (!isBelowHWM) {
                isBelowHWM = true;
            }
        }
    }
    
    // If still below HWM at end
    if (isBelowHWM) {
        const lastDate = portfolioValues[portfolioValues.length - 1].date;
        const daysBelowHWM = Math.round((lastDate - peakDate) / (1000 * 60 * 60 * 24));
        periods.push({
            startDate: peakDate,
            endDate: lastDate,
            daysBelowHWM: daysBelowHWM
        });
    }
    
    // Sort by duration (longest first) and return top N
    return periods
        .sort((a, b) => b.daysBelowHWM - a.daysBelowHWM)
        .slice(0, count);
}

function calculateYearlyReturns(data) {
    const yearlyReturns = {};
    
    // Group by year
    const byYear = {};
    data.forEach(row => {
        const year = row.date.getFullYear();
        if (!byYear[year]) {
            byYear[year] = [];
        }
        byYear[year].push(row);
    });
    
    // Calculate yearly returns for each asset class
    Object.keys(byYear).forEach(year => {
        const yearData = byYear[year];
        if (yearData.length >= 2) {
            const first = yearData[0];
            const last = yearData[yearData.length - 1];
            
            // Calculate KPI yearly average (average of all monthly KPI values for the year)
            let kpiReturn = 0;
            if (yearData.length > 0) {
                const kpiValues = yearData.filter(row => row.kpi !== undefined && row.kpi !== null).map(row => row.kpi);
                if (kpiValues.length > 0) {
                    const sum = kpiValues.reduce((a, b) => a + b, 0);
                    kpiReturn = sum / kpiValues.length; // Average KPI for the year
                }
            }
            
            yearlyReturns[year] = {
                stocks: ((last.stocks - first.stocks) / first.stocks * 100),
                riskFree: ((last.riskFree - first.riskFree) / first.riskFree * 100),
                highYield: ((last.highYield - first.highYield) / first.highYield * 100),
                nordicStocks: (first.nordicStocks && last.nordicStocks) 
                    ? ((last.nordicStocks - first.nordicStocks) / first.nordicStocks * 100)
                    : ((last.stocks - first.stocks) / first.stocks * 100), // Fallback to stocks if not available
                emergingMarkets: (first.emergingMarkets && last.emergingMarkets)
                    ? ((last.emergingMarkets - first.emergingMarkets) / first.emergingMarkets * 100)
                    : ((last.stocks - first.stocks) / first.stocks * 100), // Fallback to stocks if not available
                kpi: kpiReturn
            };
        }
    });
    
    return yearlyReturns;
}

// ========================================
// Format Helpers
// ========================================
function formatCurrency(value) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    
    if (absValue >= 1000000) {
        return sign + (absValue / 1000000).toFixed(2) + ' MNOK';
    } else if (absValue >= 1000) {
        return sign + (absValue / 1000).toFixed(0) + ' KNOK';
    }
    return sign + absValue.toFixed(0) + ' NOK';
}

function formatPercent(value, decimals = 1) {
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(decimals) + '%';
}

function formatDate(date) {
    return date.toLocaleDateString('no-NO', { year: 'numeric', month: 'short' });
}

function openChartFullscreen(chartType) {
    // Determine which chart to show based on chartType
    let chart, title, modalId;
    
    switch(chartType) {
        case 'overview':
            chart = state.charts.overview;
            title = 'Porteføljesammenligning';
            modalId = 'chart-fullscreen-modal-overview';
            break;
        case 'comparison':
            chart = state.charts.comparison;
            title = 'High Water Mark';
            modalId = 'chart-fullscreen-modal-comparison';
            break;
        case 'drawdown':
            chart = state.charts.drawdown;
            title = 'Drawdown (Undervannsanalyse)';
            modalId = 'chart-fullscreen-modal-drawdown';
            break;
        default:
            return;
    }
    
    if (!chart) {
        return;
    }
    
    // Check if fullscreen modal already exists
    let modal = document.getElementById(modalId);
    let existingChart = null;
    
    if (modal) {
        // Modal exists, get existing chart if it exists
        const canvas = modal.querySelector('#fullscreen-chart');
        if (canvas && canvas._chart) {
            existingChart = canvas._chart;
        }
    } else {
        // Create modal overlay
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'chart-fullscreen-modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'chart-fullscreen-content';
        
        // Create header with close button
        const header = document.createElement('div');
        header.className = 'chart-fullscreen-header';
        header.innerHTML = `
            <h3>${title}</h3>
            <button class="chart-fullscreen-close" data-modal-id="${modalId}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        // Create chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-fullscreen-container';
        const canvas = document.createElement('canvas');
        canvas.id = 'fullscreen-chart';
        chartContainer.appendChild(canvas);
        
        modalContent.appendChild(header);
        modalContent.appendChild(chartContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Set up close handlers only once
        const closeBtn = header.querySelector('.chart-fullscreen-close');
        closeBtn.addEventListener('click', () => {
            closeChartFullscreen(modalId);
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeChartFullscreen(modalId);
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
                closeChartFullscreen(modalId);
            }
        });
    }
    
    // Get fresh chart data and options (always get latest data)
    const chartData = JSON.parse(JSON.stringify(chart.data));
    const chartOptions = JSON.parse(JSON.stringify(chart.options));
    
    // For time-based charts, ensure x-axis shows only the data range
    // Extract all dates from the datasets
    let allDates = [];
    chartData.datasets.forEach(dataset => {
        if (dataset.data && dataset.data.length > 0) {
            dataset.data.forEach(point => {
                if (point.x) {
                    allDates.push(new Date(point.x));
                }
            });
        }
    });
    
    // Set min/max for time scale to match the data range
    if (allDates.length > 0 && chartOptions.scales && chartOptions.scales.x && chartOptions.scales.x.type === 'time') {
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));
        
        // Add small padding (1% of total range)
        const dateRange = maxDate.getTime() - minDate.getTime();
        const padding = dateRange * 0.01;
        
        chartOptions.scales.x.min = new Date(minDate.getTime() - padding);
        chartOptions.scales.x.max = new Date(maxDate.getTime() + padding);
    }
    
    // Get plugins if they exist (for drawdown chart)
    const chartPlugins = chart.config.plugins || [];
    
    if (existingChart) {
        // Update existing chart with new data
        existingChart.data = chartData;
        existingChart.options = chartOptions;
        existingChart.update();
    } else {
        // Create new chart in fullscreen modal
        const canvas = modal.querySelector('#fullscreen-chart');
        const ctx = canvas.getContext('2d');
        const fullscreenChartConfig = {
            type: chart.config.type || 'line',
            data: chartData,
            options: chartOptions
        };
        
        // Add plugins if they exist
        if (chartPlugins.length > 0) {
            fullscreenChartConfig.plugins = chartPlugins;
        }
        
        const fullscreenChart = new Chart(ctx, fullscreenChartConfig);
        
        // Store reference on canvas for resize
        canvas._chart = fullscreenChart;
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Resize chart after showing
    setTimeout(() => {
        const canvas = modal.querySelector('#fullscreen-chart');
        if (canvas && canvas._chart) {
            canvas._chart.resize();
        }
    }, 100);
}

function closeChartFullscreen(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}


// ========================================
// Chart Configuration
// ========================================
const chartColors = {
    current: {
        main: 'oklch(0.4562 0.1809 260.1560)', // chart-4
        light: 'oklch(0.9489 0.0188 255.5341)', // accent with opacity
        border: 'oklch(0.4562 0.1809 260.1560)'
    },
    new: {
        main: 'oklch(0.6020 0.1679 258.6201)', // chart-3
        light: 'oklch(0.9489 0.0188 255.5341)', // accent with opacity
        border: 'oklch(0.6020 0.1679 258.6201)'
    },
    drawdown: {
        main: 'oklch(0.4322 0.1500 28.9906)', // destructive
        light: 'oklch(0.9489 0.0188 255.5341)' // accent with opacity
    },
    stocks: 'oklch(0.6020 0.1679 258.6201)', // chart-3
    riskFree: 'oklch(0.7450 0.1024 258.2961)', // chart-2
    highYield: 'oklch(0.8479 0.0603 257.7878)', // chart-1
    nurse: 'oklch(0.55 0.18 145)' // Green color for nurse index line
};

const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index'
    },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    family: "'DM Sans', sans-serif",
                    size: 13
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(26, 32, 44, 0.95)',
            titleFont: {
                family: "'DM Sans', sans-serif",
                size: 14
            },
            bodyFont: {
                family: "'JetBrains Mono', monospace",
                size: 13
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true
        }
    },
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'year',
                displayFormats: {
                    year: 'yyyy'
                }
            },
            grid: {
                display: false
            },
            ticks: {
                font: {
                    family: "'DM Sans', sans-serif",
                    size: 11
                }
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                font: {
                    family: "'JetBrains Mono', monospace",
                    size: 11
                }
            }
        }
    }
};

// ========================================
// UI Update Functions
// ========================================
function updateSliderUI(type) {
    const portfolio = type === 'current' ? state.currentPortfolio : state.newPortfolio;
    const prefix = type === 'current' ? 'current' : 'new';
    
    // Update all slider value displays (in % - no decimals)
    document.getElementById(`${prefix}-stocks-value`).textContent = Math.round(portfolio.stocks) + '%';
    document.getElementById(`${prefix}-riskfree-value`).textContent = Math.round(portfolio.riskFree) + '%';
    document.getElementById(`${prefix}-highyield-value`).textContent = Math.round(portfolio.highYield) + '%';
    document.getElementById(`${prefix}-nordic-value`).textContent = Math.round(portfolio.nordicStocks) + '%';
    document.getElementById(`${prefix}-emerging-value`).textContent = Math.round(portfolio.emergingMarkets) + '%';
    
    // Calculate and display total
    const total = portfolio.stocks + portfolio.riskFree + portfolio.highYield + 
                  portfolio.nordicStocks + portfolio.emergingMarkets;
    const totalEl = document.getElementById(`${prefix}-total`);
    const warningEl = document.getElementById(`${prefix}-warning`);
    
    totalEl.textContent = Math.round(total) + '%';
    
    // Show warning if total exceeds 100%
    if (total > 100) {
        totalEl.style.color = 'var(--destructive)';
        if (warningEl) warningEl.style.display = 'block';
        warningEl.textContent = 'Summen overstiger 100%!';
    } else {
        totalEl.style.color = 'var(--primary)';
        if (warningEl) warningEl.style.display = 'none';
    }
    
    // Update slider values
    document.getElementById(`${prefix}-stocks`).value = portfolio.stocks;
    document.getElementById(`${prefix}-riskfree`).value = portfolio.riskFree;
    document.getElementById(`${prefix}-highyield`).value = portfolio.highYield;
    document.getElementById(`${prefix}-nordic`).value = portfolio.nordicStocks;
    document.getElementById(`${prefix}-emerging`).value = portfolio.emergingMarkets;
    
    // Update treemap charts
    updateTreemapChart(type);
}

function updateTreemapChart(type) {
    const portfolio = type === 'current' ? state.currentPortfolio : state.newPortfolio;
    const chartId = type === 'current' ? 'current-treemap-chart' : 'new-treemap-chart';
    const canvas = document.getElementById(chartId);
    
    if (!canvas) return;
    
    // Get device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Set actual size in memory (scaled for DPI)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Scale the canvas back down using CSS
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(dpr, dpr);
    
    const width = displayWidth;
    const height = displayHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Disable image smoothing for crisp edges
    ctx.imageSmoothingEnabled = false;
    
    // Prepare data - filter out zero values
    const data = [
        { name: 'Aksjer Global', value: portfolio.stocks, color: 'oklch(0.6020 0.1679 258.6201)' },
        { name: 'Bankinnskudd', value: portfolio.riskFree, color: 'oklch(0.7450 0.1024 258.2961)' },
        { name: 'High Yield', value: portfolio.highYield, color: 'oklch(0.8479 0.0603 257.7878)' },
        { name: 'Aksjer Norden', value: portfolio.nordicStocks, color: 'oklch(0.4562 0.1809 260.1560)' },
        { name: 'Aksjer Emerging Markets', value: portfolio.emergingMarkets, color: 'oklch(0.2722 0.1053 258.9631)' }
    ].filter(item => item.value > 0);
    
    if (data.length === 0) return;
    
    // Calculate total for normalization
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;
    
    // Simple treemap layout using squarified algorithm
    const padding = 4;
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    // Sort by value descending
    data.sort((a, b) => b.value - a.value);
    
    // Calculate areas
    const totalArea = availableWidth * availableHeight;
    const items = data.map(item => ({
        ...item,
        area: (item.value / total) * totalArea
    }));
    
    // Simple row-based layout
    let y = padding;
    let remainingHeight = availableHeight;
    let remainingWidth = availableWidth;
    let itemIndex = 0;
    
    while (itemIndex < items.length && remainingHeight > 0 && remainingWidth > 0) {
        const row = [];
        let rowArea = 0;
        
        // Build a row
        while (itemIndex < items.length) {
            const item = items[itemIndex];
            const testRow = [...row, item];
            const testRowArea = rowArea + item.area;
            const rowHeight = testRowArea / remainingWidth;
            
            // Check if adding this item makes the row worse (aspect ratio)
            if (row.length > 0) {
                const currentRowHeight = rowArea / remainingWidth;
                const currentAspectRatio = Math.max(remainingWidth / currentRowHeight, currentRowHeight / remainingWidth);
                const newAspectRatio = Math.max(remainingWidth / rowHeight, rowHeight / remainingWidth);
                
                if (newAspectRatio > currentAspectRatio && row.length > 1) {
                    break; // Don't add this item to current row
                }
            }
            
            row.push(item);
            rowArea = testRowArea;
            itemIndex++;
        }
        
        // Draw the row
        const rowHeight = rowArea / remainingWidth;
        let x = padding + (availableWidth - remainingWidth);
        
        row.forEach(cell => {
            const cellWidth = (cell.area / rowHeight);
            drawTreemapCell(ctx, x, y, cellWidth, rowHeight, cell);
            x += cellWidth;
        });
        
        y += rowHeight;
        remainingHeight -= rowHeight;
    }
}

function drawTreemapCell(ctx, x, y, width, height, item) {
    // Draw rectangle
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y, width, height);
    
    // Draw border
    ctx.strokeStyle = 'oklch(1.0000 0 0)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Draw text if space allows
    if (width > 60 && height > 30) {
        ctx.fillStyle = 'oklch(1.0000 0 0)';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textX = x + width / 2;
        
        // Split label by space if it contains multiple words
        const words = item.name.split(' ');
        const lineHeight = 13;
        const totalLabelHeight = words.length * lineHeight;
        const valueHeight = 14;
        const totalTextHeight = totalLabelHeight + valueHeight + 4; // 4px spacing between label and value
        const startY = y + height / 2 - totalTextHeight / 2 + lineHeight / 2;
        
        // Draw label lines
        words.forEach((word, index) => {
            ctx.textBaseline = 'middle';
            ctx.fillText(word, textX, startY + (index * lineHeight));
        });
        
        // Draw value
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(item.value) + '%', textX, startY + totalLabelHeight + 4 + valueHeight / 2);
    }
}

function validateAndAdjustSlider(type, changedSliderId, newValue) {
    const portfolio = type === 'current' ? state.currentPortfolio : state.newPortfolio;
    const prefix = type === 'current' ? 'current' : 'new';
    const maxTotal = 100; // 100%
    
    // Update the changed slider's value
    const newPercent = parseFloat(newValue);
    if (changedSliderId.includes('stocks')) portfolio.stocks = newPercent;
    else if (changedSliderId.includes('riskfree')) portfolio.riskFree = newPercent;
    else if (changedSliderId.includes('highyield')) portfolio.highYield = newPercent;
    else if (changedSliderId.includes('nordic')) portfolio.nordicStocks = newPercent;
    else if (changedSliderId.includes('emerging')) portfolio.emergingMarkets = newPercent;
    
    // Calculate current total
    let total = portfolio.stocks + portfolio.riskFree + portfolio.highYield + 
                portfolio.nordicStocks + portfolio.emergingMarkets;
    
    // If total exceeds max, reduce the changed slider
    if (total > maxTotal) {
        const excess = total - maxTotal;
        if (changedSliderId.includes('stocks')) portfolio.stocks = Math.max(0, portfolio.stocks - excess);
        else if (changedSliderId.includes('riskfree')) portfolio.riskFree = Math.max(0, portfolio.riskFree - excess);
        else if (changedSliderId.includes('highyield')) portfolio.highYield = Math.max(0, portfolio.highYield - excess);
        else if (changedSliderId.includes('nordic')) portfolio.nordicStocks = Math.max(0, portfolio.nordicStocks - excess);
        else if (changedSliderId.includes('emerging')) portfolio.emergingMarkets = Math.max(0, portfolio.emergingMarkets - excess);
    }
    
    // If user manually adjusted sliders, remove active state from allocation buttons for that portfolio
    const portfolioButtons = document.querySelectorAll(`.allocation-btn[data-portfolio="${type}"]`);
    portfolioButtons.forEach(btn => btn.classList.remove('active'));
    
    // Update UI
    updateSliderUI(type);
    updateCharts();
}

function updateMetrics() {
    const filteredData = getFilteredData();
    const currentValues = calculatePortfolioValue(filteredData, state.currentPortfolio, state.startCapital);
    const newValues = calculatePortfolioValue(filteredData, state.newPortfolio, state.startCapital);
    
    const currentEndValue = currentValues[currentValues.length - 1].value;
    const newEndValue = newValues[newValues.length - 1].value;
    
    const currentReturn = ((currentEndValue - state.startCapital) / state.startCapital) * 100;
    const newReturn = ((newEndValue - state.startCapital) / state.startCapital) * 100;
    
    const currentReturns = calculateReturns(currentValues);
    const newReturns = calculateReturns(newValues);
    
    const currentVol = calculateVolatility(currentReturns);
    const newVol = calculateVolatility(newReturns);
    
    // Update current portfolio metrics
    document.getElementById('current-return').textContent = formatPercent(currentReturn);
    document.getElementById('current-endvalue').textContent = formatCurrency(currentEndValue);
    document.getElementById('current-volatility').textContent = currentVol.toFixed(1) + '%';
    
    // Update new portfolio metrics
    document.getElementById('new-return').textContent = formatPercent(newReturn);
    document.getElementById('new-endvalue').textContent = formatCurrency(newEndValue);
    document.getElementById('new-volatility').textContent = newVol.toFixed(1) + '%';
    
    // Update difference
    // Avkastningsforskjell: (sluttverdi ny / sluttverdi dagens) - 1
    const diffReturn = currentEndValue > 0 ? ((newEndValue / currentEndValue) - 1) * 100 : 0;
    const diffValue = newEndValue - currentEndValue;
    const diffVol = newVol - currentVol;
    
    const diffReturnEl = document.getElementById('diff-return');
    const diffValueEl = document.getElementById('diff-endvalue');
    const diffVolEl = document.getElementById('diff-volatility');
    
    diffReturnEl.textContent = formatPercent(diffReturn);
    diffReturnEl.className = `metric-value ${diffReturn < 0 ? 'negative' : ''}`;
    
    diffValueEl.textContent = formatCurrency(diffValue);
    diffValueEl.className = `metric-value ${diffValue < 0 ? 'negative' : ''}`;
    
    diffVolEl.textContent = formatPercent(diffVol);
    diffVolEl.className = `metric-value ${diffVol < 0 ? 'negative' : ''}`;
}

// ========================================
// Chart Functions
// ========================================
function createOverviewChart() {
    // Check which chart type to show
    if (state.portfolioComparisonChartType === 'asset-classes') {
        createAssetClassesChart();
        return;
    }
    
    const ctx = document.getElementById('overview-chart').getContext('2d');
    const filteredData = getFilteredData();
    
    const currentValues = calculatePortfolioValue(filteredData, state.currentPortfolio, state.startCapital);
    const newValues = calculatePortfolioValue(filteredData, state.newPortfolio, state.startCapital);
    
    // Normalize both portfolios to start at exactly 10 MNOK
    if (currentValues.length > 0 && currentValues[0].value !== state.startCapital) {
        const currentNormalizationFactor = state.startCapital / currentValues[0].value;
        currentValues.forEach(v => {
            v.value = v.value * currentNormalizationFactor;
        });
    }
    
    if (newValues.length > 0 && newValues[0].value !== state.startCapital) {
        const newNormalizationFactor = state.startCapital / newValues[0].value;
        newValues.forEach(v => {
            v.value = v.value * newNormalizationFactor;
        });
    }
    
    if (state.charts.overview) {
        state.charts.overview.destroy();
    }
    
    state.charts.overview = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Dagens Portefølje',
                    data: currentValues.map(v => ({ x: v.date, y: v.value })),
                    borderColor: chartColors.current.main,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Ny Portefølje',
                    data: newValues.map(v => ({ x: v.date, y: v.value })),
                    borderColor: chartColors.new.main,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                tooltip: {
                    ...commonChartOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                ...commonChartOptions.scales,
                y: {
                    ...commonChartOptions.scales.y,
                    beginAtZero: true,
                    ticks: {
                        ...commonChartOptions.scales.y.ticks,
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + ' M';
                        }
                    }
                }
            }
        }
    });
    
    // Update overview metrics (only for overview chart, not asset classes)
    updateOverviewMetrics(currentValues, newValues);
    
    // Update fullscreen chart if it exists
    if (state.fullscreenChart) {
        const fullscreenData = JSON.parse(JSON.stringify(state.charts.overview.data));
        state.fullscreenChart.data = fullscreenData;
        state.fullscreenChart.update();
    }
}

// Calculate individual asset class values over time
function calculateAssetClassValue(data, assetClass, allocationPercent, startCapital) {
    const values = [];
    const baseValues = data[0];
    const amount = (allocationPercent / 100) * startCapital;
    
    data.forEach(row => {
        let returnValue;
        switch(assetClass) {
            case 'stocks':
                returnValue = row.stocks / baseValues.stocks;
                break;
            case 'riskFree':
                returnValue = row.riskFree / baseValues.riskFree;
                break;
            case 'highYield':
                returnValue = row.highYield / baseValues.highYield;
                break;
            case 'nordicStocks':
                // Use actual nordic stocks data if available, otherwise use stocks as proxy
                if (row.nordicStocks && baseValues.nordicStocks) {
                    returnValue = row.nordicStocks / baseValues.nordicStocks;
                } else {
                    returnValue = row.stocks / baseValues.stocks;
                }
                break;
            case 'emergingMarkets':
                // Use actual emerging markets data if available, otherwise use stocks as proxy
                if (row.emergingMarkets && baseValues.emergingMarkets) {
                    returnValue = row.emergingMarkets / baseValues.emergingMarkets;
                } else {
                    returnValue = row.stocks / baseValues.stocks;
                }
                break;
            default:
                returnValue = 1;
        }
        
        values.push({
            date: row.date,
            value: amount * returnValue
        });
    });
    
    return values;
}

// Calculate asset class values WITHOUT rebalancing (static initial allocation, grows based on individual returns)
// Each asset class starts with its initial allocation and grows independently based on its own return
function calculateAssetClassValueWithoutRebalancing(data, portfolio, startCapital) {
    const baseValues = data[0];
    const values = [];
    
    // Initialize starting amounts for each asset class (e.g., 20% of 10 MNOK = 2 MNOK each)
    const stocksAmount = (portfolio.stocks / 100) * startCapital;
    const riskFreeAmount = (portfolio.riskFree / 100) * startCapital;
    const highYieldAmount = (portfolio.highYield / 100) * startCapital;
    const nordicStocksAmount = (portfolio.nordicStocks / 100) * startCapital;
    const emergingMarketsAmount = (portfolio.emergingMarkets / 100) * startCapital;
    
    data.forEach(row => {
        // Calculate total return from base (same method as calculateAssetClassValue)
        const stocksReturn = row.stocks / baseValues.stocks;
        const riskFreeReturn = row.riskFree / baseValues.riskFree;
        const highYieldReturn = row.highYield / baseValues.highYield;
        const nordicReturn = (row.nordicStocks && baseValues.nordicStocks) 
            ? row.nordicStocks / baseValues.nordicStocks 
            : row.stocks / baseValues.stocks;
        const emergingReturn = (row.emergingMarkets && baseValues.emergingMarkets) 
            ? row.emergingMarkets / baseValues.emergingMarkets 
            : row.stocks / baseValues.stocks;
        
        // Each asset class value = initial amount * total return (no rebalancing)
        // This means each grows independently based on its own return
        values.push({
            date: row.date,
            stocks: stocksAmount * stocksReturn,
            riskFree: riskFreeAmount * riskFreeReturn,
            highYield: highYieldAmount * highYieldReturn,
            nordicStocks: nordicStocksAmount * nordicReturn,
            emergingMarkets: emergingMarketsAmount * emergingReturn
        });
    });
    
    return values;
}

function createAssetClassesChart() {
    const ctx = document.getElementById('overview-chart').getContext('2d');
    const filteredData = getFilteredData();
    
    // Get asset classes with allocation > 0 in new portfolio
    const assetClasses = [
        { key: 'stocks', name: 'Aksjer Global', color: 'oklch(0.6020 0.1679 258.6201)' },
        { key: 'riskFree', name: 'Bankinnskudd', color: 'oklch(0.7450 0.1024 258.2961)' },
        { key: 'highYield', name: 'High Yield', color: 'oklch(0.8479 0.0603 257.7878)' },
        { key: 'nordicStocks', name: 'Aksjer Norden', color: 'oklch(0.4562 0.1809 260.1560)' },
        { key: 'emergingMarkets', name: 'Aksjer Emerging Markets', color: 'oklch(0.2722 0.1053 258.9631)' }
    ].filter(asset => state.newPortfolio[asset.key] > 0);
    
    if (assetClasses.length === 0) {
        // If no asset classes selected, show empty chart
        if (state.charts.overview) {
            state.charts.overview.destroy();
        }
        state.charts.overview = new Chart(ctx, {
            type: 'line',
            data: { datasets: [] },
            options: commonChartOptions
        });
        return;
    }
    
    // Calculate values for each asset class
    const datasets = assetClasses.map(asset => {
        const values = calculateAssetClassValue(
            filteredData,
            asset.key,
            state.newPortfolio[asset.key],
            state.startCapital
        );
        
        return {
            label: `${asset.name} (${Math.round(state.newPortfolio[asset.key])}%)`,
            data: values.map(v => ({ x: v.date, y: v.value })),
            borderColor: asset.color,
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 6
        };
    });
    
    if (state.charts.overview) {
        state.charts.overview.destroy();
    }
    
    state.charts.overview = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                tooltip: {
                    ...commonChartOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label.split(' (')[0] + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                ...commonChartOptions.scales,
                y: {
                    ...commonChartOptions.scales.y,
                    beginAtZero: true,
                    ticks: {
                        ...commonChartOptions.scales.y.ticks,
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + ' M';
                        }
                    }
                }
            }
        }
    });
    
    // Update fullscreen chart if it exists
    if (state.fullscreenChart) {
        const fullscreenData = JSON.parse(JSON.stringify(state.charts.overview.data));
        state.fullscreenChart.data = fullscreenData;
        state.fullscreenChart.update();
    }
}

function updateOverviewMetrics(currentValues, newValues) {
    const currentEndValue = currentValues[currentValues.length - 1].value;
    const newEndValue = newValues[newValues.length - 1].value;
    
    const currentReturn = ((currentEndValue - state.startCapital) / state.startCapital) * 100;
    const newReturn = ((newEndValue - state.startCapital) / state.startCapital) * 100;
    
    const currentReturns = calculateReturns(currentValues);
    const newReturns = calculateReturns(newValues);
    
    const currentVol = calculateVolatility(currentReturns);
    const newVol = calculateVolatility(newReturns);
    
    // Update current portfolio metrics
    const currentReturnEl = document.getElementById('overview-current-return');
    const currentEndvalueEl = document.getElementById('overview-current-endvalue');
    const currentVolatilityEl = document.getElementById('overview-current-volatility');
    
    if (currentReturnEl) currentReturnEl.textContent = formatPercent(currentReturn);
    if (currentEndvalueEl) currentEndvalueEl.textContent = formatCurrency(currentEndValue);
    if (currentVolatilityEl) currentVolatilityEl.textContent = currentVol.toFixed(1) + '%';
    
    // Update new portfolio metrics
    const newReturnEl = document.getElementById('overview-new-return');
    const newEndvalueEl = document.getElementById('overview-new-endvalue');
    const newVolatilityEl = document.getElementById('overview-new-volatility');
    
    if (newReturnEl) newReturnEl.textContent = formatPercent(newReturn);
    if (newEndvalueEl) newEndvalueEl.textContent = formatCurrency(newEndValue);
    if (newVolatilityEl) newVolatilityEl.textContent = newVol.toFixed(1) + '%';
    
    // Update difference
    // Avkastningsforskjell: (sluttverdi ny / sluttverdi dagens) - 1
    const diffReturn = currentEndValue > 0 ? ((newEndValue / currentEndValue) - 1) * 100 : 0;
    const diffValue = newEndValue - currentEndValue;
    const diffVol = newVol - currentVol;
    
    const diffReturnEl = document.getElementById('overview-diff-return');
    const diffValueEl = document.getElementById('overview-diff-endvalue');
    const diffVolEl = document.getElementById('overview-diff-volatility');
    
    if (diffReturnEl) {
        diffReturnEl.textContent = formatPercent(diffReturn);
        diffReturnEl.className = `metric-value ${diffReturn < 0 ? 'negative' : ''}`;
    }
    
    if (diffValueEl) {
        diffValueEl.textContent = formatCurrency(diffValue);
        diffValueEl.className = `metric-value ${diffValue < 0 ? 'negative' : ''}`;
    }
    
    if (diffVolEl) {
        diffVolEl.textContent = formatPercent(diffVol);
        diffVolEl.className = `metric-value ${diffVol < 0 ? 'negative' : ''}`;
    }
}

function createAllocationChart() {
    const canvas = document.getElementById('allocation-chart');
    if (!canvas) {
        console.warn('Allocation chart canvas not found');
        return;
    }
    
    console.log('=== CREATING ALLOCATION CHART ===');
    console.log('Rebalancing state:', state.allocationRebalancing);
    
    // Destroy existing chart first
    if (state.charts.allocation) {
        try {
            state.charts.allocation.destroy();
        } catch (e) {
            console.warn('Error destroying chart:', e);
        }
        state.charts.allocation = null;
    }
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    // Ensure canvas has proper dimensions - Chart.js will handle responsive sizing
    // but we need dimensions for clearing
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        // Only set if canvas doesn't already have correct dimensions
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
    } else {
        // Fallback dimensions if not visible yet
        canvas.width = 800;
        canvas.height = 400;
    }
    
    // Clear canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const filteredData = getFilteredData();
    
    if (!filteredData || filteredData.length === 0) {
        console.warn('No filtered data available');
        return;
    }
    
    // Get asset classes with allocation > 0 in new portfolio
    const assetClasses = [
        { key: 'stocks', name: 'Aksjer Global', color: 'oklch(0.6020 0.1679 258.6201)' },
        { key: 'riskFree', name: 'Bankinnskudd', color: 'oklch(0.7450 0.1024 258.2961)' },
        { key: 'highYield', name: 'High Yield', color: 'oklch(0.8479 0.0603 257.7878)' },
        { key: 'nordicStocks', name: 'Aksjer Norden', color: 'oklch(0.4562 0.1809 260.1560)' },
        { key: 'emergingMarkets', name: 'Aksjer Emerging Markets', color: 'oklch(0.2722 0.1053 258.9631)' }
    ].filter(asset => state.newPortfolio[asset.key] > 0);
    
    if (assetClasses.length === 0) {
        // If no asset classes selected, show empty chart
        if (state.charts.allocation) {
            state.charts.allocation.destroy();
        }
        state.charts.allocation = new Chart(ctx, {
            type: 'line',
            data: { datasets: [] },
            options: commonChartOptions
        });
        return;
    }
    
    let datasets;
    let valuesWithoutRebalancingForTooltip = null; // For tooltip calculation
    
    console.log('state.allocationRebalancing is:', state.allocationRebalancing);
    
    if (state.allocationRebalancing) {
        // WITH rebalancing: Calculate values where each asset class maintains its percentage
        // The portfolio is rebalanced monthly, so each asset class keeps its allocation percentage constant
        console.log('=== CALCULATING WITH REBALANCING ===');
        
        // First, calculate total portfolio value at each point in time
        const portfolioValues = calculatePortfolioValue(filteredData, state.newPortfolio, state.startCapital);
        
        // Then, for each asset class, calculate its value as percentage of total portfolio value
        datasets = assetClasses.map(asset => {
            const allocationPercent = state.newPortfolio[asset.key];
            const values = portfolioValues.map(pv => ({
                date: pv.date,
                value: (allocationPercent / 100) * pv.value
            }));
            
            // Extract oklch values and add opacity for fill
            const colorWithOpacity = asset.color.replace(')', ' / 0.6)');
            
            return {
                label: `${asset.name} (${Math.round(allocationPercent)}%)`,
                data: values.map(v => ({ x: v.date, y: v.value })),
                borderColor: asset.color,
                backgroundColor: colorWithOpacity,
                borderWidth: 1,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 0
            };
        });
    } else {
        // WITHOUT rebalancing: Calculate values where each asset class grows independently
        console.log('=== CALCULATING WITHOUT REBALANCING ===');
        console.log('Portfolio allocation:', state.newPortfolio);
        console.log('Start capital:', state.startCapital);
        console.log('Filtered data length:', filteredData.length);
        
        const valuesWithoutRebalancing = calculateAssetClassValueWithoutRebalancing(
            filteredData,
            state.newPortfolio,
            state.startCapital
        );
        
        console.log('Values without rebalancing calculated, length:', valuesWithoutRebalancing.length);
        if (valuesWithoutRebalancing.length > 0) {
            const first = valuesWithoutRebalancing[0];
            const last = valuesWithoutRebalancing[valuesWithoutRebalancing.length - 1];
            console.log('First value (start):', {
                stocks: first.stocks,
                riskFree: first.riskFree,
                highYield: first.highYield,
                nordicStocks: first.nordicStocks,
                emergingMarkets: first.emergingMarkets
            });
            console.log('Last value (end):', {
                stocks: last.stocks,
                riskFree: last.riskFree,
                highYield: last.highYield,
                nordicStocks: last.nordicStocks,
                emergingMarkets: last.emergingMarkets
            });
            
            // Calculate percentages
            const totalFirst = first.stocks + first.riskFree + first.highYield + first.nordicStocks + first.emergingMarkets;
            const totalLast = last.stocks + last.riskFree + last.highYield + last.nordicStocks + last.emergingMarkets;
            console.log('First percentages:', {
                stocks: (first.stocks / totalFirst * 100).toFixed(1) + '%',
                riskFree: (first.riskFree / totalFirst * 100).toFixed(1) + '%',
                highYield: (first.highYield / totalFirst * 100).toFixed(1) + '%',
                nordicStocks: (first.nordicStocks / totalFirst * 100).toFixed(1) + '%',
                emergingMarkets: (first.emergingMarkets / totalFirst * 100).toFixed(1) + '%'
            });
            console.log('Last percentages (should be different!):', {
                stocks: (last.stocks / totalLast * 100).toFixed(1) + '%',
                riskFree: (last.riskFree / totalLast * 100).toFixed(1) + '%',
                highYield: (last.highYield / totalLast * 100).toFixed(1) + '%',
                nordicStocks: (last.nordicStocks / totalLast * 100).toFixed(1) + '%',
                emergingMarkets: (last.emergingMarkets / totalLast * 100).toFixed(1) + '%'
            });
        }
        
        datasets = assetClasses.map(asset => {
            // Extract oklch values and add opacity for fill
            const colorWithOpacity = asset.color.replace(')', ' / 0.6)');
            
            // Calculate the actual percentage at the end of the period for label
            const lastValue = valuesWithoutRebalancing[valuesWithoutRebalancing.length - 1];
            const totalValue = lastValue.stocks + lastValue.riskFree + lastValue.highYield + 
                              lastValue.nordicStocks + lastValue.emergingMarkets;
            const actualPercent = totalValue > 0 
                ? (lastValue[asset.key] / totalValue) * 100 
                : state.newPortfolio[asset.key];
            
            console.log(`Asset ${asset.name}: Start=${state.newPortfolio[asset.key]}%, End=${actualPercent.toFixed(1)}%`);
            
            return {
                label: `${asset.name} (${Math.round(actualPercent)}%)`,
                data: valuesWithoutRebalancing.map(v => ({ 
                    x: v.date, 
                    y: v[asset.key] 
                })),
                borderColor: asset.color,
                backgroundColor: colorWithOpacity,
                borderWidth: 1,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 0
            };
        });
    }
    
    // Helper function to get asset key from name (for tooltip)
    function getAssetKeyFromName(name) {
        const nameMap = {
            'Aksjer Global': 'stocks',
            'Bankinnskudd': 'riskFree',
            'High Yield': 'highYield',
            'Aksjer Norden': 'nordicStocks',
            'Aksjer Emerging Markets': 'emergingMarkets'
        };
        return nameMap[name] || 'stocks';
    }
    
    // valuesWithoutRebalancingForTooltip is already set in the else branch above if needed
    
    // Create new chart immediately
    state.charts.allocation = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            ...commonChartOptions,
            animation: false, // Disable animation for immediate update
            plugins: {
                ...commonChartOptions.plugins,
                tooltip: {
                    ...commonChartOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const assetName = context.dataset.label.split(' (')[0];
                            const value = context.parsed.y;
                            
                            // Calculate percentage based on rebalancing mode
                            let percentage;
                            if (state.allocationRebalancing) {
                                // WITH rebalancing: percentage stays constant
                                percentage = state.newPortfolio[getAssetKeyFromName(assetName)];
                            } else {
                                // WITHOUT rebalancing: calculate actual percentage at this point in time
                                // Get all values at this data point index
                                const dataIndex = context.dataIndex;
                                if (valuesWithoutRebalancingForTooltip && valuesWithoutRebalancingForTooltip[dataIndex]) {
                                    const pointValues = valuesWithoutRebalancingForTooltip[dataIndex];
                                    const total = pointValues.stocks + pointValues.riskFree + pointValues.highYield + 
                                                  pointValues.nordicStocks + pointValues.emergingMarkets;
                                    if (total > 0) {
                                        const assetKey = getAssetKeyFromName(assetName);
                                        percentage = (pointValues[assetKey] / total) * 100;
                                    } else {
                                        percentage = state.newPortfolio[getAssetKeyFromName(assetName)];
                                    }
                                } else {
                                    // Fallback: calculate from all datasets at this index
                                    const chart = context.chart;
                                    const allValues = chart.data.datasets.map(ds => ds.data[dataIndex]?.y || 0);
                                    const total = allValues.reduce((sum, val) => sum + val, 0);
                                    percentage = total > 0 ? (value / total) * 100 : 0;
                                }
                            }
                            
                            return `${assetName}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`;
                        }
                    }
                }
            },
            scales: {
                ...commonChartOptions.scales,
                y: {
                    ...commonChartOptions.scales.y,
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        ...commonChartOptions.scales.y.ticks,
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + ' M';
                        }
                    }
                }
            }
        }
    });
    console.log('Allocation chart created successfully with', datasets.length, 'datasets, rebalancing:', state.allocationRebalancing);
}

function createComparisonChart() {
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    const filteredData = getFilteredData();
    
    const currentValues = calculatePortfolioValue(filteredData, state.currentPortfolio, state.startCapital);
    const newValues = calculatePortfolioValue(filteredData, state.newPortfolio, state.startCapital);
    
    // Calculate High Water Mark for both portfolios
    const currentHWM = calculateHighWaterMark(currentValues);
    const newHWM = calculateHighWaterMark(newValues);
    
    // Find minimum portfolio value from both datasets (use actualValue, not HWM value)
    const allActualValues = [
        ...currentValues.map(v => v.value),
        ...newValues.map(v => v.value)
    ];
    const minValue = Math.min(...allActualValues);
    const yMin = minValue - 1000000; // Subtract 1 MNOK (1000000 NOK)
    
    if (state.charts.comparison) {
        state.charts.comparison.destroy();
    }
    
    state.charts.comparison = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Dagens HWM',
                    data: currentHWM.map(v => ({ x: v.date, y: v.value })),
                    borderColor: chartColors.current.main,
                    backgroundColor: 'oklch(0.9489 0.0188 255.5341 / 0.3)',
                    borderWidth: 3,
                    fill: true,
                    stepped: 'before', // Creates the staircase effect
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Ny HWM',
                    data: newHWM.map(v => ({ x: v.date, y: v.value })),
                    borderColor: chartColors.new.main,
                    backgroundColor: 'oklch(0.9489 0.0188 255.5341 / 0.3)',
                    borderWidth: 3,
                    fill: true,
                    stepped: 'before', // Creates the staircase effect
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                legend: {
                    ...commonChartOptions.plugins.legend,
                    labels: {
                        ...commonChartOptions.plugins.legend.labels,
                        generateLabels: function(chart) {
                            return [
                                {
                                    text: 'Dagens Portefølje (HWM)',
                                    fillStyle: 'oklch(0.9489 0.0188 255.5341 / 0.3)',
                                    strokeStyle: chartColors.current.main,
                                    lineWidth: 3,
                                    hidden: false
                                },
                                {
                                    text: 'Ny Portefølje (HWM)',
                                    fillStyle: 'oklch(0.9489 0.0188 255.5341 / 0.3)',
                                    strokeStyle: chartColors.new.main,
                                    lineWidth: 3,
                                    hidden: false
                                }
                            ];
                        }
                    }
                },
                tooltip: {
                    ...commonChartOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const datasetIndex = context.datasetIndex;
                            const hwmData = datasetIndex === 0 ? currentHWM : newHWM;
                            const point = hwmData[context.dataIndex];
                            const label = datasetIndex === 0 ? 'Dagens' : 'Ny';
                            return [
                                label + ' HWM: ' + formatCurrency(point.value),
                                label + ' Faktisk: ' + formatCurrency(point.actualValue)
                            ];
                        }
                    }
                }
            },
            scales: {
                ...commonChartOptions.scales,
                y: {
                    ...commonChartOptions.scales.y,
                    min: yMin,
                    beginAtZero: false,
                    ticks: {
                        ...commonChartOptions.scales.y.ticks,
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + ' M';
                        }
                    }
                }
            }
        }
    });
    
    // Update HWM specific metrics
    updateHWMMetrics(currentValues, newValues, currentHWM, newHWM);
    
    // Update high water mark table (show for current portfolio)
    updateHighWaterMarkTable(currentValues);
    
    // Update ATH KPI cards (using current portfolio for display)
    updateHWMATHKPIs(currentValues);
}

// Update ATH KPI cards for High Water Mark tab
function updateHWMATHKPIs(portfolioValues) {
    // Use current portfolio for all calculations
    const portfolio = state.currentPortfolio;
    
    // Count ATH changes for each period (using raw data, not filtered portfolioValues)
    const ath3y = countATHChanges(state.data, portfolio, 3);
    const ath5y = countATHChanges(state.data, portfolio, 5);
    const ath10y = countATHChanges(state.data, portfolio, 10);
    const athMax = countATHChanges(state.data, portfolio, null);
    
    // Update KPI elements
    const kpi3y = document.getElementById('hwm-kpi-3y');
    const kpi5y = document.getElementById('hwm-kpi-5y');
    const kpi10y = document.getElementById('hwm-kpi-10y');
    const kpiMax = document.getElementById('hwm-kpi-max');
    
    if (kpi3y) kpi3y.textContent = ath3y;
    if (kpi5y) kpi5y.textContent = ath5y;
    if (kpi10y) kpi10y.textContent = ath10y;
    if (kpiMax) kpiMax.textContent = athMax;
}

function updateHWMMetrics(currentValues, newValues, currentHWM, newHWM) {
    const currentEndValue = currentHWM[currentHWM.length - 1].value;
    const newEndValue = newHWM[newHWM.length - 1].value;
    
    const currentReturn = ((currentEndValue - state.startCapital) / state.startCapital) * 100;
    const newReturn = ((newEndValue - state.startCapital) / state.startCapital) * 100;
    
    // Calculate time spent at HWM (periods where actual = HWM)
    const currentAtPeak = currentHWM.filter(v => v.isAtPeak).length;
    const newAtPeak = newHWM.filter(v => v.isAtPeak).length;
    const currentPeakPercent = (currentAtPeak / currentHWM.length) * 100;
    const newPeakPercent = (newAtPeak / newHWM.length) * 100;
    
    // Update metrics in comparison tab
    const currentReturnEl = document.getElementById('current-return');
    const currentEndvalueEl = document.getElementById('current-endvalue');
    const currentVolatilityEl = document.getElementById('current-volatility');
    
    if (currentReturnEl) currentReturnEl.textContent = formatPercent(currentReturn);
    if (currentEndvalueEl) currentEndvalueEl.textContent = formatCurrency(currentEndValue);
    if (currentVolatilityEl) currentVolatilityEl.textContent = currentPeakPercent.toFixed(0) + '% ved ATH';
    
    const newReturnEl = document.getElementById('new-return');
    const newEndvalueEl = document.getElementById('new-endvalue');
    const newVolatilityEl = document.getElementById('new-volatility');
    
    if (newReturnEl) newReturnEl.textContent = formatPercent(newReturn);
    if (newEndvalueEl) newEndvalueEl.textContent = formatCurrency(newEndValue);
    if (newVolatilityEl) newVolatilityEl.textContent = newPeakPercent.toFixed(0) + '% ved ATH';
    
    // Update difference
    // Avkastningsforskjell: (sluttverdi ny / sluttverdi dagens) - 1
    const diffReturn = currentEndValue > 0 ? ((newEndValue / currentEndValue) - 1) * 100 : 0;
    const diffValue = newEndValue - currentEndValue;
    const diffPeak = newPeakPercent - currentPeakPercent;
    
    const diffReturnEl = document.getElementById('diff-return');
    const diffValueEl = document.getElementById('diff-endvalue');
    const diffVolEl = document.getElementById('diff-volatility');
    
    if (diffReturnEl) {
        diffReturnEl.textContent = formatPercent(diffReturn);
        diffReturnEl.className = `metric-value ${diffReturn < 0 ? 'negative' : ''}`;
    }
    
    if (diffValueEl) {
        diffValueEl.textContent = formatCurrency(diffValue);
        diffValueEl.className = `metric-value ${diffValue < 0 ? 'negative' : ''}`;
    }
    
    if (diffVolEl) {
        diffVolEl.textContent = formatPercent(diffPeak);
        diffVolEl.className = `metric-value ${diffPeak < 0 ? 'negative' : ''}`;
    }
}

function createDrawdownCharts() {
    const filteredData = getFilteredData();
    
    const portfolio = state.selectedDrawdownPortfolio === 'current' 
        ? state.currentPortfolio 
        : state.newPortfolio;
    
    const portfolioValues = calculatePortfolioValue(filteredData, portfolio, state.startCapital);
    
    // Calculate drawdown based on view type
    const drawdowns = state.selectedDrawdownView === 'kr' 
        ? calculateDrawdownInKr(portfolioValues)
        : calculateDrawdown(portfolioValues);
    
    // Calculate KPIs (always use percentage for KPIs, but also need kr for first KPI)
    const drawdownsPercent = calculateDrawdown(portfolioValues);
    const drawdownsKr = calculateDrawdownInKr(portfolioValues);
    updateDrawdownKPIs(portfolioValues, drawdownsPercent, drawdownsKr);
    
    // Create drawdown chart with appropriate view type
    createUnderwaterChart(drawdowns, state.selectedDrawdownView);
    
    // Update recovery table (always use percentage)
    updateRecoveryTable(drawdownsPercent);
}

function updateDrawdownKPIs(portfolioValues, drawdowns, drawdownsKr) {
    // Count number of times loss exceeded 500 000 kr
    let lossOver500kCount = 0;
    let wasBelow500k = false;
    
    for (let i = 0; i < drawdownsKr.length; i++) {
        const lossKr = drawdownsKr[i].drawdown; // This is negative (loss in kr)
        if (lossKr < -500000 && !wasBelow500k) {
            // Entering a period with loss greater than 500 000 kr
            wasBelow500k = true;
            lossOver500kCount++;
        } else if (lossKr >= -500000) {
            // Recovered above -500 000 kr
            wasBelow500k = false;
        }
    }
    
    document.getElementById('kpi-loss-over-500k').textContent = lossOver500kCount + ' ganger';
    
    // Max Drawdown
    const maxDD = Math.min(...drawdowns.map(d => d.drawdown));
    document.getElementById('kpi-max-dd').textContent = maxDD.toFixed(1) + '%';
    
    // Count number of times drawdown exceeded -5%
    let fallOver5Count = 0;
    let wasBelow5Percent = false;
    
    for (let i = 0; i < drawdowns.length; i++) {
        const dd = drawdowns[i].drawdown;
        if (dd < -5 && !wasBelow5Percent) {
            // Entering a period below -5%
            wasBelow5Percent = true;
            fallOver5Count++;
        } else if (dd >= -5) {
            // Recovered above -5%
            wasBelow5Percent = false;
        }
    }
    
    document.getElementById('kpi-fall-over-5').textContent = fallOver5Count + ' ganger';
    
    // Longest Recovery Period
    const largestDrawdowns = findLargestDrawdowns(drawdowns, 10);
    let longestRecovery = 0;
    largestDrawdowns.forEach(dd => {
        if (dd.recoveryDays !== null && dd.recoveryDays > longestRecovery) {
            longestRecovery = dd.recoveryDays;
        }
    });
    document.getElementById('kpi-longest-recovery').textContent = 
        longestRecovery > 0 ? longestRecovery + ' dager' : 'Pågående';
}

function createEquityChart(portfolioValues, drawdowns) {
    const ctx = document.getElementById('equity-chart').getContext('2d');
    
    if (state.charts.equity) {
        state.charts.equity.destroy();
    }
    
    // Find ATH points for highlighting
    const athPoints = [];
    let currentATH = 0;
    drawdowns.forEach((d, i) => {
        if (d.peak > currentATH) {
            currentATH = d.peak;
            athPoints.push({ x: d.date, y: d.peak, isATH: true });
        }
    });
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                bottom: 20
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'oklch(0.2722 0.1053 258.9631 / 0.95)',
                titleFont: { family: "'Inter', sans-serif", size: 11 },
                bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
                padding: 8,
                cornerRadius: 4,
                callbacks: {
                    label: function(context) {
                        if (context.datasetIndex === 0) {
                            return 'Verdi: ' + formatCurrency(context.parsed.y);
                        } else {
                            return 'ATH: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: { unit: 'year', displayFormats: { year: 'yyyy' } },
                grid: { display: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 } },
                min: state.drawdownZoom.isZoomed ? state.drawdownZoom.minX : undefined,
                max: state.drawdownZoom.isZoomed ? state.drawdownZoom.maxX : undefined
            },
            y: {
                grid: { color: 'oklch(0.2722 0.1053 258.9631 / 0.05)' },
                ticks: {
                    font: { family: "'JetBrains Mono', monospace", size: 10 },
                    callback: function(value) {
                        return (value / 1000000).toFixed(0) + 'M';
                    }
                }
            }
        }
    };
    
    state.charts.equity = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Porteføljeverdi',
                    data: portfolioValues.map(v => ({ x: v.date, y: v.value })),
                    borderColor: 'oklch(0.6020 0.1679 258.6201)',
                    backgroundColor: 'oklch(0.9489 0.0188 255.5341 / 0.3)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'All-Time High',
                    data: drawdowns.map(d => ({ x: d.date, y: d.peak })),
                    borderColor: 'oklch(0.6020 0.1679 258.6201)',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        },
        options: chartOptions
    });
    
    // Setup zoom interaction
    setupZoomInteraction(ctx.canvas, 'equity');
}

function createUnderwaterChart(drawdowns, viewType = 'percent') {
    const canvas = document.getElementById('drawdown-chart');
    const ctx = canvas.getContext('2d');
    
    if (state.charts.drawdown) {
        state.charts.drawdown.destroy();
    }
    
    // Find min and max drawdown values for Y-axis configuration
    const drawdownValues = drawdowns.map(d => d.drawdown);
    const minDrawdown = Math.min(...drawdownValues);
    const maxDrawdown = Math.max(...drawdownValues, 0);
    
    // Y-axis configuration based on view type
    let yMin, yMax;
    if (viewType === 'kr') {
        // For kr view: Y-axis should go down to largest fall in MNOK + 0.5 MNOK
        // minDrawdown is already negative (loss in kr), so we add 0.5 MNOK (500000) to it
        yMin = minDrawdown - 500000; // Subtract 0.5 MNOK (500000 kr)
        yMax = 0;
    } else {
        // For percent view: Y-axis should go down to lowest point + 1% padding
        yMin = minDrawdown - 1; // Lowest point minus 1%
        yMax = 0; // Start at 0% at the top
    }
    
    // Define colors based on view type
    const mainColor = viewType === 'kr' ? '#2563eb' : '#f43f5e'; // Blue for kr view, red for percent
    const mainColorRgb = viewType === 'kr' ? '37, 99, 235' : '244, 63, 94'; // RGB values
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                bottom: 20
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        onHover: (event, activeElements) => {
            canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        },
        plugins: {
            legend: {
                display: false
            },
                tooltip: {
                enabled: true,
                backgroundColor: 'rgba(20, 20, 30, 0.95)', // Standard dark tooltip background
                titleFont: { family: "'Inter', sans-serif", size: 12, weight: '600' },
                bodyFont: { family: "'JetBrains Mono', monospace", size: 13 },
                padding: 12,
                cornerRadius: 8,
                borderColor: mainColor,
                borderWidth: 2,
                callbacks: {
                    label: function(context) {
                        const chartViewType = context.chart.options.viewType || 'percent';
                        if (chartViewType === 'kr') {
                            const value = Math.abs(context.parsed.y);
                            return 'Tap: ' + formatCurrency(value);
                        } else {
                            return 'Drawdown: ' + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: { unit: 'year', displayFormats: { year: 'yyyy' } },
                grid: { display: false },
                position: 'bottom',
                ticks: { 
                    font: { family: "'DM Sans', sans-serif", size: 11 },
                    padding: 8
                },
                min: state.drawdownZoom.isZoomed ? state.drawdownZoom.minX : undefined,
                max: state.drawdownZoom.isZoomed ? state.drawdownZoom.maxX : undefined
            },
            y: {
                min: yMin,
                max: yMax,
                beginAtZero: false,
                reverse: false, // 0% at top, negative values going down
                grid: { 
                    color: 'rgba(0, 0, 0, 0.05)' // Same as other charts
                },
                ticks: {
                    font: { family: "'JetBrains Mono', monospace", size: 11 },
                    color: mainColor, // Red color for Y-axis labels (matching the graph)
                    callback: function(value, index, ticks) {
                        const chartViewType = this.chart.options.viewType || 'percent';
                        if (chartViewType === 'kr') {
                            // Format as currency (MNOK) - show absolute value since it's a loss
                            const absValue = Math.abs(value);
                            if (absValue >= 1000000) {
                                return (absValue / 1000000).toFixed(1) + ' MNOK';
                            } else if (absValue >= 1000) {
                                return (absValue / 1000).toFixed(0) + ' KNOK';
                            } else {
                                return absValue.toFixed(0) + ' kr';
                            }
                        } else {
                            // Format to 1 decimal place for cleaner display
                            return value.toFixed(1) + '%';
                        }
                    },
                    stepSize: viewType === 'kr' ? undefined : 5
                }
            }
        },
        elements: {
            line: {
                borderWidth: 3,
                tension: 0.3
            },
            point: {
                radius: 0,
                hoverRadius: 8,
                hoverBorderWidth: 3,
                hoverBorderColor: mainColor,
                hoverBackgroundColor: '#ffffff'
            }
        }
    };
    
    // Custom plugin for gradient fill, glow effect, and reference lines
    const drawdownPlugin = {
        id: 'drawdownGradient',
        beforeDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const yScale = chart.scales.y;
            
            if (!chartArea || !yScale) return;
            
            // Draw reference lines (only for percent view)
            // Access viewType from chart options
            const chartViewType = chart.options.viewType || 'percent';
            const chartMainColorRgb = chartViewType === 'kr' ? '37, 99, 235' : '244, 63, 94';
            if (chartViewType === 'percent') {
                ctx.save();
                ctx.strokeStyle = `rgba(${chartMainColorRgb}, 0.3)`; // Low opacity main color
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]); // Dotted style
                
                // Draw -10% line
                const y10 = yScale.getPixelForValue(-10);
                if (y10 >= chartArea.top && y10 <= chartArea.bottom) {
                    ctx.beginPath();
                    ctx.moveTo(chartArea.left, y10);
                    ctx.lineTo(chartArea.right, y10);
                    ctx.stroke();
                }
                
                // Draw -20% line
                const y20 = yScale.getPixelForValue(-20);
                if (y20 >= chartArea.top && y20 <= chartArea.bottom) {
                    ctx.beginPath();
                    ctx.moveTo(chartArea.left, y20);
                    ctx.lineTo(chartArea.right, y20);
                    ctx.stroke();
                }
                
                ctx.setLineDash([]);
                ctx.restore();
            }
            
            const meta = chart.getDatasetMeta(0);
            if (!meta || !meta.data || meta.data.length === 0) return;
            
            const points = meta.data;
            
            // Draw gradient fill ABOVE the line (from line up to 0% at top)
            // Fill the area from the line upward to chartArea.top (which is at 0%)
            ctx.save();
            ctx.beginPath();
            
            // Start at top-left corner (0% line)
            ctx.moveTo(chartArea.left, chartArea.top);
            
            // Draw along top edge to first point
            ctx.lineTo(points[0].x, chartArea.top);
            
            // Draw smooth curve following the line (the actual drawdown line, going left to right)
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                if (point && point.x !== undefined && point.y !== undefined) {
                    if (i === 0) {
                        ctx.lineTo(point.x, point.y);
                    } else {
                        // Use quadratic curve for smoothness
                        const prevPoint = points[i - 1];
                        if (prevPoint && prevPoint.x !== undefined && prevPoint.y !== undefined) {
                            const cpx = (prevPoint.x + point.x) / 2;
                            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, (prevPoint.y + point.y) / 2);
                            ctx.quadraticCurveTo(point.x, point.y, point.x, point.y);
                        }
                    }
                }
            }
            
            // Draw from last point back up to top edge, then close
            ctx.lineTo(points[points.length - 1].x, chartArea.top);
            ctx.closePath();
            
            // Create gradient: light at top (0%), dark at line (deep drawdown)
            // chartArea.top is at 0%, the line is at negative values below
            // Gradient goes from top (0%) down to where the line is (where it's darkest)
            const chartMainColorRgbGradient = chart.options.viewType === 'kr' ? '37, 99, 235' : '244, 63, 94';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, `rgba(${chartMainColorRgbGradient}, 0.05)`); // 5% opacity at top (0% - surface)
            gradient.addColorStop(0.3, `rgba(${chartMainColorRgbGradient}, 0.25)`); // Increasing saturation
            gradient.addColorStop(0.6, `rgba(${chartMainColorRgbGradient}, 0.5)`); // Mid-depth
            gradient.addColorStop(0.85, `rgba(${chartMainColorRgbGradient}, 0.75)`); // Deep
            gradient.addColorStop(1, `rgba(${chartMainColorRgbGradient}, 0.95)`); // 95% opacity at line (maximum drawdown)
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        },
        afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            
            if (!meta || !meta.data || meta.data.length === 0) return;
            
            const points = meta.data;
            
            // Draw line with glow effect (multiple passes for neon glow)
            ctx.save();
            ctx.beginPath();
            
            // Build smooth path function
            const buildPath = () => {
                ctx.beginPath();
                for (let i = 0; i < points.length; i++) {
                    const point = points[i];
                    if (point && point.x !== undefined && point.y !== undefined) {
                        if (i === 0) {
                            ctx.moveTo(point.x, point.y);
                        } else {
                            const prevPoint = points[i - 1];
                            if (prevPoint && prevPoint.x !== undefined && prevPoint.y !== undefined) {
                                const cpx = (prevPoint.x + point.x) / 2;
                                ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, (prevPoint.y + point.y) / 2);
                            }
                        }
                    }
                }
            };
            
            // Draw neon glow effect first (drop-shadow)
            const chartMainColorRgbGlow = chart.options.viewType === 'kr' ? '37, 99, 235' : '244, 63, 94';
            const chartMainColorHex = chart.options.viewType === 'kr' ? '#2563eb' : '#f43f5e';
            buildPath();
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${chartMainColorRgbGlow}, 0.6)`;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle = `rgba(${chartMainColorRgbGlow}, 0.8)`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            
            // Draw main line on top (2px solid, sharp, no blur)
            buildPath();
            ctx.strokeStyle = chartMainColorHex;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
            ctx.stroke();
            ctx.restore();
        }
    };
    
    state.charts.drawdown = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Drawdown',
                data: drawdowns.map(d => ({ x: d.date, y: d.drawdown })),
                borderColor: 'transparent', // Hide default line, we draw it in plugin
                backgroundColor: 'transparent', // We draw gradient manually
                borderWidth: 0,
                fill: false,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#ffffff', // White core (Halo effect)
                pointHoverBorderColor: mainColor, // Main color ring
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            viewType: viewType // Store viewType in options for plugin access
        },
        plugins: [drawdownPlugin]
    });
    
    // Setup zoom interaction with visual feedback
    setupZoomInteraction(ctx.canvas, 'drawdown');
}

// Zoom functionality
let zoomStart = null;
let zoomCanvas = null;
let zoomOverlay = null;

function setupZoomInteraction(canvas, chartType) {
    // Remove existing listeners if any
    canvas.removeEventListener('mousedown', handleZoomMouseDown);
    canvas.removeEventListener('mousemove', handleZoomMouseMove);
    canvas.removeEventListener('mouseup', handleZoomMouseUp);
    canvas.removeEventListener('mouseleave', handleZoomMouseLeave);
    
    // Create overlay element for zoom selection
    if (!zoomOverlay) {
        zoomOverlay = document.createElement('div');
        zoomOverlay.style.position = 'absolute';
        zoomOverlay.style.pointerEvents = 'none';
        // Colors will be updated dynamically based on view type when zooming
        zoomOverlay.style.backgroundColor = 'rgba(244, 63, 94, 0.2)';
        zoomOverlay.style.border = '2px solid #f43f5e';
        zoomOverlay.style.display = 'none';
        zoomOverlay.style.zIndex = '1000';
        canvas.parentElement.style.position = 'relative';
        canvas.parentElement.appendChild(zoomOverlay);
    }
    
    function handleZoomMouseDown(e) {
        if (chartType !== 'drawdown') return;
        const rect = canvas.getBoundingClientRect();
        zoomStart = {
            x: e.clientX - rect.left,
            chart: chartType
        };
        zoomCanvas = canvas;
        canvas.style.cursor = 'crosshair';
    }
    
    function handleZoomMouseMove(e) {
        if (!zoomStart || zoomCanvas !== canvas || chartType !== 'drawdown') {
            if (zoomOverlay) zoomOverlay.style.display = 'none';
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const parentRect = canvas.parentElement.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const startX = zoomStart.x;
        
        const left = Math.min(startX, currentX);
        const width = Math.abs(currentX - startX);
        
        // Update overlay - use relative positions to parent element
        zoomOverlay.style.left = (rect.left - parentRect.left + left) + 'px';
        zoomOverlay.style.top = (rect.top - parentRect.top) + 'px';
        zoomOverlay.style.width = width + 'px';
        zoomOverlay.style.height = rect.height + 'px';
        zoomOverlay.style.display = 'block';
        
        // Update colors based on view type for drawdown chart
        if (chartType === 'drawdown') {
            const zoomColorRgb = state.selectedDrawdownView === 'kr' ? '201, 31, 61' : '244, 63, 94';
            const zoomColorHex = state.selectedDrawdownView === 'kr' ? '#c91f3d' : '#f43f5e';
            zoomOverlay.style.backgroundColor = `rgba(${zoomColorRgb}, 0.2)`;
            zoomOverlay.style.border = `2px solid ${zoomColorHex}`;
        }
    }
    
    function handleZoomMouseUp(e) {
        if (!zoomStart || zoomCanvas !== canvas || chartType !== 'drawdown') return;
        
        const rect = canvas.getBoundingClientRect();
        const zoomEnd = e.clientX - rect.left;
        
        // Hide overlay
        if (zoomOverlay) zoomOverlay.style.display = 'none';
        canvas.style.cursor = 'default';
        
        // Only zoom if drag distance is significant
        if (Math.abs(zoomEnd - zoomStart.x) > 20) {
            const chart = state.charts.drawdown;
            if (chart) {
                const xScale = chart.scales.x;
                const minPixel = Math.min(zoomStart.x, zoomEnd);
                const maxPixel = Math.max(zoomStart.x, zoomEnd);
                
                const minValue = xScale.getValueForPixel(minPixel);
                const maxValue = xScale.getValueForPixel(maxPixel);
                
                // Apply zoom
                state.drawdownZoom = {
                    isZoomed: true,
                    minX: minValue,
                    maxX: maxValue
                };
                
                // Update chart
                updateDrawdownZoom();
                
                // Show reset button
                document.getElementById('reset-zoom-btn').classList.remove('hidden');
            }
        }
        
        zoomStart = null;
        zoomCanvas = null;
    }
    
    function handleZoomMouseLeave() {
        if (zoomOverlay) zoomOverlay.style.display = 'none';
        if (canvas) canvas.style.cursor = 'default';
        zoomStart = null;
        zoomCanvas = null;
    }
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleZoomMouseDown);
    canvas.addEventListener('mousemove', handleZoomMouseMove);
    canvas.addEventListener('mouseup', handleZoomMouseUp);
    canvas.addEventListener('mouseleave', handleZoomMouseLeave);
}

function updateDrawdownZoom() {
    // Update drawdown chart
    if (state.charts.drawdown) {
        state.charts.drawdown.options.scales.x.min = state.drawdownZoom.minX;
        state.charts.drawdown.options.scales.x.max = state.drawdownZoom.maxX;
        state.charts.drawdown.update('none');
    }
}

function resetDrawdownZoom() {
    state.drawdownZoom = {
        isZoomed: false,
        minX: null,
        maxX: null
    };
    
    // Update drawdown chart
    if (state.charts.drawdown) {
        state.charts.drawdown.options.scales.x.min = undefined;
        state.charts.drawdown.options.scales.x.max = undefined;
        state.charts.drawdown.update('none');
    }
    
    // Hide reset button
    document.getElementById('reset-zoom-btn').classList.add('hidden');
}

// Legacy function for compatibility
function createDrawdownChart() {
    createDrawdownCharts();
}

function updateRecoveryTable(drawdowns) {
    const largestDrawdowns = findLargestDrawdowns(drawdowns);
    const container = document.getElementById('recovery-list');
    
    container.innerHTML = largestDrawdowns.map((dd, index) => `
        <div class="table-row">
            <span class="rank">#${index + 1}</span>
            <span class="period">${formatDate(dd.startDate)} - ${formatDate(dd.endDate)}</span>
            <span class="drawdown">${dd.maxDrawdown.toFixed(1)}%</span>
            <span class="recovery">${dd.recoveryDays !== null ? dd.recoveryDays + ' dager' : 'Ikke gjenvunnet'}</span>
        </div>
    `).join('');
}

function updateHighWaterMarkTable(portfolioValues) {
    const longestPeriods = findLongestHighWaterMarkPeriods(portfolioValues);
    const container = document.getElementById('hwm-list');
    
    if (!container) {
        console.error('HWM container not found');
        return;
    }
    
    if (longestPeriods.length === 0) {
        container.innerHTML = '<div class="table-row"><span style="grid-column: 1 / -1; text-align: center; color: var(--muted-foreground);">Ingen perioder funnet</span></div>';
        return;
    }
    
    container.innerHTML = longestPeriods.map((period, index) => `
        <div class="table-row">
            <span class="rank">#${index + 1}</span>
            <span class="period">${formatDate(period.startDate)} - ${formatDate(period.endDate)}</span>
            <span class="drawdown">${period.daysBelowHWM} dager</span>
        </div>
    `).join('');
}

function createNurseChart() {
    const ctx = document.getElementById('nurse-chart').getContext('2d');
    const filteredData = getFilteredData();
    
    // Calculate portfolio value for the filtered period, but normalize so it always starts at 10 MNOK
    const newValues = calculatePortfolioValue(filteredData, state.newPortfolio, state.startCapital);
    
    // Normalize the portfolio values so the first value is always exactly 10 MNOK
    if (newValues.length > 0 && newValues[0].value !== state.startCapital) {
        const normalizationFactor = state.startCapital / newValues[0].value;
        newValues.forEach(v => {
            v.value = v.value * normalizationFactor;
        });
    }
    
    // Calculate nurse index (portfolio value / nurse salary at each point in time)
    // This shows how many annual nurse salaries the portfolio is worth at each time
    // Filter to only include January 1st of each year for smoother line
    const nurseIndexYearly = newValues
        .filter(v => {
            const date = v.date;
            return date.getMonth() === 0 && date.getDate() === 1; // January 1st
        })
        .map(v => {
            const index = v.nurseSalary > 0 ? v.value / v.nurseSalary : 0;
            return {
                date: v.date,
                value: v.value,
                nurseSalary: v.nurseSalary,
                index: index
            };
        });
    
    // Portfolio values for all data points (for the blue line)
    const portfolioData = newValues.map(v => ({ x: v.date, y: v.value }));
    
    if (state.charts.nurse) {
        state.charts.nurse.destroy();
    }
    
    state.charts.nurse = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Porteføljeverdi (MNOK)',
                    data: portfolioData,
                    borderColor: chartColors.new.main,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    label: 'Sykepleierindeks (årslønner)',
                    data: nurseIndexYearly.map(n => ({ x: n.date, y: n.index })),
                    borderColor: chartColors.nurse,
                    backgroundColor: 'oklch(0.55 0.18 145 / 0.2)',
                    borderWidth: 3.5,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...commonChartOptions,
            scales: {
                x: {
                    ...commonChartOptions.scales.x
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'JetBrains Mono', monospace",
                            size: 11
                        },
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + ' M';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        font: {
                            family: "'JetBrains Mono', monospace",
                            size: 11
                        },
                        callback: function(value) {
                            return value.toFixed(0) + ' årslønner';
                        }
                    }
                }
            },
            plugins: {
                ...commonChartOptions.plugins,
                tooltip: {
                    ...commonChartOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return 'Portefølje: ' + formatCurrency(context.parsed.y);
                            } else {
                                const point = nurseIndexYearly[context.dataIndex];
                                if (point) {
                                    return [
                                        'Indeks: ' + context.parsed.y.toFixed(1) + ' årslønner',
                                        'Portefølje: ' + formatCurrency(point.value),
                                        'Lønn: ' + formatCurrency(point.nurseSalary)
                                    ];
                                }
                                return 'Indeks: ' + context.parsed.y.toFixed(1) + ' årslønner';
                            }
                        }
                    }
                }
            }
        }
    });
    
    // Update nurse info cards
    if (newValues.length === 0 || filteredData.length === 0) return;
    
    // Get start salary - try multiple sources
    const startData = filteredData[0];
    let startSalary = 0;
    
    // Try filteredData first
    if (startData && startData.nurseSalary) {
        startSalary = parseFloat(startData.nurseSalary);
    }
    // Try newValues as fallback
    else if (newValues[0] && newValues[0].nurseSalary) {
        startSalary = parseFloat(newValues[0].nurseSalary);
    }
    // Try state.data as last resort (find matching date)
    else if (state.data && state.data.length > 0) {
        const matchingData = state.data.find(d => d.date && d.date.getTime() === startData.date.getTime());
        if (matchingData && matchingData.nurseSalary) {
            startSalary = parseFloat(matchingData.nurseSalary);
        }
    }
    const endSalary = 700000; // Hardcoded current salary
    const startYear = startData && startData.date ? startData.date.getFullYear() : new Date().getFullYear();
    
    // Calculate number of years in the period
    const endDate = newValues[newValues.length - 1].date;
    const startDate = newValues[0].date;
    const yearsDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
    const numYears = Math.max(1, yearsDiff); // At least 1 year
    
    // Calculate annual growth rate (CAGR) for salary
    let annualGrowth = 0;
    if (startSalary > 0 && endSalary > 0 && numYears > 0) {
        annualGrowth = ((Math.pow(endSalary / startSalary, 1 / numYears) - 1) * 100);
    }
    
    // Update start value label
    const startLabelEl = document.getElementById('nurse-start-label');
    if (startLabelEl) {
        startLabelEl.textContent = `Startverdi (${startYear})`;
    }
    
    // Update start value (show salary in kr)
    const nurseStartEl = document.getElementById('nurse-start');
    if (nurseStartEl) {
        if (startSalary > 0) {
            nurseStartEl.textContent = startSalary.toLocaleString('no-NO', { maximumFractionDigits: 0 });
        } else {
            nurseStartEl.textContent = '-';
        }
    }
    
    // End value is already hardcoded in HTML as 700 000, but let's make sure it's correct
    const nurseEndEl = document.getElementById('nurse-end');
    if (nurseEndEl) {
        nurseEndEl.textContent = '700 000';
    }
    
    // Update annual growth
    const growthEl = document.getElementById('nurse-growth');
    if (growthEl) {
        if (annualGrowth > 0 || annualGrowth < 0) {
            growthEl.textContent = annualGrowth.toFixed(2) + '%';
        } else {
            growthEl.textContent = '-';
        }
    }
    
    // Calculate and update nurse index values (from yearly data - January 1st of each year)
    // First year: antall årslønner første år
    if (nurseIndexYearly.length > 0) {
        const firstYearIndex = nurseIndexYearly[0].index;
        const firstYearEl = document.getElementById('nurse-index-first');
        if (firstYearEl) {
            firstYearEl.textContent = firstYearIndex.toFixed(1);
        }
    }
    
    // Last year: antall årslønner siste år
    if (nurseIndexYearly.length > 0) {
        const firstYearIndex = nurseIndexYearly[0].index;
        const lastYearIndex = nurseIndexYearly[nurseIndexYearly.length - 1].index;
        const lastYearEl = document.getElementById('nurse-index-last');
        if (lastYearEl) {
            lastYearEl.textContent = lastYearIndex.toFixed(1);
        }
        
        // Calculate growth percentage and annual growth (CAGR)
        if (firstYearIndex > 0 && lastYearIndex > 0) {
            const totalGrowth = ((lastYearIndex / firstYearIndex) - 1) * 100;
            const numYears = nurseIndexYearly.length - 1; // Number of years between first and last
            const annualGrowth = numYears > 0 
                ? ((Math.pow(lastYearIndex / firstYearIndex, 1 / numYears) - 1) * 100)
                : 0;
            
            // Update growth display
            const growthContainer = document.getElementById('nurse-index-growth');
            const growthTotalEl = document.getElementById('nurse-growth-total');
            const growthAnnualEl = document.getElementById('nurse-growth-annual');
            
            if (growthContainer && growthTotalEl && growthAnnualEl) {
                growthTotalEl.textContent = `Vekst: ${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toFixed(1)}%`;
                growthAnnualEl.textContent = `${annualGrowth >= 0 ? '+' : ''}${annualGrowth.toFixed(2)}% per år`;
                growthContainer.style.display = 'flex';
            }
        } else {
            // Hide growth if we can't calculate it
            const growthContainer = document.getElementById('nurse-index-growth');
            if (growthContainer) {
                growthContainer.style.display = 'none';
            }
        }
    }
    
    // 10 years before last: antall årslønner 10 år før siste dato
    if (nurseIndexYearly.length > 10) {
        const index10YearsAgo = nurseIndexYearly[nurseIndexYearly.length - 11].index;
        const tenYearsAgoEl = document.getElementById('nurse-index-10-years-ago');
        if (tenYearsAgoEl) {
            tenYearsAgoEl.textContent = index10YearsAgo.toFixed(1);
        }
    } else if (nurseIndexYearly.length > 0) {
        // If less than 10 years of data, show the first year instead
        const firstYearIndex = nurseIndexYearly[0].index;
        const tenYearsAgoEl = document.getElementById('nurse-index-10-years-ago');
        if (tenYearsAgoEl) {
            tenYearsAgoEl.textContent = firstYearIndex.toFixed(1);
        }
    }
}

function createAssetsGrid() {
    const container = document.getElementById('assets-grid');
    const filteredData = getFilteredData();
    const yearlyReturns = calculateYearlyReturns(filteredData);
    
    const years = Object.keys(yearlyReturns).sort();
    const numYears = years.length;
    
    // Get the actual container width (more accurate than viewport)
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width || container.offsetWidth || window.innerWidth - 200;
    
    // Calculate gap size (var(--space-xs) is typically 8px)
    const gapSize = 8;
    const totalGaps = (numYears - 1) * gapSize;
    const availableWidth = containerWidth - totalGaps;
    
    let gridTemplateColumns;
    
    if (state.selectedPeriod === 'max') {
        // For "max" period: Fit all years without scrolling but fill width and height
        // Use minmax with lower minimum width to ensure all years fit while still filling space
        const minColumnWidth = 40; // Lower minimum for max period
        const calculatedWidth = Math.floor(availableWidth / numYears);
        const optimalColumnWidth = Math.max(minColumnWidth, calculatedWidth);
        gridTemplateColumns = `repeat(${numYears}, minmax(${optimalColumnWidth}px, 1fr))`;
    } else {
        // For other periods (like "10y"): Fill screen with flexible larger columns
        const minColumnWidth = 65;
        const maxColumnWidth = 250;
        const optimalColumnWidth = Math.max(
            minColumnWidth,
            Math.min(
                maxColumnWidth,
                Math.floor(availableWidth / numYears)
            )
        );
        gridTemplateColumns = `repeat(${numYears}, minmax(${optimalColumnWidth}px, 1fr))`;
    }
    
    // Set dynamic grid template columns
    container.style.gridTemplateColumns = gridTemplateColumns;
    
    container.innerHTML = years.map(year => {
        const returns = yearlyReturns[year];
        
        // Rank assets - all 6 asset classes (including KPI)
        const assets = [
            { name: 'Aksjer Global', return: returns.stocks, class: 'stocks' },
            { name: 'Bankinnskudd', return: returns.riskFree, class: 'risikofri' },
            { name: 'High Yield', return: returns.highYield, class: 'highyield' },
            { name: 'Aksjer Norden', return: returns.nordicStocks, class: 'nordicstocks' },
            { name: 'Aksjer Emerging Markets', return: returns.emergingMarkets, class: 'emergingmarkets' },
            { name: 'KPI', return: returns.kpi || 0, class: 'kpi' }
        ].sort((a, b) => b.return - a.return);
        
        return `
            <div class="asset-column animate-in">
                <div class="year-label">${year}</div>
                ${assets.map(asset => `
                    <div class="asset-cell ${asset.class} ${asset.return < 0 ? 'negative' : ''} ${state.selectedAssetClass === asset.class ? 'marked' : ''}" 
                         data-asset-class="${asset.class}">
                        <span class="asset-name">${asset.name}</span>
                        <span class="asset-return">${formatPercent(asset.return, 0)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
    
    // Add click event listeners to asset cells
    const assetCells = container.querySelectorAll('.asset-cell');
    const assetsGrid = container;
    
    assetCells.forEach(cell => {
        cell.addEventListener('click', () => {
            const assetClass = cell.dataset.assetClass;
            
            // If clicking the same asset class, deselect it
            if (state.selectedAssetClass === assetClass) {
                state.selectedAssetClass = null;
                assetsGrid.classList.remove('filtered');
                assetCells.forEach(c => c.classList.remove('marked'));
            } else {
                // Select new asset class
                state.selectedAssetClass = assetClass;
                assetsGrid.classList.add('filtered');
                
                // Mark all cells with the same asset class
                assetCells.forEach(c => {
                    if (c.dataset.assetClass === assetClass) {
                        c.classList.add('marked');
                    } else {
                        c.classList.remove('marked');
                    }
                });
            }
        });
    });
    
    // Apply current filter state if one exists
    if (state.selectedAssetClass) {
        assetsGrid.classList.add('filtered');
    }
}

// ========================================
// Tab Navigation
// ========================================
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // Update buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Initialize charts for the active tab
            switch (tabId) {
                case 'input':
                    // Input tab - no chart needed
                    break;
                case 'portfolio-comparison':
                    createOverviewChart();
                    break;
                case 'allocation':
                    // Small delay to ensure tab is visible before creating chart
                    setTimeout(() => {
                        createAllocationChart();
                    }, 100);
                    break;
                case 'comparison':
                    createComparisonChart();
                    updateMetrics();
                    break;
                case 'drawdown':
                    createDrawdownCharts();
                    break;
                case 'nurse':
                    createNurseChart();
                    break;
                case 'assets':
                    createAssetsGrid();
                    break;
                case 'money':
                    initializeMoneyValueCalculations();
                    break;
            }
        });
    });
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // Current portfolio sliders
    const currentSliders = ['stocks', 'riskfree', 'highyield', 'nordic', 'emerging'];
    currentSliders.forEach(sliderName => {
        const slider = document.getElementById(`current-${sliderName}`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                validateAndAdjustSlider('current', slider.id, parseFloat(e.target.value));
            });
        }
    });
    
    // New portfolio sliders
    const newSliders = ['stocks', 'riskfree', 'highyield', 'nordic', 'emerging'];
    newSliders.forEach(sliderName => {
        const slider = document.getElementById(`new-${sliderName}`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                validateAndAdjustSlider('new', slider.id, parseFloat(e.target.value));
            });
        }
    });
    
    // Allocation shortcut buttons for both portfolios
    const allocationButtons = document.querySelectorAll('.allocation-btn');
    allocationButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const allocationPercent = parseFloat(btn.dataset.allocation);
            const portfolioType = btn.dataset.portfolio; // 'current' or 'new'
            
            // Determine which portfolio to update
            const portfolio = portfolioType === 'current' ? state.currentPortfolio : state.newPortfolio;
            
            // New allocation formula:
            // 0% = 50% High Yield + 50% Bankinnskudd
            // 100% = 50% globale aksjer + 30% emerging markets + 20% nordiske aksjer
            // For mellomverdier, proporsjonal fordeling
            
            const stockAllocation = allocationPercent; // Total aksjeandel
            const nonStockAllocation = 100 - allocationPercent; // Total ikke-aksjeandel
            
            // Aksjer: 50% globale, 30% emerging, 20% nordiske
            portfolio.stocks = stockAllocation * 0.5; // Globale aksjer
            portfolio.emergingMarkets = stockAllocation * 0.3; // Emerging Markets
            portfolio.nordicStocks = stockAllocation * 0.2; // Nordiske aksjer
            
            // Ikke-aksjer: 50% High Yield, 50% Bankinnskudd
            portfolio.highYield = nonStockAllocation * 0.5; // High Yield
            portfolio.riskFree = nonStockAllocation * 0.5; // Bankinnskudd
            
            // Update active state on buttons - only for buttons in the same portfolio group
            const portfolioButtons = document.querySelectorAll(`.allocation-btn[data-portfolio="${portfolioType}"]`);
            portfolioButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update UI and charts
            updateSliderUI(portfolioType);
            updateCharts();
        });
    });
    
    // Initialize UI
    updateSliderUI('current');
    updateSliderUI('new');
    
    // Initialize treemap charts
    updateTreemapChart('current');
    updateTreemapChart('new');
    
    // Resize handler for treemap charts and assets grid
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateTreemapChart('current');
            updateTreemapChart('new');
            // Update assets grid if it's the active tab
            const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
            if (activeTab === 'assets') {
                createAssetsGrid();
            }
        }, 250);
    });
    
    // Fullscreen button for overview chart
    const overviewFullscreenBtn = document.getElementById('overview-fullscreen-btn');
    if (overviewFullscreenBtn) {
        overviewFullscreenBtn.addEventListener('click', () => {
            openChartFullscreen('overview');
        });
    }
    
    // Fullscreen button for comparison chart
    const comparisonFullscreenBtn = document.getElementById('comparison-fullscreen-btn');
    if (comparisonFullscreenBtn) {
        comparisonFullscreenBtn.addEventListener('click', () => {
            openChartFullscreen('comparison');
        });
    }
    
    // Fullscreen button for drawdown chart
    const drawdownFullscreenBtn = document.getElementById('drawdown-fullscreen-btn');
    if (drawdownFullscreenBtn) {
        drawdownFullscreenBtn.addEventListener('click', () => {
            openChartFullscreen('drawdown');
        });
    }
    
    // Chart selector buttons for portfolio comparison tab
    const chartSelectorBtns = document.querySelectorAll('.chart-selector-btn');
    chartSelectorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const chartType = btn.dataset.chartType;
            
            // Update active state
            chartSelectorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update state and recreate chart
            state.portfolioComparisonChartType = chartType;
            createOverviewChart();
        });
    });
    
    // Toggle switches (removed from UI, keeping for backwards compatibility)
    const toggleCurrent = document.getElementById('toggle-current');
    const toggleNew = document.getElementById('toggle-new');
    
    if (toggleCurrent) {
        toggleCurrent.addEventListener('change', (e) => {
            if (state.charts.overview) {
                state.charts.overview.data.datasets[0].hidden = !e.target.checked;
                state.charts.overview.update();
            }
        });
    }
    
    if (toggleNew) {
        toggleNew.addEventListener('change', (e) => {
            if (state.charts.overview) {
                state.charts.overview.data.datasets[1].hidden = !e.target.checked;
                state.charts.overview.update();
            }
        });
    }
    
    // Drawdown portfolio selector
    const selectorButtons = document.querySelectorAll('.portfolio-selector .selector-btn');
    selectorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedDrawdownPortfolio = btn.dataset.portfolio;
            state.selectedDrawdownView = btn.dataset.view || 'percent';
            // Reset zoom when switching portfolios
            state.drawdownZoom = { isZoomed: false, minX: null, maxX: null };
            document.getElementById('reset-zoom-btn').classList.add('hidden');
            createDrawdownCharts();
        });
    });
    
    // Reset zoom button
    const resetZoomBtn = document.getElementById('reset-zoom-btn');
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', resetDrawdownZoom);
    }
    
    // Period selector
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedPeriod = btn.dataset.period;
            updatePeriodDisplay();
            updateCharts();
            
            // If on assets tab, update grid too
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
            if (activeTab === 'assets') {
                createAssetsGrid();
            }
        });
    });
    
    // Rebalancing selector buttons for allocation chart
    const rebalancingButtons = document.querySelectorAll('.rebalancing-selector .selector-btn');
    rebalancingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            rebalancingButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update state based on data attribute
            const shouldRebalance = btn.dataset.rebalancing === 'true';
            state.allocationRebalancing = shouldRebalance;
            
            console.log('Rebalancing changed to:', state.allocationRebalancing);
            
            // Update chart
            if (state.charts.allocation) {
                try {
                    state.charts.allocation.destroy();
                } catch(e) {}
                state.charts.allocation = null;
            }
            createAllocationChart();
        });
    });
    
    // Set initial active state
    const initialActiveBtn = state.allocationRebalancing 
        ? document.getElementById('rebalancing-btn-yes')
        : document.getElementById('rebalancing-btn-no');
    if (initialActiveBtn) {
        rebalancingButtons.forEach(b => b.classList.remove('active'));
        initialActiveBtn.classList.add('active');
    }
}

function updatePeriodDisplay() {
    // Update the period badge in header
    const periodBadge = document.getElementById('period-display');
    if (periodBadge) {
        const filteredData = getFilteredData();
        if (filteredData.length > 0) {
            const startYear = filteredData[0].date.getFullYear();
            const endYear = filteredData[filteredData.length - 1].date.getFullYear();
            const startMonth = filteredData[0].date.toLocaleDateString('no-NO', { month: 'short' });
            const endMonth = filteredData[filteredData.length - 1].date.toLocaleDateString('no-NO', { month: 'short' });
            
            if (state.selectedPeriod === 'ytd' || state.selectedPeriod === '12m') {
                // For short periods, show month and year
                periodBadge.textContent = `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
            } else if (startYear === endYear) {
                periodBadge.textContent = startYear.toString();
            } else {
                periodBadge.textContent = `${startYear} - ${endYear}`;
            }
        }
    }
}

function updateCharts() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    
    switch (activeTab) {
        case 'input':
            // Input tab - no chart needed
            break;
        case 'portfolio-comparison':
            createOverviewChart();
            break;
        case 'allocation':
            createAllocationChart();
            break;
        case 'comparison':
            createComparisonChart();
            updateMetrics();
            break;
        case 'drawdown':
            createDrawdownCharts();
            break;
        case 'nurse':
            createNurseChart();
            break;
        case 'assets':
            createAssetsGrid();
            break;
        case 'money':
            initializeMoneyValueCalculations();
            break;
    }
}

// ========================================
// Money Value Calculations (from Fremtidspenger)
// ========================================

// KPI data for historical calculations
const kpiData = {
    2001: 3.0,
    2002: 1.3,
    2003: 2.5,
    2004: 0.4,
    2005: 1.6,
    2006: 2.3,
    2007: 0.8,
    2008: 3.8,
    2009: 2.1,
    2010: 2.5,
    2011: 1.2,
    2012: 0.8,
    2013: 2.1,
    2014: 2.0,
    2015: 2.1,
    2016: 3.6,
    2017: 1.8,
    2018: 2.7,
    2019: 2.2,
    2020: 1.3,
    2021: 3.5,
    2022: 5.8,
    2023: 5.5,
    2024: 3.1,
    2025: 3.1
};

// Global variables for money value
let currentAmount = 700000;
let selectedHistoricalYear = 2025;
let selectedFutureYear = 2025;
let selectedKPI = 3;

// Initialize money value calculations
function initializeMoneyValueCalculations() {
    // Get DOM elements
    const amountSlider = document.getElementById('amount-slider');
    const amountDisplay = document.getElementById('amount-display');
    const presentAmount = document.getElementById('present-amount');
    const historicalYearSlider = document.getElementById('historical-year-slider');
    const historicalYearDisplay = document.getElementById('historical-year-display');
    const historicalAmount = document.getElementById('historical-amount');
    const futureYearSlider = document.getElementById('future-year-slider');
    const futureYearDisplay = document.getElementById('future-year-display');
    const futureAmount = document.getElementById('future-amount');

    if (!amountSlider || !historicalYearSlider || !futureYearSlider) {
        return; // Elements not found, skip initialization
    }

    // Initialize sliders
    initializeMoneySliders(amountSlider, amountDisplay, presentAmount, historicalYearSlider, historicalYearDisplay, historicalAmount, futureYearSlider, futureYearDisplay, futureAmount);
    
    // Initialize KPI buttons
    initializeKPIButtons();
    
    // Initialize modals
    initializeHistoricalKPIModal();
    initializeDisclaimerModal();
    
    // Update all calculations
    updateAllMoneyCalculations(historicalAmount, futureAmount, presentAmount, amountDisplay);
}

// Initialize sliders for money value
function initializeMoneySliders(amountSlider, amountDisplay, presentAmount, historicalYearSlider, historicalYearDisplay, historicalAmount, futureYearSlider, futureYearDisplay, futureAmount) {
    if (amountSlider) {
        const min = parseInt(amountSlider.min);
        const max = parseInt(amountSlider.max);
        updateSliderProgress(amountSlider, min, max);
        
        amountSlider.addEventListener('input', function() {
            currentAmount = parseInt(this.value);
            updateAmountDisplay(amountDisplay, presentAmount);
            updateAllMoneyCalculations(historicalAmount, futureAmount, presentAmount, amountDisplay);
            updateSliderProgress(this, min, max);
        });
    }

    if (historicalYearSlider) {
        const min = parseInt(historicalYearSlider.min);
        const max = parseInt(historicalYearSlider.max);
        updateSliderProgress(historicalYearSlider, min, max);
        
        historicalYearSlider.addEventListener('input', function() {
            selectedHistoricalYear = parseInt(this.value);
            updateHistoricalYearDisplay(historicalYearDisplay);
            updateAllMoneyCalculations(historicalAmount, futureAmount, presentAmount, amountDisplay);
            updateSliderProgress(this, min, max);
        });
    }

    if (futureYearSlider) {
        const min = parseInt(futureYearSlider.min);
        const max = parseInt(futureYearSlider.max);
        updateSliderProgress(futureYearSlider, min, max);
        
        futureYearSlider.addEventListener('input', function() {
            selectedFutureYear = parseInt(this.value);
            updateFutureYearDisplay(futureYearDisplay);
            updateAllMoneyCalculations(historicalAmount, futureAmount, presentAmount, amountDisplay);
            updateSliderProgress(this, min, max);
        });
    }
}

// Update slider progress fill
function updateSliderProgress(slider, min, max) {
    const value = parseInt(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    const root = getComputedStyle(document.documentElement);
    const primaryColor = root.getPropertyValue('--primary').trim();
    const borderColor = root.getPropertyValue('--border').trim();
    slider.style.background = `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${percentage}%, ${borderColor} ${percentage}%, ${borderColor} 100%)`;
}

// Initialize KPI buttons
function initializeKPIButtons() {
    const kpiButtons = document.querySelectorAll('.kpi-btn');
    
    kpiButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            kpiButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update selected KPI
            selectedKPI = parseFloat(this.dataset.kpi);
            
            // Update calculations
            const historicalAmount = document.getElementById('historical-amount');
            const futureAmount = document.getElementById('future-amount');
            const presentAmount = document.getElementById('present-amount');
            const amountDisplay = document.getElementById('amount-display');
            updateAllMoneyCalculations(historicalAmount, futureAmount, presentAmount, amountDisplay);
        });
    });

    // Set default active button (3%)
    const defaultButton = document.querySelector('[data-kpi="3"]');
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
}

// Update amount display
function updateAmountDisplay(amountDisplay, presentAmount) {
    const formattedAmount = formatMoneyNumber(currentAmount);
    if (amountDisplay) amountDisplay.textContent = '2025';
    if (presentAmount) presentAmount.textContent = formattedAmount + ',-';
}

// Update historical year display
function updateHistoricalYearDisplay(historicalYearDisplay) {
    if (historicalYearDisplay) historicalYearDisplay.textContent = selectedHistoricalYear;
}

// Update future year display
function updateFutureYearDisplay(futureYearDisplay) {
    if (futureYearDisplay) futureYearDisplay.textContent = selectedFutureYear;
}

// Calculate historical value (inflation adjustment)
function calculateHistoricalValue() {
    const referenceYear = 2025;
    
    if (selectedHistoricalYear === referenceYear) {
        return currentAmount;
    }

    let cumulativeInflation = 1;
    
    // Calculate cumulative inflation from historical year to 2025
    for (let year = selectedHistoricalYear; year < referenceYear; year++) {
        if (kpiData[year]) {
            cumulativeInflation *= (1 + kpiData[year] / 100);
        }
    }
    
    // Adjust current amount back to historical year
    return Math.round(currentAmount / cumulativeInflation);
}

// Calculate future value (discounting)
function calculateFutureValue() {
    const referenceYear = 2025;
    
    if (selectedFutureYear === referenceYear) {
        return currentAmount;
    }

    const yearsDifference = selectedFutureYear - referenceYear;
    const discountFactor = Math.pow(1 + selectedKPI / 100, yearsDifference);
    
    return Math.round(currentAmount * discountFactor);
}

// Update all calculations
function updateAllMoneyCalculations(historicalAmount, futureAmount, presentAmount, amountDisplay) {
    // Update historical value
    const historicalValue = calculateHistoricalValue();
    if (historicalAmount) historicalAmount.textContent = formatMoneyNumber(historicalValue) + ',-';
    
    // Update future value
    const futureValue = calculateFutureValue();
    if (futureAmount) futureAmount.textContent = formatMoneyNumber(futureValue) + ',-';
    
    // Update present amount
    updateAmountDisplay(amountDisplay, presentAmount);
}

// Format number with spaces as thousand separators
function formatMoneyNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Initialize Historical KPI Modal
let historicalKPIModalInitialized = false;
function initializeHistoricalKPIModal() {
    // Prevent duplicate initialization
    if (historicalKPIModalInitialized) {
        return;
    }
    
    const modal = document.getElementById('historical-kpi-modal');
    const openBtn = document.getElementById('historical-kpi-btn');
    const closeBtn = document.getElementById('close-modal');
    const tableBody = document.getElementById('kpi-table-body');

    if (!modal || !openBtn || !closeBtn || !tableBody) {
        return; // Elements not found
    }
    
    // Populate the table with KPI data (clear first to avoid duplicates)
    tableBody.innerHTML = '';
    populateKPITable(tableBody);

    // Open modal
    openBtn.addEventListener('click', function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    historicalKPIModalInitialized = true;
}

// Populate KPI table with data
function populateKPITable(tableBody) {
    // Sort KPI data by year
    const sortedKPIData = Object.entries(kpiData).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    
    sortedKPIData.forEach(([year, kpi]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>${kpi}%</td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize Disclaimer Modal
let disclaimerModalInitialized = false;
function initializeDisclaimerModal() {
    // Prevent duplicate initialization
    if (disclaimerModalInitialized) {
        return;
    }
    
    const modal = document.getElementById('disclaimer-modal');
    const openBtn = document.getElementById('disclaimer-btn');
    const closeBtn = document.getElementById('close-disclaimer-modal');

    if (!modal || !openBtn || !closeBtn) {
        return; // Elements not found
    }

    // Open modal
    openBtn.addEventListener('click', function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    disclaimerModalInitialized = true;
}

// ========================================
// Year by Year Modal
// ========================================
let yearByYearModalInitialized = false;
function initializeYearByYearModal() {
    if (yearByYearModalInitialized) {
        return;
    }
    
    const modal = document.getElementById('year-by-year-modal');
    const openBtn = document.getElementById('year-by-year-btn');
    const closeBtn = document.getElementById('close-year-by-year-modal');
    const fullscreenBtn = document.getElementById('year-by-year-fullscreen-btn');
    const tableBody = document.getElementById('year-by-year-table-body');
    const modalContent = modal?.querySelector('.modal-content');
    
    if (!modal || !openBtn || !closeBtn || !tableBody || !modalContent) {
        return;
    }
    
    // Open modal
    openBtn.addEventListener('click', function() {
        populateYearByYearTable(tableBody);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        modalContent.classList.remove('fullscreen');
        document.body.style.overflow = '';
    });
    
    // Fullscreen toggle
    fullscreenBtn.addEventListener('click', function() {
        modalContent.classList.toggle('fullscreen');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            modalContent.classList.remove('fullscreen');
            document.body.style.overflow = '';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            modalContent.classList.remove('fullscreen');
            document.body.style.overflow = '';
        }
    });
    
    yearByYearModalInitialized = true;
}

// Calculate yearly return and cumulative return for a portfolio
function calculateYearlyPortfolioMetrics(year, portfolio) {
    // Get all data for the year
    const yearData = state.data.filter(row => {
        const rowYear = row.date.getFullYear();
        return rowYear === year;
    });
    
    if (yearData.length < 2) {
        return { return: null, cumulativeReturn: null };
    }
    
    // Calculate portfolio values for each data point in the year
    const portfolioValues = calculatePortfolioValue(yearData, portfolio, state.startCapital);
    
    // Calculate yearly return (from first to last value of the year)
    const startValue = portfolioValues[0].value;
    const endValue = portfolioValues[portfolioValues.length - 1].value;
    const yearlyReturn = ((endValue - startValue) / startValue) * 100;
    
    // Calculate cumulative return from 2001 to this year
    // Get data from 2001 to the end of this year
    const dataFromStart = state.data.filter(row => {
        const rowYear = row.date.getFullYear();
        return rowYear >= 2001 && rowYear <= year;
    });
    
    let cumulativeReturn = null;
    if (dataFromStart.length >= 2) {
        const allPortfolioValues = calculatePortfolioValue(dataFromStart, portfolio, state.startCapital);
        const firstValue = allPortfolioValues[0].value;
        const lastValue = allPortfolioValues[allPortfolioValues.length - 1].value;
        cumulativeReturn = ((lastValue - firstValue) / firstValue) * 100;
    }
    
    return { return: yearlyReturn, cumulativeReturn: cumulativeReturn };
}

// Populate year by year table
function populateYearByYearTable(tableBody) {
    tableBody.innerHTML = '';
    
    // Generate years from 2001 to 2025
    const years = [];
    for (let year = 2001; year <= 2025; year++) {
        years.push(year);
    }
    
    years.forEach(year => {
        const currentMetrics = calculateYearlyPortfolioMetrics(year, state.currentPortfolio);
        const newMetrics = calculateYearlyPortfolioMetrics(year, state.newPortfolio);
        
        const row = document.createElement('tr');
        
        // Check if either portfolio has negative return
        const hasNegativeReturn = (currentMetrics.return !== null && currentMetrics.return < 0) ||
                                 (newMetrics.return !== null && newMetrics.return < 0);
        
        if (hasNegativeReturn) {
            row.classList.add('negative-year-row');
        }
        
        const yearCell = document.createElement('td');
        yearCell.textContent = year;
        
        const currentReturnCell = document.createElement('td');
        currentReturnCell.textContent = currentMetrics.return !== null 
            ? formatPercent(currentMetrics.return) 
            : '-';
        
        const currentCumulativeCell = document.createElement('td');
        currentCumulativeCell.textContent = currentMetrics.cumulativeReturn !== null 
            ? formatPercent(currentMetrics.cumulativeReturn) 
            : '-';
        
        const newReturnCell = document.createElement('td');
        newReturnCell.textContent = newMetrics.return !== null 
            ? formatPercent(newMetrics.return) 
            : '-';
        
        const newCumulativeCell = document.createElement('td');
        newCumulativeCell.textContent = newMetrics.cumulativeReturn !== null 
            ? formatPercent(newMetrics.cumulativeReturn) 
            : '-';
        
        row.appendChild(yearCell);
        row.appendChild(currentReturnCell);
        row.appendChild(currentCumulativeCell);
        row.appendChild(newReturnCell);
        row.appendChild(newCumulativeCell);
        
        tableBody.appendChild(row);
    });
}

// ========================================
// Initialization
// ========================================
async function init() {
    // Try to fetch the new CSV file (historiske kurser2.csv)
    try {
        const response = await fetch('historiske kurser2.csv');
        if (response.ok) {
            const csv = await response.text();
            state.data = parseCSV(csv);
            console.log('Loaded data from historiske kurser2.csv');
        } else {
            throw new Error('Could not load CSV');
        }
    } catch (error) {
        console.log('Could not load historiske kurser2.csv, using embedded CSV data');
        state.data = parseCSV(csvData);
    }
    
    // Setup UI
    updateSliderUI('current');
    updateSliderUI('new');
    
    // Initialize treemap charts
    updateTreemapChart('current');
    updateTreemapChart('new');
    
    // Setup navigation and events
    setupTabNavigation();
    setupEventListeners();
    
    // Initialize modals (should work from start, not just when money tab is opened)
    initializeHistoricalKPIModal();
    initializeDisclaimerModal();
    initializeYearByYearModal();
    
    // Initialize first chart
    createOverviewChart();
    
    console.log('Portfolio Insight Dashboard initialized');
    console.log(`Loaded ${state.data.length} data points from ${state.data[0].date.getFullYear()} to ${state.data[state.data.length - 1].date.getFullYear()}`);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
