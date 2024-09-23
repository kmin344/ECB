import React from 'react';

const ImageSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <img src="https://cdn.imweb.me/thumbnail/20240604/ece02df731fd5.jpg" alt="Brand Image 1" className="w-full h-96 object-cover" />
          <img src="https://cdn.imweb.me/thumbnail/20240604/76fffad96be11.jpg" alt="Brand Image 2" className="w-full h-96 object-cover" />
        </div>
      </div>
    </section>
  );
};

export default ImageSection;