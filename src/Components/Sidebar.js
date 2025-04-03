"use client"; // Required for hooks in Next.js app directory

import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Box } from "@mui/material";
import { Menu as MenuIcon, Email as EmailIcon, Event as EventIcon, Dashboard as DashboardIcon, List as ListIcon  } from "@mui/icons-material";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar Toggle Button */}
      <IconButton onClick={toggleDrawer} sx={{ position: "absolute", top: 20, left: 20, zIndex: 1000 }}>
        <MenuIcon fontSize="large" />
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer}>
        <List sx={{ width: 250 }}>
          <Link href="/Pages/Dashboard" passHref>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleDrawer}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
          </Link>


          <Link href="/Pages/Campaigns" passHref>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleDrawer}>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Campaigns" />
              </ListItemButton>
            </ListItem>
          </Link>

          <Link href="/Pages/List" passHref>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleDrawer}>
                <ListItemIcon>
                  <ListIcon />
                </ListItemIcon>
                <ListItemText primary="Campaign List" />
              </ListItemButton>
            </ListItem>
          </Link>

          <Link href="/Pages/Events" passHref>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleDrawer}>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText primary="Events" />
              </ListItemButton>
            </ListItem>
          </Link>
        </List>
      </Drawer>
    </Box>
  );
}
