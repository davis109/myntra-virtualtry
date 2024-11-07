import React, { useContext, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styled from "styled-components";
import { Link } from "@mui/material";
// import { SortContext } from "../../context/Sortcontext";

let ContentDiv = styled.div`
  display: ${(props) => (!props.state ? "none" : "grid")};
  position: absolute;
  background: white;
  height: 140px;
  gap: 20px;
  color: grey;
  text-decoration: none;
  width: 235px;
  border: 0.5px solid lightgrey;
  float: right;
  padding:20px;
  margin-top: -20px;
  margin-left: 20px;
`;
function Sort() {
  const [state, setState] = useState(false);
  // const { LowtoHigh, HightoLow } = useContext(SortContext);
  const handleState = () => {
    state ? setState(false) : setState(true);
  };

  const [state1, setState1] = useState(false);
  const [state2, setState2] = useState(false);

  const LowtoHigh = () => {
      if (state2 == true)
      {
          setState2(false)
      }
      setState1(true)
  }
  const HightoLow = () => {
      if (state1 == true)
      {
          setState1(false)
      }
      setState2(true)
  }
  return (
    <div
      style={{
        width: "225px",
        position: "relative",
        cursor: "pointer",
       
      }}
    >
      <div
        style={{
          width: "225px",
          height: "40px",
          border: "1px solid grey",
          margin: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "10px",
       
        }}
        onMouseEnter={handleState}
      >
        <span style={{ display: "flex", gap: "10px" }}>
          Sort By:
          <b>Recommended</b>
        </span>{" "}
        <ExpandMoreIcon />
      </div>
      <ContentDiv state={state}>
        <div onClick={LowtoHigh}>
          <Link style={{ textDecoration: "none", color: "black" }}>
            Price: Low to High
          </Link>
        </div>
        <div onClick={HightoLow}>
          <Link style={{ textDecoration: "none", color: "black" }}>
            Price: High to Low{" "}
          </Link>
        </div>
        <div>
          {" "}
          <Link style={{ textDecoration: "none", color: "black" }}>
            Popularity
          </Link>
        </div>
        <div>
          <Link style={{ textDecoration: "none", color: "black" }}>
            Customer Rating
          </Link>
        </div>
      </ContentDiv>
    </div>
  );
}

export default Sort;
