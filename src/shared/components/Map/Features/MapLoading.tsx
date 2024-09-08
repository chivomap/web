'use client';

export const MapLoading = () => {
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <span className='text-center text-gray-300 text-2xl font-bold'>Cargando...</span>
      </div>
      <img
        className='top-0 left-0 w-screen h-screen filter brightness-[0.25] blur-md z-50 object-cover'
        src='/chivomap.png'
        alt='map'
        height={200} width={500}
      />
    </>
  );
};

