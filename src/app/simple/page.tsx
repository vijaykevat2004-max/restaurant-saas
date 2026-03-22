'use client'
export default function SimplePage() {
  return (
    <div style={{padding: 50, textAlign: 'center'}}>
      <h1>Test Button</h1>
      <button 
        onClick={() => alert('WORKS!')}
        style={{padding: 20, fontSize: 18, cursor: 'pointer'}}
      >
        Click Me!
      </button>
    </div>
  )
}
