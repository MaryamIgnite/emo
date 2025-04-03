"use client";
import React from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function Loader({ message = "Loading..." }) {
  return (
    <Box
      sx={{
        height: "100vh",               // Full viewport height
        display: "flex",               // Flexbox layout
        justifyContent: "center",      // Center horizontally
        alignItems: "center",          // Center vertically
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <CircularProgress color="success" size={70}/>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}
