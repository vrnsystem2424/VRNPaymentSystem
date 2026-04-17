const express = require('express');
const { sheets, QualifideLeadsSheetId } = require('../../config/googleSheet');

const router = express.Router();

// ───────────────────────────────────────────────
// DATE PARSER
// ───────────────────────────────────────────────
function parseIndianDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return null;
  const cleaned = dateStr.trim().replace(/\s+/g, ' ');

  const match = cleaned.match(
    /(\d{1,2})[/-]?(\d{1,2})[/-]?(\d{2,4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/
  );
  if (!match) return null;

  let [_, d, m, y, time] = match;
  d = parseInt(d, 10);
  m = parseInt(m, 10);
  y = parseInt(y, 10);
  if (y < 100) y += 2000;

  let hours = 0, minutes = 0;
  if (time) {
    const [h, min] = time.split(':').map(Number);
    hours = h || 0;
    minutes = min || 0;
  }

  const date = new Date(y, m - 1, d, hours, minutes);
  return isNaN(date.getTime()) ? null : date;
}

// ───────────────────────────────────────────────
// SUMMARY ROUTE
// ───────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {

    // Sheet metadata fetch karo - exact tab title match karne ke liye
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: QualifideLeadsSheetId,
    });

    const allSheets = meta.data.sheets.map(s => s.properties.title);
    console.log('Available sheets:', allSheets);

    // Exact match - trim + uppercase
    const targetSheet = allSheets.find(
      name => name.trim().toUpperCase() === 'FMS' || name.trim().toUpperCase() === 'END_USER_FMS'
    );

    if (!targetSheet) {
      return res.status(404).json({
        success: false,
        error: `Sheet tab 'END_USER_FMS' not found.`,
        availableSheets: allSheets,
      });
    }

    // Single quotes wrap karo - Google Sheets API requirement
    const RANGE = `'${targetSheet}'!A:S`;
    console.log('Using range:', RANGE);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: QualifideLeadsSheetId,
      range: RANGE,
      valueRenderOption: 'FORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    const rows = response.data.values || [];

    if (rows.length < 2) {
      return res.json({
        success: true,
        totalLeads: 0,
        summary: {},
        chartData: {},
      });
    }

    const data = rows.slice(1);

    const summary = {
      totalLeads: data.length,
      leadSources: {},
      projectTypes: {},
      siteVisitStatus: {},
      afterVisitStatus: {},
      dealStatus: {},
      negotiationFailed: 0,
      doneDeals: 0,
      lowBudget: 0,
      notInterested: 0,
      nextFollowUp: 0,
    };

    const statusTimeline = {};
    const leadsByMonth = {};

    data.forEach(row => {
      const [
        timestamp = '', uniqueId = '', custName = '', custContact = '', interestedIn = '',
        projectSelection = '', leadSource = '',
        plannedSite = '', actualSite = '', siteStatus = '',
        plannedVisit = '', actualVisit = '', visitStatus = '',
        plannedAfter = '', actualAfter = '', afterStatus = '',
        plannedDeal = '', actualDeal = '', dealStatusRaw = ''
      ] = row;

      const leadSrc   = (leadSource || 'Unknown').trim();
      const project   = (projectSelection || 'Unknown').trim();
      const siteSt    = (siteStatus || '').trim().toLowerCase();
      const visitSt   = (visitStatus || '').trim().toLowerCase();
      const afterSt   = (afterStatus || '').trim().toLowerCase();
      const dealStRaw = (dealStatusRaw || '').trim();

      summary.leadSources[leadSrc] = (summary.leadSources[leadSrc] || 0) + 1;
      summary.projectTypes[project] = (summary.projectTypes[project] || 0) + 1;
      summary.siteVisitStatus[siteSt] = (summary.siteVisitStatus[siteSt] || 0) + 1;
      summary.afterVisitStatus[afterSt] = (summary.afterVisitStatus[afterSt] || 0) + 1;

      let dealStatus = dealStRaw;
      if (dealStatus.includes('Negotiation') || dealStatus.includes('Failed')) {
        summary.negotiationFailed++;
        dealStatus = 'Negotiation Failed';
      } else if (dealStatus.toLowerCase().includes('done')) {
        summary.doneDeals++;
        dealStatus = 'Done';
      } else if (dealStatus.includes('Low Budget')) {
        summary.lowBudget++;
      } else if (dealStatus.includes('Not Interested')) {
        summary.notInterested++;
      } else if (
        dealStatus.includes('Next Follow Up') ||
        dealStatus.includes('No conversation')
      ) {
        summary.nextFollowUp++;
      }

      summary.dealStatus[dealStatus] = (summary.dealStatus[dealStatus] || 0) + 1;

      const siteDate = parseIndianDate(actualSite || plannedSite);
      if (siteDate) {
        const monthKey = siteDate.toISOString().slice(0, 7);
        leadsByMonth[monthKey] = (leadsByMonth[monthKey] || 0) + 1;

        if (!statusTimeline[monthKey]) {
          statusTimeline[monthKey] = { leads: 0, siteVisitsDone: 0, dealsDone: 0 };
        }
        statusTimeline[monthKey].leads++;
        if (visitSt === 'done') statusTimeline[monthKey].siteVisitsDone++;
        if (dealStatus === 'Done') statusTimeline[monthKey].dealsDone++;
      }
    });

    const chartData = {
      leadSources: Object.entries(summary.leadSources)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),

      projects: Object.entries(summary.projectTypes)
        .map(([name, value]) => ({ name, value })),

      funnel: [
        { stage: 'Total Leads',      count: summary.totalLeads },
        { stage: 'Site Visit Done',  count: summary.siteVisitStatus['done'] || 0 },
        { stage: 'After Visit Done', count: summary.afterVisitStatus['done'] || 0 },
        { stage: 'Deal Done',        count: summary.doneDeals },
      ],

      dealStatuses: Object.entries(summary.dealStatus)
        .map(([name, value]) => ({ name, value })),

      monthlyTrend: Object.keys(leadsByMonth)
        .sort()
        .map(month => ({
          month,
          leads: leadsByMonth[month],
          siteVisits: statusTimeline[month]?.siteVisitsDone || 0,
          deals: statusTimeline[month]?.dealsDone || 0,
        })),
    };

    res.json({
      success: true,
      totalLeads: summary.totalLeads,
      sheetUsed: targetSheet,
      summary: {
        doneDeals:         summary.doneDeals,
        negotiationFailed: summary.negotiationFailed,
        lowBudget:         summary.lowBudget,
        notInterested:     summary.notInterested,
        nextFollowUp:      summary.nextFollowUp,
      },
      chartData,
      rawCount: data.length,
    });

  } catch (error) {
    console.error('Google Sheets API error in /summary:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch summary data from sheet',
    });
  }
});

module.exports = router;