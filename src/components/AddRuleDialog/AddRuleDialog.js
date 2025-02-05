import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';

const protocolOptions = ['TCP', 'ICMP', 'ARP'];
const stateOptionsMap = {
  'TCP': ['SYN_SENT', 'SYN_RECEIVED', 'ESTABLISHED', 'FIN_WAIT', 'CLOSED', 'any'],
  'ICMP': ['ICMP echo', 'ICMP reply wait', 'any'],
  'ARP': ['ARP request', 'ARP reply', 'any'],
};
const actionOptions = ['allow', 'deny'];
const logActionOptions = ['true', 'false'];

const AddRuleDialog = ({ open, onClose, onChange, onSubmit, newRule }) => {
  const [stateOptions, setStateOptions] = useState(stateOptionsMap[newRule.protocol] || []);
  const [rateLimitError, setRateLimitError] = useState('');

  useEffect(() => {
    setStateOptions(stateOptionsMap[newRule.protocol] || []);
  }, [newRule.protocol]);

  const handleRateLimitChange = (event) => {
    const { name, value } = event.target;
    if (name === 'rate_limit') {
      if (value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0)) {
        setRateLimitError('');
      } else {
        setRateLimitError('Rate limit must be an integer greater than or equal to 0.');
      }
    }
    onChange(event);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Rule</DialogTitle>
      <DialogContent>
        <DialogContentText>Please fill in the details of the new rule.</DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              autoFocus
              margin="dense"
              name="source_ip"
              label="Source IP"
              type="text"
              fullWidth
              variant="standard"
              value={newRule.source_ip}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              name="destination_ip"
              label="Destination IP"
              type="text"
              fullWidth
              variant="standard"
              value={newRule.destination_ip}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              name="source_port"
              label="Source Port"
              type="text"
              fullWidth
              variant="standard"
              value={newRule.source_port}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              name="destination_port"
              label="Destination Port"
              type="text"
              fullWidth
              variant="standard"
              value={newRule.destination_port}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              name="rate_limit"
              label="Rate Limit"
              type="number"
              fullWidth
              variant="standard"
              value={newRule.rate_limit}
              onChange={handleRateLimitChange}
              error={!!rateLimitError}
              helperText={rateLimitError}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              name="limit_window"
              label="Limit Window"
              type="number"
              fullWidth
              variant="standard"
              value={newRule.limit_window}
              onChange={handleRateLimitChange}
              error={!!rateLimitError}
              helperText={rateLimitError}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Protocol</InputLabel>
              <Select
                name="protocol"
                value={newRule.protocol}
                onChange={onChange}
              >
                {protocolOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel>State</InputLabel>
              <Select
                name="state"
                value={newRule.state}
                onChange={onChange}
              >
                {stateOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Action</InputLabel>
              <Select
                name="action"
                value={newRule.action}
                onChange={onChange}
              >
                {actionOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Log Action</InputLabel>
              <Select
                name="log_action"
                value={newRule.log_action}
                onChange={onChange}
              >
                {logActionOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} color="primary" disabled={!!rateLimitError}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRuleDialog;
