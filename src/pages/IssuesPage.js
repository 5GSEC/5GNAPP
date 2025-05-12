import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Paper,
  Typography,
  TablePagination,
} from "@mui/material";
import { Warning, Error, Info } from "@mui/icons-material"; // Icons for severity levels
import { styled } from "@mui/system";

// Mock data for detected events
const mockData = [
  { id: 1, source: "MobieXpert", type: "Threat", description: "Malware detected", severity: "High" },
  { id: 2, source: "MobiWatch", type: "Anomaly", description: "Unusual login pattern", severity: "Medium" },
  { id: 3, source: "MobieXpert", type: "Threat", description: "Phishing attempt", severity: "Critical" },
  { id: 4, source: "MobiWatch", type: "Anomaly", description: "Data exfiltration", severity: "High" },
  { id: 5, source: "MobieXpert", type: "Threat", description: "Ransomware detected", severity: "Critical" },
  { id: 6, source: "MobiWatch", type: "Anomaly", description: "Suspicious activity", severity: "Medium" },
  // Add more mock data as needed
];

// Styled components for better UI
const StyledTableRow = styled(TableRow)(({ severity }) => ({
  "&:hover": {
    backgroundColor: "#E0E0E0", // Light gray on hover
  },
}));

const SeverityIcon = ({ severity }) => {
  switch (severity) {
    case "Critical":
      return <Error color="error" />;
    case "High":
      return <Warning color="warning" />;
    case "Medium":
      return <Info color="info" />;
    default:
      return null;
  }
};

function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

  // Handle sorting
  const handleSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === "asc";
    setSortConfig({ key, direction: isAsc ? "desc" : "asc" });
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // Sort and filter data
  const filteredData = mockData
    .filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  // Paginate data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Issues Page
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Security Threats and Anomalies Detected
      </Typography>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table sx={{ borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <TableHead>
            <TableRow>
                <TableCell
                sx={{
                    borderRight: "1px solid #ddd",
                    fontWeight: "bold", // Make header text bold
                    padding: "8px", // Adjust padding for reduced height
                }}
                >
                <TableSortLabel
                    active={sortConfig.key === "id"}
                    direction={sortConfig.key === "id" ? sortConfig.direction : "asc"}
                    onClick={() => handleSort("id")}
                >
                    ID
                </TableSortLabel>
                </TableCell>
                <TableCell
                sx={{
                    borderRight: "1px solid #ddd",
                    fontWeight: "bold", // Make header text bold
                    padding: "8px", // Adjust padding for reduced height
                }}
                >
                <TableSortLabel
                    active={sortConfig.key === "source"}
                    direction={sortConfig.key === "source" ? sortConfig.direction : "asc"}
                    onClick={() => handleSort("source")}
                >
                    Source
                </TableSortLabel>
                </TableCell>
                <TableCell
                sx={{
                    borderRight: "1px solid #ddd",
                    fontWeight: "bold", // Make header text bold
                    padding: "8px", // Adjust padding for reduced height
                }}
                >
                <TableSortLabel
                    active={sortConfig.key === "type"}
                    direction={sortConfig.key === "type" ? sortConfig.direction : "asc"}
                    onClick={() => handleSort("type")}
                >
                    Type
                </TableSortLabel>
                </TableCell>
                <TableCell
                sx={{
                    borderRight: "1px solid #ddd",
                    fontWeight: "bold", // Make header text bold
                    padding: "8px", // Adjust padding for reduced height
                }}
                >
                Description
                </TableCell>
                <TableCell
                sx={{
                    fontWeight: "bold", // Make header text bold
                    padding: "8px", // Adjust padding for reduced height
                }}
                >
                Severity
                </TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {paginatedData.map((row) => (
                <StyledTableRow
                key={row.id}
                severity={row.severity}
                sx={{
                    height: "40px", // Reduce row height
                }}
                >
                <TableCell sx={{ borderRight: "1px solid #ddd", padding: "8px" }}>{row.id}</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ddd", padding: "8px" }}>{row.source}</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ddd", padding: "8px" }}>{row.type}</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ddd", padding: "8px" }}>{row.description}</TableCell>
                <TableCell sx={{ padding: "8px" }}>
                    <SeverityIcon severity={row.severity} /> {row.severity}
                </TableCell>
                </StyledTableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}

export default IssuesPage;