import Papa from 'papaparse';

export async function loadCsvData() {
  try {
    const response = await fetch('/data/mainData.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch the CSV file: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    const records = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    }).data;

    const result = {};

    records.forEach((row) => {
      const nrCellId = row.nr_cell_id;
      const ueId = row.gnb_du_ue_f1ap_id;

      if (!nrCellId || !ueId) {
        return;
      }

      if (!result[nrCellId]) {
        result[nrCellId] = {};
      }

      if (!result[nrCellId][ueId]) {
        result[nrCellId][ueId] = {
          metadata: {},
          mobiflow: {},
          events: [],
        };
      }

      result[nrCellId][ueId].events.push(row);
    });

    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}