import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number | string;
  leafColor?: string;
  flowerColor?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  className = "w-6 h-6",
  size,
  leafColor = "currentColor",
  flowerColor = "#E08F6F",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 320"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-label="Tons & Flores Logo"
    >
      <g transform="translate(160, 160) scale(0.72)">
        {/* Haste & Conexão Orgânica */}
        <path
          d="M-5,115 C-12,100 -18,70 -6,35 C2,10 0,-15 -25,-40"
          stroke={leafColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M-6,35 C15,20 40,5 65,-15"
          stroke={flowerColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M-2,60 C18,52 38,62 48,72 C35,85 12,85 -2,60 Z"
          stroke={leafColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M-5,115 C-2,140 -20,150 -30,135 C-42,118 -20,80 -6,35"
          stroke={leafColor}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Folha de Monstera (Costela-de-Adão) */}
        <g stroke={leafColor} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M-25,-40 C-45,-75 -70,-115 -110,-130" strokeWidth="6.5" />
          <path d="
            M-25,-40 
            C-35,-25 -55,-22 -72,-35
            C-65,-48 -58,-58 -48,-62
            C-68,-60 -92,-55 -108,-75
            C-98,-88 -85,-95 -72,-96
            C-92,-102 -115,-105 -125,-130
            C-112,-140 -98,-140 -82,-136
            C-100,-152 -112,-168 -110,-190
            C-92,-188 -75,-175 -60,-162
            C-55,-182 -40,-198 -15,-205
            C-2,-192 2,-175 0,-155
            C15,-170 35,-178 55,-172
            C52,-152 40,-138 25,-130
            C42,-130 62,-120 70,-100
            C52,-92 38,-95 20,-102
            C30,-88 35,-70 28,-52
            C15,-58 2,-70 -8,-82
            C-5,-62 -12,-48 -25,-40 Z
          " />
          <ellipse cx="-55" cy="-115" rx="6" ry="15" transform="rotate(-35 -55 -115)" strokeWidth="4.5" />
          <ellipse cx="-20" cy="-125" rx="5" ry="13" transform="rotate(15 -20 -125)" strokeWidth="4.5" />
        </g>

        {/* Flor Botânica Desabrochando */}
        <g stroke={flowerColor} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="95" cy="-55" r="10" fill={flowerColor} fillOpacity="0.2" strokeWidth="4" />
          <path d="M95,-55 C98,-70 106,-82 112,-90" strokeWidth="3.5" />
          <circle cx="113" cy="-91" r="3.5" fill={flowerColor} />
          
          <path d="M90,-64 C80,-105 92,-145 110,-165 C130,-140 135,-100 102,-60" />
          <path d="M86,-55 C60,-80 40,-105 45,-130 C72,-132 90,-105 96,-64" />
          <path d="M104,-55 C135,-75 165,-90 178,-72 C168,-48 140,-45 104,-48" />
          <path d="M102,-46 C135,-35 160,-15 152,10 C128,15 105,-15 94,-46" />
          <path d="M86,-50 C62,-35 48,-10 58,15 C78,12 88,-20 90,-46" />
        </g>
      </g>
    </svg>
  );
};
