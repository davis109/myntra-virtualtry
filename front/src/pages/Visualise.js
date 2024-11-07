import { AppBar, Grid, TextField, Typography } from '@mui/material'
import React from 'react'
import { Box } from '@mui/system';
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Swal from 'sweetalert2'
// import { Button } from 'flowbite-react';
import { Button, Card } from 'flowbite-react';
import { MainDiv, CardDiv, DescDiv ,CountryDiv , BundlesDiv ,SizeDiv ,ContainerDiv , TopDiv} from "../components/cards/cardItems";
import {
  DetailsMainDiv,
  ImageContainer,
  Img,
  ImgDiv,
  SubDetailsDiv,
  WishDiv,
  SizesDIv,
  BagDiv,
  RatingDiv,
  TryONDiv
} from "../components/Details/detailStyled2";

import { useState } from 'react';
import { ImageContext } from '../context/ImageContext';
import { useEffect, useContext } from 'react';
import axios from 'axios'
import x from './output_image6.png'
import SearchIcon from "@mui/icons-material/Search";

const linkStyle = {
  textDecoration: "none",
  padding: "5px",
  color: "black",
};

const Visualise = () => {
  const { responseImages,setResponseImages,intial,setInitial,original,setOriginal,recommended,setRecommended,showNext,setShowNext,current,setCurrent,details,setDetails } = useContext(ImageContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState({
    positive_feedback: [],
    negative_feedback: []
  });
  const [search,setSearch] = useState(null);
  const [responseSearch,setResponseSearch] = useState([])
  const [rec,setRec] = useState(false)

  const handleClick = (feedbackCurrent,category) => {
    console.log(recommended)
    if (currentIndex < recommended.length) {
      setFeedback((prevFeedback) => {
        const updatedFeedback = { ...prevFeedback };
        if (feedbackCurrent === 'Positive') {
          updatedFeedback.positive_feedback.push(category);
        } else {
          updatedFeedback.negative_feedback.push(category);
        }
        return updatedFeedback;
      });

      if (showNext) {
        setCurrentIndex(currentIndex + 1);
      }
      else {
        setShowNext(true)
      }

      
    }
    else{
      console.log(feedback)
      console.log(original)
      axios.post('http://localhost:8000/submit-feedback', feedback)
      .then(response => {
        console.log('Feedback submitted:', response.data);
        axios.post('http://localhost:8000/get_recommendations', original, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log('Response received:', response.data);
             const fitted_img = response.data.selected_image   //path 
            
             const recommended_details = response.data.recommended_images
             console.log(fitted_img)
             console.log(recommended_details)
          setInitial(fitted_img);
          setOriginal(original);
          setRecommended(recommended_details);
          setCurrent(fitted_img)
          setDetails(original)
          setShowNext(false)
          setCurrentIndex(0)
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
          console.error('Error uploading data:', error);
        });
        // const fitted_img = response.data.fitted_img    //path 
        // const recommended_details = response.data.recommended_details
        // setInitial(fitted_img);
        // setRecommended(recommended_details);
        // setCurrent(fitted_img)
        // setShowNext(false)
        // setCurrentIndex(0)
      })
      .catch(error => {
        console.error('Error submitting feedback:', error);
      });}
  };

  console.log('Current is ',current)
  useEffect(() => {
    if (!current) {
      setCurrent(intial);
    } else if (showNext && currentIndex < recommended.length) {
      const currentImage = recommended[currentIndex].fitted_image;
      setCurrent(currentImage);
    }
  }, [currentIndex, recommended, showNext]);

  const handleSearch = (event) =>
  {
    event.preventDefault();
    axios.post('http://localhost:8000/get_images', { query:search })
        .then(response => {
          console.log('Feedback submitted:', response.data);
             const fitted_img = response.data.fitted_image
             const details = response.data.details
             setCurrent(fitted_img)
             setOriginal(details)
             setShowNext(false)
             setRec(true)
        })
        .catch(error => {
          console.error('Error submitting feedback:', error);

        });   
    // setCurrent(x)
    // setOriginal({
    //   brand:'Roadster',
    //   name:'Lacy Black Corset Top Womens',
    //   price:'799',
    //   discount: 45,
    //   img: 'https://assets.myntassets.com/f_webp,dpr_2.8,q_60,w_210,c_limit,fl_progressive/assets/images/22689046/2023/4/26/740c72e7-c08e-4cfe-84af-d4d32a05abbc1682494109146-Urban-Revivo-Shoulder-Straps-Corset-Style-Crop-Top-347168249-1.jpg'
    // })
    // setShowNext(false)
    // setRec(true)
    

  }

  const handleChange = (e) =>
  {
      setSearch(e.target.value)
  }

  return (
    
    <Grid container className='h-screen'>
      <Grid item xs={12}>
        <AppBar className='bg-blue-100 h-14' sx={{ backgroundColor: '#e7396a' }}>
          <form className="flex items-center max-w-sm mx-auto mt-1 mb-1">
            <div className="relative w-full">
              <input
                type="text"
                id="simple-search"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-4 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search ..."
                required
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              onClick = {handleSearch}
              className="p-2.5 ms-6 text-sm font-medium text-white rounded-lg border-none focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {/* <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
              <span className="sr-only">Search</span> */}
              <SearchIcon/>
            </button>
          </form>
        </AppBar>
      </Grid>

      <Grid item xs={12}>
        <Grid container className='p-10 mt-14'>
          <Grid item xs={8}>
            <Grid container>
            <Grid item lg={3.5} md={3.5} sm={4} xs={4} className='flex justify-center items-center'>
  <button 
    onClick={() => {
      if (currentIndex < recommended.length) {
        handleClick('Negative', recommended[currentIndex].subcategory);

      }
      else {
        handleClick('Negative', 'Shirt');
      }
    }}
  >
    <svg className="h-16 w-16 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  </button>
</Grid>


                  <Grid item lg={5} md={5} sm={8} xs={8} className='bg-blue-100 flex justify-center items-center' sx={{ height: '80vh', borderRadius: '1em' }}>
          {current ? (
            <img src={`http://127.0.0.1:8000/fitted_images/${current}`} alt="Current" className="w-full h-full object-cover" style={{ borderRadius: '1em' }} />
          ) : (
            <p>Loading...</p>
          )}
        </Grid>

          <Grid item lg={3.5} md={3.5} sm={4} xs={4} className='flex justify-center items-center'>
            <button onClick={() => {
      if (currentIndex < recommended.length) {
        handleClick('Positive', recommended[currentIndex].subcategory);

      }
      else {
        handleClick('Positive', 'Shirt');
      }
    }}>
              <svg className="h-16 w-16 text-green-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" />
                <circle cx="12" cy="12" r="9" />
                <path d="M9 12l2 2l4 -4" />
              </svg>
            </button>
          </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <div style={{display:'flex' , alignItems:'center',flexDirection:'column'}}>
              <Typography style={linkStyle}>ITEMS IN THE IMAGE</Typography>
            <div style={{display:'flex' , justifyContent:'center',flexDirection:'row',marginTop:'1em'}}>
              {
                rec && 
                (original.map((original, index) => (
                  <MainDiv key={index}>
                    <CardDiv>
                      <img
                        src={`${original.original_image}`}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </CardDiv>
                
                    <DescDiv>
                      <div
                        style={{
                          overflow: "hidden",
                          height: "35px",
                          margin: "-10px 8px",
                          textAlign: "left",
                        }}
                      >
                        <p style={{ fontWeight: "bold", fontSize: "12px" }}>
                          {original.seller}
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
                          {original.name[0]}
                        </p>
                      </div>
                
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "left",
                          margin: "auto 8px",
                          gap: "20px",
                          marginBottom: '1em'
                        }}
                      >
                        <p
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {original.price}
                        </p>
                        
                        <p style={{ fontSize: "12px", color: "orange" }}>
                          {original.discount}% OFF
                        </p>
                      </div>
                      <BagDiv>
                        <ShoppingBagIcon />
                        <a>
                          <p>
                            <b>ADD TO CART</b>
                          </p>
                        </a>
                      </BagDiv>
                    </DescDiv>
                  </MainDiv>
                )))
                
              }
              {
                !rec && 
                <MainDiv
                  // onMouseEnter={() => {
                  //   handleEnter(ele);
                  // }}
                  // onMouseLeave={() => {
                  //   handleLeave(ele);
                  // }}
                  // onClick={()=>{handleMove(ele)}}
                >
                  <CardDiv >
                    <img
                      src={`${original.img}`}
                      style={{ width: "100%", height: "100%" }}
                    ></img>
                  </CardDiv>

                    <DescDiv >
                      <div
                        style={{
                          overflow: "hidden",
                          height: "35px",
                          margin: "-10px 8px",
                          textAlign: "left",
                        }}
                      >
                        <p style={{ fontWeight: "bold", fontSize: "12px" }}>
                          {original.seller}
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
                          {original.name}
                          
                        </p>
                      </div>



                      <div
                        style={{
                          display: "flex",
                          justifyContent: "left",
                          margin: "auto 8px",
                          gap: "20px",
                          marginBottom:'1em'
                        }}
                      >
                        <p
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {original.price}
                        </p>
                        
                        <p style={{ fontSize: "12px", color: "orange" }}>
                        {original.discount}% OFF
                          
                        </p>
                      </div>
                      <BagDiv
                      
                    >
                      <ShoppingBagIcon />
                      <a>
                      <p>
                        <b>ADD TO CART</b>
                      </p>
                      </a>
                      
                    </BagDiv>
                    </DescDiv>
                  
                </MainDiv>

              }
              

                {
                  showNext && currentIndex < recommended.length &&
                  <MainDiv
                  // onMouseEnter={() => {
                  //   handleEnter(ele);
                  // }}
                  // onMouseLeave={() => {
                  //   handleLeave(ele);
                  // }}
                  // onClick={()=>{handleMove(ele)}}
                  style={{marginLeft:'3em'}}
                >
                  <CardDiv >
                    <img
                      src={`${recommended[currentIndex].original_image}`}
                      style={{ width: "100%", height: "100%" }}
                    ></img>
                  </CardDiv>

                    <DescDiv >
                      <div
                        style={{
                          overflow: "hidden",
                          height: "35px",
                          margin: "-10px 8px",
                          textAlign: "left",
                        }}
                      >
                        <p style={{ fontWeight: "bold", fontSize: "12px" }}>
                        {recommended[currentIndex].seller}
                          
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
                          {recommended[currentIndex].name}
                          
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "left",
                          margin: "auto 8px",
                          gap: "20px",
                          marginBottom:'1em'
                        }}
                      >
                        <p
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {recommended[currentIndex].price}
                        </p>
                        
                        <p style={{ fontSize: "12px", color: "orange" }}>
                        {recommended[currentIndex].discount}
                          
                        </p>
                      </div>
                      <BagDiv
                      
                    >
                      <ShoppingBagIcon />
                      <a>
                      <p>
                        <b>ADD TO CART</b>
                      </p>
                      </a>
                      
                    </BagDiv>
                    </DescDiv>
                  
                </MainDiv>

                }

                
                </div>
            </div>
            
            

          
          </Grid>

        </Grid>
      </Grid>
    </Grid>
  );
};

export default Visualise;



