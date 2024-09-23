import React from 'react';
import HeroSection from '../components/HeroSection';
import EventSection from '../components/EventSection';
import BrandStorySection from '../components/BrandStorySection';
import BestSellersSection from '../components/BestSellersSection';
import MDPickSection from '../components/MDPickSection';
import ImageSection from '../components/ImageSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <EventSection />
      <BrandStorySection />
      <BestSellersSection />
      <MDPickSection />
      <ImageSection />
      <Footer />
    </div>
  );
};

export default Home;