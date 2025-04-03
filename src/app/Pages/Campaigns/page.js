"use client";

import React,{ useState, useEffect } from "react";
import { Box,FormControl,InputLabel,Container, TextField, Button, Typography, Select, MenuItem, Divider,FormGroup,FormControlLabel,Checkbox,Alert } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { ListSubheader } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';



export default function Campaigns() {
  const getDateOfISOWeek = (week, year) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  };
  
  const getWeekNumber = (date = new Date()) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  };
  
  const currentWeekNumber = getWeekNumber();
  const currentYear = new Date().getFullYear();
  
  const weekOptions = Array.from({ length: 27 }, (_, i) => currentWeekNumber + i);
  
  
  
  const [emailTypes, setEmailTypes] = useState([]);  
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("id"); // ✅ Get campaign ID from URL
  const [campaign, setCampaign] = useState({
    audience: "",
    subject: "",
    message: "",
    need: "",
    week: currentWeekNumber.toString(),
    frequency: "0000000",
    call_to_action: "",
    email_type: "",
  });
  const [weekDate, setWeekDate] = useState(
    getDateOfISOWeek(currentWeekNumber, currentYear).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
  useEffect(() => {
    async function fetchEmailTypes() {
      const response = await fetch("/api/EmailTypes");
      const data = await response.json();
      setEmailTypes(data);
    }
    fetchEmailTypes();
  }, []);

  useEffect(() => {
    if (campaignId) {
      async function fetchCampaign() {
        const response = await fetch(`/api/Campaigns?id=${campaignId}`); // ✅ Send ID as query param
        const data = await response.json();
        if (data) {
          setCampaign({
            ...data,
            //audience: data.audience.split(","), // Convert string to array
          });
        }
      }
      fetchCampaign();
    }
  }, [campaignId]);
  useEffect(() => {
    setCampaign(prev => ({ ...prev, week: getWeekNumber() }));
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "audience") {
      const emailsArray = e.target.value ? e.target.value.split(",").map(email => email.trim()) : [];
      setCampaign({ ...campaign, audience: emailsArray });
    } else {
      setCampaign({ ...campaign, [e.target.name]: e.target.value });
    }
  };

  const handleCheckboxChange = (e, index) => {
    let newFrequency = campaign.frequency.split("");
    newFrequency[index] = e.target.checked ? "1" : "0";
    setCampaign({ ...campaign, frequency: newFrequency.join("") });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaign.audience || !campaign.subject || !campaign.message || !campaign.week || !campaign.email_type) {
      setErrorMessage("All required fields must be filled.");
      setTimeout(() => setErrorMessage("Please fill out required fields."), 3000); // Hide after 3 sec
      return;
    }
    const campaignWithDefaults = {
      ...campaign,
      audience: campaign.audience.join(","), // ✅ Convert array to string before sending
    };
    try {
      const response = await fetch(campaignId ? `/api/Campaigns` : "/api/Campaigns", {
        method: campaignId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignId ? { id: campaignId, ...campaignWithDefaults } : campaignWithDefaults),
      });

      const data = await response.json();
      console.log("Server Response:", data);
      /* setCampaign({
        audience: "",
        subject: "",
        message: "",
        need: "",
        week: "",
        frequency: "0000000",
        call_to_action: "",
        email_type: "",
      }); */

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);

      router.push(
        `/Pages/AggregateCamp?week=${campaign.week}&id=${data.id}`
      );
      
    } catch (error) {
      console.error("Error submitting campaign:", error);
    }
  };
  const weekGroups = weekOptions.reduce((groups, week) => {
    const start = getDateOfISOWeek(week, currentYear);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
  
    const monthLabel = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const weekLabel = `Week ${week} — ${start.toLocaleDateString("en-US", {
      month: "short", day: "numeric"
    })} - ${end.toLocaleDateString("en-US", {
      month: "short", day: "numeric"
    })}`;
  
    if (!groups[monthLabel]) groups[monthLabel] = [];
    groups[monthLabel].push({ week, label: weekLabel });
    return groups;
  }, {});
  

  return (
    
    <Container maxWidth="md" className="my-5 p-5" style={{backgroundColor:"#ffff",borderRadius:"10px",color:"black",boxShadow:"0 14px 16px rgba(0, 0, 0, 0.1)"}}>
       {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(false)}>
          Campaign submitted successfully!
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(false)}>
          Please fill out required fields.
        </Alert>
      )}
      <Typography variant="h4" fontWeight="bold" gutterBottom style={{textAlign:"left"}}>
      <CampaignIcon fontSize="large" color="primary" /> New Email Campaign
        <Divider style={{margin:"15px",minWidth:"50px"}}></Divider>
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Target Audience (comma-separated emails)" name="audience" 
        value={Array.isArray(campaign.audience) ? campaign.audience.join(", ") : ""} onChange={handleChange} margin="normal" 
        InputLabelProps={{ shrink: true }} placeholder="e.g. GFI Kerio Connect Distributors" required/>

<TextField fullWidth label="Subject" name="subject" 
        value={campaign.subject} onChange={handleChange} margin="normal" 
        InputLabelProps={{ shrink: true }} placeholder="e.g. Our Latest Offers" required/> 

        <TextField fullWidth label="Message" name="message" 
        value={campaign.message} onChange={handleChange} margin="normal" 
        InputLabelProps={{ shrink: true }} placeholder="Enter the topic, messaging and content..." required multiline rows={5}/>

        <TextField fullWidth label="Customer Need" name="need" 
        value={campaign.need} onChange={handleChange} margin="normal" 
        InputLabelProps={{ shrink: true }} placeholder="Why is this important to Customer?"/>
        

<Box sx={{
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexWrap: "nowrap",          // ⛔ prevents line wrap
    whiteSpace: "nowrap",        // ⛔ prevents wrapping text
    overflow: "hidden",          // ⛔ hides overflow
  }}>
  <FormControl margin="normal" fullWidth>
    <InputLabel>Week Number</InputLabel>
    <Select
  
  label="Week Number"
  value={campaign.week}
  onChange={(e) => {
    const selectedWeek = parseInt(e.target.value);
    const date = getDateOfISOWeek(selectedWeek, currentYear);
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    setCampaign({ ...campaign, week: selectedWeek.toString() });
    setWeekDate(formatted);
  }}
>
  {Object.entries(weekGroups).flatMap(([month, weeks]) => [
    <ListSubheader key={month}>{month}</ListSubheader>,
    ...weeks.map(({ week, label }) => (
      <MenuItem
  key={week}
  value={week}
  sx={{
    fontWeight: week === currentWeekNumber ? "bold" : "normal",
    backgroundColor: week === currentWeekNumber ? "#e3f2fd" : "inherit",
  }}
>
  <CalendarMonthIcon
    fontSize="small"
    sx={{ mr: 1, color: week === currentWeekNumber ? "primary.main" : "text.secondary" }}
  />
  {label}
</MenuItem>

    ))
  ])}
</Select>


  </FormControl>

  <Typography variant="body2" color="text.secondary">
    {weekDate}
  </Typography>
</Box>


<InputLabel>Days Allowed (Mon - Sun)</InputLabel> 
    <FormGroup row required>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={campaign.frequency[index] === "1"}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
              }
              label={day}
            />
          ))}
        </FormGroup>

        <TextField fullWidth label="Call to Action" name="call_to_action" 
        value={campaign.call_to_action} onChange={handleChange} margin="normal" 
        InputLabelProps={{ shrink: true }} placeholder="e.g. Sign Up Now"/>

        {/*<span className="label" required>Email Type*</span>*/}
        <FormControl margin="normal" fullWidth>
        <InputLabel>Email Type</InputLabel>
        <Select name="email_type" value={campaign.email_type} onChange={handleChange} margin="normal" required>
          {emailTypes.map((type) => (
            <MenuItem key={type.id} value={type.type_name}>
              {type.type_name}
            </MenuItem>
          ))}
        </Select>
        </FormControl>

        <Button style={{marginTop:"10px"}} type="submit" variant="contained" color="primary" fullWidth>
        {campaignId ? "Update Campaign" : "Next"}
        
        </Button>
      </form>
    </Container>
  );
}
