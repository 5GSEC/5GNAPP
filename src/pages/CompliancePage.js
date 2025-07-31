import React, { useState, useEffect } from "react";
import { Typography, Grid, Card, CardContent } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getComplianceData } from "../backend/fetchUserData";
import CheckIcon from '@mui/icons-material/Check';

function CompliancePage() {
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
                      <CheckIcon style={{ color: "green", fontSize: "1.3em", marginRight: 8 }} aria-label="checkmark" role="img" />
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
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Compliance
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            SE-RAN ensures the 3GPP & NIST security requirements and compliance for RAN and UEs.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <div
                style={{
                  height: 700,
                  width: "100%",
                  background: "#f3f6fa",
                  borderRadius: 8,
                  border: "1px solid #e0e4ef",
                  boxShadow: "0 2px 8px rgba(35,48,90,0.04)",
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
                    bgcolor: "#f3f6fa",
                    border: "none",
                    color: "#11182E",
                    fontSize: 15,
                    '& .MuiDataGrid-columnHeaders': {
                      background: 'linear-gradient(90deg, #11182E 60%, #2d3c6b 100%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    },
                    '& .MuiDataGrid-row': {
                      bgcolor: "#fff",
                      '&.even': { bgcolor: "#f8fafd" },
                      '&:hover': { bgcolor: "#e0e4ef" },
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #e0e4ef',
                    },
                    '& .MuiCheckbox-root': {
                      color: '#11182E !important',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      background: '#f3f6fa',
                      borderTop: '1px solid #e0e4ef',
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