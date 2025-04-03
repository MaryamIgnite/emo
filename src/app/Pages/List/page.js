"use client";

import { useState ,useEffect} from "react";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Chip, Button,IconButton  } from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";


// Sample campaign data (to be replaced with API data)
const StyledTableHead = styled(TableHead)({
  backgroundColor: "grey", // Dark Grey
  "& th": {
    color: "white",
  },
});

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const router = useRouter();

  const DAYS_MAPPING = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const convertFrequencyToDays = (frequency) => {
  if (!frequency || frequency.length !== 7) return "N/A"; // Handle invalid cases

  return frequency
    .split("") // Convert "0100100" to ["0", "1", "0", "0", "1", "0", "0"]
    .map((value, index) => (value === "1" ? DAYS_MAPPING[index] : null)) // Map 1s to days
    .filter(Boolean) // Remove null values
    .join(", "); // Convert array to comma-separated string
};

const convertaudienceToArray=(audience)=>{
  return audience
  .join(",")
}

const fetchCampaigns = async () => {
  const response = await fetch("/api/Campaigns");
  const data = await response.json();
  setCampaigns(data);
};

useEffect(() => {
  fetchCampaigns();
}, []);

  const handleEdit = (campaign) => {
    router.push(`/Pages/Edit?id=${campaign.id}`);
  };

  const handleDelete = async (id) => {
    // console.log("Delete Campaign ID:", id);
    const confirmDelete = window.confirm("Are you sure you want to delete this campaign?");
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/Campaigns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });

      if (!response.ok) throw new Error("Failed to delete campaign");

      setCampaigns((prevCampaigns) => prevCampaigns.filter(campaign => campaign.id !== id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const handleLLMProcessing = async () => {
    try {
      const response = await fetch("/api/ProcessLLM", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processLLM: true }),
      });
  
      const data = await response.json();
      console.log("LLM Processing Result:", data);
  
      if (data.success) {
        alert("LLM Processing Completed!");
        fetchCampaigns(); // ✅ Automatically refresh the list
      } else {
        alert("LLM Processing Failed!");
      }
    } catch (error) {
      console.error("Error processing campaigns:", error);
      alert("An error occurred while processing campaigns.");
    }
  };
  

  return (
    <Container maxWidth="lg-5 md-5" className="mt-5">
      <Typography variant="h4" gutterBottom className="text-center" >
        Current Campaign Entries
      </Typography>
      <Divider style={{marginTop:"5px"}}></Divider>

      <TableContainer component={Paper} className="mt-5">
        <Table>
          <StyledTableHead>
            <TableRow >
              <TableCell >ID</TableCell>
              <TableCell >Audience</TableCell>
              <TableCell >Subject</TableCell>
              <TableCell >Messaging</TableCell>
              <TableCell >Need</TableCell>
              <TableCell >Week#</TableCell>
              <TableCell >Days</TableCell>
              <TableCell >Action</TableCell>
              <TableCell >Email Type</TableCell>
              <TableCell >Status</TableCell>
              <TableCell >Action</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>{campaign.id}</TableCell>
                <TableCell>{convertaudienceToArray(campaign.audience)}</TableCell>
                <TableCell>{campaign.subject}</TableCell>
                <TableCell>{campaign.message}</TableCell>
                <TableCell>{campaign.need}</TableCell>
                <TableCell>{campaign.week}</TableCell>
                <TableCell>{convertFrequencyToDays(campaign.frequency)}</TableCell>
                <TableCell>{campaign.call_to_action}</TableCell>
                <TableCell>{campaign.email_type}</TableCell>
                <TableCell><Chip label={campaign.status} color={
                    campaign.status === "Scheduled" ? "success" :
                    campaign.status === "Pending Approval" ? "warning" :
                    campaign.status === "Rejected" ? "error" :
                    "default"
                }></Chip></TableCell>
                <TableCell>
                  <IconButton  color="primary" onClick={() => handleEdit(campaign)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(campaign.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button type="button" variant="contained" color="primary" 
      fullWidth style={{marginTop:"20px"}} onClick={handleLLMProcessing}>
        Aggregate and Generate 
        </Button>
    </Container>
  );
}
