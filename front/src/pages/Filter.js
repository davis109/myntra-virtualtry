import { Box, Typography } from '@mui/material'
import React from 'react'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { HR } from 'flowbite-react';
import Slider from '@mui/material/Slider';

const Filter = () => {
  return (
    <Box sx={{ width:'20vw', minHeight:'92.75vh', display:'flex', justifyContent:'center', flexDirection:'column' }}>
       
       <FormControl >
            <Box sx={{display:'flex', justifyContent:'center'}}>
            <FormLabel id="demo-radio-buttons-group-label" sx={{marginBottom:'1em'}}>Gender</FormLabel>

            </Box>
            <hr className='w-[20vw]'/>
            <Box  sx={{display:'flex', justifyContent:'center',marginBottom:'2em'}}>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="female"
                name="radio-buttons-group"
                sx={{marginTop:'1em'}}
            >
                <FormControlLabel value="female" control={<Radio />} label="Female" />
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="unisex" control={<Radio />} label="Unisex" />
            </RadioGroup>
            </Box>
            
        </FormControl>

        <FormControl>
        <Box  sx={{display:'flex', justifyContent:'center',marginBottom:'1em'}}>
        <FormLabel id="demo-radio-buttons-group-label">Price Range</FormLabel>

</Box>
<hr className='w-[20vw]'/>
            
            <div className='pl-10 pr-16 mt-[2em] mb-[2em]'>
            <Slider
            size="small"
            defaultValue={100}
            aria-label="Small"
            valueLabelDisplay="auto"
            // className='p-3'
        />
            </div>
            
        </FormControl>

        

       <FormControl>
       <Box  sx={{display:'flex', justifyContent:'center',marginBottom:'1em'}}>
       <FormLabel id="demo-radio-buttons-group-label">Category</FormLabel>

        </Box>
       <hr  className='w-[20vw]'/>
            
            <Box  sx={{display:'flex', justifyContent:'center',marginTop:'1em'}}>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="all"
                name="radio-buttons-group"
            >
                <FormControlLabel value="all" control={<Radio />} label="All" />

                <FormControlLabel value="top" control={<Radio />} label="Topwear" />
                <FormControlLabel value="bottom" control={<Radio />} label="Bottomwear" />
                <FormControlLabel value="dresses" control={<Radio />} label="Dresses" />
            </RadioGroup>
            </Box>
           
        </FormControl>

        

    </Box>
  )
}

export default Filter
