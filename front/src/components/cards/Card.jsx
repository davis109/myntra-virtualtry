import React, { useEffect, useState, useContext } from "react";
import { MainDiv, CardDiv, DescDiv ,CountryDiv , BundlesDiv ,SizeDiv ,ContainerDiv , TopDiv} from "./cardItems";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
// import { FilterContext } from "../../context/FilterContext";
import Sort from "../sort/Sort";
// import { SortContext } from "../../context/Sortcontext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {useNavigate} from "react-router-dom"

import { ImageContext } from '../../context/ImageContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Box } from '@mui/system';



function Card() {
  const [flag, setflag] = useState(false);

  const [isChecked, setChecked] = useState(false);

  const [newdata, setNewdata] = useState([]);
  // const { state1, state2 } = useContext(SortContext)
  const [flagBundle , setFlagBundle] = useState(false);
  const [flagCountry , setFlagCountry] = useState(false)
  const [flagSize, setFlagSize] = useState(false)
  const navigate= useNavigate()

  const [state1, setState1] = useState(false);
  const [state2, setState2] = useState(false);
  const [event, setEvent] = useState("");
  const {data,setData,selectedImage,setSelectedImage,responseImages,setResponseImages} = useContext(ImageContext)
  const [loading,setLoading] = useState(true)
  

    const fetchData = async () => {
      try {
          setLoading(false)
          const response = await axios.get(`http://localhost:8000/get_myntra_data`)
          if (response.status == 200) {
              console.log('Hiii')
              console.log(response.data)
              setData(response.data)
              setLoading(true)
          }
        
      } catch (err) {
          Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
          })
      }
  }
  useEffect(() => {
      fetchData();
  }, [])

  const handleMove = (ele) => {
    navigate(`/catalog/single/${ele.product_id}`)
    console.log(ele)
    setSelectedImage(ele)
  }

  var handleEnter = (e) => {
    setflag(true);
    e.mouse = true;
  };
  const handleLeave = (e) => {
    setflag(false);
    e.mouse = false;
  };

  const handleEnterBundle=()=>{
    setFlagBundle(true)
  }
  const handleLeaveBundle=()=>{
    setFlagBundle(false)
  }
  const handleEnterCountry=()=>{
    setFlagCountry(true)
  }
  const handleLeaveCountry=()=>{
    setFlagCountry(false)
  }
  const handleEnterSize=()=>{
    setFlagSize(true)
  }
  const handleLeaveSize=()=>{
    setFlagSize(false)

  }
  


 

  return (
    <div>
      <TopDiv>
        <div style={{ display: "flex", gap:"20px",  marginLeft:"20px",marginTop:'1em',marginBottom:'1em'}}>
          <BundlesDiv  onMouseEnter={handleEnterBundle} onMouseLeave={handleLeaveBundle} flag={flagBundle}>
            <p style={{ margin:"-2px 2px 2px 2px"  , alignItems :"center" , display:"flex" }}>Bundles <ExpandMoreIcon/> </p>
          </BundlesDiv>   
          <CountryDiv  onMouseEnter={handleEnterCountry} onMouseLeave={handleLeaveCountry} flag={flagCountry}>
            <p style={{margin:"-2px 2px 2px 2px" ,alignItems :"center" , display:"flex"}}>Country of Origin <ExpandMoreIcon/>  </p>
          </CountryDiv>
          <SizeDiv onMouseEnter={handleEnterSize} onMouseLeave={handleLeaveSize} flag={flagSize}> 
          <p style={{margin:"-2px 2px 2px 2px" ,alignItems :"center" , display:"flex"}}>Size  <ExpandMoreIcon/> </p>
          </SizeDiv>
        </div>
        {/* <Sort /> */}
      </TopDiv>

      <ContainerDiv>
      {
                        !loading && 
                            <Box display='flex' justifyContent='center' alignItems='center'>
                            <div class="three-body">
                            <div class="three-body__dot"></div>
                            <div class="three-body__dot"></div>
                            <div class="three-body__dot"></div>
                            </div>
                            </Box>
                        
                    }

        {loading &&
          data.map((ele) => {
              return (
                <MainDiv
                  onMouseEnter={() => {
                    handleEnter(ele);
                  }}
                  onMouseLeave={() => {
                    handleLeave(ele);
                  }}
                  onClick={()=>{handleMove(ele)}}
                >
                  <CardDiv flag={ele.mouse}>
                    <img
                      src={`${ele.img}`}
                      style={{ width: "100%", height: "100%" }}
                    ></img>
                  </CardDiv>

                    <DescDiv flag={ele.mouse}>
                      <div
                        style={{
                          overflow: "hidden",
                          height: "35px",
                          margin: "-10px 8px",
                          textAlign: "left",
                        }}
                      >
                        <p style={{ fontWeight: "bold", fontSize: "12px" }}>
                          {ele.seller}
                        </p>
                      </div>
                      <div
                        style={{
                          overflow: "hidden",
                          height: "32px",
                          margin: "-15px 8px",
                          textAlign: "left",
                        }}
                      >
                        <p
                          style={{
                            textTransform: "capitalize",
                            fontSize: "12px",
                          }}
                        >
                          {ele.name}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "left",
                          margin: "auto 8px",
                          gap: "20px",
                        }}
                      >
                        <p
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >{`Rs ${ele.price}`}</p>
                        <p
                          style={{
                            fontSize: "12px",
                            textDecorationLine: "line-through",
                          }}
                        >
                          {/* {ele.off_price ? `Rs ${ele.off_price}` : "NA"} */}
                          500
                        </p>
                        <p style={{ fontSize: "12px", color: "orange" }}>
                          {ele.discount ? `(${ele.discount}% OFF)` : "NA"}
                          
                        </p>
                      </div>
                    </DescDiv>
                  
                </MainDiv>
              );
            })
          
          }
           
      </ContainerDiv>
    </div>
  );
}
export default Card;
