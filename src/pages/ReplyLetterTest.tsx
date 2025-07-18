import React from "react";

const ReplyLetterTest = () => {
  console.log('ReplyLetterTest component rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      padding: '20px',
      paddingTop: '80px'
    }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>Reply Letter Test Page</h1>
      <p>This is a test page to verify routing works</p>
    </div>
  );
};

export default ReplyLetterTest;
