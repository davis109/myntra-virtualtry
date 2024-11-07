import React, { useContext, useState , useEffect} from 'react'
import { Box } from '@mui/system';
import { AppBar, Grid, Typography } from '@mui/material';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button, Card } from 'flowbite-react';
import './Main.css'

import Filter from './Filter';
import {useNavigate} from 'react-router-dom'
import { ImageContext } from '../context/ImageContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import x from './im.jpg'

const Main = () => {
    const {data,setData,selectedImage,setSelectedImage,responseImages,setResponseImages} = useContext(ImageContext)
    const [loading,setLoading] = useState(true)
    const navigate = useNavigate()


    const handleSubmit = (item) => {
        setSelectedImage(item.imageSrc);
        console.log('Submitting data:', item);
        navigate('/visualise')
        axios.post('http://localhost:8000/get_myntra_data', item, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log('Response received:', response.data);
          setResponseImages(response.data.images);
          navigate('/visualise');
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
          console.error('Error uploading data:', error);
        });
      };
    const fetchData = async () => {
        try {
            setLoading(false)
            const response = await axios.get(`http://localhost:8000/get_myntra_data`)
            if (response.status == 200) {
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


  return (
    <Grid container>
        <Grid item xs={12} className='h-10'>
            <AppBar  className='bg-blue-100 h-14' sx={{backgroundColor:'rgb(219 234 254 / var(--tw-bg-opacity))'}}>               
            </AppBar>
        </Grid>
        <Grid item xs={12}>
            <Box display='flex' flexDirection='row'>
                <Box className='border-r-2 border-gray-300 p-3 pt-3' sx={{ width:'20vw', minHeight:'92.75vh', maxHeight:'92.75vh',display:'flex'}} >
                    <Filter/>
                    
                </Box>
                <Box display='flex' justifyContent='center' alignItems='center' className='w-full'>
                    
                    {
                        !loading && 
                            <Box>
                            <div class="three-body">
                            <div class="three-body__dot"></div>
                            <div class="three-body__dot"></div>
                            <div class="three-body__dot"></div>
                            </div>
                            </Box>
                        
                    }
                    {
                        loading &&
                        <Grid container spacing={5} sx={{marginTop:'1em'}}>
                            <Grid item xs={12} lg={4} md={4} >
                            <Card className="w-[80%] ml-10">
                                <img src={x} alt="Product" className="w-full" />
                                <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">Rs.399</span>
                                <a
                                    href="#"
                                    onClick={() => handleSubmit('hii')}
                                    className="rounded-lg bg-cyan-700 px-5 py-2.5 text-center text-xs font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                                    style={{ backgroundColor: '#02003E' }}
                                >
                                    Visualise
                                </a>
                                </div>
                            </Card>
                            </Grid>
                            {data.map((item) => (
                            <Grid item xs={12} lg={4} md={4} key={item.id}>
                            <Card className="w-[80%] ml-10">
                                <img src={item.img} alt="Product" className="w-full" />
                                <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">Rs.{item.price}</span>
                                <a
                                    href="#"
                                    onClick={() => handleSubmit(item)}
                                    className="rounded-lg bg-cyan-700 px-5 py-2.5 text-center text-xs font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                                    style={{ backgroundColor: '#02003E' }}
                                >
                                    Visualise
                                </a>
                                </div>
                            </Card>
                            </Grid>
                        ))}

                                


                        </Grid>
                    }
                    
                </Box>

            </Box>
        </Grid>
    </Grid>
  )
}

export default Main
