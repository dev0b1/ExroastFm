export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff'}}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '32px', marginBottom: '8px'}}>Page not found</h1>
        <p style={{color: '#bbb'}}>Sorry — we couldn't find that page.</p>
      </div>
    </div>
  );
}
