import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import { Link } from "react-router-dom"

const cardSx = {
  height: "100px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  transition: "all linear 0.2s",
  textDecoration: 'none',
  "&:hover": {
    backgroundColor: "#cccccc",
  },
}

const App = (props) => {
  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={4}>
        <Link style={{ textDecoration: 'none' }} to="/searching-algorithms">
          <Card sx={cardSx}>Searching Algorithms</Card>
        </Link>
      </Grid>
      <Grid item xs={4}>
        <Link style={{ textDecoration: 'none' }} to="/tree-traversals">
          <Card sx={cardSx}>Tree Traversals</Card>
        </Link>
      </Grid>
      <Grid item xs={4}>
        <Link style={{ textDecoration: 'none' }} to="/graph-traversals">
          <Card sx={cardSx}>Graph Traversals</Card>
        </Link>
      </Grid>
    </Grid>
  )
}

export default App
