import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getComplianceData } from "../backend/fetchUserData";
import CheckIcon from '@mui/icons-material/Check';
import PageHeader from "../components/PageHeader";

function CompliancePage() {
  const theme = useTheme();
  const c = theme.custom;
  const isDarkMode = theme.palette.mode === "dark";
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        const response = await getComplianceData();
        const lines = response.data;
        
        if (lines.length > 0) {
          // The first row is the header array
          const headers = lines[0].map(header => header.trim());

          // Custom column widths: assume first column is "Category"
          const columnDefs = headers.map((header, index) => {
            // If the header is "Category" (case-insensitive) or first column, make it narrower
            const isCategory = header.toLowerCase() === "category" || index === 0;
            const isSeRanSolutions = header.trim().toLowerCase() === "se-ran solutions";
            return {
              field: `col${index}`,
              headerName: header,
              flex: isCategory ? 1 : 2,
              // minWidth: isCategory ? 100 : 200,
              // maxWidth: isCategory ? 200 : undefined,
              renderCell: (params) => {
                if (isSeRanSolutions) {
                  // Add a big green checkmark before the text
                  return (
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.7',
                        padding: '16px 0',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 500,
                      }}
                      title={params.value || ''}
                    >
                      <CheckIcon color="success" style={{ fontSize: "1.3em", marginRight: 8 }} aria-label="checkmark" role="img" />
                      {params.value}
                    </div>
                  );
                }
                return (
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.7',
                      padding: '16px 0',
                      // Remove cursor style to avoid changing cursor on hover
                    }}
                    title={params.value || ''}
                  >
                    {params.value}
                  </div>
                );
              },
            };
          });

          // Parse data rows (each row is an array of values)
          const dataRows = lines.slice(1).map((rowArr, rowIndex) => {
            const row = { id: rowIndex };
            headers.forEach((header, index) => {
              row[`col${index}`] = (rowArr[index] || '').trim();
            });
            return row;
          });

          setColumns(columnDefs);
          setRows(dataRows);
        }
      } catch (error) {
        console.error('Error loading compliance data:', error);
      }
    };

    loadComplianceData();
  }, []);

  return (
    <>
      <Grid container spacing={3} sx={{ padding: "20px" }}>
        <Grid item size={12}>
          <PageHeader
            title="Compliance"
            subtitle="SE-RAN ensures the 3GPP & NIST security requirements and compliance for RAN and UEs."
          />
        </Grid>
        <Grid item size={12}>
          <Card sx={{ backgroundColor: c.bgPanel, border: isDarkMode ? `1px solid ${c.border}` : "1px solid transparent", boxShadow: isDarkMode ? c.panelShadow : undefined }}>
            <CardContent>
              <div
                style={{
                  height: 700,
                  width: "100%",
                  background: c.bgSurface,
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  boxShadow: isDarkMode ? "0 2px 10px rgba(0,0,0,0.26)" : "0 2px 8px rgba(35,48,90,0.04)",
                }}
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  // checkboxSelection
                  getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                  }
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableColumnResize
                  density="compact"
                  sx={{
                    bgcolor: c.bgSurface,
                    border: "none",
                    color: c.textPrimary,
                    fontSize: 15,
                    '& .MuiDataGrid-columnHeaders': {
                      background: c.headerGradient,
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    },
                    '& .MuiDataGrid-row': {
                      bgcolor: c.bgElevated,
                      color: c.textPrimary,
                      '&.even': { bgcolor: c.bgAlt },
                      '&:hover': { bgcolor: c.rowHover },
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: `1px solid ${c.border}`,
                      color: c.textPrimary,
                    },
                    '& .MuiCheckbox-root': {
                      color: `${c.accentStrong} !important`,
                    },
                    '& .MuiDataGrid-footerContainer': {
                      background: c.bgSurface,
                      borderTop: `1px solid ${c.border}`,
                      color: c.textPrimary,
                    },
                    '& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      color: c.textPrimary,
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default CompliancePage; 