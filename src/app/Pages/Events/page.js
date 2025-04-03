"use client"; // Required for hooks in Next.js app directory

import React, { useEffect, useState } from "react";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,IconButton,Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; 
import CancelIcon from "@mui/icons-material/Cancel"; 
import { styled } from "@mui/material/styles";

// Sample campaign data (to be replaced with API data)
const StyledTableHead = styled(TableHead)({
    backgroundColor: "grey", // Dark Grey
    "& th": {
      color: "white",
    },
  });


export default function EventsList() {
  const [events, setEvents] = useState([]);

  // ✅ Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/Events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Approve or Reject Event
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch("/api/Events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Event ${newStatus}!`);
        fetchEvents(); // ✅ Refresh list after status change
      } else {
        alert("Failed to update event status.");
      }
    } catch (error) {
      console.error("Error updating event status:", error);
    }
  };

  return (
    <Container maxWidth="lg-5 md-5" className="mt-5">
      <Typography variant="h4" gutterBottom className="text-center mt-4" >
      Events List
      </Typography>
      
      <Divider style={{marginTop:"5px"}}></Divider>

      <TableContainer component={Paper} className="mt-5">
        <Table>
          <StyledTableHead>
            <TableRow >
              <TableCell >Event Title</TableCell>
              <TableCell >Audience</TableCell>
              <TableCell >Message</TableCell>
              <TableCell >Need</TableCell>
              <TableCell >Call To Action</TableCell>
              <TableCell >Week</TableCell>
              <TableCell >Email Type</TableCell>
              <TableCell >Status</TableCell>
              <TableCell >Actions</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.event_title}</TableCell>
                <TableCell>{event.audience}</TableCell>
                <TableCell>{event.message}</TableCell>
                <TableCell>{event.need}</TableCell>
                <TableCell>{event.call_to_action}</TableCell>
                <TableCell>{event.week}</TableCell>
                <TableCell>{event.email_type}</TableCell>
                <TableCell>
                  <Chip
                    label={event.status}
                    color={event.status === "Approved" ? "success" : event.status === "Rejected" ? "error" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  {event.status === "Pending Approval" ? (
                    <>
                      <IconButton color="success" onClick={() => handleStatusChange(event.id, "Approved")}>
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleStatusChange(event.id, "Rejected")}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <Chip label="Processed" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
