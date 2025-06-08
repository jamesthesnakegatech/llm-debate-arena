export default function StyleTest() {
  return (
    <div className="min-h-screen riso-gradient-bg p-8">
      <h1 className="text-4xl font-black mb-8">Risograph Style Test</h1>
      
      <div className="space-y-8">
        {/* Test Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="riso-card riso-card-pink p-4">
            <h2 className="font-black">Pink Card</h2>
            <p>Should have pink shadow</p>
          </div>
          <div className="riso-card riso-card-blue p-4">
            <h2 className="font-black">Blue Card</h2>
            <p>Should have blue shadow</p>
          </div>
          <div className="riso-card riso-card-yellow p-4">
            <h2 className="font-black">Yellow Card</h2>
            <p>Should have yellow background</p>
          </div>
        </div>
        
        {/* Test Buttons */}
        <div className="space-x-4">
          <button className="riso-button">Riso Button</button>
          <span className="riso-badge">Riso Badge</span>
        </div>
        
        {/* Color swatches */}
        <div className="grid grid-cols-7 gap-2">
          <div className="h-20 border-2 border-black" style={{backgroundColor: 'var(--riso-blue)'}}>Blue</div>
          <div className="h-20 border-2 border-black" style={{backgroundColor: 'var(--riso-pink)'}}>Pink</div>
          <div className="h-20 border-2 border-black" style={{backgroundColor: 'var(--riso-yellow)'}}>Yellow</div>
          <div className="h-20 border-2 border-black" style={{backgroundColor: 'var(--riso-green)'}}>Green</div>
          <div className="h-20 border-2 border-black" style={{backgroundColor: 'var(--riso-orange)'}}>Orange</div>
          <div className="h-20 border-2 border-black" style={{backgroundColor: 'var(--riso-purple)'}}>Purple</div>
          <div className="h-20 border-2 border-black" style={{backgroundColor: 'var(--riso-paper)'}}>Paper</div>
        </div>
      </div>
    </div>
  )
}
