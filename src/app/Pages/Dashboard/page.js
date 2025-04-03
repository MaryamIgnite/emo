"use client";

import React from "react";
import { Container, Grid, Card, CardContent, Typography, CardActionArea, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { Email as EmailIcon, ListAlt as ListIcon, Event as EventIcon, Dashboard as DashboardIcon } from "@mui/icons-material";

// Define navigation links with icons and colors
const pages = [
  { title: "Campaigns", path: "/Pages/Campaigns", icon: <EmailIcon sx={{ fontSize: 40, color: "#1976d2" }} />, color: "#e3f2fd" },
  { title: "Campaign List", path: "/Pages/List", icon: <ListIcon sx={{ fontSize: 40, color: "#388e3c" }} />, color: "#e8f5e9" },
  { title: "Events", path: "/Pages/Events", icon: <EventIcon sx={{ fontSize: 40, color: "#d32f2f" }} />, color: "#ffebee" },
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center", color: "#333" }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {pages.map((page, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ backgroundColor: page.color, borderRadius: 3, boxShadow: 3 }}>
              <CardActionArea onClick={() => router.push(page.path)} sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box>{page.icon}</Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", mt: 1 }}>
                    {page.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
