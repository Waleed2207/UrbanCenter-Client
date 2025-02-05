import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import TableToolbar from './tableToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import DeleteDialog from './DeleteDialog';
import UpdateDialog from './UpdateDialog';

const DataTable = ({ data, handleDelete, handleUpdate, selectedReport, handleUpdateSubmit, columns, reloadHandler, handleImageClick, loading }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  // Get selected row details
  const selectedRow = rowSelectionModel.length === 1 ? data.find((report) => report.id === rowSelectionModel[0]) : null;
  const selectedRowStatus = selectedRow ? selectedRow.status : null;

  const handleSelectionChange = (newSelection) => {
    const validSelection = newSelection.filter((id) => {
      const selectedRow = data.find((report) => report.id === id);
      return selectedRow && selectedRow.Status !== "resolved"; // ✅ Prevent selecting resolved reports
    });
    setRowSelectionModel(validSelection);
  };

  const handleClickDelete = () => {
    setOpenDeleteDialog(true);
  };

  const handleClickUpdate = () => {
    if (rowSelectionModel.length === 1) {
      if (selectedRowStatus === "resolved") return; // ✅ Prevent opening update dialog for resolved reports

      handleUpdate(selectedRow);
      setOpenUpdateDialog(true);
    }
  };

  const handleCloseDialogs = () => {
    setOpenDeleteDialog(false);
    setOpenUpdateDialog(false);
  };

  const modifiedColumns = columns.map((col) =>
    col.field === "image_url"
      ? {
          ...col,
          renderCell: (params) =>
            params.value ? (
              <img
                src={params.value}
                alt="Report"
                style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                onClick={() => handleImageClick(params.value)}
              />
            ) : (
              "No Image"
            ),
        }
      : col
  );

  return (
    <Box>
      <DataGrid
        autoHeight
        columns={modifiedColumns}
        rows={data || []}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 10 } },
        }}
        checkboxSelection
        disableSelectionOnClick
        getRowId={(row) => row.id}
        isRowSelectable={(params) => params.row.Status !== "resolved"} // ✅ Hide checkbox for resolved reports
        pageSizeOptions={[10, 25, 50, 100]}
        slots={{
          noResultsOverlay: NoRowsOverlay,
          noRowsOverlay: NoRowsOverlay,
          toolbar: handleDelete || handleUpdate ? TableToolbar : undefined,
        }}
        slotProps={{
          toolbar: handleDelete || handleUpdate
            ? {
                selectedRowCount: rowSelectionModel.length,
                onDeleteSelected: handleClickDelete,
                onUpdateSelected: handleClickUpdate,
                reloadHandler: reloadHandler,
                loading,
                selectedRowStatus, // ✅ Pass selected row's status
              }
            : undefined,
        }}
        sx={{ "--DataGrid-overlayHeight": "300px" }}
        onRowSelectionModelChange={handleSelectionChange}
        rowSelectionModel={rowSelectionModel}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={openDeleteDialog}
        handleClose={handleCloseDialogs}
        handleDelete={handleDelete}
        rowSelectionModel={rowSelectionModel}
      />

      {/* Update Dialog */}
      {openUpdateDialog && selectedReport && selectedReport.Status !== "resolved" && (
        <UpdateDialog
          open={openUpdateDialog}
          handleClose={handleCloseDialogs}
          handleUpdate={handleUpdateSubmit}
          selectedReport={selectedReport}
        />
      )}
    </Box>
  );
};

export default DataTable;
