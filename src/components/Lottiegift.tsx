    import Lottie from 'lottie-react';
    import animationData from '../assets/lottie/Referralgift.json'; // Adjust path as needed

    function Giftanimation() {
      const handleOpenABA = () => {
        const abalink = `https://pay.ababank.com/oRF8/lbu90xpy`;
        window.open(abalink, "_blank");
    };
      return (
        <div style={{ width: 150, height: 150 }}>
          <Lottie 
            onClick={handleOpenABA}
            animationData={animationData}
            loop={true}
            autoplay={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        </div>
      );
    }

    export default Giftanimation;