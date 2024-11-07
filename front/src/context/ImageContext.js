import React, { createContext, useState } from 'react';

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [responseImages, setResponseImages] = useState([
    '/1st.jpeg',
    '/2nd.jpeg',
    '/3rd.jpeg',
    '/4th.jpeg',
    '/5th.jpeg',
    
  ]);

  const [intial,setInitial] = useState('')
  const [original,setOriginal] = useState([])
  // const [recommended,setRecommended] = useState([{fitted_img: '/1st-new.png',brand:'roadster',name:'hi',price:
  //   '1000',
  //   discount:10,
  //   img: 'https://assets.myntassets.com/f_webp,dpr_2.8,q_60,w_210,c_limit,fl_progressive/assets/images/21855390/2023/2/6/81c56ec4-0e10-4c63-a86e-a1617b31bba61675656838162Straightcargotrousers1.jpg'
  // },{fitted_img: '/output_image17.png',brand:'Cutekins',name:'solid cargo pants black',price:
  //   '599',
  //   discount:10,
  //   img: 'https://assets.myntassets.com/f_webp,dpr_2.8,q_60,w_210,c_limit,fl_progressive/assets/images/20762524/2022/11/15/8459d57b-6974-41b2-a019-d496ca2dff341668528521659CutiekinsSolidCargoPant-Black1.jpg'
  // },
  // {fitted_img: '/output_image18.png',brand:'roadster',name:'khaki relaxed straight fit trousers',price:
  //   '999',
  //   discount:15,
  //   img: 'https://assets.myntassets.com/f_webp,dpr_2.8,q_60,w_210,c_limit,fl_progressive/assets/images/22886714/2023/4/24/9b618e28-10fd-4bb0-ba8c-c3bf6dffe8691682349916347BreakbounceWomenKhakiRelaxedStraightFitTrousers1.jpg'
  // }])

  const [recommended,setRecommended] = useState([])
  const [showNext,setShowNext] = useState(false)
  // const [current,setCurrent] = useState('/ori.png')
  const [current,setCurrent] = useState(null)
  const [details,setDetails] = useState([])
  
  const [image,uploadImage] = useState(null);
  const [file,setFile] = useState(null);
  const [data,setData] = useState([]);
  
  


  return (
    <ImageContext.Provider value={{ selectedImage, setSelectedImage, responseImages, setResponseImages,image,uploadImage , file,setFile,data,setData,
      intial,setInitial,original,setOriginal,recommended,setRecommended,showNext,setShowNext,current,setCurrent,details,setDetails
    }}>
      {children}
    </ImageContext.Provider>
  );
};
