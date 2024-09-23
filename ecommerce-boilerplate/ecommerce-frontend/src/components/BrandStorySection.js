import React from 'react';
import { Link } from 'react-router-dom';

const BrandStorySection = () => {
  return (
    <section className="py-16 px-4 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">일상에 행복을 더합니다</h2>
        <p className="text-xl text-center text-gray-600 mb-8">Add happiness</p>
        <p className="text-center max-w-2xl mx-auto mb-8">
          아뜰리에 페이는 향기로 행복을 전하고 싶은 조향사들이 모인 퍼퓸하우스 입니다. 
          저희는 자연과 상상, 기억과 추억에서 영감을 받아 향수를 만들고 있습니다.
        </p>
        <div className="text-center">
          <Link to="/about" className="bg-black text-white px-8 py-3 rounded-full">
            ABOUT US
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;