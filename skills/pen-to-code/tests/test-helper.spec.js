const { test } = require('@playwright/test');
const { getComponentCoordinates } = require('../scripts/utils/get-coordinates-helper');
const fs = require('fs');
const path = require('path');

test('extract coordinates from complex layout page', async ({ page }) => {
  // 1. Navigate to test page
  const testPagePath = path.join(__dirname, 'test-page.html');
  await page.goto(`file://${testPagePath}`);

  // 2. Get component coordinates for different regions
  const selectors = {
    // Header region
    header: '.header',
    logo: '#logo',
    appName: '#app-name',
    homeBtn: '#home-btn',
    projectsBtn: '#projects-btn',
    tasksBtn: '#tasks-btn',
    notificationsBtn: '#notifications-btn',
    settingsBtn: '#settings-btn',
    profileBtn: '#profile-btn',

    // Toolbar region
    toolbar: '.toolbar',
    newBtn: '#new-btn',
    editBtn: '#edit-btn',
    deleteBtn: '#delete-btn',
    filterBtn: '#filter-btn',
    sortBtn: '#sort-btn',
    exportBtn: '#export-btn',

    // Content region
    content: '.content',
    sidebar: '.sidebar',
    mainContent: '.main-content',

    // Sidebar navigation
    navDashboard: '#nav-dashboard',
    navAnalytics: '#nav-analytics',
    navReports: '#nav-reports',
    navSettings: '#nav-settings',

    // Main content buttons
    refreshBtn: '#refresh-btn',
    downloadBtn: '#download-btn',
    shareBtn: '#share-btn',

    // Table headers
    colId: '#col-id',
    colName: '#col-name',
    colStatus: '#col-status',
    colDate: '#col-date',
    colActions: '#col-actions',

    // Footer region
    footer: '.footer',
    copyright: '#copyright',
    privacyBtn: '#privacy-btn',
    termsBtn: '#terms-btn',
    helpBtn: '#help-btn',
    contactBtn: '#contact-btn',
    aboutBtn: '#about-btn'
  };

  const coordinates = await getComponentCoordinates(page, selectors);

  console.log('\n=== Extracted Coordinates ===');
  console.log(JSON.stringify(coordinates, null, 2));

  // 3. Save to file for alignment verification
  const config = {
    components: coordinates,
    expectedAlignments: {
      rows: [
        // Header buttons (left group)
        ['homeBtn', 'projectsBtn', 'tasksBtn'],
        // Header buttons (right group)
        ['notificationsBtn', 'settingsBtn', 'profileBtn'],
        // Toolbar buttons (left group)
        ['newBtn', 'editBtn', 'deleteBtn'],
        // Toolbar buttons (right group)
        ['filterBtn', 'sortBtn', 'exportBtn'],
        // Main content action buttons
        ['refreshBtn', 'downloadBtn', 'shareBtn'],
        // Table headers
        ['colId', 'colName', 'colStatus', 'colDate', 'colActions'],
        // Footer buttons (left group)
        ['privacyBtn', 'termsBtn'],
        // Footer buttons (right group)
        ['helpBtn', 'contactBtn', 'aboutBtn']
      ],
      columns: [
        // Main layout regions (vertical stack)
        ['header', 'toolbar', 'content', 'footer'],
        // Sidebar navigation items
        ['navDashboard', 'navAnalytics', 'navReports', 'navSettings']
      ]
    }
  };

  const outputPath = path.join(__dirname, 'test-extracted-coordinates.json');
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
  console.log(`\nSaved alignment check data to: ${outputPath}`);

  // 4. Run alignment verification script
  const { execSync } = require('child_process');
  console.log('\n=== Running Alignment Verification ===\n');
  try {
    const scriptPath = path.join(__dirname, '../scripts/check-alignment-with-playwright.js');
    const result = execSync(`node ${scriptPath} ${outputPath}`, {
      encoding: 'utf8'
    });
    console.log(result);
  } catch (error) {
    console.log(error.stdout);
    if (error.status !== 0) {
      console.log(`\nVerification completed with ${error.status === 1 ? 'some failures' : 'errors'}`);
    }
  }
});
