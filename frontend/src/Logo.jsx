export default function Logo({ size = 90 }) {
  const id = 'logo-' + size;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="97" fill="white" stroke="#BE1E2D" strokeWidth="2"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="#BE1E2D" strokeWidth="1" strokeDasharray="2,5"/>
      <defs>
        <path id={id+'t'} d="M 25,100 A 75,75 0 0,1 175,100" fill="none"/>
        <path id={id+'b'} d="M 170,115 A 70,70 0 0,1 30,115" fill="none"/>
      </defs>
      <text fontFamily="Poppins,sans-serif" fontSize="13" fontWeight="700" fill="#BE1E2D" letterSpacing="4">
        <textPath href={'#'+id+'t'} startOffset="50%" textAnchor="middle">SPECIALIST IN SPICES</textPath>
      </text>
      <text fontFamily="Poppins,sans-serif" fontSize="13" fontWeight="700" fill="#BE1E2D" letterSpacing="4">
        <textPath href={'#'+id+'b'} startOffset="50%" textAnchor="middle">SINCE 1930</textPath>
      </text>
      <text x="26" y="107" fontSize="9" fill="#BE1E2D">★</text>
      <text x="168" y="107" fontSize="9" fill="#BE1E2D">★</text>
      <circle cx="100" cy="92" r="38" fill="#BE1E2D"/>
      <circle cx="100" cy="92" r="36" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2,3"/>
      <text x="100" y="100" fontFamily="Poppins,sans-serif" fontSize="30" fontWeight="900" fill="white" textAnchor="middle">SPK</text>
      <g transform="translate(100,116)" fill="#BE1E2D" opacity="0.85">
        <ellipse cx="-6" cy="-2" rx="3" ry="6" transform="rotate(-30 -6 -2)"/>
        <ellipse cx="0" cy="-4" rx="2.5" ry="5"/>
        <ellipse cx="6" cy="-2" rx="3" ry="6" transform="rotate(30 6 -2)"/>
      </g>
    </svg>
  );
}
