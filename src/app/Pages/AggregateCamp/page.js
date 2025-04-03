"use client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Avatar,
  Chip,
  Stack,
  TextField,Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import EventIcon from "@mui/icons-material/Event";
import { useSearchParams,useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { BorderRight } from "@mui/icons-material";

export default function AggregateScreen() {
    const searchParams = useSearchParams();
    const week = searchParams.get("week");
    const campaignId = searchParams.get("id");

    const [successMessage, setSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
  
    const [currentCampaign, setCurrentCampaign] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [thisWeekEvents, setThisWeekEvents] = useState([]);
    const router = useRouter();
    const [generatedEvents, setGeneratedEvents] = useState([]);
    const [overlapsFound, setOverlapsFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [insertEvents, setInsertEvents] = useState([]);
    const [updateEvents, setUpdateEvents] = useState([]);
    const [untouchedEvents, setUntouchedEvents] = useState([]);

    const cardStyle = {
       borderRadius: "8px",
      };
  
    // 1. Fetch campaign by ID
    const handleBack = (currentCampaign) => {
        router.push(`/Pages/Edit?id=${currentCampaign.id}`);
      };

      const fetchCampaigns = async () => {
        const response = await fetch("/api/Campaigns");
        const data = await response.json();
        setCampaigns(data);
      };
      
      useEffect(() => {
        fetchCampaigns();
      }, []);
      
      
    useEffect(() => {
        const fetchCampaignId = async () => {
            if (campaignId) {
            const response = await fetch(`/api/Campaigns?id=${campaignId}`);
            const data = await response.json();
            data.audience = convertaudienceToArray(data.audience);
            setCurrentCampaign(data);
            }
          };
          fetchCampaignId();
    }, []);
  
    // 2. Fetch events by week
    useEffect(() => {
      if (week) {
        fetch(`/api/Events?week=${week}`)
          .then((res) => res.json())
          .then((data) => setThisWeekEvents(data));
      }
    }, [week]);

    const convertaudienceToArray=(audience)=>{
        return audience
        .join(",")
      }

      const handleAggregate = async () => {
        try {
          setIsLoading(true);
      
          const res = await fetch("/api/ProcessLLM", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campaignId }),
          });
      
          if (!res.ok) {
            const errData = await res.json();
            console.error("ProcessLLM failed:", errData);
            return;
          }
      
          const data = await res.json();
          console.log("LLM Response:", data);
      
          setInsertEvents(data.insertEvents || []);
          setUpdateEvents(data.updateEvents || []);
          setUntouchedEvents(data.untouchedEvents || []);
          setGeneratedEvents([...data.insertEvents, ...data.updateEvents]); // for display only
      
          setSuccessMessage(true);
          setTimeout(() => setSuccessMessage(false), 3000);
      
        } catch (err) {
          console.error("LLM aggregation failed:", err);
          setErrorMessage(true);
          setTimeout(() => setErrorMessage(false), 3000);
        } finally {
          setIsLoading(false);
        }
      };
      
      const handleSave = async () => {
        const res = await fetch("/api/Events/BulkSave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            insert: insertEvents,
            update: updateEvents
          })
        });
      
        const data = await res.json();
        if (data.success) {
            setInsertEvents([]);
            setUpdateEvents([]);
            setGeneratedEvents([]);
            setSuccessMessage(true);
            setUntouchedEvents([]);
            setTimeout(() => setSuccessMessage(false), 3000);
        }
        else{
            setErrorMessage(true);
            setTimeout(() => setErrorMessage(false), 3000);
        }
      };
      
      

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
  {/* Back button on the left */}
  <Button
    variant="contained"
    color="warning"
    startIcon={<ArrowBackIcon />}
    onClick={() => handleBack(currentCampaign)}
    sx={{ml:5}}
  >
    Back
  </Button>

  {/* Centered Title */}
  <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1, textAlign: "center" }}>
    Aggregate Campaigns — 
    <Chip
      label={`Week ${week}`}
      variant="outlined"
      color="primary"
      size="large"
      sx={{ ml: 1 }}
    />
  </Typography>

  {/* Empty box to balance layout */}
  <Box sx={{ width: 90 }} />
</Stack>
      <Divider style={{margin:"auto",maxWidth:"50%",marginBottom:"20px",marginTop:"10px"}}></Divider>
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(false)}>
          Success!!
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(false)}>
          Failed!!
        </Alert>
      )}

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          {/* Current Submission Card */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Avatar>
                  <MailOutlineIcon />
                </Avatar>
                <Typography variant="h6">Current Submission</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2">
                <Box component="span" fontWeight="bold">To:</Box> {currentCampaign.audience}
              </Typography>
              <Typography variant="body2"><Box component="span" fontWeight="bold">Subject:</Box> {currentCampaign.subject}</Typography>
              <Typography variant="body2"><Box component="span" fontWeight="bold">Message:</Box> {currentCampaign.message}</Typography>
              <Typography variant="body2"><Box component="span" fontWeight="bold">Week:</Box> {currentCampaign.week}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" fontWeight="bold">Scheduled Date:</Typography>
                <Chip label="03-30-2025 (Sunday)" variant="outlined" color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>

          {/* This Week's Events Card */}
          
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <EventIcon />
                </Avatar>
                <Typography variant="h6">This Week's Events</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

             {thisWeekEvents.map((e) => (
                 <Timeline key={e.id} sx={{
                    [`& .${timelineItemClasses.root}:before`]: {
                      flex: 0,
                      padding: 0,
                    },
                  }} position="alternate">
                    <TimelineItem>  
                    <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                <Card elevation={5} style={cardStyle}>
                    <CardContent>
                    <Box >
                    <Typography variant="body2"><strong>To:</strong> {e.audience}</Typography>
                    <Typography variant="body2"><strong>Subject:</strong> {e.event_title}</Typography>
                    <Typography variant="body2"><strong>Message:</strong> {e.message}</Typography>
                    <Typography variant="body2"><strong>Week:</strong> {e.week}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center",mb:1}}>
                    <Typography variant="body2" fontWeight="bold">Scheduled Date:</Typography>
                    <Chip label="03-30-2025 (Sunday)" variant="outlined" color="primary" size="small" sx={{ ml: 1 }} />
                   </Box>
                    </Box>
                    </CardContent>
                </Card> 
                </TimelineContent>
                </TimelineItem>
                </Timeline>
                ))}
              
         
        </Grid>

        {/* Right Column - Aggregated Events */}
        <Grid item xs={12} md={6}>
  <Card elevation={3}>
    <CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar sx={{ bgcolor: "info.main" }}>
          <AutoAwesomeIcon />
        </Avatar>
        <Typography variant="h6">New Events</Typography>
      </Stack>
        <Button variant="contained" color="primary" endIcon={<AutoAwesomeIcon />} onClick={() => handleAggregate(campaignId)} >
          Aggregate Events
        </Button>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {generatedEvents.length === 0 ? (
        <Typography color="text.secondary">
          {isLoading ? "Generating events..." : "Click 'Aggregate' to create events."}
        </Typography>
      ) : (
        generatedEvents.map((event, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="To"
              value={event.to}
              onChange={(e) => {
                const copy = [...generatedEvents];
                copy[index].to = e.target.value;
                setGeneratedEvents(copy);
              }}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Subject"
              value={event.subject}
              onChange={(e) => {
                const copy = [...generatedEvents];
                copy[index].subject = e.target.value;
                setGeneratedEvents(copy);
              }}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              multiline
              label="Message"
              value={event.message}
              onChange={(e) => {
                const copy = [...generatedEvents];
                copy[index].message = e.target.value;
                setGeneratedEvents(copy);
              }}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Date"
              value={event.week}
              onChange={(e) => {
                const copy = [...generatedEvents];
                copy[index].week = e.target.value;
                setGeneratedEvents(copy);
              }}
              sx={{ mb: 1 }}
            />
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      )}

      {generatedEvents.length > 0 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" color="success" endIcon={<SaveOutlinedIcon />} onClick={() => handleSave()}>
          Save Events
        </Button>
        </Box>
      )}
    </CardContent>
  </Card>
</Grid>

      </Grid>
      
    </Box>
  );
}
